from typing import Iterable, Literal, Tuple
from pydantic import BaseModel

from src.utils.Player import Player
from src.database.models import GameAssociation


type EventType = Literal[
    "ERROR",
    "PING",
    "PONG",
    #
    "I_AM_SUFLER",
    "SUFLER_LEAVING",
    "SUFLER_CONNECTED",
    "SUFLER_DISCONNECTED",
    #
    "PLAYERS_DUEL",
    "PLAYERS_DUEL_END",
    #
    "NEXT_QUESTION",
    "QUESTION_SKIPPED",
    #
    "PLAYER_RESPONSE_OK",
    "PLAYER_RESPONSE_PASS",
    "PLAYER_TIME_OUT",
    #
    "CLOCK_SET",
    "CLOCK_START",
    "CLOCK_TIK_TOK",
    #
    "GAME_FINISHED",
]


class GameEvent[T](BaseModel):
    class Config:
        arbitrary_types_allowed = True

    type: EventType
    payload: T = None  # type: ignore


class QuestionPayload(BaseModel):
    category_name: str
    player_id: str
    image_path: str
    answer: str


class GameFinishedPayload(BaseModel):
    winner: GameAssociation


class PlayerTimeOutPayload(BaseModel):
    player_id: str


class PlayersDuelEndPayload(BaseModel):
    winner_id: str
    looser_id: str


class PlayersDuelPayload(BaseModel):
    category: str
    player_a: str
    player_b: str


class PlayersDuelEvent(GameEvent):
    type: EventType = "PLAYERS_DUEL"
    payload: PlayersDuelPayload  # type: ignore


class ClockSetPayload(BaseModel):
    class PlayerData(BaseModel):
        id: str
        time_left: int

    players: Tuple[PlayerData, ...]

    @classmethod
    def from_players(cls, players: Iterable[Player]):
        return cls(
            players=tuple(
                cls.PlayerData(id=pl.data.id, time_left=pl.duel_time_left)
                for pl in players
            )
        )


class ErrorPayload(BaseModel):
    message: str


class ErrorEvent(GameEvent):
    type: EventType = "ERROR"
    payload: ErrorPayload  # type: ignore
