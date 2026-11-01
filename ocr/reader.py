"""Turns an uploaded picture into text with Tesseract. Everything stays in memory: nothing is saved."""
import io

import cv2
import numpy as np
import pytesseract
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = 25_000_000          # refuse "decompression bomb" pictures
ALLOWED = {"JPEG", "PNG", "WEBP"}


class BadImage(ValueError):
    pass


def read_text(data: bytes) -> str:
    try:
        probe = Image.open(io.BytesIO(data))
        fmt = probe.format
        probe.verify()
        if fmt not in ALLOWED:
            raise BadImage("Only JPEG, PNG or WEBP pictures are accepted.")
        img = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("L")
    except BadImage:
        raise
    except Exception as exc:                  # corrupt file, wrong type, too large
        raise BadImage("That file could not be read as a picture.") from exc

    longest = max(img.size)
    if longest > 2600:
        img = img.resize((int(img.width * 2600 / longest), int(img.height * 2600 / longest)))
    elif longest < 1200:
        img = img.resize((int(img.width * 1200 / longest), int(img.height * 1200 / longest)))

    gray = np.array(img)
    blur = cv2.GaussianBlur(gray, (3, 3), 0)
    _, otsu = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    chunks = []
    for source, psm in ((gray, 6), (otsu, 6), (gray, 11)):
        try:
            chunks.append(pytesseract.image_to_string(Image.fromarray(source), lang="eng", config=f"--psm {psm}", timeout=20))
        except RuntimeError:                  # Tesseract took too long on this pass
            continue
    return "\n".join(chunks)
