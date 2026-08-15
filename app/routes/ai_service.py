# ==========================================================
# AI CHATBOT PRO
# app/routes/ai_service.py
# ==========================================================

import os

from dotenv import load_dotenv
from groq import Groq


# Load .env
load_dotenv()


def generate_ai_response(message):
    """
    Generate AI response using Groq API.
    """

    # ------------------------------------------
    # Validate message
    # ------------------------------------------

    message = (message or "").strip()

    if not message:
        return "Please enter a message."


    # ------------------------------------------
    # Get API key
    # ------------------------------------------

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:

        print("\n========== GROQ CONFIG ERROR ==========")
        print("GROQ_API_KEY is missing.")
        print("Please check your .env file.")
        print("=======================================\n")

        return "Groq API key is missing. Please check your .env file."


    # ------------------------------------------
    # Call Groq
    # ------------------------------------------

    try:

        client = Groq(
            api_key=api_key
        )


        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are AI Chatbot Pro, "
                        "a helpful and intelligent AI assistant. "
                        "Answer the user's questions clearly, "
                        "accurately, and professionally."
                    )
                },

                {
                    "role": "user",
                    "content": message
                }

            ],

            temperature=0.7,

            max_tokens=2048
        )


        # ------------------------------------------
        # Extract response
        # ------------------------------------------

        if not response.choices:

            return "No response received from AI."


        reply = response.choices[0].message.content


        if not reply:

            return "No response received from AI."


        return reply.strip()


    # ------------------------------------------
    # Error handling
    # ------------------------------------------

    except Exception as e:

        print("\n==========================================")
        print("           GROQ API ERROR")
        print("==========================================")
        print("Error Type :", type(e).__name__)
        print("Error      :", str(e))
        print("==========================================\n")

        return f"AI service error: {str(e)}"


# ==========================================================
# BACKWARD COMPATIBILITY
# ==========================================================
#
# If another file imports get_ai_response(),
# it will also work.
#

def get_ai_response(message, uploaded_file=None):

    return generate_ai_response(message)
