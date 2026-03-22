from services.whatsapp import send_text, send_interactive_buttons

def handle_faq(message):
    sender = message["from"]

    # 1. MAIN MENU
    if message["type"] == "text":
        send_interactive_buttons(
            sender,
            "Welcome to Obsidyne! 🚀 We specialize in high-performance Web/Mobile Development and data-driven Digital Marketing.\n\nHow can we help you grow today?",
            [
                {"id": "expertise", "title": "Our Expertise"},
                {"id": "works", "title": "Our Portfolio"},
                {"id": "next_page", "title": "More Options..."}
            ]
        )

    # 2. INTERACTIVE BUTTON RESPONSES
    if message["type"] == "interactive":
        try:
            # Handle both list and button replies for robustness
            if "button_reply" in message["interactive"]:
                btn_id = message["interactive"]["button_reply"]["id"]
            elif "list_reply" in message["interactive"]:
                btn_id = message["interactive"]["list_reply"]["id"]
            else:
                return
        except KeyError:
            return
            
        if btn_id == "expertise":
            send_interactive_buttons(
                sender,
                "*Our Core Expertise:*\n\n"
                "🌐 *Software Development:* React, Next.js, Django, Flutter, and iOS/Android native apps.\n\n"
                "🎨 *UI/UX Design:* Professional Figma-driven interfaces focused on conversions.\n\n"
                "Would you like to see our Marketing solutions?",
                [
                    {"id": "marketing", "title": "Digital Marketing"},
                    {"id": "works", "title": "Our Works"},
                    {"id": "main_menu", "title": "Main Menu"}
                ]
            )
            
        elif btn_id == "marketing":
            send_interactive_buttons(
                sender,
                "*Obsidyne Digital Marketing:*\n\n"
                "📈 *SEO & Organic:* Rank #1 on Google and drive consistent, high-quality traffic.\n\n"
                "📱 *Social Media:* Targeted ad campaigns on Instagram, FB & LinkedIn.\n\n"
                "🚀 *Performance:* Data-driven Lead Gen with a focus on high ROI.\n\n"
                "📊 *Strategy:* Full-funnel brand growth and analytics.",
                [
                    {"id": "call_request", "title": "Schedule a Call"},
                    {"id": "works", "title": "View Projects"},
                    {"id": "main_menu", "title": "Main Menu"}
                ]
            )
            
        elif btn_id == "works":
            send_text(sender, (
                "*Some of our notable works include:*\n\n"
                "🎓 *Education:*\n"
                "• https://sbce.ac.in\n"
                "• https://sneskollam.org\n"
                "• https://sbcs.edu.in\n"
                "• https://snayurveda.ac.in\n"
                "• https://snpschathanoor.org\n\n"
                "🌍 *Corporate:*\n"
                "• https://lytemaster.com\n"
                "• https://histare.net\n"
                "• https://sama-al-nujoom.com\n\n"
                "Visit us at www.obsidyne.com for more!"
            ))
            
        elif btn_id == "next_page":
            send_interactive_buttons(
                sender,
                "Here are more ways to connect with us:",
                [
                    {"id": "call_request", "title": "📞 Schedule a Call"},
                    {"id": "contact", "title": "📧 Contact Info"},
                    {"id": "main_menu", "title": "⬅️ Back"}
                ]
            )
            
        elif btn_id == "call_request":
            send_text(sender, (
                "Excellent! We'd love to discuss your vision. 📞\n\n"
                "One of our specialists will reach out to you on this number shortly to schedule a deep-dive call.\n\n"
                "Obsidyne Team"
            ))
            
        elif btn_id == "contact":
            send_text(sender, (
                "*Get in Touch with Obsidyne:*\n\n"
                "📧 Email: info@obsidyne.com\n"
                "📞 Phone: +91 7994324748\n"
                "📍 Location: Trivandrum, India\n\n"
                "Website: www.obsidyne.com"
            ))
            
        elif btn_id == "main_menu":
            handle_faq({"type": "text", "from": sender}) # Trigger welcome message again