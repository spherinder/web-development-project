import unittest

import sqlalchemy
import json
from api import create_app, db
from api.models import PredictionMarket, User, MarketLiquidity, UserBalance
from typing import cast
from config import TestConfig


class ServerTest(unittest.TestCase):
    def setUp(self):
        app = create_app(TestConfig)
        self.client = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
        db.session.commit()

        market = PredictionMarket(name="Default market", description="Default market")
        db.session.add(market)
        db.session.commit()

        liquidity = MarketLiquidity(
            market_id=market.id, yes_liquidity=420, no_liquidity=69
        )
        db.session.add(liquidity)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def _create_super_user(self) -> User:
        user = User(
            username="user",
            email="user@example.com",
            api_key="somerandomapistring",
            is_superuser=True,
        )
        user.set_password(
            "03598da1bde6d0b536ebb13df1a44b08a734498f6ade19ae0017c8cae0d896c7"
        )
        db.session.add(user)
        return user


class UserModelCase(ServerTest):
    def test_password_hashing(self):
        u = User(username="susan", email="susan@example.com")
        u.set_password("cat")
        self.assertFalse(u.check_password("dog"))
        self.assertTrue(u.check_password("cat"))

    def test_basic_auth_flow(self):
        self.assertEqual(
            self.client.post(
                "/auth/register",
                data=json.dumps(
                    {
                        "username": "user",
                        "email": "user@example.com",
                        "password": "03598da1bde6d0b536ebb13df1a44b08a734498f6ade19ae0017c8cae0d896c7",
                    }
                ),
                content_type="application/json",
            ).status_code,
            200,
        )
        user = User.query.filter(User.username == "user").first()
        response = self.client.post(
            "/auth/login",
            data=json.dumps(
                {
                    "username": "user",
                    "password": "03598da1bde6d0b536ebb13df1a44b08a734498f6ade19ae0017c8cae0d896c7",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        res_data = json.loads(response.data)
        self.assertEqual(res_data["data"]["api_key"], user.api_key)

        # now test to ensure requests sent to protected routes with missing API
        # keys are rejecte
        response = self.client.post(
            "/market/create",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            "/market/create",
            data=json.dumps(
                {
                    "name": "Will more than 30 people get a 6.0 in DM?",
                    "description": "Resolves on DATE",
                }
            ),
            headers={"x-api-key": "aninvalidapikey"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)


class TestMarket(ServerTest):

    def test_market(self):
        _ = self._create_super_user()
        response = self.client.post(
            "/market/create",
            data=json.dumps(
                {
                    "name": "Will more than 30 people get a 6.0 in DM?",
                    "description": "Resolves on DATE",
                }
            ),
            headers={"x-api-key": "somerandomapistring"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)["status"], "ok")
        market = PredictionMarket.query.filter(
            PredictionMarket.name == "Will more than 30 people get a 6.0 in DM?"
        ).first_or_404()
        self.assertEqual(market.description, "Resolves on DATE")

    def test_market_liquidity_invalid_market_id(self):
        with self.assertRaises(sqlalchemy.exc.IntegrityError):
            n = 100
            market_id = 99
            market_liquidity = MarketLiquidity(
                market_id=market_id, yes_liquidity=n, no_liquidity=n
            )
            db.session.add(market_liquidity)
            db.session.commit()

    def test_market_liquidity_valid_market_id(self):
        market: PredictionMarket = PredictionMarket(
            name="Dummy market name", description="Dummy maket description"
        )
        db.session.add(market)
        db.session.commit()

        n = 100
        market_id = market.id
        market_liquidity = MarketLiquidity(
            market_id=market_id, yes_liquidity=n, no_liquidity=n
        )
        db.session.add(market_liquidity)
        db.session.commit()

        liquidity: MarketLiquidity = MarketLiquidity.query.filter(
            MarketLiquidity.market_id == market_id
        ).first_or_404()
        self.assertEqual(liquidity.yes_liquidity, n)
        self.assertEqual(liquidity.no_liquidity, n)

    def test_market_resolve(self):
        user = self._create_super_user()
        response = self.client.post(
            "/market/1/resolve",
            data=json.dumps({"result": "no"}),
            headers={"x-api-key": user.api_key},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        market: PredictionMarket | None = PredictionMarket.query.filter(
            PredictionMarket.id == 1
        ).first()

        self.assertIsNotNone(market)
        self.assertEqual(market.result, "no")

        # After a market has been resolved, one cannot buy/sell anymore
        response = self.client.post(
            "/market/1/tx",
            data=json.dumps({"amount": 1, "kind": "buy[yes]"}),
            headers={"x-api-key": "somerandomapistring"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

    def test_market_list_markets(self):
        # The default market already exists
        for i in range(2, 4):
            market: PredictionMarket = PredictionMarket(
                name=f"Dummy market name {i}",
                description=f"Dummy maket description {i}",
            )
            db.session.add(market)
        db.session.commit()

        response = self.client.get("/market/list")
        data = json.loads(response.data)["data"]
        self.assertEqual(response.status_code, 200)
        # The order should be most recent market first
        self.assertEqual([3, 2, 1], [market["id"] for market in data])

    def test_market_cashout(self):
        user = self._create_super_user()
        _ = self.client.post(
            "/market/1/tx",
            data=json.dumps(
                {
                    "kind": "buy[no]",
                    "amount": "10",
                }
            ),
            headers={"x-api-key": user.api_key},
            content_type="application/json",
        )

        balance_after_purchase: UserBalance = cast(
            UserBalance,
            UserBalance.query.filter(UserBalance.user_id == user.id).first(),
        )
        dog_after_purchase: float = balance_after_purchase.dog_balance
        no_after_purchase: float = balance_after_purchase.no_balance

        response = self.client.get(
            "/user/balances", headers={"x-api-key": user.api_key}
        )
        markets = json.loads(response.data)["data"]
        filtered = list(
            filter(
                (lambda x: x["market_id"] == balance_after_purchase.market_id), markets
            )
        )
        self.assertEqual(len(filtered), 1)
        balance_response = filtered[0]
        self.assertEqual(
            balance_response["yes_balance"], balance_after_purchase.yes_balance
        )
        self.assertEqual(
            balance_response["no_balance"], balance_after_purchase.no_balance
        )
        self.assertEqual(
            balance_response["dog_balance"], balance_after_purchase.dog_balance
        )

        self.client.post(
            "/market/1/resolve",
            data=json.dumps({"result": "no"}),
            headers={"x-api-key": user.api_key},
            content_type="application/json",
        )
        response = self.client.post(
            "/market/1/cashout",
            headers={"x-api-key": user.api_key},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        dog_after_cashout: float = cast(
            UserBalance,
            UserBalance.query.filter(UserBalance.user_id == user.id).first(),
        ).dog_balance

        self.assertEqual(dog_after_purchase + no_after_purchase, dog_after_cashout)


class TestUser(ServerTest):
    def test_get_user(self):
        user = self._create_super_user()
        response = self.client.get(
            "/user/",
            headers={"x-api-key": "somerandomapistring"},
        )
        self.assertEqual(response.status_code, 200)
        user_response = json.loads(response.data)
        self.assertEqual(user_response["data"]["id"], user.id)
        self.assertEqual(user_response["data"]["username"], user.username)
        self.assertEqual(user_response["data"]["email"], user.email)
        self.assertFalse("password_hash" in user_response["data"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
