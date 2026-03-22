def get_conversation_cost(phone, category="marketing"):
    """
    Returns the estimated cost of a WhatsApp conversation based on Meta's 2026 pricing.
    """
    # Detect Country Code
    is_india = phone.startswith("91")
    
    rates = {
        "india": {
            "marketing": 0.009, 
            "utility": 0.004,   
            "service": 0.000    # SET TO 0.00 BECAUSE OF 1,000 FREE LIMIT
        },
        "global": {
            "marketing": 0.045,
            "utility": 0.020,
            "service": 0.000    # SET TO 0.00 BECAUSE OF 1,000 FREE LIMIT
        }
    }
    
    region = "india" if is_india else "global"
    return rates[region].get(category.lower(), rates[region]["marketing"])

def estimate_campaign_cost(contact_count, phone_list, category="marketing"):
    total = 0
    for phone in phone_list:
        total += get_conversation_cost(phone, category)
    return round(total, 4)