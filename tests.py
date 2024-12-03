import unittest

import json
from api import create_app, db
from api.models import User


class UserModelCase(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main(verbosity=2)
