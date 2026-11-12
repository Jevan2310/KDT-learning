# 02. Spring Boot 프로젝트 시작하기 — 첫 서버와 `/hello` 응답

> 과정: Spring과정 · [노션 원문](https://app.notion.com/p/414848f71c9b80ea8335c27bd73ec6e1) · 최종 갱신일: 2026-11-12

## 한눈에 보기
- **Spring** = Java 웹 애플리케이션 개발 기능을 주는 프레임워크, **Spring Boot** = 자동 설정과 실행 환경 구성을 도와주는 도구. Node.js의 Express처럼 **요청을 받아 처리하고 응답**한다.
- **Spring Initializr**(start.spring.io)에서 Java 21, 의존성 **Spring Web + Thymeleaf**로 프로젝트를 만들고 IntelliJ로 연다.
- 실행 클래스(`@SpringBootApplication`)의 `main`을 실행하면 내장 Tomcat 서버가 **8080 포트**에서 뜬다. 처리할 경로가 없으면 404가 나오는데, 이는 서버가 꺼진 것과 다르다.
- **`@RestController` + `@GetMapping("/hello")`** 메서드가 반환한 문자열이 브라우저에 응답된다. `System.out.println()`은 IntelliJ 콘솔에, 반환값은 브라우저에 보인다.
- 포트는 `application.properties`의 `server.port`, 요청 경로는 `@GetMapping`에서 정한다.

> 💡 보충: **강의 원문과 수업 화면의 차이** — 따라 할 때 헷갈리지 않도록 먼저 정리한다.
>
> | 항목 | 강의 원문 설정 표 · `/school` 이후 코드 · 03~04회차 대부분의 코드 | 수업 화면 · 실행 클래스·첫 컨트롤러 코드 · 폴더 구조 |
> |---|---|---|
> | 빌드 도구 | Maven (설정 표만. 본문의 프로젝트 열기·구조 설명은 `build.gradle` 기준) | **Gradle** (`build.gradle`, `gradlew`, `settings.gradle`이 보임) |
> | 패키지 | `com.hancoding.student` | `com.example.kdt` |
> | 실행 클래스 | `StudentApplication` | `KdtApplication` |
> | Spring Boot · Java | 강사가 지정한 안정 버전 · 21 | 실행 로그 기준 Spring Boot 4.1.2 · Java 21 |
>
> 내 프로젝트를 만든 설정대로 쓰면 된다. 코드를 옮길 때는 **맨 위 `package` 줄과 `import`의 패키지 이름을 내 프로젝트에 맞춘다** (예: `package com.example.kdt.controller;`). 이 wiki의 코드는 강의 그대로 두었다.

## 학습 목표
- Spring과 Spring Boot의 역할을 구분한다.
- Spring Initializr로 프로젝트를 생성한다.
- 주요 폴더와 설정 파일을 살펴본다.
- 컨트롤러에서 GET 요청을 처리한다.
- 메서드의 반환값을 브라우저에 응답한다.

## 핵심 개념

### 1. Spring과 Spring Boot는 무엇인가?
Node.js 수업에서는 Express로 요청을 받고 응답했다. Java에서는 **Spring 프레임워크**로 웹 애플리케이션을 만든다. Spring Boot는 Spring 기반 애플리케이션을 시작·실행하는 데 필요한 설정을 도와준다.

| 구분 | 역할 |
|---|---|
| Java | 프로그램을 작성하는 언어 |
| Spring | 웹 요청 처리 등 애플리케이션 개발 기능 제공 |
| Spring Boot | 자동 설정과 실행 환경 구성 지원 |
| IntelliJ IDEA | 코드 작성·실행을 돕는 개발 도구 |

**Node.js 수업과 연결하기**

| Node.js에서 사용한 것 | 이번에 사용할 것 |
|---|---|
| JavaScript | Java |
| Express의 요청 처리 | Spring MVC의 요청 처리 |
| `node server.js` | Spring Boot 실행 클래스 실행 |
| `app.get("/hello", ...)` | `@GetMapping("/hello")` |

- 문법은 달라도 **요청을 받아 처리하고 응답하는 흐름은 같다.**

### 2. 의존성과 빌드 도구 (Maven / Gradle)
- **의존성**: 프로젝트가 사용하는 외부 라이브러리나 기능.
- **Maven / Gradle**: Java 프로젝트의 **의존성 관리와 빌드**를 돕는 도구.

| Node.js 프로젝트 | 이번 Java 프로젝트 |
|---|---|
| `package.json` | `pom.xml` / `build.gradle` |
| npm으로 패키지 설치 | Maven(Gradle)으로 의존성 다운로드 |
| 실행 명령과 패키지 정보 | 빌드 설정과 의존성 정보 |

- 역할이 비슷한 부분이 있다는 비교이며, 완전히 같은 방식으로 동작하는 것은 아니다.
- 수업 화면의 프로젝트 맨 아래에는 `.gitattributes`, `.gitignore`, **`build.gradle`**, `gradlew`, `gradlew.bat`, `HELP.md`, `settings.gradle`이 보인다 → Gradle 프로젝트.

| 의존성 | 역할 |
|---|---|
| Spring Web | HTTP 요청 처리와 웹 서버 기능 |
| Thymeleaf | 서버에서 HTML 화면을 만드는 템플릿 기능 (다음 회차 화면 실습용으로 미리 추가) |

- **H2와 Spring Data JPA는 데이터베이스 실습(05장)에서 추가한다.**

### 3. 프로젝트 구조
강의의 구조 + 수업 화면(IntelliJ 프로젝트 창)에 보인 파일을 합쳐 정리했다.

```text
kdt/                         ← 수업 프로젝트 (원문 예시 이름은 student)
├─ .gradle/ .idea/ build/ gradle/   ← Gradle·IntelliJ가 만드는 폴더 (직접 고치지 않음)
├─ src/
│  ├─ main/
│  │  ├─ java/
│  │  │  └─ com/example/kdt/
│  │  │     ├─ KdtApplication.java    ★ 실행 클래스
│  │  │     └─ controller/            ← 이번에 만드는 패키지
│  │  │        ├─ HelloController.java
│  │  │        └─ HiController.java
│  │  └─ resources/
│  │     ├─ static/                    ← CSS·이미지 등 정적 파일
│  │     ├─ templates/                 ← HTML (Thymeleaf 템플릿)
│  │     │  └─ Hi.html
│  │     └─ application.properties     ← 포트 번호 혹은 DB 아이디·비밀번호 등 설정
│  └─ test/                            ← 테스트 코드
├─ build.gradle                        ★ Gradle 설정과 의존성
├─ settings.gradle
├─ gradlew / gradlew.bat
└─ HELP.md
```

| 위치 | 역할 |
|---|---|
| `src/main/java` | Java 코드 |
| `src/main/resources` | 설정과 화면 파일 등 |
| `static` | CSS·이미지 등 정적 파일 |
| `templates` | Thymeleaf 템플릿 |
| `application.properties` | 애플리케이션 설정 |
| `src/test` | 테스트 코드 |
| `build.gradle` | Gradle 설정과 의존성 |

- IntelliJ에서는 패키지 폴더 `com/example/kdt`가 **`com.example.kdt`처럼 한 줄로** 보일 수 있다.

### 4. 실행 클래스와 어노테이션

```java
package com.example.kdt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KdtApplication {

    public static void main(String[] args) {
        SpringApplication.run(KdtApplication.class, args);
    }

}
```

| 코드 | 의미 |
|---|---|
| `package com.example.kdt;` | 클래스가 속한 **패키지**. 관련 클래스를 묶고 이름을 구분한다. 컨트롤러는 이 패키지 안이나 하위 패키지에 만든다 |
| `@SpringBootApplication` | 이 클래스가 Spring Boot 애플리케이션의 **설정 시작점**. 자동 설정을 적용하고, 이 클래스의 패키지와 **하위 패키지**에서 관리할 컴포넌트를 찾는다 |
| `SpringApplication.run(…)` | Spring Boot 애플리케이션 시작. Spring Web이 있으므로 **내장 웹 서버도 실행**된다 |

**어노테이션(`@`)이란?** Java 코드에 **추가 정보를 표시하는 문법**이다. `@`로 시작하고, 어노테이션에 따라 Java나 프레임워크가 그 정보를 해석한다.

> 💡 보충: 강의 원문은 "`StudentApplication.java`를 엽니다", `SpringApplication.run(StudentApplication.class, args);`라고 쓰고, 위 코드는 `KdtApplication`이다. 실행 클래스 이름은 Initializr의 **Name(프로젝트 이름) + `Application`** 으로 자동으로 정해진다 (`student` → `StudentApplication`, `kdt` → `KdtApplication`). 내 프로젝트에 생성된 이름을 쓰면 된다.

### 5. 서버 실행과 404의 의미
실행 클래스의 `main` 옆 실행 버튼을 누르면 콘솔에 시작 로그가 나온다 (형식은 버전에 따라 다름).

```text
Tomcat started on port 8080 ...
Started StudentApplication ...
```

수업 화면의 실행 로그에는 `Spring Boot :: (v4.1.2)`, `Starting KdtApplication using Java 21…`, `Tomcat initialized with port 8080 (http)`, `Tomcat started on port 8080 (http) with context path '/'`, `Started KdtApplication in 0.921 seconds`가 보였다.

브라우저에서 `http://localhost:8080/`에 접속하면, 아직 `/`를 처리하는 코드가 없으므로 **404 오류 화면**이 나올 수 있다.

| 결과 | 의미 |
|---|---|
| 시작 완료 로그 | 애플리케이션 시작 |
| 접속 시 404 | 서버에는 연결됐지만 **해당 경로가 없음** |
| 연결할 수 없음 | 실행 상태·주소·포트 확인 필요 |

- 실행 중인 서버는 IntelliJ 실행 창의 **중지 버튼**으로 종료한다 ([단축키](../00_개발환경/IntelliJ-단축키.md): Ctrl + F2 / ⌘ + F2).

### 6. 컨트롤러 — `@RestController`와 `@GetMapping`
**컨트롤러**는 클라이언트의 요청을 받아 처리할 코드를 연결하는 역할을 한다. 실행 클래스 패키지 아래에 `controller` 패키지를 만들고 그 안에 컨트롤러 클래스를 만든다.

| 어노테이션 | 의미 |
|---|---|
| `@RestController` | Spring이 이 클래스를 웹 컨트롤러로 인식하고, 메서드의 반환값을 **HTTP 응답 본문**으로 보낸다 |
| `@GetMapping("/hello")` | `/hello` 경로의 **GET 요청**을 아래 메서드에 연결한다 |

```java
public String hello() {
    return "안녕하세요, 한코딩 서버입니다!";
}
```

- Java 메서드는 문자열을 반환하고, Spring이 그 문자열을 HTTP 응답 본문으로 브라우저에 전달한다.
- **`return` 자체가 콘솔에 출력하는 명령은 아니다.**

**요청 처리 흐름**

```text
브라우저에서 GET /hello 요청
        ↓
Spring이 매핑된 메서드를 찾음
        ↓
hello() 실행
        ↓
문자열 반환 (@RestController의 경우)
        ↓
브라우저에 HTTP 응답
```

- 브라우저 주소의 `/hello`는 `@GetMapping`에 쓴 경로와 **일치해야** 한다.

### 7. 메서드 이름과 요청 경로는 다르다
요청 경로를 정하는 것은 **`@GetMapping("/school")`** 이다. 메서드 이름을 `showSchool()`로 바꿔도 매핑을 그대로 두면 요청 주소는 `/school`이다.

```java
@GetMapping("/school")
public String school() {
    return "한코딩 스쿨입니다.";
}
```

- 한 컨트롤러 안에 여러 요청 처리 메서드를 쓸 수 있다. 단, **같은 GET 경로를 두 메서드에 등록하면 중복 매핑 오류**가 난다.

### 8. 콘솔 출력 vs 브라우저 응답

```java
@GetMapping("/hello")
public String hello() {
    System.out.println("GET /hello 요청이 들어왔습니다.");

    return "브라우저에 보내는 응답입니다.";
}
```

| 코드 | 확인하는 곳 |
|---|---|
| `System.out.println()` | IntelliJ 서버 콘솔 |
| 메서드의 반환값 | 브라우저의 응답 본문 |

| Node.js | Spring |
|---|---|
| `console.log()` | `System.out.println()` |
| `res.send("문장")` | `@RestController` 메서드에서 문자열 반환 |

### 9. `application.properties`로 포트 설정
`src/main/resources/application.properties`에서 **기존 설정은 유지하고** 다음을 추가한다.

```properties
server.port=8080
```

- `server.port`는 서버가 사용할 포트다. `8081`로 바꾸고 재시작하면 `http://localhost:8081/hello`로 접속한다. 확인 후 `8080`으로 되돌린다.
- **포트는 `application.properties`, 요청 경로는 `@GetMapping`에서 설정한다.**

> 💡 보충: Initializr로 만든 파일에는 보통 `spring.application.name=kdt`(프로젝트 이름) 한 줄이 이미 들어 있다. 이 줄은 지우지 않고 아래에 추가한다. 8080은 원래 기본 포트라서 `server.port=8080`은 "기본값을 눈에 보이게 적어 둔 것"이다.

### 10. Node.js 코드와 비교

```javascript
app.get("/hello", (req, res) => {
  res.send("안녕하세요, 한코딩 서버입니다!");
});
```

```java
@GetMapping("/hello")
public String hello() {
    return "안녕하세요, 한코딩 서버입니다!";
}
```

| 공통점 | 설명 |
|---|---|
| 요청 메서드 | GET |
| 요청 경로 | `/hello` |
| 실행할 코드 | 연결된 함수 또는 메서드 |
| 응답 | 인사 문자열 |

- 기술이 달라도 **요청 경로에 처리 코드를 연결하고 결과를 응답한다**는 원리는 같다. Spring 코드는 `@RestController` 클래스 안에 쓴 메서드다.

### 정리

| 개념 | 핵심 |
|---|---|
| Spring | 애플리케이션 개발 기능을 제공하는 프레임워크 |
| Spring Boot | 자동 설정과 실행 환경 구성 지원 |
| Spring Initializr | 프로젝트 생성 도구 |
| 컨트롤러 | 요청을 처리할 메서드 연결 |
| `@RestController` | 메서드 반환값을 응답 본문으로 처리 |
| `@Controller` | 메서드 반환값을 응답 본문으로 처리 |
| `@GetMapping` | GET 요청 경로 연결 |
| `application.properties` | 포트 등 애플리케이션 설정 |

> 💡 보충: 강의 정리 표의 `@Controller` 설명은 `@RestController`와 똑같이 적혀 있지만 **틀린 설명**이다. `@Controller` 메서드가 반환한 문자열은 응답 본문이 아니라 **화면(템플릿) 이름**으로 쓰인다 → 아래 실습 4의 `HiController`, [03_Thymeleaf-학생목록](03_Thymeleaf-학생목록.md) "@Controller와 @RestController" 참고.

## 실습 정리

### 실습 1. Spring Initializr로 프로젝트 만들기
👉 [Spring Initializr](https://start.spring.io/) · [Spring 공식 프로젝트 생성 안내](https://spring.io/guides/gs/spring-boot)

| 항목 | 강의 원문 설정 | 수업 화면 |
|---|---|---|
| Project | Maven | Gradle (`build.gradle`) |
| Language | Java | Java |
| Spring Boot | 강사가 지정한 안정 버전 | 4.1.2 (실행 로그) |
| Group | `com.hancoding` | `com.example` (패키지 이름으로 추정) |
| Artifact | `student` | `kdt` |
| Name | `student` | `kdt` |
| Package name | `com.hancoding.student` | `com.example.kdt` |
| Packaging | Jar | - |
| Configuration | 선택 항목이 있다면 Properties | - |
| Java | 21 | 21 |
| Dependencies | Spring Web, Thymeleaf (`ADD DEPENDENCIES`) | 같음 |

- 수업 화면 열은 IntelliJ 화면·실행 로그에서 확인한 값이다. `-`는 화면에서 확인할 수 없는 항목.

- Spring Boot 버전은 수업에서 같은 버전으로 통일한다. **`SNAPSHOT`, `M`, `RC`가 붙은 개발·시험 버전은 선택하지 않는다.**
- JDK도 프로젝트에서 선택한 Java 버전(21)과 맞춘다.
- `GENERATE`를 눌러 ZIP 파일을 내려받는다.

### 실습 2. IntelliJ에서 프로젝트 열기
1. 내려받은 ZIP 파일의 압축을 푼다.
2. IntelliJ IDEA에서 **Open**을 선택한다.
3. 압축을 푼 폴더 중 **`build.gradle`이 있는 폴더**를 연다 (Maven이면 `pom.xml`이 있는 폴더).
4. 본인이 생성한 프로젝트인지 확인한 뒤 신뢰(Trust) 관련 안내를 진행한다.

- 최초 실행에는 **인터넷 연결이 필요**하고, 의존성 다운로드에 시간이 걸릴 수 있다.

### 실습 3. 서버 실행하기
실행 클래스의 `main` 옆 실행 버튼 → 콘솔에서 시작 완료 로그 확인 → `http://localhost:8080/` 접속 (404 정상).

### 실습 4. 첫 번째 컨트롤러 만들기
실행 클래스 패키지 아래에 `controller` 패키지를 만들고 `HelloController` 클래스를 만든다.

수업 화면 폴더 구조:

```text
src/main
├─ java/com.example.kdt
│  ├─ controller
│  │  ├─ HelloController
│  │  └─ HiController
│  └─ KdtApplication
└─ resources
   ├─ static
   └─ templates
      └─ Hi.html
```

**`HelloController.java`** (수업 코드)

```java
package com.example.kdt.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "안녕하세요 hello입니다.";
    }

}
```

> 💡 보충: 수업 코드의 반환 문장은 "안녕하세요 hello입니다."이고, 강의 설명·예상 응답은 "안녕하세요, 한코딩 서버입니다!"다. 반환한 문장이 그대로 브라우저에 나오므로 **내 코드의 `return` 문장이 보이면 정상**이다.

브라우저에서 `http://localhost:8080/hello` 접속 → 예상 응답(강의):

```text
안녕하세요, 한코딩 서버입니다!
```

수업에서는 `@Controller`와 비교하기 위해 `HiController`와 `templates/Hi.html`도 만들었다.

**`HiController.java`**

```java
package com.example.kdt.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HiController {

    @GetMapping("/hi")
    public String hi() {
        return "Hi";
    }
}
```

**`src/main/resources/templates/Hi.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>구분할래요</title>
</head>
<body>
<h1>안녕하세요 Hi입니다 여기는 HTML입니다.</h1>
</body>
</html>
```

> 💡 보충: `/hello`(`@RestController`)는 **"안녕하세요 hello입니다." 글자 자체**가 응답되고, `/hi`(`@Controller`)는 반환값 `"Hi"`를 **템플릿 이름**으로 써서 `templates/Hi.html` 화면이 응답된다. 이 차이는 [03_Thymeleaf-학생목록](03_Thymeleaf-학생목록.md)에서 자세히 배운다. 템플릿 이름은 대소문자까지 파일 이름과 맞춘다 (`"Hi"` ↔ `Hi.html`).

### 실습 5. 경로를 하나 더 추가하기 — 최종 `HelloController`
`HelloController` 클래스 안에 `/school` 메서드를 추가한다.

```java
package com.hancoding.student.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "안녕하세요, 한코딩 서버입니다!";
    }

    @GetMapping("/school")
    public String school() {
        return "한코딩 스쿨입니다.";
    }
}
```

서버를 재시작하고 두 주소를 확인한다.

```text
http://localhost:8080/hello
http://localhost:8080/school
```

### 실습 6. 콘솔 출력과 응답 구분, 포트 바꾸기
- `hello()`에 `System.out.println("GET /hello 요청이 들어왔습니다.");`를 넣고 `/hello` 접속 → 콘솔과 브라우저에 각각 무엇이 나오는지 확인 (핵심 개념 8).
- `application.properties`에서 `server.port=8081`로 바꾸고 재시작 → `http://localhost:8081/hello` 확인 → **다시 `server.port=8080`으로 되돌리고 재시작** (핵심 개념 9).

**최종 `application.properties`** (강의에서 추가한 줄)

```properties
server.port=8080
```

### 직접 바꿔보기 (미션)
- [ ] 응답 문장을 바꾸고, 서버를 재시작한 뒤 브라우저를 새로고침해 바뀐 문장을 확인한다.
- [ ] `/goal` 경로에 학습 목표를 응답하는 메서드를 추가한다. 기존 메서드와 경로가 겹치지 않게 한다.
- [ ] 메서드 이름을 `showSchool()`로 바꿔도 `/school` 주소가 그대로 동작하는지 확인한다.
- [ ] 포트를 8081로 바꿔 접속해 보고 8080으로 되돌린다.

## 헷갈리기 쉬운 점
- **404 ≠ 서버 꺼짐.** 404는 서버가 응답했지만 그 경로를 처리할 코드가 없다는 뜻이다. "연결할 수 없음"이 서버가 안 떠 있거나 주소·포트가 틀린 경우다.
- **요청 경로는 메서드 이름이 아니라 `@GetMapping("…")`이 정한다.**
- **코드를 고친 뒤에는 저장하고 서버를 재시작해야** 반영된다. 안 그러면 수정 전 응답이 보인다.
- **`return`은 콘솔 출력이 아니다.** 콘솔에는 `System.out.println()`, 브라우저에는 반환값.
- **컨트롤러는 실행 클래스 패키지(또는 하위 패키지) 안에** 둔다. 밖에 두면 Spring이 찾지 못해 404가 난다.
- **포트는 `application.properties`, 경로는 `@GetMapping`.**
- **`@RestController`와 `@Controller`는 다르다.** 강의 정리 표의 `@Controller` 설명은 잘못 적혀 있다 (정리 표 아래 보충).
- **Initializr에서 `SNAPSHOT`·`M`·`RC` 버전을 고르지 않는다.**
- **강의 원문(Maven·`com.hancoding.student`)과 수업 화면(Gradle·`com.example.kdt`)이 다르다.** 내 프로젝트 패키지에 맞춰 `package` 줄을 쓴다.

**실행이 안 될 때 확인할 것**

| 증상 | 확인할 내용 |
|---|---|
| Java 버전 오류 | 프로젝트 JDK와 Maven 실행 JDK가 수업 버전에 맞는지 |
| 포트가 사용 중이라는 오류 | 기존 서버가 실행 중인지 |
| `/hello` 접속 시 404 | 경로·애너테이션·컨트롤러 패키지·재시작 여부 |
| 수정 전 응답이 표시됨 | 저장과 서버 재시작 여부 |
| 중복 매핑 오류 | 같은 GET 경로를 두 메서드에 등록했는지 |

컨트롤러 위치: 실행 클래스가 `package com.example.kdt;`이면 컨트롤러는 그 아래 `package com.example.kdt.controller;`에 둔다. 기본 설정에서는 실행 클래스의 패키지와 하위 패키지가 컴포넌트 탐색 대상이다.

> 💡 보충: Gradle 프로젝트에서 "Java 버전 오류"가 나면 **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JVM**이 21인지도 확인한다 (Maven의 "Maven 실행 JDK"에 해당).

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 프로젝트 만들기 | Spring Initializr | start.spring.io → Java 21, Spring Web + Thymeleaf → GENERATE |
| 프로젝트 열기 | IntelliJ **Open** | `build.gradle`(또는 `pom.xml`)이 있는 폴더 |
| 서버 실행 | 실행 클래스 `main` ▶ | `KdtApplication` / `StudentApplication` |
| 서버 종료 | 실행 창 중지 버튼 | Ctrl + F2 / ⌘ + F2 |
| 접속 주소 | `localhost:포트/경로` | `http://localhost:8080/hello` |
| 문자열 응답 컨트롤러 | `@RestController` | `@RestController public class HelloController { … }` |
| GET 경로 연결 | `@GetMapping` | `@GetMapping("/hello")` |
| 응답 보내기 | 메서드 `return` | `return "안녕하세요, 한코딩 서버입니다!";` |
| 서버 콘솔에 찍기 | `System.out.println()` | `System.out.println("GET /hello 요청이 들어왔습니다.");` |
| 포트 바꾸기 | `application.properties` | `server.port=8081` |
| HTML 화면 응답 (미리 보기) | `@Controller` + `templates/이름.html` | `return "Hi";` → `templates/Hi.html` |

## 확인 문제

<details><summary>Q. Spring과 Spring Boot는 각각 무엇인가? Node.js 수업의 무엇과 비슷한가?</summary>

- **Spring**: 웹 요청 처리 등 애플리케이션 개발 기능을 제공하는 프레임워크
- **Spring Boot**: 자동 설정과 실행 환경 구성을 지원 (Spring 애플리케이션을 쉽게 시작·실행)

Express로 `app.get("/hello", …)`처럼 요청을 처리하던 것을 Spring에서는 `@GetMapping("/hello")` 메서드로 한다. 요청을 받아 처리하고 응답하는 흐름은 같다.
</details>

<details><summary>Q. 의존성이란? 이번 프로젝트에 추가한 의존성 두 가지와 역할은?</summary>

프로젝트가 사용하는 외부 라이브러리나 기능이다. **Spring Web**(HTTP 요청 처리와 웹 서버 기능), **Thymeleaf**(서버에서 HTML 화면을 만드는 템플릿 기능). H2·Spring Data JPA는 DB 실습에서 추가한다.
</details>

<details><summary>Q. Maven / Gradle은 무엇이고, Node.js 프로젝트의 무엇과 역할이 비슷한가?</summary>

Java 프로젝트의 **의존성 관리와 빌드**를 돕는 도구다. `pom.xml`/`build.gradle`이 Node.js의 `package.json`과, 의존성 다운로드가 `npm install`과 역할이 비슷하다 (완전히 같은 방식은 아님).
</details>

<details><summary>Q. Spring Initializr에서 Spring Boot 버전을 고를 때 피해야 할 것은? Java 버전은?</summary>

`SNAPSHOT`, `M`, `RC`가 붙은 개발·시험 버전은 고르지 않고 수업에서 정한 안정 버전으로 통일한다. Java는 21이고, JDK도 같은 버전으로 맞춘다.
</details>

<details><summary>Q. 어노테이션이란? `@SpringBootApplication`은 무슨 일을 하는가?</summary>

어노테이션은 `@`로 시작해 Java 코드에 **추가 정보를 표시하는 문법**이다. `@SpringBootApplication`은 이 클래스가 Spring Boot 애플리케이션의 **설정 시작점**임을 나타내고, 자동 설정 적용과 이 클래스의 패키지·하위 패키지에서 컴포넌트 찾기 등을 묶어 제공한다.
</details>

<details><summary>Q. 서버를 실행하고 `http://localhost:8080/`에 접속했더니 404가 나왔다. 서버가 실행되지 않은 것인가?</summary>

아니다. 서버는 응답했지만 `/` 경로를 처리할 코드가 없는 상태다. 서버가 실행되지 않았다면 "연결할 수 없음"이 나온다.
</details>

<details><summary>Q. `@RestController`와 `@GetMapping("/hello")`는 각각 무슨 역할인가?</summary>

`@RestController`: Spring이 클래스를 웹 컨트롤러로 인식하고, 메서드 반환값을 **HTTP 응답 본문**으로 보낸다. `@GetMapping("/hello")`: `/hello` 경로의 **GET 요청**을 아래 메서드에 연결한다.
</details>

<details><summary>Q. `@GetMapping("/school")`이 붙은 메서드의 이름을 `showSchool()`로 바꾸면 접속 주소는?</summary>

그대로 `/school`이다. 요청 경로를 정하는 것은 메서드 이름이 아니라 `@GetMapping("/school")`이다.
</details>

<details><summary>Q. `hello()` 안에 `System.out.println(…)`과 `return "…"`이 있다. 각각 어디서 확인하는가? Node.js의 무엇에 해당하는가?</summary>

`System.out.println()` → **IntelliJ 서버 콘솔** (Node.js `console.log()`), 반환값 → **브라우저 응답 본문** (Node.js `res.send()`).
</details>

<details><summary>Q. 서버 포트를 8081로 바꾸려면 어디를 고치는가? 요청 경로는 어디서 정하는가?</summary>

`src/main/resources/application.properties`에 `server.port=8081`. 요청 경로는 `@GetMapping`에서 정한다. 바꾼 뒤 서버를 재시작하고 `http://localhost:8081/hello`로 접속한다.
</details>

<details><summary>Q. 컨트롤러를 만들었는데 `/hello`가 404다. 무엇을 확인하는가?</summary>

경로 철자(`@GetMapping("/hello")`), 어노테이션(`@RestController`), **컨트롤러 패키지가 실행 클래스 패키지의 하위인지**(예: `com.example.kdt.controller`), 저장 후 서버를 재시작했는지.
</details>

<details><summary>Q. `@RestController`에서 `return "Hi";`와 `@Controller`에서 `return "Hi";`는 브라우저에 각각 무엇을 보여주는가?</summary>

`@RestController`는 **"Hi" 글자 자체**를 응답한다. `@Controller`는 `"Hi"`를 **템플릿 이름**으로 써서 `templates/Hi.html` 화면을 응답한다 (수업의 `HiController`).
</details>

## 완료 체크
- [ ] Spring Initializr로 프로젝트를 생성했다.
- [ ] IntelliJ에서 프로젝트를 열고 실행했다.
- [ ] 컨트롤러를 만들고 GET 요청을 처리했다.
- [ ] 메서드 반환값을 브라우저에서 확인했다.
- [ ] 서로 다른 경로에 다른 응답을 연결했다.
- [ ] 콘솔 출력과 HTTP 응답을 구분했다.
- [ ] 설정 파일에서 포트를 변경해 봤다.

## 질문 노트

_아직 없음_
