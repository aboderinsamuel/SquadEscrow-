import os
import json
from fastapi import FastAPI, BackgroundTasks, Request, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()
from bot.whatsapp import process_whatsapp_message
from search.vector_db import search_vendors
from scraper.engine import run_scraper, scrape_instagram_profile

app = FastAPI(title="KiniBoku AI Microservice")

origins_str = os.getenv("CORS_ORIGINS", "")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("AI_API_KEY", "your_secret_api_key_here")

async def verify_api_key(x_api_key: str = Header(default=None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API Key")

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'db.json'))

class SearchQuery(BaseModel):
    query: str
    limit: int = 10

class SearchResponse(BaseModel):
    results: List[str] # List of user IDs

@app.get("/")
def read_root():
    return {"status": "ok", "service": "KiniBoku AI"}

@app.post("/webhook/whatsapp", dependencies=[Depends(verify_api_key)])
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    background_tasks.add_task(process_whatsapp_message, payload, DB_PATH)
    return {"status": "received"}

@app.post("/search", response_model=SearchResponse, dependencies=[Depends(verify_api_key)])
def do_search(req: SearchQuery):
    # This queries the vector DB based on the natural language string
    user_ids = search_vendors(req.query, req.limit, DB_PATH)
    return {"results": user_ids}

@app.post("/tasks/run-scraper", dependencies=[Depends(verify_api_key)])
def trigger_scraper(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_scraper, DB_PATH)
    return {"status": "scraper started"}

class ScrapeInstagramRequest(BaseModel):
    handle: str

@app.post("/tasks/scrape-instagram", dependencies=[Depends(verify_api_key)])
def trigger_instagram_scrape(req: ScrapeInstagramRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(scrape_instagram_profile, req.handle, DB_PATH)
    return {"status": "instagram scraping started", "handle": req.handle}
