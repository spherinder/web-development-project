from typing import Any, Literal, cast
from flask import Blueprint, request
from flask_pydantic import validate # pyright: ignore[reportMissingTypeStubs, reportUnknownVariableType]
from pydantic import BaseModel
from sqlalchemy import and_, exists
from extensions import db
from api.models import (
    MarketLiquidity,
    PredictionMarket,
    User,
    UserBalance,
)
from api.api_key import g_user, require_api_key
import math

market_blueprint: Blueprint = Blueprint("market", __name__, url_prefix="/market")


@market_blueprint.post("/create")
@require_api_key
def create_market():
    user = g_user()
    if not user.is_superuser:
        return {
            "status": "err",
            "msg": "Only super users can create markets",
            "data": None,
        }, 403
    body: dict[str,Any] = request.get_json()
    market_name: str = body["name"]
    market_description: str = body["description"]
    market = PredictionMarket(name=market_name, description=market_description)
    db.session.add(market)
    db.session.commit()

    return {"status": "ok", "msg": "Created that market", "data": market}

def change_balance(is_yes: bool, market_id: int, balance: UserBalance, tok1_diff: float = 0, tok2_diff: float = 0, dog_amount: float = 0):
    return UserBalance(
        user_id=balance.user_id,
        market_id=market_id,
        dog_balance=dog_amount,
        yes_balance=balance.yes_balance + tok1_diff if is_yes else balance.yes_balance + tok2_diff,
        no_balance=balance.no_balance + tok2_diff if is_yes else balance.no_balance + tok1_diff
    )

def change_liquidity(is_yes: bool, liq: MarketLiquidity, tok1_diff: float = 0, tok2_diff: float = 0):
    return MarketLiquidity(
        market_id=liq.market_id,
        yes_liquidity=liq.yes_liquidity + tok1_diff if is_yes else liq.yes_liquidity + tok2_diff,
        no_liquidity=liq.no_liquidity + tok2_diff if is_yes else liq.no_liquidity + tok1_diff,
    )

def purchase(is_yes: bool, dollar_amount: float, market: PredictionMarket, user: User):
    """
    Turn dollar_amount in Ð into dollar_amount in ¥ and dollar_amount in ₦

    k ≔ market.yes_liquidity * market.no_liquidity

    Suppose is_yes is true

    (market.no_liquidity + dollar_amount) * (market.yes_liquidity - delta) = k
    """
    # TODO: check that the user has enough money
    # TODO: assert market balance doesn't go negative (it shouldn't)
    liquidity: MarketLiquidity = (
        MarketLiquidity.query.filter(MarketLiquidity.market_id == market.id)
        .order_by(MarketLiquidity.timestamp.desc())
        .first_or_404()
    )

    product = liquidity.no_liquidity * liquidity.yes_liquidity
    buy_liquidity, sell_liquidity = (
        (liquidity.yes_liquidity, liquidity.no_liquidity)
        if is_yes
        else (liquidity.no_liquidity, liquidity.yes_liquidity)
    )
    delta = buy_liquidity - product / (sell_liquidity + dollar_amount)

    # when we create the market we create an initial balance
    new_liquidity = change_liquidity(is_yes, liquidity, -delta, dollar_amount)

    db.session.add(new_liquidity)

    latest_balance = cast(UserBalance | None,
        UserBalance.query.filter(UserBalance.user_id == user.id)
        .order_by(UserBalance.timestamp.desc())
        .first()
    )
    dog_balance: float = latest_balance.dog_balance if latest_balance is not None else 0

    existing_tok_balance = cast(
        UserBalance | None,
        UserBalance.query.filter(
            and_(UserBalance.user_id == user.id, MarketLiquidity.market_id == market.id)
        )
        .order_by(UserBalance.timestamp.desc())
        .first()
    )

    if existing_tok_balance is None:
        print(f"found no existing balance for {user.id} {market.id}")

    tok_balance = existing_tok_balance or UserBalance(market_id=market.id, user_id=user.id, yes_balance=0, no_balance=0, dog_balance=dog_balance)
    new_balance = change_balance(is_yes, market.id, tok_balance, dollar_amount + delta, 0, dog_balance-dollar_amount)

    db.session.add(new_balance)

    db.session.commit()


def sell(is_yes: bool, token_amount: float, market: PredictionMarket, user: User):
    """
    Suppose is_yes is true. Part of token_amount in ¥ must be converted into ₦, such that

    token_amount - convert_amount =ꜝ delta

    (market.yes_liquidity + convert_amount) * (market.no_liquidity - delta) = k

    where σ ≔ market.yes_liquidity + market.no_liquidity:

    ⇒ -(market.yes_liquidity * token_amount)
      + convert_amount * (σ - token_amount)
      + (market.yes_liquidity)²
     =ꜝ 0

    ⇒ convert_amount = (token_amount - σ)/2
      + sqrt[(token_amount - σ)²/4 + market.yes_liquidity * token_amount]
    """
    # TODO: check that the user has more than token_amount of token
    # TODO: assert market balance doesn't go negative (it shouldn't)

    liquidity: MarketLiquidity = (
        MarketLiquidity.query.filter(MarketLiquidity.market_id == market.id)
        .order_by(MarketLiquidity.timestamp.desc())
        .first_or_404()
    )

    sell_liquidity = liquidity.yes_liquidity if is_yes else liquidity.no_liquidity

    sigma = liquidity.no_liquidity + liquidity.yes_liquidity
    convert_amount = (token_amount - sigma) / 2 + math.sqrt(
        (token_amount - sigma) ** 2 / 4 + sell_liquidity * token_amount
    )
    delta = token_amount - convert_amount

    dog_balance: float = cast(
        UserBalance,
        UserBalance.query.filter(UserBalance.user_id == user.id)
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    ).dog_balance

    tok_balance: UserBalance = (
        UserBalance.query.filter(
            and_(UserBalance.user_id == user.id, MarketLiquidity.market_id == market.id)
        )
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    )

    # when we create the market we create an initial balance
    new_liquidity = change_liquidity(is_yes, liquidity, -delta, convert_amount)
    db.session.add(new_liquidity)

    new_balance = change_balance(is_yes, market.id, tok_balance, -token_amount, dog_amount=dog_balance + delta)
    db.session.add(new_balance)

    db.session.commit()


@market_blueprint.get("/<market_id>")
def get_latest_market_info(market_id: int) -> dict[str,Any]:
    market: PredictionMarket = PredictionMarket.query.filter(
        PredictionMarket.id == market_id
    ).first_or_404()

    liquidity: MarketLiquidity = (
        MarketLiquidity.query.filter(
        MarketLiquidity.market_id == market_id)
        .order_by(MarketLiquidity.timestamp.desc())
        .first_or_404()
    )

    return {
        "status": "ok",
        "data": {
            "id": market.id,
            "name": market.name,
            "description": market.description,
            "created_at": market.created_at.isoformat(),
            "yes_liquidity": liquidity.yes_liquidity,
            "no_liquidity": liquidity.no_liquidity,
            "modified": liquidity.timestamp.isoformat()
        }
    }

@market_blueprint.get("/<market_id>/history")
def get_liquidity_history(market_id: int) -> dict[str,Any]:
    # check market exists
    db.session.query(exists().where(PredictionMarket.id == market_id)).scalar()

    liquidities: list[MarketLiquidity] = (
        MarketLiquidity.query.filter(MarketLiquidity.market_id == market_id)
        .order_by(MarketLiquidity.timestamp.asc())
        .all()
    )

    return {
        "status": "ok",
        "data": liquidities
    }

class TxReq(BaseModel):
    amount: int
    kind: Literal["buy[yes]", "buy[no]", "sell[yes]", "sell[no]"]

@market_blueprint.post("/<market_id>/tx")
@require_api_key
@validate()
def do_transaction(market_id: int, body: TxReq):
    market: PredictionMarket = PredictionMarket.query.filter(
        PredictionMarket.id == market_id,
        PredictionMarket.resolved == False
    ).first_or_404()
    user = g_user()

    is_yes = body.kind == "buy[yes]" or body.kind == "sell[yes]"
    is_buy = body.kind == "buy[no]" or body.kind == "buy[yes]"

    if is_buy:
        purchase(is_yes, body.amount, market, user)
    else:
        sell(is_yes, body.amount, market, user)

    return {"status": "ok", "msg": "Purchased" if is_buy else "Sold", "data": None}

@market_blueprint.post("/<market_id>/resolve")
@require_api_key
def resolve(market_id: int):
    user = g_user()
    if not user.is_superuser:
        return {
            "status": "err",
            "msg": "Only super users can resolve markets",
            "data": None,
        }, 403

    market: PredictionMarket = PredictionMarket.query.filter(
        PredictionMarket.id == market_id
    ).first_or_404()

    market.resolved = True
    db.session.commit()
    return {"status": "ok", "msg": "Resolved market"}
