# 02. Spring Boot로 학생 정보 API 만들기 — 혼자 실행되는 학생 서비스와 API 계약

> 과정: MSA과정 · [노션 원문](https://app.notion.com/p/422848f71c9b8072a9cdec8bf539a565) · 최종 갱신일: 2026-11-27

## 한눈에 보기
- 전체 구조(React → Express 공지 서비스 → Spring 학생 서비스) 중 **학생 정보만 소유하는 Spring 학생 서비스**를 만든다. 이전 SSR 실습과 **분리된 새 프로젝트**(`student-service`, Jar, Java 21, Spring Boot 4.2.0)이고, 공지 제목·내용은 다루지 않는다 (공지 서비스의 책임).
- `application.properties`에 `spring.application.name=student-service`와 `server.port`를 적어 **다른 서비스와 겹치지 않는 포트**로 실행한다. 단, **포트만 다르게 정했다고 MSA가 되는 것은 아니다.** 책임과 실행·배포 경계가 함께 나뉘어야 한다.
- DB 없이 `List.of(...)`로 만든 **고정 학생 4명**을 쓴다. 호출 순서: `StudentApiController`(`@RestController`, `/students`) → `StudentService` → `StudentRepository`(목록 보관, 번호로 찾기) → `Student`(데이터).
- `GET /students` → `200` + **배열**, `GET /students/{id}` → `200` + **객체 하나**. 없는 번호는 **`ResponseEntity.notFound()`로 본문 없는 `404`**, 숫자가 아닌 번호(`/students/abc`)는 Spring이 자동으로 **`400`** 을 응답한다.
- 다른 서비스가 쓸 **API 계약**(경로·상태 코드·필드 이름·자료형)을 정리하고, 학생 서비스만 켜고 끄면서 **`404`(서버는 응답했고 학생이 없음)와 연결 실패(응답 자체가 없음)** 를 구분한다.

> 💡 보충: 노션 원문에 **두 버전의 코드가 섞여 있다.** ① 원래 자료: 모든 클래스를 `com.hancoding.studentservice` 한 패키지에 두고 `StudentController`(생성자 직접 작성)를 쓴다. ② 수업에서 바꾼 코드: `controller`·`dto`·`repository`·`service` 패키지로 나누고 Lombok `@RequiredArgsConstructor`, `StudentRepository`, `StudentApiController`(+ `@RequestParam` 연습 메서드)를 쓴다. 이 문서는 수업 화면과 같은 **②를 최종 코드**로 정리하고 ①의 Controller는 비교용으로 남긴다. 원문 코드를 그대로 붙여 넣으면 **컴파일 오류**가 나는 곳이 있다 → 실습 정리의 "노션 원문의 두 버전".
>
> 포트도 섞여 있다. `application.properties`·본문 주소·완료 체크는 **8080**이고, 8장의 로그 확인 문장과 과정 페이지·[01](01_모놀리식-MSA.md)회차는 **8081**이다. 03·04회차도 8080을 쓰므로 이 문서는 **8080**으로 적는다 ([_과정개요](_과정개요.md)).

## 학습 목표
- 학생 정보를 담당하는 Spring Boot 서비스를 만든다.
- **별도 포트를 설정(필수)** 하고 독립적으로 실행한다.
- 학생 목록과 학생 한 명을 JSON으로 응답한다.
- 정상 조회와 존재하지 않는 학생을 상태 코드로 구분한다.
- 다른 서비스가 사용할 **API의 규칙을 정리**한다.

## 핵심 개념

### 1. 학생 서비스의 역할 — 학생 데이터만 소유한다
전체 서비스 중 **학생 정보를 제공하는 부분**을 만든다.

```text
React 화면
    ↓
Express 공지 서비스
    ↓ 학생 정보 요청
Spring 학생 서비스 ← 이번에 구현할 부분
```

학생 서비스가 관리하는 데이터:

| 항목 | JSON 필드 | 예 |
|---|---|---|
| 학생 번호 | `id` | `3` |
| 이름 | `name` | `"이리액트"` |
| 이메일 | `email` | `"react@example.com"` |

- 공지 제목과 내용은 관리하지 않는다. **그것은 공지 서비스의 책임이다** (데이터 소유권 → [01](01_모놀리식-MSA.md)).

구현할 API:

| 요청 | 기능 | 응답 |
|---|---|---|
| `GET /students` | 전체 학생 조회 | `200`과 학생 배열 |
| `GET /students/{id}` | 학생 한 명 조회 | `200`과 학생 객체 |
| 없는 번호 조회 | 대상 없음 | `404` |

- 이번에는 **DB 없이 Java 목록**을 쓴다 (메모리에 저장). **데이터 저장보다 독립된 서비스와 API 응답을 이해하는 데 집중한다.**

> 💡 보충: 원문 메모에는 "ArrayList"라고 적혀 있지만 실제 코드는 `List.of(...)`(수정할 수 없는 목록)다. 둘 다 메모리에 있어서 서버를 다시 켜면 처음 4명으로 돌아간다.

### 2. 별도 프로젝트 — Jar, Spring Web만
- 이전 SSR 실습 프로젝트와 **분리하여 새 프로젝트**를 만든다 (설정은 실습 정리의 "프로젝트 준비").
- JSP를 쓰지 않으므로 **Jar** 패키징을 쓴다. ([SSR 02](../08_SSR-CSR과정/02_JSP-SSR화면.md)는 JSP 때문에 War였다.)
- **Spring Web**이 있으면 Controller가 반환한 객체를 JSON 응답으로 변환할 수 있다.
- **JSP·Thymeleaf·JPA·MyBatis·DB 드라이버는 추가하지 않는다.** (JPA·JDBC를 실수로 넣으면 DB 설정이 없어 실행이 실패한다 — 14장 문제 표)

> 💡 보충: Spring Boot 4.x에서는 Spring Web이 `spring-boot-starter-webmvc`라는 이름으로 들어간다 (3.x는 `spring-boot-starter-web`, [Spring 05](../03_Spring과정/05_H2-JPA저장.md)). 강의 버전 **4.2.0은 2026-11-27 기준 start.spring.io에서 바로 고를 수 있다** (그대로 만들어 실행함). 프로젝트 설정 표의 Dependencies에는 Spring Web만 있지만 `build.gradle`과 ② 코드는 **Lombok**을 쓴다 → 만들 때 Lombok도 함께 고른다.

### 3. 서비스 이름과 포트 — `application.properties`

```properties
spring.application.name=student-service
server.port=8080
```

| 설정 | 의미 |
|---|---|
| `spring.application.name` | 애플리케이션 이름 |
| `server.port` | HTTP 요청을 받을 포트 |

학생 서비스는 `http://localhost:8080`에서 요청을 받는다.

**왜 포트를 다르게 사용할까?** 같은 컴퓨터에서 여러 프로그램을 **동시에** 실행할 예정이기 때문이다.

| 구성 | 사용할 포트 |
|---|---|
| React 개발 서버 | 5173 |
| Express 공지 서비스 | 3000 |
| Spring 학생 서비스 | 8080 |

- 포트가 다르면 같은 컴퓨터에서 각각 실행할 수 있다.
- **포트 번호를 다르게 정한 것만으로 MSA가 되는 것은 아니다.** 서비스의 책임과 실행·배포 경계가 함께 나뉘어야 한다.
- Spring Boot의 설정값은 `application.properties` 등으로 관리한다.

> 💡 보충: 8080은 원래 기본 포트라서 `server.port=8080`은 기본값을 눈에 보이게 적은 것이다 ([Spring 02](../03_Spring과정/02_SpringBoot시작.md)). 이전 Spring 프로젝트(SSR·Spring 과정)도 8080이라 **함께 켜 두면** 나중에 켠 쪽이 `Web server failed to start. Port 8080 was already in use.`로 시작하지 못한다 (다른 포트로 실행 확인). 이전 프로젝트를 끄거나, 과정 페이지처럼 `server.port=8081`로 바꾸고 이 문서의 주소도 8081로 읽는다.
>
> `spring.application.name`은 로그 줄마다 `--- [student-service] [main] …`처럼 찍히는 이름이다. 이 이름으로 다른 서비스가 접속할 수 있게 되는 것은 아니다 (14장).

### 4. 역할 나누기 — Controller · Service · Repository · Student
② 코드의 호출 흐름:

```text
GET /students/3
      ↓
StudentApiController.findById(3)   ← HTTP 요청 받기, 상태 코드 정하기
      ↓
StudentService.findById(3)         ← 조회 로직 (이번에는 그대로 전달)
      ↓
StudentRepository.findById(3)      ← 학생 목록 보관, 번호로 찾기
      ↓
Student 객체 (없으면 null)
```

| 애너테이션 | 붙인 클래스 | Spring에 등록하는 역할 |
|---|---|---|
| `@RestController` | `StudentApiController` | 요청을 받아 객체를 응답 본문(JSON)으로 반환 |
| `@Service` | `StudentService` | 학생 조회 로직을 담당할 객체 |
| `@Repository` | `StudentRepository` | 학생 데이터를 보관·조회하는 객체 |
| (없음) | `Student` | Spring 등록 대상이 아닌 데이터 클래스 |

- `@SpringBootApplication`이 있는 패키지와 **그 하위 패키지**를 기준으로 Spring이 구성 요소를 찾는다. ①은 모두 같은 패키지에, ②는 하위 패키지(`controller`, `service`, `repository`)에 두는데 둘 다 찾는다.

> 💡 보충: `@RequiredArgsConstructor`(Lombok)는 **`final` 필드를 받는 생성자**를 만들어 준다. ① 버전에서 직접 쓴 `public StudentController(StudentService studentService) { … }`와 같은 **생성자 주입**이다. [SSR 02](../08_SSR-CSR과정/02_JSP-SSR화면.md)의 `@AllArgsConstructor`는 모든 필드를 받는 생성자인데, 필드가 `final` 하나뿐이면 결과가 같다.
>
> [Spring 05](../03_Spring과정/05_H2-JPA저장.md)의 `StudentRepository`는 `JpaRepository`를 상속한 **인터페이스**(DB 조회)였다. 이번 `StudentRepository`는 이름만 같고, Java 목록을 직접 들고 있는 **일반 클래스**다.

### 5. `Student` — 학생 한 명의 데이터

```java
new Student(
    3L,
    "이리액트",
    "react@example.com"
)
```

- `3L`의 `L`은 **long 타입 숫자**임을 나타낸다.
- Getter(`getId()`, `getName()`, `getEmail()`)로 값을 읽는다. 이번에는 조회만 제공하므로 **Setter는 만들지 않는다.**
- JSON으로 변환되면 번호는 **숫자**, 이름과 이메일은 **문자열**이다.

```json
{
  "id": 3,
  "name": "이리액트",
  "email": "react@example.com"
}
```

> 💡 보충: JSON 필드 이름은 getter 이름에서 나온다 (`getName()` → `name`). getter를 빼면 그 필드가 JSON에서 빠진다 (14장 "학생 이름이 JSON에 없음"). 생성자의 매개변수가 `Long`이라서 `L`을 빼고 `new Student(3, …)`로 쓰면 `error: incompatible types: int cannot be converted to Long`으로 컴파일되지 않는다 (실행 확인). `int`는 `Long`으로 자동 변환되지 않는다.

### 6. 학생 목록과 조회 — `List.of()`와 `equals()`

```java
public Student findById(Long id) {
    for (Student student : students) {
        if (student.getId().equals(id)) {
            return student;
        }
    }
    return null;
}
```

- `findAll()`은 전체 학생 목록을 반환한다.
- `findById()`는 전달받은 번호와 일치하는 학생을 찾는다. **`Long`은 객체 타입이므로 값 비교에 `equals()`를 쓴다.** 일치하는 학생이 없으면 `null`을 반환한다.
- **`List.of()`로 만든 목록은 수정할 수 없다.** 이번에는 조회 전용 데이터라 적절하다. 추가·수정·삭제 API는 구현하지 않는다.

> 💡 보충: 원문은 이 설명(`return students;`, 반복문)을 `StudentService` 아래에 두었지만, ② 코드에서 목록과 반복문은 `StudentRepository`에 있다. ②의 `StudentService`는 Repository를 부르기만 한다.
>
> 파이썬의 `==`는 값을 비교하지만, Java에서 객체끼리 `==`는 **같은 객체인지**(파이썬의 `is`)를 비교한다. `Long`은 -128~127을 미리 만들어 재사용해서 `3L == 3L`은 우연히 `true`지만, `1000L`끼리는 `false`가 나온다 (실행 확인: `true false`, `equals()`는 `true`). 학생 번호가 작을 때는 `==`로도 동작해 보여서 더 헷갈린다. `List.of()` 목록에 `add()`하면 `UnsupportedOperationException`이 난다 (실행 확인).

### 7. Controller — `@RestController` · `@PathVariable` · `ResponseEntity`
**`@RestController`** — 반환한 객체를 **응답 본문**으로 전달한다. JSP나 Thymeleaf의 뷰 이름을 반환하지 않는다.

**`@RequestMapping("/students")`** — 이 Controller의 공통 경로다.

| 메서드 설정 | 최종 요청 |
|---|---|
| `@GetMapping` | `GET /students` |
| `@GetMapping("/{id}")` | `GET /students/3` 등 |

**`@PathVariable`** — 주소 경로에 들어 있는 학생 번호를 받는다.

```text
/students/3
          ↓
id = 3
```

**`ResponseEntity`** — 응답 **상태 코드와 본문을 함께** 정할 수 있다.

| 코드 | 응답 |
|---|---|
| `return ResponseEntity.ok(student);` | `200 OK` + 학생 JSON |
| `return ResponseEntity.notFound().build();` | `404 Not Found` + 본문 없음 |

- **없는 학생을 정상 조회처럼 응답하지 않고, 상태 코드로 구분한다.**
- `findAll()`은 `List<Student>`를 그대로 반환하므로 항상 `200`이다.

> 💡 보충: 이전 회차와 비교
>
> | 구분 | [Spring 06](../03_Spring과정/06_JSON-API-React연결.md) | [SSR 04](../08_SSR-CSR과정/04_React-CSR화면.md) | 이번 (MSA 02) |
> |---|---|---|---|
> | 프로젝트 | 기존 프로젝트에 API Controller **추가** | 기존 JSP 프로젝트에 **추가** | 학생 서비스만 있는 **새 프로젝트** |
> | 경로 | `/api/students` | `/api/students?keyword=` | `/students`, `/students/{id}` (`/api` 없음) |
> | 데이터 | H2 + JPA Repository | 기존 `StudentService` | Java 목록 (`List.of`) |
> | 한 명 조회 | 없음 | 없음 | `@PathVariable` + `ResponseEntity` (없으면 `404`) |
> | 반환 타입 | `List<Student>` | `List<Student>` | 목록은 `List<Student>`, 한 명은 `ResponseEntity<Student>` |
> | 호출하는 쪽 | 브라우저의 React가 8080에 직접 | React → Vite 프록시 | Express 공지 서비스 (05회차, 서버에서 서버로) |
> | CORS 설정 | `@CrossOrigin` 필요 | 필요 없음 (프록시) | 이번에는 없음 |
>
> - 결과가 없을 때: 목록 API는 `[]`(실패 아님, SSR 04)이고, **한 명 조회는 대상이 없으면 `404`** 다. 목록이 비어 있는 것은 정상이지만, 요청한 그 학생은 존재하지 않기 때문이다.
> - `findById` + `ResponseEntity.notFound()` 모양은 [DB 06](../06_데이터베이스과정/06_Spring-MyBatis.md)의 `StudentController`와 같다 (그때는 Mapper, `Integer id`).
> - CORS는 **브라우저의 JavaScript**가 다른 출처로 요청할 때만 걸린다. 주소창에서 직접 여는 것과, 05회차의 Express(서버)가 부르는 것은 CORS와 상관없다. 서버 간 통신과 CORS의 차이는 05회차에서 다룬다.

**② 코드의 `findByIdV2` — `@RequestParam`(쿼리 스트링) 연습**

```java
@GetMapping("/")
public Student findByIdV2(@RequestParam(name = "id") Long id) {
    return service.findById(id);
}
```

- `@RequestParam`은 주소의 **쿼리 스트링**(`?id=3`)에서 값을 받는다. `@PathVariable`은 **경로**(`/3`)에서 받는다.

> 💡 보충: 이 메서드는 **API 계약(12장)에 없는 연습용**이다. 실행해 보면 (2026-11-27, Spring Boot 4.2.0):
>
> | 요청 | 결과 |
> |---|---|
> | `/students/?id=3` | `200` + 이리액트 JSON |
> | `/students/?id=999` | **`200` + 본문 없음** (`null`을 반환해서 `404`가 아니다) |
> | `/students/` (`id` 없음) | `400` (`Required request parameter 'id' for method parameter type Long is not present`) |
> | `/students?id=3` (끝 `/` 없음) | `findAll`로 가서 **학생 4명 배열** (`id`는 무시됨) |
>
> `@GetMapping("/")`의 최종 경로는 `/students/`다. Spring Boot 3부터 끝에 `/`가 있는 주소와 없는 주소를 **다른 경로**로 본다. 상태 코드로 "학생 없음"을 알려야 하는 이번 계약에는 `ResponseEntity`를 쓰는 `/students/{id}`를 쓴다.

### 8. 상태 코드로 결과 구분 — 200 · 404 · 400 · 연결 실패

| 요청 | 의미 | 예상 상태 |
|---|---|---|
| `/students/3` | 존재하는 학생 | 200 |
| `/students/999` | 유효한 숫자지만 대상 없음 | 404 |
| `/students/abc` | 학생 번호 형식이 잘못됨 | 400 |

- 존재하는 학생은 **객체 하나**로 응답한다. 목록과 달리 배열로 감싸지 않는다.
- `/students/999`는 **본문 없는 `404`**. 브라우저가 자체 오류 안내를 보일 수 있으므로 **개발자 도구 Network에서 실제 상태 코드**를 확인한다.
- `abc`는 `Long` 타입 학생 번호로 변환할 수 없으므로 기본적으로 **`400`** 이 발생한다. 오류 본문 형식은 Spring Boot 설정에 따라 다를 수 있다. 이번에는 **상태 코드와 의미**를 중심으로 본다.

학생이 없는 것과 서버에 연결되지 않는 것은 다르다:

```text
404
→ 서버에는 연결되었지만 해당 학생이 없음

연결 실패
→ 서버의 응답 자체를 받지 못함
```

> 💡 보충: `curl -i`로 실제 응답을 확인했다 (2026-11-27, Spring Boot 4.2.0, 포트만 바꿔 실행. 시각은 `…`로 줄임).
>
> ```text
> GET /students/3    → HTTP/1.1 200, Content-Type: application/json
>                      {"id":3,"name":"이리액트","email":"react@example.com"}
> GET /students/999  → HTTP/1.1 404, Content-Length: 0   (본문도 Content-Type도 없음)
> GET /students/abc  → HTTP/1.1 400, Content-Type: application/json
>                      {"timestamp":"…","status":400,"error":"Bad Request","path":"/students/abc"}
> GET /              → HTTP/1.1 404, Content-Type: application/json
>                      {"timestamp":"…","status":404,"error":"Not Found","path":"/"}
> 서버를 끈 뒤        → curl: (7) Failed to connect to localhost port … Couldn't connect to server
> ```
>
> - 400과 `/`의 404 본문은 **Spring Boot 기본 오류 응답**이다. 브라우저(HTML을 원하는 요청)로 열면 같은 상태 코드로 `Whitelabel Error Page` HTML이 온다. 강의의 "오류 본문 형식은 설정에 따라 다를 수 있다"가 이것이다.
> - **같은 404라도 이유가 다르다.** `/`는 경로가 없어서(오류 JSON 본문), `/students/999`는 우리가 "학생 없음"으로 돌려줘서(빈 본문) 404다. Node의 `Cannot GET /경로`(경로 없음 404)는 [Node 03](../02_Node과정/03_서버-데이터보내기.md).
> - 400일 때 서버 콘솔에 `WARN … MethodArgumentTypeMismatchException: Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'; For input string: "abc"`가 찍힌다. `/students/3.0`도 400, `/students/0`·`/students/-1`은 숫자로는 변환되므로 404다.

### 9. Network에서 응답 검증하기
브라우저 개발자 도구의 Network를 열고 새로고침한 뒤 학생 조회 요청을 선택한다.

| 항목 | 정상 조회 `/students/3` | 없는 학생 `/students/999` |
|---|---|---|
| Request Method | GET | GET |
| Status Code | 200 | 404 |
| Content-Type | `application/json` | (없음) |
| Response | 학생 객체 | 이번 구현에서는 본문 없음 |

- **404 응답이 본문 없는 형태이므로, 이것을 호출할 Express에서는 상태 코드를 확인한 뒤 JSON 파싱 여부를 결정해야 한다.**

> 💡 보충: 본문이 비어 있는데 `response.json()`을 부르면 `SyntaxError: Unexpected end of JSON input`이 난다 (Node로 확인). 그래서 [Node 04](../02_Node과정/04_React-서버연결.md)·[SSR 04](../08_SSR-CSR과정/04_React-CSR화면.md)처럼 `response.ok`(또는 `response.status === 404`)를 먼저 검사한다. Express 쪽 코드는 05회차에서 만든다.

### 10. API 계약 정리하기
다른 서비스가 학생 API를 사용하려면 **약속**이 필요하다.

**전체 학생 조회** — `GET /students`
- 성공: `200`
- 본문: 학생 객체의 배열

**학생 상세 조회** — `GET /students/{id}`
- `id`: 숫자로 표현한 학생 번호
- 성공: `200`과 학생 객체
- 학생 없음: `404`, 본문 없음
- 번호 변환 실패: `400`

**학생 객체**

| 필드 | 자료형 | 의미 |
|---|---|---|
| `id` | JSON 숫자 | 학생 번호 |
| `name` | JSON 문자열 | 이름 |
| `email` | JSON 문자열 | 이메일 |

- 공지 서비스는 내부 Java 클래스나 목록 저장 방식을 몰라도 된다. **요청과 응답의 약속을 알면 사용할 수 있다.**
- 학생 API의 필드 이름이나 응답 형태를 바꿀 때는 **이를 사용하는 서비스에 어떤 영향이 있는지**도 확인해야 한다.

> 💡 보충: 필드 이름은 getter에서 나오므로 `getName()`을 `getStudentName()`으로 바꾸기만 해도 JSON이 `studentName`이 되어 계약이 깨진다. 실행해 보니 필드 순서는 강의 예시와 같은 `id, name, email`이었다 (순서는 계약에 들어가지 않는다).

### 11. 독립 실행 확인하기
아직 React와 Express를 만들지 않았어도 **학생 서비스는 혼자 실행되고 응답해야 한다.**

1. 학생 서비스만 실행한다.
2. 학생 3번 조회가 성공하는지 확인한다.
3. 학생 서비스를 종료한다.
4. 같은 주소에 다시 접속한다.
5. 이번에는 `404`가 아니라 **연결 실패**가 발생하는지 확인한다.
6. 학생 서비스를 다시 실행한다.

- 서버 종료 후에도 이전 화면이 남아 있다면 **반드시 새로 요청**하여 확인한다.
- 데이터는 코드에 작성한 고정 목록이므로 **재실행해도 같은 네 명**이 준비된다.

### 정리

| 요소 | 역할 |
|---|---|
| `Student` | 학생 데이터 표현 |
| `StudentRepository` (②) | 학생 목록 보관과 번호별 찾기 |
| `StudentService` | 학생 목록과 번호별 조회 |
| `StudentApiController` | HTTP 요청 처리와 응답 |
| `@RestController` | 객체를 응답 본문으로 반환 |
| `@RequestParam` | 쿼리 스트링을 이용하여 변수 획득 |
| `@PathVariable` | URL 경로의 학생 번호 수신 |
| `ResponseEntity` | 상태 코드와 응답 본문 구성 |
| `200` | 정상 조회 |
| `404` | 요청한 학생 없음 |
| `400` | 학생 번호 형식 등 요청 문제 |
| 연결 실패 | 서버로부터 응답을 받지 못한 상태 |
| API 계약 | 호출하는 서비스와 공유할 요청·응답 규칙 |

> 💡 보충: 원문 정리 표는 ① 이름(`StudentController`)을 쓰고 `StudentRepository` 줄이 없다. ② 코드에 맞춰 바꿔 적었다. 원문의 "쿼티 스트링"은 "쿼리 스트링"의 오타다.

## 실습 정리

### 만든 것
DB 없이 학생 4명을 들고 혼자 실행되는 Spring Boot 학생 서비스(`student-service`). `GET /students`(목록 배열), `GET /students/{id}`(객체 하나, 없으면 본문 없는 404, 숫자가 아니면 400)를 JSON으로 응답한다.

### 노션 원문의 두 버전

| 구분 | ① 원래 자료 (비교용) | ② 수업에서 바꾼 코드 (최종 코드) |
|---|---|---|
| 패키지 | 모두 `com.hancoding.studentservice` 한 곳 | `controller`·`dto`·`repository`·`service` 하위 패키지 |
| 학생 목록 보관 | `StudentService` (이 버전의 Service 코드는 원문에 없음) | `StudentRepository` (`@Repository`) |
| Service | — | `StudentService`, Lombok `@RequiredArgsConstructor`, Repository에 전달 |
| Controller | `StudentController`, 생성자 직접 작성, `@PathVariable("id")` | `StudentApiController`, `@RequiredArgsConstructor`, `@PathVariable(name = "id")`, `findByIdV2` 추가 |
| `Student` | 원문 코드 (`package com.hancoding.studentservice;`) | 같은 코드를 `dto` 패키지로 (원문에 `dto`용 코드는 따로 없음) |

> 💡 보충: 원문 코드를 그대로 붙여 넣으면 생기는 문제 (2026-11-27 Spring Boot 4.2.0으로 실행 확인)
> - **`Student` 패키지**: 원문 `Student.java`는 `package com.hancoding.studentservice;`인데, ② 코드는 `import com.hancoding.studentservice.dto.Student;`를 쓴다. 그대로 두면 `error: package com.hancoding.studentservice.dto does not exist`로 컴파일이 실패한다 → `dto` 폴더에 두고 첫 줄을 `package com.hancoding.studentservice.dto;`로 바꾼다.
> - **Controller 두 개**: 7장 원문에 ① `StudentController`와 ② `StudentApiController`가 연달아 있다. 둘 다 만들면 ① 코드는 import가 없어 `cannot find symbol`(Student·StudentService)로 컴파일이 실패하고, import를 넣어도 같은 `GET /students/{id}`가 두 곳이라 `Ambiguous mapping. Cannot map 'studentApiController' method … to {GET [/students/{id}]}: There is already 'studentController' bean method … mapped.`로 **서버가 시작되지 않는다.** 하나만 둔다.
> - 원문은 "`StudentController.java`를 작성합니다"라고 쓰지만 파일 구조도와 수업 화면은 `StudentApiController`다.

### 프로젝트 준비
강사가 제공한 시작 프로젝트가 있다면 그것을 연다.

| 항목 | 설정 |
|---|---|
| Project | Gradle - Groovy |
| Language | Java |
| Spring Boot | 강사가 제공한 4.2.0 |
| Group | `com.hancoding` |
| Artifact | `student-service` |
| Package name | `com.hancoding.studentservice` |
| Packaging | Jar |
| Java | 21 |
| Dependencies | Spring Web (+ Lombok — 위 2장 보충) |

수업 화면(IntelliJ New Project → Spring Boot): Name `student-service`, Language Java, Type Gradle - Groovy, Group `com.hancoding`, Artifact `student-service`, Package name `com.hancoding.studentservice`, JDK corretto-21, Java 21, Packaging Jar, Configuration Properties.

> 💡 보충: 터미널에서 같은 프로젝트를 받을 때 (강의 밖 방법):
>
> ```bash
> curl -o student-service.zip "https://start.spring.io/starter.zip?type=gradle-project&language=java&bootVersion=4.2.0&groupId=com.hancoding&artifactId=student-service&name=student-service&packageName=com.hancoding.studentservice&packaging=jar&javaVersion=21&configurationFileFormat=properties&dependencies=web,lombok"
> ```
>
> 이렇게 만든 `build.gradle`은 아래 강의 코드와 `description` 줄 하나만 빼고 같았다 (Gradle Wrapper 9.9.2).

**`build.gradle`** — 생성된 기존 플러그인과 Java 설정은 유지하고, `dependencies`에 다음 구성이 있는지 확인한다.

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.2.0'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.hancoding'
version = '0.0.1-SNAPSHOT'
description = 'student-service'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-webmvc'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
    testCompileOnly 'org.projectlombok:lombok'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
    testAnnotationProcessor 'org.projectlombok:lombok'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

**`src/main/resources/application.properties`**

```properties
spring.application.name=student-service
server.port=8080
```

### 파일 구조
원문 구조도 (① 기준):

```text
student-service
└─ src/main
   ├─ java
   │  └─ com/hancoding/studentservice
   │     ├─ StudentServiceApplication.java
   │     ├─ Student.java
   │     ├─ StudentService.java
   │     └─ StudentApiController.java
   │
   └─ resources
      └─ application.properties
```

② 최종 코드 기준:

```text
student-service
└─ src/main
   ├─ java
   │  └─ com/hancoding/studentservice
   │     ├─ StudentServiceApplication.java
   │     ├─ controller
   │     │  └─ StudentApiController.java
   │     ├─ dto
   │     │  └─ Student.java
   │     ├─ repository
   │     │  └─ StudentRepository.java
   │     └─ service
   │        └─ StudentService.java
   │
   └─ resources
      └─ application.properties
```

- 수업 화면(IntelliJ): `com.hancoding.studentservice` 아래 `controller/StudentApiController`, `dto/Student`, 빈 `mapper` 패키지, `service/StudentService`, `StudentServiceApplication` / `resources`에 `static`, `templates`, `application.properties`.

> 💡 보충: 수업 화면에는 `repository` 패키지가 없고 빈 `mapper` 패키지가 있다. `StudentRepository`를 만들기 전에 찍은 화면으로 보인다 (추측). ② 코드는 `com.hancoding.studentservice.repository` 패키지를 쓰므로 `repository` 폴더를 만든다. `static`·`templates`는 Initializr가 만든 빈 폴더라서 이번에는 쓰지 않는다.

### 단계 흐름
1. Gradle - Groovy · Java 21 · **Jar** · Spring Web(+ Lombok)으로 새 프로젝트 생성 → `build.gradle` 확인
2. `application.properties`에 서비스 이름과 포트
3. `dto/Student.java` (필드 3개, 생성자, getter)
4. `repository/StudentRepository.java` (`List.of`로 4명, `findAll`, `findById`)
5. `service/StudentService.java` (Repository에 전달)
6. `controller/StudentApiController.java` (`/students`, `/students/{id}`)
7. 프로젝트 최상위에서 `bootRun` → 로그에서 포트 확인
8. 목록·상세·없는 학생·숫자가 아닌 번호 확인 → Network 확인 → API 계약 정리
9. 서버를 끄고 연결 실패 확인 → 다시 실행

### 최종 코드 (버전 ②, 패키지 `com.hancoding.studentservice`)

**`StudentServiceApplication.java`** (생성된 그대로)

```java
package com.hancoding.studentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentServiceApplication.class, args);
    }
}
```

**`dto/Student.java`**

```java
package com.hancoding.studentservice;

public class Student {

    private Long id;
    private String name;
    private String email;

    public Student(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
```

> 💡 보충: 원문 코드의 첫 줄은 ① 패키지다. ② 구조에서는 첫 줄을 `package com.hancoding.studentservice.dto;`로 바꿔야 다른 파일의 `import com.hancoding.studentservice.dto.Student;`와 맞는다 (위 "노션 원문의 두 버전" 보충). 나머지는 그대로 쓴다.

**`repository/StudentRepository.java`**

```java
package com.hancoding.studentservice.repository;

import com.hancoding.studentservice.dto.Student;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StudentRepository {
    private List<Student> students = List.of(
            new Student(1L, "한코딩", "han@example.com"),
            new Student(2L, "김자바", "java@example.com"),
            new Student(3L, "이리액트", "react@example.com"
            ),
            new Student(4L, "박스프링", "spring@example.com")
    );

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
}
```

> 💡 보충: 3번 학생 줄의 닫는 괄호 `)`가 다음 줄로 내려가 있지만 문법상 문제는 없다 (실행 확인).

**`service/StudentService.java`**

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
}
```

**`controller/StudentApiController.java`**

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
@RequestMapping("/students")
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

    @GetMapping("/")
    public Student findByIdV2(@RequestParam(name = "id") Long id) {
        return service.findById(id);
    }

}
```

> 💡 보충: `import org.springframework.web.bind.annotation.*;`의 `*`은 그 패키지의 애너테이션(`@RestController`, `@RequestMapping`, `@GetMapping`, `@PathVariable`, `@RequestParam`)을 한 번에 가져온다. `findByIdV2`의 동작과 주의점은 핵심 개념 7장 보충.

#### ① 원래 자료의 Controller (비교용, 같은 패키지 구성)
②의 `StudentApiController`와 **함께 두지 않는다** (같은 경로 충돌).

```java
package com.hancoding.studentservice;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<Student> findAll() {
        return studentService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> findById(
            @PathVariable("id") Long id) {

        Student student = studentService.findById(id);

        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(student);
    }
}
```

- ②와 다른 점: 생성자를 직접 쓴다(= `@RequiredArgsConstructor`), `@PathVariable("id")`(= `name = "id"`), `findByIdV2`가 없다. `Student`·`StudentService`가 같은 패키지에 있다고 가정해서 import가 없다.

### 실행하고 확인하기
**① 실행** — 프로젝트 최상위 폴더에서:

```text
.\gradlew.bat bootRun      (Windows PowerShell)
```

```bash
./gradlew bootRun
```

IntelliJ에서 `StudentServiceApplication`의 실행 버튼을 써도 된다. 서버 로그에서 포트를 확인한다. 터미널로 실행했다면 그 터미널을 유지하고, `Ctrl + C`로 종료한다.

```text
학생 서비스 실행
      ↓
8080 포트에서 요청 대기
```

> 💡 보충: 로그에서 볼 줄은 `Tomcat started on port 8080 (http) with context path '/'`다 (다른 포트로 실행해 같은 형식 확인). 원문 이 부분만 "8081 포트"라고 적혀 있는데, `server.port`에 적은 번호가 나오면 정상이다.

**② 학생 목록** — `http://localhost:8080/students`

```json
[
  {
    "id": 1,
    "name": "한코딩",
    "email": "han@example.com"
  },
  {
    "id": 2,
    "name": "김자바",
    "email": "java@example.com"
  },
  {
    "id": 3,
    "name": "이리액트",
    "email": "react@example.com"
  },
  {
    "id": 4,
    "name": "박스프링",
    "email": "spring@example.com"
  }
]
```

확인하기:
- 학생이 네 명인가?
- 전체 결과가 배열 `[]`인가?
- 각 학생이 객체 `{}`인가?
- `id`는 숫자인가?
- 필드 이름이 `id`, `name`, `email`인가?

다른 서비스는 이 구조를 기준으로 데이터를 읽으므로 **필드 이름과 자료형을 일관되게 유지**한다.

**③ 한 명·없는 학생·잘못된 번호** — `http://localhost:8080/students/3`, `/students/999`, `/students/abc`를 차례로 열고 Network에서 상태 코드를 본다 (핵심 개념 8·9장 표).

**④ 독립 실행** — 핵심 개념 11장 순서대로 끄고 다시 요청해 연결 실패를 확인한 뒤 다시 켠다.

### 문제가 발생하면

| 증상 | 확인할 내용 |
|---|---|
| 연결 실패 | 서버 실행 상태, 주소, 포트 |
| `/`에서 404 | 루트 API를 만들지 않았으므로 `/students`로 접속 |
| `/students`에서 404 | Controller의 경로와 패키지 |
| 학생 이름이 JSON에 없음 | `Student` Getter와 실제 반환 객체 |
| `/students/3`에서 404 | 실습 데이터에 3번 학생이 있는지 |
| `/students/abc`에서 400 | 숫자가 아닌 번호를 전달했는지 |
| DB 설정 오류로 실행 실패 | 실수로 JPA·JDBC 의존성을 추가했는지 |

- `spring.application.name=student-service`는 서비스 이름 설정이다. **이것만으로 다른 서비스가 `student-service`라는 호스트 이름에 자동 접속할 수 있는 것은 아니다.** 이번 로컬 실습의 실제 접속 주소는 `http://localhost:8080`이다.

> 💡 보충: 실행해 보며 만난 오류 (원문 표에 없음)
>
> | 증상 | 원인 → 해결 |
> |---|---|
> | `package com.hancoding.studentservice.dto does not exist` | `Student.java`의 `package` 줄이 ① 그대로 → `dto` 폴더 + `package …dto;` |
> | `cannot find symbol` (`Student`, `StudentService`) | ① `StudentController`를 ② 구조에 넣음 → ① Controller를 지운다 |
> | `Ambiguous mapping … There is already 'studentController' bean method` | Controller 두 개가 같은 경로 → 하나만 남긴다 |
> | `Web server failed to start. Port 8080 was already in use.` | 다른 Spring 프로젝트가 8080에서 실행 중 → 그 서버를 끄거나 포트를 바꾼다 |
> | `package lombok does not exist`, `cannot find symbol` (`RequiredArgsConstructor`) | Lombok 의존성이 없음 → `build.gradle`의 lombok 네 줄 확인 |

## 헷갈리기 쉬운 점
- **포트만 다르게 한다고 MSA가 아니다.** 서비스의 책임(학생 데이터 소유)과 실행·배포 경계가 함께 나뉘어야 한다.
- **`spring.application.name`은 이름일 뿐**이다. 다른 서비스는 `http://localhost:8080`처럼 실제 주소로 접속한다.
- **목록은 배열 `[]`, 한 명은 객체 `{}`.** 상세 응답은 배열로 감싸지 않는다.
- **`404`(학생 없음) ≠ 연결 실패.** 404는 서버가 응답한 것이고, 연결 실패는 응답 자체가 없다. 서버를 끈 뒤에는 새로 요청해서 확인한다.
- **`404`(유효한 숫자, 대상 없음) ≠ `400`(번호 형식이 잘못됨).** `abc`는 `Long`으로 바꿀 수 없어서 Spring이 Controller 메서드를 부르기 전에 400을 응답한다.
- **이번 404는 본문이 없다.** 호출하는 쪽(Express)은 상태 코드를 먼저 확인하고 JSON 파싱 여부를 정한다.
- **`Long` 비교는 `equals()`.** 객체 타입이라 `==`는 같은 객체인지를 비교한다.
- **`List.of()`는 수정할 수 없는 목록**이다. 이번에는 조회 전용이라 괜찮다.
- **브라우저가 자체 오류 화면을 보여 줄 수 있다.** 실제 상태 코드는 Network에서 본다.
- **API 계약을 바꾸면 쓰는 서비스가 영향을 받는다.** 필드 이름·자료형·응답 형태를 함부로 바꾸지 않는다.
- **JSP·Thymeleaf·JPA·MyBatis·DB 드라이버는 넣지 않는다.** JPA·JDBC가 들어가면 DB 설정이 없어 실행이 실패한다.

> 💡 보충:
> - 원문 코드에 ①·② 버전이 섞여 있다. `Student`의 `package` 줄을 `dto`로 고치고, Controller는 `StudentApiController` 하나만 둔다.
> - `/students/`와 `/students`는 다른 주소다 (Spring Boot 3부터). `findByIdV2`는 `/students/?id=…`에만 연결되고, 없는 학생이어도 **200 + 빈 본문**이라 이번 API 계약에는 쓰지 않는다.
> - 이전 Spring 프로젝트를 8080에 켜 둔 채로 실행하면 포트 충돌로 시작하지 않는다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 서비스 이름 정하기 | `spring.application.name` | `spring.application.name=student-service` |
| 포트 정하기 | `server.port` | `server.port=8080` |
| 한 번만 다른 포트로 실행 (강의 밖) | `--args` | `./gradlew bootRun --args='--server.port=8081'` |
| 수정할 수 없는 고정 목록 | `List.of(...)` | `List.of(new Student(1L, "한코딩", "han@example.com"), …)` |
| `Long` 값 비교 | `equals()` | `student.getId().equals(id)` |
| 공통 경로 | `@RequestMapping` | `@RequestMapping("/students")` |
| 경로 값 받기 | `@PathVariable` | `@GetMapping("/{id}")` + `@PathVariable(name = "id") Long id` |
| 쿼리 스트링 값 받기 | `@RequestParam` | `@RequestParam(name = "id") Long id` ← `?id=3` |
| 200 + 본문 | `ResponseEntity.ok` | `return ResponseEntity.ok(student);` |
| 본문 없는 404 | `ResponseEntity.notFound` | `return ResponseEntity.notFound().build();` |
| `final` 필드 생성자 주입 (Lombok) | `@RequiredArgsConstructor` | `private final StudentService service;` |
| 상태 코드·헤더까지 보기 (강의 밖) | `curl -i` | `curl -i http://localhost:8080/students/999` |
| 실행 | `bootRun` | `./gradlew bootRun` (Windows `.\gradlew.bat bootRun`) |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목·확인하기 목록·확인 순서에서 뽑았다.

<details><summary>Q. 학생 서비스가 관리하는 데이터는? 공지 제목과 내용은 왜 여기서 관리하지 않는가?</summary>

학생 번호(`id`), 이름(`name`), 이메일(`email`)만 관리한다. 공지 제목·내용은 공지 서비스의 책임(소유 데이터)이기 때문이다. 공지 서비스는 학생 정보가 필요하면 학생 서비스의 API를 호출한다.
</details>

<details><summary>Q. (강의 질문) 왜 서비스마다 포트를 다르게 사용할까? 포트를 다르게 하면 MSA가 되는가?</summary>

같은 컴퓨터에서 React(5173), Express(3000), Spring(8080)을 동시에 실행할 예정이라 포트가 겹치면 안 되기 때문이다. 하지만 포트 번호만 다르게 정했다고 MSA가 되지는 않는다. 서비스의 책임과 실행·배포 경계가 함께 나뉘어야 한다.
</details>

<details><summary>Q. `spring.application.name=student-service`를 적으면 다른 서비스가 `http://student-service`로 접속할 수 있는가?</summary>

아니다. 애플리케이션 이름 설정일 뿐이다. 이번 로컬 실습에서 실제 접속 주소는 `http://localhost:8080`이다.
</details>

<details><summary>Q. 이번 프로젝트는 왜 Jar로 만들고, 어떤 의존성은 넣지 않는가?</summary>

JSP를 쓰지 않으므로 Jar 패키징을 쓴다. Spring Web만 있으면 Controller가 반환한 객체를 JSON으로 바꿔 응답할 수 있다. JSP·Thymeleaf·JPA·MyBatis·DB 드라이버는 넣지 않는다 (JPA·JDBC가 들어가면 DB 설정이 없어 실행이 실패한다). ② 코드는 Lombok을 쓰므로 Lombok은 필요하다.
</details>

<details><summary>Q. `new Student(3L, …)`의 `L`은 무엇이고, `findById`에서 왜 `==` 대신 `equals()`로 비교하는가?</summary>

`L`은 long 타입 숫자라는 표시다 (`Long` 매개변수에 `3`을 넣으면 컴파일 오류). `Long`은 객체 타입이라 `==`는 같은 객체인지를 비교한다. 값이 같은지 보려면 `equals()`를 쓴다.
</details>

<details><summary>Q. `List.of()`로 만든 목록의 특징과, 이번 실습에서 써도 되는 이유는?</summary>

수정할 수 없는 목록이다. 이번에는 조회 전용 데이터이고 추가·수정·삭제 API를 만들지 않으므로 적절하다. 서버를 다시 실행해도 같은 네 명이 준비된다.
</details>

<details><summary>Q. `@PathVariable`과 `@RequestParam`은 각각 주소의 어디에서 값을 받는가?</summary>

`@PathVariable`은 경로 자체(`/students/3`의 `3`)에서, `@RequestParam`은 쿼리 스트링(`/students/?id=3`의 `id=3`)에서 받는다.
</details>

<details><summary>Q. `ResponseEntity.ok(student)`와 `ResponseEntity.notFound().build()`의 응답은? 왜 없는 학생을 `null`(200)로 보내지 않는가?</summary>

`ok(student)` → `200 OK` + 학생 JSON, `notFound().build()` → `404 Not Found` + 본문 없음. 없는 학생을 정상 조회처럼 응답하면 호출하는 서비스가 "학생 있음"과 "학생 없음"을 구분할 수 없다. 상태 코드로 구분한다.
</details>

<details><summary>Q. (확인하기) `http://localhost:8080/students` 응답에서 확인할 다섯 가지는?</summary>

학생이 네 명인가, 전체 결과가 배열 `[]`인가, 각 학생이 객체 `{}`인가, `id`는 숫자인가, 필드 이름이 `id`·`name`·`email`인가. 다른 서비스가 이 구조를 기준으로 읽기 때문이다.
</details>

<details><summary>Q. `/students/3`, `/students/999`, `/students/abc`의 상태 코드와 의미는?</summary>

`/students/3` → 200 (존재하는 학생, 객체 하나). `/students/999` → 404 (유효한 숫자지만 대상 없음, 본문 없음). `/students/abc` → 400 (`Long`으로 바꿀 수 없는 번호 형식).
</details>

<details><summary>Q. `/students/999`를 브라우저로 열면 오류 안내가 보일 수 있다. 실제 상태 코드는 어디서 확인하고, Express는 이 응답을 어떻게 다뤄야 하는가?</summary>

개발자 도구 Network에서 Status Code(404)를 확인한다. 404 응답은 본문이 없으므로, 호출하는 Express는 상태 코드를 먼저 확인한 뒤 JSON 파싱 여부를 결정해야 한다.
</details>

<details><summary>Q. (독립 실행 확인) 학생 서비스를 끄고 `/students/3`에 다시 요청하면 404가 나오는가?</summary>

아니다. 404는 서버가 연결되어 "학생 없음"이라고 응답한 것이고, 서버를 끄면 응답 자체를 받지 못하는 **연결 실패**가 된다. 이전 화면이 남아 있으면 새로 요청해서 확인한다. 다시 실행하면 같은 네 명으로 다시 응답한다.
</details>

<details><summary>Q. 공지 서비스가 학생 API를 쓰려면 무엇을 알아야 하는가? 학생 서비스의 Java 클래스도 알아야 하는가?</summary>

API 계약만 알면 된다: `GET /students`(200 + 배열), `GET /students/{id}`(200 + 객체, 없으면 404 본문 없음, 형식 오류 400), 학생 객체의 필드 `id`(숫자)·`name`(문자열)·`email`(문자열). 내부 Java 클래스나 목록 저장 방식은 몰라도 된다. 대신 필드 이름이나 응답 형태를 바꾸면 쓰는 서비스에 영향이 간다.
</details>

<details><summary>Q. `/`에 접속했더니 404가 나왔다. 서버가 잘못된 것인가?</summary>

아니다. 루트(`/`) API를 만들지 않았기 때문이다. `/students`로 접속한다.
</details>

## 완료 체크
- [ ] 별도의 학생 서비스 프로젝트를 만들었다.
- [ ] 8080 포트로 실행했다.
- [ ] 학생 네 명의 가상 데이터를 준비했다.
- [ ] 전체 학생을 JSON 배열로 조회했다.
- [ ] 학생 한 명을 JSON 객체로 조회했다.
- [ ] 없는 학생 조회에서 `404`를 확인했다.
- [ ] 숫자가 아닌 번호에서 `400`을 확인했다.
- [ ] `404`와 연결 실패를 구분했다.
- [ ] 다른 서비스가 사용할 API 계약을 정리했다.
- [ ] 서버를 종료하고 다시 실행해 독립 동작을 확인했다.

## 질문 노트

_아직 없음_
