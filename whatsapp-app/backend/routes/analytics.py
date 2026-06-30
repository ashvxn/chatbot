import requests as http_requests
from flask import Blueprint, jsonify, request, current_app
from datetime import datetime, timedelta
from extensions import db
from models import Campaign, CampaignRecipient, Contact, ConversationHistory, CallRequest
from sqlalchemy import func, case, distinct

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@analytics_bp.route("/overview", methods=["GET"])
def get_overview():
    range_days = min(max(int(request.args.get("range", 30)), 7), 90)
    since = datetime.utcnow() - timedelta(days=range_days)

    # ── Campaign KPIs ──────────────────────────────────────────────
    total_spend     = float(db.session.query(func.sum(Campaign.total_estimated_cost)).scalar() or 0)
    total_campaigns = Campaign.query.filter(Campaign.status.in_(["completed", "partial", "failed"])).count()
    total_sent      = CampaignRecipient.query.count()
    total_delivered = CampaignRecipient.query.filter(CampaignRecipient.status.in_(["delivered", "read"])).count()
    total_read      = CampaignRecipient.query.filter_by(status="read").count()
    total_failed    = CampaignRecipient.query.filter_by(status="failed").count()
    active_contacts = Contact.query.filter_by(opted_in=True).count()

    read_rate     = round(total_read / total_sent * 100, 1) if total_sent else 0
    delivery_rate = round(total_delivered / total_sent * 100, 1) if total_sent else 0
    cost_per_read = round(total_spend / total_read, 2) if total_read else 0
    cost_per_sent = round(total_spend / total_sent, 4) if total_sent else 0

    # ── Lead analytics ─────────────────────────────────────────────
    total_contacts      = Contact.query.count()
    qualified_leads     = Contact.query.filter(Contact.tags.like("%QUALIFIED_LEAD%")).count()
    call_req_contacts   = Contact.query.filter(Contact.tags.like("%CALL_REQUESTED%")).count()
    call_sched_contacts = Contact.query.filter(Contact.tags.like("%CALL_SCHEDULED%")).count()
    dev_interest        = Contact.query.filter(Contact.tags.like("%DEV_INTEREST%")).count()
    mkt_interest        = Contact.query.filter(Contact.tags.like("%MARKETING_INTEREST%")).count()
    auto_interest       = Contact.query.filter(Contact.tags.like("%AUTOMATION_INTEREST%")).count()
    cost_per_lead       = round(total_spend / qualified_leads, 2) if qualified_leads else 0

    # New contacts in range: first-time messagers
    old_phones = db.session.query(ConversationHistory.phone).filter(
        ConversationHistory.created_at < since
    ).distinct().subquery()
    new_contacts_in_range = db.session.query(
        func.count(distinct(ConversationHistory.phone))
    ).filter(
        ConversationHistory.created_at >= since,
        ~ConversationHistory.phone.in_(old_phones)
    ).scalar() or 0

    # ── Call request pipeline ──────────────────────────────────────
    call_rows = db.session.query(
        CallRequest.status, func.count(CallRequest.id)
    ).group_by(CallRequest.status).all()
    call_pipeline = {s: c for s, c in call_rows}

    # ── Conversation analytics ─────────────────────────────────────
    total_conversations  = db.session.query(func.count(distinct(ConversationHistory.phone))).scalar() or 0
    total_bot_messages   = ConversationHistory.query.filter_by(role="model").count()
    total_user_messages  = ConversationHistory.query.filter_by(role="user").count()
    active_in_range      = db.session.query(
        func.count(distinct(ConversationHistory.phone))
    ).filter(ConversationHistory.created_at >= since).scalar() or 0

    # ── Tag distribution ───────────────────────────────────────────
    tagged_contacts = Contact.query.filter(Contact.tags.isnot(None), Contact.tags != "").all()
    tag_counts = {}
    for c in tagged_contacts:
        for t in c.tags.split(","):
            t = t.strip()
            if t:
                tag_counts[t] = tag_counts.get(t, 0) + 1
    tag_distribution = sorted(
        [{"tag": k, "count": v} for k, v in tag_counts.items()],
        key=lambda x: -x["count"]
    )

    # ── Campaign status breakdown ──────────────────────────────────
    status_rows = db.session.query(Campaign.status, func.count(Campaign.id)).group_by(Campaign.status).all()
    campaign_status = {s: c for s, c in status_rows}

    # ── Category breakdown ─────────────────────────────────────────
    cat_spend_rows = db.session.query(
        Campaign.category,
        func.sum(Campaign.total_estimated_cost).label("spend"),
        func.count(Campaign.id).label("campaigns")
    ).filter(Campaign.status.in_(["completed", "partial"])).group_by(Campaign.category).all()

    cat_stat_rows = db.session.query(
        Campaign.category,
        func.count(CampaignRecipient.id).label("sent"),
        func.sum(case((CampaignRecipient.status.in_(["delivered", "read"]), 1), else_=0)).label("delivered"),
        func.sum(case((CampaignRecipient.status == "read", 1), else_=0)).label("read"),
        func.sum(case((CampaignRecipient.status == "failed", 1), else_=0)).label("failed")
    ).join(Campaign, CampaignRecipient.campaign_id == Campaign.id
    ).filter(Campaign.status.in_(["completed", "partial"])
    ).group_by(Campaign.category).all()

    cat_stats = {
        r.category: {"sent": r.sent or 0, "delivered": r.delivered or 0, "read": r.read or 0, "failed": r.failed or 0}
        for r in cat_stat_rows
    }
    breakdown = {}
    for row in cat_spend_rows:
        cat = row.category or "other"
        stats = cat_stats.get(cat, {"sent": 0, "delivered": 0, "read": 0, "failed": 0})
        s = stats["sent"]
        breakdown[cat] = {
            "spend":     round(float(row.spend or 0), 2),
            "campaigns": row.campaigns or 0,
            "sent":      s,
            "delivered": stats["delivered"],
            "read":      stats["read"],
            "failed":    stats["failed"],
            "read_rate": round(stats["read"] / s * 100, 1) if s else 0
        }

    # ── Top 10 campaigns ──────────────────────────────────────────
    top_rows = db.session.query(
        Campaign,
        func.count(CampaignRecipient.id).label("sent_count"),
        func.sum(case((CampaignRecipient.status.in_(["delivered", "read"]), 1), else_=0)).label("del_count"),
        func.sum(case((CampaignRecipient.status == "read", 1), else_=0)).label("read_count"),
        func.sum(case((CampaignRecipient.status == "failed", 1), else_=0)).label("fail_count")
    ).outerjoin(CampaignRecipient, Campaign.id == CampaignRecipient.campaign_id
    ).filter(Campaign.status.in_(["completed", "partial"])
    ).group_by(Campaign.id
    ).order_by(func.count(CampaignRecipient.id).desc()
    ).limit(10).all()

    top_campaigns = []
    best_rr, best_id = 0, None
    for c, sc, dc, rc, fc in top_rows:
        sc = sc or 0; dc = dc or 0; rc = rc or 0; fc = fc or 0
        rr = round(rc / sc * 100, 1) if sc else 0
        dr = round(dc / sc * 100, 1) if sc else 0
        if rr > best_rr and sc >= 3:
            best_rr = rr; best_id = c.id
        top_campaigns.append({
            "id":            c.id,
            "name":          c.template_name,
            "sent":          sc,
            "delivered":     dc,
            "read":          rc,
            "failed":        fc,
            "read_rate":     rr,
            "delivery_rate": dr,
            "cost":          round(c.total_estimated_cost or 0, 2),
            "category":      c.category or "other",
            "status":        c.status,
            "date":          c.created_at.isoformat() if c.created_at else None,
            "is_best":       False
        })
    for c in top_campaigns:
        c["is_best"] = (c["id"] == best_id)

    # ── Daily trend – fill ALL dates in range ──────────────────────
    all_dates = {}
    cur = since.date()
    end_date = datetime.utcnow().date()
    while cur <= end_date:
        ds = cur.strftime("%Y-%m-%d")
        all_dates[ds] = {"date": ds, "spend": 0.0, "campaigns": 0, "sent": 0, "delivered": 0, "read": 0, "failed": 0, "unique_chats": 0, "user_messages": 0}
        cur += timedelta(days=1)

    trend_spend_rows = db.session.query(
        func.strftime("%Y-%m-%d", Campaign.created_at).label("date"),
        func.sum(Campaign.total_estimated_cost).label("spend"),
        func.count(Campaign.id).label("campaigns")
    ).filter(
        Campaign.created_at.isnot(None),
        Campaign.created_at >= since,
        Campaign.status.in_(["completed", "partial"])
    ).group_by("date").all()

    for row in trend_spend_rows:
        if row.date in all_dates:
            all_dates[row.date]["spend"]     = round(float(row.spend or 0), 2)
            all_dates[row.date]["campaigns"] = row.campaigns or 0

    trend_stat_rows = db.session.query(
        func.strftime("%Y-%m-%d", Campaign.created_at).label("date"),
        func.count(CampaignRecipient.id).label("sent"),
        func.sum(case((CampaignRecipient.status.in_(["delivered", "read"]), 1), else_=0)).label("delivered"),
        func.sum(case((CampaignRecipient.status == "read", 1), else_=0)).label("read"),
        func.sum(case((CampaignRecipient.status == "failed", 1), else_=0)).label("failed")
    ).join(Campaign, CampaignRecipient.campaign_id == Campaign.id
    ).filter(
        Campaign.created_at.isnot(None),
        Campaign.created_at >= since,
        Campaign.status.in_(["completed", "partial"])
    ).group_by("date").all()

    for r in trend_stat_rows:
        if r.date in all_dates:
            all_dates[r.date].update({"sent": r.sent or 0, "delivered": r.delivered or 0, "read": r.read or 0, "failed": r.failed or 0})

    conv_rows = db.session.query(
        func.strftime("%Y-%m-%d", ConversationHistory.created_at).label("date"),
        func.count(distinct(ConversationHistory.phone)).label("unique_chats"),
        func.sum(case((ConversationHistory.role == "user", 1), else_=0)).label("user_msgs")
    ).filter(ConversationHistory.created_at >= since).group_by("date").all()

    for r in conv_rows:
        if r.date in all_dates:
            all_dates[r.date]["unique_chats"]   = r.unique_chats or 0
            all_dates[r.date]["user_messages"]  = r.user_msgs or 0

    daily_trend = sorted(all_dates.values(), key=lambda x: x["date"])

    return jsonify({
        "range_days": range_days,
        "kpis": {
            "total_spend":      round(total_spend, 2),
            "total_campaigns":  total_campaigns,
            "total_sent":       total_sent,
            "total_delivered":  total_delivered,
            "total_read":       total_read,
            "total_failed":     total_failed,
            "read_rate":        read_rate,
            "delivery_rate":    delivery_rate,
            "cost_per_read":    cost_per_read,
            "cost_per_sent":    cost_per_sent,
            "active_contacts":  active_contacts,
        },
        "lead_kpis": {
            "total_contacts":       total_contacts,
            "qualified_leads":      qualified_leads,
            "call_req_contacts":    call_req_contacts,
            "call_sched_contacts":  call_sched_contacts,
            "dev_interest":         dev_interest,
            "mkt_interest":         mkt_interest,
            "auto_interest":        auto_interest,
            "cost_per_lead":        cost_per_lead,
            "new_in_range":         new_contacts_in_range,
        },
        "conversation_kpis": {
            "total_conversations":  total_conversations,
            "total_bot_messages":   total_bot_messages,
            "total_user_messages":  total_user_messages,
            "active_in_range":      active_in_range,
        },
        "call_pipeline":   call_pipeline,
        "tag_distribution": tag_distribution,
        "campaign_status":  campaign_status,
        "breakdown":        breakdown,
        "top_campaigns":    top_campaigns,
        "daily_trend":      daily_trend,
        "funnel": {
            "sent":      total_sent,
            "delivered": total_delivered,
            "read":      total_read,
            "failed":    total_failed,
        }
    })


TIER_LABELS = {
    "TIER_1K":        "1,000 / day",
    "TIER_10K":       "10,000 / day",
    "TIER_100K":      "100,000 / day",
    "TIER_UNLIMITED": "Unlimited",
    "TIER_NOT_SET":   "Not set",
}


@analytics_bp.route("/phone-status", methods=["GET"])
def get_phone_status():
    token    = current_app.config.get("WHATSAPP_TOKEN")
    phone_id = current_app.config.get("PHONE_NUMBER_ID")

    if not token or not phone_id:
        return jsonify({"error": "WhatsApp not configured"}), 400

    try:
        resp = http_requests.get(
            f"https://graph.facebook.com/v21.0/{phone_id}",
            params={
                "fields": "quality_rating,messaging_limit_tier,display_phone_number,verified_name,code_verification_status",
                "access_token": token,
            },
            timeout=6,
        )
        data = resp.json()
        if "error" in data:
            return jsonify({"error": data["error"].get("message", "Meta API error")}), 400

        tier_raw = data.get("messaging_limit_tier", "TIER_NOT_SET")
        return jsonify({
            "phone":    data.get("display_phone_number", ""),
            "name":     data.get("verified_name", ""),
            "quality":  data.get("quality_rating", "UNKNOWN"),   # GREEN / YELLOW / RED / UNKNOWN
            "tier":     tier_raw,
            "tier_label": TIER_LABELS.get(tier_raw, tier_raw),
            "verified": data.get("code_verification_status") == "VERIFIED",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
