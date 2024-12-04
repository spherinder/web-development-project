from functools import wraps
from typing import Any, Callable, cast
from flask import g, request
from flask.typing import ResponseReturnValue
from extensions import db
import sqlalchemy as sa

from api.models import User

def g_user() -> User:
    return cast(User, g.user)

def require_api_key(view_function: Callable[..., ResponseReturnValue], header_name: str = "x-api-key") -> Callable[..., ResponseReturnValue]:
    @wraps(view_function)
    def decorated_function(*args: tuple[Any], **kwargs: dict[str, Any]) -> ResponseReturnValue:
        if not request.headers.get(header_name):
            return {
                "status": "err",
                "msg": f"Missing header {header_name}",
                "data": None,
            }, 400
        supplied_key = request.headers.get(header_name)
        user = db.session.scalar(sa.select(User).where(User.api_key == supplied_key))
        if user is None:
            return {
                "status": "err",
                "msg": f"Invalid API key supplied",
                "data": None,
            }, 403
        else:
            g.user = user
            return view_function(*args, **kwargs)

    return decorated_function
