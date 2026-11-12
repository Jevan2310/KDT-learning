# 03. Thymeleaf로 학생 목록 화면 만들기 — 서버에서 HTML 만들기

> 과정: Spring과정 · [노션 원문](https://app.notion.com/p/414848f71c9b80f6bc0eca3109a1a011) · 최종 갱신일: 2026-11-12

## 한눈에 보기
- **Thymeleaf** = 서버에서 **데이터 + 템플릿(HTML)** 을 합쳐 완성된 HTML을 만드는 템플릿 엔진 (SSR). 브라우저는 완성된 HTML만 받는다.
- **`@Controller`** 메서드가 `return "students";`하면 글자가 아니라 **`templates/students.html`을 찾아** 화면으로 응답한다 (`@RestController`는 글자 그대로).
- 컨트롤러 메서드에 **`Model`** 을 받아 `model.addAttribute("이름", 값)`으로 데이터를 넣고, HTML에서 **`${이름}`** 으로 읽는다.
- `th:text`(값 표시), `th:each`(목록 반복), `th:if`/`th:unless`(조건 표시), `#lists.isEmpty`/`#lists.size`(목록 검사), `@{...}`(URL)로 학생 목록 표를 만든다.
- CSS는 `static/css/students.css`에 두고 `/css/students.css`로 연결한다. 학생 목록은 아직 **요청마다 새로 만드는 메모리 데이터**다.

> 💡 보충: 이 회차 코드는 패키지가 `com.hancoding.student`로, 폴더 구조·수업 화면은 `com.example.kdt`로 되어 있다. 내 프로젝트 패키지에 맞춰 `package`·`import` 줄을 고친다 ([02_SpringBoot시작](02_SpringBoot시작.md) 맨 앞 참고).

## 학습 목표
- Thymeleaf가 하는 일을 이해한다.
- `@Controller`와 `@RestController`를 구분한다.
- `Model`로 데이터를 화면에 전달한다.
- `th:text`로 값을 표시한다.
- `th:each`로 목록을 반복한다.
- `th:if`로 조건에 따라 내용을 표시한다.

## 핵심 개념

### 1. 문자열 대신 HTML 화면을 보여주려면?
[02](02_SpringBoot시작.md)에서는 컨트롤러가 문자열을 응답했다. 수업에서는 먼저 `HelloController`를 `@Controller`로 바꿔 `templates/hello.html`을 응답해 봤다.

```java
package com.example.kdt.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller // 메소드가 반환하는 문자열과 동일한 이름의 html을 반환해 주겠다
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}

```

수업 화면의 `src/main/resources/templates/hello.html` (화면에서 옮김):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>학생 목록</title>
</head>
<body>
<h1>학생 목록</h1>
</body>
</html>
```

이번에는 제목·표·안내 문구가 있는 **학생 목록 HTML 화면**을 응답한다.

```text
브라우저에서 학생 목록 요청
        ↓
컨트롤러에서 학생 데이터 준비
        ↓
HTML 템플릿에 데이터 적용
        ↓
완성된 HTML을 브라우저에 응답
```

> 💡 보충: 어노테이션은 **클래스 전체**에 붙는다. `HelloController`를 `@Controller`로 바꾸면 02에서 만든 `/school` 메서드의 반환값 `"한코딩 스쿨입니다."`도 템플릿 이름으로 찾게 되어 오류가 난다. 글자 응답과 화면 응답은 컨트롤러 클래스를 나눠 두는 게 안전하다.

### 2. Thymeleaf란?
**서버에서 데이터와 템플릿을 결합해 HTML을 만드는 템플릿 엔진**이다. HTML에 데이터를 표시할 위치와 반복할 부분을 쓰면, 서버에서 처리해 결과를 만든다 **(SSR)**. 👉 [Spring 공식 Thymeleaf 시작 안내](https://spring.io/guides/gs/serving-web-content)

| 구성 | 역할 |
|---|---|
| 컨트롤러 | 요청을 받고 데이터와 화면을 연결 |
| Model | 화면에 전달할 데이터를 담는 객체 |
| Thymeleaf 템플릿 | 데이터를 표시할 HTML 구조 |
| 브라우저 | 서버가 완성해 보낸 HTML 표시 |

- React는 **브라우저에서** 데이터를 이용해 화면을 구성했다. 이번에는 **서버에서 HTML을 만든 뒤** 브라우저에 전달한다.

> 💡 보충: SSR(Server-Side Rendering) = 서버에서 화면(HTML)을 완성해서 보내는 방식. React처럼 브라우저의 JavaScript가 화면을 만드는 방식은 CSR(Client-Side Rendering)이라고 한다. 이 과정 07장에서 두 방식을 비교한다.

### 3. `@Controller`와 `@RestController`

| 어노테이션 | 이번 예제에서 문자열 반환의 의미 |
|---|---|
| `@RestController` | 문자열 자체를 응답 본문으로 전달 |
| `@Controller` | 화면을 찾을 **뷰(View) 이름**으로 사용 |

```java
return "students";
```

- `"students"`라는 글자를 응답하는 것이 아니다. 기본 Thymeleaf 설정에 따라 **`src/main/resources/templates/students.html`** 을 찾아 처리한다.
- **반환할 때 `.html` 확장자를 붙이지 않는다.**
- 템플릿에는 `th:` 속성을 쓰기 위한 선언을 넣는다: `<html lang="ko" xmlns:th="http://www.thymeleaf.org">`
- HTML 파일을 더블클릭하지 않고 **서버 주소(`http://localhost:8080/students`)로 접속**한다.

### 4. `Model`로 데이터 전달하기
`Model`은 컨트롤러에서 **화면에 전달할 데이터를 담는 객체**다. 요청을 처리할 때 Spring이 메서드 매개변수로 넣어 준다.

```java
model.addAttribute("schoolName", "한코딩 스쿨");
```

| 부분 | 의미 |
|---|---|
| `"schoolName"` | 템플릿에서 사용할 데이터 이름 |
| `"한코딩 스쿨"` | 전달할 값 |

- `Model`에 넣었다고 **데이터베이스에 저장되는 것은 아니다.** 이번 요청의 화면을 만드는 데 쓸 데이터를 전달할 뿐이다.

**같은 이름이 두 번 나오는 이유**

```java
model.addAttribute("students", students);
```

| 부분 | 의미 |
|---|---|
| `"students"` | 템플릿에서 사용할 이름 |
| `students` | Java의 학생 목록 변수 |

- 이름을 맞추면 읽기 쉽지만 **반드시 같을 필요는 없다.** `model.addAttribute("studentList", students);`라면 HTML에서는 `${studentList}`로 읽는다.

### 5. `th:text` — 값 표시

```html
<h1 th:text="${schoolName}">학교 이름</h1>
```

- `${schoolName}`: Model에서 전달한 값 읽기
- `th:text`: 해당 요소의 텍스트 내용을 값으로 설정
- 서버에서 처리하면 `<h1>한코딩 스쿨</h1>`이 된다. 원래 쓴 `학교 이름`은 **전달된 값으로 바뀐다** (HTML 파일을 직접 열었을 때만 보이는 예시 문구).

### 6. 학생 클래스 — `model` 패키지
[01_Java기초](01_Java기초.md)의 학생 구조를 Spring 프로젝트의 `model` 패키지에 추가한다.

- 필드는 `private`, getter로 읽는다 (캡슐화).
- 아직 **DB 테이블과 연결하지 않은 일반 Java 클래스**다.
- **`model` 패키지 이름과 Spring의 `Model` 객체는 서로 다른 것**이다.

### 7. `th:each` — 목록 반복
React에서 배열을 `map()`으로 표시했다면, Thymeleaf에서는 **`th:each`** 로 반복한다.

```html
<li th:each="student : ${students}"
    th:text="${student.name}">
    학생 이름
</li>
```

| 부분 | 의미 |
|---|---|
| `${students}` | Model에서 받은 전체 목록 |
| `student` | 이번 반복에서 사용할 학생 한 명의 이름 |
| `th:each` | 해당 요소를 목록의 항목 수만큼 반복 |
| `${student.name}` | 현재 학생의 이름 |

- `${student.name}`은 Java 객체의 **`getName()`** 을 통해 이름을 읽는다. `${student.learning}`은 **`isLearning()`** 을 통해 읽는다.
- `th:each`를 **`tr`에 쓰면 학생 한 명마다 한 행**이 만들어진다.

### 8. `th:if` / `th:unless` — 조건 표시

| 속성 | 역할 |
|---|---|
| `th:if` | 조건이 참일 때 요소 표시 |
| `th:unless` | 조건이 거짓일 때 요소 표시 |

```html
<td>
    <span th:if="${student.learning}">학습 중</span>
    <span th:unless="${student.learning}">학습 예정</span>
</td>
```

**학생이 없을 때 안내하기** — `#lists.isEmpty(students)`는 Thymeleaf가 제공하는 목록 검사 기능이다.

```html
<p th:if="${#lists.isEmpty(students)}">
    등록된 학생이 없습니다.
</p>
```

```html
<table th:unless="${#lists.isEmpty(students)}">
    <!-- 기존 표 내용 -->
</table>
```

- 빈 목록 안내와 표 중 **필요한 요소만** 표시한다. 👉 [Thymeleaf 공식 문법 안내](https://www.thymeleaf.org/doc/tutorials/3.1/usingthymeleaf)
- `#lists.size(students)`는 목록의 항목 수를 구한다.

> 💡 보충: React와 비교 ([06_목록-조건부렌더링](../01_React과정/06_목록-조건부렌더링.md))
>
> | 하고 싶은 것 | React (JSX, 브라우저에서) | Thymeleaf (서버에서) |
> |---|---|---|
> | 값 표시 | `<h1>{schoolName}</h1>` | `<h1 th:text="${schoolName}">학교 이름</h1>` |
> | 목록 반복 | `students.map(s => <li key={s.id}>{s.name}</li>)` | `<li th:each="student : ${students}" th:text="${student.name}">` |
> | 조건 표시 | `{learning && <span>학습 중</span>}` | `<span th:if="${student.learning}">학습 중</span>` |
> | 빈 목록 검사 | `students.length === 0` | `${#lists.isEmpty(students)}` |
>
> Thymeleaf는 `key`가 필요 없다. 화면을 다시 그리지 않고 서버가 HTML을 한 번 만들어 보내기 때문이다.

### 9. CSS 연결 — `static`과 `@{...}`

```html
<link rel="stylesheet" th:href="@{/css/students.css}">
```

- `@{...}`는 Thymeleaf에서 **URL을 만드는 표현식**이다.
- 기본 설정에서 `src/main/resources/static/css/students.css`는 **`/css/students.css`** 경로로 제공된다. **주소에 `static`을 넣지 않는다.**

### 10. 브라우저는 무엇을 받았을까?
서버가 템플릿을 처리해서 결과 HTML만 보낸다.

```html
<td th:text="${student.name}">학생 이름</td>
```

```html
<td>한코딩</td>
```

- **브라우저가 Java 코드를 실행하거나 Thymeleaf 표현식을 계산하는 것이 아니다.** 마우스 오른쪽 버튼 → **페이지 소스 보기**로 확인한다.
- 이번 컨트롤러는 **요청마다** `new ArrayList<>()`로 목록을 새로 만든다. 화면 표시 연습용 데이터이며, 등록이나 영구 저장 기능은 없다 (→ [04_폼-학생등록](04_폼-학생등록.md)).

### 정리

| 개념 | 핵심 |
|---|---|
| Thymeleaf | 서버에서 데이터와 템플릿으로 HTML 생성 |
| `@Controller` | 이번 예제에서 HTML 화면 연결 |
| `Model` | 화면에 전달할 데이터 보관 |
| `addAttribute()` | 이름과 값으로 데이터 전달 |
| `th:text` | 요소의 텍스트 설정 |
| `th:each` | 목록 반복 |
| `th:if`·`th:unless` | 조건에 따라 요소 표시 |
| `@{...}` | URL 표현식 |

## 실습 정리

### 만든 것
`GET /students` 요청에 학교 이름·안내 문구·전체 학생 수·학생 목록 표(번호·이름·학습 상태)를 보여주는 HTML 화면. 학생이 없으면 안내 문구를 보여준다.

### 의존성과 파일 위치
프로젝트 생성 때 Thymeleaf를 추가했는지 확인한다. **이미 있으면 중복으로 추가하지 않는다.** 없으면 추가하고 IntelliJ에서 다시 빌드한다.

`pom.xml` (Maven)의 `<dependencies>` 안:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

또는 `build.gradle` (Gradle)의 `dependencies` 안:

```groovy
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
```

> 💡 보충: `build.gradle`을 고친 뒤에는 IntelliJ 오른쪽 위에 뜨는 코끼리 모양 **Load Gradle Changes** 버튼(또는 Gradle 창의 새로고침)을 눌러야 의존성이 내려받아진다.

이번에 추가할 파일:

```text
src/main
├─ java/com/example/kdt/
│  ├─ KdtApplication.java
│  ├─ controller/
│  │  ├─ HelloController.java
│  │  └─ StudentController.java
│  └─ model/
│     └─ Student.java
└─ resources/
   ├─ static/   -> 정적
   │  └─ css/
   │     └─ students.css
   ├─ templates/
   │  └─ students.html
   └─ application.properties
```

- 수업 화면(IntelliJ)도 같은 구조다: `controller`(HelloController, StudentController), `model`(Student), `KdtApplication`, `static/css/students.css`, `templates/students.html`, `application.properties`. 기존 `HelloController`는 유지한다.

> 💡 보충: 수업 화면에는 `static/css`가 **`static.css`** 한 줄로 보인다. IntelliJ가 하위 폴더가 하나뿐인 폴더를 합쳐 보여주는 것이다. 폴더 이름을 `static.css`로 만들면 안 되고, `static` 안에 `css` 폴더를 만든다.

### 단계 흐름
1. `StudentController`(`@Controller`, `/students` → `"students"`) + 빈 `students.html`로 **화면 연결부터** 확인
2. `Model`로 `schoolName`, `message` 전달 → `th:text`로 표시
3. `model/Student.java` 추가 → 컨트롤러에서 학생 3명 목록을 만들어 `students`로 전달
4. `th:each`로 `ul`/`li` 목록 → `table`의 `tr` 반복으로 교체
5. `th:if`/`th:unless`로 학습 상태 문구, `#lists.isEmpty`로 빈 목록 안내
6. `static/css/students.css` 작성, `@{/css/students.css}`로 연결 → 완성

#### 1단계 코드 — 화면 연결만

```java
package com.hancoding.student.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StudentController {

    @GetMapping("/students")
    public String students() {
        return "students";
    }
}
```

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>학생 목록</title>
</head>
<body>
    <h1>학생 목록</h1>
    <p>Thymeleaf 화면 연결에 성공했습니다.</p>
</body>
</html>
```

#### 2단계 코드 — Model로 값 전달

```java
package com.hancoding.student.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StudentController {

    @GetMapping("/students")
    public String students(Model model) {
        model.addAttribute("schoolName", "한코딩 스쿨");

        return "students";
    }
}
```

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>학생 목록</title>
</head>
<body>
<h1 th:text="${schoolName}">학교 이름</h1>
<p>Thymeleaf 화면 연결에 성공했습니다.</p>
</body>
</html>
```

안내 문구도 추가한다.

```java
model.addAttribute("schoolName", "한코딩 스쿨");
model.addAttribute("message", "함께 공부하는 학생들을 소개합니다.");
```

```html
<h1 th:text="${schoolName}">학교 이름</h1>
<p th:text="${message}">안내 문구</p>
```

#### 4단계 코드 — `ul` 목록 → 표

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>학생 목록</title>
</head>
<body>
<h1 th:text="${schoolName}">학교 이름</h1>
<p th:text="${message}">Thymeleaf 화면 연결에 성공했습니다.</p>

<ul>
    <li th:each="student : ${students}" th:text="${student.name}"></li>
</ul>

</body>
</html>
```

예상 결과:

```text
한코딩
이학생
박학생
```

`ul`을 표로 교체한다.

| 태그 | 역할 |
|---|---|
| `table` | 표 |
| `thead` | 표의 머리 영역 |
| `tbody` | 실제 데이터 영역 |
| `tr` | 한 행 |
| `th` | 제목 셀 |
| `td` | 데이터 셀 |

```html
<table>
    <thead>
    <tr>
        <th scope="col">번호</th>
        <th scope="col">이름</th>
        <th scope="col">상태</th>
    </tr>
    </thead>

    <tbody>
    <tr th:each="student : ${students}">
        <td th:text="${student.id}">1</td>
        <td th:text="${student.name}">한코딩</td>
        <td th:text="${student.learning}">true</td>
    </tr>
    </tbody>
</table>
```

- `scope="col"`은 그 제목 셀이 **열의 제목**임을 나타낸다.
- 이 단계에서는 상태 칸에 `true`/`false`가 그대로 나온다 → 5단계에서 `th:if`/`th:unless`로 "학습 중"/"학습 예정"으로 바꾼다.

### 최종 코드

**`model/Student.java`**

```java
package com.hancoding.student.model;

public class Student {
    private int id;
    private String name;
    private boolean learning;

    public Student(int id, String name, boolean learning) {
        this.id = id;
        this.name = name;
        this.learning = learning;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isLearning() {
        return learning;
    }
}
```

**`controller/StudentController.java`**

```java
package com.hancoding.student.controller;

import com.hancoding.student.model.Student;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;

@Controller
public class StudentController {

    @GetMapping("/students")
    public String students(Model model) {
        List<Student> students = new ArrayList<>();

        students.add(new Student(1, "한코딩", true));
        students.add(new Student(2, "이학생", false));
        students.add(new Student(3, "박학생", true));

        model.addAttribute("schoolName", "한코딩 스쿨");
        model.addAttribute("message", "함께 공부하는 학생들을 소개합니다.");
        model.addAttribute("students", students);

        return "students";
    }
}
```

**`templates/students.html`**

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>학생 목록</title>

    <link rel="stylesheet" th:href="@{/css/students.css}">
</head>
<body>
<main class="container">
    <h1 th:text="${schoolName}">학교 이름</h1>

    <p th:text="${message}">안내 문구</p>

    <p>
        전체 학생:
        <strong th:text="${#lists.size(students)}">0</strong>명
    </p>

    <p th:if="${#lists.isEmpty(students)}">
        등록된 학생이 없습니다.
    </p>

    <table th:unless="${#lists.isEmpty(students)}">
        <thead>
        <tr>
            <th scope="col">번호</th>
            <th scope="col">이름</th>
            <th scope="col">상태</th>
        </tr>
        </thead>

        <tbody>
        <tr th:each="student : ${students}">
            <td th:text="${student.id}">1</td>

            <td th:text="${student.name}">한코딩</td>

            <td>
                <span class="learning"
                      th:if="${student.learning}">
                    학습 중
                </span>

                <span class="waiting"
                      th:unless="${student.learning}">
                    학습 예정
                </span>
            </td>
        </tr>
        </tbody>
    </table>
</main>
</body>
</html>
```

**`static/css/students.css`**

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

.container {
    max-width: 720px;
    margin: 24px auto;
    padding: 32px;
    background-color: white;
    border-radius: 16px;
}

h1 {
    color: #2563eb;
}

table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
}

th,
td {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
}

th {
    background-color: #f8fafc;
}

.learning {
    color: #166534;
}

.waiting {
    color: #64748b;
}
```

서버를 실행하고 `http://localhost:8080/students`에 접속한다.

> 💡 보충: 화면 결과 (강의에 결과 이미지가 없어 코드대로 정리) — 흰 카드 안에 파란 제목 "한코딩 스쿨", 안내 문구, "전체 학생: **3**명", 그리고 표 3행: `1 | 한코딩 | 학습 중(초록)`, `2 | 이학생 | 학습 예정(회색)`, `3 | 박학생 | 학습 중(초록)`.

### 직접 바꿔보기·확인하기 (미션)
- [ ] 페이지 제목과 설명 문장을 바꾼다 (반영 안 되면 서버 재시작 + 새로고침).
- [ ] 컨트롤러의 학교 이름과 안내 문구를 바꿔, **HTML을 고치지 않고도** 화면이 바뀌는지 확인한다.
- [ ] 컨트롤러 목록에 학생을 추가해, HTML에 `li`/`tr`을 직접 추가하지 않아도 새 학생이 표시되는지 확인한다.
- [ ] 특정 학생의 학습 여부를 바꿔 상태 문구가 달라지는지 확인한다.
- [ ] `students.add(...)` 세 줄을 잠시 주석 처리해 빈 목록 안내를 확인한 뒤 복원한다.
  ```java
  List<Student> students = new ArrayList<>();

  // students.add(new Student(1, "한코딩", true));
  // students.add(new Student(2, "이학생", false));
  // students.add(new Student(3, "박학생", true));
  ```
- [ ] 페이지의 색상과 여백, 빈 목록 안내 문구를 바꾼다.
- [ ] 페이지 소스 보기로 브라우저가 받은 HTML에 `th:` 속성이 없는지 확인한다.

## 헷갈리기 쉬운 점
- **`@Controller`의 `return "students"`는 글자가 아니라 템플릿 이름이다.** `students`라는 글자만 보이면 `@RestController`로 되어 있는 것이다.
- **반환값에 `.html`을 붙이지 않는다.** `templates/students.html` ↔ `return "students";`
- **`addAttribute`의 이름 = 템플릿의 `${이름}`.** 다르면 값이 비어 보인다.
- **`${student.name}`은 필드를 직접 읽는 게 아니라 getter(`getName()`)를 부른다.** 불리언은 `isLearning()`. getter가 없으면 오류가 난다.
- **`model` 패키지 ≠ Spring의 `Model` 객체.**
- **Model에 넣는다고 DB에 저장되지 않는다.**
- **`th:each`를 어느 태그에 쓰느냐에 따라 반복 단위가 바뀐다.** `tr`에 쓰면 학생마다 한 행.
- **CSS 경로에 `static`을 넣지 않는다.** `@{/css/students.css}` (⭕) / `/static/css/students.css` (❌)
- **HTML 파일을 더블클릭해 열면 예시 문구(`학교 이름`)만 보인다.** 반드시 서버 주소로 접속한다.
- **브라우저는 Thymeleaf를 계산하지 않는다.** 서버가 완성한 HTML만 받는다.
- **같은 GET `/students`를 처리하는 메서드를 중복으로 만들지 않는다.**
- **지금 학생 목록은 요청마다 새로 만들어진다.** 등록·영구 저장 기능은 없다.

**화면이 나오지 않을 때 확인할 것**

| 증상 | 확인할 내용 |
|---|---|
| `students`라는 글자만 표시됨 | `@RestController` 대신 `@Controller`인지 |
| 템플릿을 찾지 못함 | `templates/students.html` 위치와 반환 이름 |
| 요청 시 404 | `/students` 매핑·패키지 위치·서버 재시작 |
| 데이터가 비어 보임 | `addAttribute` 이름과 `${...}` 일치 여부 |
| 객체 속성 접근 오류 | getter 이름과 템플릿 속성 이름 |
| CSS가 적용되지 않음 | `static/css` 위치와 `/css/students.css` 경로 |
| 예시 문구만 보임 | HTML 파일을 직접 열지 않고 서버 주소로 접속했는지 |
| 템플릿 처리 중 500 오류 | 서버 콘솔의 오류 위치와 Thymeleaf 문법 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| HTML 화면 응답 | `@Controller` + 템플릿 이름 반환 | `return "students";` → `templates/students.html` |
| th 속성 쓰기 선언 | `xmlns:th` | `<html lang="ko" xmlns:th="http://www.thymeleaf.org">` |
| 화면에 데이터 넘기기 | `Model` 매개변수 + `addAttribute` | `model.addAttribute("schoolName", "한코딩 스쿨");` |
| 값 표시 | `th:text` + `${}` | `<h1 th:text="${schoolName}">학교 이름</h1>` |
| 객체 속성 표시 | `${객체.속성}` (getter 호출) | `${student.name}` |
| 목록 반복 | `th:each` | `<tr th:each="student : ${students}">` |
| 참일 때 표시 | `th:if` | `<span th:if="${student.learning}">학습 중</span>` |
| 거짓일 때 표시 | `th:unless` | `<span th:unless="${student.learning}">학습 예정</span>` |
| 목록이 비었는지 | `#lists.isEmpty()` | `th:if="${#lists.isEmpty(students)}"` |
| 목록 개수 | `#lists.size()` | `th:text="${#lists.size(students)}"` |
| URL 만들기 | `@{...}` | `th:href="@{/css/students.css}"` |
| 정적 파일 위치 | `static/` (주소에는 안 씀) | `static/css/students.css` → `/css/students.css` |
| 표 제목 셀 | `th scope="col"` | `<th scope="col">이름</th>` |

## 확인 문제

<details><summary>Q. Thymeleaf는 무엇이고, React와 화면을 만드는 위치가 어떻게 다른가?</summary>

서버에서 **데이터와 템플릿을 결합해 HTML을 만드는 템플릿 엔진**이다 (SSR). React는 **브라우저에서** 데이터로 화면을 구성하고, Thymeleaf는 **서버에서** HTML을 완성해 브라우저에 보낸다.
</details>

<details><summary>Q. `@Controller`와 `@RestController`에서 `return "students";`는 각각 무엇을 응답하는가?</summary>

`@RestController`: **"students" 글자 자체**를 응답 본문으로. `@Controller`: `"students"`를 **뷰 이름**으로 써서 `src/main/resources/templates/students.html`을 처리해 응답한다. 반환값에 `.html`은 붙이지 않는다.
</details>

<details><summary>Q. Model은 무엇인가? Model에 넣으면 데이터가 저장되는가?</summary>

컨트롤러에서 **화면에 전달할 데이터를 담는 객체**다 (요청 처리 시 Spring이 메서드에 전달). DB에 저장되는 것이 아니라 **이번 요청의 화면을 만드는 데** 쓰인다.
</details>

<details><summary>Q. `model.addAttribute("studentList", students);`로 넘겼다면 HTML에서 무엇으로 읽는가?</summary>

`${studentList}`. 첫 번째 인자(문자열)가 템플릿에서 쓸 이름이고, 두 번째 인자는 Java 변수다. 둘이 같을 필요는 없다.
</details>

<details><summary>Q. `<h1 th:text="${schoolName}">학교 이름</h1>`에서 `학교 이름`은 화면에 나오는가?</summary>

서버 주소로 접속하면 나오지 않는다. `th:text`가 텍스트를 Model 값(`한코딩 스쿨`)으로 바꾼다. HTML 파일을 직접 열었을 때만 예시 문구가 보인다.
</details>

<details><summary>Q. `th:each="student : ${students}"`에서 `${students}`와 `student`는 각각 무엇인가? `${student.name}`은 무엇을 호출하는가?</summary>

`${students}` = Model에서 받은 전체 목록, `student` = 이번 반복에서 쓸 학생 한 명. `${student.name}`은 `getName()`을 통해 이름을 읽는다 (`${student.learning}`은 `isLearning()`).
</details>

<details><summary>Q. `th:each`를 `tr`에 쓰면 어떤 결과가 되는가?</summary>

목록의 학생 수만큼 `tr`이 반복되어 **학생 한 명마다 한 행**이 만들어진다.
</details>

<details><summary>Q. 학습 여부(`true`/`false`) 대신 "학습 중"/"학습 예정"을 보이려면?</summary>

```html
<span th:if="${student.learning}">학습 중</span>
<span th:unless="${student.learning}">학습 예정</span>
```
`th:if`는 참일 때, `th:unless`는 거짓일 때 요소를 표시한다.
</details>

<details><summary>Q. 학생이 없을 때 표 대신 "등록된 학생이 없습니다."를 보여주려면?</summary>

안내 문구에 `th:if="${#lists.isEmpty(students)}"`, 표에 반대 조건 `th:unless="${#lists.isEmpty(students)}"`를 쓴다. 둘 중 필요한 요소만 표시된다.
</details>

<details><summary>Q. `static/css/students.css`를 연결하는 코드는? 주소에 `static`을 넣는가?</summary>

`<link rel="stylesheet" th:href="@{/css/students.css}">`. `static` 폴더의 파일은 `/css/students.css`처럼 **`static`을 빼고** 제공된다. `@{...}`는 URL 표현식이다.
</details>

<details><summary>Q. 브라우저는 무엇을 받았을까? 브라우저가 Thymeleaf 표현식을 계산하는가?</summary>

서버가 처리한 **결과 HTML**을 받는다 (`<td th:text="${student.name}">` → `<td>한코딩</td>`). 브라우저는 Java 코드나 Thymeleaf 표현식을 계산하지 않는다. 페이지 소스 보기로 확인할 수 있다.
</details>

<details><summary>Q. `/students`에 접속했더니 "students"라는 글자만 보인다. 원인은?</summary>

컨트롤러가 `@Controller`가 아니라 `@RestController`로 되어 있다. `@RestController`는 반환 문자열을 그대로 응답한다.
</details>

<details><summary>Q. 이번 컨트롤러의 학생 목록은 언제 만들어지는가?</summary>

`/students` **요청이 올 때마다** 메서드 안에서 `new ArrayList<>()`로 새로 만든다. 화면 표시 연습용 데이터이며, 등록·영구 저장 기능은 없다.
</details>

## 완료 체크
- [ ] 컨트롤러에서 HTML 템플릿을 연결했다.
- [ ] Model로 학교 이름과 안내 문구를 전달했다.
- [ ] 학생 목록을 표로 표시했다.
- [ ] 학습 여부에 따라 다른 문구를 표시했다.
- [ ] 빈 목록 안내를 구현했다.
- [ ] 외부 CSS를 연결했다.
- [ ] 서버가 만든 HTML을 브라우저가 받는 흐름을 이해했다.

## 질문 노트

_아직 없음_
