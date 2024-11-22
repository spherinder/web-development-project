from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/")
def hello_world():
    data = {"content" : "Hellow"}
    app.logger.debug('A value for debugging')
    return jsonify(data)
