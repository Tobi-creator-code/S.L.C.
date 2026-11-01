"""Run with:  python3 selftest.py   (needs tesseract installed)"""
import io
import os

os.environ["SLC_INTERNAL_SECRET"] = "x" * 32

from PIL import Image, ImageDraw, ImageFont

import app as service

FONT = next((p for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf") if os.path.exists(p)), None)


def card(lines):
    img = Image.new("RGB", (1000, 560), "white")
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FONT, 44)
    for i, line in enumerate(lines):
        d.text((50, 40 + i * 80), line, fill="black", font=f)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def call(png, name, school="University of Lagos (UNILAG)"):
    c = service.app.test_client()
    return c.post("/verify", data={"file": (io.BytesIO(png), "id.png"), "name": name, "school": school},
                  headers={"Authorization": "Bearer " + "x" * 32}, content_type="multipart/form-data")


def check(ok, label):
    print(("ok  - " if ok else "FAILED: ") + label)
    if not ok:
        raise SystemExit(1)


good = card(["UNIVERSITY OF LAGOS", "STUDENT ID CARD", "Name: ADA OKAFOR", "Dept: Computer Science", "Matric No: 2022/1234"])
r = call(good, "Ada Okafor").get_json()
check(r["decision"] == "match" and r["found"]["name"], "a matching ID card is recognised (%s)" % r)
r = call(good, "Chinedu Eze").get_json()
check(r["decision"] == "review" and not r["found"]["name"], "a different name goes to a human")
r = call(card(["UNIVERSITY OF LAGOS", "Name: ADA OKAFOR", "Admission 2022/1234"]), "Okafor Ada").get_json()
check(r["decision"] == "match", "names in a different order still match")
blank = Image.new("RGB", (800, 400), "white"); b = io.BytesIO(); blank.save(b, "PNG")
check(call(b.getvalue(), "Ada Okafor").get_json()["decision"] == "review", "a blank picture goes to a human")
check(call(b"this is not a picture", "Ada Okafor").status_code == 400, "a non-picture is refused")
c = service.app.test_client()
check(c.post("/verify", data={}, content_type="multipart/form-data").status_code == 401, "calls without the secret are refused")
print("\nAll OCR checks passed.")
