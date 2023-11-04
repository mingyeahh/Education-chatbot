def query_topic(topic):
    # mock implementation
    return [i for i in topic]

def query_subtopic_start(subtopic, **kwargs):
    # mock implementation
    return {"sender": "assistant", "content": f"The topic of {subtopic} can be thought of as a branch of graph theory."}

def user_content_to_message(content):
    # mock implementation
    return {"sender": "user", "content": content}

def send_message(message, **kwargs):
    # mock implementation
    return {"sender": "assistant", "content": f"(in a parrot voice) *squawk* {message['content']} *squawk*"}
