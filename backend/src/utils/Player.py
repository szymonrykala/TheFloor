from asyncio import sleep
from copy import copy
from math import ceil
from typing import Generator

from src.database.models import GameAssociation
from src.database.operations import read_player_association


class GameClock:
    __multiplier = 2

    def __init__(self, duration: int):
        self.clk: Generator[int] = self.get_clock(duration * self.__multiplier)

    @classmethod
    def get_clock(cls, duration: int) -> Generator[int]:
        time = duration
        while time >= 0:
            yield time
            time -= 1

    def decrement(self) -> int:
        return ceil(next(self.clk) / self.__multiplier)


class PlayersGen:
    def __init__(self, *args: "Player"):
        self.items = args
        self._player_generator = self._generator()

    def __next__(self) -> "Player":
        return next(self._player_generator)

    def _generator(self):
        i = 0
        while True:
            yield self.items[i % 2]
            i += 1


class Player:
    @classmethod
    def next_player_gen(cls, *args: "Player"):
        return PlayersGen(*args)

    def __init__(self, player_id: str) -> None:
        self.data: GameAssociation = read_player_association(player_id)

        self.__temp_time_left = copy(self.data.time_left)
        self.clk = GameClock(self.__temp_time_left)

    @property
    def duel_time_left(self) -> int:
        return self.__temp_time_left

    async def call_clock(self):
        try:
            self.__temp_time_left = self.clk.decrement()
            await sleep(0.5)
            return True
        except StopIteration:
            return False
