const readline = require("readline-sync");

// 세 명이 등록 가능한 배열이 필요하다.
const students = [];

console.log("=== 학생 관리 프로그램 ===");

let count = 0;

// 프로그램 메뉴 출력
function printMenu() {
    console.log("1. 학생 등록");
    console.log("2. 학생 목록");
    console.log("3. 학생 삭제");
    console.log("0. 프로그램 종료");
}

// 학생 등록 — 빈 이름 검사 추가
function createStudent() {
    if (count == 3) {
        console.log("더 이상 학생을 등록할 수 없습니다.");
        return;
    }

    const name = readline.question("input name:").trim();

    if (name === "") {
        console.log("이름을 입력해주세요.");
        return;
    }

    students.push(name);

    count++;

    console.log("학생 등록이 완료되었습니다.");
}


// 학생 목록 출력
function printStudents() {
    // 학생이 한 명도 등록되어 있지 않은 경우
    if (count == 0) {
        console.log("등록된 학생이 존재하지 않습니다.");
        return;
    }

    for (let i = 0; i < students.length; i++) {
        console.log(`${i + 1}번: ${students[i]}`)
    }

}

// 학생 삭제 — 정수·범위 검사 추가
function deleteStudent() {
    if (count == 0) {
        console.log("등록된 학생이 존재하지 않습니다.");
        return;
    }

    const deleteNo = readline.question("delete Student No: ");
    const number = Number(deleteNo); // "2" → 2, "abc" → NaN

    if (!Number.isInteger(number) || number < 1 || number > count) {
        console.log("해당 학생은 존재하지 않습니다.");
        return;
    }

    const deleteIdx = number - 1; // 목록 번호 → 배열 인덱스
    const deletedName = students[deleteIdx];

    students.splice(deleteIdx, 1);
    console.log(`${deletedName} 학생을 삭제했습니다.`);
    count--;
}










// controller 컨트롤을 하는 역할
while (true) {
    printMenu();
    const cmd = readline.question("command: ");

    if (cmd == 1) {
        createStudent();
    } else if (cmd == 2) {
        printStudents();
    } else if (cmd == 3) {
        deleteStudent();
    } else if (cmd == 0) {
        console.log("프로그램을 종료합니다.");
        break;
    } else {
        console.log("해당 명령어는 존재하지 않습니다.");
    }

}
