// menu.js — 0을 누를 때까지 메뉴를 계속 보여 주는 반복 (while + break + continue)
const readline = require("readline-sync");

let count = 0;

while (true) {
  console.log("\n[메뉴] 1. 인사하기  2. 횟수 보기  0. 종료");
  const cmd = readline.question("선택: ").trim();

  if (cmd === "1") {
    if (count === 3) {
      console.log("인사는 세 번까지만 해요.");
      continue; // 아래 코드를 건너뛰고 다시 메뉴로
    }
    count++;
    console.log(`안녕하세요! (${count}번째 인사)`);
  } else if (cmd === "2") {
    console.log(`지금까지 ${count}번 인사했어요.`);
  } else if (cmd === "0") {
    console.log("프로그램을 종료합니다.");
    break; // 반복문 밖으로 나가기
  } else {
    console.log("0, 1, 2 중에서 골라 주세요.");
  }
}

console.log("반복문 밖으로 나왔어요. 여기서 프로그램이 끝나요.");
