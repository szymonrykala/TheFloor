from asyncio import sleep
import asyncio
from copy import copy
from typing import Generator, Optional
from fastapi import WebSocket
from src.utils.Player import Player, PlayersGen
from src.database.operations import (
    category_questions_generator,
    read_game_associations,
    update_model,
)

from src.events.main import (
    ClockSetPayload,
    GameFinishedPayload,
    PlayerTimeOutPayload,
    PlayersDuelEndPayload,
    QuestionPayload,
    GameEvent,
    PlayersDuelPayload,
)
from src.controllers.ws import WSManager
from src.database.models import Game as GameModel, GameAssociation, Question
from src.logger import logger


class Game:
    def __init__(self, data: GameModel, wsm: WSManager):
        self.data = data
        self.ws_manager = wsm

        self._challenging_player: Optional[Player] = None
        self.current_answering_player: Optional[Player] = None
        self.next_player_generator: Optional[PlayersGen] = None

        self.duel_started: bool = False
        self.duel_questions: Generator[Question] | None = None

        self.pass_response_active: bool = False

    def refresh(self, data: GameModel):
        old_sufler_status = copy(self.data.sufler_present)
        self.data = data
        self.data.sufler_present = old_sufler_status

    async def ping_pong(self, ws: WebSocket):
        logger.debug(f"PING-PONG event with {ws}")
        await self.ws_manager.send_direct_event(ws, GameEvent(type="PONG"))

    async def register_sufler(self, ws: WebSocket):
        if self.data.sufler_present:
            logger.warning(f"Dropping second sufler for a game {self.data.id}")
            await self.ws_manager.error(ws, "Sufler already connected")
            # raise SufflerAlreadyConnectedException

        self.data.sufler_present = True
        # update_model(self.data)
        logger.info(f"Sufler registered for a game {self.data.id}")

        await self.ws_manager.send_event(GameEvent(type="SUFLER_CONNECTED"))

    async def remove_sufler(self):
        self.data.sufler_present = False
        # update_model(self.data)
        logger.info(f"Sufler removed for a game {self.data.id}")

        await self.ws_manager.send_event(GameEvent(type="SUFLER_DISCONNECTED"))

    async def emit_questions(
        self,
        event: GameEvent[PlayersDuelPayload],
    ):
        logger.info(f"Setting up Emit Questions handler for {self.data.id}")

        if self.duel_started:
            logger.error(
                f"Duel is in progress for game: {self.data.id}. Exiting handler"
            )
            return

        self.duel_started = True

        self._challenging_player = Player(event.payload.player_a)

        self.duel_questions = category_questions_generator(event.payload.category)

        self.next_player_generator = PlayersGen(
            self._challenging_player,  # main player
            Player(event.payload.player_b),
        )

        await self.ws_manager.send_event(
            GameEvent(
                type="CLOCK_SET",
                payload=ClockSetPayload.from_players(self.next_player_generator.items),
            )
        )

        await sleep(3)
        # TODO: implement CLOCK_COUNTDOWN x3 / sleep(1)

        self.current_answering_player = next(self.next_player_generator)

        await self.send_next_question_event()
        asyncio.create_task(self.run_clock_sync())

    async def send_next_question_event(self):
        if self.duel_started and self.current_answering_player and self.duel_questions:
            question = next(self.duel_questions)

            await self.ws_manager.send_event(
                GameEvent(
                    type="NEXT_QUESTION",
                    payload=QuestionPayload(
                        category_name=question.category_name,
                        player_id=self.current_answering_player.data.id,
                        image_path=question.image_path,
                        answer=question.answer,
                    ),
                )
            )

    async def player_response_ok(self):
        if self.next_player_generator and not self.pass_response_active:
            logger.debug(f"Switching a user for a game {self.data.id}")

            # switch players
            self.current_answering_player = next(self.next_player_generator)
            await self.send_next_question_event()

    async def player_response_pass(self):
        if not self.pass_response_active:
            self.pass_response_active = True

            await self.ws_manager.send_event(GameEvent(type="QUESTION_SKIPPED"))
            await sleep(3)

            self.pass_response_active = False
            await self.send_next_question_event()

    async def run_clock_sync(self):
        if not (self.current_answering_player and self.next_player_generator):
            logger.error("Incorrect game state to run a clock")
            return

        logger.info("Starting clock sync task")

        # running a clock
        while await self.current_answering_player.call_clock():
            await self.ws_manager.send_event(
                GameEvent(
                    type="CLOCK_TIK_TOK",
                    payload=ClockSetPayload.from_players(
                        self.next_player_generator.items
                    ),
                )
            )

        await self.ws_manager.send_event(
            GameEvent(
                type="PLAYER_TIME_OUT",
                payload=PlayerTimeOutPayload(
                    player_id=self.current_answering_player.data.id
                ),
            )
        )

        await self.perform_winner_updates()

    async def perform_winner_updates(self):
        if not (self.current_answering_player and self.next_player_generator):
            return

        if not self._challenging_player:
            logger.error("Challenging player has not been set")
            return

        looser = self.current_answering_player
        winner = next(self.next_player_generator)

        # update xy_points on the board
        winner.data.extend_points(looser.data.get_points())
        looser.data.erase_points()

        # assign category
        if self._challenging_player.data.id == looser.data.id:
            winner.data.category_name = looser.data.category_name

        update_model(winner.data)
        update_model(looser.data)

        await self.ws_manager.send_event(
            GameEvent(
                type="PLAYERS_DUEL_END",
                payload=PlayersDuelEndPayload(
                    winner_id=winner.data.id, looser_id=looser.data.id
                ),
            )
        )

        self.duel_started = False

        # check if game has finished
        if game_winner := self._determine_game_winner():
            self.data.finished = True
            self.data.winner_id = game_winner.id
            update_model(self.data)

            await self.ws_manager.send_event(
                GameEvent(
                    type="GAME_FINISHED",
                    payload=GameFinishedPayload(winner=game_winner),
                )
            )

    def _determine_game_winner(self) -> GameAssociation | None:
        players = list(
            filter(lambda pl: pl.get_points(), read_game_associations(self.data.id))
        )

        if len(players) == 1:
            return players[0]
