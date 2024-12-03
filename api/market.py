from flask import Blueprint, g, request
from api import db
from api.models import (
    MarketLiquidity,
    PredictionMarket,
    User,
    UserBalance,
)
from api.api_key import require_api_key

market_blueprint = Blueprint("market", __name__, url_prefix="/market")


def purchase(is_yes: bool, dollar_amount, market: PredictionMarket, user: User):
    # TODO: check that the user has enough money
    prev_liquidity = (
        MarketLiquidity.query.filter(MarketLiquidity.market_id == market.id)
        .order_by(MarketLiquidity.timestamp.desc())
        .first_or_404()
    )

    product = prev_liquidity.no_balance * prev_liquidity.yes_balance
    if is_yes:
        delta = prev_liquidity.yes_balance - product / (
            prev_liquidity.no_balance + dollar_amount
        )

    else:
        delta = prev_liquidity.no_balance - product / (
            prev_liquidity.yes_balance + dollar_amount
        )

    if is_yes:
        # when we create the market we create an initial balance
        liquidity = MarketLiquidity(
            market_id=market.id,
            yes_balance=prev_liquidity.yes_balance - delta,
            no_balance=prev_liquidity.no_balance + dollar_amount,
        )
    else:
        # when we create the market we create an initial balance
        liquidity = MarketLiquidity(
            market_id=market.id,
            yes_balance=prev_liquidity.yes_balance + dollar_amount,
            no_balance=prev_liquidity.no_balance - delta,
        )

    db.session.add(liquidity)

    user_dog_balance = (
        UserBalance.query.filter(UserBalance.user_id == user.id)
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    ).dog_balance

    prev_user_balance: UserBalance = (
        UserBalance.query.filter(
            UserBalance.user_id == user.id and MarketLiquidity.market_id == market.id
        )
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    )

    if is_yes:
        new_balance = UserBalance(
            user_id=user.id,
            market_id=market.id,
            dollar_amount=user_dog_balance - dollar_amount,
            yes_balance=prev_user_balance.yes_balance + dollar_amount + delta,
            no_balance=prev_user_balance.no_balance,
        )
    else:
        new_balance = UserBalance(
            user_id=user.id,
            market_id=market.id,
            dollar_amount=user_dog_balance - dollar_amount,
            yes_balance=prev_user_balance.yes_balance,
            no_balance=prev_user_balance.no_balance + dollar_amount + delta,
        )

    db.session.add(new_balance)

    db.session.commit()


@market_blueprint.post("/<market_id>/tx")
@require_api_key
def do_transaction(market_id):
    market = PredictionMarket.query.filter(
        PredictionMarket.id == market_id
    ).first_or_404()
    user: User = g.user

    json = request.get_json()
    dollars = json["dollars"]
    kind = json["kind"]

    if kind == "buy[yes]":
        is_yes = True
    else:
        assert kind == "buy[no]"
        is_yes = False

    purchase(is_yes, dollars, market, user)

    return {"status": "ok", "msg": "Purchased", "data": None}
