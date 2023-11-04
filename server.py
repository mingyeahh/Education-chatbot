from flask import Flask, request, send_file
from pathlib import Path

OK = 200
CREATED = 201
INVALID = 400

CONTENT_HTML = {'ContentType':'text/html'}
CONTENT_PLAIN = {'ContentType':'text/plain'}

app = Flask(__name__, static_url_path='', static_folder="static")
data_dir = Path("data")

@app.route("/")
def serve_index():
    return send_file("static/index.html"), OK, CONTENT_HTML

@app.route("/login")
def login():
    """Incredibly insecure login function."""
    username = request.args.get("username", "", type=str)
    if username == "": return "No username provided", INVALID, CONTENT_PLAIN
    user_file = data_dir / f"{username}.json"
    if user_file.exists():
        return username, OK, CONTENT_PLAIN
    with open(user_file, "w") as f:
        f.write("{}")
    return username, CREATED, CONTENT_PLAIN
