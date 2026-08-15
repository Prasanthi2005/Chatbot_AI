# ==========================================
# database/db.py
# ==========================================

import sqlite3
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATABASE = os.path.join(BASE_DIR, "chatbot.db")


# ==========================================
# Database Connection
# ==========================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def get_db_connection():
    return get_db()


# ==========================================
# Initialize Database
# ==========================================

def init_db():

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT,
        email TEXT UNIQUE,
        username TEXT UNIQUE,
        password TEXT,
        theme TEXT DEFAULT 'dark',
        ai_model TEXT DEFAULT 'Groq',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS chats (

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        user_message TEXT,
        bot_reply TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )
    """)

    conn.commit()
    conn.close()


# ==========================================
# Save Chat
# ==========================================

def save_chat(username, user_message, bot_reply):

    conn = get_db()

    conn.execute(
        """
        INSERT INTO chats
        (username, user_message, bot_reply)
        VALUES (?, ?, ?)
        """,
        (username, user_message, bot_reply)
    )

    conn.commit()
    conn.close()


# ==========================================
# Get Chat History
# ==========================================

def get_chat_history(username):

    conn = get_db()

    chats = conn.execute(
        """
        SELECT *
        FROM chats
        WHERE username=?
        ORDER BY id ASC
        """,
        (username,)
    ).fetchall()

    conn.close()

    return chats


# ==========================================
# Delete Chat History
# ==========================================

def delete_chat_history(username):

    conn = get_db()

    conn.execute(
        """
        DELETE FROM chats
        WHERE username=?
        """,
        (username,)
    )

    conn.commit()
    conn.close()