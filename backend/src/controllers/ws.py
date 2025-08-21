from typing import Set
from fastapi import WebSocket

from src.events.main import ErrorEvent, ErrorPayload
from src.events.main import GameEvent
from src.logger import logger


class WSManager:
    def __init__(self):
        self.active_clients: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_clients.add(websocket)
        logger.info(f"Client {websocket.client} connection accepted")

    async def send_event(self, event: GameEvent):
        """Emit a game event to each connected client"""
        for client in self.active_clients:
            await self.send_direct_event(client, event)

    async def send_direct_event(self, websocket: WebSocket, event: GameEvent):
        """Send a game event to specific client"""
        logger.debug(f"Sending event to {websocket.client}, event={event}")
        await websocket.send_json(event.model_dump())

    async def receive_event(self, websocket: WebSocket, model=GameEvent):
        logger.info(f"Waiting for an event")
        data = await websocket.receive_json()
        return model(**data)

    async def error(self, websocket: WebSocket, message: str, direct: bool = True):
        await self.send_direct_event(
            websocket, ErrorEvent(payload=ErrorPayload(message=message))
        )

    async def disconnect(self, websocket: WebSocket):
        """disconnect event"""
        self.active_clients.remove(websocket)
        logger.info(f"Client {websocket.client} disconnection")
