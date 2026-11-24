# 04. React로 CSR 화면 만들고 장점 경험하기 — 같은 학생 데이터를 JSON으로 받아 브라우저에서 화면 구성

> 과정: SSR-CSR과정 · [노션 원문](https://app.notion.com/p/420848f71c9b80ce814ede25d5dbb7c5) · 최종 갱신일: 2026-11-24

## 한눈에 보기
- [02](02_JSP-SSR화면.md)의 JSP 화면(`/students`)은 그대로 두고, **같은 `StudentService`** 를 쓰는 `@RestController`인 `StudentApiController`를 추가해 `/api/students`에서 학생 목록을 **JSON**으로 응답한다. 검색 결과가 없으면 `[]` — **실패가 아니다.**
- Spring 프로젝트 옆 폴더에 Vite React 프로젝트(`rendering-react`, **5173**)를 만들고, **Vite 프록시**로 `/api` 요청을 Spring(**8080**)에 전달한다. React는 상대 주소 `fetch("/api/students")`를 쓰고, 같은 출처라 **Spring에 CORS 설정을 하지 않는다** (프록시는 개발 서버용).
- state 다섯 개. 입력 중인 `keyword`와 실제 검색 조건 `searchKeyword`를 나눠 **검색 버튼을 눌렀을 때만** 요청한다. `useEffect(…, [searchKeyword])`가 처음 표시될 때와 검색 조건이 바뀔 때 조회한다.
- 폼 `onSubmit`에서 `event.preventDefault()`로 기본 제출(문서 이동)을 막고 state만 바꾼다 → **새 Document 요청 없이 API(Fetch/XHR) 요청으로 목록만 갱신**된다.
- 로딩·오류·빈 결과·목록을 조건부 렌더링으로 구분한다. 초기 HTML에는 `<div id="root"></div>`만 있고 학생 목록이 없으며, 이번 예제는 **검색어를 URL에 저장하지 않는다.**

## 학습 목표
- 기존 학생 조회 로직을 JSON API로 제공한다.
- React에서 API를 호출해 학생 목록을 표시한다.
- 기본 폼 제출을 막고 검색 결과만 갱신한다.
- 로딩·오류·빈 결과를 구분해 표시한다.
- JSP SSR과 React CSR의 요청·응답 차이를 확인한다.

## 핵심 개념

### 1. 같은 데이터, 다른 응답
[02](02_JSP-SSR화면.md)의 JSP 페이지:

```text
브라우저 요청
      ↓
Spring에서 학생 조회
      ↓
JSP로 HTML 생성
      ↓
브라우저에 HTML 응답
```

이번 React 화면 — 같은 조회 로직으로 **JSON을 응답**하고, React가 데이터를 받아 화면을 구성한다:

```text
브라우저에서 React 실행
      ↓
학생 목록 API 요청
      ↓
Spring에서 학생 조회
      ↓
JSON 응답
      ↓
React가 학생 목록 표시
```

| 용도 | 주소 |
|---|---|
| JSP 화면 | `http://localhost:8080/students` |
| JSON API | `http://localhost:8080/api/students` |
| React 화면 | `http://localhost:5173` |

- 기존 JSP 페이지는 **유지**한다.
- **화면을 만드는 위치만 비교할 수 있도록 학생 데이터와 검색 규칙은 동일하게 유지한다.**

### 2. JSON API Controller — `@Controller` vs `@RestController`
기존 `Student.java`, `StudentService.java`, `StudentPageController.java`, `students.jsp`는 그대로 쓰고 **`StudentApiController.java`만 추가**한다 (전체 코드는 실습 1).

```java
@GetMapping("/api/students")
public List<Student> students(
        @RequestParam(name = "keyword", defaultValue = "")
        String keyword) {

    return studentService.findStudents(keyword);
}
```

| 구분 | JSP 페이지 Controller | JSON API Controller |
|---|---|---|
| 애너테이션 | `@Controller` | `@RestController` |
| 요청 주소 | `/students` | `/api/students` |
| 반환값 | 뷰 이름 `"students"` | `List<Student>` |
| 처리 결과 | JSP를 이용한 HTML | 객체를 변환한 JSON |

두 Controller가 같은 Service를 함께 쓴다:

```text
StudentPageController ─┐
                      ├─ StudentService
StudentApiController ─┘
```

- **React용이라고 검색 로직을 다시 작성하지 않는다.**

> 💡 보충: [Spring 06](../03_Spring과정/06_JSON-API-React연결.md)과 같은 구성이다 (그때는 Repository, 이번엔 Service를 생성자로 받는다). `List<Student>`를 반환하면 Spring이 getter(`getId()`, `getName()`, `getEmail()`, `getClassName()`)를 읽어 JSON 속성(`id`, `name`, `email`, `className`)을 만든다.

> 💡 보충: 코드의 패키지는 `com.hancoding.renderingdemo`다. 내 프로젝트 패키지에 맞춘다. 수업 중 MyBatis로 만든 버전(02의 `com.example.jsp`)은 `Student` 필드가 `classId`이고 검색 SQL(`searchByName`)이 `id`를 조회하지 않아서, JSON 속성이 강의 예시와 다를 수 있다. React 표는 `student.id`·`student.className`을 쓰므로 `/api/students` JSON부터 확인한다.

### 3. JSON 응답 확인 — 빈 배열은 실패가 아니다
Spring을 다시 실행하고 `http://localhost:8080/api/students`에 접속하면 학생 네 명이 JSON 배열로 보인다.

```json
[
  {
    "id": 1,
    "name": "한코딩",
    "email": "han@example.com",
    "className": "풀스택 A반"
  },
  {
    "id": 2,
    "name": "김자바",
    "email": "java@example.com",
    "className": "풀스택 A반"
  },
  {
    "id": 3,
    "name": "이리액트",
    "email": "react@example.com",
    "className": "풀스택 B반"
  },
  {
    "id": 4,
    "name": "박스프링",
    "email": "spring@example.com",
    "className": "풀스택 B반"
  }
]
```

| 주소 | 결과 |
|---|---|
| `http://localhost:8080/api/students` | 학생 네 명 |
| `http://localhost:8080/api/students?keyword=한` | 한코딩 학생만 |
| `http://localhost:8080/api/students?keyword=없는학생` | 빈 배열 `[]` |

- **검색 결과가 없는 것은 요청 실패가 아니다.** 정상적으로 검색했지만 조건에 맞는 학생이 없는 상태다.

### 4. Vite 프록시 — `/api` 요청을 Spring으로 전달
React 개발 서버는 5173, Spring은 8080 포트를 쓴다. React에서 `/api`로 요청하면 **Vite가 Spring으로 전달**하도록 `vite.config.js`에 `server.proxy`를 설정한다 (전체 코드는 실습 3).

```text
브라우저
GET http://localhost:5173/api/students
              ↓
Vite 개발 서버가 전달
              ↓
Spring
GET http://localhost:8080/api/students
              ↓
JSON 응답
              ↓
Vite를 거쳐 브라우저로 전달
```

React에서는 **상대 주소**를 쓴다:

```javascript
fetch("/api/students");
```

- 브라우저가 **같은 출처의 Vite 서버**로 요청하므로 Spring에 **별도의 CORS 허용 설정을 추가하지 않는다.**
- 설정을 바꾼 뒤에는 Vite 개발 서버를 **종료하고 다시 실행**한다.
- **Vite의 프록시는 개발 서버용 설정이다. 배포 환경의 API 연결은 별도로 구성해야 한다.** ([Vite 프록시 안내](https://vite.dev/config/server-options.html#server-proxy))
- Network에 요청 주소가 **5173으로 보이는 것이 정상**이다. Network에는 브라우저가 요청한 주소가 표시되고, Spring으로 전달하는 것은 Vite가 내부에서 한다.

> 💡 보충: [Spring 06](../03_Spring과정/06_JSON-API-React연결.md)에서는 React가 8080으로 **직접** 요청해서 출처가 달랐고, 그래서 `@CrossOrigin`이 필요했다.
>
> | 방식 | `fetch` 주소 | Spring CORS 설정 |
> |---|---|---|
> | Spring 06 | `http://localhost:8080/api/students` | `@CrossOrigin(origins = "http://localhost:5173")` 필요 |
> | 이번 (Vite 프록시) | `/api/students` | 필요 없음 |

### 5. React에서 관리할 상태 — 검색어를 두 개로 나누기

| 상태 | 역할 | 초기값 |
|---|---|---|
| `keyword` | 현재 입력창에 작성 중인 검색어 | `""` |
| `searchKeyword` | 실제 검색에 적용한 검색어 | `""` |
| `students` | 서버에서 받은 학생 목록 | `[]` |
| `loading` | 요청이 진행 중인지 | `true` |
| `error` | 요청 실패 안내 | `""` |

입력 중인 값과 실제 검색 조건은 다를 수 있다:

```text
입력창에 글자 입력
        ↓
keyword만 변경
        ↓
검색 버튼 클릭
        ↓
searchKeyword 변경
        ↓
API 요청
```

→ 글자를 입력할 때마다 요청하지 않고, **검색 버튼을 눌렀을 때 요청**한다.

> 💡 보충: `loading` 초기값이 `true`인 것은 화면이 나타나자마자 조회를 시작하기 때문이다. 버튼을 눌러야 요청하던 [비동기 04](../05_비동기과정/04_느린API-화면.md)는 `isLoading`이 `false`로 시작했고, "아직 안 불렀음"을 가르는 `hasLoaded`가 따로 필요했다.

### 6. `useEffect`로 데이터 가져오기

```javascript
useEffect(() => {
  // 학생 목록 요청
}, [searchKeyword]);
```

- 화면에 처음 나타났을 때 조회한다.
- `searchKeyword`가 바뀌면 다시 조회한다.
- 입력창의 `keyword`만 바뀌면 요청하지 않는다.
- `useEffect`는 **외부 시스템과 React 화면을 동기화**할 때 쓰는 Hook이다. 이번에는 서버 API와 연결한다. ([React useEffect 안내](https://react.dev/reference/react/useEffect))

**같은 검색어를 다시 제출하면?** 이미 적용된 검색어와 같으면 `searchKeyword`가 바뀌지 않으므로 **추가 요청이 없다.** 이번 예제는 **검색 조건이 바뀔 때 조회하는 구성**이다. 같은 조건을 강제로 새로 조회하는 기능은 따로 추가할 수 있다.

**`URLSearchParams`** — 검색어를 URL의 쿼리 문자열로 바꾼다. 한글·공백·특수문자가 있어도 URL에 맞게 인코딩한다.

```javascript
const params = new URLSearchParams({
  keyword: searchKeyword,
});
```

**`response.ok`** — `fetch`는 HTTP `404`, `500` 응답만으로 자동으로 오류를 던지지 않는다. 응답 상태를 검사하고, 실패면 오류 처리(`catch`)로 보낸다.

```javascript
if (!response.ok) {
  throw new Error("학생 목록을 가져오지 못했습니다.");
}
```

종합 코드에서는 문구 끝에 `(${response.status})`를 붙여 상태 코드도 보여준다.

**`ignore` 변수는 왜 있나?** 이전 요청이 늦게 끝났을 때, 이미 다른 검색으로 바뀐 화면에 **오래된 결과를 반영하지 않도록** 한다.

```javascript
let ignore = false;
```

```javascript
return () => {
  ignore = true;
};
```

- 검색 조건이 바뀌거나 컴포넌트가 제거되면 이전 Effect의 결과 반영을 멈춘다.
- **요청 자체를 취소하는 코드는 아니다. 완료된 결과를 현재 화면에 반영할지 제어한다.**
- 개발 중 **Strict Mode**가 켜져 있으면 초기 Effect가 한 번 더 실행되어 요청이 **두 번** 보일 수 있다. 일반적인 사용자 검색 동작과 구분한다.

> 💡 보충: `async/await`, `try/catch/finally`, `ignore` 정리 함수의 기본 흐름은 [Node 04](../02_Node과정/04_React-서버연결.md)와 같다. 그때는 의존성 배열이 `[]`라 처음 한 번만 조회했고, 이번엔 `[searchKeyword]`라 검색 조건이 바뀔 때마다 다시 조회한다.

### 7. 폼 기본 제출 막기 — `preventDefault()`
JSP에서는 기본 폼 제출로 **새 문서**를 요청했다 ([03](03_SSR요청흐름.md)). React에서는 기본 제출을 막는다.

```javascript
event.preventDefault();
```

그다음 검색 상태를 바꾼다. 상태가 바뀌면 Effect에서 API를 요청한다.

```javascript
setSearchKeyword(trimmedKeyword);
```

```text
검색 폼 제출
      ↓
기본 문서 이동 막기
      ↓
검색 조건 state 변경
      ↓
API 요청
      ↓
학생 목록 state 변경
      ↓
React가 화면 갱신
```

**전체 보기 버튼의 `type`** — 폼 안의 버튼이 의도치 않게 제출 버튼으로 동작하지 않도록 `type="button"`을 지정한다.

```jsx
<button type="button">
  전체 보기
</button>
```

- **React를 사용한다고 폼의 기본 동작이 자동으로 없어지는 것은 아니다.**

> 💡 보충: `preventDefault()`는 [React 08](../01_React과정/08_폼-배열state-할일앱.md) 4장(할 일 앱)에서 처음 썼다. 폼 안의 `<button>`은 `type`을 적지 않으면 제출 버튼으로 동작한다. JSP의 전체 보기는 `<a href>` 링크라서 새 문서를 요청했고, React는 버튼 + `handleShowAll()`로 state만 비운다.

### 8. 로딩·오류·빈 결과·목록 구분하기
종합 코드의 `<section aria-live="polite">` 안에서 조건부 렌더링(`&&`)으로 네 상태 중 하나만 보이게 한다.

| 조건 | 표시 |
|---|---|
| `loading` | "학생 목록을 불러오는 중입니다." (`.status-message`) |
| `!loading && error !== ""` | 오류 문구 (`.error-message`, `role="alert"`) |
| `!loading && error === "" && students.length === 0` | "검색 결과가 없습니다." (`.empty-message`) |
| `!loading && error === "" && students.length > 0` | 학생 표 |

- 요청 중에는 검색·전체 보기 버튼이 `disabled={loading}`으로 비활성화된다.
- `searchKeyword !== ""`이면 표 위에 "검색어: …"를 보여준다.
- **검색 결과가 없는 상태와 서버 요청이 실패한 상태를 구분해서 보여주는 것이 중요하다.**

> 💡 보충: [비동기 04](../05_비동기과정/04_느린API-화면.md)는 삼항 연산자를 이어 써서 위에서부터 검사했다. 이번 코드는 조건마다 `!loading && error === ""`를 반복해 서로 겹치지 않게 했다. `aria-live="polite"`는 영역 안의 내용이 바뀌면 화면 낭독기가 알려 주게 하는 속성이다.

### 9. Network에서 CSR 요청 확인하기 — 초기 HTML · JavaScript · API

| 확인할 것 | Network에서 | 결과 |
|---|---|---|
| 초기 HTML | 새로고침 → Type `document` → Response | 학생 목록 행이 **없다.** 앱을 표시할 위치와 JavaScript 연결 등만 있다 |
| JavaScript | 초기 HTML이 연결한 파일 | 브라우저에서 실행되어 API를 요청하고 화면을 구성한다 |
| 처음 목록 | **Fetch/XHR** 필터 | `/api/students?keyword=` → JSON 배열 |
| 검색 | 목록을 지우고 `한` 검색 | `/api/students?keyword=한` → 한코딩 JSON. **새 Document 요청 없음** |

```html
<div id="root"></div>
```

- 검색에서는 **새 Document 요청 없이 API 요청으로 목록이 갱신되는지** 확인한다.

> 💡 보충: 검색 요청 이름이 `keyword=%ED%95%9C`처럼 인코딩되어 보일 수 있다 (`URLSearchParams`가 인코딩한 것). Payload 탭에서는 `keyword: 한`으로 보인다. 응답 헤더의 `Content-Type`도 document는 `text/html`, API는 `application/json`으로 다르다 ([03](03_SSR요청흐름.md)).

### 10. JSP SSR과 React CSR 비교
두 화면을 각각 열어 같은 검색어로 검색한다.

```text
JSP:   http://localhost:8080/students
React: http://localhost:5173
```

| 비교 항목 | JSP SSR | 이번 React CSR |
|---|---|---|
| 검색 로직 | `StudentService` | 같은 `StudentService` |
| 목록 HTML 생성 | 서버의 JSP | 브라우저의 React |
| 검색 응답 | HTML 문서 | JSON 데이터 |
| 검색 시 문서 이동 | 발생 | 기본 제출을 막아 발생하지 않음 |
| 초기 HTML에 학생 목록 | 포함 | 미포함 |
| 검색어 유지 | 서버가 HTML에 다시 반영 | React state로 관리 |
| 검색 URL 공유 | 쿼리 파라미터 포함 | 이번 예제에서는 미구현 |
| JavaScript 없이 목록 표시 | 가능 | 이번 예제에서는 불가 |

- React 화면에서도 검색 과정에 **서버 요청은 발생**한다. **줄어든 것은 서버의 역할 전체가 아니라, 이번 검색에서 문서 HTML을 다시 생성하고 이동하는 과정이다.**
- JSP에도 JavaScript를 결합하면 부분 갱신을 구현할 수 있다. 이 비교 결과를 **모든 SSR·CSR 구현의 절대적인 특성으로 일반화하지 않는다** ([01](01_SSR-CSR배경.md)).

**검색어와 URL** — 이번 React 예제는 검색어를 URL에 반영하지 않았다. 검색 후 주소를 복사하거나 새로고침하면 **검색 조건이 유지되지 않는다.** CSR에서도 URL에 검색 조건을 저장할 수 있지만 **자동으로 구현되는 기능은 아니다.** 이번에는 화면 상태와 URL 상태가 다르다는 점만 구분한다.

### 정리

| 요소 | 역할 |
|---|---|
| `@RestController` | 학생 객체 목록을 JSON으로 응답 |
| 공통 Service | JSP와 React가 같은 조회·검색 규칙 사용 |
| Vite 프록시 | 개발 중 `/api` 요청을 Spring으로 전달 |
| `keyword` | 입력 중인 검색어 |
| `searchKeyword` | 실제 적용된 검색 조건 |
| `useEffect` | 검색 조건에 맞춰 서버 데이터 조회 |
| `preventDefault()` | 기본 폼 제출에 의한 문서 이동 방지 |
| `students` state | 서버에서 받은 목록 저장 |
| 조건부 렌더링 | 로딩·오류·빈 결과·목록 구분 |
| React CSR | 받은 데이터를 이용해 브라우저에서 화면 구성 |

## 실습 정리

### 실행 구성
Spring 프로젝트와 **별도 폴더**에 React 프로젝트를 만든다.

```text
실습 폴더
├─ rendering-demo
│  └─ Spring 프로젝트
└─ rendering-react
   └─ React 프로젝트
```

| 프로젝트 | 역할 | 실행 | 주소 |
|---|---|---|---|
| `rendering-demo` (02의 Spring 프로젝트) | JSP 화면 + JSON API | IntelliJ 실행 또는 `./gradlew bootRun` | `http://localhost:8080` |
| `rendering-react` (새로 만듦) | React CSR 화면 | `npm run dev` | `http://localhost:5173` |

- Spring과 React 개발 서버는 **각각 다른 터미널에서 실행한 채 유지**한다.
- 연결은 **Vite 프록시**(`/api` → `http://localhost:8080`)로 한다. Spring에 `@CrossOrigin`은 붙이지 않는다.

### 단계 흐름
1. Spring에 `StudentApiController` 추가 → 재실행 → 브라우저에서 목록·`keyword=한`·`keyword=없는학생` JSON 확인
2. React 프로젝트 생성 → `npm install` → `npm run dev`로 기본 화면 확인
3. `vite.config.js`에 프록시 설정 → Vite 재실행
4. `src/App.jsx` 교체, `src/App.css` 스타일 적용, `main.jsx`의 `index.css` import 제거
5. 기능 확인 → Network 확인 → 로딩·실패 상태 확인 → JSP와 비교
6. 네트워크 제한과 서버를 정상 상태로 복구

### 실습 1. Spring — `StudentApiController.java` 추가
기존 `Student.java`, `StudentService.java`, `StudentPageController.java`, `students.jsp`는 그대로 둔다.

```java
package com.hancoding.renderingdemo;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StudentApiController {

    private final StudentService studentService;

    public StudentApiController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/api/students")
    public List<Student> students(
            @RequestParam(name = "keyword", defaultValue = "")
            String keyword) {

        return studentService.findStudents(keyword);
    }
}
```

Spring을 다시 실행하고 핵심 개념 3장의 세 주소로 JSON을 확인한다.

> 💡 보충: JSP용 `StudentPageController`는 `keyword.trim()`을 한 뒤 Service에 넘기지만, 이 API Controller는 받은 값을 그대로 넘긴다. React 쪽에서 `trim()`한 값을 보내므로 이번 화면에서는 차이가 없다.

### 실습 2. React 프로젝트 만들기
**① Node.js와 npm 확인** (일반 터미널)

```bash
node --version
```

```bash
npm --version
```

Node.js는 사용하는 Vite 버전의 요구사항을 만족해야 한다. 버전 오류가 나면 공식 안내에 맞는 LTS 버전을 쓴다. ([Vite 시작 안내](https://vite.dev/guide/))

**② 프로젝트 생성** — Spring 프로젝트 **내부가 아니라**, 두 프로젝트를 둘 상위 폴더에서 실행한다. 추가 안내가 나오면 React와 JavaScript 기본 구성을 고른다.

```bash
npm create vite@latest rendering-react -- --template react
```

**③ 폴더 이동과 의존성 설치**

```bash
cd rendering-react
```

```bash
npm install
```

**④ 개발 서버 실행** — 터미널에 표시된 주소로 접속해 기본 화면을 확인한다.

```bash
npm run dev
```

### 실습 3. `vite.config.js` — 프록시 설정

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
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
```

설정 후 Vite 개발 서버를 종료하고 다시 실행한다.

```bash
npm run dev
```

> 💡 보충: `strictPort: true`는 5173을 이미 다른 프로그램이 쓰고 있으면 다른 포트로 넘어가지 않고 **실행을 멈춘다.** 다른 React 프로젝트(예: Node 과정의 `my-profile-react`)가 5173에서 돌고 있으면 먼저 끈다. `changeOrigin: true`는 전달하는 요청의 `Host` 헤더를 대상 서버(8080) 기준으로 바꾸는 옵션이다.

### 실습 4 (종합). `src/App.jsx`
기존 내용을 다음 코드로 바꾼다.

```jsx
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          keyword: searchKeyword,
        });

        const response = await fetch(
          `/api/students?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `학생 목록을 가져오지 못했습니다. (${response.status})`
          );
        }

        const data = await response.json();

        if (!ignore) {
          setStudents(data);
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

    loadStudents();

    return () => {
      ignore = true;
    };
  }, [searchKeyword]);

  function handleSearch(event) {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();

    setKeyword(trimmedKeyword);
    setSearchKeyword(trimmedKeyword);
  }

  function handleShowAll() {
    setKeyword("");
    setSearchKeyword("");
  }

  return (
    <main className="container">
      <header className="page-header">
        <p className="label">Spring Boot API + React</p>
        <h1>학생 목록</h1>
        <p>이름의 일부를 입력하여 학생을 검색하세요.</p>
      </header>

      <form
        className="search-form"
        onSubmit={handleSearch}
      >
        <label htmlFor="keyword">학생 이름</label>

        <div className="search-controls">
          <input
            id="keyword"
            type="text"
            name="keyword"
            placeholder="예: 한"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
            }}
          />

          <button type="submit" disabled={loading}>
            검색
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleShowAll}
            disabled={loading}
          >
            전체 보기
          </button>
        </div>
      </form>

      {searchKeyword !== "" && (
        <p className="search-summary">
          검색어: <strong>{searchKeyword}</strong>
        </p>
      )}

      <section aria-live="polite">
        {loading && (
          <p className="status-message">
            학생 목록을 불러오는 중입니다.
          </p>
        )}

        {!loading && error !== "" && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {!loading &&
          error === "" &&
          students.length === 0 && (
            <p className="empty-message">
              검색 결과가 없습니다.
            </p>
          )}

        {!loading &&
          error === "" &&
          students.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">번호</th>
                    <th scope="col">이름</th>
                    <th scope="col">이메일</th>
                    <th scope="col">소속 반</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.className}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </main>
  );
}

export default App;
```

> 💡 보충: `catch (error)`의 `error`는 catch 블록 안에서만 쓰는 오류 객체이고, state `error`와 이름만 같은 다른 값이다. `setError(error.message)`는 오류 객체의 메시지를 state에 저장한다.

### 실습 5. 스타일 적용
1. 이전 JSP 실습의 `students.css` 내용을 React 프로젝트의 `src/App.css`에 복사한다. 기존 `App.css`의 기본 예제 스타일은 교체한다.
2. `src/main.jsx`에 다음 줄이 있으면 지워서 기본 스타일이 섞이지 않게 한다.

```javascript
import "./index.css";
```

3. `App.css` 끝에 다음 스타일을 추가한다.

```css
.secondary-button {
  background: #e7edf6;
  color: #274b86;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.status-message,
.error-message {
  margin-top: 24px;
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
}

.error-message {
  border: 1px solid #d69a9a;
  color: #9a2525;
}
```

<details><summary>참고: <code>App.css</code> 앞부분 — 02의 <code>students.css</code> 전체</summary>

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f5f6f8;
  color: #20242c;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

.container {
  width: min(960px, calc(100% - 32px));
  margin: 48px auto;
}

.page-header {
  margin-bottom: 28px;
}

.label {
  color: #4569b2;
  font-size: 14px;
  font-weight: 700;
}

h1 {
  margin: 8px 0;
}

.search-form {
  padding: 24px;
  background: #ffffff;
  border: 1px solid #dfe3e9;
  border-radius: 12px;
}

.search-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.search-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #bcc5d2;
  border-radius: 6px;
  font: inherit;
}

button {
  padding: 10px 18px;
  border: 0;
  border-radius: 6px;
  background: #365fa8;
  color: #ffffff;
  font: inherit;
  cursor: pointer;
}

a {
  color: #365fa8;
}

.search-summary {
  margin: 20px 0;
}

.table-wrapper {
  margin-top: 24px;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 580px;
  border-collapse: collapse;
  background: #ffffff;
}

th,
td {
  padding: 14px 16px;
  border-bottom: 1px solid #e1e5eb;
  text-align: left;
}

th {
  background: #eaf0f8;
}

.empty-message {
  margin-top: 24px;
  padding: 32px;
  border: 1px solid #dfe3e9;
  border-radius: 12px;
  background: #ffffff;
  text-align: center;
}
```
</details>

> 💡 보충: JSP와 React가 같은 클래스 이름(`container`, `search-form`, `empty-message` …)을 쓰므로 CSS를 그대로 옮길 수 있다. `students.css`가 모든 `button`에 파란 배경을 주므로 `.secondary-button`으로 전체 보기 버튼만 연한 색으로 덮어쓴다. `.status-message`·`.error-message`는 JSP에 없던 로딩·오류 상태라서 새로 추가한 것이다.

### 실습 6. 기능 확인
두 서버(Spring `http://localhost:8080`, Vite `http://localhost:5173`)가 모두 실행 중인지 확인하고 `http://localhost:5173`에 접속한다.

| 동작 | 기대 결과 |
|---|---|
| 처음 접속 | 학생 네 명 표시 |
| `한` 검색 | 한코딩 표시 |
| `자바` 검색 | 김자바 표시 |
| `없는학생` 검색 | 검색 결과 없음 안내 |
| 검색어를 비우고 검색 | 전체 학생 표시 |
| 전체 보기 클릭 | 입력창 초기화와 전체 목록 |
| 검색 중 | 버튼 비활성화와 로딩 안내 |

### 실습 7. Network·로딩·실패 상태 확인
**Network** (핵심 개념 9장)
1. 새로고침 → Type `document` 요청의 Response에 학생 목록 행이 없고 `<div id="root"></div>`가 있는지 본다.
2. **Fetch/XHR** 필터 → `/api/students?keyword=` 요청의 Response에 JSON 배열이 있는지 본다.
3. Network 목록을 지우고 `한` 검색 → `/api/students?keyword=한`만 생기고 **새 Document 요청이 없는지** 본다.

**로딩 상태** — Network의 속도 제한 메뉴에서 느린 연결(예: **Slow 3G**)을 고르고 다른 검색어로 검색한다.
- 로딩 안내가 표시되는가?
- 검색 버튼이 비활성화되는가?
- 결과를 받으면 로딩이 끝나는가?

실습 후 네트워크 제한을 원래 상태로 돌린다.

**실패 상태**
1. Vite는 실행한 채 **Spring 서버만 종료**한다.
2. **이전과 다른 검색어**로 검색한다.
3. 오류 안내가 표시되는지 확인한다.
4. Spring을 다시 실행한다.
5. React 페이지를 새로고침한다.

Spring이 종료되면 Vite가 API를 전달하지 못해 오류 응답이나 연결 실패가 발생할 수 있다.

> 💡 보충: 브라우저가 연결된 곳은 Vite라서, Spring이 꺼지면 **Vite가 대신 오류 응답**을 보낸다 (Vite 터미널에 `http proxy error`). 2026-11-24 Vite 8.3.8로 확인하니 **502**였다 → 화면에 `학생 목록을 가져오지 못했습니다. (502)`. Vite 버전에 따라 500으로 보일 수도 있다. 서버에 직접 요청하던 [비동기 04](../05_비동기과정/04_느린API-화면.md)에서 서버를 끄면 `fetch()` 자체가 거부(연결 실패)되던 것과 다르다. 2단계에서 "다른 검색어"로 검색하는 것은, 같은 검색어면 `searchKeyword`가 바뀌지 않아 요청 자체가 없기 때문이다.

### 실습 8. JSP와 비교
`http://localhost:8080/students`와 `http://localhost:5173`을 각각 열어 같은 검색어로 검색하고, 핵심 개념 10장 표의 항목(검색 응답, 문서 이동, 초기 HTML, URL)을 직접 확인한다.

## 헷갈리기 쉬운 점
- **검색 결과 없음(`[]`) ≠ 요청 실패.** 빈 배열은 정상 응답이다. 화면도 "검색 결과가 없습니다."와 오류 안내를 따로 보여준다.
- **`/students`는 HTML(JSP), `/api/students`는 JSON.** 기존 JSP Controller는 그대로 두고 API Controller를 **추가**한다. 검색 로직은 같은 `StudentService`를 쓴다.
- **Vite 프록시를 쓰므로 Spring에 CORS 설정을 하지 않는다.** 브라우저는 같은 출처(5173)에 요청한다.
- **프록시를 썼는데 Network 주소가 5173인 것은 정상**이다. 브라우저가 요청한 주소가 표시된다.
- **Vite 프록시는 개발 서버용**이다. 배포 환경의 API 연결은 따로 구성한다. `vite.config.js`를 바꾸면 Vite를 다시 실행한다.
- **React 프로젝트는 Spring 프로젝트 안이 아니라 옆 폴더에** 만든다.
- **`keyword`(입력 중) ≠ `searchKeyword`(적용된 조건).** 입력만 해서는 요청하지 않는다. Effect 의존성은 `[searchKeyword]`.
- **같은 검색어를 다시 제출하면 요청하지 않는다.** 검색 조건이 바뀔 때 조회하는 구성이다.
- **`fetch`는 404·500만으로 오류를 던지지 않는다.** `response.ok`를 검사해 `throw`한다.
- **`ignore`는 요청을 취소하지 않는다.** 완료된 결과를 화면에 반영할지만 정한다.
- **Strict Mode에서는 개발 중 초기 요청이 두 번** 보일 수 있다.
- **React를 써도 폼의 기본 제출은 그대로 있다.** `preventDefault()`로 막고, 폼 안의 제출용이 아닌 버튼에는 `type="button"`.
- **이번 예제는 검색어를 URL에 저장하지 않는다.** 새로고침·주소 복사 시 검색 조건이 사라진다. CSR에서도 가능하지만 자동은 아니다.
- **CSR에서도 검색할 때 서버 요청은 생긴다.** 줄어든 것은 문서 HTML 재생성과 이동이다. JSP도 JavaScript를 붙이면 부분 갱신할 수 있으니 일반화하지 않는다.
- **이번 React 화면은 JavaScript 없이 목록이 나오지 않는다.** 초기 HTML에 학생 목록이 없다.

> 💡 보충:
> - `fetch`에 `http://localhost:8080/...` 전체 주소를 쓰면 프록시를 거치지 않고 다른 출처로 직접 요청하게 되어, `@CrossOrigin`이 없는 이번 Spring에서는 CORS 오류가 난다.
> - `strictPort: true`라서 5173을 다른 프로젝트가 쓰고 있으면 Vite가 실행되지 않는다.
> - 실패 실험 뒤 Spring을 다시 켜도 같은 검색어로는 다시 요청하지 않는다 → 강의 순서대로 새로고침한다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| JSON API 추가 | `@RestController` + 기존 Service | `return studentService.findStudents(keyword);` |
| 검색어 파라미터 (없으면 빈 문자열) | `@RequestParam` | `@RequestParam(name = "keyword", defaultValue = "") String keyword` |
| Vite React 프로젝트 만들기 | `npm create vite` | `npm create vite@latest rendering-react -- --template react` |
| `/api`를 Spring으로 전달 | `server.proxy` | `proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } }` |
| 프록시 거쳐 요청 | 상대 주소 `fetch` | `` fetch(`/api/students?${params.toString()}`) `` |
| 검색어를 쿼리 문자열로 | `URLSearchParams` | `new URLSearchParams({ keyword: searchKeyword })` |
| 검색 조건이 바뀔 때 조회 | `useEffect` 의존성 | `useEffect(() => { … }, [searchKeyword]);` |
| HTTP 실패 걸러내기 | `response.ok` + `throw` | `` throw new Error(`학생 목록을 가져오지 못했습니다. (${response.status})`) `` |
| 오래된 결과 무시 | `ignore` + 정리 함수 | `return () => { ignore = true; };` |
| 폼 기본 제출 막기 | `preventDefault()` | `event.preventDefault();` |
| 제출하지 않는 폼 안 버튼 | `type="button"` | `<button type="button" onClick={handleShowAll}>` |
| 요청 중 버튼 막기 | `disabled` | `disabled={loading}` |
| 상태별 표시 | `&&` 조건부 렌더링 | `{!loading && error !== "" && (<p role="alert">{error}</p>)}` |
| CSR 확인 | Network | `document` Response에 목록 없음, Fetch/XHR에 `/api/students?keyword=` |
| 로딩 화면 확인 | Network 속도 제한 | Slow 3G |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목과 확인 표에서 뽑았다.

<details><summary>Q. (강의 질문) 기존 JSP Controller와 JSON API Controller는 무엇이 다른가? 검색 로직은 새로 만드는가?</summary>

JSP용은 `@Controller`, `/students`, 뷰 이름 `"students"`를 반환해 JSP로 HTML을 만든다. API용은 `@RestController`, `/api/students`, `List<Student>`를 반환해 객체를 JSON으로 바꾼다. 검색 로직은 새로 만들지 않고 **같은 `StudentService`** 를 두 Controller가 함께 쓴다 — 화면을 만드는 위치만 비교하기 위해서다.
</details>

<details><summary>Q. (강의 질문) `/api/students?keyword=없는학생`의 응답은? 요청이 실패한 것인가?</summary>

빈 배열 `[]`. 실패가 아니다. 정상적으로 검색했지만 조건에 맞는 학생이 없는 상태다.
</details>

<details><summary>Q. React에서 `fetch("/api/students")`로 요청하면 어떻게 Spring까지 가는가? Spring에 CORS 설정이 필요 없는 이유는?</summary>

브라우저는 `http://localhost:5173/api/students`(Vite)로 요청하고, `vite.config.js`의 프록시가 `http://localhost:8080/api/students`(Spring)로 전달한다. 응답 JSON은 Vite를 거쳐 브라우저로 온다. 브라우저 입장에서는 같은 출처(5173)에 요청한 것이라 Spring에 CORS 허용 설정을 추가하지 않는다. 이 프록시는 개발 서버용이다.
</details>

<details><summary>Q. (강의 질문) 프록시를 썼는데 Network의 요청 주소가 5173이다. 잘못된 것인가?</summary>

정상이다. 브라우저는 Vite의 5173에 요청하고 Vite가 내부적으로 Spring에 전달한다. Network에는 브라우저가 요청한 주소가 표시된다.
</details>

<details><summary>Q. (강의 질문) 검색어 상태를 `keyword`와 `searchKeyword` 두 개로 나누는 이유는?</summary>

입력 중인 값과 실제 검색 조건은 다를 수 있기 때문이다. 입력할 때는 `keyword`만 바뀌고, 검색 버튼을 누르면 `searchKeyword`가 바뀌어 API를 요청한다. 그래서 글자를 입력할 때마다 요청하지 않고 버튼을 눌렀을 때만 요청한다.
</details>

<details><summary>Q. `useEffect(…, [searchKeyword])`는 언제 학생 목록을 조회하는가? (강의 질문) 같은 검색어를 다시 제출하면?</summary>

화면에 처음 나타났을 때, 그리고 `searchKeyword`가 바뀔 때 조회한다. `keyword`만 바뀌면 요청하지 않는다. 같은 검색어를 다시 제출하면 `searchKeyword`가 바뀌지 않아 추가 요청이 없다 (검색 조건이 바뀔 때 조회하는 구성).
</details>

<details><summary>Q. `URLSearchParams`와 `response.ok` 검사는 각각 왜 쓰는가?</summary>

`URLSearchParams`는 검색어를 쿼리 문자열로 바꾸면서 한글·공백·특수문자를 URL에 맞게 인코딩한다. `fetch`는 404·500 응답만으로 자동으로 오류를 던지지 않으므로, `response.ok`를 검사해 실패면 `throw`로 `catch`에 보낸다.
</details>

<details><summary>Q. (강의 질문) `ignore` 변수는 왜 있는가? 요청을 취소하는가?</summary>

이전 요청이 늦게 끝났을 때 이미 다른 검색으로 바뀐 화면에 오래된 결과를 반영하지 않으려고 있다. 검색 조건이 바뀌거나 컴포넌트가 제거되면 정리 함수가 `ignore = true`로 만든다. 요청을 취소하지는 않고, 완료된 결과를 반영할지만 제어한다.
</details>

<details><summary>Q. (강의 질문) 폼 제출을 왜 막는가? 막은 뒤 화면이 바뀌기까지의 흐름은?</summary>

기본 폼 제출은 JSP 때처럼 새 문서를 요청한다. `event.preventDefault()`로 막은 뒤: 검색 조건 state 변경 → Effect가 API 요청 → 학생 목록 state 변경 → React가 화면 갱신. 문서 이동 없이 목록만 바뀐다.
</details>

<details><summary>Q. (강의 질문) 전체 보기 버튼에 `type="button"`을 지정한 이유는?</summary>

폼 안의 버튼이 의도치 않게 제출 버튼으로 동작하지 않게 하려고. React를 쓴다고 폼의 기본 동작이 자동으로 없어지지 않는다.
</details>

<details><summary>Q. 로딩·오류·빈 결과·목록은 각각 어떤 조건에서 보이는가? 빈 결과와 실패를 왜 구분하는가?</summary>

`loading` → 로딩 안내, `!loading && error !== ""` → 오류 안내, `!loading && error === "" && students.length === 0` → "검색 결과가 없습니다.", `!loading && error === "" && students.length > 0` → 학생 표. 결과 없음은 정상 검색이고 실패는 요청이 잘못된 것이라, 사용자에게 다르게 알려야 한다.
</details>

<details><summary>Q. Network에서 이 화면이 CSR이라는 것을 어떻게 확인하는가?</summary>

① `document` 요청의 Response(초기 HTML)에 학생 목록 행이 없고 `<div id="root"></div>`와 JavaScript 연결만 있다. ② Fetch/XHR에 `/api/students?keyword=` 요청이 있고 응답이 JSON 배열이다. ③ 검색하면 새 Document 요청 없이 `/api/students?keyword=한` API 요청만 생긴다.
</details>

<details><summary>Q. (실패 상태 확인) Spring만 끄고 검색하면? 이때 이전과 다른 검색어로 검색하는 이유는?</summary>

Vite가 API를 전달하지 못해 오류 응답이나 연결 실패가 생기고 오류 안내가 보인다. 같은 검색어면 `searchKeyword`가 바뀌지 않아 요청 자체가 일어나지 않기 때문에 다른 검색어로 검색한다. 확인 후 Spring을 다시 켜고 페이지를 새로고침한다.
</details>

<details><summary>Q. JSP SSR과 이번 React CSR은 검색 응답·문서 이동·초기 HTML·URL 공유·JavaScript 없이 표시에서 어떻게 다른가?</summary>

| 항목 | JSP SSR | React CSR |
|---|---|---|
| 검색 응답 | HTML 문서 | JSON |
| 검색 시 문서 이동 | 발생 | 막아서 없음 |
| 초기 HTML에 학생 목록 | 포함 | 미포함 |
| 검색 URL 공유 | 쿼리 파라미터 포함 | 이번 예제는 미구현 |
| JavaScript 없이 목록 | 가능 | 이번 예제는 불가 |
</details>

<details><summary>Q. "CSR로 바꾸면 검색할 때 서버 요청이 없어진다"는 말은 맞는가?</summary>

아니다. React 화면도 검색할 때 API 요청을 보낸다. 줄어든 것은 서버 역할 전체가 아니라, 이번 검색에서 문서 HTML을 다시 생성하고 이동하는 과정이다. 또 JSP도 JavaScript를 결합하면 부분 갱신할 수 있으므로 이 비교를 모든 SSR·CSR의 특성으로 일반화하지 않는다.
</details>

<details><summary>Q. React 화면에서 `한`으로 검색한 뒤 새로고침하면 검색 결과가 유지되는가?</summary>

유지되지 않는다. 이번 예제는 검색어를 URL에 반영하지 않고 React state로만 관리하기 때문이다. CSR에서도 URL에 저장할 수 있지만 자동으로 되는 기능은 아니다.
</details>

## 완료 체크
- [ ] 기존 Service를 사용하는 JSON API를 추가했다.
- [ ] 브라우저에서 목록·검색 JSON을 확인했다.
- [ ] React 프로젝트와 Vite 프록시를 설정했다.
- [ ] API에서 받은 학생 목록을 React로 표시했다.
- [ ] 폼의 기본 제출을 막고 검색을 구현했다.
- [ ] 로딩·오류·빈 결과를 구분해 표시했다.
- [ ] 검색 시 Document가 아닌 API 요청을 확인했다.
- [ ] JSP와 React의 HTML·JSON 응답을 비교했다.
- [ ] 이번 React 예제의 검색어가 URL에는 저장되지 않는다는 점을 이해했다.
- [ ] 실습 후 서버와 네트워크 설정을 정상 상태로 복구했다.

## 질문 노트

_아직 없음_
