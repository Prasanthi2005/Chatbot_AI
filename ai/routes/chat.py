"""
========================================================
 CodeMaster Chat System

 Part 1C-1D

 chat.py

 Features:
 - Chat API routes
 - SQLite storage
 - Session handling
 - AI response integration
 - History API

========================================================
"""


from flask import (
    Blueprint,
    request,
    jsonify,
    session,
    Response
)

import sqlite3
import datetime
import json


from app.routes.ai_service import generate_ai_response



chat_bp = Blueprint(
    "chat",
    __name__
)



DATABASE = "database.db"





# ======================================================
# DATABASE CONNECTION
# ======================================================


def get_db():

    conn = sqlite3.connect(
        DATABASE
    )

    conn.row_factory = sqlite3.Row

    return conn





# ======================================================
# CREATE CHAT TABLE
# ======================================================


def create_chat_table():


    conn = get_db()


    conn.execute(
        """

        CREATE TABLE IF NOT EXISTS chats(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT NOT NULL,

            role TEXT NOT NULL,

            message TEXT NOT NULL,

            created_at TEXT

        )

        """
    )


    conn.commit()

    conn.close()





create_chat_table()







# ======================================================
# SAVE MESSAGE
# ======================================================


def save_message(
        username,
        role,
        message
):


    conn = get_db()


    conn.execute(

        """

        INSERT INTO chats
        (
            username,
            role,
            message,
            created_at
        )

        VALUES
        (?,?,?,?)

        """,

        (

            username,

            role,

            message,

            datetime.datetime.now()
            .isoformat()

        )

    )


    conn.commit()

    conn.close()







# ======================================================
# CHAT API
# ======================================================


@chat_bp.route(
    "/api/chat",
    methods=["POST"]
)
def chat():



    if "username" not in session:


        return jsonify({

            "error":
            "Login required"

        }),401





    data =request.get_json()



    user_message =data.get(
            "message",
            ""
        )




    if not user_message:


        return jsonify({

            "error":
            "Empty message"

        }),400







    username =session["username"]





    # Save user message

    save_message(

        username,

        "user",

        user_message

    )






    # Generate AI reply

    ai_reply = generate_ai_response(
        user_message
    )





    # Save AI message

    save_message(

        username,

        "assistant",

        ai_reply

    )





    return jsonify({


        "reply":
        ai_reply


    })








# ======================================================
# CHAT HISTORY
# ======================================================


@chat_bp.route(
    "/api/chat/history",
    methods=["GET"]
)

def history():


    if "username" not in session:


        return jsonify([])





    conn=get_db()



    chats =conn.execute(

        """

        SELECT role,message,created_at

        FROM chats

        WHERE username=?

        ORDER BY id ASC

        """,

        (

            session["username"],

        )

    ).fetchall()





    conn.close()



    return jsonify([


        {

            "role":
            row["role"],


            "message":
            row["message"],


            "time":
            row["created_at"]


        }


        for row in chats


    ])










# ======================================================
# DELETE HISTORY
# ======================================================


@chat_bp.route(
    "/api/chat/delete",
    methods=["DELETE"]
)

def delete_chat():


    if "username" not in session:


        return jsonify({

            "error":
            "Login required"

        }),401






    conn=get_db()



    conn.execute(

        """

        DELETE FROM chats

        WHERE username=?

        """,

        (

            session["username"],

        )

    )



    conn.commit()

    conn.close()




    return jsonify({

        "success":
        True

    })