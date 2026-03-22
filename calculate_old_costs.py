import sqlite3
import os

db_path = 'whatsapp-app/backend/instance/db.sqlite3'

def get_cost(phone, category):
    is_india = str(phone).startswith("91")
    rates = {
        "india": {"marketing": 0.009, "utility": 0.004, "service": 0.003},
        "global": {"marketing": 0.045, "utility": 0.020, "service": 0.015}
    }
    region = "india" if is_india else "global"
    return rates[region].get(category, 0.009)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Update individual recipient costs
    cursor.execute("SELECT id, contact_id, campaign_id FROM campaign_recipient WHERE estimated_cost = 0")
    recipients = cursor.fetchall()
    
    for r_id, contact_id, campaign_id in recipients:
        cursor.execute("SELECT phone FROM contact WHERE id = ?", (contact_id,))
        phone = cursor.fetchone()[0]
        
        cursor.execute("SELECT template_name FROM campaign WHERE id = ?", (campaign_id,))
        temp_name = cursor.fetchone()[0]
        category = "service" if "CUSTOM" in temp_name else "marketing"
        
        cost = get_cost(phone, category)
        cursor.execute("UPDATE campaign_recipient SET estimated_cost = ? WHERE id = ?", (cost, r_id))

    # 2. Update total campaign costs
    cursor.execute("SELECT id FROM campaign")
    campaigns = cursor.fetchall()
    
    for (c_id,) in campaigns:
        cursor.execute("SELECT SUM(estimated_cost) FROM campaign_recipient WHERE campaign_id = ?", (c_id,))
        total = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT template_name FROM campaign WHERE id = ?", (c_id,))
        temp_name = cursor.fetchone()[0]
        category = "service" if "CUSTOM" in temp_name else "marketing"
        
        cursor.execute("UPDATE campaign SET total_estimated_cost = ?, category = ? WHERE id = ?", (total, category, c_id))

    conn.commit()
    conn.close()
    print("Retroactive cost calculation complete!")
else:
    print("Database not found.")
