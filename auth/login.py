# ==========================================
# AI_CHATBOT_PRO
# auth/login.py
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

from werkzeug.security import check_password_hash

from database.db import get_db_connection


# ==========================================
# Blueprint
# ==========================================

login_bp = Blueprint(
    "login",
    __name__
)


# ==========================================
# Login
# ==========================================

@login_bp.route(
    "/login",
    methods=["GET", "POST"]
)
def login():

    if request.method == "POST":

        username = request.form.get(
            "username",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        )

        if username == "" or password == "":

            flash(
                "Please fill all fields.",
                "danger"
            )

            return redirect(
                url_for("login.login")
            )

        conn = get_db_connection()

        user = conn.execute(
            """
            SELECT *
            FROM users
            WHERE username=?
            OR email=?
            """,
            (
                username,
                username
            )
        ).fetchone()

        conn.close()

        if user is None:

            flash(
                "Invalid Username or Email.",
                "danger"
            )

            return redirect(
                url_for("login.login")
            )

        if not check_password_hash(
            user["password"],
            password
        ):

            flash(
                "Incorrect Password.",
                "danger"
            )

            return redirect(
                url_for("login.login")
            )

        session["user_id"] = user["id"]
        session["fullname"] = user["fullname"]
        session["username"] = user["username"]
        session["email"] = user["email"]

        flash(
            "Login Successful.",
            "success"
        )

        return redirect(
            url_for("dashboard")
        )

    return render_template(
        "login.html"
    )


# ==========================================
# Logout
# ==========================================

@login_bp.route("/logout")
def logout():

    session.clear()

    flash(
        "Logged out successfully.",
        "success"
    )

    return redirect(
        url_for("login.login")
    )