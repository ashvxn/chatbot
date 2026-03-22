from extensions import db
from datetime import datetime

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20), unique=True)
    opted_in = db.Column(db.Boolean, default=True)
    tags = db.Column(db.String(255))
    received_campaigns = db.relationship('CampaignRecipient', backref='contact', cascade="all, delete-orphan", lazy=True)

class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    template_name = db.Column(db.String(100))
    payload = db.Column(db.JSON)
    scheduled_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default="scheduled")
    category = db.Column(db.String(20), default="marketing") # marketing, utility, service
    total_estimated_cost = db.Column(db.Float, default=0.0)
    recipients = db.relationship('CampaignRecipient', backref='campaign', cascade="all, delete-orphan", lazy=True)

class CampaignRecipient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=False)
    whatsapp_msg_id = db.Column(db.String(100), unique=True)
    status = db.Column(db.String(20), default="sent") 
    estimated_cost = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)