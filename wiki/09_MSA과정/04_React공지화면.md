# 04. React로 공지 목록·상세·등록 화면 만들기 — Vite 프록시로 Express 공지 API 연결

> 과정: MSA과정 · [노션 원문](https://app.notion.com/p/423848f71c9b8025bc55cd4783a61bb6) · 최종 갱신일: 2026-11-27

## 한눈에 보기
- [03](03_Express공지API.md)의 Express 공지 서비스(`notice-service`, **3000**) 옆 폴더에 Vite React 프로젝트 `notice-web`(**5173**)을 만들고, **Vite 프록시**로 `/api` 요청을 Express에 전달한다. React는 상대 주소 `fetch("/api/notices")`를 쓰고 Express에 CORS 설정을 하지 않는다. **이번 단계는 아직 Spring을 호출하지 않는다.**
- 화면을 `NoticeList`(목록)·`NoticeDetail`(상세)·`NoticeForm`(등록) 세 컴포넌트로 나눈다. `App`은 **선택한 공지 번호 `selectedId`** 와 **목록 갱신 신호 `refreshKey`** 만 갖고, 로딩·오류 같은 상태는 각 컴포넌트가 따로 관리한다.
- 공통 함수 `requestJson`(`src/api.js`)이 `fetch` → JSON 읽기 → `response.ok`가 아니면 **서버가 보낸 `message`** (없으면 상태 코드 문구)로 `throw` → 성공이면 데이터 반환을 맡는다.
- 상세는 목록의 객체를 쓰지 않고 **상세 API `GET /api/notices/:id`를 따로 호출**한다. 등록은 `preventDefault()` 뒤 입력값을 검사하고, 작성자 번호를 **`Number()`로 바꿔 JSON 숫자**로 POST한다.
- 등록에 성공하면 `refreshKey`를 올려 목록을 다시 조회하고 `selectedId`를 새 공지로 바꿔 상세를 보여준다. Express를 끄면 오류 안내가 나오고, 다시 켜면 메모리 데이터가 초기 공지 두 건으로 돌아간다.

## 학습 목표
- React와 Express를 개발용 프록시로 연결한다.
- API에서 받은 공지 목록과 상세 내용을 표시한다.
- 입력한 데이터를 JSON으로 보내 공지를 등록한다.
- 등록 후 목록을 갱신하고 새 공지를 표시한다.
- 로딩·오류·빈 목록 상태를 구분한다.

## 핵심 개념

### 1. 이번에 연결할 구조
[03](03_Express공지API.md)에서 만든 Express API를 React 화면에 연결한다.

```text
사용자
  ↓
React :5173
  ↓ /api 요청
Vite 프록시
  ↓
Express :3000
```

| 구성 | 포트 | 이번 단계의 역할 |
|---|---|---|
| React | 5173 | 공지 화면 |
| Express | 3000 | 공지 조회·등록 |
| Spring | 8080 | 아직 연결하지 않음 |

- 이번 단계에서는 아직 Express가 Spring을 호출하지 않는다. 그래서 상세 화면에는 작성자 이름 대신 **작성자 번호**를 표시한다.

사용할 API — [03](03_Express공지API.md)의 공지 API 그대로다.

| 요청 | 기능 |
|---|---|
| `GET /api/notices` | 공지 목록 |
| `GET /api/notices/:id` | 공지 상세 |
| `POST /api/notices` | 공지 등록 |

> 💡 보충: 03의 API 계약(11장)대로 목록은 200 + 배열, 상세는 200 + 객체(잘못된 번호 400, 없는 공지 404), 등록은 201 + 생성된 공지(잘못된 입력 400)를 응답하고, 오류 본문은 `{ "message": "…" }`이다. 이번 화면은 이 규칙을 그대로 이용한다.

### 2. Vite 프록시 — `/api` 요청을 Express로 전달
`vite.config.js`의 `server.proxy`에서 `/api`로 시작하는 요청을 `http://localhost:3000`으로 보낸다 (전체 코드는 실습 3). [SSR 04](../08_SSR-CSR과정/04_React-CSR화면.md) 4장과 같은 설정이고, 대상만 Spring 8080에서 Express 3000으로 바뀌었다.

```javascript
proxy: {
  "/api": {
    target: "http://localhost:3000",
    changeOrigin: true,
  },
},
```

React 코드에서는 상대 주소로 요청한다.

```javascript
fetch("/api/notices");
```

```text
브라우저 → localhost:5173/api/notices
                      ↓ Vite가 전달
           localhost:3000/api/notices
```

- 경로를 지우는 **`rewrite`는 쓰지 않는다.** Express에도 `/api/notices`가 그대로 있기 때문이다.
- 브라우저가 같은 출처의 Vite로 요청하므로 **별도의 CORS 허용 설정 없이** 개발할 수 있다.
- **Vite 프록시는 개발 서버용 설정이다.** 배포 환경에서는 API 연결 방식을 따로 구성해야 한다.
- 설정을 바꾸기 전부터 개발 서버를 실행하고 있었다면 종료한 뒤 다시 실행한다.

> 💡 보충: [Node 04](../02_Node과정/04_React-서버연결.md)에서는 React가 Express에 **직접** 요청해서 서버에 `cors` 패키지를 붙였다. 03의 `server.cjs`에는 CORS 설정이 없다 (curl로 보면 응답에 `Access-Control-Allow-Origin` 헤더가 없다). 그래서 이번 React 코드에 `http://localhost:3000/api/notices`처럼 전체 주소를 쓰면 프록시를 거치지 않는 다른 출처 요청이 되어 CORS 오류가 난다.
>
> | 방식 | `fetch` 주소 | Express CORS 설정 |
> |---|---|---|
> | Node 04 | `http://localhost:3000/students` | `cors` 필요 |
> | 이번 (Vite 프록시) | `/api/notices` | 필요 없음 |

### 3. 화면을 컴포넌트로 나누기 — 상태는 쓰는 곳에 둔다

```text
App
 ├─ NoticeList   공지 목록
 ├─ NoticeDetail 선택한 공지 상세
 └─ NoticeForm   공지 등록
```

```text
src
├─ components
│  ├─ NoticeList.jsx
│  ├─ NoticeDetail.jsx
│  └─ NoticeForm.jsx
├─ api.js
├─ App.jsx
├─ App.css
└─ main.jsx
```

| 상태 | 관리할 위치 |
|---|---|
| 선택한 공지 번호 | App |
| 목록 갱신 신호 | App |
| 목록·목록 로딩·목록 오류 | NoticeList |
| 상세·상세 로딩·상세 오류 | NoticeDetail |
| 입력값·등록 중·등록 오류 | NoticeForm |

- 각 영역의 상태를 나누면 **상세 조회에 실패하더라도 등록 폼과 목록을 유지**할 수 있다.

> 💡 보충: `App`에 둔 두 값은 여러 컴포넌트가 함께 쓰는 값이다. `selectedId`는 목록의 선택 표시와 상세 조회에, `refreshKey`는 폼의 등록 결과를 목록에 알리는 데 쓴다. 자식은 props로 받은 함수(`onSelect`, `onCreated`)를 불러 부모의 state를 바꾼다 (props는 [React 05](../01_React과정/05_컴포넌트-props.md)).

### 4. 공통 요청 함수 `requestJson`
목록·상세·등록이 모두 쓰는 `src/api.js`다 (전체 코드는 실습 4).

1. 서버에 요청한다.
2. JSON 응답을 읽는다. JSON이 아니면 `.catch(() => null)`로 `null`이 된다.
3. HTTP 실패라면 오류를 발생시킨다.
4. 성공하면 데이터를 반환한다. 성공인데 `data`가 `null`이면 "서버의 JSON 응답을 확인해 주세요." 오류를 던진다.

**`response.ok`를 확인하는 이유** — `fetch`는 `400`, `404`, `500` 응답을 받았다는 이유만으로 자동으로 예외를 던지지 않는다. 직접 상태를 확인해 성공과 실패를 구분한다.

**서버의 `message` 사용** — Express의 오류 응답은 다음 형태였다 ([03](03_Express공지API.md)).

```json
{
  "message": "제목을 입력해 주세요."
}
```

다음 코드로 서버가 보낸 안내를 화면 문구로 쓴다.

```javascript
data?.message ?? `요청에 실패했습니다. (${response.status})`
```

| 문법 | 의미 |
|---|---|
| `?.` | 값이 없을 때 속성 접근 오류를 피함 |
| `??` | 왼쪽 값이 `null` 또는 `undefined`이면 오른쪽 값 사용 |

- 서버가 JSON이 아닌 오류 응답을 보내더라도 기본 오류 문구로 안내할 수 있다.
- 이 함수는 이번 API처럼 **성공 시 JSON을 반환하는 요청**에 쓴다. 본문 없는 `204` 응답까지 처리하는 범용 함수는 아니다.

> 💡 보충: `data`가 `null`이 되는 경우를 실제로 만들어 봤다 (2026-11-27, Vite 8.4).
>
> | 상황 | 받은 응답 | 화면 문구 |
> |---|---|---|
> | Express가 꺼져 있음 | Vite가 보낸 `502 Bad Gateway`, 본문 없음 | `요청에 실패했습니다. (502)` |
> | 프록시 설정 없이 `GET /api/notices` | Vite가 앱의 `index.html`을 **200**으로 응답 | `서버의 JSON 응답을 확인해 주세요.` |
> | 프록시 설정 없이 `POST /api/notices` | Vite가 `404`, 본문 없음 | `요청에 실패했습니다. (404)` |
>
> 두 번째 줄처럼 `response.ok`가 `true`여도 JSON이 아닐 수 있어서 `data === null` 검사가 따로 있다. 화면에 이 문구가 보이면 `vite.config.js`의 프록시 설정과 요청 주소의 `/api`부터 확인한다.

### 5. 공지 목록 — `refreshKey`·`onSelect`·`ignore`
`NoticeList`는 목록·로딩·오류 state를 갖고, `useEffect`에서 `requestJson("/api/notices")`로 목록을 가져온다 (전체 코드는 실습 5).

```javascript
useEffect(() => {
  // 목록 요청 → notices · loading · error 갱신
}, [refreshKey]);
```

- **`refreshKey`** — 부모가 전달한 `refreshKey`가 바뀌면 목록을 다시 조회한다. 새 공지가 등록되었을 때 목록을 갱신하는 신호로 쓴다.
- **`onSelect`** — 클릭한 공지 번호를 부모 컴포넌트로 전달한다.

```jsx
onClick={() => onSelect(notice.id)}
```

- **`ignore`** — Effect가 정리된 뒤 완료된 이전 요청의 결과를 반영하지 않도록 한다. 요청 자체를 취소하는 것이 아니라, **더 이상 유효하지 않은 결과를 화면에 반영하지 않는 처리**다.

목록 영역의 표시 조건:

| 조건 | 표시 |
|---|---|
| `loading` | "목록을 불러오는 중입니다." (`role="status"`) |
| `!loading && error` | 오류 문구 (`.error`, `role="alert"`) |
| `!loading && !error && notices.length === 0` | "등록된 공지가 없습니다." |
| `!loading && !error && notices.length > 0` | 공지 버튼 목록 (`#번호` + 제목) |

- 선택된 공지 버튼은 클래스가 `notice-button selected`가 되고, `aria-pressed={notice.id === selectedId}`로 눌린 상태를 알린다.

> 💡 보충: `async/await`·`try/catch/finally`·`ignore` 흐름은 [SSR 04](../08_SSR-CSR과정/04_React-CSR화면.md) 6장과 같다. 그때는 `[searchKeyword]`(검색 조건), 이번엔 `[refreshKey]`(갱신 신호)가 바뀔 때 다시 조회한다. `refreshKey`의 값은 화면에 쓰지 않고 **바뀌었다는 사실만** 쓴다. 로딩·오류·빈 목록·목록을 조건마다 `!loading && …`로 나눈 방식도 SSR 04 8장과 같다.

### 6. 공지 상세 — 상세 API를 따로 호출
`NoticeDetail`은 부모에게 받은 `noticeId`로 상세 API를 호출한다 (전체 코드는 실습 6). Effect의 의존성은 `[noticeId]`다.

```text
공지 1번 선택
      ↓
noticeId로 1 전달
      ↓
GET /api/notices/1
      ↓
상세 데이터 저장
      ↓
상세 화면 표시
```

- 이번에는 목록에서 받은 객체를 그대로 표시하지 않고 **상세 API를 따로 호출**한다.
- 현재 상세 화면에는 공지 번호·제목·**작성자 번호**·내용을 표시한다.
- 상세 영역도 로딩("공지를 불러오는 중입니다.") → 오류 → 공지 순서로 하나만 보인다.

> 💡 보충: `.notice-content`의 `white-space: pre-wrap`은 내용에 넣은 줄바꿈을 화면에서도 유지한다.

### 7. 공지 등록 — 검사하고 숫자로 보내기
`NoticeForm`은 입력값 세 개와 `submitting`·`error`·`message` state를 갖는다 (전체 코드는 실습 7).

**기본 폼 제출 막기** — 페이지 이동 대신 JavaScript로 POST 요청을 보낸다 ([React 08](../01_React과정/08_폼-배열state-할일앱.md) 4장).

```javascript
event.preventDefault();
```

**`handleSubmit`의 순서**

```text
preventDefault, 이전 안내 지우기
      ↓
제목·내용 trim() → 비었으면 "제목과 내용을 입력해 주세요."
      ↓
Number(authorId) → 안전한 양의 정수가 아니면 "작성자 번호는 양의 정수로 입력해 주세요."
      ↓
submitting = true → POST /api/notices
      ↓
성공: 입력창 비우기 · "공지가 등록되었습니다." · onCreated(생성된 공지)
실패: 오류 문구 표시
      ↓
submitting = false (finally)
```

**입력값을 숫자로 변환하는 이유** — 숫자 입력창도 `event.target.value`로 읽으면 문자열이다.

```javascript
const authorNumber = Number(authorId);
```

API에는 다음처럼 숫자로 보낸다.

```json
{
  "authorId": 3
}
```

**등록 중 비활성화** — 등록 요청이 끝날 때까지 폼의 입력과 버튼을 비활성화한다. 버튼 문구도 "등록 중..."으로 바뀐다.

```jsx
<fieldset disabled={submitting}>
```

- 화면에서 **중복 제출을 줄이는 처리**이며, 서버 차원의 중복 방지까지 해결하는 것은 아니다.

**브라우저와 서버 양쪽에서 검사** — 브라우저에서는 사용자에게 빠르게 안내하기 위해 검사한다. 하지만 브라우저의 검사는 우회할 수 있으므로 **Express의 입력값 검사도 유지한다.**

> 💡 보충: 03의 Express는 `authorId: "2"`(문자열)를 400으로 거절한다 ([03](03_Express공지API.md) 7장). 그래서 `Number()` 변환이 꼭 필요하다. 등록이 실패하면 입력값을 비우지 않으므로 고쳐서 다시 제출할 수 있다.

> 💡 보충: 입력창의 `required`·`min="1"`·`step="1"`은 브라우저의 입력 검사다. jsdom으로 확인하니 제목을 비우거나 작성자 번호에 `0`을 넣으면 **브라우저 검사에서 제출이 멈춰** `handleSubmit`이 실행되지 않았다 (요청 없음, 화면 아래 오류 문구 없음). 공백만 넣은 제목은 `required`를 통과하므로 `trim()` 검사가 "제목과 내용을 입력해 주세요."를 보여준다. 강의가 "브라우저 입력 검사 **또는** 화면의 오류 안내"라고 한 이유다.

### 8. App에서 세 컴포넌트 연결하기
`App`은 `selectedId`(처음 `null`)와 `refreshKey`(처음 `0`)를 갖는다 (전체 코드는 실습 8). `selectedId`가 `null`이면 상세 자리에 "목록에서 공지를 선택해 주세요." 패널을 보여준다.

**공지를 선택하면**

```text
NoticeList에서 번호 전달
              ↓
App의 selectedId 변경
              ↓
NoticeDetail에 번호 전달
              ↓
상세 API 조회
```

**공지를 등록하면**

```text
POST 성공
    ↓
생성된 공지를 onCreated로 전달
    ↓
App의 handleCreated 실행
    ├─ refreshKey 증가 → 목록 다시 조회
    └─ selectedId 변경 → 새 공지 상세 표시
```

- "목록 다시 불러오기" 버튼도 `refreshKey`를 1 올린다.

**`key`에 `refreshKey`도 사용하는 이유**

```jsx
key={`${selectedId}-${refreshKey}`}
```

- 공지 선택이나 목록 갱신 때 상세 컴포넌트를 **새로 시작**하도록 했다. 이전 상세 데이터와 오류 상태를 초기화하고 다시 조회한다.

> 💡 보충: `key`가 바뀌면 React는 그 컴포넌트를 버리고 새로 만든다. state가 초기값(`notice: null`, `loading: true`, `error: ""`)으로 돌아가고 Effect가 다시 실행된다. 목록 항목에 붙이던 `key`([React 06](../01_React과정/06_목록-조건부렌더링.md))와 같은 속성을 컴포넌트 하나에 준 것이다. 그래서 "목록 다시 불러오기"를 누르면 목록과 함께 **선택 중인 상세도 다시 조회**된다. `onSelect={setSelectedId}`는 state 변경 함수를 그대로 넘긴 것이고, `setRefreshKey((previous) => previous + 1)`은 이전 값을 기준으로 바꾸는 함수형 업데이트다 ([React 07](../01_React과정/07_이벤트-state.md) 5장).

### 9. Network에서 요청 확인하기
개발자 도구의 Network에서 **Fetch/XHR**을 선택한다.

| 동작 | 요청 | 정상 상태 |
|---|---|---|
| 목록 표시 | `GET /api/notices` | 200 |
| 공지 선택 | `GET /api/notices/1` 등 | 200 |
| 공지 등록 | `POST /api/notices` | 201 |
| 등록 후 갱신 | 목록·새 공지 상세 GET | 200 |

POST 요청을 선택하고 Payload를 확인한다. 특히 **`authorId`가 문자열이 아닌 숫자인지** 본다.

```json
{
  "title": "팀 회의 안내",
  "content": "오후에 프로젝트 진행 상황을 공유합니다.",
  "authorId": 2
}
```

- 요청 주소가 `localhost:5173`으로 표시되는 것은 정상이다. Vite가 Express 3000으로 전달한다.

**개발 중 요청이 두 번 보인다면?** Strict Mode가 켜져 있으면 개발 환경에서 초기 Effect가 추가로 실행될 수 있다. 이를 공지 등록 POST의 중복 실행과 구분한다. 등록 요청은 버튼 제출 이벤트에서만 실행하며, Effect 안에 넣지 않았다.

> 💡 보충: jsdom에서 `StrictMode`로 감싸 렌더링하고 요청을 세어 봤다 (2026-11-27, React 19.3 개발 빌드).
>
> | 동작 | 보낸 요청 |
> |---|---|
> | 첫 화면 | `GET /api/notices` **2번** |
> | 공지 1번 선택 | `GET /api/notices/1` **2번** |
> | 공지 등록 | `POST /api/notices` 1번(201) → `GET /api/notices` 1번 → `GET /api/notices/3` **2번** |
> | 목록 다시 불러오기 | `GET /api/notices` 1번 → 선택 중인 상세 GET **2번** |
>
> 상세는 `key`가 바뀔 때마다 **새로 마운트**되므로 Strict Mode의 "처음 실행 한 번 더"가 매번 일어난다. 목록은 처음에만 두 번이고, 그 뒤 `refreshKey`가 바뀔 때는 한 번이다. POST는 언제나 한 번이다. 응답의 `Location: /api/notices/3` 헤더도 Vite를 거쳐 그대로 온다.

### 10. 서버 중단과 복구
- **Express 중단** — Express 터미널에서 `Ctrl + C` → React에서 **목록 다시 불러오기** → 오류 안내 확인 → 등록 요청도 실패하는지 확인.
- **Express 복구** — `node server.cjs`로 다시 실행 → **목록 다시 불러오기** → 초기 공지 선택. Express는 메모리에 저장하므로 **재시작 전에 등록한 공지는 사라진다.** 사라진 공지를 선택하고 있었다면 상세 API는 `404`를 응답한다. 초기 공지를 다시 선택하면 된다.
- **빈 목록 확인** — 초기 공지는 두 건이라 빈 목록 안내가 안 보인다. Express의 공지 배열을 잠시 `const notices = [];`로 바꾸고 재시작 → 목록 다시 불러오기 → 빈 목록 안내 확인 → **초기 데이터를 복구하고 다시 실행**한다.
- **Spring만 중단한다면?** 현재 Express는 아직 Spring을 호출하지 않으므로 Spring의 중단은 이번 공지 조회·등록에 영향을 주지 않는다. **각 요청이 어느 서비스에 의존하는지 구분한다.**

> 💡 보충: 실제 결과 (2026-11-27, Vite 8.4.0 · Express 5.3.0, jsdom 화면 확인)
>
> | 상황 | 목록 | 상세 | 등록 |
> |---|---|---|---|
> | Express를 끄고 목록 다시 불러오기 | `요청에 실패했습니다. (502)` | 같은 문구 (`key`가 바뀌어 다시 조회) | POST도 502 → 폼 아래 같은 문구, 입력값은 남음 |
> | 다시 켜고 목록 다시 불러오기 (1번 선택 중) | 초기 공지 2건 | 1번 상세 정상 | — |
> | 등록한 3번을 선택한 채 재시작 → 다시 불러오기 | 초기 공지 2건 | `공지를 찾을 수 없습니다.` (404) | — |
> | 배열을 `[]`로 바꿔 재시작 | `등록된 공지가 없습니다.` | — | — |
>
> 502는 Express가 아니라 **Vite가 대신 보낸 응답**이다 (Vite 터미널에 `http proxy error: /api/notices`와 `ECONNREFUSED`). 브라우저가 연결한 곳은 Vite라서 `fetch` 자체는 실패하지 않고 502 응답을 받는다 — [SSR 04](../08_SSR-CSR과정/04_React-CSR화면.md) 실습 7과 같다. 404 문구는 Express가 보낸 `message`를 `requestJson`이 그대로 쓴 것이다. 폼의 오류 문구는 다음 제출 때까지 남아서, Express를 다시 켠 뒤에도 폼 아래에 502 문구가 보인다.

### 정리

| 요소 | 역할 |
|---|---|
| Vite 프록시 | React의 API 요청을 Express로 전달 |
| `requestJson` | JSON 응답과 HTTP 오류 처리 |
| `NoticeList` | 목록 조회와 공지 선택 |
| `NoticeDetail` | 선택한 공지의 상세 조회 |
| `NoticeForm` | 입력·검사·등록 |
| `selectedId` | 상세 화면에 표시할 공지 번호 |
| `refreshKey` | 목록 재조회를 위한 상태 |
| `Number(authorId)` | 입력 문자열을 숫자로 변환 |
| 프론트엔드 검사 | 사용자에게 빠르게 입력 오류 안내 |
| 서버 검사 | 우회 가능한 브라우저 검사와 별도로 요청 검증 |

## 실습 정리

### 실행 구성
Spring·Express 프로젝트와 **별도 폴더**에 React 프로젝트를 만든다.

```text
실습 폴더
├─ student-service
├─ notice-service
└─ notice-web
```

| 프로젝트 | 역할 | 실행 | 주소 |
|---|---|---|---|
| `notice-service` ([03](03_Express공지API.md)) | 공지 API | `node server.cjs` | `http://localhost:3000/api/notices` |
| `notice-web` (새로 만듦) | 공지 화면 | `npm run dev` | `http://localhost:5173` |
| `student-service` ([02](02_Spring학생API.md)) | 학생 API | 이번에는 쓰지 않음 | — |

- Express와 React 개발 서버는 **각각 다른 터미널에서 실행한 채 유지**한다.
- 강사가 제공한 시작 프로젝트를 쓴다면 새로 만들지 않고 그 폴더에서 `npm install`만 한다.

### 단계 흐름
1. `notice-web` 생성 → `npm install`
2. 다른 터미널에서 `notice-service`를 `node server.cjs`로 실행 → `http://localhost:3000/api/notices` 응답 확인. **백엔드 API가 동작하는지 확인한 뒤 화면을 연결한다.**
3. `vite.config.js`에 프록시 설정 → `npm run dev`
4. `src/api.js`, `src/components/` 세 파일, `src/App.jsx` 작성 → `src/App.css` 교체 → `main.jsx`의 `index.css` import 제거
5. 전체 동작 확인 → Network 확인 → Express 중단·복구·빈 목록 확인

### 실습 1. React 프로젝트 만들기
상위 실습 폴더의 터미널에서 실행한다.

```bash
npm create vite@latest notice-web -- --template react
```

```bash
cd notice-web
```

```bash
npm install
```

> 💡 보충: 2026-11-27 create-vite 9.4는 `--template react`를 줘도 몇 가지를 더 묻는다: `Which linter to use?`(기본 Oxlint), `Add Vite DevTools?`(기본 No), `Install with npm and start now?`. 앞의 둘은 기본값으로 넘어가면 되고, 마지막을 No로 하면 강의대로 `cd`·`npm install`을 직접 한다. 이 버전의 React 템플릿은 `npm run lint`가 ESLint가 아니라 **Oxlint**를 실행한다 (ESLint를 원하면 만들 때 `--eslint`). 설치된 버전은 React 19.3, Vite 8.4였다.

### 실습 2. Express 실행
별도 터미널에서 `notice-service` 폴더로 이동해 실행한다. `server.cjs`는 [03](03_Express공지API.md) 실습 3(종합)의 최종 코드 그대로다.

```bash
node server.cjs
```

다음 주소가 정상적으로 응답하는지 확인한다.

```text
http://localhost:3000/api/notices
```

> 💡 보충: 응답은 초기 공지 두 건이다.
>
> ```json
> [
>   {
>     "id": 1,
>     "title": "프로젝트 발표 안내",
>     "content": "금요일까지 발표 자료를 준비해 주세요.",
>     "authorId": 3
>   },
>   {
>     "id": 2,
>     "title": "실습 자료 안내",
>     "content": "수업 자료를 확인하고 프로젝트를 실행해 주세요.",
>     "authorId": 1
>   }
> ]
> ```

### 실습 3. `vite.config.js` — 프록시 설정
`notice-web`의 `vite.config.js`를 수정한다.

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    strictPort: true,

    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

React를 실행한다. 설정을 바꾸기 전부터 실행하고 있었다면 개발 서버를 종료한 뒤 다시 실행한다.

```bash
npm run dev
```

> 💡 보충: `strictPort: true`는 5173을 다른 프로그램이 이미 쓰고 있으면 다른 포트로 넘어가지 않고 실행을 멈춘다 (다른 React 프로젝트가 5173에서 돌고 있으면 먼저 끈다). Vite 8.4로 확인하니 실행 중에 `vite.config.js`를 저장하면 터미널에 `vite.config.js changed, restarting server...` → `server restarted.`가 뜨며 스스로 다시 시작했다. 이 메시지가 없으면 강의대로 직접 끄고 다시 실행한다.

### 실습 4. `src/api.js` — 공통 요청 함수

```javascript
export async function requestJson(url, options = {}) {
  const response = await fetch(url, options);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ?? `요청에 실패했습니다. (${response.status})`
    );
  }

  if (data === null) {
    throw new Error("서버의 JSON 응답을 확인해 주세요.");
  }

  return data;
}
```

### 실습 5. `src/components/NoticeList.jsx`

```jsx
import { useEffect, useState } from "react";
import { requestJson } from "../api";

function NoticeList({ refreshKey, selectedId, onSelect }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadNotices() {
      setLoading(true);
      setError("");

      try {
        const data = await requestJson("/api/notices");

        if (!ignore) {
          setNotices(data);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadNotices();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  return (
    <section className="panel">
      <h2>공지 목록</h2>

      {loading && (
        <p role="status">
          목록을 불러오는 중입니다.
        </p>
      )}

      {!loading && error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && notices.length === 0 && (
        <p>등록된 공지가 없습니다.</p>
      )}

      {!loading && !error && notices.length > 0 && (
        <ul className="notice-list">
          {notices.map((notice) => (
            <li key={notice.id}>
              <button
                type="button"
                className={
                  notice.id === selectedId
                    ? "notice-button selected"
                    : "notice-button"
                }
                aria-pressed={notice.id === selectedId}
                onClick={() => onSelect(notice.id)}
              >
                <span className="notice-number">
                  #{notice.id}
                </span>

                <span>{notice.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default NoticeList;
```

### 실습 6. `src/components/NoticeDetail.jsx`

```jsx
import { useEffect, useState } from "react";
import { requestJson } from "../api";

function NoticeDetail({ noticeId }) {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadNotice() {
      setLoading(true);
      setError("");

      try {
        const data = await requestJson(
          `/api/notices/${noticeId}`
        );

        if (!ignore) {
          setNotice(data);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadNotice();

    return () => {
      ignore = true;
    };
  }, [noticeId]);

  return (
    <section className="panel">
      <h2>공지 상세</h2>

      {loading && (
        <p role="status">
          공지를 불러오는 중입니다.
        </p>
      )}

      {!loading && error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && notice && (
        <article>
          <p className="muted">
            공지 번호: {notice.id}
          </p>

          <h3>{notice.title}</h3>

          <p className="muted">
            작성자 번호: {notice.authorId}
          </p>

          <p className="notice-content">
            {notice.content}
          </p>
        </article>
      )}
    </section>
  );
}

export default NoticeDetail;
```

### 실습 7. `src/components/NoticeForm.jsx`

```jsx
import { useState } from "react";
import { requestJson } from "../api";

function NoticeForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const authorNumber = Number(authorId);

    if (trimmedTitle === "" || trimmedContent === "") {
      setError("제목과 내용을 입력해 주세요.");
      return;
    }

    if (
      !Number.isSafeInteger(authorNumber) ||
      authorNumber <= 0
    ) {
      setError("작성자 번호는 양의 정수로 입력해 주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const createdNotice = await requestJson(
        "/api/notices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            content: trimmedContent,
            authorId: authorNumber,
          }),
        }
      );

      setTitle("");
      setContent("");
      setAuthorId("");
      setMessage("공지가 등록되었습니다.");

      onCreated(createdNotice);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <h2>공지 등록</h2>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <legend className="sr-only">
            새 공지 작성
          </legend>

          <label htmlFor="title">제목</label>
          <input
            id="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            required
          />

          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            rows={5}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
            }}
            required
          />

          <label htmlFor="authorId">작성자 번호</label>
          <input
            id="authorId"
            type="number"
            min="1"
            step="1"
            value={authorId}
            onChange={(event) => {
              setAuthorId(event.target.value);
            }}
            required
          />

          <p className="muted">
            실습 학생 번호: 1, 2, 3, 4
          </p>

          <button
            className="primary-button"
            type="submit"
          >
            {submitting ? "등록 중..." : "공지 등록"}
          </button>
        </fieldset>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

export default NoticeForm;
```

> 💡 보충: `<legend className="sr-only">`는 화면에는 보이지 않고 화면 낭독기에만 "새 공지 작성"을 알린다 (`.sr-only`는 실습 9의 CSS). "실습 학생 번호: 1, 2, 3, 4"는 [02](02_Spring학생API.md)의 학생 네 명 번호지만, 지금은 Spring에 확인하지 않으므로 999를 넣어도 등록된다.

### 실습 8 (종합). `src/App.jsx`

```jsx
import { useState } from "react";

import NoticeList from "./components/NoticeList";
import NoticeDetail from "./components/NoticeDetail";
import NoticeForm from "./components/NoticeForm";

import "./App.css";

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreated(notice) {
    setRefreshKey((previous) => previous + 1);
    setSelectedId(notice.id);
  }

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">
          React + Express
        </p>

        <h1>한코딩 공지 서비스</h1>

        <p>
          공지를 확인하고 새로운 소식을 등록해 보세요.
        </p>
      </header>

      <div className="toolbar">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setRefreshKey((previous) => previous + 1);
          }}
        >
          목록 다시 불러오기
        </button>
      </div>

      <div className="notice-layout">
        <NoticeList
          refreshKey={refreshKey}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {selectedId === null ? (
          <section className="panel">
            <h2>공지 상세</h2>
            <p>목록에서 공지를 선택해 주세요.</p>
          </section>
        ) : (
          <NoticeDetail
            key={`${selectedId}-${refreshKey}`}
            noticeId={selectedId}
          />
        )}
      </div>

      <NoticeForm onCreated={handleCreated} />
    </main>
  );
}

export default App;
```

### 실습 9. 스타일 적용
`src/App.css`를 다음 내용으로 교체한다.

<details><summary><code>src/App.css</code> 전체 (174줄)</summary>

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f4f6f9;
  color: #202838;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.container {
  width: min(1040px, calc(100% - 32px));
  margin: 40px auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 4px 0;
}

.eyebrow {
  color: #4165a0;
  font-weight: 700;
}

.toolbar {
  margin-bottom: 16px;
}

.notice-layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 20px;
  margin-bottom: 20px;
}

.panel {
  min-width: 0;
  padding: 24px;
  border: 1px solid #dce2eb;
  border-radius: 12px;
  background: #ffffff;
  overflow-wrap: anywhere;
}

.panel h2 {
  margin-top: 0;
}

.notice-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-list li + li {
  margin-top: 10px;
}

.notice-button {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border: 1px solid #dce2eb;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  text-align: left;
}

.notice-button.selected {
  border-color: #4165a0;
  background: #edf3ff;
}

.notice-number,
.muted {
  color: #627089;
}

.notice-content {
  white-space: pre-wrap;
}

fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

label {
  display: block;
  margin: 16px 0 6px;
  font-weight: 700;
}

input,
textarea {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #b9c4d5;
  border-radius: 6px;
}

textarea {
  resize: vertical;
}

.primary-button,
.secondary-button {
  padding: 10px 16px;
  border: 0;
  border-radius: 6px;
}

.primary-button {
  background: #365fa8;
  color: #ffffff;
}

.secondary-button {
  background: #e3eaf5;
  color: #274b86;
}

.error {
  color: #b02525;
}

.success {
  color: #237346;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 720px) {
  .notice-layout {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 20px;
  }
}
```
</details>

`src/main.jsx`에 다음 줄이 있다면 제거한다. Vite 기본 스타일이 이번 스타일과 섞이지 않도록 하기 위한 것이다. **React를 시작하는 나머지 코드는 그대로 유지한다.**

```javascript
import "./index.css";
```

> 💡 보충: create-vite 9.4 템플릿에는 이 줄이 작은따옴표로 `import './index.css'`라고 적혀 있다. 지운 뒤 `main.jsx`는 다음과 같다 (`StrictMode`가 켜져 있다 — 핵심 개념 9장).
>
> ```jsx
> import { StrictMode } from 'react'
> import { createRoot } from 'react-dom/client'
> import App from './App.jsx'
>
> createRoot(document.getElementById('root')).render(
>   <StrictMode>
>     <App />
>   </StrictMode>,
> )
> ```

> 💡 보충: 위 실습 3~9의 코드를 그대로 넣고 확인하니 `npm run lint`(Oxlint)·ESLint(react-hooks 규칙)·`npx vite build` 모두 오류·경고 없이 통과했다 (2026-11-27).

### 실습 10. 전체 동작 확인
React 화면 `http://localhost:5173`을 연다.

**① 목록과 상세 확인**
1. 초기 공지 두 건이 표시되는지 확인한다.
2. 공지를 선택한다.
3. 제목·내용·작성자 번호가 표시되는지 확인한다.

**② 공지 등록** — 다음 값을 입력한다.

| 항목 | 입력 예 |
|---|---|
| 제목 | 팀 회의 안내 |
| 내용 | 오후에 프로젝트 진행 상황을 공유합니다. |
| 작성자 번호 | 2 |

등록 후 확인한다.
- 성공 안내가 표시되는가?
- 입력창이 초기화되는가?
- 새 공지가 목록에 추가되는가?
- 새 공지의 상세 내용이 표시되는가?

**③ 잘못된 입력 확인**
- 제목 또는 내용 비우기
- 제목에 공백만 넣기
- 작성자 번호에 0이나 음수 넣기

브라우저 입력 검사 또는 화면의 오류 안내로 등록이 중단되는지 확인한다. **현재는 999처럼 양의 정수인 작성자 번호도 등록된다.** 학생 존재 여부는 아직 확인하지 않기 때문이다.

> 💡 보충: jsdom으로 확인한 결과 — 1번 선택 시 상세에 `공지 번호: 1` · `프로젝트 발표 안내` · `작성자 번호: 3` · 내용이 보이고, 1번 버튼만 `aria-pressed="true"`였다. 위 값으로 등록하면 "공지가 등록되었습니다."가 뜨고 입력창 세 개가 모두 비며, 목록이 3건이 되고 상세가 `공지 번호: 3`(작성자 번호 2)으로 바뀌었다. 작성자 번호 999도 201로 등록됐다.

### 실습 11. Network 확인
핵심 개념 9장의 표대로 Fetch/XHR 요청과 상태 코드, POST Payload의 `authorId`(숫자 `2`)를 확인한다. 요청이 두 번 보이는 곳은 9장 보충의 표와 비교한다.

### 실습 12. 서버 중단·복구·빈 목록 확인
핵심 개념 10장의 순서대로 한다.

1. Express 터미널에서 `Ctrl + C` → **목록 다시 불러오기** → 오류 안내 → 공지 등록도 실패하는지 확인
2. `node server.cjs`로 다시 실행 → **목록 다시 불러오기** → 초기 공지 선택
3. (빈 목록) 공지 배열을 잠시 `const notices = [];`로 바꾸고 재시작 → **목록 다시 불러오기** → 빈 목록 안내 확인
4. 초기 공지 데이터를 복구하고 Express를 다시 실행

```javascript
const notices = [];
```

## 헷갈리기 쉬운 점
- **`fetch`는 상대 주소 `/api/notices`로 쓴다.** 전체 주소 `http://localhost:3000/…`를 쓰면 프록시를 거치지 않아 CORS 오류가 난다 (03의 Express에는 CORS 설정이 없다).
- **프록시에 `rewrite`를 쓰지 않는다.** Express 경로도 `/api/notices`다.
- **Network의 요청 주소가 5173인 것은 정상**이다. Vite가 3000으로 전달한다. Vite 프록시는 **개발 서버용**이다.
- **Express를 먼저 띄우고 API 응답을 확인한 뒤** 화면을 연결한다. Express가 꺼져 있으면 Vite가 502를 돌려준다.
- **`fetch`는 400·404·500만으로 오류를 던지지 않는다.** `requestJson`이 `response.ok`를 검사해 `throw`한다. 오류 문구는 서버의 `message`가 있으면 그것, 없으면 `요청에 실패했습니다. (상태 코드)`.
- **`response.ok`여도 JSON이 아닐 수 있다.** 프록시 없이 요청하면 Vite가 `index.html`을 200으로 준다 → "서버의 JSON 응답을 확인해 주세요."
- **`requestJson`은 204(본문 없음) 응답용이 아니다.** 성공 시 JSON을 돌려주는 요청에만 쓴다.
- **숫자 입력창의 값도 문자열이다.** `Number(authorId)`로 바꿔 보내야 Express가 400을 주지 않는다.
- **브라우저 검사(`required`, `min`)와 JavaScript 검사, 서버 검사는 각각 따로다.** 브라우저 검사는 우회할 수 있으니 Express 검사를 유지한다. 공백만 있는 제목은 `required`를 통과해서 `trim()` 검사가 잡는다.
- **`fieldset disabled`는 화면의 중복 제출만 줄인다.** 서버의 중복 방지가 아니다.
- **형식 검사 ≠ 존재 확인.** 작성자 번호 999도 지금은 등록된다 (Spring 연결은 05회차).
- **`refreshKey`는 값이 아니라 "바뀌었다"는 신호**다. 목록 Effect의 의존성에 넣어 다시 조회하게 한다.
- **상세의 `key`가 바뀌면 컴포넌트가 새로 만들어진다.** 이전 데이터·오류가 초기화되고 다시 조회한다. 그래서 목록 다시 불러오기 때 상세도 다시 조회된다.
- **`ignore`는 요청을 취소하지 않는다.** 끝난 결과를 화면에 반영할지만 정한다.
- **개발 중 GET이 두 번 보이는 것은 Strict Mode** 때문이다. 상세는 새로 마운트될 때마다 두 번이다. 등록 POST는 제출 이벤트에서만 보내므로 한 번이다.
- **Express는 메모리 저장이라 재시작하면 등록한 공지가 사라진다.** 사라진 공지를 선택 중이었다면 상세가 404 ("공지를 찾을 수 없습니다.").
- **이번 단계는 Spring에 의존하지 않는다.** Spring을 꺼도 공지 조회·등록은 그대로 된다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| Vite React 프로젝트 만들기 | `npm create vite` | `npm create vite@latest notice-web -- --template react` |
| `/api`를 Express로 전달 | `server.proxy` | `proxy: { "/api": { target: "http://localhost:3000", changeOrigin: true } }` |
| 포트 고정 | `strictPort` | `port: 5173, strictPort: true` |
| 공통 JSON 요청 | `requestJson` | `const data = await requestJson("/api/notices");` |
| 서버 오류 문구 쓰기 | `?.` + `??` | `` data?.message ?? `요청에 실패했습니다. (${response.status})` `` |
| 목록 다시 조회 신호 | 숫자 state + 의존성 | `setRefreshKey((previous) => previous + 1)` / `useEffect(…, [refreshKey])` |
| 클릭한 번호를 부모로 | 함수 props | `onClick={() => onSelect(notice.id)}` |
| 상세 조회 | 경로에 번호 | ``requestJson(`/api/notices/${noticeId}`)`` |
| 컴포넌트를 새로 시작 | `key` 바꾸기 | ``<NoticeDetail key={`${selectedId}-${refreshKey}`} noticeId={selectedId} />`` |
| 폼 기본 제출 막기 | `preventDefault()` | `event.preventDefault();` |
| 입력값을 숫자로 | `Number()` + 검사 | `Number.isSafeInteger(authorNumber) && authorNumber > 0` |
| JSON POST | `method`·`headers`·`body` | `{ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ … }) }` |
| 요청 중 폼 막기 | `fieldset disabled` | `<fieldset disabled={submitting}>` |
| 선택 상태 알리기 | `aria-pressed` | `aria-pressed={notice.id === selectedId}` |
| 화면에 안 보이는 제목 | `.sr-only` | `<legend className="sr-only">새 공지 작성</legend>` |
| 빈 목록 실험 | 배열 비우고 재시작 | `const notices = [];` |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목과 확인 항목에서 뽑았다.

<details><summary>Q. React에서 `fetch("/api/notices")`로 요청하면 어떻게 Express까지 가는가? Express에 CORS 설정이 필요 없는 이유는?</summary>

브라우저는 `localhost:5173/api/notices`(Vite)로 요청하고, `vite.config.js`의 프록시가 `localhost:3000/api/notices`(Express)로 전달한다. 브라우저 입장에서는 같은 출처(5173)에 요청한 것이라 CORS 허용 설정이 필요 없다. 이 프록시는 개발 서버용이다.
</details>

<details><summary>Q. 프록시 설정에서 경로를 지우는 `rewrite`를 쓰지 않는 이유는?</summary>

Express에도 `/api/notices` 경로가 그대로 있기 때문이다. `/api`를 지우면 Express에는 `/notices`로 가서 "요청한 API를 찾을 수 없습니다."(404)가 된다.
</details>

<details><summary>Q. (강의 질문) `requestJson`에서 `response.ok`를 확인하는 이유는?</summary>

`fetch`는 400·404·500 응답을 받았다는 이유만으로 예외를 던지지 않는다. 직접 `response.ok`를 확인해 실패면 `throw`해야 `catch`에서 오류 안내를 보여줄 수 있다.
</details>

<details><summary>Q. `requestJson`이 던지는 오류 문구는 어떻게 정해지는가?</summary>

`data?.message ?? …` 코드로 정한다. 서버가 `{ "message": "…" }`를 보냈으면 그 `message`를 쓴다. 응답이 JSON이 아니어서 `data`가 `null`이거나 `message`가 없으면 `요청에 실패했습니다. (상태 코드)`를 쓴다. `?.`는 `data`가 `null`이어도 오류 없이 `undefined`를 돌려주고, `??`는 왼쪽이 `null`·`undefined`일 때 오른쪽을 쓴다.
</details>

<details><summary>Q. Express를 끈 채 목록 다시 불러오기를 누르면 화면에 무엇이 보이는가? 그 응답은 누가 보낸 것인가?</summary>

목록과 상세에 `요청에 실패했습니다. (502)`가 보인다. 502는 Express가 아니라 Vite가 보낸 응답이다. 브라우저는 Vite에 연결했고, Vite가 Express에 전달하지 못해 대신 502를 돌려준다 (본문이 없어서 기본 문구가 쓰인다). 등록 요청도 같은 문구로 실패한다.
</details>

<details><summary>Q. `NoticeList`의 `refreshKey`는 무엇에 쓰는가? 언제 바뀌는가?</summary>

목록을 다시 조회하라는 신호다. Effect의 의존성 `[refreshKey]`에 넣어서 값이 바뀌면 목록을 다시 요청한다. 공지 등록에 성공했을 때(`handleCreated`)와 "목록 다시 불러오기"를 눌렀을 때 1씩 올라간다.
</details>

<details><summary>Q. (강의 질문) `ignore` 변수는 요청을 취소하는가?</summary>

아니다. Effect가 정리된 뒤 끝난 이전 요청의 결과를 화면에 반영하지 않게 할 뿐이다. 더 이상 유효하지 않은 결과를 무시하는 처리다.
</details>

<details><summary>Q. 상세 화면은 목록에서 받은 공지 객체를 그대로 쓰는가?</summary>

아니다. 선택한 번호(`noticeId`)로 상세 API `GET /api/notices/:id`를 따로 호출해서 받은 데이터를 표시한다.
</details>

<details><summary>Q. (강의 질문) 작성자 번호 입력값을 `Number()`로 변환하는 이유는?</summary>

숫자 입력창도 `event.target.value`는 문자열이다. Express는 `authorId`를 JSON 숫자로 받기로 했고 문자열 `"2"`는 400으로 거절한다. 그래서 `Number(authorId)`로 바꿔 `{"authorId": 2}`로 보낸다.
</details>

<details><summary>Q. `<fieldset disabled={submitting}>`이 하는 일과 하지 못하는 일은?</summary>

등록 요청이 끝날 때까지 폼의 입력과 버튼을 비활성화해 화면에서 중복 제출을 줄인다. 서버 차원의 중복 방지까지 해결하지는 않는다.
</details>

<details><summary>Q. 브라우저에서 입력값을 검사하는데 Express의 입력값 검사도 유지하는 이유는?</summary>

브라우저 검사는 사용자에게 빠르게 안내하기 위한 것이고 우회할 수 있다 (예: Console에서 `fetch`로 직접 POST). 그래서 서버에서도 요청을 검증해야 한다.
</details>

<details><summary>Q. 제목에 공백만 넣고 등록하면? 작성자 번호에 0을 넣으면?</summary>

공백만 있는 제목은 브라우저의 `required` 검사를 통과하고, `handleSubmit`의 `trim()` 검사에서 "제목과 내용을 입력해 주세요."가 보인다. 0은 `min="1"` 브라우저 검사에서 제출 자체가 멈춘다. 브라우저 검사를 우회하면 `handleSubmit`이 "작성자 번호는 양의 정수로 입력해 주세요."로 막는다.
</details>

<details><summary>Q. 공지를 등록하면 목록과 상세는 어떻게 갱신되는가?</summary>

POST 성공 → `onCreated(createdNotice)` → `App`의 `handleCreated`가 `refreshKey`를 올려 목록을 다시 조회하고, `selectedId`를 새 공지 번호로 바꿔 새 공지의 상세를 보여준다.
</details>

<details><summary>Q. (강의 질문) `NoticeDetail`의 `key`에 `refreshKey`도 사용하는 이유는?</summary>

공지를 선택하거나 목록을 갱신할 때 상세 컴포넌트를 새로 시작하기 위해서다. `key`가 바뀌면 컴포넌트가 새로 만들어져 이전 상세 데이터와 오류 상태가 초기화되고 다시 조회한다.
</details>

<details><summary>Q. (강의 질문) 개발 중 Network에 GET 요청이 두 번 보인다면? 등록 POST도 두 번 갈 수 있는가?</summary>

Strict Mode가 개발 환경에서 초기 Effect를 한 번 더 실행해서다. 상세는 `key`가 바뀌어 새로 마운트될 때마다 두 번 보인다. 등록 POST는 Effect가 아니라 제출 이벤트에서만 보내므로 한 번만 간다.
</details>

<details><summary>Q. 3번 공지를 등록해 선택한 채 Express를 재시작하고 목록 다시 불러오기를 누르면?</summary>

Express는 메모리에 저장하므로 목록은 초기 공지 두 건으로 돌아가고, 3번 상세는 404 — 화면에 "공지를 찾을 수 없습니다."가 보인다. 초기 공지를 다시 선택하면 된다.
</details>

<details><summary>Q. 빈 목록 안내("등록된 공지가 없습니다.")는 어떻게 확인하는가?</summary>

초기 공지가 두 건이라 그냥은 안 보인다. Express의 배열을 잠시 `const notices = [];`로 바꾸고 재시작한 뒤 목록 다시 불러오기를 누른다. 확인 후 초기 데이터를 복구하고 다시 실행한다.
</details>

<details><summary>Q. (강의 질문) Spring만 중단한다면 이번 공지 화면은 어떻게 되는가?</summary>

영향이 없다. 현재 Express는 아직 Spring을 호출하지 않으므로 공지 조회·등록은 그대로 동작한다. 각 요청이 어느 서비스에 의존하는지 구분한다.
</details>

<details><summary>Q. 작성자 번호 999로 등록하면?</summary>

등록된다 (201). 지금은 양의 정수인지 형식만 검사하고, 그 학생이 실제로 있는지는 확인하지 않는다. 존재 확인은 Express가 Spring을 호출하는 05회차에서 한다.
</details>

## 완료 체크
- [ ] React 5173에서 Express 3000으로 연결했다.
- [ ] 공지 목록을 표시했다.
- [ ] 공지를 선택하여 상세 API를 호출했다.
- [ ] 입력 데이터를 JSON으로 보내 공지를 등록했다.
- [ ] 작성자 번호를 숫자로 전달했다.
- [ ] 등록 후 목록과 새 공지 상세를 갱신했다.
- [ ] 로딩·빈 목록·오류를 구분했다.
- [ ] Network에서 GET·POST와 응답을 확인했다.
- [ ] Express 중단과 복구를 화면에서 확인했다.
- [ ] 이번 단계에서는 Spring에 의존하지 않는다는 점을 이해했다.

## 질문 노트

_아직 없음_
