from functools import cache
from json import JSONDecodeError
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.exceptions import AppWSException
from src.controllers.game import Game
from src.utils.EventDispatcher import EventsDispatcher
from src.utils.context import game_context
from src.events.main import GameEvent, PlayersDuelEvent
from src.controllers.ws import WSManager
from src.logger import logger

ws = APIRouter(tags=["websocket", "game"])


ws_manager = WSManager()


@ws.websocket("/games/{game_id}")
async def game_notification_channel(websocket: WebSocket, game_id: str):
    """
    pl1_id: id of player that has been chosen by the board or won previous game
    pl2_id: id of player that pl1 challenged
    """
    events = EventsDispatcher(ws_manager)

    with game_context(game_id, ws_manager) as game:
        register_event_handlers(events, game)
        await ws_manager.connect(websocket)

        try:
            while True and websocket.state:
                await events.dispatch(websocket)

        except AppWSException as exc:
            await ws_manager.disconnect(websocket)
            await websocket.close()

        except WebSocketDisconnect:
            await ws_manager.disconnect(websocket)

        except JSONDecodeError as e:
            logger.error("Invalid WS event format received. JSON expected.")


@cache
def register_event_handlers(evd: EventsDispatcher, game: Game):
    evd.on("PING", game.ping_pong)
    
    evd.on("I_AM_SUFLER", game.register_sufler)
    evd.on("SUFLER_LEAVING", game.remove_sufler)

    evd.on("PLAYERS_DUEL", game.emit_questions, model=PlayersDuelEvent)
    evd.on("PLAYER_RESPONSE_OK", game.player_response_ok)
    evd.on("PLAYER_RESPONSE_PASS", game.player_response_pass)