from flask import Blueprint, jsonify
from extensions import db
from models import Campaign, CampaignRecipient
from sqlalchemy import func

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/overview", methods=["GET"])
def get_overview():
    # 1. Total Spend (Math foundation)
    total_spend = db.session.query(func.sum(Campaign.total_estimated_cost)).scalar() or 0
    
    # 2. Detailed Breakdown
    marketing_spend = db.session.query(func.sum(Campaign.total_estimated_cost)).filter(Campaign.category == 'marketing').scalar() or 0
    service_spend = db.session.query(func.sum(Campaign.total_estimated_cost)).filter(Campaign.category == 'service').scalar() or 0
    utility_spend = db.session.query(func.sum(Campaign.total_estimated_cost)).filter(Campaign.category == 'utility').scalar() or 0
    
    # Capture any campaigns that might have missed a category label
    other_spend = total_spend - (marketing_spend + service_spend + utility_spend)
    if other_spend < 0.0001: other_spend = 0 # Clean up floating point math
    
    # 3. Efficiency Metrics
    total_sent = CampaignRecipient.query.count()
    total_read = CampaignRecipient.query.filter_by(status='read').count()
    
    cost_per_read = (total_spend / total_read) if total_read > 0 else 0
    
    # 4. Recent Campaigns Spend
    recent_campaigns = Campaign.query.order_by(Campaign.id.desc()).limit(5).all()
    
    return jsonify({
        "total_spend": round(total_spend, 3),
        "breakdown": {
            "marketing": round(marketing_spend, 3),
            "service": round(service_spend, 3),
            "utility": round(utility_spend, 3),
            "other": round(other_spend, 3)
        },
        "performance": {
            "total_sent": total_sent,
            "total_read": total_read,
            "cost_per_read": round(cost_per_read, 3)
        },
        "recent": [
            {"id": c.id, "name": c.template_name, "cost": round(c.total_estimated_cost, 3)}
            for c in recent_campaigns
        ]
    })