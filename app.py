# ==========================================
# AI_CHATBOT_PRO - app.py
# ==========================================

import email
import os
import base64
import mimetypes
import random
import sqlite3
from flask import session
from werkzeug.utils import secure_filename
from extensions import db, init_extensions
from database.models import User, Chat
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from app.routes.chat_routes import chat_bp
from functools import wraps
from app.routes.ai_service import get_ai_response
from dotenv import load_dotenv

from flask import (
    Blueprint,
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    jsonify,
    flash,
    send_file
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from groq import Groq

from config import Config
from extensions import db
from database.models import User
from extensions import mail

from ai.groq_ai import chat_with_ai
from ai.prompt import SYSTEM_PROMPT

from auth.login import login_bp
from auth.register import register_bp
from auth.forgot_password import forgot_bp

from exports.export_pdf import export_chat_to_pdf
from exports.export_docx import export_chat_to_docx
from exports.export_txt import export_chat_to_txt

chat_bp = Blueprint(
    "chat_bp",
    __name__
)
# ==========================================
# Load Environment Variables
# ==========================================

load_dotenv()


# ==========================================
# Flask App
# ==========================================

app = Flask(__name__)
UPLOAD_FOLDER = os.path.join(
    app.static_folder,
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config.from_object(Config)
init_extensions(app)

with app.app_context():
    db.create_all()
app.secret_key = 'mysecretkey123'

oauth = OAuth(app)

google = oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

app.secret_key = os.getenv(
    "SECRET_KEY",
    "super_secret_key"
)



mail.init_app(app)

# ==========================================
# Register Blueprints
# ==========================================

app.register_blueprint(login_bp)
app.register_blueprint(register_bp)
app.register_blueprint(forgot_bp)

app.register_blueprint(chat_bp)


# ==========================================
# Folder Configuration
# ==========================================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DATABASE = os.path.join(BASE_DIR, "chatbot.db")

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "static",
    "uploads"
)

EXPORT_FOLDER = os.path.join(
    BASE_DIR,
    "exports"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    EXPORT_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


# ==========================================
# Groq Configuration
# ==========================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

AI_MODEL = "llama-3.3-70b-versatile"

# ==========================================
# Database Connection
# ==========================================

def get_db():

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn

# ==========================================
# Create Database Tables
# ==========================================

def init_db():

    conn = get_db()

    cur = conn.cursor()

    # -------------------------
    # Users
    # -------------------------

    cur.execute("""

    CREATE TABLE IF NOT EXISTS users(

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

    # -------------------------
    # Chats
    # -------------------------

    cur.execute("""

    CREATE TABLE IF NOT EXISTS chats(

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
# Login Required Decorator
# ==========================================

def login_required(f):

    @wraps(f)

    def decorated_function(*args, **kwargs):

        if "username" not in session:

            flash("Please login first.", "warning")

            return redirect(url_for("login"))

        return f(*args, **kwargs)

    return decorated_function

# ==========================================
# Save Chat
# ==========================================

def save_chat(username, message, reply):

    conn = get_db()

    conn.execute(

        """

        INSERT INTO chats(

            username,

            user_message,

            bot_reply

        )

        VALUES(?,?,?)

        """,

        (username, message, reply)

    )

    conn.commit()

    conn.close()

# ==========================================
# Groq AI Function
# ==========================================

def get_ai_response(prompt):

    response = client.chat.completions.create(

        model=AI_MODEL,

        messages=[

            {

                "role": "system",

                "content":
                "You are a helpful AI assistant."

            },

            {

                "role": "user",

                "content": prompt

            }

        ],

        temperature=0.7,

        max_tokens=1024

    )

    return response.choices[0].message.content

# ==========================================
# Initialize Database
# ==========================================


# ==========================================
# HOME
# ==========================================

@app.route('/')
def home():
    return redirect(url_for('login'))

# ==========================================
# REGISTER
# ==========================================
@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        # -----------------------------
        # GET FORM DATA
        # -----------------------------

        fullname = request.form.get("fullname", "").strip()
        email = request.form.get("email", "").strip().lower()
        username = request.form.get("username", "").strip().lower()

        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        phone = request.form.get("phone", "").strip()

        photo = request.files.get("profile_photo")


        # -----------------------------
        # VALIDATION
        # -----------------------------

        if not fullname or not email or not username or not password:

            flash("Please fill all required fields.", "danger")

            return redirect(url_for("register"))


        if password != confirm_password:

            flash("Passwords do not match.", "danger")

            return redirect(url_for("register"))


        # -----------------------------
        # DATABASE
        # -----------------------------

        conn = get_db()


        # CHECK EMAIL / USERNAME

        user = conn.execute(
            """
            SELECT * FROM users
            WHERE email = ? OR username = ?
            """,
            (email, username)
        ).fetchone()


        if user:

            conn.close()

            flash(
                "Email or Username already exists.",
                "warning"
            )

            return redirect(url_for("register"))


        # -----------------------------
        # SAVE PROFILE PHOTO
        # -----------------------------

        photo = request.files.get("profile_photo")


        profile_photo = None

        if photo and photo.filename:

         filename = secure_filename(photo.filename)


        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        photo_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

        photo.save(photo_path)

        profile_photo = f"uploads/{filename}"

        print("PHOTO SAVED:", photo_path)


            # Database path

        profile_photo = (
                f"uploads/profiles/{filename}"
            )


        # -----------------------------
        # HASH PASSWORD
        # -----------------------------

        hashed_password = generate_password_hash(
            password
        )


        # -----------------------------
        # INSERT USER
        # -----------------------------

        conn.execute(
            """
            INSERT INTO users
            (
                fullname,
                email,
                username,
                password,
                profile_photo
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                fullname,
                email,
                username,
                hashed_password,
                profile_photo
            )
        )


        conn.commit()

        conn.close()


        # -----------------------------
        # SUCCESS
        # -----------------------------

        flash(
            "Registration Successful. Please Login.",
            "success"
        )


        return redirect(
            url_for("login")
        )


    return render_template("register.html")
# ==========================================
# Google Login
# ==========================================
@app.route('/google-login')
def google_login():
    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

# ==========================================
# GitHub Login
# ==========================================

@app.route("/github-login")
def github_login():

    flash(
        "GitHub Login feature is coming soon.",
        "info"
    )

    return redirect(
        url_for("login.login")
    )
@app.route("/google/callback")
def google_callback():
    token = google.authorize_access_token()

    # Google user info
    google_user = token["userinfo"]

    email = google_user["email"]
    fullname = google_user["name"]
    username = email.split("@")[0]

    # Database లో user ఉందా?
    db_user = User.query.filter_by(email=email).first()

    # లేకపోతే create చేయి
    if db_user is None:
        db_user = User(
            fullname=fullname,
            username=username,
            email=email
        )

        db.session.add(db_user)
        db.session.commit()

    # Session create చేయి
    session["user_id"] = db_user.id
    session["fullname"] = db_user.fullname
    session["username"] = db_user.username
    session["user_email"] = db_user.email

    return redirect(url_for("dashboard"))


# ==========================================
# LOGIN
# ==========================================

@app.route("/login", methods=["GET", "POST"])
def login():

    if "username" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":

        username = request.form.get("username").strip().lower()
        password = request.form.get("password")

        conn = get_db()

        user = conn.execute(
            """
            SELECT * FROM users
            WHERE username=?
            """,
            (username,)
        ).fetchone()

        conn.close()

        if user and check_password_hash(user["password"], password):

            session["username"] = user["username"]
            session["fullname"] = user["fullname"]
            session["email"] = user["email"]
            session["user_id"] = user["id"]
            session["theme"] = user["theme"]
            session["ai_model"] = user["ai_model"]

            flash("Login Successful.", "success")

            return redirect(url_for("dashboard"))

        flash("Invalid Username or Password.", "danger")

        return redirect(url_for("login"))

    return render_template("login.html")


# ==========================================
# DASHBOARD
# ==========================================
@app.route("/dashboard")
@login_required
def dashboard():

    user_id = session.get("user_id")

    if not user_id:
        return redirect(url_for("login"))

    user = User.query.get(user_id)

    return render_template(
        "dashboard.html",
        user=user
    )

@app.route("/export/docx")
@login_required
def export_docx():

    conn = get_db()

    chats = conn.execute(
        """
        SELECT user_message, bot_reply
        FROM chats
        WHERE username=?
        ORDER BY id ASC
        """,
        (session["username"],)
    ).fetchall()

    conn.close()

    file_path = export_chat_to_docx(
        session["username"],
        chats
    )

    return send_file(
        file_path,
        as_attachment=True
    )



@app.route("/export/txt")
@login_required
def export_txt():

    conn = get_db()

    chats = conn.execute(
        """
        SELECT user_message, bot_reply
        FROM chats
        WHERE username=?
        ORDER BY id ASC
        """,
        (session["username"],)
    ).fetchall()

    conn.close()

    txt_path = export_chat_to_txt(
        session["username"],
        chats
    )

    return send_file(
        txt_path,
        as_attachment=True
    )

# ==========================================
# LOGOUT
# ==========================================

@app.route("/logout")
@login_required
def logout():

    session.clear()

    flash("Logged out successfully.", "info")

    return redirect(url_for("login"))

# ==========================================
# CHAT PAGE
# ==========================================


@app.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():

    if request.method == "POST":

        email = request.form["email"].strip().lower()

        conn = get_db()

        user = conn.execute(
            "SELECT * FROM users WHERE email=?",
            (email,)
        ).fetchone()

        conn.close()

        if not user:

            flash("Email not found.", "danger")

            return redirect(url_for("forgot_password"))

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        session["reset_email"] = email
        session["reset_otp"] = otp

        # TODO: Send OTP using Flask-Mail
        print("OTP:", otp)

        flash("OTP has been sent to your email.", "success")

        return redirect(url_for("verify_otp"))

    return render_template("forgot_password.html")

# ==========================================
# CHAT API (Groq)
# ==========================================
@app.route("/chat")
def chat():
    if "user_email" not in session:
        return redirect(url_for("login"))

    fullname = session.get("fullname", "User")

    return render_template(
        "chat.html",
        fullname=fullname
    )


# ==========================================
# CHAT API (Groq)
# ==========================================

@app.route("/api/chat", methods=["POST"])
@login_required
def api_chat():

    try:

        data = request.get_json(silent=True)

        print("========== CHAT REQUEST ==========")
        print("DATA:", data)
        print("==================================")

        if not data:
            return jsonify({
                "success": False,
                "reply": "Invalid request. JSON data not received."
            }), 400

        message = data.get("message", "").strip()

        if not message:
            return jsonify({
                "success": False,
                "reply": "Please type a message."
            }), 400

        print("USER MESSAGE:", message)

        # AI response
        reply = get_ai_response(message)

        print("AI REPLY:", reply)

        # Save chat if your function exists
        try:
            save_chat(
                session.get("username", "guest"),
                message,
                reply
            )
        except Exception as save_error:
            print("Chat save error:", save_error)

        return jsonify({
            "success": True,
            "reply": reply
        }), 200

    except Exception as e:

        print("\n========== AI ERROR ==========")
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR:", str(e))
        print("==============================\n")

        return jsonify({
            "success": False,
            "reply": "AI service unavailable. Please check your AI configuration."
        }), 500

    # ==========================================
# IMAGE ANALYSIS API
# ==========================================

@app.route("/api/analyze-image", methods=["POST"])
@login_required
def analyze_image():

    try:

        image = request.files.get("image")
        message = request.form.get("message", "").strip()

        # Check image
        if not image:
            return jsonify({
                "error": "No image was uploaded."
            }), 400

        # Check filename
        if not image.filename:
            return jsonify({
                "error": "Invalid image filename."
            }), 400

        # Allowed image types
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp"
        }

        content_type = image.content_type or ""

        if content_type not in allowed_types:

            return jsonify({
                "error": "Unsupported image type."
            }), 400

        # Read image bytes
        image_bytes = image.read()

        # Maximum 4 MB
        if len(image_bytes) > 4 * 1024 * 1024:

            return jsonify({
                "error": "Image is too large. Please upload an image below 4 MB."
            }), 400

        # Convert image to base64
        base64_image = base64.b64encode(
            image_bytes
        ).decode("utf-8")

        # Default question
        if not message:
            message = (
                "Analyze this image carefully. "
                "Describe what is visible and answer "
                "usefully and clearly."
            )

        # Send image to Groq vision model
        completion = client.chat.completions.create(

            model="qwen/qwen3.6-27b",

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are a helpful AI assistant. "
                        "Analyze images accurately. "
                        "If the user asks about text in the image, "
                        "read it carefully. "
                        "Give a clear and useful answer."
                    )
                },

                {
                    "role": "user",

                    "content": [

                        {
                            "type": "text",
                            "text": message
                        },

                        {
                            "type": "image_url",

                            "image_url": {
                                "url": (
                                    f"data:{content_type};"
                                    f"base64,{base64_image}"
                                )
                            }
                        }

                    ]
                }

            ],

            temperature=0.2,

            max_completion_tokens=1024
        )

        # Get AI response
        reply = (
            completion
            .choices[0]
            .message
            .content
        )

        if not reply:
            reply = "I could not understand the image."

        # Save chat history
        save_chat(
            session["username"],
            f"[Image] {message}",
            reply
        )

        return jsonify({
            "reply": reply
        })

    except Exception as e:

        print("IMAGE ANALYSIS ERROR:")
        print(e)

        return jsonify({
            "error": f"Image analysis failed: {str(e)}"
        }), 500


# =========================================================
# 🎤 VOICE TRANSCRIPTION
# Browser MediaRecorder -> Flask -> Groq Whisper
# =========================================================

# ==========================================================
# VOICE TRANSCRIPTION - GROQ WHISPER
# ==========================================================

@app.route("/api/transcribe", methods=["POST"])
@login_required
def transcribe_audio():

    try:

        print("==========================================")
        print("🎤 VOICE TRANSCRIPTION REQUEST")
        print("==========================================")


        # ------------------------------------------
        # Check audio
        # ------------------------------------------

        if "audio" not in request.files:

            print("❌ No audio field")

            return jsonify({
                "success": False,
                "error": "No audio file received."
            }), 400


        audio_file =request.files["audio"]


        if not audio_file:

            return jsonify({
                "success": False,
                "error": "Audio file is empty."
            }), 400


        # ------------------------------------------
        # Read audio
        # ------------------------------------------

        audio_bytes =audio_file.read()


        if not audio_bytes:

            return jsonify({
                "success": False,
                "error": "Audio data is empty."
            }), 400


        print(
            "🎧 Audio bytes:",
            len(audio_bytes)
        )


        # ------------------------------------------
        # Groq Whisper
        # ------------------------------------------

        transcription =client.audio.transcriptions.create(

                file=(
                    "voice.webm",
                    audio_bytes
                ),

                model=
                    "whisper-large-v3-turbo",

                language=
                    "en",

                response_format=
                    "json",

                temperature=
                    0.0
            )


        # ------------------------------------------
        # Get text
        # ------------------------------------------

        text =getattr(
                transcription,
                "text",
                ""
            )


        text =str(
                text or ""
            ).strip()


        print(
            "📝 TRANSCRIBED TEXT:",
            text
        )


        if not text:

            return jsonify({
                "success": False,
                "error": "No speech detected."
            }), 400


        # ------------------------------------------
        # Success
        # ------------------------------------------

        return jsonify({

            "success": True,

            "text": text

        })


    except Exception as e:

        print(
            "❌ VOICE API ERROR:",
            repr(e)
        )


        return jsonify({

            "success": False,

            "error":
                "Voice transcription failed: " +
                str(e)

        }), 500
    # =========================================================
# 🔊 TEXT TO SPEECH - GROQ
# AI reply text -> audio
# =========================================================

@app.route("/api/tts", methods=["POST"])
@login_required
def text_to_speech():

    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data received."
            }), 400

        text = data.get("text", "").strip()

        if not text:
            return jsonify({
                "success": False,
                "error": "No text received."
            }), 400

        # Keep text size reasonable
        text = text[:4000]

        print("🔊 TTS TEXT:", text)

        # Groq Text-to-Speech
        speech_file_path = os.path.join(
            BASE_DIR,
            "static",
            "audio"
        )

        os.makedirs(
            speech_file_path,
            exist_ok=True
        )

        output_file = os.path.join(
            speech_file_path,
            "reply.wav"
        )

        response = client.audio.speech.create(
            model="canopylabs/orpheus-v1-english",
            voice="troy",
            input=text,
            response_format="wav"
        )

        response.write_to_file(output_file)

        print("✅ TTS AUDIO CREATED:", output_file)

        return jsonify({
            "success": True,
            "audio_url": url_for(
                "static",
                filename="audio/reply.wav"
            )
        })

    except Exception as e:

        print("❌ TTS ERROR:", repr(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
# ==========================================
# FILE ANALYSIS API
# ==========================================

@app.route("/api/analyze-file", methods=["POST"])
@login_required
def analyze_file():

    try:

        uploaded_file = request.files.get("file")
        message = request.form.get("message", "").strip()

        if not uploaded_file:

            return jsonify({
                "error": "No file was uploaded."
            }), 400

        if not uploaded_file.filename:

            return jsonify({
                "error": "Invalid filename."
            }), 400

        filename = uploaded_file.filename

        # Read bytes
        file_bytes = uploaded_file.read()

        # Maximum 8 MB
        if len(file_bytes) > 8 * 1024 * 1024:

            return jsonify({
                "error": "File is too large. Maximum size is 8 MB."
            }), 400

        # Decode text files
        try:

            text = file_bytes.decode(
                "utf-8",
                errors="ignore"
            )

        except Exception:

            text = ""

        extension = os.path.splitext(
            filename
        )[1].lower()

        supported_text_files = {

            ".txt",
            ".py",
            ".js",
            ".html",
            ".css",
            ".json",
            ".java",
            ".cpp",
            ".c",
            ".sql",
            ".md",
            ".csv"

        }

        if extension not in supported_text_files:

            return jsonify({

                "reply":
                    f"I received '{filename}', "
                    "but this file type needs a dedicated "
                    "document parser. Text/code files are "
                    "supported currently."

            })

        if not text.strip():

            return jsonify({

                "error":
                    "The uploaded file appears to be empty."

            }), 400

        if not message:

            message = (
                "Analyze this file and explain "
                "the important parts clearly."
            )

        # Limit content sent to AI
        text_for_ai = text[:50000]

        prompt = f"""
User request:
{message}

File name:
{filename}

File content:
{text_for_ai}

Please analyze the file and provide a clear,
useful response.
"""

        reply = get_ai_response(prompt)

        save_chat(
            session["username"],
            f"[File: {filename}] {message}",
            reply
        )

        return jsonify({

            "reply": reply,
            "filename": filename

        })

    except Exception as e:

        print("FILE ANALYSIS ERROR:")
        print(e)

        return jsonify({

            "error":
                f"File analysis failed: {str(e)}"

        }), 500
    
@app.route("/export/pdf")
@login_required
def export_pdf():

    conn = get_db()

    chats = conn.execute(
        """
        SELECT user_message, bot_reply
        FROM chats
        WHERE username=?
        ORDER BY id ASC
        """,
        (session["username"],)
    ).fetchall()

    conn.close()

    pdf_path = export_chat_to_pdf(
        session["username"],
        chats
    )

    return send_file(
        pdf_path,
        as_attachment=True
    )
# ==========================================
# GET CHAT HISTORY
# ==========================================

@app.route("/history")
@login_required
def history():

    conn = get_db()

    chats = conn.execute(
        """
        SELECT *
        FROM chats
        WHERE username=?
        ORDER BY created_at DESC
        """,
        (session["username"],)
    ).fetchall()

    conn.close()

    return render_template(

        "history.html",

        chats=chats

    )

@app.route("/reset-password", methods=["GET","POST"])
def reset_password():
    pass
@app.route("/history-json")
@login_required
def history_json():

    conn = get_db()

    chats = conn.execute(
        """
        SELECT user_message, bot_reply
        FROM chats
        WHERE username=?
        ORDER BY id ASC
        """,
        (session["username"],)
    ).fetchall()

    conn.close()

    return jsonify([
        {
            "user_message": row["user_message"],
            "bot_reply": row["bot_reply"]
        }
        for row in chats
    ])



@app.route("/verify-otp", methods=["GET","POST"])
def verify_otp():
    pass


@app.route("/resend-otp")
def resend_otp():
    pass

@app.route("/theme")
def theme():
    return render_template("theme.html")

@app.route("/typing")
def typing():
    return render_template("typing.html")

@app.route("/voice")
def voice():
    return render_template("voice.html")
# ==========================================
# 500 Error Handler
# ==========================================

@app.errorhandler(500)
def internal_server_error(error):

    return render_template("500.html"), 500
# ==========================================
# 404 Error Handler
# ==========================================

@app.errorhandler(404)
def page_not_found(error):

    return render_template("404.html"), 404

# ==========================================
# DELETE CHAT HISTORY
# ==========================================

@app.route("/delete-history")
@login_required
def delete_history():

    conn = get_db()

    conn.execute(
        """
        DELETE FROM chats
        WHERE username=?
        """,
        (session["username"],)
    )

    conn.commit()

    conn.close()

    flash("Chat history deleted successfully.", "success")

    return redirect(url_for("history"))


# ==========================================
# PROFILE
# ==========================================

@app.route("/profile", methods=["GET", "POST"])
def profile():

    if "user_id" not in session:
        return redirect(url_for("login"))

    conn = get_db()

    user = conn.execute(
        "SELECT * FROM users WHERE id = ?",
        (session["user_id"],)
    ).fetchone()

    if not user:
        conn.close()
        flash("User not found.", "danger")
        return redirect(url_for("login"))

    if request.method == "POST":

        fullname = request.form.get("fullname", "").strip()
        email = request.form.get("email", "").strip()
        phone = request.form.get("phone", "").strip()

        photo = request.files.get("profile_photo")

        profile_photo = user["profile_photo"]

        # SAVE PHOTO
        if photo and photo.filename:

            filename = secure_filename(photo.filename)

            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

            photo_path = os.path.join(
                UPLOAD_FOLDER,
                filename
            )

            photo.save(photo_path)

            profile_photo = f"uploads/profiles/{filename}"

        # UPDATE DATABASE
        conn.execute(
            """
            UPDATE users
            SET fullname = ?,
                email = ?,
                profile_photo = ?
            WHERE id = ?
            """,
            (
                fullname,
                email,
                profile_photo,
                session["user_id"]
            )
        )

        conn.commit()

        user = conn.execute(
            "SELECT * FROM users WHERE id = ?",
            (session["user_id"],)
        ).fetchone()

        conn.close()

        flash("Profile updated successfully!", "success")

        return render_template(
            "profile.html",
            user=user,
            total_chats=0
        )

    conn.close()

    return render_template(
        "profile.html",
        user=user,
        total_chats=0
    )


# ==========================================
# SETTINGS
# ==========================================

@app.route("/settings", methods=["GET", "POST"])
@login_required
def settings():

    if request.method == "POST":

        theme = request.form.get("theme")

        model = request.form.get("ai_model")

        conn = get_db()

        conn.execute(
            """
            UPDATE users
            SET theme=?,
                ai_model=?
            WHERE username=?
            """,
            (
                theme,
                model,
                session["username"]
            )
        )

        conn.commit()

        conn.close()

        session["theme"] = theme
        session["ai_model"] = model

        flash("Settings updated.", "success")

        return redirect(url_for("settings"))

    return render_template(
        "settings.html",
        theme=session.get("theme"),
        model=session.get("ai_model")
    )

from database.db import (
    get_db,
    init_db,
    save_chat,
    get_chat_history,
    delete_chat_history
)


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True
    )