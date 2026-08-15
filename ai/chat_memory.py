# ==========================================
# AI_CHATBOT_PRO
# ai/chat_memory.py
# Chat Memory Manager
# ==========================================


import json
import os
from datetime import datetime



# Memory file

MEMORY_FILE = "chat_memory.json"



# Maximum messages stored

MAX_MEMORY = 20






# ==========================================
# Create Memory File
# ==========================================

def create_memory_file():

    if not os.path.exists(MEMORY_FILE):

        with open(
            MEMORY_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                {},
                file,
                indent=4
            )






# ==========================================
# Load Memory
# ==========================================

def load_memory(username):

    create_memory_file()


    with open(
        MEMORY_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)



    return data.get(
        username,
        []
    )







# ==========================================
# Save Memory
# ==========================================

def save_memory(username, messages):


    create_memory_file()



    with open(
        MEMORY_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)



    data[username] = messages



    with open(
        MEMORY_FILE,
        "w",
        encoding="utf-8"
    ) as file:


        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False
        )








# ==========================================
# Add Chat Message
# ==========================================

def add_message(
        username,
        user_message,
        bot_reply
):


    memory = load_memory(username)



    conversation = {


        "user":

        user_message,


        "assistant":

        bot_reply,


        "time":

        datetime.now()
        .strftime(
            "%Y-%m-%d %H:%M:%S"
        )

    }



    memory.append(
        conversation
    )



    # Keep latest messages only

    if len(memory) > MAX_MEMORY:

        memory = memory[-MAX_MEMORY:]



    save_memory(
        username,
        memory
    )



    return memory







# ==========================================
# Get AI Context
# ==========================================

def get_context(username):


    memory = load_memory(username)



    context = ""



    for chat in memory:


        context += (

            "User: "
            +
            chat["user"]
            +
            "\n"

            "AI: "
            +
            chat["assistant"]
            +
            "\n\n"

        )



    return context







# ==========================================
# Clear User Memory
# ==========================================

def clear_memory(username):


    create_memory_file()



    with open(
        MEMORY_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        data=json.load(file)




    if username in data:

        del data[username]





    with open(
        MEMORY_FILE,
        "w",
        encoding="utf-8"
    ) as file:


        json.dump(
            data,
            file,
            indent=4
        )



    return True







# ==========================================
# Delete All Memory
# ==========================================

def clear_all_memory():


    with open(
        MEMORY_FILE,
        "w",
        encoding="utf-8"
    ) as file:


        json.dump(
            {},
            file,
            indent=4
        )


    return True