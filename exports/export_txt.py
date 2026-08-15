# ==========================================
# exports/export_txt.py
# Export Chat History to TXT
# ==========================================

import os
from datetime import datetime


def export_chat_to_txt(username, chats, export_folder="exports"):
    """
    Export chat history to TXT.

    Parameters:
        username (str)
        chats (list)

    Returns:
        str : Generated TXT file path
    """

    os.makedirs(export_folder, exist_ok=True)

    filename = (
        f"{username}_chat_"
        f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    )

    filepath = os.path.join(export_folder, filename)

    with open(filepath, "w", encoding="utf-8") as file:

        file.write("=" * 60 + "\n")
        file.write("          AI CHATBOT CHAT HISTORY\n")
        file.write("=" * 60 + "\n\n")

        file.write(f"Username : {username}\n")
        file.write(
            f"Generated: {datetime.now().strftime('%d-%m-%Y %I:%M:%S %p')}\n\n"
        )

        if not chats:

            file.write("No chat history available.\n")

        else:

            for index, chat in enumerate(chats, start=1):

                if isinstance(chat, dict):

                    user_message = chat.get("user_message", "")
                    bot_reply = chat.get("bot_reply", "")

                else:

                    user_message = chat["user_message"]
                    bot_reply = chat["bot_reply"]

                file.write("-" * 60 + "\n")
                file.write(f"Chat #{index}\n")
                file.write("-" * 60 + "\n")

                file.write(f"You:\n{user_message}\n\n")
                file.write(f"AI:\n{bot_reply}\n\n")

    return filepath