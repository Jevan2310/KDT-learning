# 03. SSR의 요청 흐름과 화면 갱신 확인하기 — Network로 HTML 응답과 검색 요청 보기

> 과정: SSR-CSR과정 · [노션 원문](https://app.notion.com/p/420848f71c9b80c0bd0dc7eb33d046e6) · 최종 갱신일: 2026-11-27

## 한눈에 보기
- 화면만 보고는 서버가 HTML을 만들었는지, 브라우저가 목록을 만들었는지 알 수 없다. **브라우저가 실제로 받은 응답**을 개발자 도구 **Network**에서 확인한다.
- [02_JSP-SSR화면](02_JSP-SSR화면.md)의 `/students` 문서 요청(**Doc**)은 `GET` · `200` · **`text/html`**이고, **Response 안에 학생 이름이 이미 들어 있다.** JSP의 `<c:forEach>`는 서버에서 처리되어 반복된 `<tr>`로 바뀌어 온다.
- 검색은 기본 폼 제출로 **`GET /students?keyword=한` 새 문서를 요청**한다. 응답은 검색 결과와 검색어(`value="한"`)가 반영된 **페이지 전체 HTML**이다. 목록만 바뀐 것처럼 보여도 새 문서다.
- 검색에 `fetch`나 React를 쓰지 않았으므로 **JavaScript를 꺼도** 목록·검색·결과 없음 안내가 동작한다.
- "서버가 무엇을 응답했나"는 Elements(현재 DOM)가 아니라 **Network의 Response**로 판단한다. 기존 문서를 유지하는 **부분 갱신**은 [04_React-CSR화면](04_React-CSR화면.md)에서 비교한다.

## 학습 목표
- 브라우저 개발자 도구에서 문서 요청을 찾는다.
- 서버가 응답한 HTML에 학생 정보가 포함되어 있는지 확인한다.
- 검색할 때 발생하는 요청과 응답을 설명한다.
- JavaScript 없이 검색이 동작하는 이유를 이해한다.
- 문서 전체 이동과 화면 일부 갱신의 차이를 구분한다.

## 핵심 개념

### 1. 화면만 보면 처리 방식을 알 수 있을까?
사용자에게는 똑같이 학생 목록이 보이지만, 화면만으로는 다음을 알 수 없다.
- 서버가 학생 정보를 HTML에 넣어서 보냈는가?
- 브라우저가 데이터를 받은 뒤 목록을 만들었는가?
- 검색할 때 새 문서를 받았는가?
- 기존 문서에서 목록만 바뀌었는가?

→ 이번 회차는 **브라우저가 실제로 받은 응답**을 확인한다.

### 2. Network와 문서 요청
**Network** = 브라우저가 보낸 요청과 서버의 응답을 확인하는 개발자 도구 탭.

Network를 연 상태에서 새로고침하면 다음과 비슷한 요청이 보인다.

| 요청 | 역할 |
|---|---|
| `students` | HTML 문서 |
| `students.css` | 화면 스타일 |
| `favicon.ico` 등 | 브라우저가 추가로 요청할 수 있는 아이콘 |

- 개발자 도구를 열기 **전에 끝난 요청은 목록에 없을 수 있어서** 새로고침이 필요하다.
- 아이콘을 따로 만들지 않았다면 `favicon.ico` 요청은 **실패할 수도 있다.** 학생 목록 문서의 실패와 구분한다.
- **Doc** 필터(또는 Type이 `document`인 요청)로 `students`를 찾는다. **문서 요청은 브라우저가 표시할 HTML 문서를 가져오는 요청이다.**

### 3. Headers — 요청 주소와 응답 종류
`students` 요청을 선택하고 **Headers**를 본다.

| 항목 | 의미 | 이번 예제 |
|---|---|---|
| Request URL | 요청한 주소 | `http://localhost:8080/students` |
| Request Method | HTTP 요청 방식 | `GET` |
| Status Code | 처리 결과 | 정상이라면 `200` |
| Content-Type | 응답 본문의 형식 | `text/html` |

**Content-Type이 중요한 이유** — 서버가 무엇을 응답했는지 구분할 수 있다.

| 응답 형식 | 용도 |
|---|---|
| `text/html` | HTML 문서 |
| `application/json` | JSON 데이터 |
| `text/css` | CSS 파일 |

- 이번 Controller는 JSP로 HTML을 만들므로 문서 응답은 `text/html`이다.
- **학생 데이터를 썼다고 반드시 JSON으로 응답하는 것은 아니다.** 이번에는 학생 정보가 HTML 안에 들어 있다. (JSON 응답은 [06_JSON-API-React연결](../03_Spring과정/06_JSON-API-React연결.md)과 [04_React-CSR화면](04_React-CSR화면.md)에서 본다.)

> 💡 보충: Request URL·Request Method·Status Code는 Headers의 **General** 부분에, Content-Type은 **Response Headers** 부분에 있다. 이번 JSP는 `contentType="text/html; charset=UTF-8"`로 선언했으므로 값이 `text/html;charset=UTF-8`처럼 문자 인코딩까지 붙어 보일 수 있다.

### 4. Response에 이미 학생 이름이 있다
`students` 요청의 **Response** 탭 = 서버가 보낸 HTML. `한코딩`을 검색하면 다음과 비슷한 HTML이 보인다 (줄바꿈·공백은 실제 응답과 다를 수 있다).

```html
<tr>
    <td>1</td>
    <td>한코딩</td>
    <td>han@example.com</td>
    <td>풀스택 A반</td>
</tr>
```

**JSP 코드는 어디로 갔을까?** 작성한 JSP에는 이런 코드가 있었다.

```jsp
<c:forEach var="student" items="${students}">
    <tr>
        <td><c:out value="${student.name}" /></td>
    </tr>
</c:forEach>
```

응답에서는 반복된 HTML로 바뀌어 있다.

```html
<tr>
    <td>한코딩</td>
</tr>
<tr>
    <td>김자바</td>
</tr>
```

> 💡 보충: 위 JSP와 결과 HTML은 이름 칸만 남겨 줄인 것이다. [02_JSP-SSR화면](02_JSP-SSR화면.md)의 실제 `students.jsp`는 번호·이름·이메일·소속 반 네 칸을 출력하므로 Response에도 네 칸짜리 `<tr>`가 학생 수만큼 있다.

이유: **서버가 JSP를 이미 처리했기 때문**이다.

```text
JSP와 학생 데이터
        ↓ 서버에서 처리
학생 이름이 포함된 HTML
        ↓ 응답
브라우저
```

**이번 페이지의 학생 목록은 브라우저 JavaScript가 만든 것이 아니라, 서버에서 만든 HTML에 포함되어 있다.**

> 💡 보충: Thymeleaf에서 `th:` 속성이 응답에 남지 않던 것과 같은 원리다 ([03_Thymeleaf-학생목록](../03_Spring과정/03_Thymeleaf-학생목록.md) 10장).

### 5. Network Response · 페이지 소스 · Elements

| 확인 위치 | 주로 확인하는 것 |
|---|---|
| Network → Response | 선택한 요청에 대해 받은 응답 본문 |
| 페이지 소스 보기 | 페이지의 소스 HTML |
| Elements | 현재 브라우저의 DOM 구조 |

- **페이지 소스 보기**: 페이지 빈 곳 오른쪽 클릭 → 페이지 소스 보기 → 학생 이름 검색. 이번 예제는 소스에서도 이름이 보인다.
- **Elements**: 브라우저가 현재 유지하고 있는 문서 구조(DOM). DOM은 JavaScript 실행이나 브라우저의 HTML 해석 과정에서 **달라질 수 있다.**
- **특정 검색 요청에 서버가 무엇을 응답했는지**는 **Network의 Response**를 기준으로 본다.

**Elements에 이름이 있으면 SSR일까?** — 그것만으로는 판단할 수 없다. CSR도 JavaScript가 실행된 뒤에는 Elements에 학생 목록이 나타날 수 있다. **현재 DOM에 있는지와 최초 HTML 응답에 있었는지는 구분해야 한다.**

> 💡 보충: SEO과정에서 인증 태그를 Elements가 아니라 페이지 소스로 확인한 것도 같은 이유다 ([03_사이트등록-소유확인](../04_SEO과정/03_사이트등록-소유확인.md) 7장).

### 6. 검색할 때 발생하는 요청
- 검색 전에 Network의 **Preserve log**를 켠다. 페이지가 새 문서로 이동해도 **이전 요청 기록을 유지**하는 설정이다. 그다음 요청 목록 지우기 버튼으로 기존 기록을 비운다.
- 검색창에 `한`을 입력하고 검색하면 이런 **문서 요청**이 생긴다.

```text
/students?keyword=한
```

- 주소창이나 요청 URL에서는 한글이 **인코딩되어** 보일 수 있다.
- Headers의 요청 주소 또는 **Payload**의 **Query String Parameters**에서 확인한다.

| 파라미터 | 값 |
|---|---|
| `keyword` | `한` |

> 💡 보충: `한`을 URL 인코딩하면 `%ED%95%9C`이다. 그래서 요청 주소가 `/students?keyword=%ED%95%9C`로 보여도 같은 요청이다. (`자바`는 `%EC%9E%90%EB%B0%94`)

Response에는 한코딩 행만 있고 다른 학생의 데이터 행은 없다.

```html
<tr>
    <td>1</td>
    <td>한코딩</td>
    <td>han@example.com</td>
    <td>풀스택 A반</td>
</tr>
```

**검색 결과를 서버에서 판단하고, 그 결과로 새 HTML을 만들어 응답한 것이다.**

### 7. 목록만 바뀐 것처럼 보여도 새 문서다
검색 후에도 제목과 검색창 디자인이 거의 같아서 목록만 바뀐 것처럼 느껴진다. 하지만 이번 구현은 기본 폼 제출로 **새 문서를 요청하는 페이지 이동**이다.

```text
기존 학생 목록 문서
          ↓ 검색 폼 제출
GET /students?keyword=한
          ↓
검색 결과가 포함된 새 HTML 문서
```

새 문서 응답(Response)에서 찾아볼 것: `<html>`, `<head>`, 페이지 제목, 검색 폼, 학생 목록, CSS 연결 정보.
→ 서버는 학생 행만 보낸 것이 아니라 **페이지 문서 전체를 구성해** 응답한다.

- CSS·이미지 같은 자원은 캐시가 쓰일 수 있다. **문서 이동 때 모든 파일을 반드시 다시 다운로드한다는 뜻은 아니다.**
- 새 문서 이동이라고 **항상 눈에 띄는 깜빡임이 있는 것도 아니다.** 요청 종류와 응답을 기준으로 판단한다.

### 8. 검색어 유지 — 서버가 새 입력창에 다시 출력한다
검색 후 입력창에 `한`이 남아 있다. **이전 입력창이 그대로 남은 것이 아니다.** 서버가 검색어를 받아 Model에 넣고, JSP가 **새 입력창의 값으로** 출력했다.

**Controller**

```java
model.addAttribute("keyword", searchKeyword);
```

**JSP**

```jsp
<input
    id="keyword"
    type="text"
    name="keyword"
    value="<c:out value='${keyword}' />"
>
```

**생성된 HTML**

```html
<input
    id="keyword"
    type="text"
    name="keyword"
    value="한"
>
```

**문서를 새로 받아도 서버에서 필요한 값을 다시 출력하면 일부 상태를 유지할 수 있다.**

### 9. JavaScript 없이도 동작할까?
이번 페이지는 검색에 `fetch`나 React를 쓰지 않았다. **브라우저의 기본 폼 기능과 서버 처리**로 동작한다. 그래서 JavaScript를 꺼도 전체 목록, 이름 검색, 결과 없음 안내가 모두 동작해야 한다 (방법은 실습 5).

하지만 **모든 SSR 서비스의 모든 기능이 JavaScript 없이 동작한다는 뜻은 아니다.** SSR 페이지도 메뉴·차트·자동완성 등에 JavaScript를 쓸 수 있다.

### 10. 문서 이동 vs 부분 갱신

**이번 JSP 구현**

```text
검색 버튼 클릭
      ↓
검색 결과 문서 요청
      ↓
서버가 HTML 문서 생성
      ↓
새 문서 표시
```

**JavaScript를 활용한 부분 갱신**

```text
검색 버튼 클릭
      ↓
기본 폼 제출을 막음
      ↓
검색 API 요청
      ↓
데이터를 받아 기존 목록 갱신
```

| 비교 항목 | 이번 JSP 구현 | API를 이용한 부분 갱신 |
|---|---|---|
| 현재 문서 | 새 문서로 이동 | 기존 문서 유지 |
| 검색 응답 | HTML 문서 | 예를 들어 JSON |
| 목록 표시 | 서버가 생성한 HTML 사용 | JavaScript가 화면 변경 |
| 검색어 유지 | 새 HTML에 검색어 반영 | 기존 입력 상태 유지 가능 |
| 로딩·실패 처리 | 문서 이동과 서버 응답 중심 | 화면의 상태로 직접 처리 |

> 💡 보충: "화면의 상태로 직접 처리"는 [04_느린API-화면](../05_비동기과정/04_느린API-화면.md)에서 `isLoading`·`error` state로 로딩·오류를 보여준 방식이다.

**부분 갱신은 CSR만의 기능일까?** — 아니다.
- JSP로 만든 SSR 페이지에 JavaScript를 추가해 부분 갱신할 수 있다.
- 서버가 **HTML 조각**을 응답하고 이를 삽입하는 방식도 가능하다.
- 이번 과정은 비교를 명확하게 하려고 두 구성을 쓴다: **JSP** = 기본 폼 제출 + 서버 HTML 응답, **React** = API 요청 + 브라우저 화면 구성.

### 11. 이번 실습의 요청 흐름 (검색어 `한`)

```text
브라우저
GET /students?keyword=한
          ↓
StudentPageController
keyword 수신
          ↓
StudentService
이름에 '한'이 포함된 학생 조회
          ↓
Model
students와 keyword 저장
          ↓
students.jsp
목록·검색어를 반영한 HTML 생성
          ↓
브라우저
새 HTML 문서 표시
```

서버가 응답한 HTML에는 **이미 검색 결과가 들어 있다.** 이 사실을 **Network의 Response에서 직접 확인**한 것이 이번 회차의 핵심이다.

### 정리

| 항목 | 확인한 내용 |
|---|---|
| Network | 요청과 응답 확인 |
| Document (문서) | 페이지의 HTML 문서 요청 |
| Request URL | 검색 경로와 검색어 확인 |
| Content-Type | HTML·JSON 등 응답 형식 구분 |
| Response | 서버가 실제로 보낸 응답 본문 |
| Elements | 현재 브라우저의 DOM |
| JSP SSR | 서버가 학생 정보를 포함한 HTML 생성 |
| 검색어 유지 | 서버가 새 HTML의 입력값에 다시 반영 |
| JavaScript 비활성화 | 이번 목록·검색은 기본 폼과 서버 처리로 동작 |
| 부분 갱신 | 기존 문서를 유지하며 필요한 내용을 변경 |

## 실습 정리
새 코드는 없다. [02_JSP-SSR화면](02_JSP-SSR화면.md)에서 만든 화면을 **크롬 개발자 도구로 관찰**한다.

### 준비
- 02회차 Spring 프로젝트를 실행하고 `http://localhost:8080/students`에 접속한다 → 학생이 **데이터베이스에 들어 있는 만큼** 보이는지 확인.
- 개발자 도구 열기: 페이지 빈 곳 오른쪽 클릭 → **검사** → **Network** 탭.

> 💡 보충: 2026-11-25 원문에 수업 화면 캡처가 추가됐다 (02의 MyBatis 버전 ②로 실행한 화면).
> - 표의 **번호 칸이 비어 있고**, 소속 반 칸에는 반 이름 대신 **숫자(`class_id`)** 가 보인다. 번호가 비는 것은 ② 검색 SQL(`searchByName`)이 `id`를 조회하지 않기 때문이다 (실행 확인 — [04](04_React-CSR화면.md) 실습 1 보충). 숫자가 보이는 것은 수업 JSP가 `${student.classId}`를 출력하도록 고친 것으로 보인다 (원문 JSP 코드는 `className` 그대로 — [02](02_JSP-SSR화면.md) 보충). 아래 Response 예시의 `<td>1</td>`(번호)·`<td>풀스택 A반</td>`는 ① 고정 목록 기준이다.
> - Network 목록에는 `students`(Status `200`, Type `document`)와 `students.css`(`200`, `stylesheet`)만 보였다. `students.css`의 Initiator가 `students:14`인데, `students` 문서 **14번째 줄**(`<link rel="stylesheet" href="/css/students.css">`)이 이 요청을 일으켰다는 뜻이다.
> - Response는 빈 줄 세 개 뒤 4번째 줄에 `<!DOCTYPE html>`이 나온다. JSP 맨 위 `<%@ page … %>`·`<%@ taglib … %>` 줄은 처리되어 사라지고 줄바꿈만 남은 것이다 (02 JSP로 실행 확인).

> 💡 보충: 단축키는 Mac `Cmd + Option + I`, Windows `F12` 또는 `Ctrl + Shift + I`. 크롬 언어가 한국어면 개발자 도구 메뉴도 한국어로 보일 수 있다 (예: Network → 네트워크, Elements → 요소, Headers → 헤더, Response → 응답, Preserve log → 로그 보존).

### 실습 1. 첫 문서 요청 확인 (핵심 개념 2~4)

| 단계 | 할 일 | 볼 곳 | 보여야 하는 것 |
|---|---|---|---|
| 1 | Network를 연 상태에서 **새로고침** | 요청 목록 | `students`, `students.css`, `favicon.ico` 등 (`favicon.ico`는 실패해도 됨) |
| 2 | **Doc** 필터 선택 (또는 Type `document` 찾기) → `students` 클릭 | 요청 목록 | 문서 요청 `students` 한 줄 |
| 3 | **Headers** 탭 | Request URL · Request Method · Status Code · Content-Type | `http://localhost:8080/students` · `GET` · `200` · `text/html` |
| 4 | **Response** 탭 → `한코딩` 검색 | 응답 본문 | 한코딩이 들어 있는 `<tr>` 행 |
| 5 | 같은 Response에서 학생 목록 부분 보기 | `<tbody>` 안 | `<c:forEach>`·`<c:out>` 같은 JSP 태그 없이 **학생 수만큼 반복된 `<tr>`** |

> 💡 보충: Response 내용을 한 번 클릭한 뒤 `Cmd + F`(Windows `Ctrl + F`)로 검색한다. 02회차 JSP는 `<title>학생 목록 | 한코딩</title>`이라 제목에도 `한코딩`이 있다. 첫 검색 결과가 `<title>`이면 다음 결과로 넘겨 `<td>`를 찾는다.

### 실습 2. 페이지 소스·Elements와 비교 (핵심 개념 5)

| 단계 | 할 일 | 보여야 하는 것 |
|---|---|---|
| 1 | 페이지 빈 곳 오른쪽 클릭 → **페이지 소스 보기** → 학생 이름 검색 | 이번 예제는 소스에도 학생 이름이 있다 |
| 2 | 개발자 도구 **Elements** 탭에서 학생 목록 찾기 | 현재 DOM에도 학생 목록이 있다 |
| 3 | 세 곳의 차이 정리 | Response = 그 요청의 응답 본문, 페이지 소스 = 소스 HTML, Elements = 현재 DOM. **Elements에 있다는 것만으로 SSR이라고 판단하지 않는다** |

### 실습 3. 검색 전후 요청 비교 (핵심 개념 6~7)

| 단계 | 할 일 | 볼 곳 | 보여야 하는 것 |
|---|---|---|---|
| 1 | **Preserve log** 켜기 → 요청 목록 **지우기** 버튼 | Network 위쪽 | 목록이 비고, 이후 이동해도 기록이 남는다 |
| 2 | 검색창에 `한` 입력 → 검색 | 요청 목록 (Doc) | 새 문서 요청 `students?keyword=…` |
| 3 | 그 요청의 **Headers** | Request URL | `/students?keyword=한` (한글이 `%ED%95%9C`처럼 인코딩되어 보일 수 있음) |
| 4 | **Payload** 탭 | Query String Parameters | `keyword` = `한` |
| 5 | **Response** 탭 | 학생 행 | 한코딩 행은 있고, 다른 학생의 데이터 행은 없다 |
| 6 | 같은 Response에서 페이지 구성 찾기 | 응답 본문 전체 | `<html>`, `<head>`, 페이지 제목, 검색 폼, 학생 목록, CSS 연결 정보가 **모두** 있다 → 새 문서 |

> 💡 보충: 지우기 버튼은 Network 패널 왼쪽 위의 동그라미에 사선이 그어진 모양이다. Preserve log를 켜 두지 않으면 페이지가 새 문서로 이동할 때 이전 기록이 지워진다.

### 실습 4. 검색어 유지 확인 (강의의 "확인하기")
1. `자바`로 검색한다.
2. 해당 문서 요청의 Response를 연다.
3. 입력 요소의 `value`에 `자바`가 들어 있는지 확인한다.
4. 김자바 학생 행이 들어 있는지 확인한다.

→ 검색어가 남은 이유는 서버가 `model.addAttribute("keyword", searchKeyword)`로 넘기고 JSP가 새 `<input>`의 `value`로 다시 출력했기 때문이다.

### 실습 5. JavaScript 끄고 동작 확인 (핵심 개념 9)

| 단계 | 할 일 | 보여야 하는 것 |
|---|---|---|
| 1 | 개발자 도구 명령 메뉴 열기: Windows `Ctrl + Shift + P` / Mac `Command + Shift + P` → `Disable JavaScript` 선택 | |
| 2 | 페이지 **새로고침** | 전체 학생 목록이 보인다 |
| 3 | 이름 검색 (예: `한`) | 검색이 동작한다 |
| 4 | 없는 이름 검색 (예: `없는학생`) | 결과 없음 안내("검색 결과가 없습니다.")가 보인다 |
| 5 | 명령 메뉴 → `Enable JavaScript` → **다시 새로고침** | JavaScript가 다시 켜진다 |

```text
Disable JavaScript
```

```text
Enable JavaScript
```

> 💡 보충: 명령 메뉴 단축키는 **개발자 도구 창이 선택된 상태**에서 눌러야 열린다. 이 설정은 개발자 도구가 열려 있는 그 탭에만 적용되고, 개발자 도구를 닫으면 풀린다. 그래도 강의대로 실습 후에는 `Enable JavaScript`로 직접 되돌린다.

## 헷갈리기 쉬운 점
- **화면이 같아 보여도 처리 방식은 다를 수 있다.** 판단은 화면이 아니라 받은 응답으로 한다.
- **Network는 열기 전에 끝난 요청을 못 볼 수 있다.** 탭을 연 뒤 새로고침한다.
- **`favicon.ico` 실패 ≠ 학생 목록 실패.** 아이콘을 안 만들었으면 실패할 수 있다. 확인할 것은 `students` 문서 요청이다.
- **학생 데이터를 썼다고 JSON 응답이 아니다.** 이번 문서 응답은 `text/html`이고 데이터는 HTML 안에 들어 있다.
- **JSP 태그는 응답에 남지 않는다.** 서버가 처리해서 결과 HTML만 보낸다.
- **Elements에 이름이 있다 ≠ 서버가 HTML에 넣어 보냈다.** CSR도 JavaScript 실행 뒤에는 Elements에 목록이 생긴다. 서버 응답은 **Network의 Response**로 확인한다.
- **검색 후 목록만 바뀐 것처럼 보여도 새 문서 이동이다.** 깜빡임 여부가 아니라 문서 요청(Doc)과 응답 내용(`<html>`부터 전체)으로 판단한다.
- **새 문서 이동 = 모든 파일 재다운로드가 아니다.** CSS·이미지는 캐시가 쓰일 수 있다.
- **Preserve log를 켜야** 검색 전후 요청을 이어서 볼 수 있다.
- **요청 URL의 한글은 인코딩되어 보일 수 있다.** 값은 Payload의 Query String Parameters에서 확인한다.
- **검색어가 남아 있는 건 이전 입력창이 남아서가 아니다.** 서버가 새 HTML의 `value`에 다시 출력했다.
- **JavaScript를 꺼도 동작하는 건 이번 페이지의 목록·검색 이야기다.** 모든 SSR 기능이 JavaScript 없이 되는 것은 아니다.
- **실습 후 JavaScript를 다시 켜고 새로고침한다.**
- **부분 갱신 ≠ CSR.** SSR 페이지에도 JavaScript로 부분 갱신을 넣을 수 있고, 서버가 HTML 조각을 보내는 방식도 있다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 개발자 도구 열기 | 오른쪽 클릭 → 검사 | (보충) Mac `Cmd + Option + I`, Windows `F12` |
| 요청 목록 보기 | Network 탭 → 새로고침 | `students`, `students.css`, `favicon.ico` |
| HTML 문서 요청만 보기 | **Doc** 필터 | Type `document` |
| 주소·방식·결과 확인 | 요청 선택 → Headers | Request URL, Request Method, Status Code |
| 응답 형식 확인 | Headers → Content-Type | `text/html` / `application/json` / `text/css` |
| 서버가 보낸 본문 보기 | 요청 선택 → Response | `한코딩` 검색 |
| 소스 HTML 보기 | 오른쪽 클릭 → 페이지 소스 보기 | 학생 이름 검색 |
| 현재 DOM 보기 | Elements 탭 | |
| 페이지 이동해도 기록 유지 | **Preserve log** + 지우기 버튼 | 검색 전에 켜고 비우기 |
| 쿼리 파라미터 확인 | Payload → Query String Parameters | `keyword` = `한` |
| 검색어를 새 문서에 유지 | Model + JSP `value` 출력 | `model.addAttribute("keyword", searchKeyword);` · `value="<c:out value='${keyword}' />"` |
| JavaScript 끄기·켜기 | 명령 메뉴 `Ctrl/Command + Shift + P` | `Disable JavaScript` / `Enable JavaScript` |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목과 8장 "확인하기"에서 뽑았다.

<details><summary>Q. (강의 질문) 화면만 보면 SSR인지 CSR인지 알 수 있나? 무엇을 확인해야 하나?</summary>

알 수 없다. 서버가 학생 정보를 HTML에 넣어 보냈는지, 브라우저가 데이터를 받아 목록을 만들었는지, 검색 때 새 문서를 받았는지, 기존 문서에서 목록만 바뀌었는지는 화면으로 구분되지 않는다. 개발자 도구 Network에서 **브라우저가 실제로 받은 응답**을 확인한다.
</details>

<details><summary>Q. Network를 열었는데 `students` 요청이 안 보인다. 왜이고 어떻게 하나?</summary>

개발자 도구를 열기 전에 끝난 요청은 목록에 없을 수 있다. Network를 연 상태에서 새로고침한다. 그다음 Doc 필터(또는 Type `document`)로 `students`를 찾는다.
</details>

<details><summary>Q. (강의 질문) Content-Type은 왜 중요한가? 이번 `students` 문서 응답의 값은?</summary>

서버가 무엇을 응답했는지 구분할 수 있다 (`text/html` HTML 문서, `application/json` JSON 데이터, `text/css` CSS 파일). 이번 Controller는 JSP로 HTML을 만들므로 `text/html`이다. 학생 데이터를 썼다고 반드시 JSON으로 응답하는 것은 아니다.
</details>

<details><summary>Q. (강의 질문) JSP에 쓴 `<c:forEach>` 코드는 Response 어디에 있나?</summary>

없다. 서버가 JSP를 이미 처리해서, 학생 수만큼 반복된 `<tr><td>한코딩</td></tr>` 같은 HTML로 바뀌어 응답된다. 그래서 학생 목록은 브라우저 JavaScript가 만든 것이 아니라 서버가 만든 HTML에 포함되어 있다.
</details>

<details><summary>Q. Network Response, 페이지 소스 보기, Elements는 각각 무엇을 보여주나?</summary>

Network → Response: 선택한 요청에 대해 받은 응답 본문. 페이지 소스 보기: 페이지의 소스 HTML. Elements: 현재 브라우저의 DOM 구조 (JavaScript 실행 등으로 달라질 수 있음). 특정 요청에 서버가 무엇을 응답했는지는 Response를 기준으로 본다.
</details>

<details><summary>Q. (강의 질문) Elements에 학생 이름이 있으면 SSR인가?</summary>

그것만으로는 판단할 수 없다. CSR도 JavaScript가 실행된 뒤에는 Elements에 학생 목록이 나타난다. 현재 DOM에 있는지와 **최초 HTML 응답에 있었는지**를 구분해야 한다.
</details>

<details><summary>Q. (강의 질문) `한`으로 검색할 때 어떤 요청이 발생하고, 응답에는 무엇이 들어 있나?</summary>

`GET /students?keyword=한` 문서 요청이 발생한다 (`keyword` = `한`은 Payload의 Query String Parameters에서 확인, URL에서는 인코딩되어 보일 수 있음). Response에는 한코딩 행만 있고 다른 학생 행은 없다. 서버가 검색 결과를 판단해 새 HTML을 만들어 응답한 것이다.
</details>

<details><summary>Q. 검색 전후 요청을 비교할 때 Preserve log를 켜는 이유는?</summary>

검색 폼 제출로 페이지가 새 문서로 이동해도 이전 요청 기록을 유지하기 위해서다. 켠 뒤 지우기 버튼으로 기존 기록을 비우고 검색하면 검색 요청만 깔끔하게 볼 수 있다.
</details>

<details><summary>Q. (강의 질문) 검색 후 목록만 바뀐 것 같은데, 새 문서 응답에는 무엇이 들어 있나? 깜빡임이 없으면 새 문서가 아닌가?</summary>

`<html>`, `<head>`, 페이지 제목, 검색 폼, 학생 목록, CSS 연결 정보까지 페이지 문서 전체가 들어 있다. 기본 폼 제출로 새 문서를 요청하는 페이지 이동이다. 깜빡임이 항상 보이는 것은 아니므로 요청 종류와 응답으로 판단한다. 또 CSS 등은 캐시가 쓰일 수 있어 모든 파일을 다시 받는다는 뜻은 아니다.
</details>

<details><summary>Q. (강의 질문) 검색 후 입력창에 검색어가 남아 있는 이유는? (`자바`로 확인하기)</summary>

이전 입력창이 남은 것이 아니다. Controller가 `model.addAttribute("keyword", searchKeyword)`로 검색어를 넘기고, JSP가 `value="<c:out value='${keyword}' />"`로 새 입력창의 값에 다시 출력했다. `자바`로 검색하면 Response의 `<input>`에 `value="자바"`가 있고 김자바 행이 있다. 문서를 새로 받아도 서버가 필요한 값을 다시 출력하면 일부 상태를 유지할 수 있다.
</details>

<details><summary>Q. (강의 질문) JavaScript를 꺼도 이번 목록·검색이 동작하는 이유는? 모든 SSR 페이지가 그런가?</summary>

검색에 `fetch`나 React를 쓰지 않고 브라우저의 기본 폼 기능과 서버 처리로 동작하기 때문이다. 하지만 모든 SSR 서비스의 모든 기능이 JavaScript 없이 동작하는 것은 아니다. SSR 페이지도 메뉴·차트·자동완성 등에 JavaScript를 쓸 수 있다.
</details>

<details><summary>Q. 이번 JSP 검색과 API를 이용한 부분 갱신은 무엇이 다른가?</summary>

JSP: 새 문서로 이동, 응답은 HTML 문서, 서버가 만든 HTML로 목록 표시, 검색어는 새 HTML에 반영, 로딩·실패는 문서 이동과 서버 응답 중심. 부분 갱신: 기존 문서 유지, 응답은 예를 들어 JSON, JavaScript가 화면 변경, 기존 입력 상태 유지 가능, 로딩·실패는 화면의 상태로 직접 처리.
</details>

<details><summary>Q. (강의 질문) 부분 갱신은 CSR만의 기능인가?</summary>

아니다. JSP로 만든 SSR 페이지에 JavaScript를 추가해 부분 갱신할 수 있고, 서버가 HTML 조각을 응답해 삽입하는 방식도 있다. 이 과정은 비교를 명확히 하려고 JSP(기본 폼 + 서버 HTML)와 React(API + 브라우저 화면 구성)로 나눈 것이다.
</details>

<details><summary>Q. `GET /students?keyword=한`부터 화면 표시까지의 흐름은?</summary>

브라우저 `GET /students?keyword=한` → `StudentPageController`가 keyword 수신 → `StudentService`가 이름에 '한'이 포함된 학생 조회 → `Model`에 students와 keyword 저장 → `students.jsp`가 목록·검색어를 반영한 HTML 생성 → 브라우저가 새 HTML 문서 표시. 응답 HTML에는 이미 검색 결과가 들어 있다.
</details>

## 완료 체크
- [ ] Network에서 학생 목록의 문서 요청을 찾았다.
- [ ] 응답 형식이 HTML인지 확인했다.
- [ ] Response에서 학생 이름을 찾았다.
- [ ] JSP 태그가 처리된 HTML로 바뀌는 것을 확인했다.
- [ ] 페이지 소스와 Elements의 차이를 이해했다.
- [ ] 검색 요청의 `keyword` 값을 확인했다.
- [ ] 검색할 때 새 문서 요청이 발생하는 것을 확인했다.
- [ ] 응답 HTML에 검색어와 검색 결과가 포함된 것을 확인했다.
- [ ] JavaScript를 꺼도 목록과 검색이 동작하는지 확인했다.
- [ ] 실습 후 JavaScript를 다시 활성화했다.

## 질문 노트

_아직 없음_
