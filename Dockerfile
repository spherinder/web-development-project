FROM python:3.12.0-slim

COPY requirements.txt /

RUN pip3 install --upgrade pip

RUN pip3 install -r /requirements.txt

COPY . /app

WORKDIR /app

EXPOSE 8080

# TODO set ENV SQLALCHEMY_DATABASE_URI to location

CMD ["./entrypoint.sh"]
