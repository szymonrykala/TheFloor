import json
from functools import singledispatch
from typing import List, TypedDict


class XYPoint(TypedDict):
    x: int
    y: int


@singledispatch
def convert_xy_points(data) -> List[XYPoint] | str: ...


@convert_xy_points.register(str)
def _(data: str) -> List[XYPoint]:
    return list(XYPoint(**x) for x in json.loads(data))


@convert_xy_points.register(tuple)
def _(data: tuple) -> str:
    return json.dumps(data)


@convert_xy_points.register(list)
def _(data: list) -> str:
    return json.dumps(data)
