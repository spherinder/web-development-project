from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
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


from api import models
