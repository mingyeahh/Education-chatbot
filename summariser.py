import os
import openai

summary_prompt = "summarise the following dialogue in detail for at least 30 words, but no more than 60 words {}. Now give a list of topics of what the user and the assistant talked about. Example topics discussed can be equations, history facts, introductions etc. "
comb_prompt = "The user and the teacher previously talked about {} They also talked about {}\nPlease summarise the given information above in detail but less than 200 words. Then give a list of topic they've talked about. Example topics discussed can be equations, history facts, etc. "
top_to_sub_prompt = "give me a numbered list of subtopics related to: {}"
lesson_prompt = "You are a teacher, teach me a full lesson on {}, with regards to {}. Ask me a question to test my knowledge at the end"
standard_prompt = "You are a teacher, we are learning {} with respect to {}. {} Remember the summary, topic, subtopic, and your role as a teacher"
SUMMARY_AMOUNT = 1000


def top_to_sub(topic):
    n_prompt = top_to_sub_prompt.format(topic)
    return send(n_prompt)


def lesson(topic, subtopic):
    n_prompt = lesson_prompt.format(subtopic, topic)
    return send(n_prompt)


def summarise(B):
    n_B = ", ".join(B)
    n_prompt = summary_prompt.format(n_B)
    return send(n_prompt)


def combine(new, old):
    n_prompt = comb_prompt.format(old, new)
    return send(n_prompt)


def batched(conv):
    batch_max = 100
    batches = []
    curr_batch = []
    size = 0
    for msg in conv:
        if len(msg) + size <= batch_max:
            curr_batch += [msg]
            size += len(msg)
        else:
            batches += [[*curr_batch]]
            curr_batch = []
            curr_batch += [msg]
            size = len(msg)
    batches += [[*curr_batch]]
    return batches


def create_summary(conv):
    old_sum = ""
    for B in batched(conv):
        curr_sum = summarise(B)
        if old_sum != "":
            old_sum = combine(old_sum, curr_sum)
        else:
            old_sum = curr_sum


def send_message(message, topic, subtopic, data):
    summary = ("The summary of the past is " + data["summary"]) if data["summary"] is not None else ""
    n_prompt = standard_prompt.format(topic, subtopic, summary)
    summ_form = []
    size = 0
    i = data["summ_index"] if "summ_index" in data else 0
    the_summary = None
    the_increment = None
    for msg in data["conversation"][i:]:
        comb_msg = "{}: {}".format(msg["role"], msg["content"])
        summ_form.append(comb_msg)
        size += len(comb_msg)
        if size >= SUMMARY_AMOUNT:
            if the_summary is not None:
                comb_summ = combine(the_summary, data["summary"])
                data["summary"] = comb_summ
                data["summ_index"] += the_increment
            the_summary = summarise(summ_form)
            the_increment = len(summ_form)
            summ_form = []
            size = 0
    data["next_summary"] = the_summary
    messages = [
        {"role": "system", "content": n_prompt},
    ] + data[
        "conversation"
    ][data["summ_index"]:]
    return send(message, past_messages=messages)


def send(message, past_messages=None):
    openai.api_base = "http://localhost:1234/v1"  # point to the local server
    openai.api_key = ""  # no need for an API key
    messages = []
    if type(message) == str:
        message = {"role": "user", "content": message}
    if past_messages is not None:
        messages += past_messages
    messages += [message]

    completion = openai.ChatCompletion.create(
        model="local-model",  # this field is currently unused
        messages=messages,
        temperature=0.1,
        top_p=0.5,
    )

    return completion.choices[0].message
