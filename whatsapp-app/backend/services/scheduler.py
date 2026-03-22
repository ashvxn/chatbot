import time
import threading
from datetime import datetime
from extensions import db
from models import Campaign, Contact, CampaignRecipient
from services.whatsapp import send_template, send_text, send_image
from services.pricing import get_conversation_cost

def extract_message_id(response):
    try:
        data = response.json()
        if "messages" in data and len(data["messages"]) > 0:
            return data["messages"][0]["id"]
    except Exception:
        pass
    return None

def process_campaigns(app):
    with app.app_context():
        while True:
            try:
                now = datetime.utcnow()
                campaigns = Campaign.query.filter(
                    Campaign.status == "scheduled",
                    (Campaign.scheduled_at.is_(None)) | (Campaign.scheduled_at <= now)
                ).all()

                for campaign in campaigns:
                    campaign.status = "processing"
                    db.session.commit()
                    
                    try:
                        tag = campaign.payload.get("tag")
                        message = campaign.payload.get("message")
                        image_url = campaign.payload.get("image_url")
                        
                        query = Contact.query.filter_by(opted_in=True)
                        if tag:
                            query = query.filter(Contact.tags.like(f"%{tag}%"))
                        
                        contacts = query.all()
                        total_campaign_cost = 0.0
                        
                        for contact in contacts:
                            # Detect Category
                            is_custom = campaign.template_name.startswith("CUSTOM_")
                            category = "service" if is_custom else "marketing"
                            
                            cost = get_conversation_cost(contact.phone, category)
                            total_campaign_cost += cost

                            response = None
                            if campaign.template_name == "CUSTOM_TEXT":
                                response = send_text(contact.phone, message)
                            elif campaign.template_name == "CUSTOM_IMAGE":
                                response = send_image(contact.phone, image_url, caption=message)
                            else:
                                response = send_template(contact.phone, campaign.template_name, image_url, message)
                            
                            msg_id = extract_message_id(response)
                            if msg_id:
                                recipient = CampaignRecipient(
                                    campaign_id=campaign.id,
                                    contact_id=contact.id,
                                    whatsapp_msg_id=msg_id,
                                    status="sent",
                                    estimated_cost=cost
                                )
                                db.session.add(recipient)
                        
                        campaign.total_estimated_cost = total_campaign_cost
                        campaign.status = "completed"
                    except Exception as e:
                        print(f"Error processing campaign {campaign.id}: {e}")
                        campaign.status = "failed"
                    
                    db.session.commit()
            except Exception as e:
                print(f"Scheduler error: {e}")
            time.sleep(10)

def start_scheduler(app):
    thread = threading.Thread(target=process_campaigns, args=(app,), daemon=True)
    thread.start()