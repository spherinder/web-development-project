import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY: str = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI: str = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
