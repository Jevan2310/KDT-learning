// ask.js — 실행 중에 입력을 받아요. 입력 결과는 언제나 "문자열"이에요.
const readline = require("readline-sync");

const name = readline.question("이름: ").trim();
const age = readline.question("나이: ");

console.log(`${name}님, 반가워요!`);
console.log("age + 1         →", age + 1);
console.log("Number(age) + 1 →", Number(age) + 1);
console.log('age == 20       →', age == 20);
console.log('age === 20      →', age === 20);
console.log('age === "20"    →', age === "20");
