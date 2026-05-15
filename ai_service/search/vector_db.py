import json
import os
import hashlib
import pickle

try:
    from sentence_transformers import SentenceTransformer, util
    HAS_MODEL = True
except ImportError:
    HAS_MODEL = False
    print("Warning: sentence_transformers not found. Using fuzzy keyword matching mock instead.")

_model = None

def get_model():
    global _model
    if _model is None and HAS_MODEL:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

# In a real app, vectors would be persisted in ChromaDB or similar.
# For this demo, we embed on the fly or use a mock.
_corpus_embeddings = None
_corpus_user_ids = []

def _load_and_embed_vendors(db_path: str):
    global _corpus_embeddings, _corpus_user_ids
    if not os.path.exists(db_path):
        return []
        
    with open(db_path, "r", encoding="utf-8") as f:
        db = json.load(f)
        
    users = [u for u in db.get("users", []) if u.get("role") in ["worker", "both"] and u.get("business_name")]
    
    docs = []
    _corpus_user_ids = []
    
    for u in users:
        # Create a rich document for embedding
        bio = u.get("bio", "")
        cat = ", ".join(u.get("skills", []))
        area = u.get("area", "")
        name = u.get("business_name", "")
        doc = f"Name: {name}. Category: {cat}. Area: {area}. Bio: {bio}"
        docs.append(doc)
        _corpus_user_ids.append(u["id"])
        
    if HAS_MODEL and len(docs) > 0:
        # Caching logic
        cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
        os.makedirs(cache_dir, exist_ok=True)
        cache_path = os.path.join(cache_dir, 'vector_cache.pkl')
        
        # Hash docs to detect changes
        m = hashlib.md5()
        for doc in docs:
            m.update(doc.encode('utf-8'))
        current_hash = m.hexdigest()
        
        cache_valid = False
        if os.path.exists(cache_path):
            try:
                with open(cache_path, 'rb') as f:
                    cache_data = pickle.load(f)
                    if cache_data.get('hash') == current_hash:
                        _corpus_embeddings = cache_data['embeddings']
                        _corpus_user_ids = cache_data['user_ids']
                        cache_valid = True
            except Exception as e:
                print("Failed to load vector cache:", e)
                
        if not cache_valid:
            print("Generating new embeddings...")
            _corpus_embeddings = get_model().encode(docs, convert_to_tensor=True)
            try:
                with open(cache_path, 'wb') as f:
                    pickle.dump({
                        'hash': current_hash,
                        'embeddings': _corpus_embeddings,
                        'user_ids': _corpus_user_ids
                    }, f)
            except Exception as e:
                print("Failed to save vector cache:", e)
    
    return users

def search_vendors(query: str, limit: int, db_path: str) -> list[str]:
    """
    Translates a conversational query like 'my screen is cracked' 
    into matching vendor IDs using semantic vector search.
    """
    users = _load_and_embed_vendors(db_path)
    
    if not users:
        return []
        
    if HAS_MODEL and _corpus_embeddings is not None:
        query_embedding = get_model().encode(query, convert_to_tensor=True)
        # We use cosine-similarity and torch.topk to find the highest scores
        hits = util.semantic_search(query_embedding, _corpus_embeddings, top_k=limit)[0]
        
        # Sort and return IDs
        results = []
        for hit in hits:
            idx = hit['corpus_id']
            results.append(_corpus_user_ids[idx])
        return results
    else:
        # Mock fallback: simple substring search across the same rich text
        query_lower = query.lower()
        results = []
        for u in users:
            bio = u.get("bio", "").lower()
            cat = ", ".join(u.get("skills", [])).lower()
            if any(q in bio or q in cat for q in query_lower.split()):
                results.append(u["id"])
        return results[:limit]
