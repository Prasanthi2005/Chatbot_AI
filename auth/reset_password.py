# ==========================================
# AI_CHATBOT_PRO
# auth/reset_password.py
# ==========================================

from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session
)

from werkzeug.security import generate_password_hash

from database.db import get_db_connection


# ==========================================
# Blueprint
# ==========================================

reset_password_bp = Blueprint(
    "reset_password",
    __name__
)


# ==========================================
# Reset Password
# ==========================================

@reset_password_bp.route(
    "/reset-password",
    methods=["GET", "POST"]
)
def reset_password():

    if "reset_email" not in session:

        flash(
            "Please verify your OTP first.",
            "warning"
        )

        return redirect(
            url_for("forgot.forgot_password")
        )

    if request.method == "POST":

        password = request.form.get(
            "password",
            ""
        )

        confirm_password = request.form.get(
            "confirm_password",
            ""
        )

        if password == "" or confirm_password == "":

            flash(
                "Please fill all fields.",
                "danger"
            )

            return redirect(
                url_for("reset_password.reset_password")
            )

        if password != confirm_password:

            flash(
                "Passwords do not match.",
                "danger"
            )

            return redirect(
                url_for("reset_password.reset_password")
            )

        hashed_password = generate_password_hash(password)

        conn = get_db_connection()

        conn.execute(
            """
            UPDATE users
            SET password=?
            WHERE email=?
            """,
            (
                hashed_password,
                session["reset_email"]
            )
        )

        conn.commit()
        conn.close()

        session.pop("reset_email", None)
        session.pop("reset_otp", None)

        flash(
            "Password reset successfully. Please login.",
            "success"
        )

        return redirect(
            url_for("login.login")
        )

    return render_template(
        "reset_password.html"
    )