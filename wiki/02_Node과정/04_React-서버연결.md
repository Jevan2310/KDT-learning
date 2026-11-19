# 04. React와 서버 연결하기

> 과정: Node과정 · [노션 원문](https://app.notion.com/p/414848f71c9b803d9eeccb39146e4d94) · 최종 갱신일: 2026-11-12

## 한눈에 보기
- [03_서버-데이터보내기](03_서버-데이터보내기.md)의 학생 목록 API(`GET /students`)를 **React 화면에서 요청해 표시**했다. 흐름: **React에서 요청 → Node.js에서 응답 → state 저장 → 화면 표시**.
- API 서버(`node server.js`, 3000)와 React 개발 서버(`npm run dev`, 5173)를 **터미널 두 개로 각각 실행**한다.
- 포트가 달라 **출처가 다르므로**, 서버에 `cors` 패키지로 **CORS**를 설정해야 React의 JavaScript가 응답을 읽을 수 있다.
- `fetch()`는 Promise를 돌려준다. `async/await`로 응답을 기다리고 `response.json()`으로 본문을 꺼내 `setStudents(data)`로 state에 저장 → `map()`으로 목록 표시.
- `useEffect(() => {…}, [])`로 **컴포넌트가 처음 나타날 때** 요청하고, `try/catch/finally` + `response.ok`로 **로딩·오류·빈 목록**을 구분해 보여준다. 요청과 응답은 개발자 도구 **Network** 탭에서 확인한다.

## 학습 목표
- React 개발 서버와 API 서버를 각각 실행한다.
- CORS를 설정한다.
- `fetch`로 서버에 요청한다.
- `async/await`로 응답을 받아 처리한다.
- `useEffect`에서 학생 목록을 조회한다.
- 로딩·오류·빈 목록을 구분해 표시한다.

## 핵심 개념

### 1. 지금까지 만든 것 연결하기
앞에서는 `http://localhost:3000/students`에 **브라우저 주소창으로** 직접 접속해 JSON을 확인했다. 이번에는 **React 코드가** 이 주소로 요청한다.

```text
React 화면
    ↓ GET /students 요청
Node.js 서버
    ↓ 학생 목록 JSON 응답
React state에 저장
    ↓
학생 목록 표시
```

**서버는 데이터를 보내고, React는 받은 데이터로 화면을 만든다.**

### 2. 두 프로그램을 각각 실행한다

| 프로젝트 | 역할 | 실행 명령 | 주소 |
|---|---|---|---|
| `student-server` | 학생 데이터를 제공하는 API 서버 | `node server.js` | `http://localhost:3000` |
| `my-profile-react` | 데이터를 표시하는 React 화면 | `npm run dev` | 터미널에 표시된 주소 (예: `http://localhost:5173`) |

- VS Code 창을 각각 열면 프로젝트와 터미널을 구분하기 쉽다.
- **두 터미널 모두 실행 상태로 유지**한다.
- 서버를 켠 뒤 브라우저에서 `http://localhost:3000/students`부터 먼저 확인한다.

> 💡 보충: `my-profile-react`는 강의에서 부르는 React 프로젝트 이름이다. React과정에서 만든 Vite 프로젝트([04_React시작](../01_React과정/04_React시작.md))를 쓰면 된다.

### 3. CORS는 왜 설정할까?

```text
React:   http://localhost:5173
API:     http://localhost:3000
```

- 브라우저는 **프로토콜·호스트·포트가 모두 같아야 같은 출처**로 본다. 위 두 주소는 같은 컴퓨터지만 **포트가 달라 다른 출처**다.
- React 페이지의 JavaScript가 **다른 출처의 API 응답을 읽으려면, 서버가 알맞은 CORS 응답 헤더를 보내야** 한다.
- **주소창으로 API를 직접 여는 것과, 다른 페이지의 JavaScript가 응답을 읽는 것은 다르다.** (주소창으로는 잘 보이는데 React에서는 CORS 오류가 날 수 있다.)
- CORS는 **브라우저가 응답을 읽을 수 있는지** 제어하는 설정이다. 로그인이나 서버 접근 권한을 대신하지 않는다. 👉 [Express CORS 공식 안내](https://expressjs.com/en/resources/middleware/cors/)
- `localhost`와 `127.0.0.1`도 브라우저에서는 **다른 호스트**로 취급된다. 두 프로젝트 모두 `localhost` 주소로 쓴다.

**서버 설정 방법** — `cors` 패키지를 설치하고 `app.use()`로 등록한다.

```javascript
const cors = require("cors");
```

```javascript
app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
```

- `app.use()`는 **요청 처리 과정에 공통 기능을 추가**할 때 쓴다. 여기서는 CORS 헤더를 설정하는 기능을 추가한다.
- 위치: `const app = express();` 아래, **라우트(`app.get`)보다 앞**.
- `origin`은 **실제 React 주소**에 맞춘다. React가 다른 포트로 실행됐다면 바꾸고, 주소 끝에 `/`는 붙이지 않는다.

### 4. `fetch()`로 서버에 요청하기

```javascript
fetch("http://localhost:3000/students");
```

- `fetch()`는 브라우저에서 HTTP 요청을 보낼 때 쓰는 기능이다. **별도 패키지를 설치하지 않아도 된다.**
- 위 호출은 **기본적으로 GET 요청**을 보낸다.
- 결과는 즉시 준비되지 않는다. **서버와 통신한 뒤 나중에 도착**한다.

### 5. `async`와 `await`로 응답 기다리기
**Promise**: 나중에 완료될 작업의 결과를 다루는 객체. `fetch()`도 Promise를 반환한다. 이번에는 `async/await`로 그 결과를 처리한다.

```javascript
async function loadStudents() {
  const response = await fetch(
    "http://localhost:3000/students"
  );

  const data = await response.json();

  console.log(data);
}
```

| 코드 | 역할 |
|---|---|
| `async function` | `await`를 쓸 비동기 함수 정의 |
| `await fetch(...)` | 응답 정보를 받을 때까지 **현재 함수의 진행을 잠시 중단** |
| `response` | 상태 코드·헤더·본문 등을 다루는 **응답 객체** |
| `await response.json()` | 응답 본문을 읽고 JavaScript 값으로 변환 |
| `data` | 변환된 학생 배열 |

- **`await`는 현재 함수의 진행만 기다리게 한다.** 브라우저 전체를 멈추는 것은 아니다.
- **`response` 자체는 학생 배열이 아니다.** JSON 본문을 읽은 `data`가 학생 배열이다.

> 💡 보충: `await`는 `async`가 붙은 함수 안에서만 쓸 수 있다. `response.json()`도 본문을 읽는 데 시간이 걸려 Promise를 돌려주므로 `await`를 붙인다.

### 6. 응답 데이터를 state에 저장하기
받은 데이터를 화면에 표시하려면 **state**로 관리한다 ([07_이벤트-state](../01_React과정/07_이벤트-state.md)).

```text
서버 응답
→ response.json()
→ data에 학생 배열
→ setStudents(data)
→ React 렌더링
→ map()으로 목록 표시
```

- 목록 표시는 `map()` + `key={student.id}` ([06_목록-조건부렌더링](../01_React과정/06_목록-조건부렌더링.md)).
- **서버 데이터가 바뀌어도 이미 열린 React 화면이 저절로 바뀌지는 않는다.** 다시 요청해야 한다.

### 7. 실패한 요청 처리하기 — `try/catch`와 `response.ok`
서버가 꺼져 있거나 주소가 잘못될 수 있다. 비동기 작업의 실패는 `try/catch`로 처리한다.

```javascript
try {
  // 시도할 작업
} catch (error) {
  // 작업 중 오류가 발생했을 때 처리
}
```

**서버가 `404`나 `500`을 응답해도 `fetch()`가 자동으로 오류를 던지지는 않는다.** 응답의 성공 여부도 확인한다.

```javascript
if (!response.ok) {
  throw new Error("학생 목록을 불러오지 못했습니다.");
}
```

- `response.ok`: 상태 코드가 **200~299이면 `true`**
- `throw new Error(...)`: 오류를 발생시켜 `catch`로 이동
- 👉 [MDN: Fetch 사용하기](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

> 💡 보충: `fetch()`가 스스로 실패(→ `catch`)하는 것은 서버가 꺼져 있거나 CORS로 막히는 등 **응답 자체를 못 받았을 때**다. 응답은 왔지만 404·500인 경우는 `response.ok`로 직접 걸러야 한다.

**관리할 상태**

| state | 역할 |
|---|---|
| `students` | 받은 학생 목록 |
| `isLoading` | 요청 중인지 |
| `error` | 사용자에게 보여줄 오류 문구 |

요청을 시작하면 로딩을 켜고, 성공하면 데이터를 저장하고, 실패하면 오류 문구를 표시한다.

### 8. `useEffect`로 처음 표시될 때 요청하기
버튼을 누르지 않아도 **컴포넌트가 화면에 나타날 때** 학생 목록을 조회하게 만든다.
`useEffect`는 **컴포넌트를 외부 시스템과 연결하는 작업**에 쓰는 Hook이다. 이번에는 외부 API에서 데이터를 가져오는 데 쓴다.

```javascript
useEffect(() => {
  // 외부 시스템과 연결할 작업
}, []);
```

- 마지막 배열은 **의존성 배열**이다. 이번 요청 주소는 고정이고 Effect가 읽는 변경 가능한 props·state가 없으므로 **빈 배열 `[]`** 을 쓴다.
- 빈 배열이면 일반적인 state 변경마다 Effect를 다시 실행하지 않는다. 컴포넌트가 새로 **마운트**(화면에 처음 나타남)되면 다시 실행된다.

**Effect 함수 자체에 `async`를 붙이지 않는다.** Effect 안에 비동기 함수를 정의하고 호출한다.

```javascript
// 이번에 사용할 형태
useEffect(() => {
  async function loadStudents() {
    // 요청 처리
  }

  loadStudents();
}, []);
```

> 💡 보충: Effect 함수는 아무것도 반환하지 않거나 **정리 함수**를 반환해야 한다. `async`를 붙이면 Promise를 반환하게 되어 React가 정리 함수로 쓸 수 없다.

### 9. 화면 표시 순서 — 삼항 연산자 이어 쓰기
종합 실습 코드는 조건을 위에서 아래로 차례대로 검사한다 ([06_목록-조건부렌더링](../01_React과정/06_목록-조건부렌더링.md) 5·6장).

1. 요청 중이면 → 로딩 문구
2. 오류가 있으면 → 오류 문구
3. 목록이 비었으면 → 빈 목록 안내
4. 나머지 → 학생 목록

삼항 연산자가 길게 이어져 있지만 **위에서 아래로 순서대로 읽으면** 된다.

### 10. `try·catch·finally`와 `ignore` 정리 함수

| 부분 | 실행 내용 |
|---|---|
| `try` | 요청 · 응답 확인 · 데이터 저장 |
| `catch` | 실패 내용 기록과 오류 문구 설정 |
| `finally` | **성공·실패와 관계없이** 로딩 종료 |

```javascript
return () => {
  ignore = true;
};
```

- Effect가 정리될 때 실행할 **정리 함수**다.
- 컴포넌트가 사라지거나 Effect가 다시 시작된 뒤 **이전 요청의 결과가 늦게 도착**할 수 있다. `ignore`는 그 이전 결과로 state를 바꾸지 않게 막는다.
- **요청 자체를 취소하는 코드는 아니다.** 안전한 요청 처리를 위한 기본 코드로 쓴다. 👉 [React 공식 문서: Effect에서 데이터 가져오기](https://react.dev/learn/synchronizing-with-effects)

**개발 중 요청 로그가 두 번 보인다면** — React **Strict Mode**는 개발 중 Effect의 설정·정리 과정을 한 번 더 실행할 수 있다. 그래서 서버 터미널에 요청 로그가 두 번 찍힐 수 있다. 이 이유만으로 Strict Mode를 지우지 않아도 된다 (`main.jsx`의 `<StrictMode>`, [04_React시작](../01_React과정/04_React시작.md)).

### 11. Network 탭에서 요청 확인하기
개발자 도구 **Network** 탭을 열고 페이지를 새로고침한 뒤 `students` 요청을 선택한다.

| 항목 | 확인할 것 |
|---|---|
| Request URL | `http://localhost:3000/students` |
| Request Method | `GET` |
| Status Code | 정상이라면 `200` |
| Response | 서버가 보낸 학생 배열 |

수업 화면: Network 목록에 `main.jsx`, `App.jsx`, `StudentList.jsx` 같은 React 파일들과 함께 **`students` 요청이 두 줄**(Strict Mode) 보였고, Response 탭에 `[{"id":1,"name":"…"},{"id":2,…},{"id":3,…}]` 형태의 JSON 배열이 한 줄로 표시됐다.

**화면이 안 나올 때 React 코드만 보지 말고, 요청이 실제로 갔는지·어떤 응답을 받았는지 확인한다.**

### 정리
**React에서 요청 → Node.js에서 응답 → state 저장 → 화면 표시**

| 개념 | 역할 |
|---|---|
| CORS | 다른 출처의 응답을 브라우저 JS가 읽을 수 있도록 설정 |
| `fetch()` | HTTP 요청 |
| `async/await` | 비동기 결과를 받아 순서대로 처리 |
| `response.ok` | HTTP 성공 상태 확인 |
| `response.json()` | JSON 본문을 읽어 JavaScript 값으로 변환 |
| `useEffect` | 외부 API와 연결하는 작업 실행 |
| `useState` | 데이터·로딩·오류 상태 관리 |

## 실습 정리

### 실습 1. 서버에 CORS 추가하기
`student-server` 터미널에서 서버를 종료(`Ctrl + C`)하고 설치한다.

```bash
npm install cors
```

`server.js` 상단에 `const cors = require("cors");`, `const app = express();` 아래·라우트 앞에 `app.use(cors({ … }))`를 넣는다. 위치만 보면 다음과 같다 (**기존 학생 배열과 라우트는 지우지 않는다**).

```javascript
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

// 기존 students 배열과 app.get() 코드 유지

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
```

수업 중 강사 화면의 `server.js` 전체:

```javascript
const express = require('express');
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.get("/", (req, res) => {
    console.log("메인 경로에 ~~~이 접속했습니다.")
    res.json({
        id:1,
        name: "한코딩"
    });
});

const students = [
  { id: 1, name: "한코딩" },
  { id: 2, name: "이학생" },
  { id: 3, name: "박학생" }
];

app.get("/students", (rq, rs) => {
    console.log("학생 목록을 요청받았습니다.");

    rs.json(students);
})

app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`)
})
```

> 💡 보충: 강사 코드는 `(rq, rs)`처럼 매개변수 이름을 바꿔 썼다. 이름은 자유라서 `req, res`와 똑같이 동작한다(첫 번째가 요청, 두 번째가 응답). [03_서버-데이터보내기](03_서버-데이터보내기.md)의 종합 코드에 CORS 두 부분만 추가해도 된다.

서버를 다시 실행한다.

```bash
node server.js
```

### 실습 2. 버튼으로 요청해 보기
React 프로젝트에 `src/components/StudentList.jsx`를 만든다.

```jsx
function StudentList() {
  async function loadStudents() {
    const response = await fetch(
      "http://localhost:3000/students"
    );

    const data = await response.json();

    console.log(data);
  }

  return (
    <section>
      <h2>학생 목록</h2>

      <button type="button" onClick={loadStudents}>
        학생 목록 요청
      </button>
    </section>
  );
}

export default StudentList;
```

`App.jsx`에서 가져온다.

```jsx
import StudentList from "./components/StudentList.jsx";
```

기존 `<main>` 안에 `<StudentList />`를 추가한다. 수업 화면의 `App.jsx`:

```jsx
import { useState } from 'react'
import './App.css'
import StudentList from './components/StudentList'

const App = () => {

  return (
    <main>
      <StudentList />
    </main>
  )
}

export default App

```

버튼을 누르고 두 곳을 확인한다.

| 위치 | 확인할 결과 |
|---|---|
| 서버 터미널 | 학생 목록 요청 로그 |
| 브라우저 Console | 학생 객체가 담긴 배열 |

이벤트에는 **함수 자체를 전달**한다: `onClick={loadStudents}` (`loadStudents()` 아님, [07_이벤트-state](../01_React과정/07_이벤트-state.md) 1장).

> 💡 보충: 수업 `App.jsx`의 `import { useState } from 'react'`는 이 화면에서 쓰지 않는다 (지워도 된다). Vite에서는 `'./components/StudentList'`처럼 `.jsx`를 빼고 가져와도 된다.

### 실습 3. 응답 데이터를 state에 저장해 목록 표시
`StudentList.jsx`를 다음으로 교체한다.

```jsx
import { useState } from "react";

function StudentList() {
  const [students, setStudents] = useState([]);

  async function loadStudents() {
    const response = await fetch(
      "http://localhost:3000/students"
    );

    const data = await response.json();

    setStudents(data);
  }

  return (
    <section>
      <h2>학생 목록</h2>

      <button type="button" onClick={loadStudents}>
        학생 목록 요청
      </button>

      <ul>
        {students.map((student) => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </section>
  );
}

export default StudentList;
```

**직접 확인하기**: 서버의 학생 이름을 바꾸고 서버를 재시작 → React에서 요청 버튼을 다시 눌러 바뀐 이름이 나오는지 본다. (버튼을 다시 누르기 전에는 화면이 그대로다.)

### 실습 4 (종합). 로딩·오류·빈 목록 표시하기
**`src/components/StudentList.jsx` (최종)**

```jsx
import { useEffect, useState } from "react";

// 컴포넌트
function StudentList() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      try {
        const response = await fetch(
          "http://localhost:3000/students"
        );

        if (!response.ok) {
          throw new Error(
            "학생 목록을 불러오지 못했습니다."
          );
        }

        const data = await response.json();

        if (!ignore) {
          setStudents(data);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setError(
            "학생 목록을 불러오지 못했습니다. 서버와 주소를 확인해주세요."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="student-list">
      <h2>학생 목록</h2>

      {isLoading ? (
        <p role="status">학생 목록을 불러오는 중입니다.</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : students.length === 0 ? (
        <p>등록된 학생이 없습니다.</p>
      ) : (
        <>
          <p>전체 학생: {students.length}명</p>

          <ul>
            {students.map((student) => (
              <li key={student.id}>
                {student.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default StudentList;
```

> 💡 보충: `isLoading`의 초기값이 `true`라서 첫 화면은 바로 로딩 문구다. `catch (error)`의 `error`는 이 블록 안에서만 쓰는 오류 객체이고, 화면에 보여주는 문구는 state `error`에 따로 저장한다 (이름이 같아도 서로 다른 값). `role="status"`·`role="alert"`는 화면 낭독기 같은 보조 기술에 "상태 안내"·"경고"임을 알려주는 속성이고, 아래 CSS에서는 `[role="alert"]` 선택자로 오류 문구를 빨갛게 만든다.

**`App.css`에 추가** — 데이터는 서버에서 오지만 화면 모양은 React 프로젝트의 CSS로 정한다.

```css
.student-list {
  max-width: 560px;
  margin: 32px auto;
  padding: 24px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.student-list ul {
  padding: 0;
  list-style: none;
}

.student-list li {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.student-list [role="alert"] {
  color: #b91c1c;
}
```

`App.jsx`는 실습 2와 같다 (`<main>` 안에 `<StudentList />`).

> 💡 보충: 같은 `StudentList.jsx`를 Spring API(`http://localhost:8080/api/students`, `@CrossOrigin`)에 연결하는 것은 [Spring 06_JSON-API-React연결](../03_Spring과정/06_JSON-API-React연결.md)에 있다.

### 실습 5. 정상·실패·빈 목록·로딩 확인하기

| 확인 | 방법 | 기대 결과 |
|---|---|---|
| 정상 응답 | 두 서버를 실행하고 React 페이지 새로고침 | 학생 목록과 "전체 학생: 3명" |
| 서버 연결 실패 | API 서버만 `Ctrl + C`로 종료 → React 새로고침 | 오류 문구 (빨간색). 확인 후 서버 재실행 → 새로고침 |
| 빈 목록 | 서버 배열을 `const students = [];`로 잠시 바꾸고 서버 재시작 → 새로고침 | "등록된 학생이 없습니다." 확인 후 데이터 복원 |
| 로딩 표시 | 페이지 새로고침 | 로컬 서버는 응답이 빨라 로딩 문구가 **잠깐만** 보일 수 있다 |
| Network 탭 | 개발자 도구 Network → 새로고침 → `students` 선택 | `GET`, `200`, Response에 학생 배열 |

- 이미 목록을 받은 상태에서는 서버만 꺼도 오류로 바뀌지 않는다. **새 요청이 생기도록 새로고침**해야 한다.

## 헷갈리기 쉬운 점
- **서버와 React는 각각 실행한다.** 터미널 두 개를 모두 켜 둔다 (`node server.js` + `npm run dev`).
- **같은 컴퓨터라도 포트가 다르면 다른 출처**다. 프로토콜·호스트·포트가 모두 같아야 같은 출처.
- **주소창에서 JSON이 보인다고 React에서도 읽히는 건 아니다.** 다른 페이지의 JS가 읽으려면 서버에 CORS 설정이 필요하다.
- **CORS `origin`은 실제 React 주소와 정확히 같아야** 한다. 끝에 `/` 없음, `localhost` ≠ `127.0.0.1`, 포트가 5174 등으로 바뀌면 맞춰 고친다.
- **`app.use(cors(…))`는 라우트보다 앞에.** CORS는 로그인·권한 기능이 아니다.
- **`response`는 학생 배열이 아니다.** `await response.json()`의 결과(`data`)가 배열이다.
- **`fetch()`는 404·500에도 오류를 던지지 않는다.** `response.ok`를 확인해 직접 `throw`한다.
- **`await`는 그 함수만 기다린다.** 브라우저 전체가 멈추지 않는다.
- **`useEffect` 콜백에 `async`를 직접 붙이지 않는다.** 안에서 async 함수를 만들고 호출한다.
- **의존성 배열 `[]`를 빼먹지 않는다.** state 변경과 맞물리면 요청이 계속 반복될 수 있다.
- **개발 중 요청이 두 번 가는 것은 Strict Mode 때문**이며 정상이다.
- **서버 데이터가 바뀌어도 열린 화면은 그대로**다. 새로 요청(버튼·새로고침)해야 한다.
- **`ignore`는 요청 취소가 아니라** 늦게 온 이전 결과로 state를 바꾸지 않게 하는 장치다.

**연결이 안 될 때 확인할 것**

| 증상 | 확인할 내용 |
|---|---|
| 서버 연결 오류 | API 서버 실행 여부, 포트 |
| CORS 오류 | 서버 CORS 설정과 실제 React 출처 일치 여부 |
| `404` | `/students` 경로 철자 |
| JSON 변환 오류 | 학생 JSON 대신 HTML이나 문장이 응답됐는지 |
| `map is not a function` | 응답이 배열인지 |
| 학생 이름이 안 보임 | 서버 데이터에 `name`이 있는지 |
| 수정한 데이터가 안 보임 | 서버 재시작과 React 새로고침 여부 |
| 요청이 계속 반복됨 | Effect의 의존성 배열과 state 변경 관계 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| CORS 패키지 설치 | `npm install cors` | `student-server` 폴더에서 |
| CORS 허용 | `app.use(cors({ origin }))` | `origin: "http://localhost:5173"` |
| GET 요청 보내기 | `fetch(주소)` | `fetch("http://localhost:3000/students")` |
| 응답 기다리기 | `async function` + `await` | `const response = await fetch(…);` |
| JSON 본문 꺼내기 | `await response.json()` | `const data = await response.json();` |
| 성공 여부 확인 | `response.ok` | `if (!response.ok) { throw new Error("…"); }` |
| 실패 처리 | `try / catch / finally` | `finally`에서 `setIsLoading(false)` |
| 받은 데이터 저장 | `useState` + set 함수 | `setStudents(data);` |
| 처음 나타날 때 요청 | `useEffect(…, [])` | 안에 async 함수 정의 후 호출 |
| 늦은 결과 무시 | `ignore` + 정리 함수 | `return () => { ignore = true; };` |
| 목록 표시 | `map()` + `key` | `<li key={student.id}>{student.name}</li>` |
| 상태별 화면 | 삼항 연산자 이어 쓰기 | 로딩 ? … : 오류 ? … : 빈 목록 ? … : 목록 |
| 요청·응답 확인 | 개발자 도구 Network 탭 | URL·Method·Status·Response |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목과 강조된 내용에서 뽑았다.

<details><summary>Q. 이번 회차에서 실행해야 하는 프로그램 두 개와 각각의 명령은?</summary>

API 서버(`student-server`) → `node server.js` (3000). React 화면(`my-profile-react`) → `npm run dev` (예: 5173). 두 터미널 모두 실행 상태로 둔다.
</details>

<details><summary>Q. (강의 질문) CORS는 왜 설정하나? `http://localhost:5173`과 `http://localhost:3000`은 같은 출처인가?</summary>

다른 출처다. 브라우저는 프로토콜·호스트·포트가 **모두 같아야** 같은 출처로 보는데 포트가 다르다. React 페이지의 JS가 다른 출처의 응답을 읽으려면 **서버가 CORS 응답 헤더**를 보내야 하므로 서버에 CORS를 설정한다.
</details>

<details><summary>Q. 주소창에서 `http://localhost:3000/students`는 잘 보이는데 React에서는 CORS 오류가 난다. 왜인가?</summary>

주소창으로 API를 직접 여는 것과 **다른 페이지(5173)의 JavaScript가 응답을 읽는 것**은 다르다. 후자는 서버의 CORS 허용이 필요하다. `origin`이 실제 React 주소(끝 `/` 없이, `localhost`로)와 같은지도 확인한다.
</details>

<details><summary>Q. 서버에 CORS를 추가하는 코드와 위치는? CORS가 로그인·권한 확인을 대신하나?</summary>

`npm install cors` → `const cors = require("cors");` → `const app = express();` 아래, 라우트보다 앞에 `app.use(cors({ origin: "http://localhost:5173" }));`. CORS는 브라우저가 응답을 읽을 수 있는지만 제어하며 로그인·권한을 대신하지 않는다.
</details>

<details><summary>Q. `fetch("http://localhost:3000/students")`는 어떤 요청을 보내나? 결과는 바로 쓸 수 있나?</summary>

기본적으로 **GET** 요청. 별도 패키지 없이 쓴다. 결과는 서버와 통신한 뒤 **나중에** 도착하므로(Promise) `await`로 기다린다.
</details>

<details><summary>Q. `const response = await fetch(…)`에서 `response`는 학생 배열인가? 배열을 얻으려면?</summary>

아니다. 상태 코드·헤더·본문을 다루는 **응답 객체**다. `const data = await response.json();`으로 본문을 읽어 JavaScript 값으로 바꾼 `data`가 학생 배열이다.
</details>

<details><summary>Q. `await`를 만나면 브라우저 전체가 멈추나?</summary>

아니다. **현재 함수의 진행만** 잠시 기다린다.
</details>

<details><summary>Q. 서버가 404를 응답했을 때 `fetch()`는 `catch`로 가나? 어떻게 처리하나?</summary>

자동으로 오류를 던지지 않는다. `if (!response.ok) { throw new Error("…"); }`로 직접 오류를 발생시켜 `catch`로 보낸다. `response.ok`는 상태 코드가 200~299일 때 `true`.
</details>

<details><summary>Q. 받은 학생 목록을 화면에 표시하는 흐름은?</summary>

서버 응답 → `response.json()` → `data`(학생 배열) → `setStudents(data)` → React 렌더링 → `students.map((student) => <li key={student.id}>…</li>)`로 목록 표시.
</details>

<details><summary>Q. 서버의 학생 이름을 바꾸고 서버를 재시작했다. 이미 열린 React 화면도 바뀌나?</summary>

저절로 바뀌지 않는다. 버튼을 다시 누르거나 새로고침해서 **다시 요청**해야 바뀐 데이터가 보인다.
</details>

<details><summary>Q. `useEffect(() => {…}, [])`에서 빈 배열 `[]`의 의미는? 왜 빈 배열을 썼나?</summary>

**의존성 배열**이다. Effect가 읽는 변경 가능한 props·state가 없고 요청 주소가 고정이라 빈 배열을 썼다. 일반적인 state 변경마다 다시 실행되지 않고, 컴포넌트가 마운트될 때 실행된다.
</details>

<details><summary>Q. `useEffect(async () => {…}, [])`처럼 쓰지 않는 이유와 대신 쓰는 형태는?</summary>

Effect 함수 자체에 `async`를 붙이지 않는다. Effect 안에 `async function loadStudents() {…}`를 정의하고 `loadStudents();`로 호출한다.
</details>

<details><summary>Q. `try`, `catch`, `finally`는 종합 코드에서 각각 무엇을 하나?</summary>

`try`: 요청·응답 확인·데이터 저장. `catch`: 실패 내용 기록(`console.error`)과 오류 문구 설정. `finally`: 성공·실패와 관계없이 로딩 종료(`setIsLoading(false)`).
</details>

<details><summary>Q. 종합 코드의 화면 표시 순서는? 서버가 빈 배열을 보내면 무엇이 보이나?</summary>

① 요청 중이면 로딩 문구 ② 오류가 있으면 오류 문구 ③ 목록이 비었으면 빈 목록 안내 ④ 나머지는 학생 목록. 빈 배열이면 "등록된 학생이 없습니다."
</details>

<details><summary>Q. `ignore`와 `return () => { ignore = true; }`는 무슨 역할인가? 요청을 취소하나?</summary>

Effect가 정리될 때 실행되는 **정리 함수**다. 컴포넌트가 사라지거나 Effect가 다시 시작된 뒤 늦게 도착한 이전 요청 결과로 state를 바꾸지 않게 막는다. **요청 자체를 취소하지는 않는다.**
</details>

<details><summary>Q. 개발 중 서버 터미널에 "학생 목록을 요청받았습니다."가 두 번 찍힌다. 고장인가?</summary>

아니다. React **Strict Mode**가 개발 중 Effect의 설정·정리를 한 번 더 실행할 수 있어서다. 이 이유만으로 Strict Mode를 지우지 않아도 된다.
</details>

<details><summary>Q. (강의 질문) 목록을 이미 받은 상태에서 API 서버만 끄면 화면이 오류로 바뀌나?</summary>

바뀌지 않는다. 새 요청이 생기도록 **새로고침**해야 오류 문구가 보인다.
</details>

<details><summary>Q. Network 탭의 `students` 요청에서 무엇을 확인하나?</summary>

Request URL(`http://localhost:3000/students`), Request Method(`GET`), Status Code(정상 `200`), Response(서버가 보낸 학생 배열). 화면이 안 나오면 요청이 실제로 갔는지와 응답부터 본다.
</details>

## 완료 체크
- [ ] React와 API 서버를 각각 실행했다.
- [ ] 실제 React 주소에 맞춰 CORS를 설정했다.
- [ ] 버튼으로 요청하고 응답을 확인했다.
- [ ] 서버 데이터를 state에 저장해 표시했다.
- [ ] `useEffect`에서 초기 목록을 조회했다.
- [ ] 로딩·오류·빈 목록을 구분했다.
- [ ] Network 탭에서 요청과 응답을 확인했다.

## 질문 노트

<details><summary>Q. 서버·CORS 설정이 맞는데 React 화면이 안 떠요. 무엇을 봐야 해요? <sub>2026-11-19 · 개념 정리 예시 따라 하던 중</sub></summary>

**A.** 파일 이름과 import 경로가 글자 하나까지 같은지 본다. 컴포넌트 파일을 `StudentsList.jsx`(s가 하나 더)로 만들고 `App.jsx`에서는 `./components/StudentList`로 가져오면 Vite가 파일을 못 찾아 브라우저에 빨간 오류 화면을 띄운다.

```text
Failed to resolve import "./components/StudentList" from "src/App.jsx". Does the file exist?
```

파일 이름을 import와 같게 바꾸면 된다 (VS Code 파일 목록에서 `Enter` 또는 우클릭 → Rename). 서버 쪽 문제(CORS·꺼짐)와는 오류 모양이 다르다. 그런 문제는 화면은 뜨고 버튼을 누를 때 Console에 오류가 나온다.

관련: 이 파일의 "실습 2. 버튼으로 요청해 보기"
</details>

<details><summary>Q. Console에 `content.js`, `chrome-extension://` 오류가 잔뜩 떠요. 내 코드 문제예요? <sub>2026-11-19 · 개념 정리 예시 따라 하던 중</sub></summary>

**A.** (강의 밖 내용) 아니다. 크롬에 설치된 **확장 프로그램**이 페이지마다 끼워 넣는 코드가 낸 오류다. 각 줄 오른쪽의 출처를 보고 구별한다. `content.js`, `chrome-extension://…`, 처음 보는 외부 주소는 확장 프로그램이 낸 것이다. `StudentList.jsx:9`, `localhost:3000`처럼 내 파일이나 내 서버가 보이면 내 코드다.

화면 테스트는 **시크릿 창**(`Cmd + Shift + N`)에서 하면 확장 프로그램이 기본으로 꺼져 있어 내 코드 메시지만 남는다. 지금 창에서 하려면 Console의 ⊘(Clear console)로 지우고 다시 실행한다.

관련: 이 파일의 "11. Network 탭에서 요청 확인하기"
</details>
