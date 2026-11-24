# robots_check.py — robots.txt 규칙을 따르는 크롤러라면 각 경로를 수집할지 알려 줘요
# 실행: python3 robots_check.py http://localhost:8000 / /admin.html
import sys
from urllib.robotparser import RobotFileParser

site = sys.argv[1]
robots = RobotFileParser(site + "/robots.txt")
robots.read()  # 사이트 최상위의 /robots.txt를 받아 와요 (없으면 모두 허용)
for path in sys.argv[2:]:
    allowed = robots.can_fetch("Googlebot", site + path)
    print(path, "→", "수집해요" if allowed else "수집하지 않아요")
