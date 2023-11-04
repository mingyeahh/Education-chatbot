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

def require_body_parameters(request, params):
    if request.content_type != "application/json":
        return False, "Body data must be JSON"
    for param in params:
        if not param in request.json or request.json[param] == "":
            return False, f"No {param} provided"
    return True, None

@app.route("/")
def serve_index():
    return send_file("static/index.html"), OK, CONTENT_HTML

@app.route("/login", methods=["POST"])
def login():
    """Incredibly insecure login function."""
    valid, reason = require_body_parameters(request, ["username"])
    if not valid:
        return reason, INVALID, CONTENT_PLAIN

    username = request.json["username"]
    user_file = data_dir / f"{username}.json"
    if not user_file.exists():
        with open(user_file, "w") as f:
            f.write("{}")
        return [], CREATED, CONTENT_JSON
    
    with open(user_file, "r") as f:
        user_data = json.load(f)
    return list(user_data.keys()), OK, CONTENT_JSON
