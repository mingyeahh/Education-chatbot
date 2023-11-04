from flask import Flask, request, send_file

app = Flask(__name__, static_url_path='', static_folder="static")

@app.route("/")
def serve_index():
    return send_file("static/index.html")
