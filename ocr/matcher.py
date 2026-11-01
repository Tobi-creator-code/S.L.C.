"""Compares text read from an ID card or admission letter with what the student typed.

It never rejects anyone. It either says "match" (clear enough to skip a human) or "review"
(a person at SLC checks it). Names written differently on documents are common, so a
mismatch is treated as "look at this", not "this is fake".
"""
import difflib
import math
import re
import unicodedata

_NUMBER = re.compile(r"\b[A-Za-z]{0,5}[/-]?(?:19|20)\d{2}[/-]\d{2,8}\b|\b[A-Za-z]{2,5}[/-]\d{2,4}[/-]\d{3,8}\b")
_SKIP = {"university", "of", "the", "college", "federal", "state", "polytechnic", "and", "institute", "technology"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch)).lower()
    return re.sub(r"[^a-z0-9 ]+", " ", s)


def _tokens(s: str) -> list[str]:
    return [t for t in norm(s).split() if t]


def _has(token: str, text_tokens: list[str], cutoff: float = 0.85) -> bool:
    if token in text_tokens:
        return True
    return bool(difflib.get_close_matches(token, text_tokens, n=1, cutoff=cutoff)) if len(token) >= 4 else False


def name_found(text: str, name: str) -> bool:
    want = [t for t in _tokens(name) if len(t) >= 2]
    if not want:
        return False
    have = _tokens(text)
    hits = sum(1 for t in want if _has(t, have))
    need = len(want) if len(want) <= 2 else math.ceil(len(want) * 0.67)
    return hits >= need


def school_found(text: str, school: str) -> bool:
    abbr = re.search(r"\(([^)]+)\)", school)
    have = _tokens(text)
    if abbr and norm(abbr.group(1)).strip() in have:
        return True
    words = [w for w in _tokens(re.sub(r"\([^)]*\)", " ", school)) if w not in _SKIP and len(w) > 3]
    if not words:
        return False
    return sum(1 for w in words if _has(w, have)) / len(words) >= 0.6


def find_number(text: str) -> str | None:
    m = _NUMBER.search(text)
    return m.group(0).upper() if m else None


def decide(text: str, name: str, school: str) -> dict:
    n, s, num = name_found(text, name), school_found(text, school), find_number(text)
    score = (0.5 if n else 0) + (0.3 if s else 0) + (0.2 if num else 0)
    decision = "match" if n and (s or num) and score >= 0.7 else "review"
    return {"decision": decision, "score": round(score, 2), "found": {"name": n, "school": s, "number": num}}
