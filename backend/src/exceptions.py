from abc import ABC
from typing import Optional
from fastapi import HTTPException


class HttpAppException(ABC, HTTPException):
    code: int = 500
    message: str = "Internal Error"

    def __init__(self, message: str | None = None):
        super().__init__(self.code, message or self.message)


class HttpNotFoundException(HttpAppException):
    code: int = 404
    message: str = "Item not Found"


class HttpForbiddenException(HttpAppException):
    code: int = 403
    message: str = "Action is forbidden"


class AppWSException(Exception):
    code: int = 1000
    message: str = "App Events exception"

    def __init__(self, code: Optional[int] = None, message: Optional[str] = None):
        if code:
            self.code = code

        if message:
            self.message


class SufflerAlreadyConnectedException(AppWSException):
    message: str = "Sufler already connected"
