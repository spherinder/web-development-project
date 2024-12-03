from functools import wraps
from flask import g, request
from api import db
import sqlalchemy as sa

from api.models import User


def require_api_key(view_function, header_name="x-api-key"):
    @wraps(view_function)
    def decorated_function(*args, **kwargs):
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
