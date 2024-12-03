from flask import Blueprint, g

from api.api_key import require_api_key
from api.models import User

user_blueprint = Blueprint("user_blueprint", __name__, url_prefix="/user")


@user_blueprint.get("/")
@require_api_key
def get_user_details():
    user: User = g.user
    return {"status": "ok", "msg": "", "data": user.as_dict_self()}
