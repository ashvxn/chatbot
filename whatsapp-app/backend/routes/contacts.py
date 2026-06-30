from flask import Blueprint, request, jsonify
from extensions import db
from models import Contact, CallRequest

contacts_bp = Blueprint("contacts", __name__, url_prefix="/api/contacts")

# Get all contacts
@contacts_bp.route("", methods=["GET"])
def get_contacts():
    contacts = Contact.query.all()

    # Build phone → latest CallRequest map
    call_rows = CallRequest.query.order_by(CallRequest.created_at.desc()).all()
    call_map = {}
    for cr in call_rows:
        if cr.phone not in call_map:
            call_map[cr.phone] = {
                "caller_name":    cr.caller_name,
                "preferred_time": cr.preferred_time,
                "status":         cr.status,
                "created_at":     cr.created_at.isoformat() if cr.created_at else None
            }

    return jsonify([
        {
            "id":           c.id,
            "name":         c.name,
            "phone":        c.phone,
            "opted_in":     c.opted_in,
            "tags":         c.tags,
            "call_request": call_map.get(c.phone)
        } for c in contacts
    ])

# Add a new contact
@contacts_bp.route("", methods=["POST"])
def add_contact():
    data = request.json

    if not data.get("phone"):
        return jsonify({"error": "Phone number required"}), 400

    # Ensure no duplicate phone numbers
    existing = Contact.query.filter_by(phone=data["phone"]).first()
    if existing:
        return jsonify({"error": "Phone number already exists"}), 400

    contact = Contact(
        name=data.get("name"),
        phone=data["phone"],
        opted_in=data.get("opted_in", True),
        tags=data.get("tags", "")
    )

    db.session.add(contact)
    db.session.commit()

    return jsonify({"message": "Contact added"}), 201

# Bulk import contacts
@contacts_bp.route("/bulk", methods=["POST"])
def bulk_import():
    data = request.json
    contacts_data = data.get("contacts", [])
    if not contacts_data:
        return jsonify({"error": "No contacts provided"}), 400

    added = []
    skipped = []

    for item in contacts_data:
        phone = item.get("phone", "").strip()
        if not phone:
            continue
        existing = Contact.query.filter_by(phone=phone).first()
        if existing:
            skipped.append(phone)
            continue
        contact = Contact(
            name=item.get("name") or None,
            phone=phone,
            opted_in=item.get("opted_in", True),
            tags=item.get("tags", "")
        )
        db.session.add(contact)
        added.append(phone)

    db.session.commit()
    return jsonify({
        "added":   len(added),
        "skipped": len(skipped),
        "added_phones":   added,
        "skipped_phones": skipped
    }), 201

# Update a contact
@contacts_bp.route("/<int:id>", methods=["PUT"])
def update_contact(id):
    contact = Contact.query.get_or_404(id)
    data = request.json
    
    contact.name = data.get("name", contact.name)
    contact.phone = data.get("phone", contact.phone)
    contact.tags = data.get("tags", contact.tags)
    
    db.session.commit()
    return jsonify({"message": "Contact updated"})

# Delete a contact
@contacts_bp.route("/<int:id>", methods=["DELETE"])
def delete_contact(id):
    contact = Contact.query.get_or_404(id)
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Contact deleted"})