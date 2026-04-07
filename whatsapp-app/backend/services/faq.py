import os
import json
import google.generativeai as genai
from services.whatsapp import send_text, send_interactive_buttons
from models import ConversationHistory
from extensions import db

SYSTEM_PROMPT = """You are Aria, a friendly and professional sales assistant for Obsidyne, a premium software development and digital marketing agency based in Trivandrum, India.

Your goal is to help potential clients, answer their questions naturally, and capture them as leads.

--- ABOUT OBSIDYNE ---
Website: www.obsidyne.com
Email: info@obsidyne.com
Phone: +91 7994324748
Location: Trivandrum, Kerala, India

Services:
- Software Development: React, Next.js, Django, Flutter, iOS/Android native apps
- UI/UX Design: Figma-driven interfaces focused on conversions
- Digital Marketing: SEO, Social Media Marketing (Instagram, Facebook, LinkedIn), Performance Marketing, Lead Generation, Brand Strategy

Portfolio highlights:
  Education sector: sbce.ac.in, sneskollam.org, sbcs.edu.in, snayurveda.ac.in, snpschathanoor.org
  Corporate sector: lytemaster.com, histare.net, sama-al-nujoom.com
Visit www.obsidyne.com for more.

--- RESPONSE FORMAT ---
Always respond with valid JSON matching this exact schema:
{
  "message": "Your response text (supports WhatsApp markdown: *bold*, _italic_, line breaks with \\n)",
  "tags": [],
  "show_buttons": false,
  "buttons": []
}

--- TAGGING RULES ---
Add tags to "tags" array based on detected intent. Only add when confident. Never duplicate.
- "DEV_INTEREST": User asks about web/mobile development, apps, websites, software
- "MARKETING_INTEREST": User asks about marketing, SEO, ads, social media, leads
- "PORTFOLIO_INTEREST": User asks to see work, portfolio, projects, examples
- "CALL_REQUESTED": User wants to schedule a call, speak to team, get a quote/proposal

--- QUICK REPLY BUTTONS ---
Optionally add 1-3 buttons to guide the user. Titles MUST be 20 characters or less. Use these IDs:
- {"id": "call_request", "title": "Schedule a Call"}
- {"id": "works", "title": "See Portfolio"}
- {"id": "main_menu", "title": "Main Menu"}

Only set show_buttons to true when buttons genuinely help guide the next step.

--- GUIDELINES ---
- Be warm, concise, and professional
- For pricing questions: explain we give custom quotes based on requirements, suggest scheduling a call
- Keep messages under 250 words
- If unclear what the user wants, ask a clarifying question
- Always end with a clear next step or question
- On first message with no prior history, introduce yourself briefly and show the main menu buttons"""

_model = None

def _get_model():
    global _model
    if _model is None:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment")
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json"}
        )
    return _model


def _button_id_to_text(btn_id):
    """Convert a button click into a natural-language message for Gemini context."""
    labels = {
        "expertise":   "Tell me about your software development expertise",
        "marketing":   "Tell me about your digital marketing services",
        "works":       "Show me your portfolio / past projects",
        "call_request": "I'd like to schedule a call with your team",
        "contact":     "What is your contact information?",
        "main_menu":   "Go back to the main menu",
        "next_page":   "Show me more options",
    }
    return labels.get(btn_id, f"I selected option: {btn_id}")


def _add_tags_to_contact(contact, tags_to_add):
    """Merge new tags into the contact record, avoiding duplicates."""
    if not contact or not tags_to_add:
        return
    existing = [t.strip() for t in (contact.tags or "").split(",") if t.strip()]
    changed = False
    for tag in tags_to_add:
        if tag not in existing:
            existing.append(tag)
            changed = True
    if changed:
        contact.tags = ", ".join(existing)
        db.session.commit()


def _fallback_menu(phone):
    """Send the default welcome menu when Gemini is unavailable."""
    send_interactive_buttons(
        phone,
        "Welcome to *Obsidyne!* 🚀\n\nWe build high-performance web/mobile apps and run data-driven digital marketing. How can we help you grow?",
        [
            {"id": "expertise", "title": "Our Expertise"},
            {"id": "works",     "title": "Our Portfolio"},
            {"id": "next_page", "title": "More Options..."}
        ]
    )


def handle_faq(msg, contact):
    phone = msg.get("from")
    msg_type = msg.get("type")

    # --- Resolve user message text ---
    if msg_type == "text":
        user_text = msg.get("text", {}).get("body", "").strip()
        if not user_text:
            return
    elif msg_type == "interactive":
        interactive = msg.get("interactive", {})
        if "button_reply" in interactive:
            btn_id = interactive["button_reply"]["id"]
        elif "list_reply" in interactive:
            btn_id = interactive["list_reply"]["id"]
        else:
            return
        user_text = _button_id_to_text(btn_id)
    else:
        return

    try:
        model = _get_model()

        # --- Load last 20 turns of history ---
        history_rows = (
            ConversationHistory.query
            .filter_by(phone=phone)
            .order_by(ConversationHistory.created_at.asc())
            .limit(40)  # 40 rows = 20 user+model pairs
            .all()
        )
        history = [{"role": r.role, "parts": [r.content]} for r in history_rows]

        # --- Call Gemini ---
        chat = model.start_chat(history=history)
        response = chat.send_message(user_text)
        raw = response.text

        # --- Parse structured response ---
        result = json.loads(raw)
        reply_text   = result.get("message", "")
        tags_to_add  = result.get("tags", [])
        show_buttons = result.get("show_buttons", False)
        buttons      = result.get("buttons", [])

        # --- Persist conversation turn ---
        db.session.add(ConversationHistory(phone=phone, role="user",  content=user_text))
        db.session.add(ConversationHistory(phone=phone, role="model", content=raw))
        db.session.commit()

        # --- Update lead tags ---
        _add_tags_to_contact(contact, tags_to_add)

        # --- Send WhatsApp reply ---
        if show_buttons and buttons and 1 <= len(buttons) <= 3:
            send_interactive_buttons(phone, reply_text, buttons)
        else:
            send_text(phone, reply_text)

    except Exception as e:
        print(f"[Gemini] Error for {phone}: {e}")
        _fallback_menu(phone)
