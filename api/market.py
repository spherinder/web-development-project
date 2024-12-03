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


@market_blueprint.post("/create")
@require_api_key
def create_market():
    user: User = g.user
    if not user.is_superuser:
        return {
            "status": "err",
            "msg": "Only super users can create markets",
            "data": None,
        }
    body = request.get_json()
    market_name = body["name"]
    market_description = body["description"]
    market = PredictionMarket(name=market_name, description=market_description)
    db.session.add(market)
    db.session.commit()

    return {"status": "ok", "msg": "Created that market", "data": market}


def purchase(is_yes: bool, dollar_amount, market: PredictionMarket, user: User):
    # TODO: check that the user has enough money
    liquidity: MarketLiquidity = (
        MarketLiquidity.query.filter(MarketLiquidity.market_id == market.id)
        .order_by(MarketLiquidity.timestamp.desc())
        .first_or_404()
    )

    product = liquidity.no_balance * liquidity.yes_balance
    buy_liquidity, sell_liquidity = (liquidity.yes_balance, liquidity.no_balance) if is_yes else (liquidity.no_balance, liquidity.yes_balance)
    delta = buy_liquidity - product / (
        sell_liquidity + dollar_amount
    )
    buy_key, sell_key = ("yes_balance", "no_balance") if is_yes else ("no_balance", "yes_balance")

    # when we create the market we create an initial balance
    new_liquidity = MarketLiquidity(
        market_id=market.id,
        **{
            buy_key: buy_liquidity - delta,
            sell_key: sell_liquidity + dollar_amount
        })

    db.session.add(new_liquidity)

    dog_balance = (
        UserBalance.query.filter(UserBalance.user_id == user.id)
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    ).dog_balance

    tok_balance: UserBalance = (
        UserBalance.query.filter(
            UserBalance.user_id == user.id and MarketLiquidity.market_id == market.id
        )
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    )

    new_balance = UserBalance(
        user_id=user.id,
        market_id=market.id,
        dollar_amount=user_dog_balance - dollar_amount,
        **{
            buy_key: buy_balance + dollar_amount + delta,
            sell_key: sell_balance
        }
    )

    db.session.add(new_balance)

    db.session.commit()

# def sell(is_yes: bool, token_amount, market: PredictionMarket, user: User):
#     # TODO: check that the user has enough money
#     liquidity: MarketLiquidity = (
#         MarketLiquidity.query.filter(MarketLiquidity.market_id == market.id)
#         .order_by(MarketLiquidity.timestamp.desc())
#         .first_or_404()
#     )

#     dog_balance = (
#         UserBalance.query.filter(UserBalance.user_id == user.id)
#         .order_by(UserBalance.timestamp.desc())
#         .first_or_404()
#     ).dog_balance

#     tok_balance: UserBalance = (
#         UserBalance.query.filter(
#             UserBalance.user_id == user.id and MarketLiquidity.market_id == market.id
#         )
#         .order_by(UserBalance.timestamp.desc())
#         .first_or_404()
#     )

#     if tok_balance.yes_balance >= token_amount and tok_balance.no_balance >= token_amount:
#         new_balance = UserBalance(
#             user_id=user.id,
#             market_id=market.id,
#             dollar_amount=user_dog_balance + token_amount,
#             yes_balance = tok_balance.yes_balance - token_amount,
#             yes_balance = tok_balance.yes_balance - token_amount,
#         )
#         db.session.add(new_balance)
#         db.session.commit()
#         return

#     sell_key, buy_key = ("yes_balance", "no_balance") if is_yes else ("no_balance", "yes_balance")

#     product = liquidity.no_balance * liquidity.yes_balance
#     buy_liquidity, sell_liquidity = (liquidity.yes_balance, liquidity.no_balance) if is_yes else (liquidity.no_balance, liquidity.yes_balance)
#     delta = buy_liquidity - product / (
#         sell_liquidity + dollar_amount
#     )

#     # when we create the market we create an initial balance
#     new_liquidity = MarketLiquidity(
#         market_id=market.id,
#         **{
#             buy_key: buy_liquidity - delta,
#             sell_key: sell_liquidity + dollar_amount
#         })

#     db.session.add(new_liquidity)


#     new_balance = UserBalance(
#         user_id=user.id,
#         market_id=market.id,
#         dollar_amount=user_dog_balance - dollar_amount,
#         **{
#             buy_key: buy_balance + dollar_amount + delta,
#             sell_key: sell_balance
#         }
#     )

#     db.session.add(new_balance)

#     db.session.commit()


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
