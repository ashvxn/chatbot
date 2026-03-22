import sqlite3
import os

db_path = 'whatsapp-app/backend/instance/db.sqlite3'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add category to campaign
    try:
        cursor.execute('ALTER TABLE campaign ADD COLUMN category VARCHAR(20) DEFAULT "marketing"')
        print("Added category column to campaign table.")
    except sqlite3.OperationalError:
        print("category column already exists.")

    # Add total_estimated_cost to campaign
    try:
        cursor.execute('ALTER TABLE campaign ADD COLUMN total_estimated_cost FLOAT DEFAULT 0.0')
        print("Added total_estimated_cost column to campaign table.")
    except sqlite3.OperationalError:
        print("total_estimated_cost column already exists.")

    # Add estimated_cost to campaign_recipient
    try:
        cursor.execute('ALTER TABLE campaign_recipient ADD COLUMN estimated_cost FLOAT DEFAULT 0.0')
        print("Added estimated_cost column to campaign_recipient table.")
    except sqlite3.OperationalError:
        print("estimated_cost column already exists.")

    conn.commit()
    conn.close()
    print("Database migration completed.")
else:
    print(f"Database not found at {db_path}")
