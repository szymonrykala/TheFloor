import random
from typing import List
from src.controllers.Player import Player


class Board:
    def __init__(self):
        self.players: List[Player] = []

    def get_player_by_id(self, id: str) -> Player | None:
        for pl in self.players:
            if pl.data.id == id:
                return pl

    def remove_player(self, player_id: int) -> None:
        player = self.get_player_by_id(player_id)
        self.players.remove(player)

    def choose_random_player(self) -> Player:
        """Returns random player with smallest amount of points"""
        min_points = min(len(player.points.value) for player in self.players)
        min_point_players = [
            player for player in self.players if len(player.points.value) == min_points
        ]
        return random.choice(min_point_players)

    def get_neighbors_of_player(self, player_id: str):
        player = self.get_player_by_id(player_id)
        if player not in self.players or not player.points.value:
            return []

        # Get all coordinates of the input player
        player_coords = [(p.x, p.y) for p in player.points.value]

        # Define adjacent coordinates for all player coordinates
        adjacent_coords = set()
        for x, y in player_coords:
            adjacent_coords.update([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

        # Find players with at least one coordinate in adjacent_coords
        adjacent_players = []
        for other_player in self.players:
            if other_player != player:
                for point in other_player.points.value:
                    if (point.x, point.y) in adjacent_coords:
                        adjacent_players.append(other_player)
                        break  # No need to check more points for this player

        return adjacent_players
