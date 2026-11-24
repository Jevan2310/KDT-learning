# sitemap_check.py — 사이트맵에 넣은 주소를 하나씩 열어 보고, 검색에 알려도 되는 페이지인지 점검해요
# 배포 전 점검용이에요. 사이트맵의 실제 주소 앞부분을 내 컴퓨터 주소로 바꿔서 열어요.
# 실행: python3 sitemap_check.py http://localhost:8000 https://my-service.example.com
import sys
import xml.etree.ElementTree as ET
from urllib.request import urlopen
from urllib.error import HTTPError
from urllib.robotparser import RobotFileParser

local, real = sys.argv[1], sys.argv[2]
SITEMAP = "{http://www.sitemaps.org/schemas/sitemap/0.9}"  # xmlns에 적은 사이트맵 규칙 주소

with urlopen(local + "/sitemap.xml") as response:
    print("sitemap.xml:", response.status, response.headers["Content-Type"])
    root = ET.fromstring(response.read())  # XML 형식이 틀리면 여기서 오류가 나요

robots = RobotFileParser(local + "/robots.txt")
robots.read()

locs = root.findall(f"{SITEMAP}url/{SITEMAP}loc")
print("찾은 주소:", len(locs), "개")
for loc in locs:
    url = loc.text.strip()
    if not url.startswith(real):
        print(f"  {url} → 내 사이트 주소가 아니에요")
        continue
    if "#" in url:
        print(f"  {url} → # 뒤는 같은 페이지 안의 위치예요")
        continue
    local_url = local + url[len(real):]
    try:
        with urlopen(local_url) as page:
            status, html = page.status, page.read().decode("utf-8")
    except HTTPError as error:
        status, html = error.code, ""
    notes = []
    if not robots.can_fetch("Googlebot", local_url):
        notes.append("robots.txt가 수집을 막아요")
    if 'content="noindex"' in html:
        notes.append("noindex가 있어요")
    print(f"  {url} → {status}" + "".join(" / " + note for note in notes))
