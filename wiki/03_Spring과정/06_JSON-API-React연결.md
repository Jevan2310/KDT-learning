# 06. JSON API 만들고 React와 연결하기 — 같은 DB를 HTML과 JSON으로

> 과정: Spring과정 · [노션 원문](https://app.notion.com/p/416848f71c9b80228e0fe6c64af0b86e) · 최종 갱신일: 2026-11-19

## 한눈에 보기
- [05](05_H2-JPA저장.md)에서 H2에 저장한 학생 목록을 **JSON으로도 제공**해 React 화면에 표시한다. **DB는 같고 응답을 만드는 방식만 다르다**: `/students` → HTML (Thymeleaf), `/api/students` → JSON.
- 기존 `@Controller`(화면용)는 그대로 두고, **`@RestController`인 `StudentApiController`를 추가**한다. `List<Student>`를 반환하면 Spring이 getter를 읽어 **JSON 배열**로 바꿔 응답한다.
- React(5173)와 Spring Boot(8080)는 포트가 달라 출처가 다르다 → API 컨트롤러에 **`@CrossOrigin(origins = "http://localhost:5173")`** 으로 CORS를 설정한다.
- Node 과정의 React 프로젝트([04_React-서버연결](../02_Node과정/04_React-서버연결.md))에서 `StudentList.jsx`의 요청 주소를 **`http://localhost:8080/api/students`** 로 바꾸고, 이름과 **학습 상태**까지 표시한다.
- Thymeleaf에서 등록한 학생이 React에서도 보인다 (React는 **새로고침해야** 다시 조회한다). React는 아직 조회만 한다.

> 💡 보충: 노션 하위 페이지 06은 과정 목차의 **06장(JSON API)과 07장(React 연결)을 합친** 회차다. 코드의 패키지는 `com.hancoding.student`다. 내 프로젝트 패키지에 맞춰 고친다.

## 학습 목표
- HTML 응답과 JSON 응답을 구분한다.
- API용 컨트롤러를 만든다.
- Repository에서 조회한 학생 목록을 응답한다.
- CORS를 설정한다.
- React에서 Spring Boot API를 호출한다.
- Thymeleaf와 React에서 같은 데이터를 확인한다.

## 핵심 개념

### 1. 같은 데이터를 다른 화면에서 사용하기

지금까지 (Thymeleaf):

```text
브라우저 요청
    ↓
Spring에서 DB 조회
    ↓
Thymeleaf로 HTML 생성
    ↓
브라우저에 HTML 응답
```

이번에 추가 (React):

```text
React에서 요청
    ↓
Spring에서 DB 조회
    ↓
학생 목록을 JSON으로 응답
    ↓
React에서 목록 표시
```

| 구분 | Thymeleaf 화면 | React 화면 |
|---|---|---|
| 목록 요청 경로 | `/students` | `/api/students` |
| Spring의 응답 | HTML | JSON |
| 목록 화면 구성 | 서버의 Thymeleaf | 브라우저의 React |

- **데이터베이스는 같고, 응답을 만드는 방식이 다르다.**
- 기존 Thymeleaf 화면과 컨트롤러는 **유지**하고 API 컨트롤러를 **추가**한다.

### 2. 화면용 컨트롤러와 API 컨트롤러 구분하기

```java
@Controller
public class StudentController {
    // Model에 데이터를 담고 템플릿 이름 반환
}
```

```java
@RestController
public class StudentApiController {
    // 데이터를 응답 본문으로 반환
}
```

| 애너테이션 | 이번 실습에서의 역할 |
|---|---|
| `@Controller` | Thymeleaf 화면 연결 |
| `@RestController` | 학생 목록을 응답 본문으로 전달 |

- API에서는 **템플릿 이름이나 `Model`이 필요 없다.**
- **조회한 데이터를 반환하면 Spring의 메시지 변환 기능이 JSON 응답으로 만든다.**

> 💡 보충: [02](02_SpringBoot시작.md)의 `/hello`도 `@RestController`였다. 그때는 `String`을 반환해서 글자가, 이번에는 `List<Student>`를 반환해서 JSON 배열이 응답된다. `@Controller`와의 차이는 [03](03_Thymeleaf-학생목록.md)에 있다.

### 3. 학생 목록 API — `StudentApiController`
기존 `controller` 패키지에 만든다.

```text
com.hancoding.student
├─ StudentApplication.java
├─ controller/
│  ├─ HelloController.java
│  ├─ StudentController.java
│  └─ StudentApiController.java
├─ model/
│  └─ Student.java
└─ repository/
   └─ StudentRepository.java
```

| 코드 | 의미 |
|---|---|
| `private final StudentRepository studentRepository;` | 학생 정보를 조회할 Repository |
| `public StudentApiController(StudentRepository studentRepository)` | Spring이 준비한 Repository를 생성자로 전달받는다 ([05](05_H2-JPA저장.md) 8장 DI) |
| `@GetMapping("/api/students")` | 이 경로의 GET 요청을 처리 |
| `return studentRepository.findAll();` | DB에서 조회한 학생 목록을 반환 |

- 기존 `Student` 클래스의 **getter를 통해** 학생 속성을 읽어 JSON으로 표현한다 (`getId()` → `id`, `getName()` → `name`, `isLearning()` → `learning`).

수업 화면: 프로젝트 `www`의 `controller` 패키지에 `StudentApiController`·`StudentController`, `model`에 `Student`, `repository`에 `StudentRepository`가 있다. 프로젝트 루트에 `data` 폴더가 보인다 (05의 파일 모드 DB).

### 4. 브라우저에서 JSON 확인하기
서버를 재시작하고 `http://localhost:8080/api/students`에 접속한다. ID와 이름은 실제 저장한 내용에 따라 다르다.

```json
[
  {
    "id": 1,
    "name": "한코딩",
    "learning": false
  },
  {
    "id": 2,
    "name": "이학생",
    "learning": false
  }
]
```

- 등록된 학생이 없으면 **빈 배열** `[]`을 응답한다.

| 주소 | 결과 |
|---|---|
| `http://localhost:8080/students` | Thymeleaf HTML 화면 |
| `http://localhost:8080/api/students` | 학생 목록 JSON |

- **두 컨트롤러가 같은 Repository와 DB를 쓰므로** `/students`에서 등록한 이름이 `/api/students`에도 나온다.
- 정렬 순서는 따로 정하지 않았다. 이번에는 순서보다 **데이터가 포함되어 있는지** 확인한다.

### 5. React 프로젝트 실행하기
Node.js 연동 때 쓴 React 프로젝트([04_React-서버연결](../02_Node과정/04_React-서버연결.md))를 열고 터미널에서 실행한다.

```bash
npm run dev
```

```bash
npm install
```

- 패키지가 설치되지 않은 프로젝트라면 `npm install`을 먼저 실행한다.
- **두 프로그램을 각각 실행 상태로** 둔다.

| 프로그램 | 주소 예시 |
|---|---|
| Spring Boot | `http://localhost:8080` |
| React 개발 서버 | `http://localhost:5173` |

- React 주소는 **터미널에 실제로 표시된 값**을 확인한다.
- 기존 Node.js 학생 API 서버(3000)는 **이번 실습에 필요 없다.**

### 6. Spring에서 CORS 설정하기 — `@CrossOrigin`
React(`http://localhost:5173`)와 Spring Boot(`http://localhost:8080`)는 **포트가 달라 출처가 다르다.** React의 JavaScript가 API 응답을 읽을 수 있도록 CORS를 설정한다.

```java
import org.springframework.web.bind.annotation.CrossOrigin;
```

```java
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class StudentApiController {
    // 기존 코드
}
```

- **React가 다른 포트로 실행 중이면 실제 출처에 맞춰 바꾼다.**
- `localhost`와 `127.0.0.1`도 **서로 다른 호스트**로 취급된다. 주소를 일관되게 쓴다.
- 저장하고 **Spring Boot 서버를 재시작**한다.
- CORS는 브라우저가 다른 출처의 응답을 읽는 것과 관련된 설정이다. **로그인이나 데이터 접근 권한을 대신하지 않는다.**

> 💡 보충: Node 과정에서는 Express 서버에 `app.use(cors({ origin: "http://localhost:5173" }))`로 설정했다 ([04_React-서버연결](../02_Node과정/04_React-서버연결.md) 3장). Spring은 **컨트롤러 클래스에 `@CrossOrigin`** 을 붙이면 그 컨트롤러의 요청에만 적용된다 (그래서 화면용 `StudentController`에는 붙이지 않는다).

### 7. React의 요청 주소 바꾸기

```javascript
fetch("http://localhost:3000/students");
```

```javascript
fetch("http://localhost:8080/api/students");
```

- **API 경로뿐 아니라 서버 포트도 확인한다** (`3000/students` → `8080/api/students`).
- 서버가 보내는 데이터에 `id`, `name`이 있으므로 기존 학생 목록 표시 구조를 그대로 활용할 수 있다.

### 8. `StudentList.jsx`의 흐름

| 코드 | 역할 |
|---|---|
| `useEffect` | 컴포넌트가 마운트되었을 때 조회 시작 |
| `fetch()` | Spring API 요청 |
| `response.ok` | HTTP 성공 여부 확인 |
| `response.json()` | JSON을 JavaScript 값으로 변환 |
| `setStudents(data)` | 학생 배열을 state에 저장 |
| `map()` | 학생 목록 표시 |

- `ignore`와 정리 함수는 이전 요청의 결과를 더 쓰지 않아야 할 때 **state 업데이트를 건너뛰게** 한다. **요청 자체를 취소하지는 않는다.**
- 개발 중 **Strict Mode**에서는 Effect가 한 번 더 실행되어 서버 요청이 **두 번** 보일 수 있다.

> 💡 보충: Node 04의 최종 `StudentList.jsx`와 거의 같다. 달라진 곳은 ① 요청 주소 ② 제목 "Spring Boot에서 받은 학생 목록" ③ `response.ok` 실패 문구 ④ 각 학생 옆에 **`learning` 값으로 "학습 중"/"학습 예정"** 표시. 자세한 흐름 설명(`async/await`, `try/catch/finally`, 삼항 연산자 이어 쓰기)은 [04_React-서버연결](../02_Node과정/04_React-서버연결.md)에 있다.

### 9. 같은 데이터를 두 화면에서 확인하기
1. Thymeleaf 화면 `http://localhost:8080/students`에서 학생을 새로 등록한다.
2. React 화면 `http://localhost:5173`으로 이동해 **새로고침**한다.
3. 등록한 학생이 나타나는지 확인한다.

**왜 React를 새로고침하나?** 지금 React 예제는 **컴포넌트가 처음 나타날 때만** 목록을 조회한다. 다른 화면에서 학생을 등록했다고 React가 자동으로 새 목록을 요청하지 않는다. → **새로고침으로 조회를 다시 실행**해 바뀐 데이터를 받는다.

| 기능 | 이번 실습에서 처리하는 곳 |
|---|---|
| 학생 등록 | Thymeleaf 폼 |
| DB 저장 | Spring Repository |
| HTML 목록 조회 | Thymeleaf 화면 |
| JSON 목록 조회 | React 화면 |

- React에서는 **조회만** 구현했다. React에서 등록·수정·삭제하는 기능은 아직 없다.

### 10. 연결 오류 확인 순서
1. **API부터 직접 확인**: `http://localhost:8080/api/students`에서 JSON이 안 나오면 먼저 Spring 서버를 본다.
2. API는 정상인데 React에 안 보이면 **브라우저 개발자 도구 → Network 탭**을 열고 React 페이지를 새로고침한다.

| 항목 | 예상 내용 |
|---|---|
| Request URL | `http://localhost:8080/api/students` |
| Request Method | GET |
| Status Code | 정상이라면 200 |
| Response | 학생 JSON 배열 |

특히 두 경로를 구분한다.

```text
/students       → HTML
/api/students   → JSON
```

### 11. 전체 구조

```text
                      ┌─ Thymeleaf 화면
                      │   GET /students
                      │   POST /students
                      │
H2 데이터베이스 ← Repository
                      │
                      └─ JSON API
                          GET /api/students
                                 ↑
                              React
```

- 두 컨트롤러가 **서로 다른 목록을 따로 보관하는 것이 아니다.** 같은 DB에서 조회한 데이터를 HTML 또는 JSON으로 표현한다.

| 방식 | Spring이 하는 일 | 브라우저가 하는 일 |
|---|---|---|
| Thymeleaf | 데이터를 조회하고 HTML 생성 | 받은 HTML 표시 |
| React 연동 | 데이터를 조회하고 JSON 응답 | React가 데이터로 화면 구성 |

- 이번에는 HTML과 JSON의 차이를 보려고 **API에서 Entity를 직접 반환**했다. 서비스가 커지면 공개할 데이터만 담는 **DTO**를 따로 둘 수 있다.

### 정리

| 개념 | 핵심 |
|---|---|
| 화면용 컨트롤러 | 데이터를 템플릿과 연결해 HTML 응답 |
| API용 컨트롤러 | 데이터를 응답 본문으로 반환 |
| Repository | 같은 DB의 학생 데이터 조회 |
| `@CrossOrigin` | 다른 출처의 브라우저 요청에 대한 CORS 설정 |
| `fetch()` | React에서 API 요청 |
| state | 응답 데이터를 보관하고 화면 갱신 |

## 실습 정리

### 만든 것
Spring에 **`GET /api/students`(학생 목록 JSON)** 를 추가하고, React 화면이 이 API를 불러 "Spring Boot에서 받은 학생 목록"(이름 — 학습 중/학습 예정)을 표시한다. Thymeleaf 화면(`/students`)에서 등록한 학생이 React에서도 보인다.

### 단계 흐름
1. `controller/StudentApiController.java` 생성 (`@RestController`, Repository 생성자 주입, `@GetMapping("/api/students")`)
2. 서버 재시작 → 브라우저에서 `/api/students` JSON 확인, `/students`에서 등록 후 JSON에도 나오는지 확인
3. React 프로젝트 `npm run dev` (Spring과 함께 두 프로그램 실행)
4. `@CrossOrigin(origins = "http://localhost:5173")` 추가 → Spring 재시작
5. `src/components/StudentList.jsx` 교체 (주소 `8080/api/students`, 학습 상태 표시)
6. `App.jsx`에 `StudentList` 연결 (이미 있으면 그대로)
7. Thymeleaf에서 등록 → React 새로고침으로 확인

### 최종 코드

**Spring — `controller/StudentApiController.java`**

```java
package com.hancoding.student.controller;

import com.hancoding.student.model.Student;
import com.hancoding.student.repository.StudentRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class StudentApiController {

    private final StudentRepository studentRepository;

    public StudentApiController(
            StudentRepository studentRepository
    ) {
        this.studentRepository = studentRepository;
    }

    @GetMapping("/api/students")
    public List<Student> getStudents() {
        return studentRepository.findAll();
    }
}
```

- `Student`·`StudentRepository`·`StudentController`·`students.html`은 [05](05_H2-JPA저장.md) 그대로다.

**React — `src/components/StudentList.jsx`**

```jsx
import { useEffect, useState } from "react";

function StudentList() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/students"
        );

        if (!response.ok) {
          throw new Error(
            "학생 목록 요청에 실패했습니다."
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
      <h2>Spring Boot에서 받은 학생 목록</h2>

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
                <strong>{student.name}</strong>

                <span>
                  {" "}
                  — {student.learning ? "학습 중" : "학습 예정"}
                </span>
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

> 💡 보충: `{" "}`는 JSX에서 **공백 한 칸**을 넣는 방법이다. 줄을 바꿔 쓴 JSX 사이의 공백은 사라지기 때문에, 이름과 "— 학습 중" 사이를 띄우려고 넣었다.

**React — `App.jsx`에 연결** (이미 `StudentList`를 쓰고 있으면 중복 추가하지 않는다)

```javascript
import StudentList from "./components/StudentList.jsx";
```

```javascript
<StudentList />
```

- 스타일은 Node 연동 때의 `.student-list` CSS([04_React-서버연결](../02_Node과정/04_React-서버연결.md) 실습 4)를 그대로 쓸 수 있다.

### 직접 확인하기 (미션)
- [ ] `http://localhost:8080/students` 화면이 그대로 동작한다 (Thymeleaf 유지).
- [ ] `http://localhost:8080/api/students`에서 학생 목록 JSON이 보인다 (없으면 `[]`).
- [ ] `/students`에서 등록한 이름이 `/api/students`를 새로고침하면 JSON에도 나온다.
- [ ] React 화면에 "Spring Boot에서 받은 학생 목록"과 이름·학습 상태가 보인다.
- [ ] Thymeleaf에서 새로 등록한 학생이 React를 새로고침하면 나타난다.
- [ ] Network 탭에서 `http://localhost:8080/api/students`, GET, 200, JSON 배열을 확인한다.

## 헷갈리기 쉬운 점
- **`/students`는 HTML, `/api/students`는 JSON.** React에서 `/students`를 요청하면 HTML이 와서 `response.json()`이 실패한다.
- **API 경로뿐 아니라 포트도 바꾼다.** Node는 `3000/students`, Spring은 `8080/api/students`.
- **화면용 컨트롤러는 `@Controller`, API는 `@RestController`.** 기존 화면용 컨트롤러를 바꾸지 않고 API 컨트롤러를 추가한다.
- **`@CrossOrigin`의 출처는 실제 React 주소와 정확히 같아야** 한다. 포트가 바뀌면 고치고, `localhost` ≠ `127.0.0.1`.
- **주소창에서 JSON이 보여도 React에서 CORS 오류가 날 수 있다.** 주소창 접속과 다른 출처의 JavaScript가 읽는 것은 다르다.
- **CORS는 권한·로그인 기능이 아니다.**
- **React는 자동으로 다시 조회하지 않는다.** 다른 화면에서 등록했으면 React를 새로고침한다.
- **Strict Mode에서는 개발 중 요청이 두 번** 보일 수 있다.
- **H2 메모리 모드면 Spring을 재시작할 때 학생이 사라진다.** 계속 보려면 파일 모드 ([05](05_H2-JPA저장.md) 13장).
- **`Student`의 getter가 JSON 속성이 된다.** `isLearning()` → `"learning"`.

**자주 발생하는 문제**

| 증상 | 확인할 내용 |
|---|---|
| 연결할 수 없음 | Spring 서버 실행 여부와 포트 |
| 404 | `/api/students` 경로와 컨트롤러 위치 |
| CORS 오류 | 실제 React 출처와 `@CrossOrigin` 일치 여부 |
| JSON 변환 오류 | `/students` HTML 주소로 요청하지 않았는지 |
| `map is not a function` | 응답이 배열인지 |
| 학습 상태가 다르게 보임 | 서버의 `learning` 속성을 읽고 있는지 |
| 신규 학생이 React에 안 보임 | React에서 다시 조회했는지 |
| 서버 재시작 후 학생이 사라짐 | H2 메모리 모드인지, 파일 모드 설정이 유지되는지 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| JSON API 컨트롤러 | `@RestController` | `public class StudentApiController { … }` |
| 목록 JSON 응답 | `List<Entity>` 반환 | `public List<Student> getStudents() { return studentRepository.findAll(); }` |
| API 경로 | `@GetMapping` | `@GetMapping("/api/students")` |
| React 출처 허용 (CORS) | `@CrossOrigin` | `@CrossOrigin(origins = "http://localhost:5173")` |
| JSON 직접 확인 | 브라우저 주소창 | `http://localhost:8080/api/students` |
| React에서 요청 | `fetch()` | `fetch("http://localhost:8080/api/students")` |
| 성공 여부 확인 | `response.ok` | `if (!response.ok) { throw new Error(…); }` |
| JSON → JS 값 | `response.json()` | `const data = await response.json();` |
| 처음 표시될 때 조회 | `useEffect(…, [])` | `useEffect(() => { loadStudents(); }, []);` |
| 불리언으로 문구 선택 | 삼항 연산자 | `{student.learning ? "학습 중" : "학습 예정"}` |
| 요청 확인 | 개발자 도구 Network | Request URL·Method·Status·Response |

## 확인 문제

<details><summary>Q. `/students`와 `/api/students`는 무엇을 응답하는가? 데이터는 다른가?</summary>

`/students`는 Thymeleaf가 만든 **HTML**, `/api/students`는 학생 목록 **JSON**이다. 두 컨트롤러가 **같은 Repository·같은 DB**를 쓰므로 데이터는 같다. 응답을 만드는 방식만 다르다.
</details>

<details><summary>Q. 화면용 컨트롤러와 API 컨트롤러는 애너테이션과 반환값이 어떻게 다른가?</summary>

화면용은 `@Controller` — Model에 데이터를 담고 **템플릿 이름**을 반환한다. API용은 `@RestController` — 템플릿 이름이나 Model 없이 **데이터(`List<Student>`)를 반환**하면 Spring의 메시지 변환 기능이 JSON으로 만든다.
</details>

<details><summary>Q. `List<Student>`를 반환했는데 JSON에 `id`, `name`, `learning`이 나오는 이유는?</summary>

Spring이 `Student`의 **getter**(`getId()`, `getName()`, `isLearning()`)를 읽어 속성 이름으로 JSON을 만든다.
</details>

<details><summary>Q. 등록된 학생이 없으면 `/api/students`는 무엇을 응답하는가?</summary>

빈 배열 `[]`.
</details>

<details><summary>Q. React(5173)에서 Spring(8080)을 부르려면 왜 CORS를 설정하는가? Spring에서는 어떻게 하는가?</summary>

포트가 달라 **출처가 다르기** 때문에, 브라우저가 React의 JavaScript가 응답을 읽도록 허용하려면 서버가 CORS를 설정해야 한다. API 컨트롤러 클래스에 `@CrossOrigin(origins = "http://localhost:5173")`을 붙이고 서버를 재시작한다. 출처는 실제 React 주소와 같아야 한다 (`localhost` ≠ `127.0.0.1`).
</details>

<details><summary>Q. Node 연동 때의 React 코드에서 무엇을 바꾸는가?</summary>

요청 주소를 `http://localhost:3000/students` → `http://localhost:8080/api/students`로 (**경로와 포트 모두**). 이번 코드는 학생 옆에 `learning` 값으로 "학습 중"/"학습 예정"도 표시한다.
</details>

<details><summary>Q. Thymeleaf에서 학생을 등록했는데 React 화면에 안 보인다. 왜이고, 어떻게 확인하는가?</summary>

React 예제는 **컴포넌트가 처음 나타날 때만** 목록을 조회한다. 다른 화면에서 등록해도 자동으로 다시 요청하지 않으므로 React 페이지를 **새로고침**해 조회를 다시 실행한다.
</details>

<details><summary>Q. React에 목록이 안 나올 때 어떤 순서로 확인하는가?</summary>

① 주소창에서 `http://localhost:8080/api/students`를 열어 JSON이 나오는지(안 나오면 Spring 서버·경로 문제) ② 정상이면 개발자 도구 Network 탭에서 Request URL·GET·200·응답 JSON 배열을 확인하고, CORS 오류면 `@CrossOrigin` 출처를 본다.
</details>

<details><summary>Q. `ignore`와 정리 함수는 요청을 취소하는가?</summary>

아니다. 이전 요청의 결과를 더 쓰지 않아야 할 때 **state 업데이트만 건너뛴다.** 요청 자체는 취소하지 않는다.
</details>

<details><summary>Q. 이번에 API에서 Entity를 그대로 반환했다. 서비스가 커지면 무엇을 둘 수 있는가?</summary>

공개할 데이터만 담는 **DTO**를 따로 둘 수 있다.
</details>

## 완료 체크
- [ ] 기존 Thymeleaf 화면을 유지했다.
- [ ] `/api/students`에서 학생 목록을 JSON으로 응답했다.
- [ ] 실제 React 출처에 맞춰 CORS를 설정했다.
- [ ] React의 API 주소를 Spring Boot 주소로 변경했다.
- [ ] 학생 이름과 학습 상태를 React에 표시했다.
- [ ] Thymeleaf에서 등록한 학생을 React에서도 확인했다.
- [ ] HTML 응답과 JSON 응답의 차이를 이해했다.

## 질문 노트

_아직 없음_
