# 03. Express로 공지 API 만들기 — 공지 목록·상세·등록과 상태 코드 구분

> 과정: MSA과정 · [노션 원문](https://app.notion.com/p/422848f71c9b800dae19c24be182cd5f) · 최종 갱신일: 2026-11-27

## 한눈에 보기
- [02](02_Spring학생API.md)의 Spring 학생 서비스와 **별도 폴더**에 Express 공지 서비스 `notice-service`(포트 **3000**)를 만든다. `npm install express@5`, 서버 파일은 `server.cjs` 하나. **아직 Spring을 호출하지 않으므로** 학생 서비스가 꺼져 있어도 조회·등록이 된다.
- API 세 개에 `/api` 접두어를 붙인다: `GET /api/notices`(목록, 200 배열) · `GET /api/notices/:id`(상세, 200 / 번호 형식 오류 **400** / 없는 공지 **404**) · `POST /api/notices`(등록, **201** + `Location` 헤더 / 입력 오류 **400**). 실패 본문은 모두 `{ "message": "…" }`.
- 등록은 `express.json()`으로 JSON 본문을 `req.body`로 받고, 제목·내용은 **공백이 아닌 문자열**, `authorId`는 **JSON 숫자인 양의 정수**인지 검사한다 (`"3"` 문자열은 거절). **형식만 검사**하고 999번 학생이 실제로 있는지는 서비스 연결 단계(05회차)에서 확인한다.
- 공지는 메모리 배열 `notices`에 있고 번호는 서버가 `nextId`로 붙인다. **서버를 재시작하면 초기 공지 2건으로 돌아간다** (DB 없음).
- 코드 맨 끝의 두 `app.use`: 위에서 처리하지 않은 경로 → **404 JSON**, 매개변수 4개짜리 **오류 처리 미들웨어** → 잘못된 JSON은 400, 그 밖의 오류는 로그 + 500.

> 💡 보충: 노션 원문 12장 끝에는 강사가 수업 중 Spring 학생 서비스에 **등록(POST) API를 덧붙인 Java 코드**와 Postman 화면이 섞여 있다. 이번 회차의 Express 내용과는 따로, 실습 정리 끝의 "참고: 수업 중 바꾼 Spring 학생 서비스"에 모아 두었다. 그 코드는 그대로 쓰면 등록한 학생 번호가 `null`이 되는 문제가 있다 (거기 보충 참고).

## 학습 목표
- Spring과 별도로 실행되는 Express 서비스를 만든다.
- 공지 목록·상세 조회 API를 구현한다.
- POST 요청으로 공지를 등록한다.
- 필수값과 작성자 번호의 형식을 **검사**한다.
- 정상 처리·잘못된 입력·없는 공지를 상태 코드로 구분한다 → 200(정상 처리) / 400 / 404 / 500(서버 오류).
- 메모리에 저장한 데이터의 특성을 이해한다.

> 💡 보충: 노션 학습 목표에는 `400(Not Found)`로 적혀 있는데, **400은 Bad Request**(잘못된 요청)이고 **Not Found는 404**다. 실제로 `curl -i`로 보면 응답 첫 줄이 `HTTP/1.1 400 Bad Request`, `HTTP/1.1 404 Not Found`로 나온다.

## 핵심 개념

### 1. 공지 서비스의 역할 — Express를 먼저 혼자 완성한다
[02](02_Spring학생API.md)에서는 학생 정보를 주는 Spring 서비스를 만들었다. 이번에는 **공지 정보를 관리하는 Express 서비스**를 만든다.

| 구성 | 포트 | 역할 |
|---|---|---|
| Spring 학생 서비스 | 8080 | 학생 정보 제공 |
| Express 공지 서비스 | 3000 | 공지 조회·등록 |
| React 화면 | 5173 | 이후 구현할 사용자 화면 ([04](04_React공지화면.md)) |

이번 단계의 흐름 — 아직 Spring을 부르지 않는다:

```text
브라우저
    ↓
Express 공지 서비스 :3000
    ↓
메모리에 있는 공지 조회·등록
```

- **작성자 번호의 형식은 검사하지만, 실제로 존재하는 학생인지는 서비스 연결 단계에서 확인한다.**

> 💡 보충: 과정 페이지의 서비스 표는 Spring을 **8081**로 적었지만 02·03회차 본문은 8080을 쓴다 ([_과정개요](_과정개요.md) 보충). 이번 회차는 Spring을 부르지 않으니 Express 3000만 맞으면 된다.

### 2. 공지 데이터 구조
공지 한 건에 저장하는 정보:

```json
{
  "id": 1,
  "title": "프로젝트 발표 안내",
  "content": "금요일까지 발표 자료를 준비해 주세요.",
  "authorId": 3 // 참조키 
}
```

| 필드 | 자료형 | 의미 |
|---|---|---|
| `id` | 숫자 | 공지 번호 |
| `title` | 문자열 | 제목 |
| `content` | 문자열 | 내용 |
| `authorId` | 숫자 | 작성자의 학생 번호 |

- **작성자 이름과 이메일은 저장하지 않는다.** 학생 서비스가 관리하는 정보이기 때문이다. 공지 서비스는 학생 번호(`authorId`)만 갖고 있다.

> 💡 보충: `// 참조키`는 설명용 표시다. 실제 JSON에는 주석을 쓸 수 없다 ([Node 03](../02_Node과정/03_서버-데이터보내기.md) 8장). `authorId`는 [DB 05](../06_데이터베이스과정/05_테이블관계-JOIN.md)의 외래키처럼 다른 곳(학생 서비스)의 번호를 가리키는 값이다. 다만 DB 외래키처럼 "없는 번호는 넣을 수 없다"는 검사가 저절로 되지 않는다 — 그래서 05회차에서 학생 서비스에 직접 물어본다.

### 3. 구현할 API — `/api` 접두어와 `:id`
이번부터 공지 API에는 `/api` 접두어를 붙여 통일한다.

| 요청 | 기능 |
|---|---|
| `GET /api/notices` | 전체 공지 조회 |
| `GET /api/notices/:id` | 공지 한 건 조회 |
| `POST /api/notices` | 공지 등록 |

Express의 `:id`는 Spring에서 쓴 `{id}`처럼 **경로의 값을 받는 자리**다.

```text
/api/notices/1
             ↓
공지 번호 1
```

| | Spring ([02](02_Spring학생API.md)) | Express (이번) |
|---|---|---|
| 경로 변수 자리 | `@GetMapping("/{id}")` | `app.get("/api/notices/:id", …)` |
| 값 꺼내기 | `@PathVariable Long id` (자동으로 숫자 변환) | `req.params.id` (**문자열**) → `Number()`로 직접 변환 |

### 4. 기본 서버 코드 읽기 — `server.cjs`

```javascript
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "공지 서비스가 실행 중입니다.",
  });
});

app.listen(port, () => {
  console.log(`공지 서비스: http://localhost:${port}`);
});
```

| 코드 | 역할 |
|---|---|
| `require("express")` | Express 불러오기 |
| `express()` | 애플리케이션 생성 |
| `app.use(express.json())` | JSON 요청 본문을 읽을 수 있도록 처리 |
| `app.get(...)` | GET 요청 처리 |
| `res.json(...)` | JSON 응답 |
| `app.listen(...)` | 지정한 포트에서 요청 대기 |

- `req`는 요청, `res`는 응답을 다루는 객체다.
- `.cjs`는 이 코드가 `require()`를 쓰는 **CommonJS 형식**임을 분명하게 표시하는 확장자다.

> 💡 보충: [Node 03](../02_Node과정/03_서버-데이터보내기.md)의 `server.js`와 거의 같다. 달라진 점은 ① `/`에서도 문자열(`res.send`) 대신 **JSON**(`res.json`)으로 응답, ② 요청 본문을 읽는 `app.use(express.json())`이 새로 생김, ③ 확장자 `.cjs`. `package.json`에 `"type": "module"`이 있으면 `.js` 파일에서는 `require is not defined` 오류가 나지만 `.cjs`는 그대로 실행된다 (2026-11-27 확인). `npm init -y`(npm 11.20)는 `"type": "commonjs"`를 미리 넣어 줘서 `.js`로도 돌지만, 강의처럼 `.cjs`로 두면 설정과 상관없다.

### 5. 목록·상세 조회 — `req.params`, `Number()`, `find()`, `return`
**목록 조회** — 공지 배열을 그대로 JSON으로 응답한다.

```javascript
app.get("/api/notices", (req, res) => {
  res.json(notices);
});
```

```text
GET /api/notices
        ↓
공지 배열 응답
```

**상세 조회의 번호 변환** — 경로에서 받은 값은 **문자열**이다. 공지의 `id`는 숫자이므로 비교 전에 변환한다.

```javascript
const id = Number(req.params.id);
```

```text
주소의 "1"
    ↓ Number()
숫자 1
```

**정수인지 확인** — `Number.isSafeInteger(id)`는 JavaScript에서 **안전하게 표현할 수 있는 정수**인지 확인한다. 여기에 `id <= 0`이면 거절해 0과 음수를 뺀다.

```javascript
if (!Number.isSafeInteger(id) || id <= 0) {
  return res.status(400).json({
    message: "공지 번호는 양의 정수여야 합니다.",
  });
}
```

**공지 찾기** — `find()`는 조건을 만족하는 **첫 번째 항목**을 반환한다. 없으면 `undefined`.

```javascript
const notice = notices.find((item) => item.id === id);
```

**`return`을 쓰는 이유** — 오류 응답을 보낸 뒤 **함수 실행을 끝낸다.** 그 아래의 정상 응답까지 보내는 일이 없게 한다.

```javascript
if (!notice) {
  return res.status(404).json({
    message: "공지를 찾을 수 없습니다.",
  });
}
```

| 주소 | 상태 | 이유 |
|---|---|---|
| `/api/notices/1` | 200 | 공지 1번 객체 |
| `/api/notices/999` | 404 | 형식은 맞지만 그 번호의 공지가 없음 |
| `/api/notices/abc` | 400 | `Number("abc")`는 `NaN` → 정수가 아님 |

> 💡 보충: `Number()`·`NaN`·`trim()`은 [Node 02](../02_Node과정/02_콘솔-학생관리.md) 5·8장에서 콘솔 입력을 검사할 때 썼다. 그때는 `Number.isInteger()`, 이번엔 더 엄격한 `Number.isSafeInteger()`다. `0`·`-1`·`1.5`는 400으로 거절된다. 반대로 `Number()`가 너그럽게 바꿔 주는 값은 통과한다 — `/api/notices/01`, `/api/notices/1e0`은 1번, `/api/notices/0x2`는 2번 공지가 200으로 나온다 (2026-11-27 확인).

### 6. 등록 요청 받기 — `express.json()`과 `req.body`
`app.use(express.json())`은 요청 본문의 JSON을 읽어 **`req.body`에서 쓸 수 있게** 한다.

```javascript
const { title, content, authorId } = req.body ?? {};
```

- 객체에서 필요한 값을 꺼내는 **구조 분해 할당**이다.
- `?? {}`는 요청 본문이 `null` 또는 `undefined`라면 빈 객체를 쓰게 한다.

> 💡 보충 (Express 5.3.0, 2026-11-27 확인):
> - 본문이 없거나 `Content-Type: application/json`이 아닌 요청이 오면 Express 5에서는 **`req.body`가 `undefined`** 다. 이때 `?? {}`가 없으면 `Cannot destructure property 'title' of 'req.body' as it is undefined` 오류 → **500**이 나간다. `?? {}`가 있으면 `title`이 `undefined`가 되어 **400 "제목을 입력해 주세요."** 로 끝난다. (Express 4.22로 같은 코드를 돌리면 `req.body`가 `{}`라서 `?? {}`가 없어도 400이었다.)
> - 본문이 JSON `null`이면 `express.json()`이 기본으로 객체·배열만 받아서, 경로 함수까지 오지 않고 **400 "요청 본문을 올바른 JSON 형식으로 작성해 주세요."** 가 나간다. 실제로 `?? {}`가 쓰이는 건 `undefined`일 때다.
> - **`app.use(express.json())` 줄을 빠뜨리면** 올바른 JSON을 보내도 `req.body`가 `undefined` → 모든 등록이 **400 "제목을 입력해 주세요."** 가 된다. 오류 메시지가 제목 문제처럼 보여서 헷갈리기 쉽다.

### 7. 입력값 검사 — 문자열·공백, JSON 숫자
**제목·내용 검사**

```javascript
typeof title !== "string" || title.trim() === ""
```

다음 입력을 거절한다.
- 제목 누락
- 문자열이 아닌 제목 (예: `123`)
- 빈 문자열
- 공백만 있는 제목

등록할 때는 `title.trim()`, `content.trim()`으로 **앞뒤 공백을 지운 값**을 저장한다.

**작성자 번호 검사** — 이번 API는 작성자 번호를 **JSON 숫자**로 받는다.

```javascript
if (!Number.isSafeInteger(authorId) || authorId <= 0) {
  return res.status(400).json({
    message: "작성자 번호는 숫자 형태의 양의 정수여야 합니다.",
  });
}
```

| 보낸 값 | 결과 |
|---|---|
| `"authorId": 3` | 통과 |
| `"authorId": "3"` | 400 — 문자열 `"3"`과 숫자 `3`은 다른 자료형 |
| `"authorId": 0` / `-1` / `1.5` | 400 |

- 상세 조회는 경로의 문자열을 `Number()`로 바꾸지만, 등록은 **바꾸지 않고 자료형 그대로 검사**한다.
- **React의 입력창에서 받은 값은 문자열일 수 있으므로, 프론트엔드에서 숫자로 변환해 보내야 한다** ([04](04_React공지화면.md)).

**형식과 존재 여부는 다르다**

```text
authorId: 999
```

999는 양의 정수라서 이번 형식 검사를 **통과한다.** 하지만 999번 학생이 실제로 있는지는 아직 확인하지 않는다.

| 검사 | 이번 단계 |
|---|---|
| 작성자 번호가 양의 정수인가? | 구현 |
| 해당 학생이 실제로 존재하는가? | 아직 미구현 (05회차) |

### 8. 공지 번호와 배열 — `let nextId`, `const notices`, 201 응답
**`nextId`는 왜 `let`인가?** — 등록할 때마다 값을 다시 대입하기 때문이다.

```javascript
let nextId = 3;
```

```javascript
nextId += 1;
```

**`notices`는 `const`인데 추가할 수 있나?** — `const`는 변수에 **다른 배열을 다시 대입하지 못하게** 할 뿐이다. 지금 배열 안에 항목을 추가하는 것은 된다.

```javascript
notices.push(notice);
```

**등록 응답**

```javascript
res
  .status(201)
  .location(`/api/notices/${notice.id}`)
  .json(notice);
```

| 요소 | 의미 |
|---|---|
| `201` | 새 자원이 생성됨 (Created) |
| `Location` 헤더 | 생성된 공지의 주소 |
| JSON 본문 | 생성된 공지 정보 |

- 등록할 때 **클라이언트가 공지 번호를 정하지 않고 서버가 부여**한다. 요청 본문에 `id`를 넣어도 쓰지 않는다 (`title`·`content`·`authorId`만 꺼냄).

> 💡 보충: `curl -i`로 등록하면 응답 헤더에 `Location: /api/notices/3`이 보인다 (실습 5). `res.status(201)`처럼 `res`의 함수들을 점으로 이어 쓸 수 있는 건, 각 함수가 `res`를 다시 돌려주기 때문이다 (`.json()`이 마지막에 응답을 보낸다).

### 9. 오류 처리 코드의 위치 — 404 처리와 오류 처리 미들웨어
완성 코드 맨 끝에 두 가지 처리가 있다.

**일치하는 경로가 없는 경우** — 위에서 처리하지 않은 요청에 응답한다. 그래서 **API 경로 정의 뒤에 둔다.**

```javascript
app.use((req, res) => {
  res.status(404).json({
    message: "요청한 API를 찾을 수 없습니다.",
  });
});
```

**오류 처리 미들웨어** — Express의 오류 처리 미들웨어는 **매개변수 네 개**를 쓴다.

```javascript
app.use((error, req, res, next) => {
  // 오류 응답 처리
});
```

이번에 구분한 것:
- JSON 문법 오류(`error.type === "entity.parse.failed"`) → `400`
- 그 밖의 예상하지 못한 오류 → `console.error`로 로그 기록 + `500`

잘못된 JSON을 보내면 **객체로 해석하는 단계(`express.json()`)에서 실패**해서 경로 함수까지 가지 않고 오류 처리 미들웨어로 온다. **일반 경로 처리와 오류 처리의 역할을 구분한다.** ([Express 오류 처리 안내](https://expressjs.com/en/guide/error-handling/))

> 💡 보충: [Node 03](../02_Node과정/03_서버-데이터보내기.md) 10장에서는 없는 경로에 Express 기본 응답 `Cannot GET /unknown`(HTML, 404)이 나왔다. 이번엔 마지막 `app.use`가 받아서 `/unknown`, `/api/notice`, `/api/notices/1/extra` 모두 **JSON 404** `{"message":"요청한 API를 찾을 수 없습니다."}`가 나온다. 반대로 기본 서버(4장 코드)에는 이 처리가 없어서 `/api/notices`에 `Cannot GET /api/notices`가 나온다.

> 💡 보충 (Express 5.3.0, 2026-11-27 확인):
> - `next`를 안 쓴다고 지워서 매개변수를 **세 개**로 만들면 Express가 오류 처리 미들웨어로 알아보지 못한다. 잘못된 JSON에 JSON 400 대신 **Express 기본 HTML 오류 페이지**(400, `SyntaxError`와 파일 경로가 담긴 스택)가 나간다 — 오류 처리 미들웨어를 아예 안 둔 것과 같다.
> - 경로 함수 안에서 오류가 나면 이 미들웨어가 받아 **500 JSON**을 보낸다. Express 5에서는 `async` 함수 안에서 난 오류도 여기로 온다 (500). Express 4.22에서는 같은 `async` 오류에 응답 없이 **서버 프로세스가 종료**됐다. 05회차처럼 Express에서 `async/await`로 다른 서비스를 부를 때 차이가 난다.

### 10. 메모리 데이터와 독립 실행
**메모리 데이터** — 공지는 코드 안의 배열에 저장된다. 등록한 공지는 **실행 중인 프로그램의 메모리**에만 추가된다.

```text
초기 공지 2건
      ↓
새 공지 등록
      ↓
서버 종료
      ↓
재실행
      ↓
코드에 작성된 초기 공지 2건
```

이번에는 DB를 쓰지 않으므로 정상적인 실습 결과다. 번호도 다시 3부터 붙는다.

**독립 실행** — 현재 Express는 Spring을 호출하지 않으므로 **학생 서비스가 없어도 조회·등록이 동작한다.** 이 결과는 최종 완성 상태가 아니다. 이후 서비스 연결 단계에서 작성자 조회와 등록 검증을 추가하면 **의존 관계가 생긴다.**

> 💡 보충: 재시작하면 처음으로 돌아가는 건 [Node 02](../02_Node과정/02_콘솔-학생관리.md) 9장(콘솔 프로그램 종료 후 데이터)과 [Node 03](../02_Node과정/03_서버-데이터보내기.md) 11장(보낸 것과 저장한 것)과 같은 이야기다. 등록한 공지를 남기려면 DB([DB 과정](../06_데이터베이스과정/_과정개요.md))가 필요하다.

### 11. 이번 공지 API 계약 정리

| 기능 | 요청 | 정상 응답 | 주요 실패 |
|---|---|---|---|
| 목록 | `GET /api/notices` | 200 + 배열 | 서버 오류 |
| 상세 | `GET /api/notices/:id` | 200 + 객체 | 400, 404 |
| 등록 | `POST /api/notices` | 201 + 생성 객체 | 400 |

등록 요청 본문:

```json
{
  "title": "공지 제목",
  "content": "공지 내용",
  "authorId": 3
}
```

오류 응답 형식:

```json
{
  "message": "사용자에게 전달할 안내"
}
```

- React에서는 `message`를 읽어 실패 이유를 표시할 수 있다.
- Spring의 학생 API와 이번 Express API가 **모든 오류 본문을 똑같이 반환하는 것은 아니다.** 호출하는 쪽에서는 **각 API의 상태 코드와 응답 본문 규칙**을 확인해야 한다.

> 💡 보충: 예를 들어 [02](02_Spring학생API.md)의 Spring 학생 API(Spring Boot 4.2.0, 2026-11-27 확인)는 없는 학생에 `ResponseEntity.notFound().build()`로 **본문 없는 404**(`Content-Length: 0`)를 보내고, `/api/students/abc`에는 Spring 기본 형식 `{"timestamp":…,"status":400,"error":"Bad Request","path":…}`을 보낸다. Express 공지 API는 404·400 모두 `{"message":…}`다.

### 정리

| 요소 | 역할 |
|---|---|
| Express | 공지 API 제공 |
| `express.json()` | JSON 요청 본문 해석 |
| `req.params.id` | URL 경로의 공지 번호 |
| `req.body` | 요청 본문 |
| `Number()` | 경로의 문자열을 숫자로 변환 |
| `find()` | 조건을 만족하는 항목 한 개 찾기 |
| `trim()` | 문자열 앞뒤 공백 제거 |
| `Number.isSafeInteger()` | 안전하게 표현할 수 있는 정수인지 검사 |
| `res.json()` | JSON 응답 |
| `200` | 정상 조회 |
| `201` | 공지 생성 |
| `400` | 잘못된 요청 |
| `404` | 공지 또는 요청한 API 없음 |

## 실습 정리

### 실행 구성
Spring 프로젝트와 **별도 폴더**에 만든다.

```text
실습 폴더
├─ student-service   ← 02회차 Spring (8080)
└─ notice-service    ← 이번 Express (3000)
```

```text
notice-service
├─ node_modules
├─ package.json
├─ package-lock.json
└─ server.cjs
```

- `node_modules`는 설치된 라이브러리가 들어 있는 폴더다. 직접 코드를 쓰는 곳이 아니다.

### 단계 흐름
1. Node.js·npm 버전 확인 → `notice-service` 폴더 → `npm init -y` → `npm install express@5`
2. `server.cjs`에 기본 서버(핵심 개념 4) → `node server.cjs` → `http://localhost:3000`
3. `Ctrl + C`로 끄고 `server.cjs` 전체를 최종 코드로 교체 → 다시 실행
4. 브라우저로 목록·상세·999·abc 확인 (상태 코드는 Network)
5. Console `fetch` 또는 Postman으로 POST 등록 → 목록 새로고침
6. 잘못된 입력 거절 확인 → 재시작해서 초기화 확인 → Spring을 끈 채로 동작 확인

### 실습 1. 프로젝트 준비
**① Node.js와 npm 확인**

```bash
node --version
```

```bash
npm --version
```

수업에서 쓰는 Node.js LTS 버전으로 진행한다. Express 5는 Node.js 18 이상을 요구하지만, **최소 버전이 곧 권장 설치 버전이라는 뜻은 아니다.** ([Express 설치 안내](https://expressjs.com/en/starter/installing/))

**② 프로젝트 폴더 생성** — 상위 실습 폴더에서 실행한다.

```bash
mkdir notice-service
```

```bash
cd notice-service
```

**③ `package.json` 생성** — `-y`는 기본값으로 프로젝트 설정 파일을 만드는 옵션이다.

```bash
npm init -y
```

**④ Express 설치**

```bash
npm install express@5
```

> 💡 보충 (2026-11-27 확인, Node 26.13 · npm 11.20): `express@5`로 **5.3.0**이 설치됐다. `npm init -y`는 **폴더 이름**을 프로젝트 이름으로 쓰는데, 폴더 이름에 **한글**이 있거나 **`_`로 시작**하면 `npm error Invalid name`으로 실패한다 (`03_Express공지API`, `_msa연습장`, `공지서비스` 모두 실패, `notice-service`·`2026-11-27`은 성공). 강의처럼 영어 폴더 이름 `notice-service`를 쓰면 된다. 실패한 폴더에서 바로 `npm install express@5`를 하면 이름 없이 `dependencies`만 있는 `package.json`이 생기고 설치는 된다.

### 실습 2. 기본 서버 실행
`notice-service/server.cjs`에 핵심 개념 4의 코드를 쓰고 실행한다.

```bash
node server.cjs
```

브라우저에서 `http://localhost:3000`에 접속하면:

```json
{
  "message": "공지 서비스가 실행 중입니다."
}
```

> 💡 보충: 같은 포트를 이미 다른 서버(예: [Node 03](../02_Node과정/03_서버-데이터보내기.md)의 `student-server`도 3000)가 쓰고 있으면, Express 5에서는 강의 코드 그대로일 때 `EADDRINUSE` 오류가 **보이지 않는다.** `공지 서비스: http://localhost:3000`이 찍히고 프로그램이 바로 끝난다 (2026-11-27 Express 5.3.0 확인 — Node 03 보충과 같은 현상). 브라우저에는 먼저 켜 둔 다른 서버의 응답이 나온다. 오류를 보려면 다음처럼 쓴다.
> ```javascript
> app.listen(port, (error) => {
>   if (error) throw error;
>   console.log(`공지 서비스: http://localhost:${port}`);
> });
> ```
> 이렇게 바꾸면 `Error: listen EADDRINUSE: address already in use :::3000`이 나오고 종료된다.

### 실습 3 (종합). `server.cjs` 최종 코드
기본 서버를 확인했으면 `Ctrl + C`로 끄고 `server.cjs` 전체를 다음 코드로 바꾼다.

```javascript
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

const notices = [
  {
    id: 1,
    title: "프로젝트 발표 안내",
    content: "금요일까지 발표 자료를 준비해 주세요.",
    authorId: 3,
  },
  {
    id: 2,
    title: "실습 자료 안내",
    content: "수업 자료를 확인하고 프로젝트를 실행해 주세요.",
    authorId: 1,
  },
];

let nextId = 3;

// 서버 실행 확인
app.get("/", (req, res) => {
  res.json({
    message: "공지 서비스가 실행 중입니다.",
  });
});

// 공지 목록 조회
app.get("/api/notices", (req, res) => {
  res.json(notices);
});

// 공지 상세 조회
app.get("/api/notices/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "공지 번호는 양의 정수여야 합니다.",
    });
  }

  const notice = notices.find((item) => item.id === id);

  if (!notice) {
    return res.status(404).json({
      message: "공지를 찾을 수 없습니다.",
    });
  }

  res.json(notice);
});

// 공지 등록
app.post("/api/notices", (req, res) => {
  const { title, content, authorId } = req.body ?? {};

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      message: "제목을 입력해 주세요.",
    });
  }

  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({
      message: "내용을 입력해 주세요.",
    });
  }

  if (!Number.isSafeInteger(authorId) || authorId <= 0) {
    return res.status(400).json({
      message: "작성자 번호는 숫자 형태의 양의 정수여야 합니다.",
    });
  }

  const notice = {
    id: nextId,
    title: title.trim(),
    content: content.trim(),
    authorId,
  };

  nextId += 1;
  notices.push(notice);

  res
    .status(201)
    .location(`/api/notices/${notice.id}`)
    .json(notice);
});

// 일치하는 경로가 없는 경우
app.use((req, res) => {
  res.status(404).json({
    message: "요청한 API를 찾을 수 없습니다.",
  });
});

// JSON 형식 오류와 예상하지 못한 오류 처리
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "요청 본문을 올바른 JSON 형식으로 작성해 주세요.",
    });
  }

  console.error(error);

  res.status(500).json({
    message: "서버 처리 중 오류가 발생했습니다.",
  });
});

app.listen(port, () => {
  console.log(`공지 서비스: http://localhost:${port}`);
});
```

```bash
node server.cjs
```

- 이번 실행 방식은 **파일 저장만으로 서버가 자동 재시작되지 않는다.** 코드를 바꾼 뒤에는 서버를 끄고 다시 실행한다.

### 실습 4. 브라우저에서 조회 API 확인
주소창에 주소를 넣으면 GET 요청이 간다. 개발자 도구 **Network**에서 상태 코드도 함께 확인한다.

| 주소 | 예상 상태 | 화면 |
|---|---|---|
| `http://localhost:3000/api/notices` | 200 | 공지 두 건 배열 |
| `http://localhost:3000/api/notices/1` | 200 | 공지 객체 하나 |
| `http://localhost:3000/api/notices/999` | 404 | `{"message":"공지를 찾을 수 없습니다."}` |
| `http://localhost:3000/api/notices/abc` | 400 | `{"message":"공지 번호는 양의 정수여야 합니다."}` |

> 💡 보충: 터미널에서 `curl -i`를 쓰면 상태 코드와 헤더를 한 번에 볼 수 있다. 2026-11-27 실제 출력(날짜·ETag 줄 생략):
> ```bash
> curl -i http://localhost:3000/api/notices/abc
> ```
> ```text
> HTTP/1.1 400 Bad Request
> X-Powered-By: Express
> Content-Type: application/json; charset=utf-8
> Content-Length: 61
>
> {"message":"공지 번호는 양의 정수여야 합니다."}
> ```

### 실습 5. POST 요청으로 공지 등록
주소창은 GET만 보내므로, POST는 **브라우저 개발자 도구 Console**에서 `fetch`로 보낸다.

**① Express 페이지 열기** — `http://localhost:3000/api/notices`를 먼저 연다. **Spring의 8080 페이지가 아니라 Express의 3000 페이지에서 실행한다.** 그래야 `/api/notices` 상대 주소가 Express로 간다.

**② Console에 등록 요청 입력**

```javascript
async function createNotice() {
  const response = await fetch("/api/notices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "팀 회의 안내",
      content: "오후에 프로젝트 진행 상황을 공유합니다.",
      authorId: 2,
    }),
  });

  const data = await response.json();

  console.log("상태 코드:", response.status);
  console.log("응답:", data);
}

createNotice();
```

정상 등록되면 `201`과 생성된 공지가 보인다. 처음 등록했다면:

```json
{
  "id": 3,
  "title": "팀 회의 안내",
  "content": "오후에 프로젝트 진행 상황을 공유합니다.",
  "authorId": 2
}
```

**③ 등록 결과 확인** — 목록 페이지(`/api/notices`)를 새로고침해 새 공지가 들어 있는지 본다. 반복 실행하면 공지가 계속 추가되므로 번호와 개수는 실행 횟수에 따라 달라진다.

**Postman으로 보내기** (강의 화면) — [Postman](https://www.postman.com/downloads/)에서:
1. 메서드 `POST`, 주소 `http://localhost:3000/api/notices`
2. **Headers**에 `Content-Type` = `application/json`
3. **Body** → `raw` → `JSON`에 등록 요청 본문(`title`, `content`, `authorId`)을 쓴다
4. Send → 응답 영역에 **`201 Created`** 와 생성된 공지 JSON

GET 요청도 Postman에서 메서드만 `GET`으로 두고 주소를 넣어 보낼 수 있다 (강의 화면은 Spring `http://localhost:8080/api/students/1` → `200 OK`).

> 💡 보충: `fetch`의 `headers`와 Postman의 Headers에 `Content-Type: application/json`을 넣는 이유는, `express.json()`이 **이 헤더가 있는 요청만** JSON으로 읽기 때문이다. 빠뜨리면 `req.body`가 `undefined`라서 400 "제목을 입력해 주세요."가 나온다 (핵심 개념 6 보충). 터미널로는 이렇게 보낼 수 있다 (2026-11-27 실제 응답, 날짜·ETag 줄 생략):
> ```bash
> curl -i -X POST http://localhost:3000/api/notices -H "Content-Type: application/json" -d '{"title":"팀 회의 안내","content":"오후에 프로젝트 진행 상황을 공유합니다.","authorId":2}'
> ```
> ```text
> HTTP/1.1 201 Created
> X-Powered-By: Express
> Location: /api/notices/3
> Content-Type: application/json; charset=utf-8
>
> {"id":3,"title":"팀 회의 안내","content":"오후에 프로젝트 진행 상황을 공유합니다.","authorId":2}
> ```

### 실습 6. 잘못된 입력 거절하기
등록 함수와 별도로 실행한다.

```javascript
async function testInvalidNotice() {
  const response = await fetch("/api/notices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "   ",
      content: "제목 없이 등록하는 실습입니다.",
      authorId: 2,
    }),
  });

  const data = await response.json();

  console.log("상태 코드:", response.status);
  console.log("응답:", data);
}

testInvalidNotice();
```

예상 결과:

```text
상태 코드: 400
```

```json
{
  "message": "제목을 입력해 주세요."
}
```

**다른 입력도 확인하기** — 요청 데이터를 하나씩 바꿔 실행한다. **다른 조건은 정상 값으로 두어야** 확인하려는 항목의 오류가 보인다.

| 바꿀 값 | 예상 결과 |
|---|---|
| `content: ""` | 400, "내용을 입력해 주세요." |
| `authorId: "2"` | 400, "작성자 번호는 숫자 형태의 양의 정수여야 합니다." |
| `authorId: 0` | 400 |
| `authorId: -1` | 400 |
| `authorId: 1.5` | 400 |

- 검사에 실패한 공지가 **목록에 추가되지 않았는지**도 확인한다.
- `fetch`는 HTTP 400·404 응답을 받았다는 이유만으로 **자동으로 예외를 던지지 않는다.** 실제 화면에서는 `response.ok`나 상태 코드를 확인해 성공과 실패를 구분한다.

> 💡 보충: 위 표는 2026-11-27에 모두 그대로 나왔다. 그 밖에 `authorId`를 빼면 400(작성자 번호 안내), `title: 123`이면 400(제목 안내), 앞뒤 공백이 있는 `"  공백 제목  "`은 `"공백 제목"`으로 저장됐다. `testInvalidNotice`를 Node `fetch`로 돌려 보면 `response.ok`는 `false`였고 예외 없이 `상태 코드: 400`까지 찍혔다. `response.ok`로 실패를 거르는 방법은 [Node 04](../02_Node과정/04_React-서버연결.md) 7장.

### 실습 7. 메모리 데이터와 독립 실행 확인
**메모리 데이터** — 공지를 몇 건 등록한 뒤 서버를 끄고(`Ctrl + C`) 다시 실행해 목록을 연다 → 초기 공지 2건만 보인다 (2026-11-27 확인: 5건 → 재시작 후 2건, 다음 등록은 다시 `Location: /api/notices/3`).

**독립 실행**
1. Spring 학생 서비스를 종료한다.
2. Express 공지 목록을 조회한다.
3. Express에서 공지를 등록한다.
4. Spring을 다시 실행한다.

→ Spring이 없어도 Express의 조회·등록이 된다. 아직 Spring을 호출하지 않기 때문이다.

### 참고: 수업 중 바꾼 Spring 학생 서비스 (노션 12장 끝)
노션 원문 12장 끝에 [02](02_Spring학생API.md)의 `student-service`를 수업 중에 고친 코드가 붙어 있다. 바뀐 점은 ① 주소가 `/students` → **`/api/students`**, ② `List.of(...)`(수정 불가) → `new ArrayList<>(List.of(...))`(추가 가능), ③ **학생 등록 POST** 추가, ④ 패키지를 `controller`·`service`·`repository`·`dto`로 나눔. 강의 화면에서는 Postman으로 `POST http://localhost:8080/api/students/`(끝에 `/`)에 `Content-Type: application/json`과 `name`·`email` JSON 본문을 보내 `200 OK`와 "학생 등록이 완료되었습니다."를 받는다.

<details><summary>코드 3개 — <code>StudentApiController</code> · <code>StudentService</code> · <code>StudentRepository</code></summary>

```java
package com.hancoding.studentservice.controller;

import com.hancoding.studentservice.dto.Student;
import com.hancoding.studentservice.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/students")
public class StudentApiController {

    private final StudentService service;

    @GetMapping
    public List<Student> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> findById(@PathVariable(name = "id") Long id) {

        Student student = service.findById(id);

        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(student);
    }

    @PostMapping("/")
    public String insertStudent(@RequestBody Student student) {

        Student s = new Student((long) (service.getCount() + 1), student.getName(), student.getEmail());

        service.insertStudent(student);

        return "학생 등록이 완료되었습니다.";
    }



}
```

```java
package com.hancoding.studentservice.service;

import com.hancoding.studentservice.dto.Student;
import com.hancoding.studentservice.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository repository;

    public List<Student> findAll() {
        return repository.findAll();
    }

    public Student findById(Long id) {
        return repository.findById(id);
    }

    public void insertStudent(Student student) {
        repository.save(student);
    }

    public Integer getCount() {
        return repository.getCount();
    }
}
```

```java
package com.hancoding.studentservice.repository;

import com.hancoding.studentservice.dto.Student;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class StudentRepository {
    private List<Student> students = new ArrayList<>(List.of(
            new Student(1L, "한코딩", "han@example.com"),
            new Student(2L, "김자바", "java@example.com"),
            new Student(3L, "이리액트", "react@example.com"
            ),
            new Student(4L, "박스프링", "spring@example.com")
    ));

    public List<Student> findAll() {
        return students;
    }

    public Student findById(Long id) {
        for (Student student : students) {
            if (student.getId().equals(id)) {
                return student;
            }
        }
        return null;
    }

    public void save(Student student) {
        students.add(student);
    }

    public Integer getCount() {
        return students.size();
    }
}
```
</details>

> 💡 보충 (Spring Boot 4.2.0, Java 21, 02의 `Student` 클래스를 `dto` 패키지에 두고 2026-11-27 실행 확인):
> - **번호가 `null`로 저장된다.** 번호를 붙인 새 객체 `s`를 만들고는 `service.insertStudent(student)`로 **요청에서 받은 `student`**(번호 없음)를 저장한다. 등록 뒤 목록에 `{"id":null,"name":…}`이 생긴다. `service.insertStudent(s);`로 바꿔야 5번이 붙는다.
> - 그 뒤 `GET /api/students/999`처럼 **앞의 4명에 없는 번호**를 조회하면 `findById`가 `null` 번호에서 `getId().equals(…)`를 부르다 `NullPointerException` → **404가 아니라 500**이 된다.
> - `@PostMapping("/")`이라 등록 주소는 **끝에 `/`가 붙은 `/api/students/`** 뿐이다. `POST /api/students`(슬래시 없음)는 **405 Method Not Allowed**가 나온다. 강의 Postman 화면이 `/api/students/`인 이유다.
> - `@RequestMapping`이 `/api/students`로 바뀌어서 02의 주소 `/students`는 이제 404다.
> - 등록 응답은 `200` + 글자("학생 등록이 완료되었습니다.")다. 이번 Express 공지 등록의 `201` + `Location` + 생성된 JSON과 비교해 보면 "각 API의 응답 규칙이 다르다"(핵심 개념 11)의 예가 된다.

## 헷갈리기 쉬운 점
- **`400`은 Bad Request, `404`는 Not Found.** 번호 형식이 틀리면(`abc`, `0`, `1.5`) 400, 형식은 맞는데 그 공지가 없으면(`999`) 404.
- **`req.params.id`는 문자열이다.** `Number()`로 바꾸지 않고 `item.id === req.params.id`로 비교하면 `1 === "1"`이 `false`라 항상 못 찾는다.
- **등록의 `authorId`는 변환하지 않고 숫자인지 검사한다.** `"3"`(문자열)은 400. React 입력값은 숫자로 바꿔서 보낸다.
- **형식 검사 통과 ≠ 학생이 있음.** `authorId: 999`도 지금은 등록된다. 존재 확인은 05회차.
- **오류 응답 뒤에는 `return`.** 빠뜨리면 함수가 계속 실행되어 아래의 응답까지 보내려 한다. 2026-11-27 상세 조회의 400 `return`을 지우고 `/api/notices/abc`를 열어 보니, 브라우저에는 400이 갔지만 서버 터미널에 `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`가 찍혔다 (응답은 한 요청에 한 번만).
- **`const` 배열에도 `push()`는 된다.** `const`는 다른 배열을 다시 대입하는 것만 막는다. `nextId`는 다시 대입하므로 `let`.
- **번호는 서버가 붙인다.** 요청 본문에 `id`를 넣어도 쓰지 않는다.
- **404 처리 `app.use`는 경로 정의 뒤에** 둔다. 앞으로 옮기면 `/`, `/api/notices`, `/api/notices/1`까지 모두 404 "요청한 API를 찾을 수 없습니다."가 된다 (2026-11-27 확인).
- **오류 처리 미들웨어는 매개변수 4개.** `next`를 안 써도 지우지 않는다 (3개면 기본 HTML 오류 페이지가 나감).
- **`express.json()`을 빠뜨리거나 `Content-Type: application/json`을 안 보내면** `req.body`가 `undefined` → 올바른 내용이어도 400 "제목을 입력해 주세요."
- **주소창은 GET만 보낸다.** POST는 Console `fetch`나 Postman으로. Console에서 상대 주소를 쓰려면 **3000 페이지**를 연 상태여야 한다 (8080 페이지면 Spring으로 간다).
- **`fetch`는 400·404에 예외를 던지지 않는다.** `response.ok`·`response.status`로 구분한다.
- **파일을 저장해도 서버는 자동으로 재시작되지 않는다.** 그리고 재시작하면 등록한 공지는 사라진다 (메모리 배열).
- **Express 5에서 3000을 다른 서버가 쓰고 있으면 강의 코드는 오류 없이 바로 끝난다.** 실행 로그가 찍혔는데 접속이 이상하면 다른 서버가 켜져 있는지 본다.
- **`npm init -y`는 폴더 이름이 한글이거나 `_`로 시작하면 실패**한다. 폴더 이름은 `notice-service`처럼.
- **포트만 나눴다고 MSA가 되는 것은 아니다.** 지금은 Express가 Spring을 부르지 않아 서로 독립적이지만, 05회차에서 연결하면 의존 관계가 생긴다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 프로젝트 만들기 | `npm init -y` + 설치 | `mkdir notice-service` → `npm init -y` → `npm install express@5` |
| 서버 실행 | `node` | `node server.cjs` |
| JSON 본문 읽기 | `express.json()` | `app.use(express.json());` |
| 경로 값 받기 | `:id` + `req.params` | `app.get("/api/notices/:id", …)` → `Number(req.params.id)` |
| 양의 정수 검사 | `Number.isSafeInteger()` | `if (!Number.isSafeInteger(id) \|\| id <= 0)` |
| 배열에서 한 개 찾기 | `find()` | `notices.find((item) => item.id === id)` |
| 본문 값 꺼내기 | 구조 분해 + `??` | `const { title, content, authorId } = req.body ?? {};` |
| 빈 문자열·공백 거절 | `typeof` + `trim()` | `typeof title !== "string" \|\| title.trim() === ""` |
| 상태 코드와 JSON 응답 | `res.status().json()` | `return res.status(400).json({ message: "…" });` |
| 생성 응답 | `201` + `location()` | ``res.status(201).location(`/api/notices/${notice.id}`).json(notice);`` |
| 없는 경로 404 | 마지막 `app.use` | `app.use((req, res) => { res.status(404).json({ … }); });` |
| 잘못된 JSON·서버 오류 | 오류 처리 미들웨어 (4개) | `app.use((error, req, res, next) => { … });` / `error.type === "entity.parse.failed"` |
| 브라우저에서 POST | Console `fetch` | `fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ … }) })` |
| 터미널에서 POST | `curl` | `curl -i -X POST http://localhost:3000/api/notices -H "Content-Type: application/json" -d '{…}'` |
| 상태 코드·헤더 보기 | `curl -i` / Network | `curl -i http://localhost:3000/api/notices/999` |
| 포트 충돌을 오류로 보기 | `listen` 콜백의 `error` | `app.listen(port, (error) => { if (error) throw error; … });` |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목과 확인 표에서 뽑았다.

<details><summary>Q. 공지 서비스는 왜 작성자 이름과 이메일을 저장하지 않는가?</summary>

학생 서비스가 관리하는 정보이기 때문이다. 공지 서비스는 작성자의 학생 번호(`authorId`)만 갖고, 이름이 필요하면 나중에 학생 서비스에 물어본다 (05회차).
</details>

<details><summary>Q. Express의 <code>/api/notices/:id</code>에서 <code>:id</code>는 무엇이고, 왜 <code>Number()</code>로 바꾸는가?</summary>

Spring의 `{id}`처럼 경로의 값을 받는 자리다. `req.params.id`는 문자열(`"1"`)이고 공지의 `id`는 숫자(`1`)라서, `===`로 비교하기 전에 숫자로 바꾼다.
</details>

<details><summary>Q. <code>/api/notices/999</code>와 <code>/api/notices/abc</code>의 상태 코드는? 왜 다른가?</summary>

999 → **404** (형식은 맞지만 그 번호의 공지가 없음), abc → **400** (`Number("abc")`가 `NaN`이라 양의 정수가 아님 — 요청 자체가 잘못됨).
</details>

<details><summary>Q. (강의 질문) 오류 응답을 보낼 때 왜 <code>return</code>을 붙이는가?</summary>

오류 응답을 보낸 뒤 함수 실행을 끝내서, 아래의 정상 응답까지 보내는 일이 없게 하려고.
</details>

<details><summary>Q. <code>{"authorId": "3"}</code>으로 등록하면? React에서 주의할 점은?</summary>

400 "작성자 번호는 숫자 형태의 양의 정수여야 합니다." 문자열 `"3"`과 숫자 `3`은 다른 자료형이고, 등록은 변환 없이 숫자인지 검사한다. React 입력창의 값은 문자열일 수 있으므로 숫자로 바꿔서 보내야 한다.
</details>

<details><summary>Q. (강의 질문) <code>authorId: 999</code>는 등록되는가? 형식 검사와 존재 확인은 어떻게 다른가?</summary>

등록된다. 999는 양의 정수라서 이번 형식 검사를 통과한다. 999번 학생이 실제로 있는지는 아직 확인하지 않는다 — 서비스 연결 단계(05회차)에서 학생 서비스에 물어본다.
</details>

<details><summary>Q. (강의 질문) <code>nextId</code>는 왜 <code>let</code>인가? <code>notices</code>는 <code>const</code>인데 왜 <code>push()</code>가 되는가?</summary>

`nextId`는 등록할 때마다 `nextId += 1`로 다시 대입하므로 `let`. `const`는 변수에 다른 배열을 다시 대입하는 것만 막고, 지금 배열 안에 항목을 추가하는 것은 막지 않는다.
</details>

<details><summary>Q. 등록 성공 응답의 세 요소는?</summary>

상태 코드 `201`(새 자원 생성), `Location` 헤더(생성된 공지의 주소, 예: `/api/notices/3`), JSON 본문(생성된 공지). 번호는 클라이언트가 아니라 서버가 붙인다.
</details>

<details><summary>Q. POST 요청을 Console에서 보낼 때 왜 3000 페이지를 먼저 여는가?</summary>

주소창은 GET만 보내므로 POST는 Console의 `fetch`로 보내는데, `fetch("/api/notices")`의 상대 주소는 **지금 열린 페이지의 출처**로 간다. 3000 페이지에서 실행해야 Express로 가고, 8080 페이지면 Spring으로 간다.
</details>

<details><summary>Q. <code>testInvalidNotice()</code>는 400을 받는데 왜 오류(예외)로 멈추지 않는가?</summary>

`fetch`는 HTTP 400·404 응답을 받았다는 이유만으로 예외를 던지지 않는다. 응답은 정상적으로 받은 것이다. 성공·실패는 `response.ok`나 `response.status`로 구분한다.
</details>

<details><summary>Q. (강의 질문) 404 처리 <code>app.use((req, res) => …)</code>는 왜 API 경로 정의 뒤에 두는가?</summary>

위에서 처리하지 않은 요청에만 응답해야 하기 때문이다. 앞에 두면 모든 요청이 거기서 404로 끝난다.
</details>

<details><summary>Q. 오류 처리 미들웨어는 일반 미들웨어와 어떻게 구분되는가? 잘못된 JSON은 어떻게 처리되는가?</summary>

매개변수가 네 개(`error, req, res, next`)다. 잘못된 JSON은 `express.json()`이 객체로 바꾸는 단계에서 실패해 이 미들웨어로 오고, `error.type === "entity.parse.failed"`이면 400 "요청 본문을 올바른 JSON 형식으로 작성해 주세요."를 보낸다. 그 밖의 오류는 로그를 남기고 500.
</details>

<details><summary>Q. (강의 질문) 공지를 등록한 뒤 서버를 재시작하면? 왜 그런가?</summary>

초기 공지 2건으로 돌아간다. 공지가 DB가 아니라 실행 중인 프로그램의 메모리(배열)에 있기 때문이다. 이번 실습에서는 정상 결과다.
</details>

<details><summary>Q. (강의 질문) Spring 학생 서비스를 꺼도 Express 공지 조회·등록이 되는 이유는? 언제 달라지는가?</summary>

지금 Express는 Spring을 호출하지 않기 때문이다. 서비스 연결 단계에서 작성자 조회와 등록 검증을 추가하면 Express가 Spring에 의존하게 된다.
</details>

<details><summary>Q. Spring 학생 API와 Express 공지 API의 오류 응답을 같은 방식으로 읽어도 되는가?</summary>

안 된다. 모든 오류 본문이 같지 않다 (예: Spring의 없는 학생 404는 본문이 없고 400은 Spring 기본 형식(`timestamp`·`status`·`error`·`path`)인데, Express는 둘 다 `{"message": …}`다). 호출하는 쪽은 각 API의 상태 코드와 응답 본문 규칙을 확인해야 한다.
</details>

## 완료 체크
- [ ] Spring과 별도 폴더에 Express 프로젝트를 만들었다.
- [ ] 3000 포트에서 공지 서비스를 실행했다.
- [ ] 공지 목록과 상세 정보를 조회했다.
- [ ] 잘못된 번호와 없는 공지의 상태 코드를 구분했다.
- [ ] POST 요청으로 공지를 등록했다.
- [ ] 빈 제목·내용과 잘못된 작성자 번호를 거절했다.
- [ ] 작성자 번호 형식과 실제 학생 존재 여부의 차이를 이해했다.
- [ ] 재시작하면 등록한 데이터가 초기화되는 것을 확인했다.
- [ ] 현재 Express가 Spring 없이도 동작하는 이유를 이해했다.
- [ ] Spring 8080 · Express 3000의 실행 위치를 구분했다.

## 질문 노트

_아직 없음_
