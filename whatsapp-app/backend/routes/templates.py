from flask import Blueprint, jsonify

templates_bp = Blueprint("templates", __name__, url_prefix="/api/templates")

# List of templates (Now matching the Meta ones)
TEMPLATES = [
    {
        "name": "campaign_poster",
        "type": "image",
        "label": "Poster + Text Blast"
    },
    {
        "name": "campaign_text",
        "type": "text",
        "label": "Text Blast Only"
    },
    {
        "name": "faq_menu",
        "type": "button",
        "label": "Interactive FAQ Menu"
    }
]

@templates_bp.route("", methods=["GET"])
def list_templates():
    return jsonify(TEMPLATES)