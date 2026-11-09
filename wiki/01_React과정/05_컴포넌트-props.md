# 05. 컴포넌트와 props — 화면 나누고 재사용하기

> 과정: React과정 · [노션 원문](https://app.notion.com/p/40c848f71c9b806e89ddfd66a64fd569) · 최종 갱신일: 2026-11-09

## 한눈에 보기
- [04_React시작](04_React시작.md)에서 `App.jsx`에 만든 자기소개 화면을 **`ProfileCard` 컴포넌트로 분리**한다.
- 컴포넌트를 `src/components/ProfileCard.jsx` 파일로 옮기고 **`export default` ↔ `import`** 로 연결한다.
- **props** = 부모가 자식 컴포넌트에 전달하는 정보. 같은 컴포넌트에 다른 props를 주면 **같은 구조, 다른 내용**의 카드가 나온다.
- props는 **구조 분해 할당**으로 받고, **기본값**(`= "..."`)으로 빠진 값을 채운다. props는 **읽기 전용**이라 직접 바꾸지 않는다.

## 학습 목표
- 컴포넌트를 나누는 이유를 이해한다.
- 컴포넌트를 정의하고 화면에 사용한다.
- 파일을 분리하고 `import`·`export`로 연결한다.
- props로 컴포넌트에 데이터를 전달한다.
- 같은 컴포넌트를 다른 데이터로 재사용한다.

## 핵심 개념

### 1. 왜 컴포넌트로 나눌까?
- 프로필 카드를 세 개 보여주려고 카드 코드를 세 번 복사하면, 카드 구조를 바꿀 때 **복사한 곳을 모두 각각 수정**해야 한다.
- **공통 구조를 컴포넌트로 만들면 한곳에서 관리하고 여러 번 사용**할 수 있다.

| 구분 | 역할 |
|---|---|
| 컴포넌트 | 반복해서 사용할 화면 구조 |
| props | **각 컴포넌트에 전달할 데이터** |

예: 프로필 카드는 구조(컴포넌트)가 같아도 이름과 소개(props)가 달라질 수 있다.

### 2. 컴포넌트 정의와 사용
앞서 만든 `App`도 컴포넌트다.

```jsx
const App = () => {
  return <h1>안녕하세요, 한코딩입니다!</h1>;
}
```

**정의** — 화면 구조를 작성하는 부분. 두 가지 형태 모두 쓸 수 있다.

```jsx
function ProfileCard() {
  // 화면 구조를 작성합니다.
}

// 리액트에서 권장하는 방식
const ProfileCard = () => {
 // 화면 구조를 작성합니다.
}
```

> 💡 보충: 함수 선언(`function`)과 화살표 함수(`const … = () =>`)는 컴포넌트로서 동작 차이가 없다. React 공식 문서 예제는 주로 `function` 선언을 쓰니 둘 다 읽을 수 있으면 된다.

**사용** — 화면에 컴포넌트를 넣는 부분.

```jsx
<ProfileCard />
```

| 작성 | 의미 |
|---|---|
| `<main>` | HTML 요소 (소문자) |
| `<ProfileCard />` | 직접 정의한 React 컴포넌트 (**대문자로 시작**) |

- **컴포넌트는 `App` 함수 바깥에 정의한다.** `ProfileCard`와 `App`을 같은 파일의 최상위에 나란히 작성한다.
- 같은 컴포넌트를 여러 번 쓰면(`<ProfileCard />` 두 번) 카드가 두 개 나오고, `ProfileCard` 안의 문장을 바꾸면 **두 카드 모두에 반영**된다.

### 3. 파일 분리와 `export` / `import`
컴포넌트가 많아지면 파일을 나눠 관리한다. `src` 안에 컴포넌트 파일을 모아둘 `components` 폴더를 만든다.

```text
src/
├─ components/
│  └─ ProfileCard.jsx   ← 새로 만든 컴포넌트 파일 (export default ProfileCard)
├─ App.jsx              ← ProfileCard를 import 해서 사용
├─ App.css              ← .profile-card, .profile-image 스타일 (App.jsx에서 import)
├─ index.css
└─ main.jsx
```

내보내는 파일 (`ProfileCard.jsx`):

```jsx
export default ProfileCard;
```

가져오는 파일 (`App.jsx`):

```jsx
import ProfileCard from "./components/ProfileCard.jsx";
```

| 코드 | 의미 |
|---|---|
| `export default` | 이 파일에서 기본으로 내보낼 값 지정 |
| `import` | 다른 파일에서 내보낸 값 가져오기 |
| `./` | 현재 파일이 있는 폴더 기준 |

- 이번에는 컴포넌트 이름과 가져오는 이름을 **동일하게** 쓴다.
- 파일로 옮긴 뒤에는 **`App.jsx`에 있던 `ProfileCard` 함수를 삭제**한다 (같은 이름 중복 정의 금지).
- CSS는 `App.jsx`에서 불러오고 있으므로 `ProfileCard.jsx`에서도 `.profile-card`, `.profile-image` 스타일이 계속 적용된다.

### 4. props — 부모가 자식에게 전달하는 정보
구조는 같게 두고 **내용만 다르게** 보여주고 싶을 때 props를 쓴다.

```jsx
<ProfileCard name="한코딩" />
```

→ `ProfileCard`에 `name`이라는 이름으로 `"한코딩"`을 전달한다.

- 컴포넌트는 전달받은 정보를 **`props` 객체**로 받는다.
- `props.name`은 전달받은 `name` 값에 접근하는 코드다.

```jsx
function ProfileCard(props) {
  return <h2>{props.name}</h2>;
}
```

**데이터 흐름: App → props 전달 → ProfileCard에서 읽기 → 화면 표시**

- 각 `<ProfileCard … />`는 **자기에게 전달된 props만** 읽는다. 두 번째 카드의 `name`을 바꿔도 첫 번째 카드는 그대로다.

### 5. 문자열과 JavaScript 값 전달하기

| 전달할 값 | 쓰는 법 | 예시 |
|---|---|---|
| 고정 문자열 | 따옴표 | `<ProfileCard name="한코딩" />` |
| 변수 값 | 중괄호 | `<ProfileCard name={userName} />` |
| 숫자·불리언 | 중괄호 | `<ProfileCard goalCount={3} isLearning={true} />` |

```jsx
const userName = "한코딩";
```

```jsx
<ProfileCard name={userName} />
```

**`"3"`은 문자열이고 `{3}`은 숫자다.**

### 6. 구조 분해 할당
매번 `props.name`, `props.imageUrl`을 쓰는 대신 필요한 속성을 꺼내 쓴다. 먼저 일반 객체 예제:

```javascript
const profile = {
  name: "한코딩",
  introduction: "웹 개발을 공부합니다."
};

const { name, introduction } = profile;

console.log(name);
console.log(introduction);
```

이 문법을 **객체 구조 분해 할당**이라고 한다. 컴포넌트의 매개변수에 바로 쓸 수 있다. 다음 두 방식은 **같은 props를 읽는다.**

```jsx
function ProfileCard(props) {
  return <h2>{props.name}</h2>;
}
```

```jsx
function ProfileCard({ name }) {
  return <h2>{name}</h2>;
}
```

**구조 분해를 써도 전달하는 방법은 바뀌지 않는다.**

```jsx
<ProfileCard
  name="한코딩"
  introduction="직접 사용하는 서비스를 만듭니다."
  imageUrl="/profile.png"
/>
```

### 7. props는 읽기 전용
컴포넌트는 전달받은 props를 **직접 변경하지 않는다.**

```jsx
// 잘못된 예
const ProfileCard = (props) => {
  props.name = "새로운 이름";

  return <h2>{props.name}</h2>;
}
```

- props는 부모가 전달한 값을 **읽는 데** 쓴다.
- 다른 이름을 표시하려면 **전달하는 쪽(부모)의 데이터를 바꾼다.**

```jsx
<ProfileCard name="한코딩 스터디" />
```

- 사용자 동작에 따라 데이터를 바꾸는 방법은 state에서 다룬다 ([07_이벤트-state](07_이벤트-state.md)).

| 역할 | 담당 |
|---|---|
| 데이터 전달 | 부모 컴포넌트 |
| 전달받은 값으로 화면 표현 | 자식 컴포넌트 |

### 8. props 기본값
전달하지 않은 속성은 `undefined`이고, JSX에서 `undefined`는 텍스트로 표시되지 않는다(빈칸). 값이 없을 때 쓸 **기본값**을 구조 분해에서 `=`로 정할 수 있다.

```jsx
function ProfileCard({
  name,
  introduction = "소개를 준비하고 있습니다.",
  imageUrl = "/profile.png"
}) {
  // ...
}
```

| 전달한 값 | 화면에 쓰이는 값 |
|---|---|
| 전달 안 함 | 기본값 |
| `undefined` | 기본값 |
| `""` (빈 문자열) | `""` — **기본값으로 안 바뀜** |
| `null` | `null` — **기본값으로 안 바뀜** |

### 9. 어디까지 컴포넌트로 나눌까?
모든 태그를 컴포넌트로 만들 필요는 없다. 다음 기준으로 생각한다.
- 같은 구조를 여러 곳에서 사용하는가?
- 하나의 역할이나 콘텐츠로 묶이는가?
- 코드가 길어져 읽기 어려운가?
- 분리했을 때 이름만으로 역할을 이해할 수 있는가?

이번에는 **프로필 카드 단위로만** 분리한다. 제목이나 문단 하나하나를 별도 파일로 만들 필요는 없다.

### 정리

| 개념 | 핵심 |
|---|---|
| 컴포넌트 | 화면의 일부를 표현하고 재사용하는 단위 |
| `export` | 다른 파일에서 사용할 수 있도록 내보내기 |
| `import` | 다른 파일에서 내보낸 값 가져오기 |
| props | 부모가 자식에게 전달하는 정보 |
| 구조 분해 | 객체에서 필요한 속성을 꺼내 사용하는 문법 |
| 기본값 | 전달받은 값이 `undefined`일 때 사용할 값 |

## 실습 정리
04회차의 자기소개 카드를 `ProfileCard`로 분리 → 파일로 옮김 → props로 이름·소개·이미지 전달 → 구조 분해 → 기본값 → 여러 프로필 표시 순서로 진행한다. `App.css`는 04회차 것을 그대로 쓴다.

### 실습 1. 같은 파일에서 컴포넌트 분리하기
`src/App.jsx`를 다음으로 교체한다.

```jsx
import "./App.css";

function ProfileCard() {
  return (
    <div className="profile-card">
      <h2>한코딩</h2>

      <img
        className="profile-image"
        src="/profile.png"
        alt="한코딩의 프로필 이미지"
      />

      <p>직접 사용하는 서비스를 만들고 싶습니다.</p>
    </div>
  );
}

function App() {
  return (
    <main>
      <h1>함께 공부하는 사람들</h1>
      <ProfileCard />
    </main>
  );
}

export default App;
```

`<ProfileCard />`를 하나 더 추가하면 같은 카드가 두 개 나온다.

```jsx
function App() {
  return (
    <main>
      <h1>함께 공부하는 사람들</h1>

      <ProfileCard />
      <ProfileCard />
    </main>
  );
}
```

### 실습 2. 컴포넌트를 별도 파일로 옮기기
`src/components/ProfileCard.jsx`를 만든다.

```jsx
function ProfileCard() {
  return (
    <div className="profile-card">
      <h2>한코딩</h2>

      <img
        className="profile-image"
        src="/profile.png"
        alt="한코딩의 프로필 이미지"
      />

      <p>직접 사용하는 서비스를 만들고 싶습니다.</p>
    </div>
  );
}

export default ProfileCard;
```

`src/App.jsx`는 다음으로 교체한다 (기존 `ProfileCard` 함수는 삭제).

```jsx
import "./App.css";
import ProfileCard from "./components/ProfileCard.jsx";

function App() {
  return (
    <main>
      <h1>함께 공부하는 사람들</h1>

      <ProfileCard />
      <ProfileCard />
    </main>
  );
}

export default App;
```

확인: 화면이 분리 전과 같은지, `ProfileCard.jsx`의 소개 문장을 바꾸면 두 카드가 모두 바뀌는지.

### 실습 3. 이름을 props로 전달하기
`ProfileCard.jsx`를 수정한다.

```jsx
function ProfileCard(props) {
  return (
    <div className="profile-card">
      <h2>{props.name}</h2>

      <img
        className="profile-image"
        src="/profile.png"
        alt="프로필 이미지"
      />

      <p>직접 사용하는 서비스를 만들고 싶습니다.</p>
    </div>
  );
}

export default ProfileCard;
```

`App.jsx`에서 서로 다른 이름을 전달한다.

```jsx
<ProfileCard name="한코딩" />
<ProfileCard name="한코딩 스터디" />
```

<details><summary>수업 중 강사 화면 코드 (name, content 전달)</summary>

```jsx
import './style/App.css'
import ProfileCard from './components/profileCard'


const App = () => {

  return (
    <main>
      <h1>함께 공부하는 사람들</h1>
      <ProfileCard name="한코딩" content="안녕?"/>
      <ProfileCard name="파이썬" content="안녕하세요?"/>
      <ProfileCard name="자바" content="곤니치와?"/>
    </main>
  )
  
}


export default App

```

```jsx
const ProfileCard = (props) => {
  return (
    <div>
      <h2>이름:{props.name}</h2>

      <p>소개:{props.content}</p>
    </div>
  )
}

export default ProfileCard;
```

- 강사 화면에서는 CSS를 `style` 폴더에 두고(`./style/App.css`), 컴포넌트 파일 이름을 `profileCard`로 썼다. **`import` 경로는 내 프로젝트의 실제 폴더·파일 이름(대소문자 포함)과 맞춰야 한다.**
- props 이름은 자유롭게 정할 수 있다 (`content`). 전달하는 이름과 읽는 이름(`props.content`)만 같으면 된다.
</details>

### 실습 4. 소개와 이미지도 props로 전달하기
`ProfileCard.jsx`:

```jsx
function ProfileCard(props) {
  return (
    <div className="profile-card">
      <h2>{props.name}</h2>

      <img
        className="profile-image"
        src={props.imageUrl}
        alt={`${props.name}의 프로필 이미지`}
      />

      <p>{props.introduction}</p>
    </div>
  );
}

export default ProfileCard;
```

`App.jsx`:

```jsx
import "./App.css";
import ProfileCard from "./components/ProfileCard.jsx";

function App() {
  return (
    <main>
      <h1>함께 공부하는 사람들</h1>

      <ProfileCard
        name="한코딩"
        introduction="직접 사용하는 서비스를 만들고 싶습니다."
        imageUrl="/profile.png"
      />

      <ProfileCard
        name="한코딩 스터디"
        introduction="함께 배우고 개발 경험을 나눕니다."
        imageUrl="/profile.png"
      />
    </main>
  );
}

export default App;
```

이번에는 같은 이미지를 쓴다. 다른 이미지를 쓰려면 `public`에 파일을 추가하고 각각의 경로를 전달한다.

### 실습 5. 구조 분해로 props 받기
`ProfileCard.jsx`를 다음으로 교체한다 (`App.jsx`는 그대로).

```jsx
function ProfileCard({ name, introduction, imageUrl }) {
  return (
    <div className="profile-card">
      <h2>{name}</h2>

      <img
        className="profile-image"
        src={imageUrl}
        alt={`${name}의 프로필 이미지`}
      />

      <p>{introduction}</p>
    </div>
  );
}

export default ProfileCard;
```

### 실습 6. 기본값 적용하기

```jsx
function ProfileCard({
  name,
  introduction = "소개를 준비하고 있습니다.",
  imageUrl = "/profile.png"
}) {
  return (
    <div className="profile-card">
      <h2>{name}</h2>

      <img
        className="profile-image"
        src={imageUrl}
        alt={`${name}의 프로필 이미지`}
      />

      <p>{introduction}</p>
    </div>
  );
}

export default ProfileCard;
```

`introduction`을 생략하고 확인한다 → "소개를 준비하고 있습니다."가 표시된다.

```jsx
<ProfileCard
  name="한코딩"
  imageUrl="/profile.png"
/>
```

### 종합 실습. 같은 컴포넌트로 다른 프로필 표시하기 (최종 코드)

**`src/components/ProfileCard.jsx`**

```jsx
function ProfileCard({
  name,
  introduction = "소개를 준비하고 있습니다.",
  imageUrl = "/profile.png",
  interest = "아직 정하지 않았습니다."
}) {
  return (
    <article className="profile-card">
      <h2>{name}</h2>

      <img
        className="profile-image"
        src={imageUrl}
        alt={`${name}의 프로필 이미지`}
      />

      <p>{introduction}</p>
      <p>관심사: {interest}</p>
    </article>
  );
}

export default ProfileCard;
```

- 카드가 독립적인 자기소개 콘텐츠이므로 `article`을 썼다. 기존 `.profile-card` 스타일은 그대로 적용된다.

**`src/App.jsx`**

```jsx
import "./App.css";
import ProfileCard from "./components/ProfileCard.jsx";

function App() {
  const profile = {
    name: "한코딩",
    introduction: "직접 사용하는 서비스를 만들고 싶습니다.",
    imageUrl: "/profile.png",
    interest: "웹 서비스와 앱 개발"
  };

  return (
    <main>
      <h1>함께 공부하는 사람들</h1>

      <ProfileCard
        name={profile.name}
        introduction={profile.introduction}
        imageUrl={profile.imageUrl}
        interest={profile.interest}
      />

      <ProfileCard
        name="한코딩 스터디"
        introduction="함께 배우고 개발 경험을 나눕니다."
        imageUrl="/profile.png"
        interest="협업과 프로젝트"
      />

      <ProfileCard
        name="새로운 동료"
      />
    </main>
  );
}

export default App;
```

결과:

| 카드 | 전달한 props | 화면 |
|---|---|---|
| 1 | 객체 값을 `{}`로 4개 모두 전달 | 객체에 적은 이름·소개·관심사 |
| 2 | 문자열 4개 전달 | "한코딩 스터디", 협업과 프로젝트 |
| 3 | `name`만 전달 | 소개 "소개를 준비하고 있습니다.", 관심사 "아직 정하지 않았습니다.", 기본 이미지 |

**같은 컴포넌트를 써도 전달하는 데이터에 따라 다른 화면을 표현할 수 있다.**

### 직접 바꿔보기 (미션)
- [ ] `<ProfileCard />`를 하나 더 추가해 같은 카드가 두 개 나오는지 확인한다.
- [ ] 두 번째 카드의 `name` 값을 바꾸고, 첫 번째 카드는 그대로인지 확인한다.
- [ ] `interest` props를 추가해 관심사를 표시한다: ① `App.jsx`에서 `interest` 전달 → ② `ProfileCard.jsx`에서 `interest` 받기 → ③ JSX에 `<p>관심사: {interest}</p>` 표시
- [ ] 카드 하나에서 `introduction`을 생략하고 기본값 문장이 나오는지 확인한다.
- [ ] 프로필 카드를 하나 더 추가하고, 카드마다 다른 이름과 소개를 전달한다.
- [ ] `ProfileCard.jsx`에 안내 문장을 추가해 모든 카드에 반영되는지 확인한다.

## 헷갈리기 쉬운 점
- **컴포넌트 이름은 대문자로 시작한다.** 소문자면 HTML 요소로 취급된다.
- **컴포넌트는 `App` 함수 바깥(파일 최상위)에 정의한다.**
- **파일로 옮긴 뒤 `App.jsx`의 기존 `ProfileCard` 함수를 지운다.** 남겨두면 `import`와 이름이 겹쳐 "같은 이름의 선언" 오류가 난다.
- **`import` 경로는 실제 폴더·파일 이름(대소문자 포함)과 같아야 한다.** `./`는 현재 파일이 있는 폴더 기준.
- **전달하는 props 이름과 읽는 이름이 같아야 한다.** `introduction`으로 보내고 `props.intro`로 읽으면 빈칸.
- **`"3"`은 문자열, `{3}`은 숫자.** 숫자·불리언·변수는 중괄호로 전달한다.
- **props는 직접 바꾸지 않는다** (`props.name = …` ❌). 바꾸려면 부모가 전달하는 값을 바꾼다.
- **기본값은 `undefined`(또는 생략)일 때만 쓰인다.** `""`나 `null`을 넘기면 기본값이 나오지 않는다.
- **구조 분해를 써도 부모 쪽 전달 방법은 똑같다.**

**오류가 나면 확인할 것**

| 증상 | 확인할 내용 |
|---|---|
| 컴포넌트를 찾을 수 없다는 오류 | `import` 여부, 이름의 철자 |
| 파일을 가져오지 못함 | 경로·파일 이름·대소문자 |
| 컴포넌트가 표시되지 않음 | 대문자 이름, JSX에서 사용했는지, `return` 여부 |
| 이름이 표시되지 않음 | 전달한 props 이름과 읽는 이름이 같은지 |
| 이미지가 보이지 않음 | 이미지 경로와 `public` 안의 파일 |
| 같은 이름의 선언 오류 | 기존 함수와 `import`가 중복되어 있는지 |
| 기본값이 표시되지 않음 | `""`나 `null`을 전달한 것은 아닌지 |

전달된 값을 확인하려면 잠시 콘솔에 찍어본다.

```jsx
function ProfileCard(props) {
  console.log(props);

  return <h2>{props.name}</h2>;
}
```

렌더링할 때마다 출력되며, 개발 환경에서는 같은 출력이 반복해서 보일 수 있다. 출력 횟수보다 **전달된 값**을 확인한다.

> 💡 보충: 반복 출력은 `main.jsx`의 `<StrictMode>` 때문이다. 개발 중 실수를 찾으려고 컴포넌트를 두 번 렌더링하며, 배포용 빌드에서는 한 번만 실행된다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 컴포넌트 정의 | 함수 (대문자 이름) | `function ProfileCard() { return (…); }` |
| 컴포넌트 정의 (화살표) | 화살표 함수 | `const ProfileCard = () => { return (…); }` |
| 컴포넌트 사용 | 태그처럼 | `<ProfileCard />` |
| 파일에서 내보내기 | `export default` | `export default ProfileCard;` |
| 다른 파일에서 가져오기 | `import … from` | `import ProfileCard from "./components/ProfileCard.jsx";` |
| 문자열 전달 | 따옴표 | `<ProfileCard name="한코딩" />` |
| 변수·객체 값 전달 | 중괄호 | `<ProfileCard name={profile.name} />` |
| 숫자·불리언 전달 | 중괄호 | `goalCount={3} isLearning={true}` |
| props 읽기 | `props.이름` | `{props.name}` |
| 구조 분해로 받기 | `({ … })` | `function ProfileCard({ name, imageUrl })` |
| 기본값 정하기 | 구조 분해 + `=` | `{ introduction = "소개를 준비하고 있습니다." }` |
| 전달된 값 확인 | `console.log` | `console.log(props);` |

## 확인 문제

<details><summary>Q. 프로필 카드가 여러 개 필요할 때, 코드를 복사하는 대신 컴포넌트로 만드는 이유는?</summary>

복사하면 카드 구조를 바꿀 때 복사한 곳을 **모두 따로 수정**해야 한다. 공통 구조를 컴포넌트로 만들면 **한곳에서 관리하고 여러 번 사용**할 수 있다. 달라지는 내용(이름, 소개)은 props로 전달한다.
</details>

<details><summary>Q. `ProfileCard`를 두 번 사용한 상태에서 `ProfileCard` 안의 소개 문장을 바꾸면 두 카드에 모두 반영되는가?</summary>

**예.** 두 카드 모두 같은 컴포넌트 정의를 사용하므로 정의를 바꾸면 모든 카드에 반영된다.
</details>

<details><summary>Q. JSX에서 `main` 태그와 `ProfileCard` 태그는 어떻게 구분되는가? 컴포넌트는 어디에 정의하는가?</summary>

소문자로 시작하는 `main`은 **HTML 요소**, 대문자로 시작하는 `ProfileCard`는 **직접 정의한 React 컴포넌트**다. 컴포넌트는 **`App` 함수 바깥**(파일 최상위)에 정의한다.
</details>

<details><summary>Q. `ProfileCard`를 `src/components/ProfileCard.jsx`로 옮긴 뒤, 두 파일에 각각 무엇을 써야 하는가?</summary>

- `ProfileCard.jsx`: `export default ProfileCard;`
- `App.jsx`: `import ProfileCard from "./components/ProfileCard.jsx";` 그리고 기존 `ProfileCard` 함수는 삭제 (중복 선언 방지)
</details>

<details><summary>Q. props란 무엇이고, 데이터는 어느 방향으로 흐르는가?</summary>

**부모 컴포넌트가 자식 컴포넌트에 전달하는 정보**다. 자식은 이를 `props` 객체로 받는다.
흐름: **App(부모) → props 전달 → ProfileCard(자식)에서 읽기 → 화면 표시**
</details>

<details><summary>Q. 두 번째 카드의 `name` 값을 바꾸면 첫 번째 카드의 이름도 바뀌는가?</summary>

**아니다.** 각 카드는 자기에게 전달된 props만 읽는다. 구조는 같아도 내용은 카드마다 독립적이다.
</details>

<details><summary>Q. `goalCount="3"`과 `goalCount={3}`의 차이는?</summary>

`"3"`은 **문자열**, `{3}`은 **숫자**다. 숫자·불리언·변수 값은 중괄호로 전달한다 (예: `isLearning={true}`, `name={userName}`).
</details>

<details><summary>Q. `function ProfileCard(props)`와 `function ProfileCard({ name })`의 차이는? 부모의 전달 방법도 바뀌는가?</summary>

둘 다 **같은 props를 읽는다.** 앞은 `props.name`으로, 뒤는 **객체 구조 분해 할당**으로 `name`을 바로 꺼내 쓴다. 부모 쪽 전달 방법(`<ProfileCard name="한코딩" />`)은 **바뀌지 않는다.**
</details>

<details><summary>Q. 컴포넌트 안에서 `props.name = "새로운 이름";`처럼 쓰면 안 되는 이유와 올바른 방법은?</summary>

props는 **읽기 전용**이다. 부모가 전달한 값을 읽는 데만 쓴다. 다른 이름을 표시하려면 **전달하는 쪽(부모)의 데이터를 바꾼다**. 사용자 동작에 따라 바꾸는 것은 state로 한다.
</details>

<details><summary>Q. `introduction`을 전달하지 않으면 어떻게 표시되는가? 기본값이 `"소개를 준비하고 있습니다."`일 때 `""`나 `null`을 전달하면?</summary>

- 기본값이 없으면 `undefined` → JSX에서 아무것도 표시되지 않는다.
- 기본값이 있으면 생략(또는 `undefined`) 시 **"소개를 준비하고 있습니다."** 가 표시된다.
- `""`나 `null`을 전달하면 **기본값으로 바뀌지 않는다** (빈 값 그대로).
</details>

<details><summary>Q. 어떤 기준으로 컴포넌트를 나누는가?</summary>

- 같은 구조를 여러 곳에서 쓰는가?
- 하나의 역할·콘텐츠로 묶이는가?
- 코드가 길어 읽기 어려운가?
- 분리했을 때 이름만으로 역할을 알 수 있는가?

모든 태그를 나눌 필요는 없다. 이번 강의에서는 프로필 카드 단위로만 분리했다.
</details>

<details><summary>Q. 컴포넌트에 어떤 값이 전달됐는지 확인하려면? 콘솔에 같은 내용이 여러 번 찍히는 건 문제인가?</summary>

컴포넌트 안에서 `console.log(props);`로 확인한다. 렌더링할 때마다 출력되고 개발 환경에서는 반복해서 보일 수 있으므로, **횟수보다 전달된 값**을 본다.
</details>

## 완료 체크
- [ ] `ProfileCard` 컴포넌트를 만들었다.
- [ ] 별도 파일로 분리하고 불러왔다.
- [ ] 이름·소개·이미지를 props로 전달했다.
- [ ] 같은 컴포넌트로 다른 프로필을 표시했다.
- [ ] props의 기본값을 적용했다.
- [ ] 전달받은 props를 직접 변경하지 않는다는 것을 이해했다.

## 질문 노트

_아직 없음_
