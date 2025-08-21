from collections import namedtuple
from typing import List
from src.database.models import GameAssociation
from src.utils.converters import convert_xy_points
from functools import total_ordering

XYPoint = namedtuple("XYPoint", "x", "y")


@total_ordering
class XYPoints:
    def __init__(self, points: list):
        self.value: List[XYPoint] = points

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, XYPoints):
            return NotImplemented
        return len(self.value) == len(other.value)

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, XYPoints):
            return NotImplemented
        return len(self.value) < len(other.value)


class Player:
    def __init__(self, association: GameAssociation):
        self.data = association
        self._points = XYPoints(convert_xy_points(association.xy_points))

    @property
    def points(self):
        return self._points
