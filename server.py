from flask import Flask, request, send_file
from pathlib import Path
import json

import model

OK = 200
CREATED = 201
INVALID = 400
NOT_FOUND = 404

CONTENT_HTML = {"ContentType": "text/html"}
CONTENT_PLAIN = {"ContentType": "text/plain"}
CONTENT_JSON = {"ContentType": "application/json"}

app = Flask(__name__, static_url_path="", static_folder="static")
data_dir = Path("data")


def require_body_parameters(request, params):
    if request.content_type != "application/json":
        return False, "Body data must be JSON"
    for param in params:
        if not param in request.json or request.json[param] == "":
            return False, f"No {param} provided"
    return True, None


def get_user_data(request):
    username = request.json["username"]
    user_file = data_dir / f"{username}.json"
    if not user_file.exists():
        return None
    with open(user_file, "r") as f:
        d = json.load(f)
    return d


def save_user_data(request, user_data):
    username = request.json["username"]
    user_file = data_dir / f"{username}.json"
    if not user_file.exists():
        return None
    with open(user_file, "w") as f:
        json.dump(user_data, f)


@app.route("/")
def serve_index():
    return send_file("static/index.html"), OK, CONTENT_HTML


@app.route("/login", methods=["POST"])
def login():
    """Incredibly insecure login function."""
    valid, reason = require_body_parameters(request, ["username"])
    if not valid:
        return reason, INVALID, CONTENT_PLAIN

    user_data = get_user_data(request)
    if user_data is None:
        username = request.json["username"]
        with open(data_dir / f"{username}.json", "w") as f:
            f.write("{}")
        return [], CREATED, CONTENT_JSON
    return list(user_data.keys()), OK, CONTENT_JSON


@app.route("/topic", methods=["POST"])
def topic():
    valid, reason = require_body_parameters(request, ["username", "topic"])
    if not valid:
        return reason, INVALID, CONTENT_PLAIN

    user_data = get_user_data(request)
    if user_data is None:
        return "User not registered", NOT_FOUND, CONTENT_PLAIN

    topic = request.json["topic"]
    if not topic in user_data:
        subtopics = model.query_topic(topic)
        user_data[topic] = {subtopic: {} for subtopic in subtopics}
        save_user_data(request, user_data)
    return list(user_data[topic].keys()), OK, CONTENT_JSON


@app.route("/subtopic", methods=["POST"])
def subtopic():
    valid, reason = require_body_parameters(request, ["username", "topic", "subtopic"])
    if not valid:
        return reason, INVALID, CONTENT_PLAIN

    user_data = get_user_data(request)
    if user_data is None:
        return "User not registered", NOT_FOUND, CONTENT_PLAIN

    topic = request.json["topic"]
    if not topic in user_data:
        return "Topic not found", NOT_FOUND, CONTENT_PLAIN

    subtopic = request.json["subtopic"]
    if not subtopic in user_data[topic]:
        return "Subtopic not found", NOT_FOUND, CONTENT_PLAIN

    if not "conversation" in user_data[topic][subtopic]:
        first_message = model.query_subtopic_start(subtopic, topic=topic)
        user_data[topic][subtopic] = {"conversation": [first_message]}
        save_user_data(request, user_data)
    return user_data[topic][subtopic]["conversation"], OK, CONTENT_JSON


@app.route("/message", methods=["POST"])
def message():
    valid, reason = require_body_parameters(
        request, ["username", "topic", "subtopic", "message"]
    )
    if not valid:
        return reason, INVALID, CONTENT_PLAIN

    user_data = get_user_data(request)
    if user_data is None:
        return "User not registered", NOT_FOUND, CONTENT_PLAIN

    topic = request.json["topic"]
    if not topic in user_data:
        return "Topic not found", NOT_FOUND, CONTENT_PLAIN

    subtopic = request.json["subtopic"]
    if not subtopic in user_data[topic]:
        return "Subtopic not found", NOT_FOUND, CONTENT_PLAIN

    if not "conversation" in user_data[topic][subtopic]:
        return "Conversation does not exist", NOT_FOUND, CONTENT_PLAIN

    message_content = request.json["message"]
    user_message = model.user_content_to_message(message_content)
    bot_message = model.send_message(
        user_message, topic=topic, subtopic=subtopic, data=user_data[topic][subtopic]
    )
    user_data[topic][subtopic]["conversation"].extend([user_message, bot_message])
    save_user_data(request, user_data)
    return bot_message, OK, CONTENT_JSON
