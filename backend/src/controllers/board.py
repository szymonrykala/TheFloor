import math
from random import shuffle
from typing import List

from src.database.models import GameAssociation
from src.database.operations import update_model

type GameBoard = List[List[str | None]]


def _define_cols_and_rows(length: int):
    columns = math.ceil(math.sqrt(length))
    rows = math.ceil(length / columns)

    return columns, rows


def initiate_board(players: List[GameAssociation]) -> GameBoard:
    shuffle(players)

    columns, rows = _define_cols_and_rows(len(players))

    board: GameBoard = []

    for col in range(columns):
        board.append([])
        for row in range(rows):
            pl = None
            try:
                pl = players.pop()
                pl.set_points(col, row)

            except IndexError:
                pass
            finally:
                board[col].append(pl.id if pl else None)

            if pl:
                update_model(pl)
    return board


def create_current_board(players: List[GameAssociation]) -> GameBoard:
    columns, rows = _define_cols_and_rows(len(players))

    board: GameBoard = [[None for _ in range(rows)] for _ in range(columns)]

    for pl in players:
        for point in pl.get_points():
            board[point["x"]][point["y"]] = pl.id

    return board
