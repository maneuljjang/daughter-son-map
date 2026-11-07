"""카톡 초대장 카드 이미지(800x400) 생성: python scripts/make_card.py"""
import random
from PIL import Image, ImageDraw, ImageFont

W, H = 800, 400
BUTTER, CREAM, BROWN, TOMATO, TEAL, GREEN, PINK = "#F6D77A", "#FBF1D3", "#4A3A30", "#E2583E", "#2F7F7A", "#6E8B3D", "#EF8F8F"
FONT_B = "C:/Windows/Fonts/NotoSansKR-Bold.ttf"
FONT_M = "C:/Windows/Fonts/NotoSansKR-Medium.ttf"

img = Image.new("RGB", (W, H), BUTTER)
d = ImageDraw.Draw(img)

# 망점
for y in range(0, H, 9):
    for x in range((y // 9 % 2) * 4, W, 9):
        d.ellipse([x, y, x + 2, y + 2], fill="#E9C766")

# 언덕 (위 = 북쪽, 높은 곳)
d.polygon([(380, H), (520, 130), (610, 190), (700, 90), (W, 150), (W, H)], fill=CREAM, outline=BROWN, width=5)
d.polygon([(300, H), (470, 250), (560, 290), (650, 230), (W, 280), (W, H)], fill="#EFDDA6", outline=BROWN, width=5)

# 내려오는 점선 길 + 번호 마커
pts = [(700, 120), (640, 205), (575, 255), (500, 300), (420, 360)]
for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
    n = 9
    for k in range(n):
        if k % 2: continue
        a, b = k / n, (k + 1) / n
        d.line([(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a), (x1 + (x2 - x1) * b, y1 + (y2 - y1) * b)], fill=BROWN, width=6)
num_font = ImageFont.truetype(FONT_B, 24)
for i, ((x, y), c) in enumerate(zip(pts, [TOMATO, "#C9772F", TEAL, GREEN, TOMATO])):
    d.ellipse([x - 22 + 4, y - 22 + 4, x + 22 + 4, y + 22 + 4], fill=BROWN)
    d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=c, outline=BROWN, width=4)
    d.text((x, y - 2), str(i + 1), font=num_font, fill="white", anchor="mm")

# 해
d.ellipse([600, 26, 660, 86], fill=PINK, outline=BROWN, width=4)

# 제목 (리소 어긋남: 분홍 → 갈색)
title_font = ImageFont.truetype(FONT_B, 76)
for dx, dy, col in [(5, 5, PINK), (0, 0, BROWN)]:
    d.text((48 + dx, 70 + dy), "딸, 아들", font=title_font, fill=col)
    d.text((48 + dx, 160 + dy), "어디가", font=title_font, fill=col)

sub = ImageFont.truetype(FONT_M, 26)
d.rounded_rectangle([48, 290, 330, 338], radius=24, fill=BROWN)
d.text((189, 313), "성북동 초대장", font=sub, fill=CREAM, anchor="mm")

d.rectangle([0, 0, W - 1, H - 1], outline=BROWN, width=8)
img.save("public/share/invite-card.png", optimize=True)
print("saved", img.size)
