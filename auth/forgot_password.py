# ==========================================
# AI_CHATBOT_PRO
# auth/forgot_password.py
# ==========================================

import random

from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session
)

from flask_mail import Message

from database.db import get_db_connection
from extensions import mail


# ==========================================
# Blueprint
# ==========================================

forgot_bp = Blueprint(
    "forgot",
    __name__
)


# ==========================================
# Generate OTP
# ==========================================

def generate_otp():
    return str(random.randint(100000, 999999))


# ==========================================
# Forgot Password
# ==========================================

@forgot_bp.route(
    "/forgot-password",
    methods=["GET", "POST"]
)
def forgot_password():

    if request.method == "POST":

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        if email == "":

            flash(
                "Please enter your email.",
                "danger"
            )

            return redirect(
                url_for("forgot.forgot_password")
            )

        conn = get_db_connection()

        user = conn.execute(
            """
            SELECT *
            FROM users
            WHERE email=?
            """,
            (email,)
        ).fetchone()

        conn.close()

        if user is None:

            flash(
                "Email is not registered.",
                "danger"
            )

            return redirect(
                url_for("forgot.forgot_password")
            )

        otp = generate_otp()

        session["reset_email"] = email
        session["reset_otp"] = otp

        try:

            msg = Message(
                subject="AI Chatbot Password Reset OTP",
                recipients=[email]
            )

            msg.body = f"""
Hello,

Your One-Time Password (OTP) is:

{otp}

This OTP is valid for 5 minutes.

Do not share this OTP with anyone.

Regards,
AI Chatbot Team
"""

            mail.send(msg)

            flash(
                "OTP sent successfully.",
                "success"
            )

            return redirect(
                url_for("otp.verify_otp")
            )

        except Exception as e:

            print("Mail Error:", e)

            flash(
                "Unable to send OTP.",
                "danger"
            )

            return redirect(
                url_for("forgot.forgot_password")
            )

    return render_template(
        "forgot_password.html"
    )