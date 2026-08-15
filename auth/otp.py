# ==========================================
# AI_CHATBOT_PRO
# auth/otp.py
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

# ==========================================
# Blueprint
# ==========================================

otp_bp = Blueprint(
    "otp",
    __name__
)

# ==========================================
# Verify OTP
# ==========================================

@otp_bp.route(
    "/verify-otp",
    methods=["GET", "POST"]
)
def verify_otp():

    if "reset_email" not in session:

        flash(
            "Please request OTP first.",
            "warning"
        )

        return redirect(
            url_for("forgot.forgot_password")
        )

    if request.method == "POST":

        user_otp = request.form.get(
            "otp",
            ""
        ).strip()

        saved_otp = session.get(
            "reset_otp"
        )

        if user_otp == "":

            flash(
                "Please enter OTP.",
                "danger"
            )

            return redirect(
                url_for("otp.verify_otp")
            )

        if user_otp != saved_otp:

            flash(
                "Invalid OTP.",
                "danger"
            )

            return redirect(
                url_for("otp.verify_otp")
            )

        flash(
            "OTP Verified Successfully.",
            "success"
        )

        return redirect(
            url_for("reset_password.reset_password")
        )

    return render_template(
        "verify_otp.html"
    )