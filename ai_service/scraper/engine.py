import json
import os
import random
import uuid
import time

def calculate_trust_score(likes: int, comment_sentiment: int, post_frequency: int) -> int:
    """
    Calculates dynamic trust score: Ts = (L x w1) + (Csent x w2) + (Vfreq x w3)
    """
    w1, w2, w3 = 0.2, 0.5, 0.3
    score = (likes * w1) + (comment_sentiment * w2) + (post_frequency * w3)
    return int(min(100, max(0, score)))

def run_scraper(db_path: str):
    """
    Mock scraping engine. In production, this runs via a cron job,
    scrapes social platforms (Instagram, Jiji), updates comment sentiments
    and likes, and recalculates the Trust Score.
    """
    print("Running Social Scraping Engine...")
    
    if not os.path.exists(db_path):
        print("DB not found.")
        return
        
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)
        
    updated_count = 0
    for user in db.get("users", []):
        if user.get("role") in ["worker", "both"] and user.get("source") != "registered":
            # Simulate scraping new engagement data
            new_likes = user.get("likes", 0) + random.randint(0, 10)
            
            # Sentiment from comments (0-100)
            avg_sentiment = random.randint(40, 95)
            
            # Post frequency (0-100)
            post_freq = random.randint(10, 80)
            
            new_credibility = calculate_trust_score(new_likes, avg_sentiment, post_freq)
            
            user["likes"] = new_likes
            user["credibility"] = new_credibility
            updated_count += 1
            
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
        
    print(f"Scraping complete. Updated {updated_count} vendors' trust scores.")

def generate_id(prefix="u"):
    return f"{prefix}_{uuid.uuid4().hex[:16]}"

def scrape_instagram_profile(handle: str, db_path: str):
    """
    Scrapes an Instagram profile using the provided handle and adds them
    as a discovered food vendor to the database.
    """
    print(f"Scraping Instagram profile for handle: {handle}")
    
    # Clean the handle (remove @ if present)
    clean_handle = handle.replace("@", "")
    
    # In a real scenario, this would use Apify or similar to scrape IG.
    # We mock the extracted data here for the food vendor.
    extracted_data = {
        "business_name": f"{clean_handle.capitalize()} Foods",
        "category": "other",  # 'other' or 'delivery' could fit catering/food
        "bio": f"Delicious food vendor from Instagram (@{clean_handle}). Extracted via Instagram Scraper.",
        "area": "Lekki", # Mock location
        "phone": f"+23480{random.randint(1000000, 9999999)}",
        "likes": random.randint(100, 1000),
        "post_freq": random.randint(50, 90),
        "comment_sentiment": random.randint(60, 95),
        "followers": random.randint(1000, 10000)
    }
    
    credibility = calculate_trust_score(
        extracted_data["likes"], 
        extracted_data["comment_sentiment"], 
        extracted_data["post_freq"]
    )
    
    if not os.path.exists(db_path):
        print("DB not found.")
        return
        
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
                { "platform": "instagram", "handle": f"@{clean_handle}", "verified": False }
            ],
            "business_photos": ["🥘", "🥗"],
            "likes": extracted_data["likes"],
            "followers": extracted_data["followers"],
            "credibility": credibility,
            "jobs_completed": 0,
            "avg_rating": 4.5,
            "created_at": int(time.time() * 1000)
        }
        
        db["users"].append(new_user)
        
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
            
        print(f"Successfully added scraped IG food vendor: {extracted_data['business_name']}")
    except Exception as e:
        print("Error saving to db:", e)
