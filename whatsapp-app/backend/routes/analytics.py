from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from extensions import db
from models import Campaign, CampaignRecipient, Contact
from sqlalchemy import func, case

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/overview", methods=["GET"])
def get_overview():
    # ── Core KPIs ─────────────────────────────────────────────
    total_spend      = db.session.query(func.sum(Campaign.total_estimated_cost)).scalar() or 0
    total_campaigns  = Campaign.query.filter(Campaign.status.in_(['completed', 'partial', 'failed'])).count()
    total_sent       = CampaignRecipient.query.count()
    total_delivered  = CampaignRecipient.query.filter(CampaignRecipient.status.in_(['delivered', 'read'])).count()
    total_read       = CampaignRecipient.query.filter_by(status='read').count()
    active_contacts  = Contact.query.filter_by(opted_in=True).count()

    read_rate      = round(total_read / total_sent * 100, 1) if total_sent else 0
    delivery_rate  = round(total_delivered / total_sent * 100, 1) if total_sent else 0
    cost_per_read  = round(total_spend / total_read, 4) if total_read else 0

    # ── Campaign status distribution ──────────────────────────
    status_rows    = db.session.query(Campaign.status, func.count(Campaign.id)).group_by(Campaign.status).all()
    campaign_status = {s: c for s, c in status_rows}

    # ── Spend + reach by category ─────────────────────────────
    cat_rows = db.session.query(
        Campaign.category,
        func.sum(Campaign.total_estimated_cost).label('spend'),
        func.count(func.distinct(Campaign.id)).label('campaigns'),
        func.count(CampaignRecipient.id).label('sent'),
        func.sum(case((CampaignRecipient.status == 'read', 1), else_=0)).label('read')
    ).outerjoin(CampaignRecipient, Campaign.id == CampaignRecipient.campaign_id
    ).filter(Campaign.status.in_(['completed', 'partial'])
    ).group_by(Campaign.category).all()

    breakdown = {}
    for row in cat_rows:
        cat = row.category or 'other'
        breakdown[cat] = {
            "spend":     round(float(row.spend or 0), 3),
            "campaigns": row.campaigns or 0,
            "sent":      row.sent or 0,
            "read":      row.read or 0
        }

    # ── Top 10 campaigns by reach ─────────────────────────────
    top_rows = db.session.query(
        Campaign,
        func.count(CampaignRecipient.id).label('sent_count'),
        func.sum(case((CampaignRecipient.status.in_(['delivered', 'read']), 1), else_=0)).label('delivered_count'),
        func.sum(case((CampaignRecipient.status == 'read', 1), else_=0)).label('read_count')
    ).outerjoin(CampaignRecipient, Campaign.id == CampaignRecipient.campaign_id
    ).filter(Campaign.status.in_(['completed', 'partial'])
    ).group_by(Campaign.id
    ).order_by(func.count(CampaignRecipient.id).desc()
    ).limit(10).all()

    top_campaigns = []
    for c, sent_c, del_c, read_c in top_rows:
        sent_c = sent_c or 0
        read_c = read_c or 0
        del_c  = del_c or 0
        top_campaigns.append({
            "id":        c.id,
            "name":      c.template_name,
            "sent":      sent_c,
            "delivered": del_c,
            "read":      read_c,
            "read_rate": round(read_c / sent_c * 100, 1) if sent_c else 0,
            "cost":      round(c.total_estimated_cost or 0, 3),
            "status":    c.status,
            "date":      c.created_at.isoformat() if c.created_at else None
        })

    # ── Daily trend – last 30 days ────────────────────────────
    since = datetime.utcnow() - timedelta(days=30)
    trend_rows = db.session.query(
        func.strftime('%Y-%m-%d', Campaign.created_at).label('date'),
        func.sum(Campaign.total_estimated_cost).label('spend'),
        func.count(func.distinct(Campaign.id)).label('campaigns'),
        func.count(CampaignRecipient.id).label('sent'),
        func.sum(case((CampaignRecipient.status == 'read', 1), else_=0)).label('read')
    ).outerjoin(CampaignRecipient, Campaign.id == CampaignRecipient.campaign_id
    ).filter(
        Campaign.created_at.isnot(None),
        Campaign.created_at >= since,
        Campaign.status.in_(['completed', 'partial'])
    ).group_by('date').order_by('date').all()

    daily_trend = [{
        "date":      row.date,
        "spend":     round(float(row.spend or 0), 3),
        "campaigns": row.campaigns or 0,
        "sent":      row.sent or 0,
        "read":      row.read or 0
    } for row in trend_rows]

    return jsonify({
        "kpis": {
            "total_spend":      round(total_spend, 3),
            "total_campaigns":  total_campaigns,
            "total_sent":       total_sent,
            "total_delivered":  total_delivered,
            "total_read":       total_read,
            "read_rate":        read_rate,
            "delivery_rate":    delivery_rate,
            "cost_per_read":    cost_per_read,
            "active_contacts":  active_contacts
        },
        "campaign_status": campaign_status,
        "breakdown":       breakdown,
        "top_campaigns":   top_campaigns,
        "daily_trend":     daily_trend,
        "funnel": {
            "sent":      total_sent,
            "delivered": total_delivered,
            "read":      total_read
        }
    })
