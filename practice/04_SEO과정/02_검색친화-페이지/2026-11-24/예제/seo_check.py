# seo_check.py — 페이지 HTML을 받아서 검색엔진이 읽는 정보만 골라 보여 줘요
# JavaScript는 실행하지 않아요. 서버가 처음 보낸 HTML(= 페이지 소스)만 읽어요.
# 실행: python3 seo_check.py http://localhost:8000/
import sys
from html.parser import HTMLParser
from urllib.request import urlopen
from urllib.error import HTTPError


class PageReader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = False
        self.title = ""
        self.metas = []     # (name, content, head 안인지)
        self.headings = []  # (h1·h2·h3, 글자)
        self.images = []    # (src, alt)
        self.links = []     # (href, 글자)
        self.tag = None     # 지금 글자를 모으는 태그
        self.text = ""
        self.href = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.in_head = True
        elif tag == "meta" and "name" in attrs:
            self.metas.append((attrs["name"], attrs.get("content", ""), self.in_head))
        elif tag == "img":
            self.images.append((attrs.get("src"), attrs.get("alt")))
        elif tag in ("title", "h1", "h2", "h3", "a"):
            self.tag, self.text = tag, ""
            self.href = attrs.get("href")

    def handle_data(self, data):
        if self.tag:
            self.text += data

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
        if tag != self.tag:
            return
        text = " ".join(self.text.split())
        if tag == "title":
            self.title = text
        elif tag == "a":
            self.links.append((self.href, text))
        else:
            self.headings.append((tag, text))
        self.tag = None


url = sys.argv[1]
try:
    response = urlopen(url)
except HTTPError as error:
    print("상태 코드:", error.code)
    sys.exit()

print("상태 코드:", response.status, "| Content-Type:", response.headers["Content-Type"])
reader = PageReader()
reader.feed(response.read().decode("utf-8"))

print("title:", reader.title or "(없음)")
for name, content, in_head in reader.metas:
    print(f"meta {name}: {content}" + ("" if in_head else "   ← <head> 밖"))
print("h1 개수:", [tag for tag, _ in reader.headings].count("h1"))
for tag, text in reader.headings:
    print("  " * (int(tag[1]) - 1) + f"{tag} {text}")
for src, alt in reader.images:
    print(f"img {src} → alt: " + ("(alt 없음)" if alt is None else f'"{alt}"'))
for href, text in reader.links:
    print(f"a {href} → {text}")
