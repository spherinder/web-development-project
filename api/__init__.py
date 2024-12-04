from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate

def create_app(config_class: type[Config] = Config):
    app = Flask(__name__)
    _ = CORS(app, supports_credentials=True)
    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app, db)
    from api.auth import auth_blueprint

    app.register_blueprint(auth_blueprint)
    from api.market import market_blueprint

    app.register_blueprint(market_blueprint)
    from api.user import user_blueprint

    app.register_blueprint(user_blueprint)
    return app


# from api import models
