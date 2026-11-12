# 03. JavaScript — 웹 페이지에 동작 넣기

> 과정: React과정 · [노션 원문](https://app.notion.com/p/40a848f71c9b8045975ae2dc3c4bb250) · 최종 갱신일: 2026-11-09

## 한눈에 보기
[02_CSS](02_CSS.md)까지 만든 자기소개 페이지에 `script.js`를 연결해 **버튼을 누르면 소개 문장이 바뀌는 기능**과 **응원 횟수를 세는 기능**을 넣었다.
- JavaScript는 웹페이지의 **동작과 데이터 처리**를 맡는다. `<script src="script.js">`는 `</body>` 바로 위에 두고, 결과와 오류는 개발자 도구 **Console**에서 본다.
- 변수는 `const`가 기본, 재대입이 필요하면 `let`(`var`는 안 쓴다). 문자열·숫자·불리언, 연산자, 템플릿 리터럴, 조건문·반복문을 익혔다.
- `document.querySelector()`로 요소를 찾고 `textContent`로 글자를 바꾸며, `addEventListener("click", 함수)`로 클릭에 반응한다. 함수는 **호출하지 않고 이름만 전달**한다.
- 일반 JavaScript는 변수를 바꿔도 화면이 저절로 바뀌지 않는다. 값을 바꾼 뒤 `textContent`도 갱신해야 한다.
- 객체·배열로 데이터를 묶고, React에서 자주 보게 될 화살표 함수(`=>`)를 맛봤다.

## 학습 목표
- JavaScript의 역할을 이해한다.
- 변수·자료형·함수의 기본 형태를 익힌다.
- HTML 요소를 선택하고 내용을 변경한다.
- 클릭 이벤트에 반응하는 코드를 작성한다.
- 조건문과 객체·배열의 기본 사용법을 알아본다.
- 콘솔에서 실행 결과와 오류를 확인한다.

## 핵심 개념

### 1. JavaScript의 역할
JavaScript는 웹페이지에서 **동작과 데이터 처리를 구현하는 프로그래밍 언어**다. HTML·CSS에 JavaScript를 더하면 사용자의 행동에 반응할 수 있다.

| 기술 | 자기소개 페이지에서의 역할 |
|---|---|
| HTML | 소개 문장과 버튼 만들기 |
| CSS | 글자와 버튼 꾸미기 |
| JavaScript | 버튼을 누르면 소개 문장 바꾸기 |

만들 수 있는 기능 예: 버튼을 누르면 메뉴 열기, 입력한 내용을 목록에 추가하기, 선택한 조건에 맞춰 목록 바꾸기, 서버에서 데이터를 받아 화면에 표시하기.

<details><summary>수업 중 예제: 버튼을 누르면 알림창 띄우기 (onclick + 눈누 웹폰트)</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-1Thin.woff2') format('woff2');
            font-weight: 100;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-2ExtraLight.woff2') format('woff2');
            font-weight: 200;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-3Light.woff2') format('woff2');
            font-weight: 300;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-4Regular.woff2') format('woff2');
            font-weight: 400;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-5Medium.woff2') format('woff2');
            font-weight: 500;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-6SemiBold.woff2') format('woff2');
            font-weight: 600;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-7Bold.woff2') format('woff2');
            font-weight: 700;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-8ExtraBold.woff2') format('woff2');
            font-weight: 800;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-9Black.woff2') format('woff2');
            font-weight: 900;
            font-display: swap;
        }
        
        .btn {
            font-family: 'Paperozi';
            padding: 4px 16px;
            font-size: 16px;
            background-color: #1d55cf;
            color: white;
            border: none;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <button class="btn" onclick="login()">로그인</button>
</body>

<script>
    // 함수
    function login() {
        alert("로그인 성공");
    }
</script>
</html>
```
</details>

### 2. JavaScript 파일 연결과 콘솔
`index.html`, `style.css`와 같은 폴더에 `script.js`를 만들고, `index.html`의 **닫는 `</body>` 바로 위**에 연결한다.

```html
... 위 코드 생략
  <script src="script.js"></script>
</body>
```
이 위치에 두면 앞에 작성한 HTML 요소가 만들어진 뒤 스크립트가 실행된다.

```javascript
console.log("JavaScript 연결 완료!");
```
- `console.log()`는 값을 **콘솔에 출력**하는 기능이다. 화면에 글자를 표시하는 기능과는 다르다.
- 확인: 개발자 도구 → **Console** 탭 → `JavaScript 연결 완료!`가 보이면 성공.

### 3. 변수: `const`와 `let`
변수는 값을 저장하고 이름으로 다시 사용하는 방법이다. `const`·`let`은 변수를 선언하는 키워드, `userName`은 변수 이름, `"한코딩"`은 저장한 값이다.

```javascript
const userName = "한코딩";

let cheerCount = 0;
cheerCount = 1;
```

| 키워드 | 사용 기준 |
|---|---|
| `const` | 변수에 다른 값을 다시 대입하지 않을 때 (**기본으로 사용**) |
| `let` | 변수에 다른 값을 다시 대입해야 할 때 |
| `var` | **안 씀 → 쓰면 안 됨** |

```javascript
const userName = "한코딩";
userName = "이개발"; // 오류: const 변수에는 재대입할 수 없습니다.
```

**자주 만나는 값의 종류**

| 종류 | 예시 | 용도 |
|---|---|---|
| 문자열 | `"한코딩"` | 이름·문장 |
| 숫자 | `3`, `1.5` | 개수·금액 |
| 불리언 | `true`, `false` | 참·거짓 상태 |
| `null` | `null` | 의도적으로 값이 없음을 표현 |
| `undefined` | `undefined` | 값이 아직 지정되지 않은 경우 등 |

문자열은 따옴표로 감싸고, 숫자와 불리언은 따옴표 없이 쓴다.
```javascript
const age = 25; // 숫자
const ageText = "25"; // 문자열
```
모양은 비슷하지만 하나는 숫자, 하나는 문자열이다.

```javascript
// 함께 실습
const userName = "김코딩";
const goal = "직접 사용하는 서비스 만들기";
let cheerCount = 0;

console.log(userName);
console.log(goal);
console.log(cheerCount);
```

### 4. 연산자
**값 갱신** — `=`는 오른쪽 값을 왼쪽 변수에 대입한다. `count = count + 1`은 **현재 값에 1을 더해 다시 저장**한다는 뜻이다.
```javascript
let count = 0;

count = count + 1;

console.log(count);
```
```javascript
count = count + 1;

-> count += 1;

-> count++; // 증감 연산자
```

**비교 연산자** (조건문에서 사용)

| 연산자 | 의미 |
|---|---|
| `===` | 값과 자료형이 같은가 |
| `!==` | 값 또는 자료형이 다른가 |
| `>` / `<` | 큰가 / 작은가 |
| `>=` / `<=` | 크거나 같은가 / 작거나 같은가 |

수업 중 예제:
```javascript
// 사칙연산(덧셈 + , 뺄셈 - , 곱셈 *, 나눗셈 /)

let a = 11; // = 대입 연산자
let b = 5; // = 대입 연산자

// == 같다
// != 같지 않다
// <, >, <=, >=

console.log(a != b);

// / 몫
// % 나머지

console.log("a / b =", a / b); // 11을 5로 나눈 몫

console.log("a % b =", a % b); // 10을 5로 나눈 나머지


// if -> 만약에
if(a < 100) {
    console.log("a는 100보다 작습니다");
}
```
```javascript
// 변수
let a = 10;
let word = "안녕하세요";
let f = 3.14;

// 증감연산자
a++;
a--;

// 3 감소
a = a - 3;

// 3 감소 (복합 대입연산자)
a -= 3;
```

> 💡 보충: JavaScript의 `/`는 정수 몫이 아니라 나눗셈 결과를 그대로 준다. `11 / 5`는 `2.2`이고, 정수 몫이 필요하면 `Math.floor(11 / 5)`(= 2)를 쓴다. `11 % 5`는 `1`이다 (위 코드 주석의 "10을 5로"는 실제로 `a = 11`).

### 5. 템플릿 리터럴
백틱(`` ` ``)과 `${}`를 쓰면 문자열 안에 값을 넣을 수 있다.
```javascript
const userName = "한코딩";
const message = `${userName}님, 환영합니다!`;

console.log(message);
```
```javascript
const completedCount = 3;

console.log(`완료한 학습 목표는 ${completedCount}개입니다.`);
```
백틱은 작은따옴표 `'`와 다른 문자다.
```text
"안녕하세요"
'안녕하세요'
`안녕하세요`
```

### 6. 조건문 `if / else if / else`
조건의 참·거짓에 따라 실행할 코드를 나눈다.
```javascript
if (조건) {
  // 조건이 참일 때 실행
} else {
  // 조건이 거짓일 때 실행
}
```

수업 중 예제 (입력받은 숫자로 요일 출력):
```javascript
// if - else if - else문 사용법

let num = prompt("숫자를 입력해 주세요");

// 1 - 월요일
// 2 - 화요일
// ...
// 7 - 일요일

if (num == 1) {
    console.log("월요일");
} else if (num == 2) {
    console.log("화요일");
} else if (num == 3) {
    console.log("수요일");
} else if (num == 4) {
    console.log("목요일");
} else if (num == 5) {
    console.log("금요일");
} else if (num == 6) {
    console.log("토요일");
} else if (num == 7) { 
    console.log("일요일");
} else {
    console.log("해당 요일은 존재하지 않습니다.");
}
```

> 💡 보충: `prompt()`가 돌려주는 값은 문자열이다. `==`는 비교 전에 자료형을 맞춰 주므로 `"1" == 1`이 참이 되어 위 코드가 동작한다. 강의 표의 `===`는 자료형까지 같아야 참이라 `"1" === 1`은 거짓이다. `===`로 쓰려면 `Number(num) === 1`처럼 숫자로 바꿔서 비교한다.

### 7. 반복문 `for` / `while` (수업 중 예제)
```javascript
// for (변수 선언; 조건식; 증감식) {
    
// }

for (let i = 2; i < 101; i += 2) {
    console.log(i);
}
```
```javascript
console.log("for문 ========");
for (let i = 1; i < 11; i++) {

    if (i == 5) continue;
    
    console.log(i);
}


let a = 1;

console.log("while문 ========");
while(true) {
    console.log(a);
    a++;

    if (a == 11) {
        break;
    }
}
```

> 💡 보충: 첫 번째 `for`는 2부터 100까지 짝수를 출력한다. `continue`는 이번 반복만 건너뛰고(5만 빠지고 1~10 출력), `break`는 반복문 자체를 끝낸다(`while(true)`가 1~10 출력 후 멈춤).

### 8. DOM: HTML 요소 선택하고 내용 바꾸기
브라우저는 HTML 문서를 JavaScript로 접근할 수 있는 구조로 만든다. 이것이 **DOM**이다. 지금은 "HTML 요소를 찾아 내용을 읽거나 바꿀 수 있다"고 이해하면 된다.

```html
<p id="intro-message" class="intro">
  직접 사용하는 서비스를 만들고 싶습니다.
</p>
```
기존 `class`는 CSS 스타일 적용에 계속 쓰고, JavaScript에서 찾기 위해 `id`를 추가한다.

```javascript
const introMessage = document.querySelector("#intro-message");

console.log(introMessage);
```
```javascript
introMessage.textContent = "오늘부터 나의 첫 웹 앱을 만듭니다!";
```

`document.querySelector()`는 CSS 선택자와 같은 형태의 문자열을 받아 **처음 일치하는 요소**를 찾는다. 일치하는 요소가 없으면 `null`을 반환한다.

| 선택자 | 찾는 대상 |
|---|---|
| `"h1"` | 첫 번째 `h1` |
| `".intro"` | `intro` 클래스를 가진 첫 번째 요소 |
| `"#intro-message"` | 해당 ID를 가진 요소 |

`textContent`는 요소의 텍스트 내용을 **읽거나 바꿀 때** 쓴다.
```javascript
const title = document.querySelector("h1");

title.textContent = "한코딩의 개발 기록";
```

### 9. 함수
함수는 실행할 코드를 묶고 이름을 붙이는 방법이다. **만드는 것(선언)과 실행하는 것(호출)은 다르다.** 이름 뒤에 `()`를 붙여 호출해야 안의 코드가 실행된다.
```javascript
function showMessage() {
  console.log("반갑습니다!");
}

showMessage();
```

**매개변수** — 함수가 전달받은 값을 사용하는 이름.
```javascript
function greet(name) {
  console.log(`${name}님, 반갑습니다!`);
}

greet("한코딩");
greet("이개발");
```
```javascript
// 이 함수를 부르면 {} 안에 있는 코드를 실행하겠다.
function intro(userName, place, age) {
    console.log(`안녕하세요 저는 ${userName}입니다.`);
    console.log(`고향은 ${place}이고`);
    console.log(`나이는 ${age}살입니다.`);
}

intro('한코딩', '대전', 34);
intro('파이썬', '서울', 28);
```

**`return`** — 함수 실행을 끝내고 **결과를 호출한 곳으로 돌려준다.**
```javascript
function addOne(number) {
  return number + 1;
}

const result = addOne(3);

console.log(result);
```
```javascript
// 두 수를 더한 값을 반환하는 함수
function add(num1, num2) {
    return num1 + num2;    
}

// 두 수를 곱한 값을 반환하는 함수
function mul(num1, num2) {
    return num1 * num2;
}

let result1 = add(10, 20);
let result2 = mul(10, 20);

console.log("결과값: " + result1); // 30
console.log("결과값: " + result2); // 200
```

**매개변수 기본값** (수업 중 예제)
```javascript
// 매개변수의 기본값을 설정하는 방법
function add(num1 = 10, num2 = 30) {
    return num1 + num2;    
}

// 매개변수의 기본값을 설정하는 방법
function intro(userName = '한코딩') {
    return '안녕하세요 제 이름은 ' + userName;
}



let result1 = add(10, 20);
let result2 = intro('파이썬');

// `` -> 문자열에 변수 합치는 방법

console.log("결과값: " + result1);
console.log('결과값: ' + result2);
```

> 💡 보충: 기본값은 값을 넘기지 않았을 때만 쓰인다. `add(10, 20)`은 30, `add()`는 40(10 + 30)이다.

**DOM 변경을 함수로 묶기**
```javascript
const introMessage = document.querySelector("#intro-message");

function changeIntro() {
  introMessage.textContent = "오늘부터 나의 첫 웹 앱을 만듭니다!";
}

changeIntro();
```
```javascript
const word = document.querySelector('#intro-message');

function changeWord(userName) {
    word.textContent = `안녕하세요 제 이름은 ${userName}입니다.`;
}

changeWord('파이썬');
```

### 10. 이벤트: 클릭·입력에 반응하기
**이벤트**는 브라우저에서 발생하는 사건이다: 버튼 클릭, 키보드 입력, 입력값 변경, 폼 제출.
`addEventListener()`로 특정 이벤트가 발생했을 때 실행할 함수를 등록한다.

```javascript
const introMessage = document.querySelector("#intro-message");
const changeIntroButton = document.querySelector('#change-intro-button');

function changeIntro() {
    introMessage .textContent = '제 취미는 러닝이고 제 페이스는 455입니다.';
}

changeIntroButton.addEventListener("click", changeIntro);
```

실행 흐름: **버튼 클릭 → `changeIntro` 실행 → 소개 문장의 텍스트 변경**

```javascript
// 클릭했을 때 실행할 함수를 전달합니다.
changeIntroButton.addEventListener("click", changeIntro);
```
여기서는 `changeIntro()`가 아니라 **`changeIntro`를 전달**한다. `changeIntro()`라고 쓰면 이벤트를 등록하는 순간 함수가 바로 호출된다.

**HTML `onclick` 속성으로 연결하기** (수업 중 예제) — HTML 태그에 직접 호출 코드를 적는 방식도 있다.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Document</title>
</head>
<body>
    
    <p id="intro-message" class="intro">
        안녕하세요 제 이름은 파이썬입니다.
    </p>
    <button id="change-intro-button" type="button" onclick="changeWord()">버튼</button>

    <script src="script.js"></script>
</body>
</html>
```
```javascript
const introMessage = document.querySelector('#intro-message');


function changeIntro() {
    introMessage .textContent = '제 취미는 러닝이고 제 페이스는 455입니다.';
}
```

> 💡 보충: `onclick`에 적는 이름과 JavaScript에 정의한 함수 이름이 같아야 한다. 위 수업 코드는 HTML에 `changeWord()`, JS에 `changeIntro`가 있어 그대로는 연결되지 않으니, 따라 칠 때 한쪽 이름에 맞춘다. 강의의 기본 방법은 `onclick`을 빼고 `addEventListener`로 연결하는 것이다.

<details><summary>수업 중 예제: 아이디 입력할 때마다 중복 확인 (keyup + input.value)</summary>

`onkeyup` 속성 방식:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Document</title>
</head>
<body>
    
    <div>
        아이디 <input 
                type="text" id="id-input"
                onkeyup="changeId()"
        />
        <span id="id-search"></span>
    </div>

    <script src="script.js"></script>
</html>
```
```javascript
const idInput = document.querySelector("#id-input");
const idSearch = document.querySelector("#id-search");


function changeId() {
    let id = 'hancoding'; // 데이터 베이스에 있는 아이디
    
    if (idInput.value == id) {
        idSearch.textContent = '이미 존재하는 아이디입니다.'
    } else {
        idSearch.textContent = '사용 가능한 아이디입니다.'
    }
}
```

`addEventListener('keyup', ...)` 방식:
```javascript
const input = document.querySelector('#id-input');
const idMessage = document.querySelector('#id-message');

function message() {
    const dbId = 'hancoding';

    if (input.value == dbId) {
        idMessage.textContent = '이미 존재하는 아이디입니다.';
    } else {
        idMessage.textContent = '사용 가능한 아이디입니다.';
    }
}

input.addEventListener('keyup', message);
```
- `input.value`: 입력창에 지금 들어 있는 값.
- `keyup`: 키보드 키를 눌렀다 뗄 때 발생하는 이벤트.

> 💡 보충: 두 번째 JS는 `#id-message`를 찾으므로, HTML의 `<span id="id-search">`를 `id="id-message"`로 바꾸고 `onkeyup` 속성은 지워야 동작한다.
</details>

### 11. 데이터와 화면은 따로 바꾼다
```javascript
cheerCount = cheerCount + 1;
```
→ **변수의 값**을 바꾼다.
```javascript
cheerMessage.textContent = `응원을 ${cheerCount}번 받았습니다.`;
```
→ **화면에 표시할 내용**을 바꾼다.

- **일반 JavaScript에서는 변수 값을 바꿨다고 화면이 자동으로 갱신되지 않는다.**
- 값은 실행 중인 메모리에만 있으므로 **새로고침하면 다시 `0`부터** 시작한다.

> 💡 보충: React는 이 "값 바꾸고 화면도 직접 바꾸기"를 state로 해결한다 → [07_이벤트-state](07_이벤트-state.md).

### 12. 객체와 배열로 데이터 묶기
**객체**: 관련 정보를 **속성 이름과 값**으로 하나로 묶는다. 점(`.`)으로 속성에 접근한다.
```javascript
const person = {
    name: "한코딩",
    age: 34,
    hobby: "프로그래밍"
}
```
```javascript
console.log(`안녕하세요 제 이름은 ${person.name}입니다.`);
console.log(`나이는 ${person.age}살입니다.`);
console.log(`취미는 ${person.hobby}입니다.`);
```

**배열**: 여러 값을 **순서대로** 묶는다. 위치(인덱스)는 **`0`부터** 시작한다.
```javascript
// 데이터는 같은 형식이어야 하나요?
// 자바에서는 같은 형식만 넣을 수 있어요
// JS는 여러 형태의 데이터를 같이 넣을 수 있습니다.
const 변수명 = [데이터1, 데이터2, 데이터3, ...]

const goals = [
  "HTML 이해하기",
  "CSS로 꾸미기",
  "JavaScript로 동작 만들기"
];
```
```javascript
console.log(goals[0]);     // 첫 번째 값
console.log(goals[1]);     // 두 번째 값
console.log(goals.length); // 항목 수
```
```javascript
const goals = ["HTML 이해하기", "CSS로 꾸미기", "JavaScript로 동작 만들기"];


// console.log(`1    번째 목표: ${goals[    0   ]}`);
// console.log(`2    번째 목표: ${goals[    1   ]}`);
// console.log(`3    번째 목표: ${goals[    2   ]}`);

for (let i = 0; i < 3; i++) {
    console.log(`${i + 1}번째 목표: ${goals[i]}`);
}
```

**객체가 들어 있는 배열** — 목록의 각 항목이 여러 정보를 가질 때 쓴다.
```javascript
const arr = [
    // 0번째 인덱스
    {id:0, name:"한코딩", age:34},
    // 1번째 인덱스
    {id:1, name:"파이썬", age:28}
]
```
```javascript
// 배열의 0번째 인덱스에 들어가 있는 값을 꺼냅니다.
console.log(arr[0]);
console.log(arr[0].name);
console.log(arr[0].age);

// 배열의 1번째 인덱스에 들어가 있는 값을 꺼냅니다.
console.log(arr[1]);
console.log(arr[1].name);
console.log(arr[1].age);
```

### 13. 화살표 함수
함수는 **화살표 함수**로도 쓸 수 있다. 아래 세 개는 같은 결과를 만든다.
```javascript
function greet(name) {
  return `${name}님, 반갑습니다!`;
}
```
```javascript
const greet = (name) => {
  return `${name}님, 반갑습니다!`;
};
```
```javascript
// 간단한 표현식의 결과를 바로 반환할 때는 줄일 수 있다.
const greet = (name) => `${name}님, 반갑습니다!`;
```
React 예제에서 자주 만나는 형태다 ([04_React시작](04_React시작.md)). 지금은 `=>`가 나오면 **함수를 작성한 코드**라는 점만 알아두면 된다.

### 14. 오류가 나면 어디부터 볼까
먼저 개발자 도구의 **Console**을 확인한다.

| 증상 | 확인할 것 |
|---|---|
| JavaScript가 전혀 실행되지 않음 | 파일 연결·경로·저장 여부 |
| 요소를 찾지 못함 | HTML의 ID와 선택자 철자, 스크립트 위치 |
| 버튼을 누르기 전에 함수 실행 | 함수 이름 뒤에 `()`를 붙여 전달했는지 |
| 숫자는 바뀌는데 화면은 그대로 | `textContent`도 갱신했는지 |
| 코드 전체가 실행되지 않음 | 따옴표·괄호·중괄호 누락 등 문법 오류 |
| 변수 관련 오류 발생 | 이름의 대소문자, 중복 선언, `const` 재대입 |

필요한 위치에 출력 코드를 넣어 실행 흐름을 확인한다.
```javascript
function addCheer() {
  console.log("버튼 클릭 확인");

  cheerCount = cheerCount + 1;

  console.log("현재 횟수:", cheerCount);

  cheerMessage.textContent = `응원을 ${cheerCount}번 받았습니다.`;
}
```
**클릭 이벤트가 실행되는지 → 값이 예상대로 바뀌는지 → 화면을 갱신했는지** 순서로 확인한다.

## 실습 정리

### 만든 것
[02_CSS](02_CSS.md)의 자기소개 페이지에 두 기능을 추가했다.
1. **소개 변경 버튼**: 누르면 소개 문장이 "오늘부터 나의 첫 웹 앱을 만듭니다!"로 바뀐다.
2. **응원하기**: "응원 보내기" 버튼을 누를 때마다 횟수가 1씩 늘고, 5번 이상이면 "큰 힘이 됩니다!"가 붙는다.

```text
my-profile
├─ index.html
├─ style.css
├─ script.js
└─ profile.png
```

### 단계 흐름
1. `script.js`를 만들고 `</body>` 바로 위에 `<script src="script.js"></script>` 추가 → Console에 `JavaScript 연결 완료!` 확인.
2. 소개 문장 `p`에 `id="intro-message"` 추가 → `querySelector`로 찾아 `textContent`로 문장 변경.
3. 문장 변경 코드를 `changeIntro` 함수로 묶기.
4. 소개 문장 아래에 버튼(`#change-intro-button`) 추가 → `addEventListener("click", changeIntro)`로 연결.
5. 응원하기 `section` 추가 → `cheerCount`를 늘리고 화면 문구를 갱신하는 `addCheer` 작성.
6. `addCheer`에 조건문 추가: `cheerCount >= 5`이면 특별 문구.

### HTML에 추가한 부분
소개 문장 (기존 `p`에 `id` 추가) 과 바로 아래 버튼:
```html
<p id="intro-message" class="intro">
  직접 사용하는 서비스를 만들고 싶습니다.
</p>
<button id="change-intro-button" type="button">버튼</button>
```
응원 영역 (원하는 위치에):
```html
<section>
  <h2>응원하기</h2>

  <p id="cheer-message">응원을 0번 받았습니다.</p>

  <button id="cheer-button" type="button">
    응원 보내기
  </button>
</section>
```
`</body>` 바로 위:
```html
  <script src="script.js"></script>
</body>
```

### 중간 단계: 응원 횟수 세기 (조건문 넣기 전)
```javascript
const cheerMessage = document.querySelector("#cheer-message");
const cheerButton = document.querySelector("#cheer-button");

let cheerCount = 0;

function addCheer() {
  // cheerCount = cheerCount + 1;
  // cheerCount += 1;
  cheerCount++; // 증감연산자

  cheerMessage.textContent = `응원을 ${cheerCount}번 받았습니다.`;
}

cheerButton.addEventListener("click", addCheer);
```

### 최종 `script.js` (전체)
소개 변경과 응원 기능을 합친 코드. 정리할 때 비교용으로 쓰고, **같은 코드를 기존 코드 아래에 중복해서 붙이지 않는다.**
```javascript
const introMessage = document.querySelector("#intro-message");
const changeIntroButton = document.querySelector("#change-intro-button");

const cheerMessage = document.querySelector("#cheer-message");
const cheerButton = document.querySelector("#cheer-button");

let cheerCount = 0;

function changeIntro() {
  introMessage.textContent = "오늘부터 나의 첫 웹 앱을 만듭니다!";
}

function addCheer() {
  cheerCount = cheerCount + 1;

  if (cheerCount >= 5) {
    cheerMessage.textContent =
      `응원을 ${cheerCount}번 받았습니다. 큰 힘이 됩니다!`;
  } else {
    cheerMessage.textContent =
      `응원을 ${cheerCount}번 받았습니다.`;
  }
}

changeIntroButton.addEventListener("click", changeIntro);
cheerButton.addEventListener("click", addCheer);
```

### 직접 바꿔보기 (강의의 연습 과제 모음)
- `console.log`에 출력할 문장을 바꾼다. 변수에 새 숫자를 대입하고 출력한다.
- `h1`을 선택해 제목을 바꾼다.
- 마지막 `changeIntro();`를 주석 처리(`// changeIntro();`)하고 새로고침해서 결과를 비교한다.
- 버튼 문구와 클릭 시 표시할 소개 문장을 바꾼다.
- 증가 단위를 `cheerCount = cheerCount + 2;`로 바꾸고, 새로고침하면 횟수가 어떻게 되는지 본다.
- 특별 문구 기준과 문구를 바꾸고, 기준 바로 전과 기준에 도달했을 때를 각각 확인한다.
- 자신의 이름·관심사를 객체로, 학습 목표 세 가지를 배열로 작성하고 첫 번째 목표와 전체 개수를 콘솔에 출력한다.

### 미션
**기본**
- 소개 변경 문구를 수정합니다.
- 응원 메시지의 기준을 바꿉니다.

**도전**
- 응원 횟수를 `0`으로 되돌리는 버튼을 추가합니다.
- 횟수를 초기화할 때 화면의 문구도 함께 갱신합니다.

## 헷갈리기 쉬운 점
- `<script>`는 `</body>` 바로 위에 둔다. 요소보다 먼저 실행되면 `querySelector`가 요소를 못 찾고 `null`이 된다.
- `console.log()`는 콘솔 출력이지 화면 표시가 아니다. 화면을 바꾸려면 `textContent`.
- JavaScript가 안 돌면: HTML에 `script`를 넣었는지, 파일 이름이 `script.js`인지, 두 파일을 모두 저장했는지.
- `const`에는 재대입할 수 없다 (오류). 재대입이 필요하면 `let`, `var`는 쓰지 않는다.
- `25`(숫자)와 `"25"`(문자열)는 다른 값이다.
- 템플릿 리터럴은 작은따옴표 `'`가 아니라 **백틱** `` ` ``으로 감싼다.
- 함수를 **선언만** 하면 실행되지 않는다. `changeIntro();`처럼 `()`를 붙여 호출해야 한다.
- 반대로 `addEventListener`에는 `changeIntro()`가 아니라 `changeIntro`를 넘긴다. `()`를 붙이면 등록할 때 바로 실행된다.
- 변수 값을 바꿔도 화면은 자동으로 안 바뀐다. 값 변경과 `textContent` 갱신을 둘 다 해야 한다.
- 새로고침하면 변수 값은 처음(`0`)으로 돌아간다.
- `querySelector`는 일치하는 요소 중 **첫 번째 하나**만 찾는다.
- 배열 인덱스는 `0`부터. 첫 번째 값은 `goals[0]`, 개수는 `goals.length`.
- 기존 `class`는 CSS용으로 그대로 두고, JavaScript용 `id`를 추가한다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| JS 파일 연결 | `<script>` (`</body>` 바로 위) | `<script src="script.js"></script>` |
| 콘솔에 출력 | `console.log()` | `console.log("현재 횟수:", cheerCount);` |
| 바꾸지 않을 값 | `const` | `const userName = "한코딩";` |
| 바뀔 값 | `let` | `let cheerCount = 0;` |
| 1 더하기 | `+= 1` / `++` | `cheerCount++;` |
| 나머지 | `%` | `a % b` |
| 문자열에 값 넣기 | 템플릿 리터럴 | `` `응원을 ${cheerCount}번 받았습니다.` `` |
| 같은지 비교 | `===` / `!==` | `num === 1` |
| 조건 분기 | `if` / `else if` / `else` | `if (cheerCount >= 5) { ... } else { ... }` |
| 정해진 횟수 반복 | `for` | `for (let i = 0; i < 3; i++) { ... }` |
| 조건이 참인 동안 반복 | `while` | `while (true) { ... break; }` |
| 이번 반복 건너뛰기 / 반복 끝내기 | `continue` / `break` | `if (i == 5) continue;` |
| 요소 찾기 | `document.querySelector()` | `document.querySelector("#intro-message")` |
| 글자 읽기·바꾸기 | `textContent` | `introMessage.textContent = "...";` |
| 입력창 값 읽기 | `value` | `input.value` |
| 함수 만들기 / 호출 | `function` / `이름()` | `function changeIntro() { ... }` → `changeIntro();` |
| 결과 돌려주기 | `return` | `return num1 + num2;` |
| 매개변수 기본값 | `매개변수 = 값` | `function add(num1 = 10, num2 = 30)` |
| 클릭에 반응 | `addEventListener("click", 함수)` | `cheerButton.addEventListener("click", addCheer);` |
| 키 입력에 반응 | `addEventListener("keyup", 함수)` | `input.addEventListener('keyup', message);` |
| HTML에서 바로 연결 | `onclick` 속성 | `<button onclick="login()">` |
| 알림창 / 입력창 | `alert()` / `prompt()` | `alert("로그인 성공");` |
| 관련 정보 묶기 | 객체 | `person.name` |
| 여러 값 순서대로 | 배열 | `goals[0]`, `goals.length` |
| 객체 배열에서 꺼내기 | `배열[인덱스].속성` | `arr[1].name` |
| 짧은 함수 | 화살표 함수 | `const greet = (name) => ...;` |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문과 강조된 내용에서 뽑았다.

<details><summary>Q. 자기소개 페이지에서 HTML, CSS, JavaScript는 각각 무엇을 맡았나?</summary>

HTML: 소개 문장과 버튼 만들기. CSS: 글자와 버튼 꾸미기. JavaScript: 버튼을 누르면 소개 문장 바꾸기 (동작과 데이터 처리).
</details>

<details><summary>Q. `<script src="script.js"></script>`를 `</body>` 바로 위에 두는 이유는?</summary>

앞에 작성한 HTML 요소가 만들어진 뒤 스크립트가 실행되게 하려고. 그래야 `querySelector`가 요소를 찾을 수 있다.
</details>

<details><summary>Q. `console.log("안녕")`의 결과는 어디에 보이나?</summary>

개발자 도구의 Console 탭. 웹페이지 화면에는 표시되지 않는다.
</details>

<details><summary>Q. `const`와 `let`은 각각 언제 쓰나? `var`는?</summary>

`const`: 다른 값을 다시 대입하지 않을 때 (기본). `let`: 재대입이 필요할 때. `var`는 쓰지 않는다.
</details>

<details><summary>Q. `const userName = "한코딩";` 다음에 `userName = "이개발";`을 실행하면?</summary>

오류. `const` 변수에는 재대입할 수 없다.
</details>

<details><summary>Q. `const age = 25;`와 `const ageText = "25";`의 차이는?</summary>

`25`는 숫자, `"25"`는 문자열. 따옴표가 있으면 문자열이다.
</details>

<details><summary>Q. `count = count + 1`의 뜻과, 같은 일을 하는 짧은 표현 두 가지는?</summary>

현재 값에 1을 더해 다시 저장한다. `count += 1;`, `count++;`
</details>

<details><summary>Q. 변수 `userName`을 넣어 "한코딩님, 환영합니다!"를 만드는 코드는?</summary>

`` `${userName}님, 환영합니다!` `` — 백틱과 `${}`를 쓰는 템플릿 리터럴.
</details>

<details><summary>Q. `document.querySelector(".intro")`는 무엇을 찾나? 일치하는 요소가 없으면?</summary>

`intro` 클래스를 가진 **첫 번째** 요소. 없으면 `null`을 반환한다.
</details>

<details><summary>Q. (강의 질문) `changeIntro` 함수 선언 아래의 `changeIntro();`를 주석 처리하고 새로고침하면?</summary>

소개 문장이 바뀌지 않는다. 함수를 만들기만 하고 호출하지 않았기 때문이다.
</details>

<details><summary>Q. `changeIntroButton.addEventListener("click", changeIntro());`라고 쓰면 무엇이 문제인가?</summary>

이벤트를 등록하는 순간 함수가 바로 호출된다 (버튼을 누르기 전에 실행). 클릭 때 실행할 함수는 `changeIntro`처럼 이름만 전달한다.
</details>

<details><summary>Q. `cheerCount`는 늘어나는데 화면 숫자가 그대로다. 원인은?</summary>

일반 JavaScript는 변수 값을 바꿔도 화면이 자동으로 갱신되지 않는다. `cheerMessage.textContent = ...`로 화면도 바꿔야 한다.
</details>

<details><summary>Q. (강의 질문) 응원을 여러 번 보낸 뒤 새로고침하면 응원 횟수는?</summary>

다시 0부터 시작한다. 값이 실행 중인 메모리에만 있기 때문이다.
</details>

<details><summary>Q. 최종 코드에서 4번째와 5번째 클릭 때 문구는 각각?</summary>

4번째: "응원을 4번 받았습니다." 5번째: "응원을 5번 받았습니다. 큰 힘이 됩니다!" (`cheerCount >= 5`부터 특별 문구)
</details>

<details><summary>Q. 비교 연산자 `===`는 무엇을 비교하나?</summary>

값과 자료형이 모두 같은지. 다른지 볼 때는 `!==`.
</details>

<details><summary>Q. `const goals = ["HTML 이해하기", "CSS로 꾸미기", "JavaScript로 동작 만들기"];`에서 첫 번째 목표와 항목 수를 출력하려면?</summary>

`console.log(goals[0]);`, `console.log(goals.length);` — 인덱스는 0부터 시작한다.
</details>

<details><summary>Q. `arr = [{id:0, name:"한코딩", age:34}, {id:1, name:"파이썬", age:28}]`에서 `arr[1].name`의 값은?</summary>

`"파이썬"`. 1번 인덱스(두 번째) 객체의 `name` 속성.
</details>

<details><summary>Q. `return`은 무슨 일을 하나? `add(10, 20)`이 30을 돌려줄 때 그 값은 어디로 가나?</summary>

함수 실행을 끝내고 결과를 호출한 곳으로 돌려준다. `let result1 = add(10, 20);`이면 `result1`에 30이 저장된다.
</details>

<details><summary>Q. `` function greet(name) { return `${name}님, 반갑습니다!`; } ``를 한 줄 화살표 함수로 바꾸면?</summary>

```javascript
const greet = (name) => `${name}님, 반갑습니다!`;
```
간단한 표현식의 결과를 바로 반환할 때는 `{ }`와 `return`을 생략할 수 있다.
</details>

<details><summary>Q. 수업 예제에서 `for (let i = 1; i < 11; i++)` 안에 `if (i == 5) continue;`가 있으면 무엇이 출력되나?</summary>

1~10 중 5를 뺀 숫자. `continue`는 그 회차만 건너뛴다.
</details>

## 완료 체크
- [ ] JavaScript 파일을 연결하고 콘솔을 확인했다.
- [ ] `const`와 `let`의 사용 기준을 구분했다.
- [ ] HTML 요소를 선택하고 내용을 변경했다.
- [ ] 클릭 이벤트에 함수를 연결했다.
- [ ] 응원 횟수와 화면을 함께 갱신했다.
- [ ] 조건에 따라 다른 문구를 표시했다.
- [ ] 객체의 속성과 배열의 항목에 접근했다.

## 질문 노트

<details><summary>Q. 맥에서 백틱은 어떻게 입력해요? <sub>2026-11-12 · 연습 중</sub></summary>

**A.** (강의 밖 내용) 맥 한글 자판에서는 숫자 1 왼쪽 키를 누르면 백틱 대신 `₩`가 나온다.
- 영문 입력으로 바꾸고 숫자 1 왼쪽 키를 누르면 `` ` ``가 나온다
- 한글 입력 상태에서는 **Option(⌥) + 숫자 1 왼쪽 키**를 누른다
- 자주 쓰면 설정을 바꿔 둔다: 시스템 설정 → 키보드 → 입력 소스 편집 → 한국어(2벌식) → **"₩ 대신 ` 입력"** 켜기. 메뉴 위치는 macOS 버전마다 조금 다를 수 있다

백틱 자리에 `₩`가 들어가면(`₩${userName}님₩`) 템플릿 리터럴이 안 되고 오류가 난다. 앞뒤를 모두 백틱으로 감쌌는지 확인한다.

관련: 이 파일의 "5. 템플릿 리터럴" 섹션
</details>
