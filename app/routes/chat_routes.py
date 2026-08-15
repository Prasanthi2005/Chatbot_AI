from flask import Blueprint, request, jsonify
from app.routes.ai_service import generate_ai_response

chat_bp = Blueprint("chat_bp", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def api_chat():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "reply": "Invalid request."
        }), 400

    message = str(data.get("message", "")).strip()

    if not message:
        return jsonify({
            "success": False,
            "reply": "Please enter a message."
        }), 400

    try:

        print("USER:", message)

        reply = generate_ai_response(message)

        print("AI:", reply)

        return jsonify({
            "success": True,
            "reply": reply
        })

    except Exception as e:

        print("CHAT ERROR:", e)

        return jsonify({
            "success": False,
            "reply": f"AI service error: {str(e)}"
        }), 500