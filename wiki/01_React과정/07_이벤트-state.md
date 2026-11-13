# 07. 이벤트와 state — 사용자 동작에 따라 화면 바꾸기

> 과정: React과정 · [노션 원문](https://app.notion.com/p/40c848f71c9b809e8f29ef3f0f23cf7d) · 최종 갱신일: 2026-11-12

## 한눈에 보기
- React에서는 JSX의 `onClick`에 **실행할 함수를 전달**해 클릭을 처리한다 (`onClick={handleCheer}`, 호출 `()` 없이).
- 일반 변수를 바꾸면 콘솔 값만 바뀌고 화면은 그대로다. 화면에 반영할 값은 `useState`로 만든 **state**에 둔다.
- state는 직접 대입하지 않고 상태 변경 함수(`setCount`)로 바꾼다. 상태값은 그 렌더링의 스냅샷이라 새 값은 다음 렌더링에서 읽는다.
- 이전 값에 의존하는 변경은 함수형 업데이트 `setCount((prev) => prev + 1)`로 쓴다.
- 불리언 state로 소개를 펼치고 접고, 필터 state로 전체/학습 중 프로필 목록을 전환했다 ([06_목록-조건부렌더링](06_목록-조건부렌더링.md)의 `filter()`를 버튼으로 조작).

## 학습 목표
- `onClick`으로 클릭 이벤트를 처리한다.
- 일반 변수와 state의 차이를 이해한다.
- `useState`로 화면과 연결된 값을 관리한다.
- 이전 상태를 기준으로 값을 업데이트한다.
- 소개 문구를 펼치고 접는다.
- 전체 프로필과 학습 중인 프로필을 전환한다.

## 핵심 개념

### 1. React의 클릭 이벤트 — `onClick`
일반 JavaScript에서는 요소를 선택하고 이벤트를 등록했다 ([03_JavaScript](03_JavaScript.md) 7~8장).

```javascript
const button = document.querySelector("#cheer-button");

button.addEventListener("click", addCheer);
```

React에서는 JSX의 **`onClick` 속성으로 실행할 함수를 전달**한다.

```jsx
<button onClick={addCheer}>응원하기</button>
```

**함수를 전달하는 것과 호출하는 것은 다르다.**

```jsx
// 올바른 예
<button onClick={handleCheer}>응원 보내기</button>
```

```jsx
// 잘못된 예: 화면을 렌더링하는 중에 함수를 호출합니다.
<button onClick={handleCheer()}>응원 보내기</button>
```

- `handleCheer`: 함수를 전달 → 클릭할 때 실행
- `handleCheer()`: 함수를 즉시 호출 → 렌더링 중에 실행
- 이벤트에 반응하는 함수를 **이벤트 핸들러**라고 하고, 역할이 드러나게 `handle...` 이름을 쓴다.

값을 넘겨야 하면 클릭 때 실행할 **화살표 함수**를 전달한다.

```jsx
onClick={() => setCount(0)}
```

### 2. 일반 변수로는 화면이 바뀌지 않는다

```jsx
function CheerCounter() {
  let count = 0;

  function handleCheer() {
    count = count + 1;

    console.log("현재 응원 횟수:", count);
  }

  return (
    <section>
      <h2>응원하기</h2>
      <p>응원을 {count}번 받았습니다.</p>

      <button type="button" onClick={handleCheer}>
        응원 보내기
      </button>
    </section>
  );
}

export default CheerCounter;
```

버튼을 누르면 콘솔 숫자는 증가하지만 화면 숫자는 그대로다.
- **일반 변수 변경은 React에 화면을 다시 계산하라는 요청을 하지 않는다.**
- 함수 안의 일반 변수는 컴포넌트가 다시 실행되면 새로 만들어진다.

→ 화면에 반영해야 하는 **값을 유지하고 변경하려면 state를 쓴다.**

### 3. `useState`
`useState`는 컴포넌트에 state를 추가하는 React Hook이다.

```jsx
import { useState } from "react";

const [count, setCount] = useState(0);
```

| 부분 | 역할 |
|---|---|
| `count` | 이번 렌더링에서 읽는 현재 상태 |
| `setCount` | 상태 변경을 요청하는 함수 |
| `0` | 처음 사용할 상태값 (초기값) |

- 대괄호 문법은 반환된 배열에서 두 값을 꺼내 이름을 붙이는 **배열 구조 분해**다 (객체 구조 분해는 [05_컴포넌트-props](05_컴포넌트-props.md) 6장).
- 이름은 직접 정한다. 보통 `상태이름`과 `set상태이름`을 한 쌍으로 쓴다.
- state에는 숫자뿐 아니라 문자열·불리언·배열·객체도 저장할 수 있다.

**실행 흐름**

```text
클릭 → 이벤트 핸들러 실행 → 상태 변경 요청 → 다시 렌더링 → 화면 반영
```

렌더링은 React가 컴포넌트를 호출해 표시할 화면을 계산하는 과정이다. 그 뒤 필요한 DOM 변경만 반영한다. **페이지 전체 새로고침과는 다르다.**

**useState를 쓰는 위치**: 컴포넌트 **최상위**에서 호출한다. 조건문·반복문·이벤트 핸들러 안에서 호출하지 않는다.

```jsx
function CheerCounter() {
  const [count, setCount] = useState(0);

  // ...
}
```

### 4. state는 직접 바꾸지 않는다 — 스냅샷

```jsx
// 잘못된 예
count = count + 1;

// 상태 변경 함수를 사용한다
setCount(count + 1);
```

`count`는 `const`인데 어떻게 바뀔까? React가 **상태를 보관**하고, 다음 렌더링에서 새로운 `count` 값을 준다.

```jsx
function handleCheer() {
  setCount(count + 1);

  console.log(count);
}
```

콘솔에는 이 핸들러가 만들어진 렌더링의 `count`가 찍힌다. `setCount`를 호출해도 **즉시 바뀌지 않고, 업데이트된 값은 다음 렌더링에서** 읽는다.

### 5. 함수형 업데이트 — 이전 상태를 기준으로

```jsx
setCount((prevCount) => prevCount + 1);
```

React가 넘겨주는 이전 상태를 받아 다음 상태를 반환하는 함수다. `prevCount`는 직접 정한 매개변수 이름이다.

| 코드 | 계산 기준 |
|---|---|
| `setCount(count + 1)` | 현재 렌더링에서 읽은 값 |
| `setCount((prevCount) => prevCount + 1)` | 대기 중인 업데이트까지 순서대로 반영한 이전 상태 |

```jsx
function handleCheer() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
// 한 번 클릭 → 1만 증가 (세 줄 모두 같은 렌더링의 count로 계산)
```

```jsx
function handleCheer() {
  setCount((prevCount) => prevCount + 1);
  setCount((prevCount) => prevCount + 1);
  setCount((prevCount) => prevCount + 1);
}
// 한 번 클릭 → 3 증가 (업데이트 함수를 순서대로 적용)
```

**새 값이 이전 상태에 의존하면 함수 형태를 쓰는 습관을 들인다.** 초기화처럼 이전 상태와 상관없는 값은 `setCount(0)`으로 바로 넘긴다.

### 6. 불리언 state로 펼치고 접기

```jsx
const [isOpen, setIsOpen] = useState(false);

function handleToggle() {
  setIsOpen((prevIsOpen) => !prevIsOpen);
}
```

- `!`는 불리언을 반대로 바꾼다 (`!true` → `false`, `!false` → `true`).
- 상태 하나(`isOpen`)로 버튼 문구와 소개 표시가 함께 바뀐다.

| 속성 | 역할 |
|---|---|
| `hidden` | 참이면 해당 영역을 숨김 |
| `aria-expanded` | 펼침 상태를 보조 기술에 전달 |
| `aria-controls` | 버튼이 제어하는 영역의 ID 지정 |
| `aria-pressed` | 버튼의 선택(눌림) 상태 전달 |

### 7. 컴포넌트마다 독립적인 state

```jsx
<CheerCounter /> // 첫 번째
<CheerCounter /> // 두 번째
```

한쪽 버튼만 누르면 다른 쪽 횟수는 바뀌지 않는다. 두 컴포넌트는 **각자의 state를 관리**한다. 컴포넌트 코드를 재사용하는 것과 상태를 공유하는 것은 다르다.

### 8. state로 목록 전환하기 — 파생 데이터

```jsx
const [showLearningOnly, setShowLearningOnly] = useState(false);

const visibleProfiles = showLearningOnly
  ? profiles.filter((profile) => profile.isLearning)
  : profiles;
```

| `showLearningOnly` | 표시할 목록 |
|---|---|
| `false` | 전체 프로필 |
| `true` | 학습 중인 프로필 |

`visibleProfiles`는 데이터와 필터 상태로 **계산할 수 있으므로** 별도 state로 중복 저장하지 않는다. 이런 값을 **파생 데이터**라고 한다.

### 9. props와 state 구분하기

| 구분 | props | state |
|---|---|---|
| 역할 | 부모가 전달하는 정보 | 컴포넌트가 관리하는 상태 |
| 예시 | 이름·소개·이미지 경로 | 응원 횟수·펼침 여부·필터 |
| 변경 방법 | 자식이 직접 변경하지 않음 | 상태 변경 함수 사용 |
| 사용하는 곳 | 전달받은 화면 구성 | 사용자 동작에 따른 화면 변화 |

이번 실습에서 `ProfileCard`는 props를 받아 표시하고, `CheerCounter`는 자기 응원 횟수를 state로 관리하고, `App`은 필터 상태로 표시할 목록을 계산한다.
**모든 값을 state로 만들 필요는 없다.** 화면 변화에 필요한 상태만 저장하고, 그 상태로 계산할 수 있는 값은 계산해서 쓴다.

## 실습 정리

### 만든 것
기존 프로필 프로젝트에 세 가지를 붙였다.
- `CheerCounter`: 응원 보내기 / 초기화 버튼
- `IntroToggle`: 소개 펼치기 / 접기
- `App`: 전체 / 학습 중 필터 버튼으로 프로필 목록 전환

### 단계 흐름
1. `CheerCounter.jsx`를 만들고 `onClick`에 `console.log` 핸들러 연결 → 콘솔로 클릭 확인.
2. `let count`로 횟수를 올려보고 화면이 안 바뀌는 것을 확인.
3. `useState(0)`과 `setCount(count + 1)`로 교체 → 화면 숫자가 증가.
4. `setCount`를 세 번 호출하는 실험으로 스냅샷과 함수형 업데이트 차이를 확인하고, `setCount((prevCount) => prevCount + 1)`로 정리.
5. 초기화 버튼 `onClick={() => setCount(0)}` 추가.
6. `IntroToggle.jsx`에서 불리언 state로 소개 펼치기/접기.
7. `CheerCounter`를 두 번 써서 state가 독립적인지 확인한 뒤 하나만 남김.
8. `App`에 `showLearningOnly` state와 필터 버튼을 추가하고, 개수·빈 목록·카드 목록을 모두 `visibleProfiles`로 표시.

수업 중 클릭 확인 예제 (1장, `src/components/CheerCounter.jsx`):

```jsx
// 컴포넌트
const CheerCounter = () => {

    // 함수
    const handleCheer = () => {
        console.log('응원 버튼을 눌렀습니다.');
    }

    ;

    return (
        <section>
            <h2>응원하기</h2>

            <button type='button' onClick={handleCheer}>
                응원 보내기
            </button>
        </section>
    )
}

export default CheerCounter;
```

`App.jsx`에서 가져와 표시한다.

```jsx
import './App.css'
import CheerCounter from './components/CheerCounter.jsx'

const App = () => {

  return (
    <main>
      <CheerCounter />
    </main>
  )
}

export default App

```

- 컴포넌트와 이벤트 핸들러를 모두 화살표 함수로 만들었다 (`const handleCheer = () => { ... }`). `function handleCheer() { ... }`와 마찬가지로 `onClick={handleCheer}`로 전달한다.

> 💡 보충: 핸들러 아래 혼자 있는 `;`는 아무 일도 하지 않는 빈 문장이라 실행에 영향이 없다.

수업 중 증가/감소 버튼 예제:

```jsx
import { useState } from 'react'
import './App.css'

const App = () => {

  const [count, setCount] = useState(0);

  const [name, setName] = useState('이름없음');

  function countUp() {
    setCount(count + 1);
  }

  function countDown() {
    setCount(count - 1);
  }

  return (
    <main>
      <div>이름: {name}</div>
      <div>응원 횟수: {count}번</div>
      <button onClick={countUp}>증가 버튼</button>
      <button onClick={countDown}>감소 버튼</button>
    </main>
  )
}

export default App
```

수업 중 소개 토글 연결 예제 (6장, `App.jsx`):

```jsx
import { useState } from 'react';
import './App.css'
import IntroToggle from './components/IntroToggle';


const App = () => {
  return (
    <main>
      <IntroToggle />
    </main>
  )
}

export default App

```

> 💡 보충: `'./components/IntroToggle'`처럼 `.jsx` 확장자를 빼도 Vite가 파일을 찾아준다. 이 코드의 `useState`는 가져오기만 하고 쓰지 않았다(실행에는 영향 없음).

### 최종 코드
`ProfileCard.jsx`는 [06_목록-조건부렌더링](06_목록-조건부렌더링.md)의 최종 코드를 그대로 쓴다.

`src/App.jsx`

```jsx
import { useState } from "react";

import "./App.css";

import ProfileCard from "./components/ProfileCard.jsx";
import CheerCounter from "./components/CheerCounter.jsx";
import IntroToggle from "./components/IntroToggle.jsx";

function App() {
  const [showLearningOnly, setShowLearningOnly] = useState(false);

  const profiles = [
    {
      id: 1,
      name: "한코딩",
      introduction: "직접 사용하는 서비스를 만듭니다.",
      imageUrl: "/profile.png",
      interest: "웹 서비스",
      isLearning: true
    },
    {
      id: 2,
      name: "한코딩 스터디",
      introduction: "함께 배우고 경험을 나눕니다.",
      imageUrl: "/profile.png",
      interest: "협업",
      isLearning: true
    },
    {
      id: 3,
      name: "한코딩 프로젝트",
      introduction: "아이디어를 서비스로 발전시킵니다.",
      imageUrl: "/profile.png",
      interest: "앱 개발",
      isLearning: false
    }
  ];

  const visibleProfiles = showLearningOnly
    ? profiles.filter((profile) => profile.isLearning)
    : profiles;

  return (
    <main>
      <h1>함께 공부하는 사람들</h1>

      <IntroToggle />
      <CheerCounter />

      <section>
        <h2>프로필 목록</h2>

        <div className="filter-buttons">
          <button
            type="button"
            className={!showLearningOnly ? "active" : ""}
            onClick={() => setShowLearningOnly(false)}
            aria-pressed={!showLearningOnly}
          >
            전체
          </button>

          <button
            type="button"
            className={showLearningOnly ? "active" : ""}
            onClick={() => setShowLearningOnly(true)}
            aria-pressed={showLearningOnly}
          >
            학습 중
          </button>
        </div>

        <p>표시 중인 프로필: {visibleProfiles.length}개</p>

        {visibleProfiles.length === 0 ? (
          <p>조건에 맞는 프로필이 없습니다.</p>
        ) : (
          <div className="profile-list">
            {visibleProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                name={profile.name}
                introduction={profile.introduction}
                imageUrl={profile.imageUrl}
                interest={profile.interest}
                isLearning={profile.isLearning}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
```

`src/components/CheerCounter.jsx`

```jsx
import { useState } from "react";

function CheerCounter() {
  const [count, setCount] = useState(0);

  function handleCheer() {
    setCount((prevCount) => prevCount + 1);
  }

  return (
    <section>
      <h2>응원하기</h2>

      <p>응원을 {count}번 받았습니다.</p>

      <div className="action-buttons">
        <button type="button" onClick={handleCheer}>
          응원 보내기
        </button>

        <button type="button" onClick={() => setCount(0)}>
          초기화
        </button>
      </div>
    </section>
  );
}

export default CheerCounter;
```

`src/components/IntroToggle.jsx`

```jsx
import { useState } from "react"


const IntroToggle = () => {
    const [isOpen, setIsOpen] = useState(false);

    function handleToggle() {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    }

    return (
        <section>
            <h2>한코딩 소개</h2>

            <button
                type="button"
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-controls="introduction-details"
            >
                {/* 조건 ? 사실일 때 : 거짓일 때*/}
                {isOpen ? "소개 접기" : "소개 펼치기"}
            </button>

            <div id="introduction-details" hidden={!isOpen}>
                <p>
                    직접 사용하는 서비스를 만들고,
                    개발 경험을 강의로 나누고 있습니다.
                </p>
            </div>
        </section>
    )
}

export default IntroToggle;
```

이 예제는 페이지에 한 번만 쓴다. 여러 개를 재사용하려면 영역 ID(`introduction-details`)도 각각 달라야 한다.

`src/App.css`에 추가 (여기서 Flex는 버튼을 나란히 놓고 간격을 주는 용도로 쓴다)

```css
button {
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: white;
  color: #334155;
  font: inherit;
  cursor: pointer;
}

button:hover {
  background-color: #f1f5f9;
}

button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 3px;
}

.filter-buttons,
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-buttons .active {
  border-color: #2563eb;
  background-color: #2563eb;
  color: white;
}
```

### 직접 해보기 (강의의 ✍️ 항목)
- 버튼 문구와 콘솔 메시지를 바꿔본다.
- `useState` 초기값을 `10`으로 바꾸고 **브라우저를 새로고침**해서 확인한다 (파일 저장만 하면 state가 유지되는 경우가 있다).
- `IntroToggle`이 처음부터 펼쳐져 있도록 초기값을 바꿔본다.
- 전체/학습 중 버튼을 번갈아 눌러 표시 개수와 카드 목록이 함께 바뀌는지 확인한다.
- 모든 프로필의 `isLearning`을 `false`로 바꾸고 학습 중 버튼을 눌러 "조건에 맞는 프로필이 없습니다."를 확인한 뒤 복원한다.

## 헷갈리기 쉬운 점
- `onClick={handleCheer()}`는 클릭 전에, 렌더링 중에 실행된다. 함수 이름만 넘기거나 `() => ...`로 감싼다.
- state를 `count = count + 1`처럼 직접 대입하지 않는다. 반드시 `setCount`.
- `setCount` 바로 뒤의 `console.log(count)`는 이전 값이다. 새 값은 다음 렌더링에서 보인다.
- 컴포넌트 본문에서 `setCount`를 무조건 호출하면 렌더링 → 상태 변경 → 렌더링이 끝없이 반복된다. 상태 변경은 **이벤트 핸들러 안에서** 한다.
  ```jsx
  // 잘못된 예: 렌더링할 때마다 상태 변경을 요청합니다.
  function CheerCounter() {
    const [count, setCount] = useState(0);

    setCount(count + 1);

    return <p>{count}</p>;
  }
  ```
- 코드 저장(개발 서버의 자동 반영)과 브라우저 새로고침은 다르다. 초기값 변경은 새로고침으로 확인한다.
- 계산할 수 있는 값(`visibleProfiles`)을 state로 또 만들지 않는다. 개수와 목록이 같은 배열을 쓰는지 확인한다.

오류가 나면 확인할 것:

| 증상 | 확인할 내용 |
|---|---|
| 클릭 전에 함수가 실행됨 | `onClick={함수명()}`로 작성했는지 |
| 숫자가 콘솔에서만 바뀜 | 일반 변수만 변경하고 있는지 |
| 상태 변경 시 오류 | 상태 변수에 직접 대입했는지 |
| `useState`를 찾지 못함 | React에서 import했는지 |
| 렌더링이 계속 반복됨 | 컴포넌트 본문에서 상태 변경 함수를 무조건 호출했는지 |
| 필터 개수와 목록이 다름 | 둘 다 `visibleProfiles`를 사용하는지 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 클릭 처리 | `onClick={함수}` | `<button onClick={handleCheer}>` |
| 클릭 때 값 넘기기 | 화살표 함수 | `onClick={() => setCount(0)}` |
| state 만들기 | `useState` | `const [count, setCount] = useState(0);` |
| useState 가져오기 | import | `import { useState } from "react";` |
| 이전 값 기준으로 변경 | 함수형 업데이트 | `setCount((prevCount) => prevCount + 1)` |
| 고정 값으로 변경 | 값 바로 전달 | `setCount(0)` |
| 불리언 뒤집기 | `!` + 함수형 업데이트 | `setIsOpen((prev) => !prev)` |
| 영역 숨기기 | `hidden` | `<div hidden={!isOpen}>` |
| 상태에 따라 클래스 | 삼항 연산자 | `className={showLearningOnly ? "active" : ""}` |
| 상태로 목록 계산 | 삼항 + `filter()` | `const visible = flag ? list.filter(...) : list;` |
| 펼침/선택 상태 알리기 | `aria-expanded`, `aria-pressed` | `aria-pressed={showLearningOnly}` |

## 확인 문제
이 강의에는 💬 확인하기가 없어서, 강의 본문의 질문과 "오류가 발생하면 확인하기" 표에서 문제를 뽑았다.

<details><summary>Q. <code>onClick={handleCheer}</code>와 <code>onClick={handleCheer()}</code>의 차이는?</summary>

`handleCheer`는 함수를 **전달**해서 클릭할 때 실행된다. `handleCheer()`는 함수를 **즉시 호출**해서 렌더링 중에 실행된다(클릭 전에 실행됨).
</details>

<details><summary>Q. <code>let count = 0</code>을 핸들러에서 1씩 올렸더니 콘솔 숫자만 오르고 화면은 그대로입니다. 이유는?</summary>

일반 변수 변경은 React에 화면을 다시 계산하라는 요청을 하지 않는다. 또 함수 안의 일반 변수는 컴포넌트가 다시 실행되면 새로 만들어진다. 화면에 반영할 값은 `useState`로 만든 state에 두고 상태 변경 함수로 바꾼다.
</details>

<details><summary>Q. <code>const [count, setCount] = useState(0);</code>에서 각 부분의 역할은?</summary>

- `count`: 이번 렌더링에서 읽는 현재 상태
- `setCount`: 상태 변경을 요청하는 함수
- `0`: 처음 사용할 상태값

대괄호는 반환된 배열에서 두 값을 꺼내 이름을 붙이는 배열 구조 분해다.
</details>

<details><summary>Q. <code>count</code>는 <code>const</code>로 선언했는데 어떻게 값이 바뀌나요?</summary>

`count` 변수를 바꾸는 게 아니다. React가 상태를 보관하고 있다가, `setCount`로 요청하면 다시 렌더링하면서 새 `count` 값을 준다.
</details>

<details><summary>Q. <code>setCount(count + 1);</code> 바로 다음 줄의 <code>console.log(count)</code>에는 무엇이 찍히나요?</summary>

이 핸들러가 만들어진 렌더링의 `count`(변경 전 값)가 찍힌다. 상태값은 그 렌더링의 스냅샷이고, 업데이트된 값은 다음 렌더링에서 읽는다.
</details>

<details><summary>Q. 핸들러에서 <code>setCount(count + 1)</code>을 세 번 호출하면 몇이 증가하나요? 함수형으로 바꾸면?</summary>

`setCount(count + 1)` 세 번은 **1만 증가**한다. 세 줄 모두 같은 렌더링의 `count`로 계산하기 때문이다. `setCount((prevCount) => prevCount + 1)` 세 번은 React가 업데이트 함수를 순서대로 적용하므로 **3 증가**한다.
</details>

<details><summary>Q. 초기화 버튼은 왜 함수형 업데이트 대신 <code>setCount(0)</code>을 쓰나요? 왜 <code>() =&gt;</code>로 감싸나요?</summary>

초기화 값 `0`은 이전 상태에 의존하지 않으므로 값을 바로 넘긴다. `onClick={setCount(0)}`로 쓰면 렌더링 중에 호출되므로, 클릭했을 때 실행할 화살표 함수 `() => setCount(0)`을 전달한다.
</details>

<details><summary>Q. <code>useState</code>는 어디에서 호출해야 하나요?</summary>

컴포넌트 최상위에서 호출한다. 조건문·반복문·이벤트 핸들러 안에서 호출하지 않는다.
</details>

<details><summary>Q. 컴포넌트를 열자마자 렌더링이 끝없이 반복됩니다. 무엇을 확인하나요?</summary>

컴포넌트 본문에서 상태 변경 함수(`setCount(...)`)를 무조건 호출하고 있는지 본다. 상태 변경은 이벤트 핸들러 안에서 호출한다.
</details>

<details><summary>Q. <code>&lt;CheerCounter /&gt;</code>를 두 번 쓰고 한쪽만 누르면 다른 쪽 숫자도 바뀌나요?</summary>

바뀌지 않는다. 두 컴포넌트는 각자의 state를 관리한다. 컴포넌트 코드를 재사용하는 것과 상태를 공유하는 것은 다르다.
</details>

<details><summary>Q. 필터 결과 <code>visibleProfiles</code>도 state로 따로 저장해야 하나요?</summary>

아니다. `profiles`와 `showLearningOnly`로 계산할 수 있는 파생 데이터이므로 state로 중복 저장하지 않고 렌더링 때 계산한다. 모든 값을 state로 만들 필요는 없다.
</details>

<details><summary>Q. props와 state의 차이는?</summary>

props는 부모가 전달하는 정보로 자식이 직접 바꾸지 않는다(예: 이름·소개). state는 컴포넌트가 스스로 관리하는 상태로 상태 변경 함수로 바꾼다(예: 응원 횟수·펼침 여부·필터).
</details>

## 완료 체크
- [ ] 클릭 이벤트에 함수를 연결했다.
- [ ] 일반 변수 변경과 state 업데이트의 차이를 확인했다.
- [ ] 응원 횟수를 증가시키고 초기화했다.
- [ ] 불리언 state로 소개 영역을 펼치고 접었다.
- [ ] 같은 컴포넌트의 상태가 각각 독립적임을 확인했다.
- [ ] state에 따라 프로필 목록과 개수를 변경했다.

## 질문 노트

<details><summary>Q. 컴포넌트를 파일로 나눴더니 <code>useState is not defined</code> 오류가 나요 <sub>2026-11-13 · 연습 중</sub></summary>

**A.** `useState`를 쓰는 **파일마다** 맨 위에 `import { useState } from "react";`가 있어야 한다. 한 파일에 있던 코드를 여러 파일로 나눌 때 import 줄이 따라가지 않으면, 그 파일은 `useState`가 어디서 왔는지 몰라 화면이 하얘진다. 다른 파일이 가져온 것은 쓸 수 없다 (파이썬도 모듈마다 `import`를 따로 쓰는 것과 같다). `npx eslint src`를 돌리면 `'useState' is not defined`로 알려 준다.

관련: 이 파일의 "3. `useState`", [06_목록-조건부렌더링](06_목록-조건부렌더링.md)의 이름 붙인 export
</details>
