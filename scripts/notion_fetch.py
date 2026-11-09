"""공개 노션 페이지를 마크다운으로 받아 출력한다 (wiki 정리용 재료).

사용법:
    python3 notion_fetch.py <노션 링크 또는 페이지ID>            # 화면에 출력
    python3 notion_fetch.py <링크> -o 저장할파일.md               # 파일로 저장
    python3 notion_fetch.py <링크> --children                     # 하위 페이지 목록 (제목, ID, 노션 수정일)

- 공개(웹 게시)된 페이지만 받을 수 있다. 비공개 페이지는 오류가 난다.
- `--children`의 수정일은 새 강의·내용 변경을 확인할 때 wiki의 최종 갱신일과 비교하는 용도다.
- 하위 페이지는 본문에 펼치지 않고 `[하위페이지] 제목 (ID)` 한 줄로 표시한다.
- 이미지는 `[이미지] URL` 로 표시한다. 정리할 때 내용 확인이 필요하면 URL을 내려받아 본다.
"""
import json
import re
import subprocess
import sys
import urllib.parse
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

API = "https://www.notion.so/api/v3/"


def post(ep, body):
    # 시스템 python의 SSL 인증서 문제를 피하려고 curl을 쓴다
    r = subprocess.run(["curl", "-s", "-X", "POST", API + ep, "-H", "Content-Type: application/json",
                        "-d", json.dumps(body)], capture_output=True, check=True)
    return json.loads(r.stdout)


def page_id(s):
    m = re.findall(r"[0-9a-f]{32}", s.replace("-", ""))
    if not m:
        sys.exit(f"페이지 ID를 찾을 수 없음: {s}")
    return str(uuid.UUID(m[-1]))


blocks = {}


def unwrap(v):
    while isinstance(v, dict) and "value" in v and "id" not in v:
        v = v["value"]
    return v


def store(record_map):
    for k, v in record_map.get("block", {}).items():
        v = unwrap(v)
        if isinstance(v, dict) and "id" in v:
            blocks[k] = v


def load_page(pid):
    cursor, chunk = {"stack": []}, 0
    while True:
        d = post("loadPageChunk", {"pageId": pid, "limit": 100, "cursor": cursor,
                                   "chunkNumber": chunk, "verticalColumns": False})
        if "recordMap" not in d:
            sys.exit(f"페이지를 받지 못함 (비공개일 수 있음): {d.get('message', d)}")
        store(d["recordMap"])
        cursor = d.get("cursor", {})
        if not cursor.get("stack"):
            break
        chunk += 1


def ensure(ids):
    missing = [i for i in ids if i not in blocks]
    for n in range(0, len(missing), 100):
        d = post("syncRecordValues", {"requests": [{"pointer": {"table": "block", "id": i}, "version": -1}
                                                   for i in missing[n:n + 100]]})
        store(d.get("recordMap", {}))


def rich(segs):
    out = []
    for seg in segs or []:
        s = seg[0]
        for mark in (seg[1] if len(seg) > 1 else []):
            if mark[0] == "c":
                s = f"`{s}`"
            elif mark[0] == "b":
                s = f"**{s}**"
            elif mark[0] == "a":
                s = f"[{s}]({mark[1]})"
        out.append(s)
    return "".join(out)


def prop(b, name):
    return rich(b.get("properties", {}).get(name, []))


def plain(b):
    return "".join(x[0] for x in b.get("properties", {}).get("title", []))


def image_url(b):
    src = "".join(x[0] for x in b.get("properties", {}).get("source", []))
    if not src:
        return ""
    if src.startswith("http") and "amazonaws" not in src and "attachment" not in src:
        return src
    return (f"https://www.notion.so/image/{urllib.parse.quote(src, safe='')}"
            f"?table=block&id={b['id']}&spaceId={b.get('space_id', '')}&cache=v2")


def render(bid, depth, out, is_root=False):
    b = blocks.get(bid)
    if not b:
        return
    t, ind = b.get("type"), "  " * depth
    s = plain(b) if t == "page" else prop(b, "title")
    if t == "page" and not is_root:
        out.append(f"{ind}[하위페이지] {s} ({bid})")
        return
    line = {
        "page": f"# {s}",
        "header": f"\n## {s}",
        "sub_header": f"\n### {s}",
        "sub_sub_header": f"\n#### {s}",
        "bulleted_list": f"{ind}- {s}",
        "numbered_list": f"{ind}1. {s}",
        "to_do": f"{ind}- [ ] {s}",
        "toggle": f"{ind}▶ {s}",
        "quote": f"{ind}> {s}",
        "callout": f"{ind}💡 {s}",
        "divider": f"{ind}---",
        "text": f"{ind}{s}" if s else None,
        "image": f"{ind}[이미지] {image_url(b)}",
        "bookmark": f"{ind}[링크] {prop(b, 'title')} {prop(b, 'link')}",
        "table": f"{ind}[표]",
        "column_list": None,
        "column": None,
    }.get(t, f"{ind}[{t}] {s}")
    if t == "code":
        lang = prop(b, "language")
        body = "".join(x[0] for x in b.get("properties", {}).get("title", []))
        line = f"{ind}```{lang}\n{body}\n{ind}```"
    elif t == "table_row":
        cells = b.get("properties", {})
        order = blocks.get(b.get("parent_id"), {}).get("format", {}).get("table_block_column_order") or list(cells)
        line = f"{ind}| " + " | ".join(rich(cells.get(c, [])) for c in order) + " |"
    if line is not None:
        out.append(line)
    kids = b.get("content", [])
    ensure(kids)
    flat = t in ("page", "column_list", "column", "header", "sub_header", "sub_sub_header", "table")
    for k in kids:
        render(k, depth if flat else depth + 1, out)


def edited(b):
    ms = b.get("last_edited_time")
    if not ms:
        return "-"
    return datetime.fromtimestamp(ms / 1000, ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    pid = page_id(args[0])
    load_page(pid)
    if "--children" in args:
        root = blocks[pid]
        print(f"(과정 페이지) {plain(root)}\t{pid}\t수정 {edited(root)}")
        ensure(root.get("content", []))
        for k in root.get("content", []):
            b = blocks.get(k, {})
            if b.get("type") == "page":
                ensure([k])  # 하위 페이지 자체 레코드의 수정일을 받기 위해
                print(f"{plain(b)}\t{k}\t수정 {edited(blocks.get(k, b))}")
        return
    out = []
    render(pid, 0, out, is_root=True)
    text = "\n".join(out) + "\n"
    if "-o" in args:
        with open(args[args.index("-o") + 1], "w", encoding="utf-8") as f:
            f.write(text)
    else:
        print(text)


if __name__ == "__main__":
    main()
