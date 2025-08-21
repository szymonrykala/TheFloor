from asyncio import iscoroutinefunction
from inspect import getfullargspec

from typing import Callable, Dict, Tuple

from fastapi import WebSocket

from src.controllers.ws import WSManager
from src.events.main import EventType, GameEvent
from src.logger import logger


class EventsDispatcher:
    def __init__(self, wsm: WSManager):
        self.ws_manager = wsm
        self._handlers_registry: Dict[str, Tuple[Callable, type[GameEvent]]] = {}

    def _default_handler(self, event: GameEvent):
        logger.warning(f"Unhandled WS event: {event.type}", event)

    def on(
        self,
        event_type: EventType,
        handler: Callable,
        model: type[GameEvent] = GameEvent,
    ):
        logger.info(f"Registering handler for {event_type}, {handler.__name__, model.__name__}")
        if event_type in self._handlers_registry:
            raise RuntimeError(
                f"Event handler for '{event_type}' is already registered"
            )

        self._handlers_registry[event_type] = handler, model

    async def dispatch(self, ws: WebSocket):
        defaults = (self._default_handler, GameEvent)

        event = await self.ws_manager.receive_event(ws)

        handler, expected_event_model = self._handlers_registry.get(
            event.type, defaults
        )

        kwds = dict(
            event=expected_event_model(**event.model_dump()), ws=ws, ev_handler=self
        )

        handler_args = getfullargspec(handler).args
        handler_args.remove("self")

        call_kwds = {arg: kwds[arg] for arg in handler_args}

        logger.info(f"Triggering a handler for {event.type}")
        if iscoroutinefunction(handler):
            await handler(**call_kwds)
        else:
            handler(**call_kwds)
