import os
import openai

summary_prompt = 'summarise the following dialogue in detail for at least 30 words, but no more than 60 words, then give a list of topics of what the user and the assistant talked about. Example topics discussed can be equations, history facts, etc.' 
comb_prompt = "The user and the teacher previously talked about {} They also talked about {}\nPlease summarise the given information above in detail but less than 200 words. Then give a list of topic they've talked about. Example topics discussed can be equations, history facts, etc."


def summarise(B):
    n_prompt = summary_prompt + B
    return send(n_prompt)

def combine(A, B):
    n_prompt = comb_prompt.format(B, A)
    return send(n_prompt)

def batched(conv):
    batch_max = 20
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
    return batches

def main(conv):
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
    ]
    )

    print(completion.choices[0].message)

main(["hello, my name is josh", "hi josh, my name is chatgpt", "nice to meet you chat gpt, i hope we have good conversations"])