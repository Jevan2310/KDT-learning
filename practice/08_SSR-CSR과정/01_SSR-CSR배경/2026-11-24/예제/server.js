// SSR·CSR 비교 예제 — Node.js에 들어 있는 http 모듈만 써요 (npm install 필요 없음)
// 실행: node server.js → 브라우저에서 http://localhost:3100/ssr, /csr, /api/students
const http = require("http");

const PORT = 3100;
const API_DELAY_MS = 0; // 6단계: 2000으로 바꾸면 /api/students 응답이 2초 늦게 가요

const students = [
  { id: 1, name: "한코딩", email: "han@example.com", className: "풀스택 1반" },
  { id: 2, name: "김자바", email: "kim@example.com", className: "풀스택 1반" },
  { id: 3, name: "이스프링", email: "lee@example.com", className: "풀스택 2반" },
  { id: 4, name: "박리액트", email: "park@example.com", className: "풀스택 2반" },
];

// 검색은 서버가 해요. 검색어가 ""이면 모든 이름에 들어 있다고 봐서 전체가 나와요
function findStudents(keyword) {
  return students.filter((student) => student.name.includes(keyword));
}

// 두 페이지가 같이 쓰는 문서 틀: 상단 메뉴, 펼치는 메뉴, 서버가 이 문서를 만든 시각
function page(title, main) {
  const madeAt = new Date().toTimeString().slice(0, 8);
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><link rel="icon" href="data:,"><title>${title}</title></head>
<body>
<nav><a href="/ssr">SSR 목록</a> | <a href="/csr">CSR 목록</a> | <a href="/api/students">JSON</a></nav>
<details><summary>펼치는 메뉴</summary><p>검색한 뒤에도 열려 있을까요?</p></details>
<p>서버가 이 문서를 만든 시각: ${madeAt}</p>
<h1>${title}</h1>
${main}
</body>
</html>`;
}

const TABLE_HEAD = "<tr><th>번호</th><th>이름</th><th>이메일</th><th>반</th></tr>";

// SSR: 서버가 학생 이름을 넣은 <tr>까지 만들어서 보내요
function ssrPage(keyword) {
  const found = findStudents(keyword);
  let rows = found
    .map((s) => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.email}</td><td>${s.className}</td></tr>`)
    .join("\n");
  if (found.length === 0) rows = `<tr><td colspan="4">검색 결과가 없습니다.</td></tr>`;
  // 검색어는 사용자가 친 글자라서, HTML 기호로 읽히지 않게 바꿔서 넣어요
  const safeKeyword = keyword.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return page("학생 목록 (SSR)", `<form action="/ssr" method="get">
  <input name="keyword" value="${safeKeyword}" placeholder="학생 이름">
  <button type="submit">검색</button>
</form>
<table border="1">
<thead>${TABLE_HEAD}</thead>
<tbody>
${rows}
</tbody>
</table>`);
}

// CSR: 빈 표와 script만 보내요. 이름은 브라우저의 JavaScript가 /api/students로 받아서 넣어요
// (바깥 문자열이 백틱이라서 script 안에서는 백틱과 ${ }를 쓰지 않았어요)
function csrPage() {
  return page("학생 목록 (CSR)", `<form id="search-form">
  <input id="keyword" name="keyword" placeholder="학생 이름">
  <button type="submit">검색</button>
</form>
<p id="message"></p>
<table border="1">
<thead>${TABLE_HEAD}</thead>
<tbody id="rows"></tbody>
</table>
<script>
  const rows = document.querySelector("#rows");
  const message = document.querySelector("#message");

  async function loadStudents(keyword) {
    message.textContent = "불러오는 중...";
    rows.innerHTML = "";
    try {
      const response = await fetch("/api/students?keyword=" + encodeURIComponent(keyword));
      const students = await response.json();
      message.textContent = students.length === 0 ? "검색 결과가 없습니다." : "";
      for (const s of students) {
        const tr = document.createElement("tr");
        for (const value of [s.id, s.name, s.email, s.className]) {
          const td = document.createElement("td");
          td.textContent = value;
          tr.append(td);
        }
        rows.append(tr);
      }
    } catch (error) {
      message.textContent = "학생 목록을 불러오지 못했습니다.";
    }
  }

  document.querySelector("#search-form").addEventListener("submit", (event) => {
    event.preventDefault(); // 폼이 새 문서를 요청하지 못하게 막아요
    loadStudents(document.querySelector("#keyword").value.trim());
  });

  loadStudents(""); // 문서를 받자마자 전체 목록을 요청해요
</script>`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost:" + PORT);
  const keyword = (url.searchParams.get("keyword") ?? "").trim();
  if (url.pathname === "/favicon.ico") return res.end();
  // 어떤 요청이 왔는지 터미널에 한 줄씩 찍어요
  console.log(new Date().toTimeString().slice(0, 8), req.method, url.pathname, keyword ? "keyword=" + keyword : "");

  if (url.pathname === "/") {
    res.writeHead(302, { Location: "/ssr" });
    res.end();
  } else if (url.pathname === "/ssr") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(ssrPage(keyword));
  } else if (url.pathname === "/csr") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(csrPage());
  } else if (url.pathname === "/api/students") {
    setTimeout(() => {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(findStudents(keyword)));
    }, API_DELAY_MS);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("없는 주소예요: " + url.pathname);
  }
});

server.listen(PORT, () => {
  console.log("http://localhost:" + PORT + "/ssr 에서 시작해요. 끄려면 Ctrl + C");
});
