"""Small internal service the PHP site calls during sign-up. It must NOT be reachable from the internet:
in docker-compose it has no public port, and every call needs the shared secret."""
import hmac
import os

from flask import Flask, jsonify, request

import matcher
import reader

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024
SECRET = os.environ.get("SLC_INTERNAL_SECRET", "")


def _authorised() -> bool:
    got = request.headers.get("Authorization", "")
    return len(SECRET) >= 24 and hmac.compare_digest(got, f"Bearer {SECRET}")


@app.get("/health")
def health():
    return jsonify(ok=True)


@app.post("/verify")
def verify():
    if not _authorised():
        return jsonify(error="unauthorized"), 401
    upload = request.files.get("file")
    name = (request.form.get("name") or "")[:120]
    school = (request.form.get("school") or "")[:160]
    if upload is None or not name:
        return jsonify(error="file and name are required"), 400
    try:
        text = reader.read_text(upload.read())
    except reader.BadImage as exc:
        return jsonify(error="bad_image", message=str(exc)), 400
    return jsonify(matcher.decide(text, name, school))   # the text itself is never returned or stored


@app.errorhandler(413)
def too_large(_):
    return jsonify(error="bad_image", message="That picture is too large (limit 6 MB)."), 413
