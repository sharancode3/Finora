import os
import json
import re
from typing import Dict, Any, List, Optional

GLOSSARY_PATH = os.path.join(os.path.dirname(__file__), "finance_glossary.json")

_GLOSSARY_CACHE: Optional[Dict[str, Any]] = None

def _load_glossary() -> Dict[str, Any]:
    global _GLOSSARY_CACHE
    if _GLOSSARY_CACHE is not None:
        return _GLOSSARY_CACHE
    
    if os.path.exists(GLOSSARY_PATH):
        try:
            with open(GLOSSARY_PATH, "r", encoding="utf-8") as f:
                _GLOSSARY_CACHE = json.load(f)
                return _GLOSSARY_CACHE
        except Exception as e:
            print(f"Error loading finance glossary: {e}")
    
    _GLOSSARY_CACHE = {"terms": []}
    return _GLOSSARY_CACHE

def normalize_text(text: str) -> str:
    """Normalizes string for robust alias and keyword matching."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return ' '.join(text.split())

STOP_WORDS = {
    "can", "u", "you", "tell", "me", "abt", "about", "how", "what", "whats", "is", "are", 
    "we", "hv", "have", "the", "a", "an", "in", "of", "for", "to", "and", "data", "months", 
    "month", "year", "years", "2026", "our", "my", "show", "give", "list"
}

def lookup_finance_term(query: str) -> Optional[Dict[str, Any]]:
    """
    Looks up a curated financial or treasury term from the grounded reference knowledge base.
    Matches by exact ID, canonical name, aliases, or semantic keywords with strict word boundaries.
    """
    glossary = _load_glossary()
    terms = glossary.get("terms", [])
    if not terms or not query:
        return None

    clean_q = normalize_text(query)
    q_words = set(w for w in clean_q.split() if w not in STOP_WORDS)
    
    # Common interrogative prefixes to strip for pure term extraction
    strip_phrases = [
        "what is meant by", "difference between", "tell me about", "can you explain", "can u explain",
        "please explain", "pls explain", "tell me what is", "tell me wat is", "what does", "what are",
        "what is", "whats", "what s", "wat is", "wats", "define", "explain", "meaning of", "details on",
        "definition of", "how does", "wat", "y"
    ]
    extracted_target = clean_q
    for p in strip_phrases:
        if extracted_target.startswith(p + " "):
            extracted_target = extracted_target[len(p):].strip()
            break
        elif extracted_target == p:
            extracted_target = ""
            break

    # 1. Exact match on term_id or canonical name
    for item in terms:
        if item["term_id"] == clean_q or item["term_id"] == extracted_target:
            return _format_term_response(item)
        if normalize_text(item["canonical_name"]) == clean_q or normalize_text(item["canonical_name"]) == extracted_target:
            return _format_term_response(item)

    # 2. Exact match on aliases
    for item in terms:
        for alias in item.get("aliases", []):
            clean_alias = normalize_text(alias)
            if clean_alias == clean_q or clean_alias == extracted_target:
                return _format_term_response(item)

    # 3. Word-boundary containment match (prevents 't 2' matching 'abt 2026')
    best_match = None
    max_score = 0

    for item in terms:
        score = 0
        canonical_norm = normalize_text(item["canonical_name"])
        
        # Check canonical
        if extracted_target and (extracted_target == canonical_norm or bool(re.search(rf'\b{re.escape(extracted_target)}\b', canonical_norm))):
            score += 40

        # Check aliases with word boundary
        for alias in item.get("aliases", []):
            clean_alias = normalize_text(alias)
            # Only match alias if bounded by word boundaries
            if re.search(rf'\b{re.escape(clean_alias)}\b', clean_q) or (extracted_target and re.search(rf'\b{re.escape(clean_alias)}\b', extracted_target)):
                # Longer alias matches get higher score
                score = max(score, 30 + len(clean_alias))
            
            # Word overlap (only on non-stop words)
            alias_words = set(w for w in clean_alias.split() if w not in STOP_WORDS)
            if alias_words and q_words:
                overlap = len(alias_words.intersection(q_words))
                if overlap > 0:
                    score = max(score, overlap * 15)

        # Check specific section codes (e.g. 194C, 194J, 115)
        for num in re.findall(r'\b(?:194[a-z]|115|109|36\(4\))\b', clean_q):
            if num in item["term_id"] or any(num in a for a in item.get("aliases", [])):
                score += 50

        if score > max_score and score >= 35:
            max_score = score
            best_match = item

    if best_match:
        return _format_term_response(best_match)

    return None

def _format_term_response(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "term_id": item.get("term_id"),
        "canonical_name": item.get("canonical_name"),
        "category": item.get("category", "General Treasury"),
        "statutory_reference": item.get("statutory_reference", "Indian Accounting Standards & RBI Master Directions"),
        "plain_definition": item.get("plain_definition"),
        "merchant_impact": item.get("merchant_impact"),
        "actionable_tip": item.get("actionable_tip"),
        "related_terms": item.get("related_terms", []),
        "source": "Finora Statutory Treasury & Accounting Reference (Ind AS & RBI Master Directions)"
    }

def search_finance_terms(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Returns top ranked glossary matches for broad search."""
    glossary = _load_glossary()
    terms = glossary.get("terms", [])
    clean_q = normalize_text(query)
    q_words = set(clean_q.split())

    scored_terms = []
    for item in terms:
        score = 0
        canonical_norm = normalize_text(item["canonical_name"])
        if clean_q in canonical_norm:
            score += 30
        
        for alias in item.get("aliases", []):
            clean_alias = normalize_text(alias)
            if clean_alias in clean_q or clean_q in clean_alias:
                score += 20
            overlap = len(set(clean_alias.split()).intersection(q_words))
            score += overlap * 5
        
        if score > 0:
            scored_terms.append((score, item))

    scored_terms.sort(key=lambda x: x[0], reverse=True)
    return [_format_term_response(t[1]) for t in scored_terms[:limit]]

def get_all_terms() -> List[Dict[str, Any]]:
    glossary = _load_glossary()
    return [_format_term_response(t) for t in glossary.get("terms", [])]
