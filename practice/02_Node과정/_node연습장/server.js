const express = require("express");
const cors = require("cors"); // ← 04에서 추가 ①

const app = express();
const PORT = 3000;

// ← 04에서 추가 ②: 5173(React)에서 오는 요청의 응답을 읽어도 된다고 허락
app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

const students = [
  { id: 1, name: "한코딩" },
  { id: 2, name: "이학생" },
  { id: 3, name: "박학생" }
];

app.get("/", (req, res) => {
  res.send("안녕하세요, 한코딩 서버입니다!");
});

app.get("/hello", (req, res) => {
  console.log("GET /hello 요청이 들어왔습니다.");

  res.send("브라우저에 보내는 응답입니다.");
});

app.get("/students", (req, res) => {
  console.log("학생 목록을 요청받았습니다.");

  res.json(students);
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
