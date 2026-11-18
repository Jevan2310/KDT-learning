# 04. 느린 API에 대응하는 화면 만들기 — 로딩·오류·중복 클릭 처리

> 과정: 비동기과정 · [노션 원문](https://app.notion.com/p/419848f71c9b80e69d1ef040a0255d78) · 최종 갱신일: 2026-11-18

## 한눈에 보기
- 3초 늦게 응답하는 Express 학생 목록 API(`slow-student-server`, **3002**)와 항상 500을 보내는 `/students-error`를 만들고, React의 `SlowStudentList` 컴포넌트에서 **버튼을 눌러** 조회한다 (이번에는 `useEffect` 없이 이벤트 핸들러에서 요청).
- state 다섯 개(`students`, `isLoading`, `error`, `hasLoaded`, `count`)로 **요청 전·요청 중·실패·빈 결과·성공**을 구분한다. `hasLoaded`는 "아직 안 불렀음"과 "불렀는데 비어 있음"을 가른다.
- 요청 흐름: **시작**(로딩 켜기·이전 결과 초기화) → `fetch` + `response.ok` 검사 → **성공**(목록 저장) / **실패**(`catch`에서 오류 안내) → **`finally`에서 로딩 종료**.
- 요청 중에는 `disabled={isLoading}`으로 **요청 버튼 두 개를 비활성화**해 중복 클릭을 막는다. `disabled`를 붙이지 않은 **카운터는 기다리는 동안에도 동작**한다 → 함수가 기다리는 것 ≠ 실행 스레드가 막히는 것.
- **HTTP 오류 응답(500)을 받은 것과 응답을 받지 못한 것(서버 꺼짐)은 다르다.** Node.js의 타이머 대기는 실행 스레드를 붙잡지 않지만, 일반적인 Spring MVC의 `Thread.sleep()`은 그 요청 처리 스레드가 기다린다.

## 학습 목표
- Express API에 응답 지연을 추가한다.
- 요청 중 로딩 문구를 표시한다.
- 요청 버튼을 비활성화해 중복 클릭을 방지한다.
- HTTP 오류와 연결 실패를 처리한다.
- 응답을 기다리는 동안 다른 화면 기능이 동작하는지 확인한다.
- Node.js와 Spring MVC에서 기다림의 의미를 비교한다.

## 핵심 개념

### 1. 서버가 느리면 화면은 어떻게 보여야 할까?
아무 안내가 없으면 사용자는 버튼이 안 눌린 건지, 서버가 처리 중인지 알 수 없어 **같은 버튼을 여러 번 누를 수 있다.**

| 상황 | 필요한 화면 처리 |
|---|---|
| 요청 중 | 로딩 안내 |
| 요청 중인 버튼 | 비활성화 |
| 성공 | 받은 데이터 표시 |
| 실패 | 오류 안내와 재시도 가능 상태 |
| 빈 결과 | 데이터가 없다는 안내 |

### 2. 느린 API — 타이머 콜백에서 응답하기

```javascript
setTimeout(() => {
  res.json(students);
}, 3000);
```

- 즉시 응답하지 않고 **타이머 콜백에서** 응답한다.
- 서버가 반복문으로 3초 동안 계산하는 것이 아니다. **타이머를 기다리는 동안 다른 요청을 처리할 수 있다** ([03_블로킹-논블로킹](03_블로킹-논블로킹.md) `/slow-nonblocking`).

### 3. 오류 응답 API — `res.status(500)`
서버에 연결되었더라도 요청 처리가 실패할 수 있다. 실습을 위해 **항상 오류를 응답하는 경로**를 만든다.

```javascript
app.get("/students-error", (req, res) => {
  setTimeout(() => {
    res.status(500).json({
      message: "학생 목록 처리 중 오류가 발생했습니다."
    });
  }, 1500);
});
```

| 코드 | 역할 |
|---|---|
| `res.status(500)` | 응답 상태 코드를 **서버 오류**로 지정 |
| `.json(...)` | 오류 설명을 JSON으로 응답 |

이 경우는 서버가 꺼진 것이 아니라 **서버가 실패를 나타내는 HTTP 응답을 보낸 것**이다.

### 4. React에서 관리할 상태
이번에는 **버튼을 눌렀을 때만 요청**하므로 조회 시작에 **`useEffect`를 쓰지 않는다.** 사용자의 클릭은 **이벤트 핸들러**에서 처리한다 ([04_React-서버연결](../02_Node과정/04_React-서버연결.md)은 처음 표시될 때 `useEffect`로 요청).

| state | 역할 | 초기값 |
|---|---|---|
| `students` | 받은 학생 목록 | 빈 배열 |
| `isLoading` | 요청 중인지 | `false` |
| `error` | 오류 안내 | 빈 문자열 |
| `hasLoaded` | 조회에 성공한 적이 있는지 | `false` |
| `count` | 독립적으로 조작할 카운터 | `0` |

**`hasLoaded`가 필요한 이유** — 두 상태를 구분하려고:
- 아직 요청하지 않아서 배열이 비어 있음
- 정상 조회했지만 학생이 없어서 배열이 비어 있음

### 5. 요청 함수의 네 단계
`loadStudents(path)`는 경로를 받아 `http://localhost:3002${path}`로 요청한다 (전체 코드는 실습 정리).

**① 요청 시작** — 로딩을 켜고 이전 결과를 초기화한다.

```javascript
setIsLoading(true);
setError("");
setHasLoaded(false);
setStudents([]);
```

이번 화면은 재조회 중에 **이전 목록을 지우는** 방식이다. 서비스에 따라 기존 목록을 유지하면서 로딩을 표시할 수도 있다.

**② 성공** — 받은 배열을 저장하고 조회 성공을 기록한다.

```javascript
setStudents(data);
setHasLoaded(true);
```

**③ 실패** — 연결 실패, 직접 던진 HTTP 오류(`response.ok` 검사), JSON 해석 오류 등이 모두 이 흐름에서 처리된다.

```javascript
catch (error) {
  // 오류 기록과 안내
}
```

**④ 마무리** — 성공하든 실패하든 로딩을 종료한다.

```javascript
finally {
  setIsLoading(false);
}
```

**응답이 아예 끝나지 않는 요청에 시간제한을 거는 기능은 이번 코드에 포함하지 않았다.**

### 6. 요청 중 버튼 비활성화하기 — `disabled`

```jsx
<button
  type="button"
  onClick={() => loadStudents("/students")}
  disabled={isLoading}
>
  {isLoading ? "불러오는 중..." : "학생 목록 불러오기"}
</button>
```

- `disabled`가 `true`이면 버튼을 일반적인 사용자 조작으로 누를 수 없다. 버튼 글자도 로딩 중에는 `불러오는 중...`으로 바꾼다.
- 값을 넘겨 호출해야 하므로 `onClick`에 **화살표 함수를 전달**한다 ([07_이벤트-state](../01_React과정/07_이벤트-state.md) 1장).
- 요청 함수 시작 부분에서도 검사한다. 이미 요청 중이면 다시 실행하지 않는 **보조 처리**다.

```javascript
if (isLoading) {
  return;
}
```

- **버튼 비활성화는 사용자 화면의 중복 클릭을 줄이는 방법이다. 중요한 등록·결제 작업의 중복 방지는 서버에서도 별도로 설계해야 한다.**

오류 실험 버튼도 추가한다. **한 요청이 진행되는 동안 두 요청 버튼을 모두 비활성화**한다.

```jsx
<button
  type="button"
  onClick={() => loadStudents("/students-error")}
  disabled={isLoading}
>
  오류 응답 테스트
</button>
```

> 💡 보충: `if (isLoading) return;`이 "보조"인 이유 — 핸들러 안의 `isLoading`은 그 핸들러가 만들어진 렌더링의 값(스냅샷)이라, `setIsLoading(true)` 직후 바로 바뀌지 않는다 ([07_이벤트-state](../01_React과정/07_이벤트-state.md) 4장). 그래서 화면에서는 `disabled`가 주된 방어다.

### 7. 로딩·오류·결과 표시 순서
버튼 아래에 삼항 연산자를 이어 써서 위에서부터 차례로 검사한다 ([06_목록-조건부렌더링](../01_React과정/06_목록-조건부렌더링.md) 5장).

```jsx
{isLoading ? (
  <p role="status">서버 응답을 기다리는 중입니다.</p>
) : error ? (
  <p role="alert">{error}</p>
) : hasLoaded ? (
  students.length === 0 ? (
    <p>등록된 학생이 없습니다.</p>
  ) : (
    <ul>
      {students.map((student) => (
        <li key={student.id}>{student.name}</li>
      ))}
    </ul>
  )
) : (
  <p>버튼을 눌러 학생 목록을 조회해주세요.</p>
)}
```

1. 요청 중이면 → 로딩 안내
2. 실패했다면 → 오류 안내
3. 조회에 성공했다면 → 목록 또는 빈 결과 안내
4. 아직 조회하지 않았다면 → 시작 안내

| 속성 | 역할 |
|---|---|
| `role="status"` | 상태 안내임을 보조 기술에 전달 |
| `role="alert"` | 오류처럼 주의가 필요한 안내임을 전달 |

### 8. 기다리는 동안 다른 버튼 누르기 — 카운터
요청 대기 중에도 다른 JavaScript 이벤트를 처리할 수 있는지 확인한다. 다른 state 선언 아래에 추가:

```jsx
const [count, setCount] = useState(0);
```

JSX에 카운터 추가 (**이 버튼에는 `disabled={isLoading}`을 붙이지 않는다**):

```jsx
<div className="counter-area">
  <p>카운터: {count}</p>

  <button
    type="button"
    onClick={() => setCount((prevCount) => prevCount + 1)}
  >
    숫자 증가
  </button>
</div>
```

`setCount((prevCount) => prevCount + 1)`은 이전 상태를 기준으로 바꾸는 함수형 업데이트다 ([07_이벤트-state](../01_React과정/07_이벤트-state.md) 5장).

- 학생 목록 불러오기를 누르고 로딩 문구가 보이는 동안 숫자 증가를 누르면 **카운터가 바로 바뀌고**, 약 3초 뒤 학생 목록이 표시된다.
- `await fetch()`로 요청 결과를 기다리는 동안에도 **브라우저는 다른 클릭을 처리**할 수 있다.
- **조회 함수의 진행이 기다리는 것과, 브라우저의 JavaScript 실행 스레드가 막히는 것은 다르다** ([01_실행순서-기다림](01_실행순서-기다림.md) 9장).

### 9. HTTP 오류 응답 vs 응답을 받지 못함 — Network 탭으로 확인

| 요청 | 예상 결과 |
|---|---|
| `/students` | 대기 후 **200** 응답 |
| `/students-error` | 대기 후 **500** 응답 |
| 서버 종료 상태의 요청 | **연결 실패** |

- `fetch()`는 서버가 500을 응답했다는 이유만으로 **자동 거부되지 않는다.** 그래서 이 검사가 필요하다.

```javascript
if (!response.ok) {
  throw new Error("요청에 실패했습니다.");
}
```

- 반면 **서버에 연결할 수 없는 경우** 등에는 `fetch()` 자체가 거부되어 `catch`로 이어진다.
- **HTTP 오류 응답을 받은 것과 응답을 받지 못한 것은 다르다.**

### 10. Node.js와 Spring MVC에서의 기다림
두 서버 모두 응답이 늦어질 수 있지만, **어떤 실행 자원이 기다리는지**는 다를 수 있다.

**이번 Node.js 예제**

```javascript
setTimeout(() => {
  res.json(students);
}, 3000);
```

타이머를 등록하고 핸들러 실행을 끝낸다. 응답은 나중에 보내며, 기다리는 동안 **이벤트 루프는 다른 작업을 처리**할 수 있다.

**일반적인 Spring MVC 예제**

```java
Thread.sleep(3000);
```

요청 처리 중 이 코드를 실행하면 **그 요청을 처리하는 스레드가 약 3초 동안 기다린다.** 다른 요청을 처리할 스레드가 남아 있다면 서버는 다른 요청에도 응답할 수 있다.

| 상황 | 기다림의 영향 |
|---|---|
| Node.js의 타이머 대기 | JavaScript 실행 스레드를 대기 시간 내내 점유하지 않음 |
| Node.js의 긴 반복 계산 | JavaScript 실행 스레드를 점유해 다른 처리 지연 |
| 일반적인 Spring MVC의 `Thread.sleep()` | 해당 요청 처리 스레드를 점유하며 대기 |

- Spring MVC의 스레드 구성에는 다른 선택지도 있지만, 여기서는 **일반적인 요청 처리 스레드 방식**으로 비교한다 ([02_SpringBoot시작](../03_Spring과정/02_SpringBoot시작.md) — Express의 요청 처리 ↔ Spring MVC의 요청 처리).
- **브라우저는 서버 구현 방식과 관계없이 응답을 기다리므로 로딩·실패 안내가 필요하다.**

### 11. 비동기 처리와 화면 상태 연결하기

```text
사용자가 조회 버튼 클릭
        ↓
로딩 시작 · 이전 오류와 결과 초기화
        ↓
서버 요청
        ↓
서버가 나중에 응답
        ↓
성공: 데이터 표시
실패: 오류 안내
        ↓
로딩 종료 · 버튼 다시 활성화
```

응답을 기다리는 동안에도 독립적인 카운터는 동작한다. 중요한 것은 **모든 작업을 무조건 함께 실행하는 것이 아니다.**
- 기다리는 동안 가능한 작업은 진행한다.
- 중복 실행하면 곤란한 동작은 제한한다.
- 결과와 실패를 사용자에게 알려준다.

### 정리

| 개념 | 핵심 |
|---|---|
| 응답 지연 | 요청 후 결과가 나중에 도착하는 상황 |
| 로딩 상태 | 사용자가 처리 중임을 알 수 있도록 안내 |
| `disabled` | 요청 중인 버튼 조작 제한 |
| `response.ok` | HTTP 성공 상태 확인 |
| `catch` | 요청 처리 실패 대응 |
| `finally` | 요청 처리가 끝난 뒤 로딩 종료 |
| 독립적인 이벤트 | 요청 대기 중에도 다른 클릭 처리 가능 |

## 실습 정리

### 실행 구성

| 프로젝트 | 역할 | 준비 | 실행 | 주소 |
|---|---|---|---|---|
| `slow-student-server` (새 폴더) | 느린 학생 목록 API | `npm init -y` → `npm install express cors` | `node server.js` | `http://localhost:3002` |
| 기존 React 프로젝트 | `SlowStudentList` 화면 | 없음 | `npm run dev` | 예: `http://localhost:5173` |

> 💡 보충: "기존 React 프로젝트"는 [04_React-서버연결](../02_Node과정/04_React-서버연결.md)에서 쓴 Vite 프로젝트(`my-profile-react`)를 쓰면 된다. 이전 회차처럼 **터미널 두 개를 모두 실행 상태로** 둔다.

### 실습 1. 느린 학생 목록 API (`slow-student-server`)
이전 블로킹 비교 서버(`blocking-server`)와 구분하려고 별도 폴더를 쓴다.

```bash
npm init -y
```

```bash
npm install express cors
```

**`server.js`**

```javascript
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3002;

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

app.get("/students", (req, res) => {
  console.log("학생 목록 요청 도착");

  setTimeout(() => {
    console.log("학생 목록 응답");

    res.json(students);
  }, 3000);
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
```

- React 개발 서버의 실제 주소가 다르면 CORS의 `origin`도 바꾼다 ([04_React-서버연결](../02_Node과정/04_React-서버연결.md) 3장).
- `node server.js` 실행 → 브라우저에서 `http://localhost:3002/students` 접속 → **약 3초 뒤** 학생 목록이 보이는지 확인한다.
- 그다음 **`app.listen()` 위에** 핵심 개념 3장의 `/students-error` 라우트를 추가하고, 서버를 재시작한 뒤 `http://localhost:3002/students-error`를 확인한다.

### 실습 2. 요청 함수 먼저 만들기 (5장 단계 코드)
React 프로젝트에 `src/components/SlowStudentList.jsx`를 만든다.

```jsx
import { useState } from "react";

function SlowStudentList() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  async function loadStudents(path) {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setHasLoaded(false);
    setStudents([]);

    try {
      const response = await fetch(
        `http://localhost:3002${path}`
      );

      if (!response.ok) {
        throw new Error(
          `학생 목록 요청에 실패했습니다. 상태 코드: ${response.status}`
        );
      }

      const data = await response.json();

      setStudents(data);
      setHasLoaded(true);
    } catch (error) {
      console.error(error);

      setError(
        "학생 목록을 불러오지 못했습니다. 서버와 요청 주소를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <h2>학생 목록 조회</h2>

      <button
        type="button"
        onClick={() => loadStudents("/students")}
      >
        학생 목록 불러오기
      </button>
    </section>
  );
}

export default SlowStudentList;
```

이어서 핵심 개념 6장(`disabled`, 오류 테스트 버튼) → 7장(표시 순서) → 8장(카운터)을 차례로 추가하면 아래 최종 코드가 된다.

### 실습 3 (종합). 최종 `SlowStudentList.jsx`

```jsx
import { useState } from "react";

function SlowStudentList() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [count, setCount] = useState(0);

  async function loadStudents(path) {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setHasLoaded(false);
    setStudents([]);

    try {
      const response = await fetch(
        `http://localhost:3002${path}`
      );

      if (!response.ok) {
        throw new Error(
          `학생 목록 요청에 실패했습니다. 상태 코드: ${response.status}`
        );
      }

      const data = await response.json();

      setStudents(data);
      setHasLoaded(true);
    } catch (error) {
      console.error(error);

      setError(
        "학생 목록을 불러오지 못했습니다. 서버와 요청 주소를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="slow-student-list">
      <h2>느린 학생 목록 API</h2>

      <div className="request-buttons">
        <button
          type="button"
          onClick={() => loadStudents("/students")}
          disabled={isLoading}
        >
          {isLoading
            ? "불러오는 중..."
            : "학생 목록 불러오기"}
        </button>

        <button
          type="button"
          onClick={() => loadStudents("/students-error")}
          disabled={isLoading}
        >
          오류 응답 테스트
        </button>
      </div>

      {isLoading ? (
        <p role="status">
          서버 응답을 기다리는 중입니다.
        </p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : hasLoaded ? (
        students.length === 0 ? (
          <p>등록된 학생이 없습니다.</p>
        ) : (
          <ul>
            {students.map((student) => (
              <li key={student.id}>
                {student.name}
              </li>
            ))}
          </ul>
        )
      ) : (
        <p>버튼을 눌러 학생 목록을 조회해주세요.</p>
      )}

      <div className="counter-area">
        <p>카운터: {count}</p>

        <button
          type="button"
          onClick={() =>
            setCount((prevCount) => prevCount + 1)
          }
        >
          숫자 증가
        </button>
      </div>
    </section>
  );
}

export default SlowStudentList;
```

> 💡 보충: `catch (error)`의 `error`는 그 블록 안에서만 쓰는 오류 객체이고, 화면에 보여주는 문구는 state `error`에 따로 저장한다 (이름이 같아도 서로 다른 값). [04_React-서버연결](../02_Node과정/04_React-서버연결.md) 종합 코드와 같은 구조다.

**`App.jsx`에 연결** — 상단에 추가:

```jsx
import SlowStudentList from "./components/SlowStudentList.jsx";
```

기존 JSX의 원하는 위치에 추가:

```jsx
<SlowStudentList />
```

실습 중 화면이 복잡하면 이전 예제 컴포넌트(예: `StudentList`)의 표시를 잠시 빼도 된다.

**`App.css` 아래에 추가**

```css
.slow-student-list {
  max-width: 640px;
  margin: 32px auto;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background-color: white;
}

.request-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slow-student-list button {
  padding: 10px 14px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #334155;
  font: inherit;
  cursor: pointer;
}

.slow-student-list button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slow-student-list button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

.slow-student-list [role="status"] {
  color: #1d4ed8;
}

.slow-student-list [role="alert"] {
  color: #b91c1c;
}

.counter-area {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}
```

> 💡 보충: `button:disabled`는 비활성화된 버튼만 고르는 선택자라서, 요청 중에는 버튼이 흐려지고(`opacity: 0.5`) 마우스 모양이 금지 표시로 바뀐다. `focus-visible`은 키보드로 버튼에 초점이 갔을 때 테두리를 보여준다.

### 실습 4. 상황별로 확인하기 (강의의 네 가지 상황 + 대기 중 카운터)

| 확인 | 방법 | 기대 결과 |
|---|---|---|
| 정상 응답 | 학생 목록 불러오기 클릭 | 로딩 문구 → 요청 버튼 두 개 비활성화 → 약 3초 뒤 목록 → 버튼 다시 활성화 |
| HTTP 오류 | 오류 응답 테스트 클릭 | 약 1.5초 뒤 500 응답 → `response.ok` 검사에서 오류 발생 → 오류 안내 → 로딩 종료·버튼 다시 활성화 |
| 서버 연결 실패 | Express 서버 종료 → 학생 목록 불러오기 클릭 | 오류 안내. 확인 후 서버 재실행 → 다시 눌러 정상 조회 확인 |
| 빈 목록 | 서버 배열을 `const students = [];`로 잠시 바꾸고 재시작 → 다시 조회 | "등록된 학생이 없습니다." 확인 후 원래 데이터 복원 |
| 대기 중 다른 기능 | 학생 목록 불러오기 → 로딩 중에 숫자 증가 클릭 | 카운터가 바로 바뀌고, 약 3초 뒤 목록 표시 |

Network 탭에서 `/students`(200), `/students-error`(500), 서버 종료 상태의 요청(연결 실패)을 각각 확인한다.

## 헷갈리기 쉬운 점
- **이번엔 `useEffect`로 요청하지 않는다.** 버튼 클릭으로만 요청하므로 이벤트 핸들러에서 처리한다.
- **`hasLoaded` 없이 `students.length === 0`만 보면** "아직 안 불렀음"과 "불렀는데 학생이 없음"을 구분할 수 없다.
- **`isLoading` 초기값은 `false`**다 (버튼을 누르기 전엔 요청 중이 아님). 처음부터 요청하던 [04_React-서버연결](../02_Node과정/04_React-서버연결.md)은 `true`였다.
- **`finally`에서 로딩을 끈다.** 성공·실패 양쪽에 따로 쓰지 않는다. 빠뜨리면 버튼이 계속 비활성 상태로 남는다.
- **요청 버튼 두 개 모두 `disabled={isLoading}`**, 카운터 버튼에는 붙이지 않는다.
- **`disabled`는 화면 쪽 방어일 뿐**이다. 등록·결제 같은 중요한 작업의 중복 방지는 서버에서도 설계한다.
- **`fetch()`는 500에도 자동 거부되지 않는다.** `response.ok`로 확인해 `throw`한다. 서버가 꺼져 있으면 `fetch()` 자체가 거부된다.
- **HTTP 오류 응답(500) ≠ 응답 없음(연결 실패).** 둘 다 `catch`로 오지만 원인이 다르다.
- **`await fetch()`로 기다리는 동안에도 다른 클릭은 처리된다.** 함수가 기다리는 것과 스레드가 막히는 것은 다르다.
- **서버의 타이머 지연은 반복문 계산이 아니다.** 기다리는 동안 다른 요청도 처리된다.
- **이 코드에는 시간제한(타임아웃)이 없다.** 응답이 끝나지 않으면 로딩이 계속된다.
- **Spring MVC의 `Thread.sleep()`은 그 요청 처리 스레드를 점유**한다. 다른 스레드가 남아 있으면 다른 요청은 처리된다.
- **포트 정리**: 이번 API는 **3002**, 블로킹 비교 서버는 3001, Node과정 학생 서버는 3000.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| API 응답 늦추기 | 타이머 콜백에서 응답 | `setTimeout(() => { res.json(students); }, 3000);` |
| 오류 응답 보내기 | `res.status(코드).json(…)` | `res.status(500).json({ message: "…" })` |
| 클릭으로 요청 | 이벤트 핸들러 + async 함수 | `onClick={() => loadStudents("/students")}` |
| 요청 시작 처리 | 로딩 켜기 + 초기화 | `setIsLoading(true); setError(""); setHasLoaded(false); setStudents([]);` |
| HTTP 실패 걸러내기 | `response.ok` + `throw` | `` throw new Error(`… 상태 코드: ${response.status}`) `` |
| 로딩 끄기 | `finally` | `finally { setIsLoading(false); }` |
| 중복 클릭 막기 | `disabled={isLoading}` + 함수 첫 줄 검사 | `if (isLoading) { return; }` |
| 로딩 중 버튼 글자 | 삼항 연산자 | `{isLoading ? "불러오는 중..." : "학생 목록 불러오기"}` |
| 요청 전/빈 결과 구분 | `hasLoaded` state | `hasLoaded ? (목록 또는 빈 안내) : 시작 안내` |
| 비활성 버튼 스타일 | `button:disabled` | `opacity: 0.5; cursor: not-allowed;` |
| 독립 기능 확인 | 카운터 + 함수형 업데이트 | `setCount((prevCount) => prevCount + 1)` |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목과 "직접 확인하기"에서 뽑았다.

<details><summary>Q. (강의 질문) 서버가 느리면 화면은 어떻게 보여야 할까? 상황별로 필요한 처리는?</summary>

요청 중 → 로딩 안내, 요청 중인 버튼 → 비활성화, 성공 → 데이터 표시, 실패 → 오류 안내와 재시도 가능 상태, 빈 결과 → 데이터 없음 안내. 안내가 없으면 사용자가 같은 버튼을 여러 번 누를 수 있다.
</details>

<details><summary>Q. 서버의 `setTimeout(() => res.json(students), 3000)`은 3초 동안 서버를 붙잡아 두나?</summary>

아니다. 타이머를 등록하고 핸들러 실행을 끝낸다. 반복문 계산이 아니므로 기다리는 동안 이벤트 루프가 다른 요청을 처리할 수 있다.
</details>

<details><summary>Q. 이번 화면에서 조회 시작에 `useEffect`를 쓰지 않은 이유는?</summary>

버튼을 눌렀을 때만 요청하기 때문이다. 사용자의 클릭은 이벤트 핸들러에서 처리한다. (처음 표시될 때 자동으로 요청하던 이전 회차와 다르다.)
</details>

<details><summary>Q. `hasLoaded` state는 왜 필요한가?</summary>

배열이 비어 있는 두 경우 — 아직 요청하지 않아서 비어 있음 / 정상 조회했지만 학생이 없어서 비어 있음 — 를 구분하려고. 앞은 "버튼을 눌러 학생 목록을 조회해주세요.", 뒤는 "등록된 학생이 없습니다."를 보여준다.
</details>

<details><summary>Q. 요청을 시작할 때 실행하는 네 줄과 그 이유는?</summary>

`setIsLoading(true); setError(""); setHasLoaded(false); setStudents([]);` — 로딩을 켜고 이전 오류·결과를 초기화한다. 이번 화면은 재조회 중에 이전 목록을 지우는 방식이다.
</details>

<details><summary>Q. 로딩 종료(`setIsLoading(false)`)를 `finally`에 두는 이유는?</summary>

성공하든 실패하든 요청 처리가 끝나면 로딩을 종료해야 하기 때문이다. 그래야 버튼이 다시 활성화된다.
</details>

<details><summary>Q. 요청 중 중복 클릭을 막는 두 가지 코드는? 이것만으로 결제 같은 작업의 중복이 완전히 막히나?</summary>

버튼의 `disabled={isLoading}`과 요청 함수 첫 부분의 `if (isLoading) { return; }`(보조 처리). 버튼 비활성화는 화면의 중복 클릭을 줄이는 방법일 뿐이고, 중요한 등록·결제 작업의 중복 방지는 서버에서도 별도로 설계해야 한다.
</details>

<details><summary>Q. 종합 코드의 화면 표시 순서 네 단계는?</summary>

① 요청 중이면 로딩 안내 ② 실패했다면 오류 안내 ③ 조회에 성공했다면 목록 또는 빈 결과 안내 ④ 아직 조회하지 않았다면 시작 안내.
</details>

<details><summary>Q. (직접 확인하기) 학생 목록을 불러오는 동안 숫자 증가 버튼을 누르면? 무엇을 알 수 있나?</summary>

카운터가 바로 바뀌고, 약 3초 뒤 목록이 표시된다. `await fetch()`로 기다리는 동안에도 브라우저는 다른 클릭을 처리한다. 조회 함수의 진행이 기다리는 것과 JavaScript 실행 스레드가 막히는 것은 다르다.
</details>

<details><summary>Q. 오류 응답 테스트(`/students-error`)를 눌렀을 때 화면에 오류가 뜨기까지의 흐름은?</summary>

약 1.5초 뒤 500 응답 → `fetch()`는 자동 거부되지 않음 → `response.ok`가 `false`라 `throw new Error(…)` → `catch`에서 오류 안내 설정 → `finally`에서 로딩 종료, 버튼 다시 활성화.
</details>

<details><summary>Q. "HTTP 500 응답을 받은 것"과 "서버가 꺼져 있어 응답을 못 받은 것"은 어떻게 다른가?</summary>

500은 서버가 실패를 나타내는 HTTP 응답을 보낸 것이라 `fetch()`가 거부되지 않고, `response.ok` 검사로 직접 오류를 던진다. 서버에 연결할 수 없으면 `fetch()` 자체가 거부되어 바로 `catch`로 간다. Network 탭에서도 500 응답과 연결 실패로 다르게 보인다.
</details>

<details><summary>Q. Node.js의 `setTimeout` 대기, Node.js의 긴 반복 계산, Spring MVC의 `Thread.sleep(3000)`은 각각 무엇을 붙잡나?</summary>

Node.js 타이머 대기: JavaScript 실행 스레드를 대기 시간 내내 점유하지 않음. Node.js 긴 반복 계산: JavaScript 실행 스레드를 점유해 다른 처리 지연. 일반적인 Spring MVC `Thread.sleep()`: 그 요청 처리 스레드가 기다림(다른 스레드가 남아 있으면 다른 요청은 처리 가능). 어느 쪽이든 브라우저는 응답을 기다리므로 로딩·실패 안내가 필요하다.
</details>

## 완료 체크
- [ ] 응답이 늦은 API를 만들었다.
- [ ] React에서 로딩 문구를 표시했다.
- [ ] 요청 중 버튼을 비활성화했다.
- [ ] 성공·오류·빈 결과를 구분했다.
- [ ] HTTP 오류와 서버 연결 실패를 각각 확인했다.
- [ ] 대기 중에도 카운터가 동작하는 것을 확인했다.
- [ ] Node.js와 Spring MVC에서 기다림의 차이를 이해했다.

## 질문 노트

_아직 없음_
