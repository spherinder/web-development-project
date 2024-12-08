from flask import Blueprint

from extensions import db
from api.api_key import g_user, require_api_key
from api.models import User, UserBalance

import sqlalchemy as sa

user_blueprint = Blueprint("user_blueprint", __name__, url_prefix="/user")


@user_blueprint.get("/")
@require_api_key
def get_user_details():
    user: User = g_user()
    return {"status": "ok", "msg": "", "data": user.as_dict_self()}


@user_blueprint.get("/balances")
@require_api_key
def get_user_balances():
    subquery = (
        db.session.query(
            UserBalance.market_id, sa.func.max(UserBalance.timestamp).label("latest")
        )
        .group_by(UserBalance.market_id)
        .subquery()
    )

    query = (
        db.session.query(UserBalance)
        .join(
            subquery,
            (UserBalance.market_id == subquery.c.market_id)
            & (UserBalance.timestamp == subquery.c.latest),
        )
        .order_by(UserBalance.market_id.desc())
    )

    results = query.all()
    return {
        "status": "ok",
        "msg": "Data in the data field",
        "data": [x.as_dict() for x in results],
    }
