from contextlib import contextmanager
from typing import Dict, Generator

from src.exceptions import HttpNotFoundException
from src.database.operations import read_game
from src.controllers.ws import WSManager
from src.controllers.game import Game


_games_instances: Dict[str, Game] = {}


@contextmanager
def game_context(game_id: str, ws: WSManager) -> Generator[Game]:
    game_data = read_game(game_id)

    if not game_data:
        raise HttpNotFoundException

    if game_id not in _games_instances:
        _games_instances[game_id] = Game(game_data, ws)

    game = _games_instances[game_id]
    game.refresh(game_data)
    yield game
