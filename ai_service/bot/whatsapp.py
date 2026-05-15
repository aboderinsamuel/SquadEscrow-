import json
import time
import random
import uuid

def generate_id(prefix="u"):
    return f"{prefix}_{uuid.uuid4().hex[:16]}"

def process_whatsapp_message(payload: dict, db_path: str):
    """
    Mock implementation of a WhatsApp webhook handler.
    In a real app, this would:
    1. Download the audio note / image from Twilio or Meta WhatsApp API.
    2. Transcribe the audio using Whisper.
    3. Use an LLM (e.g. OpenAI/Llama) to extract: business_name, category, services, location.
    4. Save to the database.
    """
    print("Processing WhatsApp message:", payload)
    
    # Mocking the AI extraction process
    # Assume the user sent an audio note: "I fix generators around Akoka, my name is Tunde."
    extracted_data = {
        "business_name": "Tunde Gen Repair (via WhatsApp)",
        "category": "generator",
        "bio": "I fix generators around Akoka. Handled via WhatsApp audio note.",
        "area": "Yaba", # Akoka is near Yaba
        "phone": payload.get("from", "+2348000000000"),
    }
    
    # Save the extracted data into Next.js db.json
    try:
        with open(db_path, "r", encoding="utf-8") as f:
            db = json.load(f)
            
        new_user = {
            "id": generate_id(),
            "phone": extracted_data["phone"],
            "name": extracted_data["business_name"],
            "business_name": extracted_data["business_name"],
            "role": "worker",
            "kyc_tier": 0,
            "area": extracted_data["area"],
            "bio": extracted_data["bio"],
            "skills": [extracted_data["category"]],
            "source": "discovered",
            "discovered_at": int(time.time() * 1000),
            "claimed": False,
            "social_handles": [
                { "platform": "whatsapp", "handle": extracted_data["phone"], "verified": True }
            ],
            "business_photos": ["🛠"],
            "likes": 5,
            "followers": 0,
            "credibility": 60,
            "jobs_completed": 0,
            "avg_rating": 0,
            "created_at": int(time.time() * 1000)
        }
        
        db["users"].append(new_user)
        
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
            
        print(f"Successfully added vendor via WhatsApp: {extracted_data['business_name']}")
    except Exception as e:
        print("Error saving to db:", e)
