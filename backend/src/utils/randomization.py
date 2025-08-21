import random
from typing import Iterable

from src.database.models import GameAssociation


def randomize_player(players: Iterable[GameAssociation]) -> GameAssociation:
    """Returns random player with smallest amount of points"""
    min_points = min(len(player.xy_points) for player in players)
    min_point_players = [
        player for player in players if len(player.xy_points) == min_points
    ]
    return random.choice(min_point_players)


def start_game(game_id: str):
    players = []

    players_with_point = filter(lambda player: len(player.xy_points) < 2, players)

    # random.choice()
