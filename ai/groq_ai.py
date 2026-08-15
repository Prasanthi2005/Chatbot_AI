# ==========================================
# AI_CHATBOT_PRO
# ai/groq_ai.py
# Groq AI Response Engine
# ==========================================


import os

from groq import Groq

from dotenv import load_dotenv


from ai.prompt import SYSTEM_PROMPT


from ai.chat_memory import (
    get_context,
    add_message
)



# Load environment variables

load_dotenv()





# ==========================================
# Groq Client
# ==========================================


client = Groq(

    api_key=os.getenv(
        "GROQ_API_KEY"
    )

)







# ==========================================
# AI Model
# ==========================================


MODEL = "llama-3.3-70b-versatile"








# ==========================================
# Generate AI Response
# ==========================================


def get_groq_response(
        username,
        user_message
):


    try:


        # Previous chat memory

        memory = get_context(
            username
        )





        messages = [



            {

            "role":
            "system",

            "content":
            SYSTEM_PROMPT

            },


            {

            "role":
            "user",

            "content":
            memory

            },



            {

            "role":
            "user",

            "content":
            user_message

            }


        ]







        response = client.chat.completions.create(


            model=MODEL,


            messages=messages,


            temperature=0.7,


            max_tokens=2048


        )






        ai_reply = (

            response
            .choices[0]
            .message
            .content

        )






        # Save conversation


        add_message(

            username,

            user_message,

            ai_reply

        )






        return ai_reply







    except Exception as e:


        print(
            "Groq Error:",
            e
        )



        return (

        "Sorry, I am unable to "
        "process your request right now."

        )








# ==========================================
# Simple Chat Function
# ==========================================


def chat_with_ai(
        username,
        message
):


    return get_groq_response(

        username,

        message

    )