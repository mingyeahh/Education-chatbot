import summariser
import re

SUBTOPIC_REGEX = re.compile(r"(?:- )|(?:\d\. )")


def query_topic(topic, **kwargs):
    response_content = summariser.top_to_sub(topic)["content"]
    subtopics = [
        line for line in response_content.split("\n") if SUBTOPIC_REGEX.match(line)
    ]
    return subtopics


def query_subtopic_start(subtopic, topic, **kwargs):
    response = summariser.lesson(topic, subtopic)
    return response


def user_content_to_message(content, **kwargs):
    return {"role": "user", "content": content}


def send_message(message, subtopic, topic, data, **kwargs):
    return summariser.send_message(message, topic, subtopic, data)
