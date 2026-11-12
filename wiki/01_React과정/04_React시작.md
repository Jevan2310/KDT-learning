# 04. React 시작 — 자기소개 페이지를 React 프로젝트로 옮기기

> 과정: React과정 · [노션 원문](https://app.notion.com/p/40c848f71c9b809b8babc54482fe877b) · 최종 갱신일: 2026-11-09

## 한눈에 보기
- HTML·CSS·JavaScript로 만든 자기소개 페이지([01_HTML](01_HTML.md) · [02_CSS](02_CSS.md) · [03_JavaScript](03_JavaScript.md))를 **React 프로젝트로 옮긴다.**
- **Vite**로 React 프로젝트를 만들고 `npm run dev`로 개발 서버를 띄워 브라우저에서 확인한다.
- **컴포넌트** = 화면에 표시할 **JSX를 반환하는 JavaScript 함수**. JSX는 HTML과 닮았지만 규칙 4가지(하나로 묶기, 모든 태그 닫기, `className`, `{/* */}` 주석)가 다르다.
- JSX 안에서 `{}`로 변수·객체·계산 결과를 표시하고, 이미지는 `public/`에 넣어 `/profile.png` 경로로 쓴다.
- 기존 `script.js`처럼 DOM을 직접 고치는 코드는 옮기지 않는다. 화면 변경은 이후 **이벤트와 state**로 한다 ([07_이벤트-state](07_이벤트-state.md)).

## 학습 목표
- React를 사용하는 이유를 이해한다.
- 프로젝트를 만들고 개발 서버를 실행한다.
- **컴포넌트(부품)** 와 JSX의 기본 형태를 익힌다.
- 변수와 객체의 값을 화면에 표시한다.
- 기존 CSS와 `profile.png`를 적용한다.

## 핵심 개념

### 1. React는 왜 사용할까?
JavaScript로 응원 횟수를 바꿀 때는 두 가지 작업을 했다 ([03_JavaScript](03_JavaScript.md)).

```javascript
const cheerMessage = document.querySelector('#cheer-message');

cheerCount += 1;

cheerMessage.textContent = `응원을 ${cheerCount}번 받았습니다.`;
```

1. 데이터를 변경한다.
2. HTML 요소를 찾아 화면을 변경한다.

- 작은 화면에서는 충분하다.
- 하지만 목록, 필터, 입력창, 완료 개수처럼 연결된 요소가 많아지면 **데이터가 바뀔 때 어떤 화면을 함께 수정해야 하는지 관리하기 어려워진다.**
- React에서는 화면을 **컴포넌트**로 나누고, **데이터에 따라 어떤 화면을 보여줄지** 작성한다. 이후 배울 **state**를 바꾸면 React가 렌더링하고 필요한 DOM 변경을 반영한다.

### 2. React.js란?
React는 **사용자 인터페이스(UI, 화면)를 만드는 JavaScript 라이브러리**다. 새로운 프로그래밍 언어가 아니다.

| 기존 학습 | React에서 이어지는 부분 |
|---|---|
| HTML | JSX로 화면 구조 작성 |
| CSS | 클래스와 스타일 적용 |
| JavaScript 함수 | 컴포넌트 작성 |
| 변수·객체·배열 | 화면에 표시할 데이터 |
| 이벤트 | 사용자 동작 처리 |

**React를 쓴다고 모든 웹사이트가 자동으로 빨라지는 것은 아니다.** 여기서는 화면을 나누고 데이터와 연결하는 방법에 집중한다.

### 3. React 프로젝트에서 쓰는 도구

| 도구 | 역할 |
|---|---|
| React | 화면을 구성하는 라이브러리 |
| Vite | 개발 서버 실행과 배포용 파일 생성(빌드)을 돕는 도구 |
| Node.js | Vite 같은 개발 도구를 실행하는 환경 |
| npm (node package manager) | 필요한 패키지 설치와 프로젝트 명령 실행 |

- 이번에는 **Vite의 React·JavaScript 템플릿**을 쓴다.
- 지금 Node.js는 개발 도구를 실행하기 위한 것이다. **아직 API 서버를 만드는 단계는 아니다.**
- Node.js 설치는 [VS Code·Node.js 설치](../00_개발환경/VSCode-Node.md) 참고.

### 4. 프로젝트 파일 구조
강의의 주요 파일 + 수업 화면(VS Code 탐색기)에 보인 파일을 합쳐 정리했다. 템플릿 버전에 따라 추가 파일이 있을 수 있다.

```text
my-profile/
├─ node_modules/        ← 설치된 패키지 파일 (직접 고치지 않음)
├─ dist/                ← 배포용 빌드 결과 (수업 화면에만 보임)
├─ public/              ← 경로로 쓰는 정적 파일 (이미지 등)
│  ├─ favicon.svg
│  ├─ icons.svg
│  └─ profile.png       ← 실습에서 복사해 넣는 이미지 → "/profile.png"로 사용
├─ src/
│  ├─ assets/           ← 템플릿 기본 이미지 (hero.png, react.svg, vite.svg)
│  ├─ App.jsx           ★ 이번에 작성할 주요 화면
│  ├─ App.css           ★ 주요 화면의 스타일
│  ├─ index.css         ← 페이지 전체에 적용할 스타일
│  └─ main.jsx          ← React 화면을 index.html의 루트 요소에 연결하는 시작 코드
├─ index.html           ← React 화면이 들어갈 HTML 문서 (<div id="root"></div>)
├─ package.json         ← 패키지 정보와 실행 명령 (npm run dev 등)
├─ package-lock.json    ← 설치한 패키지 버전을 고정하는 파일
├─ .gitignore           ┐
├─ eslint.config.js     │ 템플릿이 함께 만드는 설정·안내 파일
├─ README.md            │ (이번 강의에서는 신경 쓰지 않음)
└─ vite.config.js       ┘
```

- **지금은 `App.jsx`와 CSS 파일을 중심으로 수정한다.** 다른 파일은 역할만 알면 된다.

> 💡 보충: `dist/`는 `npm run build`로 배포용 파일을 만들 때 생기는 폴더다. 개발 중 확인은 `npm run dev`만 쓴다.

#### HTML은 어디에 있을까?
`index.html`에 다음 요소가 있다.

```html
<div id="root"></div>
```

- `src/main.jsx`의 시작 코드가 이 요소를 찾아 React 화면을 연결한다.
- `main.jsx`는 `App.jsx`에서 내보낸 컴포넌트를 가져와 `<App />` 형태로 사용한다.
- **`index.html` 전체를 `App.jsx`에 복사하지 않는다.** 화면의 본문 구조만 React 컴포넌트로 작성한다.

> 💡 보충: Vite React 템플릿의 `main.jsx`는 대략 다음과 같다. `index.css`를 여기서 불러오기 때문에 페이지 전체에 적용된다.
> ```jsx
> import { StrictMode } from 'react'
> import { createRoot } from 'react-dom/client'
> import './index.css'
> import App from './App.jsx'
>
> createRoot(document.getElementById('root')).render(
>   <StrictMode>
>     <App />
>   </StrictMode>,
> )
> ```

### 5. 컴포넌트(부품)
- 컴포넌트는 **화면의 일부를 표현하는 단위**다.
- 이번에는 **화면에 표시할 JSX를 반환하는 JavaScript 함수**로 작성한다.
- **직접 만드는 컴포넌트 이름은 대문자로 시작한다.** (`App`, `ProfileCard`)

```jsx
import "./App.css";

function App() {
  return (
    <div>
      <h1>안녕하세요, 한코딩입니다!</h1>
      <p>React로 첫 화면을 만들었습니다.</p>
    </div>
  );
}

export default App;
```

| 코드 | 의미 |
|---|---|
| `import "./App.css"` | CSS 파일 불러오기 |
| `function App()` | `App` 컴포넌트 정의 |
| `return (...)` | 화면에 표시할 JSX 반환 |
| `export default App` | 다른 파일에서 가져올 수 있도록 내보내기 |

수업에서는 같은 컴포넌트를 **화살표 함수**로도 작성했다.

```jsx
// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './App.css'


// 함수 형태 -> 기존에는 HTML을 이용해서 화면을 작성했지만
// 리액트에서는 함수 안에 HTML을 작성함으로써 출력한다.
// JS 안의 함수 안에 HTML을 작성하는 방식을 jsx라고 부른다.
const App = () => {

  return (
    <div>
      <h1>안녕하세요 한코딩입니다!</h1>
      <p>React로 첫 화면을 만들었습니다.</p>
    </div>
  );
}

export default App
```

### 6. JSX — HTML과 무엇이 다른가
JSX는 **JavaScript 안에서 HTML과 비슷한 형태로 화면을 작성하는 문법 확장**이다. 👉 [React 공식 문서: JSX 작성하기](https://react.dev/learn/writing-markup-with-jsx)

| 규칙 | HTML | JSX |
|---|---|---|
| ① 반환할 요소는 하나로 묶기 | 여러 요소 나란히 가능 | 부모 요소(`div`) 또는 Fragment(`<>...</>`)로 감싼다 |
| ② 모든 태그 닫기 | `<img>`, `<input>`, `<br>` | `<img ... />`, `<input />`, `<br />` |
| ③ 클래스 지정 | `class="..."` | `className="..."` |
| ④ 주석 | `<!-- -->` | `{/* 주석 */}` |

**① 반환할 요소는 하나로 묶는다**

```jsx
// 잘못된 예
return (
  <h1>한코딩</h1>
  <p>반갑습니다!</p>
);
```

```jsx
return (
  <div>
    <h1>한코딩</h1>
    <p>반갑습니다!</p>
  </div>
);
```

화면에 불필요한 요소를 추가하고 싶지 않으면 **Fragment**를 쓴다. `<>...</>`는 여러 요소를 묶지만 별도의 HTML 요소를 만들지 않는다.

```jsx
return (
  <>
    <h1>한코딩</h1>
    <p>반갑습니다!</p>
  </>
);
```

**② 모든 태그를 닫는다**

```jsx
<img src="/profile.png" alt="한코딩의 프로필 이미지" />
<input />
<br />
```

**③ `class` 대신 `className`**

HTML:

```html
<div class="profile-card">
```

JSX:

```jsx
<div className="profile-card">
```

CSS는 기존처럼 작성한다.

```css
.profile-card {
  background-color: white;
}
```

**④ JSX 안의 주석**

```jsx
return (
  <div>
    {/* 자기소개 영역 */}
    <h1>한코딩</h1>
  </div>
);
```

### 7. 중괄호 `{}`로 JavaScript 값 표시하기
JSX 안에서 JavaScript 값을 쓰려면 `{}`로 감싼다. `userName`이라는 글자가 아니라 **변수에 저장된 값**이 표시된다.

```jsx
const App = () => {
  const userName = "한코딩";

  return (
    <h1>안녕하세요, {userName}입니다!</h1>;
  )
}
```

> 💡 보충: 위 수업 코드처럼 `return ( ... )` 괄호 **안에** `;`를 넣으면 문법 오류가 난다. `return <h1>…</h1>;` 또는 `return ( <h1>…</h1> );`처럼 `;`는 괄호 밖에 둔다.

| 작성 | 화면 표시 |
|---|---|
| `<p>userName</p>` | userName |
| `<p>{userName}</p>` | 한코딩 |

계산 결과도 표시할 수 있다.

```jsx
const goalCount = 3;
```

```jsx
<p>학습 목표는 {goalCount}개입니다.</p>
<p>목표를 하나 추가하면 {goalCount + 1}개입니다.</p>
```

- `{}` 안에는 **값으로 평가되는 표현식**을 쓴다.
- `if`문이나 `const` 선언은 `{}` 안에 그대로 넣지 않는다.

### 8. 객체의 값과 이미지 사용하기
관련된 정보는 객체로 묶고, JSX에서 속성에 접근한다.

```jsx
const profile = {
  name: "한코딩",
  introduction: "직접 사용하는 서비스를 만들고 싶습니다.",
  imageUrl: "/profile.png"
};
```

```jsx
<h1>{profile.name}</h1>
<p>{profile.introduction}</p>
```

**이미지**: `public/profile.png`는 `/profile.png` 경로로 쓴다.

```jsx
<img src="/profile.png" alt="한코딩의 프로필 이미지" />
```

**속성에 변수·객체 값을 넣을 때는 따옴표 대신 중괄호**를 쓴다.

```jsx
<img
  src={profile.imageUrl}
  alt={`${profile.name}의 프로필 이미지`}
/>
```

| 작성 | 의미 |
|---|---|
| `src="/profile.png"` | 문자열 경로 그대로 사용 |
| `src={profile.imageUrl}` | 변수(객체 속성)에 저장된 값 사용 |
| `src="profile.imageUrl"` | ❌ `"profile.imageUrl"`이라는 **문자열**을 파일 경로로 사용 → 잘못된 예 |

### 9. 기존 `script.js`는 어떻게 할까?
앞서 작성한 코드는 요소를 직접 찾아 수정했다.

```javascript
const introMessage = document.querySelector("#intro-message");

introMessage.textContent = "새로운 소개입니다.";
```

- 이번 React 화면에는 **이 코드를 붙이지 않는다.**
- React가 관리하는 화면의 텍스트나 구조를 직접 수정하면 **React의 화면 관리와 충돌**할 수 있다. 일반적인 기능은 **이벤트와 state로 화면을 변경**한다 ([07_이벤트-state](07_이벤트-state.md)).
- **일반 변수만 변경해도 React 화면이 자동으로 갱신되지는 않는다.** 화면과 연결된 상태(state)는 따로 배운다.

현재 단계의 흐름:
- **데이터 작성 → JSX에서 사용 → React가 화면 표시**
- **버튼을 누르거나 특정 동작 수행 → 데이터를 가져옴 → JSX에서 사용 → React가 화면 표시**

### 정리

| 개념 | 핵심 |
|---|---|
| React | 사용자 인터페이스(UI → 화면)를 만드는 **JavaScript 라이브러리** |
| Vite | 개발 서버와 **빌드**를 제공하는 개발 도구 |
| 컴포넌트 | 화면의 일부를 표현하는 단위 **(부품)** |
| JSX | JavaScript 안에서 화면 구조를 작성하는 문법 |
| `{}` | JSX에서 JavaScript 표현식을 사용하는 자리 |
| `className` | JSX에서 CSS 클래스를 지정하는 속성 |

## 실습 정리

### 실습 1. React 프로젝트 만들고 개발 서버 실행하기
기존 `my-profile`(HTML 버전)은 그대로 두고 **별도의 React 프로젝트**를 만든다. VS Code에서 프로젝트들을 보관할 **상위 폴더**를 열고 터미널을 실행한다.

**① 설치 확인** — Vite가 요구하는 Node.js 버전인지 확인한다 (수업에서 안내한 버전 사용). 👉 [Vite 공식 설치 조건](https://vite.dev/guide/)

```bash
node -v
npm -v
```

수업 화면에서는 Node.js v24, npm 11 버전이었다.

**② 프로젝트 생성**

```bash
npm create vite@latest
```

패키지 설치 확인이 나오면 내용을 확인하고 진행한다. 이어서 나오는 질문은 수업 화면 기준으로 다음처럼 선택했다 (기본 React·JavaScript 구성 유지).

| 질문 | 선택 |
|---|---|
| Project name | `my-profile` |
| Select a framework | `React` |
| Select a variant | `JavaScript` (TypeScript, React Compiler 등이 아닌 기본 JavaScript) |
| Which linter to use? | `ESLint` (기본 선택) |
| Install with npm and start now? | `Yes` → 패키지 설치 후 바로 개발 서버까지 실행됨 |

**③ 프로젝트 폴더로 이동**

```bash
cd my-profile
```

**④ 필요한 패키지 설치 (필수 아님)** — ②에서 `Yes`로 이미 설치했다면 다시 실행하지 않아도 된다.

```bash
npm install
```

**⑤ 개발 서버 실행**

```bash
npm run dev
```

터미널에 표시된 주소를 브라우저에서 연다. 예: `http://localhost:5173/`
사용 중인 포트에 따라 주소가 달라질 수 있으니 **터미널에 실제로 표시된 주소**를 쓴다. 처음 열면 Vite+React 기본 화면("Get started", `Count is 0` 버튼)이 보인다.

**실행 중 알아둘 것**
- 개발 서버를 쓰는 동안 터미널을 열어둔다.
- 종료: 해당 터미널에서 `Ctrl + C`
- 다시 실행: 프로젝트 폴더에서 `npm run dev`
- React 프로젝트는 HTML 파일을 더블클릭하는 대신 **개발 서버 주소로 확인**한다.

### 실습 2. 첫 번째 컴포넌트 작성하기
1. `src/App.jsx`의 기존 내용을 모두 지우고 핵심 개념 5의 첫 번째 `App` 코드(`function App()`)로 교체한다.
2. 템플릿 기본 스타일이 결과에 영향을 주지 않도록 `src/App.css`, `src/index.css`의 내용을 지우고 **빈 파일로 저장**한다.
3. 저장한 뒤 브라우저에서 결과를 확인한다.

### 실습 3. 변수 값 표시하기
`App.jsx`를 다음으로 교체한다.

```jsx
import "./App.css";

function App() {
  const userName = "한코딩";
  const introduction = "직접 사용하는 서비스를 만들고 싶습니다.";
  const goalCount = 3; // 정수

  return (
    <div className="profile-card">
      <h1>안녕하세요, {userName}입니다!</h1>
      <p>{introduction}</p>
      <p>학습 목표는 {goalCount}개입니다.</p>
    </div>
  );
}

export default App;
```

<details><summary>수업 중 강사 화면 코드 (객체로 표시 + CSS 연결)</summary>

`App.jsx`

```jsx
import './App.css'


// 함수 형태 -> 기존에는 HTML을 이용해서 화면을 작성했지만
// 리액트에서는 함수 안에 HTML을 작성함으로써 출력한다.
// JS 안의 함수 안에 HTML을 작성하는 방식을 jsx라고 부른다.
const profile = {
  name: "한코딩",
  intro: "제 취미는 러닝입니다.",
  imageUrl: "/profile.png"
}


const App = () => {

  // 이 부분은 프로필 카드 관련 컴포넌트입니다.
  return (
    <div>
      {/* 주석 예시*/}
      <div className='profile-card'>이름: {profile.name}</div>
      <div className='profile-card'>자기소개: {profile.intro}</div>
      <img src={profile.imageUrl}/>
    </div>
  );
}

export default App
```

`App.css`

```css
/** App.css**/
body {
  margin: 0;
  background-color: rgb(73, 73, 73);
  color: #222;
  font-family: system-ui, -apple-system, 'Malgun Gothic', sans-serif;
}

h2 {
  margin: 0 0 16px;
  font-size: 22px;
}

button {
  padding: 8px 14px;
  border: 1px solid #d5d8de;
  border-radius: 6px;
  background-color: #fff;
  font: inherit;
  cursor: pointer;
}

.button-primary {
  border-color: #2f6fed;
  background-color: #2f6fed;
  color: #fff;
}

/* 상단 메뉴 */
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  padding: 12px 24px;
  border-bottom: 1px solid #e3e5ea;
  background-color: #fff;
}

.logo {
  margin: 0;
  font-size: 20px;
}

.nav {
  display: flex;
  flex: 1;
  gap: 4px;
}

.nav-button {
  border-color: transparent;
  background-color: transparent;
}

.nav-button.active {
  background-color: #e8effd;
  color: #2f6fed;
  font-weight: 600;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 본문 */
.main {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 16px;
}

.post-list {
  margin: 0;
  padding: 0;
  border: 1px solid #e3e5ea;
  border-radius: 8px;
  background-color: #fff;
  list-style: none;
}

.post-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 16px;
  padding: 14px 16px;
}

.post-item + .post-item {
  border-top: 1px solid #e3e5ea;
}

.post-meta {
  color: #777;
  font-size: 14px;
}

/* 로그인 */
.login {
  max-width: 340px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #e3e5ea;
  border-radius: 8px;
  background-color: #fff;
}

.login form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.login input {
  padding: 9px 10px;
  border: 1px solid #d5d8de;
  border-radius: 6px;
  font: inherit;
}
```

`index.css`

```css
/** index.css **/
img {
    width: 150px;
    border-radius: 60px;
}
```

> 💡 보충: 강사 화면의 `App.css`에는 이 화면에서 쓰지 않는 클래스(`.header`, `.nav`, `.post-list`, `.login` 등)가 많다. 다른 예제의 CSS를 함께 붙여 넣은 것으로 보이며, 실제로 이 화면에 영향을 주는 것은 `body` 스타일과 `index.css`의 `img` 스타일 정도다.
</details>

### 실습 4. 이미지 옮기기
기존 프로젝트의 `profile.png`를 React 프로젝트의 `public` 폴더에 복사한다.

```text
my-profile
└─ public
   └─ profile.png
```

JSX에서는 `/profile.png`로 쓴다 (핵심 개념 8 참고).

### 실습 5 (종합). 자기소개 페이지를 React로 옮기기
- 이전 HTML의 `html`, `head`, `body`와 기존 `script.js`는 옮기지 않는다. **이번에는 화면 구조와 스타일부터 옮긴다.**
- 흐름: `profile` 객체에 데이터 작성 → JSX에서 `{profile.속성}`으로 사용 → `className`으로 기존 CSS 연결

**`src/App.jsx` (최종)**

```jsx
import "./App.css";

function App() {
  const profile = {
    name: "한코딩",
    introduction: "직접 사용하는 서비스를 만들고 싶습니다.",
    hobby: "산책과 음악 감상",
    imageUrl: "/profile.png",
    githubUrl: "https://github.com/"
  };

  return (
    <div className="profile-card">
      <header>
        <h1>안녕하세요, {profile.name}입니다!</h1>
        <p className="intro">{profile.introduction}</p>
      </header>

      <main>
        <section>
          <h2>나에 대해</h2>

          <img
            className="profile-image"
            src={profile.imageUrl}
            alt={`${profile.name}의 프로필 이미지`}
          />

          <p>저는 웹 개발을 공부하고 있습니다.</p>
          <p>취미는 {profile.hobby}입니다.</p>
        </section>

        <section>
          <h2>이번 과정의 목표</h2>

          <ul>
            <li>웹페이지의 구조 이해하기</li>
            <li>나에게 필요한 기능 만들기</li>
            <li>다른 사람에게 서비스 보여주기</li>
          </ul>
        </section>

        <section>
          <h2>나의 링크</h2>

          <a className="profile-link" href={profile.githubUrl}>
            GitHub 방문하기
          </a>
        </section>
      </main>

      <footer>
        <p>{profile.name}의 학습 기록</p>
      </footer>
    </div>
  );
}

export default App;
```

**`src/App.css` (최종)** — 앞서 만든 `style.css`([02_CSS](02_CSS.md))를 복사하면 같은 클래스 이름의 스타일을 그대로 쓸 수 있다. 기존 CSS가 없으면 다음 코드를 쓴다.

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 24px;
  background-color: #f1f5f9;
  color: #334155;
  font-family: sans-serif;
  line-height: 1.6;
}

.profile-card {
  max-width: 560px;
  margin: 24px auto;
  padding: 32px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

h1 {
  color: #2563eb;
  font-size: 28px;
}

h2 {
  font-size: 20px;
}

.intro {
  color: #2563eb;
}

section {
  margin-top: 28px;
}

.profile-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 50%;
}

li {
  margin-bottom: 8px;
}

.profile-link {
  display: inline-block;
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}

.profile-link:hover {
  background-color: #1d4ed8;
}

footer {
  margin-top: 32px;
  color: #64748b;
  font-size: 14px;
}
```

- 눈누 웹폰트도 기존 `@font-face`와 `font-family` 설정을 함께 옮겨 쓸 수 있다. 폰트 파일이 기존 프로젝트의 로컬 파일이면 **경로를 새 프로젝트에 맞춰야** 한다.

### 참고: 수업 도입 JavaScript 복습 코드
수업 시작 때 [03_JavaScript](03_JavaScript.md)의 제어문·반복문·함수를 복습한 코드다.

<details><summary>① 조건문 if-else — confirm 결과를 콘솔에 출력</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>


    <script>
        // 제어문 (if - else if - else)

        let weather = confirm('오늘은 비가 옵니까?');

        console.log(weather);

        if (weather) {
            console.log('우산이 필요하겠군요.');
        } else {
            console.log('우산이 필요 없겠군요.');
        }
        
    </script>
</body>
</html>
```
</details>

<details><summary>② 조건문 결과를 화면(textContent)에 표시</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

    <div id="word"></div>

    <script>
        // 제어문 (if - else if - else)

        let weather = confirm('오늘은 비가 옵니까?');

        console.log(weather);

        let word = document.querySelector("#word");

        if (weather) {
            word.textContent = '우산이 필요하겠군요.';
        } else {
            word.textContent = '우산이 필요 없겠군요.';
        }
    </script>
</body>
</html>
```
</details>

<details><summary>③ else if — 숫자를 입력받아 요일 표시</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

    <div id="word"></div>

    <script>

        let num = prompt('숫자를 입력하세요');


        // let word = document.getElementById('word');
        let word = document.querySelector('#word');

        if (num == 1) {
            word.textContent = '월요일';
        } else if (num == 2) {
            word.textContent = '화요일';
        } else if (num == 3) {
            word.textContent = '수요일';
        } else if (num == 4) {
            word.textContent = '목요일';
        } else if (num == 5) {
            word.textContent = '금요일';
        } else if (num == 6) {
            word.textContent = '토요일';
        } else if (num == 7) {
            word.textContent = '일요일';
        } else {
            word.textContent = '해당 요일은 존재하지 않습니다.1';
        }
    </script>
</body>
</html>
```
</details>

<details><summary>④ 함수 + 이중 for문 — 구구단</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

    <div id="word"></div>

    <script>


        // 함수와 같이 사용하는 구구단
        function gugudan() {

            // 2 x 1 = 2
            for (let i = 2; i <= 9; i++) {
                console.log(`==== ${i}단 ====`);
                for (let x = 1; x <= 9; x++) {
                    //             2  x  1   =   2
                    //             2  x  2   =   4
                    //             ...
                    //             2  x  9   =   18

                    //             3  x  1   =   3
                    console.log(`${i} x ${x} = ${i * x}`);    
                }
            }
        }

        gugudan();
        
    </script>
</body>
</html>
```
</details>

### 직접 바꿔보기 (미션)
- [ ] 개발 서버를 종료하고 다시 실행한다.
- [ ] 소개 문장을 수정하고, 취미를 소개하는 문단을 추가한 뒤 저장해 반영되는지 확인한다.
- [ ] 가장 바깥 `div`를 Fragment로 바꾸고 JSX 안에 주석을 추가한 뒤, 다시 `className="profile-card"`를 가진 `div`로 되돌린다.
- [ ] 변수에 저장한 소개 문장을 바꾸고, 관심사를 저장할 변수를 추가해 화면에 표시한다.
- [ ] `profile` 객체를 자신의 정보로 바꾸고 관심사 속성을 추가해 표시한다.
- [ ] 학습 목표를 수정한다.
- [ ] CSS로 카드의 색상과 이미지 모양을 바꾼다.

## 헷갈리기 쉬운 점
- **`index.html` 전체를 `App.jsx`에 복사하지 않는다.** `html`, `head`, `body`는 옮기지 않고 본문 구조만 JSX로 쓴다.
- **여러 요소를 나란히 반환하면 오류.** 하나의 부모(`div`)나 Fragment(`<>...</>`)로 감싼다.
- **`class`가 아니라 `className`.** CSS 파일은 기존처럼 `.profile-card`로 쓴다.
- **`<img>`, `<input>`, `<br>`도 반드시 닫는다** (`/>`).
- **`{}` 없이 쓰면 변수 이름이 글자 그대로 나온다.** `<p>userName</p>` → "userName"
- **속성에 변수를 넣을 때 따옴표를 쓰면 문자열이 된다.** `src="profile.imageUrl"` ❌ → `src={profile.imageUrl}` ⭕
- **`{}` 안에는 표현식만.** `if`문, `const` 선언은 넣지 않는다.
- **`public/profile.png`의 경로는 `/profile.png`.** (`public`을 경로에 넣지 않는다)
- **일반 변수를 바꿔도 화면은 자동으로 바뀌지 않는다.** 화면과 연결된 데이터는 state로 다룬다.
- **DOM을 직접 고치는 기존 `script.js` 코드(`querySelector`, `textContent`)를 React 화면에 붙이지 않는다.** React의 화면 관리와 충돌할 수 있다.
- **주소는 터미널에 표시된 주소를 쓴다.** 포트(5173 등)는 상황에 따라 바뀐다.
- **React를 쓴다고 웹사이트가 자동으로 빨라지지는 않는다.**

**오류가 나면 확인할 것**

| 증상 | 확인할 내용 |
|---|---|
| 프로젝트 명령이 실행되지 않음 | 터미널이 `package.json`이 있는 폴더에 있는지 (그 폴더에서만 실행 가능) |
| 실행 주소에 접속되지 않음 | 개발 서버 실행 여부, 터미널에 표시된 주소 |
| JSX 문법 오류 | 닫지 않은 태그, 여러 최상위 요소, 괄호 |
| 변수 이름이 그대로 표시됨 | `{}` 없이 문자열로 작성했는지 |
| 이미지가 보이지 않음 | `public/profile.png` 위치와 `/profile.png` 경로 |
| CSS가 적용되지 않음 | `import`, 파일 이름, `className` |
| 예상하지 못한 기본 스타일 | 템플릿의 `App.css`, `index.css` 내용 |
| 수정 사항이 반영되지 않음 | 파일 저장 여부, 터미널·브라우저 오류 |

- 오류 메시지가 나오면 **파일 이름과 줄 번호부터** 확인한다.
- 한 번에 여러 곳을 바꾸지 말고, **작은 단위로 수정하고 결과를 확인**한다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| Node·npm 버전 확인 | `node -v`, `npm -v` | `node -v` |
| React 프로젝트 만들기 | `npm create vite@latest` | React → JavaScript 선택 |
| 패키지 설치 | `npm install` | 생성 때 설치했으면 생략 |
| 개발 서버 실행 | `npm run dev` | `http://localhost:5173/` |
| 개발 서버 종료 | `Ctrl + C` | 서버가 돌고 있는 터미널에서 |
| 컴포넌트 만들기 | JSX를 반환하는 함수 | `function App() { return (<div>…</div>); }` |
| 컴포넌트 내보내기 | `export default` | `export default App;` |
| CSS 불러오기 | `import` | `import "./App.css";` |
| 요소 추가 없이 묶기 | Fragment | `<> … </>` |
| CSS 클래스 지정 | `className` | `<div className="profile-card">` |
| JSX 주석 | `{/* */}` | `{/* 자기소개 영역 */}` |
| 변수 값 표시 | `{}` | `<h1>{userName}</h1>` |
| 계산 결과 표시 | `{}` 안에 표현식 | `{goalCount + 1}` |
| 객체 속성 표시 | `{객체.속성}` | `{profile.name}` |
| 속성에 변수 넣기 | 따옴표 대신 `{}` | `src={profile.imageUrl}` |
| 속성에 문자열+변수 | `{}` + 템플릿 리터럴 | `` alt={`${profile.name}의 프로필 이미지`} `` |
| public 이미지 쓰기 | `/파일명` | `<img src="/profile.png" alt="…" />` |

## 확인 문제

<details><summary>Q. React는 새로운 프로그래밍 언어인가?</summary>

아니다. React는 **사용자 인터페이스(화면)를 만드는 JavaScript 라이브러리**다. 지금까지 배운 HTML·CSS·JavaScript 지식을 그대로 활용한다 (HTML → JSX, JS 함수 → 컴포넌트, 변수·객체 → 화면 데이터).
</details>

<details><summary>Q. JavaScript로 DOM을 직접 바꾸는 방식이 화면이 커질수록 어려워지는 이유와, React는 어떻게 다른가?</summary>

DOM 방식은 ① 데이터 변경 ② 요소를 찾아 화면 변경을 매번 직접 해야 한다. 연결된 요소(목록, 필터, 입력창, 완료 개수)가 많아지면 데이터가 바뀔 때 **어떤 화면을 함께 고쳐야 하는지 관리하기 어렵다.**
React는 화면을 컴포넌트로 나누고 **데이터에 따라 어떤 화면을 보여줄지**만 작성한다. state가 바뀌면 React가 렌더링하고 필요한 DOM 변경을 반영한다.
</details>

<details><summary>Q. React 프로젝트에서 Vite, Node.js, npm은 각각 무슨 역할인가?</summary>

- **Vite**: 개발 서버 실행과 배포용 파일 생성(빌드)을 돕는 도구
- **Node.js**: Vite 같은 개발 도구를 실행하는 환경 (아직 API 서버를 만드는 게 아님)
- **npm**: 패키지 설치와 프로젝트 명령(`npm run dev` 등) 실행
</details>

<details><summary>Q. 개발 서버를 종료하고 다시 실행하려면?</summary>

서버가 돌고 있는 터미널에서 `Ctrl + C`로 종료하고, **프로젝트 폴더(`package.json`이 있는 폴더)** 에서 `npm run dev`를 입력한다. 브라우저는 터미널에 표시된 주소로 연다.
</details>

<details><summary>Q. React 화면은 어떤 HTML에, 어떻게 연결되는가?</summary>

`index.html`의 `<div id="root"></div>`에 들어간다. `src/main.jsx`가 이 요소를 찾아 `App` 컴포넌트(`<App />`)를 연결한다. 그래서 `index.html` 전체를 `App.jsx`에 복사하지 않는다.
</details>

<details><summary>Q. `h1`과 `p` 두 요소를 `return ( … )` 안에 나란히 쓰면 왜 오류가 나고, 어떻게 고치는가?</summary>

JSX는 **반환할 요소가 하나**여야 한다. `<div>…</div>`로 감싸거나, 화면에 요소를 추가하고 싶지 않으면 Fragment `<>…</>`로 감싼다.
</details>

<details><summary>Q. JSX에서 HTML과 다르게 써야 하는 규칙 4가지는?</summary>

1. 반환할 요소는 하나로 묶는다 (`div` 또는 `<>...</>`)
2. 모든 태그를 닫는다 (`<img />`, `<input />`, `<br />`)
3. `class` 대신 `className`
4. 주석은 `{/* … */}`
</details>

<details><summary>Q. `const userName = "한코딩";`일 때, p 태그 안에 `userName`이라고 쓴 것과 `{userName}`이라고 쓴 것은 각각 무엇이 표시되는가?</summary>

- `<p>userName</p>` → **userName** (글자 그대로)
- `<p>{userName}</p>` → **한코딩** (변수에 저장된 값)
</details>

<details><summary>Q. JSX의 `{}` 안에 넣을 수 있는 것과 없는 것은?</summary>

**값으로 평가되는 표현식**은 넣을 수 있다 (변수, `goalCount + 1`, `profile.name`, 템플릿 리터럴 등). `if`문이나 `const` 선언 같은 **문장**은 그대로 넣지 않는다.
</details>

<details><summary>Q. img 태그에 `src="profile.imageUrl"`처럼 따옴표로 쓰면 왜 이미지가 안 나오는가?</summary>

따옴표로 감싸면 `"profile.imageUrl"`이라는 **문자열**을 파일 경로로 쓰게 된다. 변수·객체 값을 속성에 넣을 때는 `src={profile.imageUrl}`처럼 **중괄호**를 쓴다.
</details>

<details><summary>Q. `public/profile.png` 이미지는 JSX에서 어떤 경로로 쓰는가?</summary>

`/profile.png` — 예: `<img src="/profile.png" alt="한코딩의 프로필 이미지" />`
</details>

<details><summary>Q. 기존 `script.js`의 `querySelector` + `textContent` 코드를 React 화면에 붙이지 않는 이유는? 일반 변수 값만 바꾸면 화면이 바뀌는가?</summary>

React가 관리하는 화면을 직접 수정하면 **React의 화면 관리와 충돌**할 수 있다. 화면 변경은 **이벤트와 state**로 한다. 또 **일반 변수만 바꿔서는 React 화면이 자동으로 갱신되지 않는다** (state를 써야 한다).
</details>

<details><summary>Q. 직접 만드는 컴포넌트의 이름 규칙은?</summary>

**대문자로 시작**한다 (예: `App`, `ProfileCard`). 컴포넌트는 JSX를 반환하는 함수로 만들고, `export default`로 내보내 다른 파일에서 `<App />`처럼 사용한다.
</details>

## 완료 체크
- [ ] React 프로젝트를 만들고 개발 서버를 실행했다.
- [ ] `App.jsx`에서 화면을 수정했다.
- [ ] JSX의 기본 규칙을 적용했다.
- [ ] 변수와 객체의 값을 화면에 표시했다.
- [ ] `profile.png`를 표시했다.
- [ ] 기존 CSS를 연결했다.

## 질문 노트

<details><summary>Q. React 연습장 index.html을 브라우저로 바로 열면 왜 화면이 비어 있어요? <sub>2026-11-12 · 연습 중</sub></summary>

**A.** React 프로젝트의 `index.html`에는 빈 `<div id="root"></div>`만 있다. 내용은 `/src/main.jsx`가 채운다. 그런데 브라우저는 JSX를 직접 읽지 못한다. 그래서 Vite 개발 서버가 JSX를 브라우저용 JavaScript로 바꿔서 보내 줘야 한다. 파일을 더블클릭해서 열면(`file://...`) 이 과정이 없어서 `root`가 빈 채로 남는다.

- 확인 방법: 주소창이 `file:///...index.html`이면 잘못 연 것이고, `http://localhost:5173/`이면 맞게 연 것이다.
- 여는 방법: 연습장 폴더에서 `npm run dev`를 실행하고, 터미널에 나온 주소를 연다.
- HTML·CSS·JS 연습(01~03회차)은 `index.html`을 바로 열어도 됐지만, React(04회차~)는 서버로 열어야 한다.

관련: 이 파일의 개발 서버 실행 부분 (`npm run dev`)
</details>

<details><summary>Q. 화면이 통째로 하얗게 나와요 — `<p>…<p/>` 뭐가 문제예요? <sub>2026-11-12</sub></summary>

**A.** 닫는 태그는 `</p>`(슬래시가 앞)다. `<p/>`(슬래시가 뒤)는 "내용 없는 새 p 태그를 열고 바로 닫는다"는 뜻이라, 앞의 `<p>`는 끝내 닫히지 않는다. JSX는 모든 태그가 닫혀야 해서 파일 전체가 문법 오류(Parsing error)가 되고, 그 파일을 쓰는 앱 전체가 안 그려진다. 화면이 통째로 비면 브라우저 Console이나 Vite 터미널의 빨간 오류부터 본다.

```jsx
<p>프로필은 총 {count}개 입니다.</p>   // ✓
<p>프로필은 총 {count}개 입니다.<p/>   // ✗ 앞의 <p>가 안 닫힘
```

관련: 이 파일의 JSX 규칙 (태그는 반드시 닫는다)
</details>
