from flask import Blueprint, g

from api import db
from api.api_key import require_api_key
from api.models import User, UserBalance

import sqlalchemy as sa

user_blueprint = Blueprint("user_blueprint", __name__, url_prefix="/user")


@user_blueprint.get("/")
@require_api_key
def get_user_details():
    user: User = g.user
    return {"status": "ok", "msg": "", "data": user.as_dict_self()}


@user_blueprint.get("/balances")
@require_api_key
def get_user_balances():
    user: User = g.users

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
        "data": list(map(results, lambda x: x.as_dict)),
    }
