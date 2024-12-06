from flask import Flask
from flask_cors import CORS
from sqlite3 import Connection
from sqlalchemy.pool.base import _ConnectionRecord # pyright: ignore[reportPrivateUsage]
from config import Config, TestConfig
from extensions import db, migrate

def create_app(config_class: type[Config | TestConfig] = Config):
    app = Flask(__name__)
    _ = CORS(app, supports_credentials=True)
    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app, db)

    if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI']:
        def _fk_pragma_on_connect(dbapi_con: Connection, _con_record: _ConnectionRecord):
            _ = dbapi_con.execute("pragma foreign_keys=ON")

        with app.app_context():
            from sqlalchemy import event
            event.listen(db.engine, 'connect', _fk_pragma_on_connect)
    from api.auth import auth_blueprint

    app.register_blueprint(auth_blueprint)
    from api.market import market_blueprint

    app.register_blueprint(market_blueprint)
    from api.user import user_blueprint

    app.register_blueprint(user_blueprint)
    return app


# from api import models
