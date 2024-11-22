from flask import Flask, jsonify, request, Response

app = Flask(__name__)

@app.route("/")
def hello_world() -> Response:
    data = {"content" : "Hellow"}
    app.logger.debug('A value for debugging')
    return jsonify(data)

@app.route("/markets")
def getMarkets() -> Response:
    pass

@app.route("/market/<name>")
def getMarket() -> Response:
    pass
