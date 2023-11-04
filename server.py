from flask import Flask, request, send_file
from pathlib import Path
import json

OK = 200
CREATED = 201
INVALID = 400

CONTENT_HTML = {'ContentType':'text/html'}
CONTENT_PLAIN = {'ContentType':'text/plain'}
CONTENT_JSON = {'ContentType':'application/json'}

app = Flask(__name__, static_url_path='', static_folder="static")
data_dir = Path("data")

@app.route("/")
def serve_index():
    return send_file("static/index.html"), OK, CONTENT_HTML

@app.route("/login", methods=["POST"])
def login():
    """Incredibly insecure login function."""
    if request.content_type != "application/json":
        return "Body data must be JSON", INVALID, CONTENT_PLAIN
    if not "username" in request.json or request.json["username"] == "":
        return "No username provided", INVALID, CONTENT_PLAIN

    username = request.json["username"]
    user_file = data_dir / f"{username}.json"
    if not user_file.exists():
        with open(user_file, "w") as f:
            f.write("{}")
        return [], CREATED, CONTENT_JSON
    
    with open(user_file, "r") as f:
        user_data = json.load(f)
    return list(user_data.keys()), OK, CONTENT_JSON
