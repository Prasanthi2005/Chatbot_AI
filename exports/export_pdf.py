# ==========================================
# exports/export_pdf.py
# Export Chat History to PDF
# ==========================================

import os
from datetime import datetime

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)


def export_chat_to_pdf(username, chats, export_folder="exports"):
    """
    Export chat history to PDF.

    Parameters:
        username (str)
        chats (list)

    Returns:
        PDF file path
    """

    os.makedirs(export_folder, exist_ok=True)

    filename = (
        f"{username}_chat_"
        f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )

    filepath = os.path.join(export_folder, filename)

    styles = getSampleStyleSheet()

    pdf = SimpleDocTemplate(filepath)

    elements = []

    elements.append(
        Paragraph(
            "<b><font size=18>AI Chatbot Chat History</font></b>",
            styles["Title"]
        )
    )

    elements.append(Spacer(1, 15))

    elements.append(
        Paragraph(
            f"<b>Username:</b> {username}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Generated:</b> "
            f"{datetime.now().strftime('%d-%m-%Y %I:%M:%S %p')}",
            styles["Normal"]
        )
    )

    elements.append(Spacer(1, 20))

    if not chats:

        elements.append(
            Paragraph(
                "No chat history available.",
                styles["Normal"]
            )
        )

    else:

        for index, chat in enumerate(chats, start=1):

            if isinstance(chat, dict):

                user_message = chat.get(
                    "user_message",
                    ""
                )

                bot_reply = chat.get(
                    "bot_reply",
                    ""
                )

            else:

                user_message = chat["user_message"]

                bot_reply = chat["bot_reply"]

            elements.append(
                Paragraph(
                    f"<b>Chat {index}</b>",
                    styles["Heading2"]
                )
            )

            elements.append(
                Paragraph(
                    f"<b>You:</b><br/>{user_message}",
                    styles["BodyText"]
                )
            )

            elements.append(
                Paragraph(
                    f"<b>AI:</b><br/>{bot_reply}",
                    styles["BodyText"]
                )
            )

            elements.append(
                Spacer(1, 15)
            )

    pdf.build(elements)

    return filepath