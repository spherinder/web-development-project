from flask import Flask, jsonify, request, Response
from flask_cors import cross_origin

app = Flask(__name__)

@app.route("/")
@cross_origin()
def hello_world() -> Response:
    data = "hello world from server"
    app.logger.debug('A value for debugging')
    return jsonify(data)

@app.route("/markets")
@cross_origin()
def getMarkets() -> Response:
    pass

@app.route("/market/<name>")
@cross_origin()
def getMarket() -> Response:
    pass
