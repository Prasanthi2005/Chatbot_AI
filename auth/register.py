# ==========================================
# AI_CHATBOT_PRO
# auth/register.py
# ==========================================

from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash
)

from werkzeug.security import generate_password_hash

from database.db import get_db_connection


# ==========================================
# Blueprint
# ==========================================

register_bp = Blueprint(
    "register",
    __name__
)


# ==========================================
# Register
# ==========================================

@register_bp.route(
    "/register",
    methods=["GET", "POST"]
)
def register():

    if request.method == "POST":

        fullname = request.form.get(
            "fullname",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        username = request.form.get(
            "username",
            ""
        ).strip().lower()

        password = request.form.get(
            "password",
            ""
        )

        confirm_password = request.form.get(
            "confirm_password",
            ""
        )

        # Validation

        if (
            fullname == "" or
            email == "" or
            username == "" or
            password == "" or
            confirm_password == ""
        ):

            flash(
                "Please fill all fields.",
                "danger"
            )

            return redirect(
                url_for("register.register")
            )

        if password != confirm_password:

            flash(
                "Passwords do not match.",
                "danger"
            )

            return redirect(
                url_for("register.register")
            )

        conn = get_db_connection()

        existing_user = conn.execute(
            """
            SELECT *
            FROM users
            WHERE email=?
            OR username=?
            """,
            (
                email,
                username
            )
        ).fetchone()

        if existing_user:

            conn.close()

            flash(
                "Email or Username already exists.",
                "warning"
            )

            return redirect(
                url_for("register.register")
            )

        hashed_password = generate_password_hash(password)

        conn.execute(
            """
            INSERT INTO users
            (
                fullname,
                email,
                username,
                password
            )
            VALUES
            (?, ?, ?, ?)
            """,
            (
                fullname,
                email,
                username,
                hashed_password
            )
        )

        conn.commit()

        conn.close()

        flash(
            "Registration Successful. Please Login.",
            "success"
        )

        return redirect(
            url_for("login.login")
        )

    return render_template(
        "register.html"
    )