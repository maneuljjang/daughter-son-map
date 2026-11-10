"""카톡 초대장 카드 이미지(800x400) 생성: python scripts/make_card.py
Outdoor Explorer 톤: 흰 배경, 세이지 그린 포인트, 얇은 선."""
from PIL import Image, ImageDraw, ImageFont

W, H = 800, 400
S = 2  # 2배로 그린 뒤 줄여서 선을 부드럽게
WHITE, BG2, TEXT, TEXT2, PRIMARY, SOFT, BORDER = "#FFFFFF", "#F5F6F4", "#252925", "#888888", "#789477", "#EEF2ED", "#E8EAE7"
FONT_B = "C:/Windows/Fonts/NotoSansKR-Bold.ttf"
FONT_M = "C:/Windows/Fonts/NotoSansKR-Medium.ttf"

img = Image.new("RGB", (W * S, H * S), WHITE)
d = ImageDraw.Draw(img)
s = lambda *v: [x * S for x in v]

# 오른쪽: 옅은 세이지 산 두 겹
d.polygon(s(360, 400, 520, 170, 600, 250, 700, 120, 800, 210, 800, 400), fill=SOFT)
d.polygon(s(300, 400, 470, 280, 560, 330, 660, 250, 800, 320, 800, 400), fill="#DCE5DB")

# 내려오는 경로 + 번호 원
pts = [(700, 150), (640, 215), (575, 262), (505, 305), (430, 355)]
for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
    d.line(s(x1, y1, x2, y2), fill=WHITE, width=11 * S)
    d.line(s(x1, y1, x2, y2), fill=PRIMARY, width=5 * S)
nf = ImageFont.truetype(FONT_B, 20 * S)
for i, (x, y) in enumerate(pts):
    r = 19
    d.ellipse(s(x - r - 3, y - r - 3, x + r + 3, y + r + 3), fill=WHITE)
    d.ellipse(s(x - r, y - r, x + r, y + r), fill=PRIMARY)
    d.text((x * S, (y - 1) * S), str(i + 1), font=nf, fill=WHITE, anchor="mm")

# 왼쪽: 로고 + 제목
d.rounded_rectangle(s(56, 64, 100, 108), radius=12 * S, fill=PRIMARY)
d.polygon(s(64, 98, 76, 78, 82, 88, 87, 82, 94, 98), fill=WHITE)
d.text((116 * S, 86 * S), "성북동 나들이 초대장", font=ImageFont.truetype(FONT_M, 22 * S), fill=PRIMARY, anchor="lm")
tf = ImageFont.truetype(FONT_B, 64 * S)
d.text((56 * S, 140 * S), "딸, 아들", font=tf, fill=TEXT)
d.text((56 * S, 222 * S), "어디가", font=tf, fill=TEXT)
d.text((58 * S, 334 * S), "걷기 편한 내리막 코스로 모실게요", font=ImageFont.truetype(FONT_M, 20 * S), fill=TEXT2, anchor="lm")

d.rectangle(s(0, 0, W - 1, H - 1), outline=BORDER, width=2 * S)
img = img.resize((W, H), Image.LANCZOS)
img.save("public/share/invite-card.png", optimize=True)
print("saved", img.size)
