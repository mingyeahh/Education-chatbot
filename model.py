def query_topic(topic):
    # mock implementation
    return [i for i in topic]

def query_subtopic_start(subtopic, **kwargs):
    # mock implementation
    return {"sender": "assistant", "content": f"The topic of {subtopic} can be thought of as a branch of graph theory."}
