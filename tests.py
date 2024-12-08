import unittest

import sqlalchemy
import json
from api import create_app, db
from api.models import PredictionMarket, User, MarketLiquidity

class ServerTest(unittest.TestCase):
    def setUp(self):
        app = create_app()
        self.client = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()

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
            name="Dummy market name",
            description="Dummy maket description"
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
        _ = self._create_super_user()
        self.client.post(
            "/market/create",
            data=json.dumps(
                {
                    "name": "Will the average grade in NumCS be above 5?",
                    "description": "Resolves on DATE",
                }
            ),
            headers={"x-api-key": "somerandomapistring"},
            content_type="application/json",
        )
        response = self.client.post(
            "/market/1/resolve",
            headers={"x-api-key": "somerandomapistring"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        # After a market has been resolved, one cannot buy/sell anymore
        response = self.client.post(
            "/market/1/tx",
            data=json.dumps(
                {
                    "amount": 1,
                    "kind": "buy[yes]"
                    }
            ),
            headers={"x-api-key": "somerandomapistring"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)


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
