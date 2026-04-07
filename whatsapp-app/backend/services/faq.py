import os
import json
import google.generativeai as genai
from services.whatsapp import send_text, send_interactive_buttons
from models import ConversationHistory, CallRequest
from extensions import db

SYSTEM_PROMPT = """You are Aria, a warm and professional sales assistant for Obsidyne — a premium software development and digital marketing agency based in Trivandrum, India.

--- ABOUT OBSIDYNE ---
Website: www.obsidyne.com | Email: info@obsidyne.com | Phone: +91 7994324748
Location: Trivandrum, Kerala, India

Services:
- Software Development: React, Next.js, Django, Flutter, iOS/Android native apps
- UI/UX Design: Figma-driven interfaces focused on conversions
- Digital Marketing: SEO, Social Media Marketing (Instagram, Facebook, LinkedIn), Performance Marketing, Lead Generation, Brand Strategy

Portfolio: sbce.ac.in, sneskollam.org, sbcs.edu.in, snayurveda.ac.in, lytemaster.com, histare.net, sama-al-nujoom.com
Full portfolio: www.obsidyne.com

--- RESPONSE FORMAT (always valid JSON) ---
{
  "message": "Your reply text. WhatsApp markdown: *bold*, _italic_, line breaks with \\n",
  "tags": [],
  "show_buttons": false,
  "buttons": [],
  "action": null,
  "action_data": {}
}

--- CONVERSATIONAL RULES (CRITICAL) ---
You are having a REAL conversation, NOT running a menu-driven bot.
- Respond naturally to what the user actually said. Be warm, direct, and human.
- Keep replies SHORT — 2-4 sentences for most messages. Longer only when explaining a specific service.
- Ask only ONE follow-up question per message. Never stack multiple questions.
- Do NOT repeat yourself or summarise what the user just said back to them.
- If the user's intent is unclear, ask ONE specific clarifying question.
- Pricing: we give custom quotes. Suggest a call to discuss requirements.

--- BUTTON RULES (VERY STRICT) ---
show_buttons: true is allowed ONLY in these two situations:
  1. The conversation history passed to you is EMPTY (very first message from this user ever)
  2. The user explicitly asks for a menu: "main menu", "go back", "what can you do", "show options", "what services do you offer" (generic overview, not asking about a specific service)

For EVERY other situation: show_buttons MUST be false and buttons MUST be [].
Do not use buttons just to wrap up a response. End with a natural sentence or question.

When buttons ARE appropriate, use only these (1-3, titles max 20 chars):
- {"id": "call_request", "title": "Schedule a Call"}
- {"id": "works", "title": "See Portfolio"}
- {"id": "main_menu", "title": "Main Menu"}

--- TAGS ---
Add to "tags" array only when clearly detected. Never duplicate.
- "DEV_INTEREST": User asks about web/mobile development, apps, websites, software
- "MARKETING_INTEREST": User asks about marketing, SEO, ads, social media
- "PORTFOLIO_INTEREST": User asks to see work, portfolio, examples
- "CALL_REQUESTED": User expresses interest in a call (before it's scheduled)
- "CALL_SCHEDULED": A call has been successfully confirmed and scheduled

--- CALL SCHEDULING FLOW ---
When a user wants to schedule a call, guide the conversation naturally:

Step 1 — If their name is unknown: Reply warmly and ask for their name.
  Example: "I'd love to set that up! To get started, may I know your name?"

Step 2 — Once name is collected: Ask for their preferred time.
  Example: "Great, [Name]! What time works best for you? We're available Mon–Sat, 10am–6pm IST."

Step 3 — Once time is provided: Confirm and trigger the schedule action.
  Example: "Perfect! I've noted your call request for [time]. Our team will reach out to you on WhatsApp to confirm. Is there anything specific you'd like to discuss?"
  Set: action = "schedule_call", action_data = {"caller_name": "Name", "preferred_time": "their time"}
  Add tag: "CALL_SCHEDULED"

If the user provides both name and time in a single message, skip straight to Step 3.

--- NAME COLLECTION ---
If the user naturally mentions their name during conversation (e.g., "Hi, I'm Rahul"), set:
  action = "update_contact_name", action_data = {"name": "Rahul"}

--- FIRST MESSAGE ---
If history is empty (very first message from this user), write a brief 1-2 sentence intro as Aria, then set show_buttons: true with the 3 main buttons. The intro should be natural and vary — do not copy-paste any fixed template.
If history has any messages, do NOT introduce yourself again. Just respond to what the user said.
"""

_model = None


def _get_model():
    global _model
    if _model is None:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set")
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json"}
        )
    return _model


def _button_id_to_text(btn_id):
    labels = {
        "expertise":    "Tell me about your software development expertise",
        "marketing":    "Tell me about your digital marketing services",
        "works":        "Show me your portfolio and past projects",
        "call_request": "I'd like to schedule a call with your team",
        "contact":      "What is your contact information?",
        "main_menu":    "Show me the main menu",
        "next_page":    "Show me more options",
    }
    return labels.get(btn_id, f"I selected: {btn_id}")


def _add_tags(contact, tags_to_add):
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


def _handle_action(action, action_data, phone, contact):
    """Process structured actions returned by Gemini."""
    if not action:
        return

    if action == "schedule_call":
        caller_name = action_data.get("caller_name") or (contact.name if contact else None) or "Unknown"
        preferred_time = action_data.get("preferred_time", "Not specified")
        call_req = CallRequest(
            phone=phone,
            caller_name=caller_name,
            preferred_time=preferred_time,
            status="pending"
        )
        db.session.add(call_req)
        # Also update contact name if we now know it
        if contact and (not contact.name or contact.name == "New Lead"):
            contact.name = caller_name
        db.session.commit()
        print(f"[CallRequest] Saved: {caller_name} @ {preferred_time} ({phone})")

    elif action == "update_contact_name":
        name = action_data.get("name")
        if contact and name:
            contact.name = name
            db.session.commit()
            print(f"[Contact] Updated name for {phone}: {name}")


def _fallback_menu(phone):
    send_text(phone, "Sorry, I'm having a small hiccup right now. Please try again in a moment, or reach us directly at +91 7994324748.")


def handle_faq(msg, contact):
    phone = msg.get("from")
    msg_type = msg.get("type")

    # Resolve user message text
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

        # Load last 20 conversation turns (40 rows = 20 user+model pairs)
        history_rows = (
            ConversationHistory.query
            .filter_by(phone=phone)
            .order_by(ConversationHistory.created_at.asc())
            .limit(40)
            .all()
        )
        history = [{"role": r.role, "parts": [r.content]} for r in history_rows]

        # Call Gemini
        chat = model.start_chat(history=history)
        response = chat.send_message(user_text)
        raw = response.text

        # Parse structured response
        result = json.loads(raw)
        reply_text   = result.get("message", "")
        tags_to_add  = result.get("tags", [])
        show_buttons = result.get("show_buttons", False)
        buttons      = result.get("buttons", [])
        action       = result.get("action")
        action_data  = result.get("action_data") or {}

        # Persist conversation turn
        db.session.add(ConversationHistory(phone=phone, role="user",  content=user_text))
        db.session.add(ConversationHistory(phone=phone, role="model", content=raw))
        db.session.commit()

        # Apply tags and actions
        _add_tags(contact, tags_to_add)
        _handle_action(action, action_data, phone, contact)

        # Send WhatsApp reply
        if show_buttons and buttons and 1 <= len(buttons) <= 3:
            send_interactive_buttons(phone, reply_text, buttons)
        else:
            send_text(phone, reply_text)

    except Exception as e:
        print(f"[Gemini] Error for {phone}: {e}")
        _fallback_menu(phone)
