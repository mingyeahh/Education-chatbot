import os
import openai

summary_prompt = 'summarise the following dialogue in detail for at least 30 words, but no more than 60 words {}. Now give a list of topics of what the user and the assistant talked about. Example topics discussed can be equations, history facts, introductions etc. ' 
comb_prompt = "The user and the teacher previously talked about {} They also talked about {}\nPlease summarise the given information above in detail but less than 200 words. Then give a list of topic they've talked about. Example topics discussed can be equations, history facts, etc. "
top_to_sub_prompt = "give me a bullet point list on: {}"
lesson_prompt = "You are a teacher, teach me a full lesson on {}, with regards to {}. Ask me a question to test my knowledge at the end"

def top_to_sub(topic):
    n_prompt = top_to_sub_prompt.format(topic)
    return send(n_prompt)

def lesson(topic, subtopic):
    n_prompt = lesson_prompt.format(subtopic, topic)
    return send(n_prompt)

def summarise(B):
    n_B = ', '.join(B)
    n_prompt = summary_prompt.format(n_B)
    return send(n_prompt)

def combine(A, B):
    n_prompt = comb_prompt.format(B, A)
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
    old_sum = ''
    for B in batched(conv):
        curr_sum = summarise(B)
        if old_sum != '':
            old_sum = combine(old_sum, curr_sum)
        else:
            old_sum = curr_sum

def send(message):
    openai.api_base = "http://localhost:1234/v1" # point to the local server
    openai.api_key = "" # no need for an API key

    completion = openai.ChatCompletion.create(
    model="local-model", # this field is currently unused
    messages=[
        {"role": "user", "content": message}
    ],
    temperature = 0.1,
    top_p = 0.5
    )

    print(completion.choices[0].message)

create_summary(["User: hello, my name is josh", "AI: hi josh, my name is chatgpt", "User: nice to meet you chat gpt, i hope we have good conversations"])