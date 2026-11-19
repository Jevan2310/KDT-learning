// request-flow.js — 프론트엔드 · 백엔드 · 데이터베이스가 하는 일을 흉내 낸 코드
// 진짜 서버는 아니에요. 누가 무엇을 하는지 "순서"만 보여 줘요. (진짜 서버는 03회차)

// 🗄 데이터베이스 역할: 데이터를 보관하는 창고
const database = [
  { id: 1, title: "React 복습하기", completed: true },
  { id: 2, title: "Node.js 실행하기", completed: false },
];

// 🍳 백엔드 역할: 요청을 받아 검사하고, 창고에서 꺼내거나 넣고, 결과를 돌려준다
function backend(request) {
  console.log(`   [백엔드] 요청 받음: ${request.type}`);

  if (request.type === "목록 보기") {
    console.log("   [백엔드] 창고에서 목록을 꺼냄");
    return { ok: true, data: database };
  }

  if (request.type === "추가") {
    // 서버에서도 검사한다 — 화면을 거치지 않고 요청이 올 수도 있으니까
    if (request.title.trim() === "") {
      console.log("   [백엔드] 제목이 비어 있어서 거절");
      return { ok: false, message: "제목을 입력하세요" };
    }

    const newTask = { id: database.length + 1, title: request.title, completed: false };
    database.push(newTask); // 서버 배열은 React state가 아니라서 push로 넣어요
    console.log("   [백엔드] 창고에 저장함");
    return { ok: true, data: newTask };
  }

  return { ok: false, message: "모르는 요청이에요" };
}

// 🙋 프론트엔드 역할: 요청을 보내고, 돌아온 응답을 화면에 보여 준다 (여기서는 터미널이 화면)
function frontend(request) {
  console.log(`[프론트] 요청 보냄 → ${request.type}`);
  const response = backend(request);

  if (response.ok) {
    console.log("[프론트] 응답 받음 → 화면에 표시:", response.data);
  } else {
    console.log(`[프론트] 응답 받음 → 오류 안내 표시: ${response.message}`);
  }
  console.log("");
}

frontend({ type: "목록 보기" });
frontend({ type: "추가", title: "서버 역할 이해하기" });
frontend({ type: "추가", title: "   " });
frontend({ type: "목록 보기" });
