# 08. 입력 폼과 배열 state — 할 일(Todolist) 앱 만들기

> 과정: React과정 · [노션 원문](https://app.notion.com/p/40c848f71c9b802aadcddc08d32b9463) · 최종 갱신일: 2026-11-12

## 한눈에 보기
- 지금까지 배운 목록([06](06_목록-조건부렌더링.md))·이벤트와 state([07](07_이벤트-state.md))를 연결해 **학습 할 일 목록** 앱을 만들었다.
- 입력창은 `value` + `onChange`로 state와 연결하고(제어 컴포넌트), `form`의 `onSubmit`에서 `preventDefault()`로 새로고침을 막는다.
- 배열·객체 state는 직접 바꾸지 않는다. 추가는 `[...prev, new]`, 삭제는 `filter()`, 완료 전환은 `map()` + `{ ...task }`로 **새 배열·새 객체**를 만든다.
- 남은 할 일 개수는 state로 저장하지 않고 `tasks`에서 계산한다.
- state는 새로고침하면 사라진다. 영구 저장은 아직 하지 않는다.

## 학습 목표
- 입력값을 state로 관리한다.
- 폼 제출과 기본 동작을 처리한다.
- 빈 내용은 추가되지 않도록 검사한다.
- 배열 state에 항목을 추가하고 삭제한다.
- 특정 항목의 완료 상태를 변경한다.
- 남은 할 일 개수를 계산한다.

## 핵심 개념

### 1. 관리할 데이터 — 두 종류의 state

| state | 역할 | 초기값 |
|---|---|---|
| `title` | 입력창에 작성 중인 내용 | `""` |
| `tasks` | 등록된 할 일 목록 | 객체 배열 |

할 일 하나:

```javascript
{
  id: "task-1",
  title: "HTML 복습하기",
  completed: false
}
```

- `id`: 항목을 구분하는 고유 값 / `title`: 할 일 내용 / `completed`: 완료 여부
- 입력창 내용과 등록된 목록은 서로 다른 데이터다.

```text
입력 → 제출 → 목록에 추가 → 입력창 비우기
```

### 2. `label`과 입력창 연결 — `htmlFor`

```jsx
<label htmlFor="task-title">새로운 할 일</label>
<input id="task-title" />
```

JSX에서는 HTML의 `for` 대신 **`htmlFor`**를 쓴다 (HTML의 `label for`는 [01_HTML](01_HTML.md)). `htmlFor`와 입력창 `id`를 맞추면 이름표를 눌러도 입력창에 초점이 간다.

### 3. 입력값을 state와 연결 — 제어 컴포넌트
입력창에 글자를 쓰는 것만으로 state가 바뀌지 않는다. 두 가지를 연결한다.

| 속성 | 역할 |
|---|---|
| `value` | 입력창에 표시할 값 |
| `onChange` | 사용자가 입력을 바꿀 때 실행할 함수 |

```jsx
<input
  id="task-title"
  type="text"
  placeholder="예: React 복습하기"
  value={title}
  onChange={(event) => setTitle(event.target.value)}
/>
```

이벤트 객체:
- `event`: 발생한 이벤트의 정보 (매개변수 이름이라 `e`로 써도 된다)
- `event.target`: 이벤트가 발생한 요소
- `event.target.value`: 그 입력창의 현재 값

```text
입력 변경 → onChange 실행 → title 업데이트 → 렌더링 → value와 미리보기 반영
```

입력값을 React state로 제어하는 입력 요소를 **제어 컴포넌트**라고 한다.
**`value`만 지정하고 값을 갱신하는 `onChange`를 쓰지 않으면 정상적으로 편집할 수 없다.**

### 4. `form` 제출과 `preventDefault()`
`form`은 입력 내용을 제출하는 단위다. 버튼 클릭뿐 아니라 입력창에서 Enter로도 제출된다.

강의는 먼저 HTML만으로 만든 폼을 보여줬다 ([01_HTML](01_HTML.md)의 폼).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- post: 입력한 값을 숨겨서 가져 감 -->
    <!-- get: url에 입력한 값을 변수처럼 갖고 감 -->
    <form method="get" action="aaa.html">
        아이디 <input type="text" name="userId">
        패스워드 <input type="password" name="userPw">
        <button type="submit">로그인</button>
    </form>
</body>
</html>
```

| `method` | 입력값을 보내는 방식 |
|---|---|
| `get` | URL에 입력한 값을 변수처럼 붙여서 가져감 |
| `post` | 입력한 값을 숨겨서 가져감 |

> 💡 보충: `action`은 제출할 때 이동할 주소, `name`은 보내는 값의 이름이다. 위 폼은 제출하면 `aaa.html?userId=…&userPw=…` 주소로 **페이지가 이동**한다. React에서는 이 기본 동작을 아래처럼 `preventDefault()`로 막는다.

```jsx
function handleSubmit(event) {
  event.preventDefault();

  console.log("제출한 내용:", title);
}

<form onSubmit={handleSubmit}>
  {/* label, input, <button type="submit">추가</button> */}
</form>
```

- 브라우저의 폼 제출에는 페이지 이동 등 **기본 동작**이 있다. `event.preventDefault()`로 이를 막고 JavaScript로 처리한다.
- 폼 안 버튼은 의도치 않은 제출을 막기 위해 `type`을 명시한다.

| type | 역할 |
|---|---|
| `submit` | 폼 제출 |
| `button` | 폼 제출 없이 일반 동작 실행 |

### 5. 배열 state에 추가 — 펼침 문법
목록을 화면에 추가하려면 목록 자체가 state여야 한다 (`const [tasks, setTasks] = useState([...])`).

```javascript
// 잘못된 예
tasks.push(newTask);
```

대신 기존 항목을 포함한 **새로운 배열**을 만든다.

```javascript
setTasks((prevTasks) => [...prevTasks, newTask]);
```

```javascript
const previous = ["HTML" , "CSS"];
const next = [...previous, "React"];

console.log("추가 전:", previous);
console.log("추가 후:", next);
```

결과:

```text
추가 전: ["HTML", "CSS"]
추가 후: ["HTML", "CSS", "React"]
```

`...previous`는 기존 배열의 항목들을 새 배열 안에 펼친다.

제출 함수 완성:

```jsx
function handleSubmit(event) {
  event.preventDefault();

  // 양쪽 공백 제거
  const trimmedTitle = title.trim();

  if (trimmedTitle === "") {
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    completed: false
  };

  setTasks((prevTasks) => [...prevTasks, newTask]);
  setTitle("");
}
```

| 코드 | 역할 |
|---|---|
| `title.trim()` | 문자열 양끝의 공백 제거 |
| 빈 문자열 검사 | 내용 없는 항목 등록 방지 |
| `return` | 현재 함수 실행 종료 |
| `crypto.randomUUID()` | 새 항목에 사용할 ID 생성 |
| `[...prevTasks, newTask]` | 기존 목록과 새 항목으로 새 배열 생성 |
| `setTitle("")` | 제출 후 입력창 비우기 |

- `crypto.randomUUID()`는 **항목을 만들 때** 호출한다. 렌더링할 때마다 `key`를 새로 만드는 용도로 쓰지 않는다.
- 로컬 개발 환경에서는 쓸 수 있고, 실제 배포 환경에서는 HTTPS 등 보안 컨텍스트가 필요하다.

### 6. 배열 state에서 삭제 — `filter()`
삭제할 ID를 받아 **그 ID를 제외한 새 배열**을 만든다.

```jsx
function handleDelete(taskId) {
  setTasks((prevTasks) =>
    prevTasks.filter((task) => task.id !== taskId)
  );
}
```

`task.id !== taskId`: 삭제 대상과 ID가 **다른** 항목을 남기는 조건이다.

ID를 넘겨야 하므로 화살표 함수로 감싼다 ([07](07_이벤트-state.md)의 함수 전달 vs 호출).

```jsx
onClick={() => handleDelete(task.id)}

// 잘못된 예: 렌더링 중에 호출합니다.
onClick={handleDelete(task.id)}
```

내용이 같아도 ID가 다르므로 같은 제목의 할 일도 하나씩 구분해 지울 수 있다.

### 7. 항목 하나 변경 — `map()` + 객체 펼침
state 안의 객체도 직접 바꾸지 않는다.

```javascript
// 잘못된 예
task.completed = true;
```

새 배열을 만들면서 대상 항목은 **새 객체로 복사**한다.

```javascript
const changedTask = {
  ...task,
  completed: true
};
```

`...task`로 기존 속성을 복사하고, 뒤에 쓴 `completed`가 새 값으로 덮어쓴다.

```jsx
function handleToggle(taskId) {
  setTasks((prevTasks) =>
    prevTasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed
        };
      }

      return task;
    })
  );
}
```

- 변경할 항목이면 새 객체를 반환한다.
- 다른 항목이면 기존 객체를 그대로 반환한다.
- `map()`이 반환한 새 배열로 state를 업데이트한다.

체크박스는 `value`가 아니라 **`checked`**로 연결한다.

```jsx
<input
  type="checkbox"
  checked={task.completed}
  onChange={() => handleToggle(task.id)}
/>
```

`label`이 체크박스와 문구를 함께 감싸면 문구를 눌러도 선택 상태가 바뀐다.

### 8. 남은 개수 계산과 빈 목록 안내

```jsx
const remainingCount = tasks.filter(
  (task) => !task.completed
).length;
```

`remainingCount`는 `tasks`로 계산할 수 있으므로 **별도 state로 저장하지 않는다.** 목록이 추가·삭제·변경되어 렌더링되면 개수도 다시 계산된다.

"할 일이 없는 상태"와 "모든 할 일을 완료한 상태"는 다르다.

| 상태 | 조건 |
|---|---|
| 목록이 비었는지 | `tasks.length === 0` |
| 미완료 항목이 없는지 | `remainingCount === 0` |

### 9. 새로고침하면 데이터가 사라지는 이유
지금 할 일은 React state에만 있다. 페이지를 새로 열면 컴포넌트가 다시 시작하면서 초기 목록을 쓴다.

| 저장 위치 | 특징 |
|---|---|
| React state | 실행 중인 화면의 상태 관리 |
| 브라우저 저장소 | 같은 브라우저에서 데이터를 유지하는 데 활용 |
| 서버·데이터베이스 | 사용자·기기 간 데이터 저장과 공유에 활용 |

이번 실습은 입력과 상태 변경의 흐름에 집중했고, 영구 저장은 아직 구현하지 않았다.

> 💡 보충: 브라우저 저장소의 대표 예는 `localStorage`다. 같은 브라우저에서는 새로고침해도 값이 남는다.

## 실습 정리

### 만든 것
`TaskApp` 컴포넌트: 할 일 입력·추가(버튼/Enter), 빈 입력 막기, 체크박스로 완료 전환, 삭제, 전체·남은 개수 표시, 빈 목록 안내, 모두 완료 안내. 프로필 예제는 그대로 두고 `App.jsx`에 붙였다.

```jsx
// App.jsx 상단
import TaskApp from "./components/TaskApp.jsx";

// 기존 <main> 안에
<TaskApp />
```

### 단계 흐름
1. `TaskApp.jsx` 생성: `title` state, `label`(`htmlFor`) + `input`.
2. `value={title}` + `onChange`로 입력 연결, `<p>작성 중: {title}</p>`로 미리보기 확인.
3. `form` + `onSubmit={handleSubmit}` + `preventDefault()`, 추가 버튼은 `type="submit"`.
4. `tasks` 배열 state를 만들고 `map()`으로 `<li key={task.id}>` 목록 표시.
5. `handleSubmit` 완성: `trim()` 검사 → `crypto.randomUUID()`로 새 항목 → `[...prevTasks, newTask]` → 입력창 비우기.
6. `handleDelete`: `filter()`로 삭제, 삭제 버튼은 `onClick={() => handleDelete(task.id)}`.
7. `handleToggle`: `map()` + 객체 펼침으로 완료 전환, 체크박스 `checked` 연결, 완료 항목에 `completed` 클래스.
8. `remainingCount` 계산, 빈 목록 안내, 모두 완료 안내 추가.

### 수업 중 강사 화면 코드

강사 화면에서는 `TaskApp`을 화살표 함수로 만들고 `export const TaskApp`으로 내보냈다.

<details><summary>입력 미리보기와 alert 버튼 (3장)</summary>

```jsx
import { useState } from "react"

export const TaskApp = () => {
    const [title, setTitle] = useState("")

    const message = () => {
        alert(`입력한 값은 : '${title}' 입니다.`);
        setTitle("");
    }

    return (
        <section className="task-app">
            <h2>한코딩의 학습 할 일 목록</h2>

            <label htmlFor='task-title'>새로운 할 일</label>

            <input
                id='task-title'
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: React 복습하기"
            />
            <p>작성중 : {title}</p>
            <button onClick={message}>추가</button>
        </section>
    )
}
```

- `<p>작성중 : {title}</p>`로 입력하는 글자가 바로 화면에 보이는지 확인했다.
- `form` 없이 버튼 `onClick`으로 입력값을 `alert`에 보여주고 `setTitle("")`로 입력창을 비웠다. `form` 제출은 4장에서 바꾼다.

> 💡 보충: `export const TaskApp`은 이름을 붙여 내보내는 방식이라 `import { TaskApp } from "./components/TaskApp.jsx";`로 가져와야 한다. 중괄호 없는 `import TaskApp from ...`은 최종 코드처럼 `export default TaskApp;`이 있을 때만 된다 ([06](06_목록-조건부렌더링.md)의 강사 화면 코드 참고).
</details>

<details><summary>제출 함수 다듬기 — 새 배열로 추가 (6장)</summary>

```jsx
import { useState } from "react"

export const TaskApp = () => {
    // 입력 창
    const [title, setTitle] = useState("");

    // 리스트
    const [tasks, setTasks] = useState([
        {
            id: "task-1",
            title: "HTML 복습하기",
            completed: true
        },
        {
            id: "task-2",
            title: "React 입력 폼 만들기",
            completed: false
        }
    ]);


    const handleSubmit = (event) => {
        // 새로고침 방지
        event.preventDefault();

        setTasks([...tasks, {id:"3", title:title, completed:false}]);
        setTitle("");
    }

    return (
        <section className="task-app">
            <h2>한코딩의 학습 할 일 목록</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor='task-title'>새로운 할 일</label>

                <input
                    id='task-title'
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: React 복습하기"
                />
                <p>작성중 : {title}</p>
                <button type="submit">추가</button>
            </form>
            <ul className="task-list">
                {tasks.map((task) => (
                    <li key={task.id}>{task.title}</li>
                ))}
            </ul>
        </section>
    )
}
```

> 💡 보충: 새 항목의 `id`가 항상 `"3"`이라 두 번째로 추가한 항목부터 ID가 겹친다. Console에 같은 `key` 경고가 뜨고, 나중에 삭제·완료 전환을 붙이면 같은 ID 항목이 함께 바뀐다(오류 표의 "같은 항목이 여러 개 함께 변경됨"). 다음 단계처럼 항목마다 다른 ID를 만든다.
</details>

<details><summary>count state로 ID 만들기 · 삭제 버튼 (7장)</summary>

```jsx
import { useState } from "react"

export const TaskApp = () => {


    // 입력 창
    const [title, setTitle] = useState("");

    // 리스트
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: "HTML 복습하기",
            completed: true
        },
        {
            id: 2,
            title: "React 입력 폼 만들기",
            completed: false
        }
    ]);


    const [count, setCount] = useState(3);

    const handleSubmit = (event) => {
        // 새로고침 방지
        event.preventDefault();

        // 입력한 일정 제목에서 양쪽 공백을 제거
        const trimmedTitle = title.trim();

        if (trimmedTitle === '') {
            return;
        }

        const newTask = {
            id: count,
            title: trimmedTitle,
            completed: false
        }

        setCount(count + 1);
        setTasks([...tasks, newTask]);
        setTitle("");
    }

    function handleDelete(taskId) {
        setTasks((p) => p.filter((t) => t.id !== taskId))
    }

    return (
        <section className="task-app">
            <h2>한코딩의 학습 할 일 목록</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor='task-title'>새로운 할 일</label>

                <input
                    id='task-title'
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: React 복습하기"
                />
                <p>작성중 : {title}</p>
                <button type="submit">추가</button>
            </form>
            <ul className="task-list">
                {tasks.map((task) => (
                    <li key={task.id}>
                        <span>{task.title}</span>
                        <button type="button" onClick={() => handleDelete(task.id)}>삭제</button>

                    </li>

                ))}
            </ul>
        </section>
    )
}
```

- `crypto.randomUUID()` 대신 `count` state(초기값 `3`)를 새 ID로 쓰고, 추가할 때마다 `setCount(count + 1)`로 1씩 늘렸다. 초기 데이터 ID도 숫자 `1`, `2`다.
- `handleDelete`의 `(p) => p.filter((t) => t.id !== taskId)`는 매개변수 이름만 짧게 쓴 것으로, 최종 코드의 `handleDelete`와 같은 동작이다.
</details>

### 최종 코드

강의 종합 실습의 `src/App.jsx` (강사 화면: `TaskApp`만 표시)

```jsx
import { useState } from 'react'
import './App.css'
import TaskApp from './components/TaskApp'

const App = () => {

  return (
    <>
      <TaskApp />
    </>
  )
}

export default App
```

- 프로필 예제를 유지하려면 위 "만든 것"처럼 기존 `<main>` 안에 `<TaskApp />`만 추가한다.

> 💡 보충: `<>...</>`는 Fragment다([04_React시작](04_React시작.md)). 이 `App.jsx`는 중괄호 없이 가져오므로 `TaskApp.jsx`에 `export default TaskApp;`이 있어야 한다(아래 코드). 강사 화면처럼 `export const TaskApp`만 있으면 가져오지 못한다. `useState`는 가져오기만 하고 쓰지 않았다.

`src/components/TaskApp.jsx`

```jsx
import { useState } from "react";

function TaskApp() {
  const [title, setTitle] = useState("");

  const [tasks, setTasks] = useState([
    {
      id: "task-1",
      title: "HTML 복습하기",
      completed: true
    },
    {
      id: "task-2",
      title: "React 입력 폼 만들기",
      completed: false
    }
  ]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (trimmedTitle === "") {
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      completed: false
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setTitle("");
  }

  function handleDelete(taskId) {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskId)
    );
  }

  function handleToggle(taskId) {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            completed: !task.completed
          };
        }

        return task;
      })
    );
  }

  const remainingCount = tasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <section className="task-app">
      <h2>한코딩의 학습 할 일 목록</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">새로운 할 일</label>

        <div className="task-input-row">
          <input
            id="task-title"
            type="text"
            placeholder="예: React 복습하기"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <button type="submit">추가</button>
        </div>
      </form>

      <p>
        전체 {tasks.length}개 · 남은 할 일 {remainingCount}개
      </p>

      {tasks.length === 0 ? (
        <p>
          등록된 할 일이 없습니다.
          첫 번째 목표를 추가해보세요.
        </p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <label className="task-label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                />

                <span
                  className={task.completed ? "completed" : ""}
                >
                  {task.title}
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleDelete(task.id)}
                aria-label={`${task.title} 삭제`}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {tasks.length > 0 && remainingCount === 0 && (
        <p>모든 학습 목표를 완료했습니다!</p>
      )}
    </section>
  );
}

export default TaskApp;
```

`src/App.css`에 추가

```css
.task-app {
  max-width: 560px;
  margin: 32px auto;
  padding: 24px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.task-input-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.task-input-row input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  font: inherit;
}

.task-app button {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #334155;
  font: inherit;
  cursor: pointer;
}

.task-app button:hover {
  background-color: #e2e8f0;
}

.task-app button:focus-visible,
.task-input-row input:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}

.task-list {
  padding: 0;
  list-style: none;
}

.task-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.task-label span {
  overflow-wrap: anywhere;
}

.task-list .completed {
  color: #64748b;
  text-decoration: line-through;
}
```

### 직접 해보기 (강의의 ✍️ 항목)
- `title` 초기값을 `"React 복습하기"`로 바꿨다가 `""`로 되돌리고, 글자를 입력·삭제하며 미리보기를 확인한다.
- 추가 버튼으로, 그리고 Enter로 제출한다. 새로고침 없이 처리되는지 확인한다.
- 빈 문자열과 공백만 있는 입력을 제출해 추가되지 않는지 확인한다. 정상 등록 후 입력창이 비워지는지 확인한다.
- 같은 제목을 두 번 등록하고 하나만 삭제한다.
- 체크박스와 할 일 문구를 눌러 완료를 바꾸고, 다른 항목 상태는 유지되는지, 남은 개수가 맞는지 확인한다.
- 모든 항목을 완료해 "모든 학습 목표를 완료했습니다!"를, 모든 항목을 삭제해 빈 목록 안내를 확인한다.

## 헷갈리기 쉬운 점
- `value`만 있고 `onChange`가 없으면 입력창에 글자를 쓸 수 없다.
- 텍스트 입력은 `value`, 체크박스는 `checked`로 연결한다.
- `form` 제출의 기본 동작(페이지 이동·새로고침)은 `event.preventDefault()`로 막는다. 폼 안 버튼은 `type="submit"` / `type="button"`을 명시한다.
- `tasks.push()`, `task.completed = true`처럼 state를 직접 바꾸지 않는다. 항상 새 배열·새 객체를 `setTasks`에 넘긴다.
- 삭제 `filter()`는 삭제 대상과 **다른** 항목(`!==`)을 남긴다. `===`로 쓰면 지우려던 것만 남는다.
- 완료 전환 `map()`에서 대상이 아닌 항목도 `return task`로 돌려줘야 한다. 빠뜨리면 항목이 사라진다.
- `crypto.randomUUID()`는 항목을 만들 때 한 번만 호출한다. 렌더링 때 key로 새로 만들지 않는다.
- 배열 펼침은 안의 객체까지 복사하지 않는다. 아래 코드는 배열만 새로 만들고 기존 객체를 직접 바꾼다.
  ```javascript
  // 잘못된 예
  const nextTasks = [...tasks];

  nextTasks[0].completed = true;

  setTasks(nextTasks);
  ```
  → 변경할 객체도 새로 만들어야 하므로 `map()`과 객체 펼침을 함께 쓴다.
- "할 일이 없음"(`tasks.length === 0`)과 "모두 완료"(`remainingCount === 0`)는 다른 조건이다.

오류가 나면 확인할 것:

| 증상 | 확인할 내용 |
|---|---|
| 입력창에 글자를 쓸 수 없음 | `value`와 `onChange` 연결 |
| 제출하면 새로고침됨 | `onSubmit`, `preventDefault()` |
| 빈 할 일이 추가됨 | `trim()` 이후 빈 문자열 검사 |
| 추가해도 목록이 그대로임 | 배열을 직접 변경하지 않았는지 |
| 모든 항목이 삭제됨 | `filter()`에서 삭제 대상과 다른 항목을 남겼는지 |
| 완료 전환 후 항목이 사라짐 | `map()`의 모든 경우에 값을 반환했는지 |
| 클릭 전 삭제 함수가 실행됨 | `onClick`에 함수를 전달했는지 |
| 체크박스 상태가 바뀌지 않음 | `checked`와 `onChange` 연결 |
| 같은 항목이 여러 개 함께 변경됨 | ID가 중복되지 않았는지 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 텍스트 입력 관리 | `value` + `onChange` | `value={title} onChange={(e) => setTitle(e.target.value)}` |
| 이름표와 입력창 연결 | `htmlFor` = `id` | `<label htmlFor="task-title">` |
| 폼 제출 | `onSubmit` | `<form onSubmit={handleSubmit}>` |
| 기본 제출 동작 방지 | `preventDefault()` | `event.preventDefault();` |
| 빈 입력 검사 | `trim()` | `if (title.trim() === "") return;` |
| 새 ID 만들기 | `crypto.randomUUID()` | `id: crypto.randomUUID()` |
| 항목 추가 | 배열 펼침 | `setTasks((prev) => [...prev, newTask])` |
| 항목 삭제 | `filter()` | `prev.filter((task) => task.id !== taskId)` |
| 항목 하나 변경 | `map()` + 객체 펼침 | `task.id === taskId ? { ...task, completed: !task.completed } : task` |
| 체크박스 관리 | `checked` + `onChange` | `checked={task.completed} onChange={() => handleToggle(task.id)}` |
| 남은 개수 | 목록에서 계산 | `tasks.filter((t) => !t.completed).length` |
| 입력창 비우기 | 빈 문자열로 set | `setTitle("")` |

## 확인 문제
이 강의에는 💬 확인하기가 없어서, 강의 본문의 질문과 "오류가 발생하면 확인하기" 표에서 문제를 뽑았다.

<details><summary>Q. 입력창에 <code>value={title}</code>만 넣고 <code>onChange</code>를 빼면 어떻게 되나요?</summary>

입력창에 글자를 쓸 수 없다(정상적으로 편집 불가). 입력이 바뀔 때 `onChange`에서 `setTitle(event.target.value)`로 state를 갱신해야 화면 값도 바뀐다.
</details>

<details><summary>Q. 제어 컴포넌트란?</summary>

입력값을 React state로 제어하는 입력 요소. `value`로 state를 표시하고 `onChange`로 state를 갱신한다. 흐름: 입력 변경 → onChange 실행 → title 업데이트 → 렌더링 → value 반영.
</details>

<details><summary>Q. <code>onChange={(event) =&gt; setTitle(event.target.value)}</code>에서 <code>event.target.value</code>는 무엇인가요?</summary>

`event`는 발생한 이벤트 정보, `event.target`은 이벤트가 발생한 요소(입력창), `event.target.value`는 그 입력창의 현재 값이다.
</details>

<details><summary>Q. 폼 제출 함수에서 <code>event.preventDefault()</code>가 왜 필요한가요?</summary>

브라우저의 폼 제출에는 페이지 이동 등 기본 동작이 있어서, 그대로 두면 제출할 때 새로고침된다. 이 기본 동작을 막고 JavaScript로 제출 내용을 처리하기 위해 쓴다.
</details>

<details><summary>Q. HTML 폼의 <code>method="get"</code>과 <code>method="post"</code>는 어떻게 다른가요?</summary>

`get`은 입력한 값을 URL에 변수처럼 붙여서 보내고, `post`는 입력한 값을 숨겨서 보낸다. 둘 다 제출하면 `action`의 주소로 페이지가 이동한다. React 폼에서는 이 이동을 `preventDefault()`로 막는다.
</details>

<details><summary>Q. 폼 안의 버튼에 <code>type</code>을 명시하는 이유와 <code>submit</code>/<code>button</code>의 차이는?</summary>

의도하지 않은 제출을 막기 위해서다. `type="submit"`은 폼을 제출하고, `type="button"`은 제출 없이 일반 동작만 실행한다. 그래서 추가 버튼은 `submit`, 삭제 버튼은 `button`으로 썼다.
</details>

<details><summary>Q. JSX에서 <code>label</code>과 <code>input</code>을 연결하는 방법은?</summary>

HTML의 `for` 대신 `htmlFor`를 쓰고, 그 값을 입력창의 `id`와 같게 한다. 이름표를 눌러도 입력창에 초점이 간다.
</details>

<details><summary>Q. <code>tasks.push(newTask)</code>로 추가하면 안 되는 이유와 올바른 방법은?</summary>

state 배열을 직접 바꾸면 목록이 화면에 반영되지 않는다(추가해도 목록이 그대로). 기존 항목을 포함한 새 배열을 만들어 넘긴다: `setTasks((prevTasks) => [...prevTasks, newTask]);`
</details>

<details><summary>Q. 공백만 입력하고 제출해도 빈 할 일이 추가됩니다. 어떻게 막나요?</summary>

`title.trim()`으로 양끝 공백을 없앤 뒤 빈 문자열이면 `return`으로 함수를 끝낸다. 등록할 때도 `trimmedTitle`을 쓴다.
</details>

<details><summary>Q. 삭제 버튼을 누르면 모든 항목이 지워지거나 엉뚱한 항목만 남습니다. 무엇을 확인하나요?</summary>

`filter()` 조건이 삭제 대상과 **다른** 항목을 남기는지(`task.id !== taskId`) 확인한다. 또 `onClick={handleDelete(task.id)}`처럼 렌더링 중에 호출하지 않고 `onClick={() => handleDelete(task.id)}`로 함수를 전달했는지 본다.
</details>

<details><summary>Q. 완료 전환 후 다른 할 일들이 사라졌습니다. 원인은?</summary>

`map()`에서 대상이 아닌 항목에 `return task`를 빠뜨렸다. `map()`은 모든 경우에 값을 반환해야 한다. 변경할 항목은 새 객체, 나머지는 기존 객체를 그대로 반환한다.
</details>

<details><summary>Q. <code>const nextTasks = [...tasks]; nextTasks[0].completed = true;</code>는 왜 잘못인가요?</summary>

배열 펼침은 배열만 새로 만들고 안의 객체는 복사하지 않는다. 결국 기존 객체를 직접 바꾼 것이다. 변경할 객체도 `{ ...task, completed: ... }`로 새로 만들어야 하므로 `map()`과 객체 펼침을 함께 쓴다.
</details>

<details><summary>Q. 체크박스의 선택 상태는 어떤 속성으로 연결하나요?</summary>

`checked`와 `onChange`. 텍스트 입력은 `value`, 체크박스는 `checked={task.completed}`로 연결한다.
</details>

<details><summary>Q. 남은 할 일 개수 <code>remainingCount</code>를 state로 따로 두지 않는 이유는?</summary>

`tasks`에서 계산할 수 있기 때문이다(`tasks.filter((task) => !task.completed).length`). 목록이 바뀌어 렌더링될 때마다 다시 계산되므로 따로 저장할 필요가 없다.
</details>

<details><summary>Q. "할 일이 없는 상태"와 "모든 할 일을 완료한 상태"는 각각 어떤 조건으로 확인하나요?</summary>

- 목록이 비었는지: `tasks.length === 0`
- 미완료 항목이 없는지: `remainingCount === 0`

그래서 완료 안내는 `tasks.length > 0 && remainingCount === 0`일 때 보여준다.
</details>

<details><summary>Q. <code>crypto.randomUUID()</code>는 언제 호출하나요?</summary>

새 항목을 만들 때(제출할 때) 한 번 호출해 ID로 저장한다. 렌더링할 때마다 key를 새로 만드는 용도로 쓰지 않는다. 배포 환경에서는 HTTPS 같은 보안 컨텍스트가 필요하다.
</details>

<details><summary>Q. 새로고침하면 추가한 할 일이 사라지는 이유는?</summary>

할 일이 React state에만 저장되어 있어서, 페이지를 새로 열면 컴포넌트가 다시 시작하면서 초기 목록을 쓴다. 유지하려면 브라우저 저장소나 서버·데이터베이스가 필요하다(아직 구현하지 않음).
</details>

## 완료 체크
- [ ] 입력값을 state로 관리했다.
- [ ] 새로고침 없이 폼을 제출했다.
- [ ] 빈 내용은 추가되지 않도록 처리했다.
- [ ] 기존 배열을 직접 변경하지 않고 항목을 추가했다.
- [ ] ID를 기준으로 항목을 삭제했다.
- [ ] 새 객체를 만들어 완료 상태를 변경했다.
- [ ] 남은 개수와 빈 목록 안내를 표시했다.

## 질문 노트

_아직 없음_
