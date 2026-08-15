# ==========================================
# AI_CHATBOT_PRO
# config.py
# ==========================================

import os
from dotenv import load_dotenv


# Load .env file

load_dotenv()



class Config:


    # ==============================
    # Flask Configuration
    # ==============================


    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "ai_chatbot_secret_key_2026"
    )


    DEBUG = True



    # ==============================
    # Database Configuration
    # ==============================


    DATABASE = os.getenv(
        "DATABASE",
        "chatbot.db"
    )


    SQLALCHEMY_DATABASE_URI = (
        "sqlite:///"
        + DATABASE
    )


    SQLALCHEMY_TRACK_MODIFICATIONS = False






    # ==============================
    # Upload Configuration
    # ==============================


    UPLOAD_FOLDER = os.path.join(
        "static",
        "uploads"
    )


    MAX_CONTENT_LENGTH = (
        16 * 1024 * 1024
    )


    ALLOWED_EXTENSIONS = {

        "png",
        "jpg",
        "jpeg",
        "gif"

    }







    # ==============================
    # Email SMTP Configuration
    # Gmail OTP
    # ==============================


    MAIL_SERVER = "smtp.gmail.com"


    MAIL_PORT = 587


    MAIL_USE_TLS = True


    MAIL_USE_SSL = False



    MAIL_USERNAME = os.getenv(
        "MAIL_USERNAME"
    )


    MAIL_PASSWORD = os.getenv(
        "MAIL_PASSWORD"
    )



    MAIL_DEFAULT_SENDER = os.getenv(
        "MAIL_USERNAME"
    )








    # ==============================
    # AI API Configuration
    # ==============================


    GROQ_API_KEY = os.getenv(
        "GROQ_API_KEY"
    )


    OPENAI_API_KEY = os.getenv(
        "OPENAI_API_KEY"
    )


    GEMINI_API_KEY = os.getenv(
        "GEMINI_API_KEY"
    )







    # ==============================
    # AI Model Settings
    # ==============================


    DEFAULT_AI_MODEL = "Groq"


    AVAILABLE_MODELS = [

        "Groq",
        "Gemini",
        "OpenAI"

    ]







    # ==============================
    # Export Settings
    # ==============================


    EXPORT_FOLDER = "exports"


    PDF_EXPORT = True


    DOCX_EXPORT = True


    TXT_EXPORT = True







    # ==============================
    # OTP Settings
    # ==============================


    OTP_LENGTH = 6


    OTP_EXPIRY = 300   # 5 minutes







    # ==============================
    # Session Settings
    # ==============================


    SESSION_COOKIE_SECURE = False


    SESSION_COOKIE_HTTPONLY = True


    SESSION_COOKIE_SAMESITE = "Lax"






# Development Config

class DevelopmentConfig(Config):

    DEBUG = True






# Production Config

class ProductionConfig(Config):

    DEBUG = False





# Testing Config

class TestingConfig(Config):

    TESTING = True