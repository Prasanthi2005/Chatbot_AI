# ==========================================
# database/models.py
# ==========================================

from datetime import datetime
from extensions import db


# ==========================================
# User Model
# ==========================================

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    fullname = db.Column(db.String(100), nullable=False)

    username = db.Column(db.String(100), unique=True, nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=True)

    theme = db.Column(db.String(20), default="dark")

    ai_model = db.Column(db.String(50), default="Groq")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.username}>"


# ==========================================
# Chat Model
# ==========================================

class Chat(db.Model):
    __tablename__ = "chat_history"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(100), nullable=False)

    user_message = db.Column(db.Text, nullable=False)

    bot_reply = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Chat {self.username}>"