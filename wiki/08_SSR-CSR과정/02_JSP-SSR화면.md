# 02. Spring Boot와 JSP로 SSR 화면 만들기 — 학생 목록·이름 검색

> 과정: SSR-CSR과정 · [노션 원문](https://app.notion.com/p/420848f71c9b8084be13ce042ef84d16) · 최종 갱신일: 2026-11-24

## 한눈에 보기
- **JSP(Jakarta Server Pages)** = HTML 안에 데이터 출력·반복·조건 표현을 쓰고, **서버가 처리해 완성된 HTML을 응답**하는 기술 (SSR). 브라우저는 `${...}`나 `<c:...>`를 실행하지 않고 결과 HTML만 받는다.
- JSP는 **실행 가능한 JAR를 지원하지 않아 WAR로 패키징**한다. `tomcat-embed-jasper`(JSP 엔진)와 **JSTL API·구현체**(jakarta)를 추가하고, `spring.mvc.view.prefix=/WEB-INF/views/`·`suffix=.jsp`로 `return "students"` → **`/WEB-INF/views/students.jsp`** 를 찾게 한다.
- `@Controller`가 `@RequestParam`으로 검색어를 받고, Service(→ MyBatis Mapper)에서 학생을 조회해 **`Model`** 에 `students`·`keyword`를 담는다.
- JSP에서는 **EL** `${student.name}`(getter 호출)과 **JSTL** `<c:forEach>`(반복)·`<c:if>`(조건)·`<c:out>`(이스케이프 출력)·`<c:url>`(URL)로 목록, "검색 결과 없음" 안내, 검색어 유지를 만든다.
- 검색은 JavaScript 없이 **GET 폼 제출 → `/students?keyword=한` → 서버가 새 HTML 응답**으로 동작한다.

> 💡 보충: 노션 원문에 **두 버전이 섞여 있다.** ① 원래 자료: 패키지 `com.hancoding.renderingdemo`, DB 없이 Java 목록, `className` 필드. ② 수업에서 바꾼 코드: 패키지 `com.example.jsp`, **MyBatis + MariaDB/MySQL**, Lombok, `classId` 필드. ①의 Service(Java 목록) 코드는 원문에 없고 설명 표만 남아 있다. 이 문서는 ②를 최종 코드로 정리하고 ①의 코드는 비교용으로 남긴다 (실습 정리의 "노션 원문의 두 버전"). 두 버전이 섞여서 **원문 코드를 그대로 쓰면 화면이 500 오류**가 난다 → 최종 코드 아래 보충 참고.

## 학습 목표
- Spring Boot에 JSP 실행 환경을 설정한다.
- Controller · Service · JSP의 역할을 구분한다.
- `Model`에 담은 데이터를 JSP에서 출력한다.
- EL과 JSTL로 학생 목록과 조건에 따른 안내를 표시한다.
- 이름 검색 결과가 반영된 HTML을 서버에서 응답한다.

## 핵심 개념

### 1. 이번에 구현할 기능
학생 목록을 보여 주고, **이름 일부로 학생을 검색**하는 페이지를 만든다. SSR·CSR의 배경은 [01_SSR-CSR배경](01_SSR-CSR배경.md).

| 기능 | 동작 |
|---|---|
| 전체 목록 | 모든 학생 표시 |
| 이름 검색 | 이름에 검색어가 포함된 학생 표시 |
| 검색어 없음 | 전체 학생 표시 |
| 검색 결과 없음 | 안내 문구 표시 |
| 검색 후 | 입력한 검색어 유지 |

```text
브라우저의 목록·검색 요청
              ↓
Controller가 요청을 받음
              ↓
Service에서 학생 조회 요청을 받고
              ↓
Mapper가 DB로 가서 데이터를 조회한 다음 Service로 넘겨줌
              ↓
Service가 Mapper에서 받은 내용을 Model에 저장
              ↓
JSP에서 HTML 생성
              ↓
브라우저에 응답
```

> 💡 보충: 원문 문장은 "렌더링 흐름에 집중하기 위해 DB 대신 Java 목록을 사용"이지만, 위 흐름과 수업 코드는 **Mapper로 DB를 조회**한다 (버전 ②). 또 흐름에는 "Service가 … Model에 저장"이라고 되어 있지만 코드에서 `model.addAttribute`를 부르는 것은 **Controller**다. Service는 목록을 돌려줄 뿐이다.

### 2. JSP란?
**Jakarta Server Pages**. HTML과 함께 데이터 출력·반복 등의 표현을 작성하고, **서버에서 처리하여 HTML을 생성**하는 기술이다.

```html
<!-- 타임리프 -->
<p th:text="${student.name}"></p>

<!-- JSP -->
<p><c:out value="${student.name}" /></p>
```

서버는 학생 이름을 반영한 HTML을 응답한다.

```html
<p>한코딩</p>
```

- 브라우저가 받는 것은 **처리된 HTML**이다. `${student.name}`이나 `<c:out>`을 브라우저가 실행하는 것이 아니다.

| 구분 | 역할 | 예 |
|---|---|---|
| EL | 전달된 데이터에 접근 | `${student.name}` |
| JSTL 출력 | 값을 HTML에 안전하게 출력 | `<c:out>` |
| JSTL 반복 | 목록 반복 | `<c:forEach>` |
| JSTL 조건 | 조건에 따라 내용 표시 | `<c:if>` |

- JSP 안에 Java 코드를 직접 넣는 **스크립틀릿**은 이번 실습에서 사용하지 않는다.

> 💡 보충: EL = Expression Language(표현 언어), JSTL = Jakarta Standard Tag Library(표준 태그 모음). 스크립틀릿은 `<% … %>` 안에 Java 코드를 그대로 쓰는 예전 방식이다.

> 💡 보충: [Spring 03 Thymeleaf](../03_Spring과정/03_Thymeleaf-학생목록.md)와 비교
>
> | 하고 싶은 것 | Thymeleaf (Spring 03) | JSP (이번) |
> |---|---|---|
> | 화면 파일 위치 | `resources/templates/students.html` | `webapp/WEB-INF/views/students.jsp` |
> | 뷰 경로 설정 | 기본값 그대로 | `spring.mvc.view.prefix`·`suffix` |
> | 의존성 | `spring-boot-starter-thymeleaf` | `tomcat-embed-jasper` + JSTL API·구현체 |
> | 패키징 | JAR | WAR |
> | 값 표시 | `<td th:text="${student.name}">` | `<td><c:out value="${student.name}" /></td>` |
> | 목록 반복 | `<tr th:each="student : ${students}">` | `<c:forEach var="student" items="${students}">` |
> | 조건 표시 | `th:if` / `th:unless` | `<c:if test="...">` (반대 조건은 `not`을 붙여 한 번 더) |
> | 빈 목록 검사 | `${#lists.isEmpty(students)}` | `${empty students}` |
> | URL 만들기 | `th:href="@{/css/students.css}"` | `<c:url var="cssUrl" value="/css/students.css" />` |
>
> Thymeleaf는 HTML 태그의 **속성**(`th:`)으로, JSP는 **별도 태그**(`<c:...>`)로 쓴다. 둘 다 서버에서 처리되고 브라우저는 결과 HTML만 받는다.

### 3. JAR와 WAR — 왜 WAR로 준비하나?
Spring Boot의 JSP 지원에는 패키징 제약이 있다. **JSP는 실행 가능한 JAR 패키징을 지원하지 않으므로 WAR 패키징을 사용한다.**

| 패키징 | 수업 설명 | JSP |
|---|---|---|
| JAR | 톰캣이 안에 들어 있음 (내장) | 실행 가능한 JAR에서는 지원 안 함 |
| WAR | 외부 톰캣에 올리는 형식 | 사용 가능. 내장 Tomcat을 쓰는 실행 가능한 WAR는 `java -jar`로도 실행할 수 있다 |

> 💡 보충: Initializr에서 Packaging을 War로 고르면 `ServletInitializer.java`가 함께 생긴다 (외부 톰캣에 배포할 때 쓰는 시작 클래스, 수업 화면에도 있다). 지우지 않는다. `build.gradle`의 `providedRuntime '…spring-boot-starter-tomcat'`은 "외부 톰캣에 올리면 그 톰캣을 쓴다"는 뜻이고, `bootRun`·`java -jar`로 실행할 때는 내장 톰캣으로 쓰인다.

### 4. JSP 경로 설정 — prefix·suffix
`application.properties`에 추가한다.

```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp

server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true
```

Controller에서 다음 이름을 반환하면,

```java
return "students";
```

Spring은 설정을 조합해 JSP를 찾는다.

```text
/WEB-INF/views/ + students + .jsp
                    ↓
/WEB-INF/views/students.jsp
```

- 반환 문자열은 **화면에 표시할 문장도, JSON도 아니다.** 설정된 JSP를 찾기 위한 **뷰 이름**이다. `.jsp`를 붙이지 않는다.

> 💡 보충: `server.servlet.encoding.*` 세 줄은 요청·응답의 문자 인코딩을 UTF-8로 맞추는 설정이다. 한글 검색어와 한글 화면이 깨지지 않게 한다.

**WEB-INF 안에 두는 이유**
- `WEB-INF` 내부 파일은 **브라우저가 URL로 직접 접근할 수 없다.** 사용자는 Controller에 요청하고, 서버 내부에서 JSP를 사용한다.
- Spring 공식 문서도 JSP를 `WEB-INF` 아래에 두는 방식을 권장한다. 👉 [Spring의 JSP 연동 안내](https://docs.spring.io/spring-framework/reference/web/webmvc-view/mvc-jsp.html)

다음 접근은 사용하지 않는다.

```text
http://localhost:8080/WEB-INF/views/students.jsp
```

정상적인 화면 진입 주소는 다음과 같다. Controller를 통해 데이터가 준비되어야 한다.

```text
http://localhost:8080/students
```

### 5. Controller · Service · Mapper · JSP 역할 나누기

| 요소 | 역할 |
|---|---|
| `Student` | 학생 한 명의 정보 |
| `StudentMapper` (+ XML) | DB에서 학생 조회 (수업 코드) |
| `StudentService` | 학생 조회와 이름 검색. **JSP를 알지 못한다** |
| `StudentPageController` (`@Controller`) | 페이지 요청 처리, Model에 데이터 저장, 뷰 이름 반환 |
| JSP | 서버에서 데이터를 반영한 HTML 생성 |
| CSS | 화면의 표현만 담당 (조회·검색 로직 없음) |

**`@Controller`** — 이번에는 JSON이 아니라 JSP가 생성한 HTML을 응답한다. 따라서 `@RestController`가 아니라 `@Controller`를 쓴다 (JSON 응답은 [Spring 06](../03_Spring과정/06_JSON-API-React연결.md)).

**`@RequestParam`** — 다음 요청의 `keyword`를 받는다.

```text
/students?keyword=한
```

```java
@RequestParam(name = "keyword", defaultValue = "")
String keyword
```

- 검색어가 없으면 **빈 문자열**을 사용한다. Controller에서 `keyword.trim()`으로 앞뒤 공백을 지운 뒤 Service에 넘긴다.

**`Model`** — 화면 템플릿에 전달할 데이터를 담는다.

```java
model.addAttribute("students", students);
model.addAttribute("keyword", searchKeyword);
```

| 전달 이름 | 값 |
|---|---|
| `students` | 학생 목록 |
| `keyword` | 검색어 |

### 6. EL과 getter — `${student.name}`은 `getName()`
JSP에서 다음처럼 쓰면,

```jsp
${student.name}
```

객체의 **`getName()`** 을 통해 이름을 읽는다. **JSP에서 속성처럼 쓰는 이름과 Java getter의 관계**를 기억한다. 같은 getter가 없으면 오류가 난다 (`${student.className}` ↔ `getClassName()`).

### 7. JSP의 표현 살펴보기

**① 페이지 인코딩** — JSP 파일을 읽고 HTML을 응답할 때 쓸 문자 인코딩을 지정한다. 파일 자체도 UTF-8로 저장한다.

```jsp
<%@ page contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" %>
```

**② JSTL 사용 선언** — `c`라는 접두어로 JSTL의 코어 태그를 쓰겠다는 뜻이다. 이번에는 Jakarta Tags 3.0의 URI를 쓴다. 👉 [Jakarta Tags 3.0 안내](https://jakarta.ee/specifications/tags/3.0/)

```jsp
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
```

> 💡 보충: 인터넷의 옛 예제에 나오는 `javax.servlet:jstl` 의존성은 Spring Boot 2 시절(javax 패키지) 방식이다. Spring Boot 3부터는 jakarta 패키지를 쓰므로 강의처럼 **jakarta JSTL API + glassfish 구현체**를 쓴다.

**③ 목록 반복 — `<c:forEach>`**

```jsp
<c:forEach var="student" items="${students}">
    <p><c:out value="${student.name}" /></p>
</c:forEach>
```

- `items`: 반복할 목록
- `var`: 현재 학생 한 명을 가리킬 이름

Java의 반복문과 비슷한 역할이다.

```java
for (Student student : students) {
    System.out.println(student.getName());
}
```

**④ 조건 표시 — `<c:if>`**

```jsp
<c:if test="${empty students}">
    <p>검색 결과가 없습니다.</p>
</c:if>
```

목록이 비어 있으면 안내를 표시한다.

```jsp
<c:if test="${not empty students}">
```

목록이 비어 있지 않으면 내부 내용을 표시한다.

**⑤ 값 출력 — `<c:out>`**

```jsp
<c:out value="${student.name}" />
```

- 값을 출력하면서 **HTML 특수문자를 기본적으로 이스케이프**한다. 사용자가 입력한 검색어 등은 HTML로 해석되지 않도록 출력하는 것이 중요하다.
- **`${...}`로 접근한 값을 어디에 출력하느냐에 따라 적절한 처리가 필요하다.** 이번에는 일반 텍스트와 **따옴표로 감싼 입력값 속성**(`value="<c:out value='${keyword}' />"`)에 `<c:out>`을 쓴다.

> 💡 보충: 이스케이프 = `<`를 `&lt;`처럼 바꿔 **글자로 보이게** 하는 것. 검색창에 `<b>한</b>`을 넣어도 굵은 글씨 태그가 아니라 글자 그대로 나온다.

**⑥ URL 생성 — `<c:url>`**

```jsp
<c:url var="studentsUrl" value="/students" />
```

애플리케이션의 경로를 고려한 URL을 만들고 `studentsUrl`이라는 이름으로 사용한다. 이후 `href="${studentsUrl}"`, `action="${studentsUrl}"`로 쓴다.

> 💡 보충: 지금은 애플리케이션 경로가 `/`라서 결과가 그냥 `/students`다. 외부 톰캣에 `/jsp` 같은 이름으로 올리면 `<c:url>`이 `/jsp/students`로 바꿔 준다. 처음 접속한 화면에서는 링크가 `/students;jsessionid=…`처럼 보일 수 있다 (세션 쿠키가 아직 없어서 붙는 것, 실행 확인). 오류가 아니고 다음 요청부터는 붙지 않는다.

### 8. 검색어가 서버에 전달되는 과정
검색 폼의 핵심 부분:

```html
<form action="/students" method="get">
  <input type="text" name="keyword">
  <button type="submit">검색</button>
</form>
```

`name="keyword"`가 **요청 파라미터 이름**이 된다.

```text
입력값: 한
     ↓
GET /students?keyword=한
     ↓
@RequestParam으로 keyword 수신
     ↓
StudentService에서 검색
     ↓
Model에 검색 결과와 검색어 저장
     ↓
JSP에서 새 HTML 생성
```

- 입력창에 검색어를 유지하는 것도 **서버가 전달한 `keyword`를 JSP에서 다시 출력**했기 때문이다.
- **이번 페이지에는 검색용 JavaScript가 없다.** 브라우저의 기본 폼 제출과 서버의 HTML 응답으로 동작한다.
- 주소창에서 `http://localhost:8080/students?keyword=한`처럼 직접 검색할 수도 있다. 검색 결과 페이지를 **새로고침해도 URL의 검색어로 다시 조회**된다.

같은 화면을 브라우저에서 만드는 방식은 [04_React-CSR화면](04_React-CSR화면.md), 요청 흐름은 [03_SSR요청흐름](03_SSR요청흐름.md).

### 정리

| 요소 | 역할 |
|---|---|
| `Student` | 학생 한 명의 정보 |
| `StudentService` | 학생 조회와 이름 검색 |
| `@Controller` | 페이지 요청 처리 |
| `@RequestParam` | URL의 검색어 수신 |
| `Model` | JSP에 전달할 데이터 저장 |
| 뷰 이름 | 응답을 만들 JSP 선택 |
| EL | 전달받은 객체와 값에 접근 |
| `<c:forEach>` | 목록 반복 |
| `<c:if>` | 조건에 따라 출력 |
| `<c:out>` | 값 출력과 HTML 특수문자 이스케이프 |
| JSP | 서버에서 데이터를 반영한 HTML 생성 |

## 실습 정리

### 만든 것
`GET /students`(전체 목록)와 `GET /students?keyword=…`(이름 검색)에 학생 표(번호·이름·이메일·소속 반)를 JSP로 만들어 응답하는 페이지. 검색 결과가 없으면 안내 문구를 보이고, 검색 후에도 입력창에 검색어를 유지한다.

### 노션 원문의 두 버전

| 구분 | ① 원래 자료 (비교용) | ② 수업에서 바꾼 코드 (최종 코드) |
|---|---|---|
| 패키지 | `com.hancoding.renderingdemo` | `com.example.jsp` |
| 프로젝트 이름 | Group `com.hancoding`, Artifact `rendering-demo` | `group = 'com.example'`, `description = 'jsp'`, `JspApplication` |
| 학생 데이터 | DB 없이 Java 목록 (Service 코드는 원문에 없음) | MyBatis로 DB `students` 테이블 조회 |
| `Student` | `final` 필드 + getter 직접 작성, **`className`** | Lombok, **`classId`** |
| Controller | 생성자 직접 작성, `students`·**`keyword`** 를 Model에 담음 | Lombok `@AllArgsConstructor`, **`students`만** Model에 담음 |
| JSP·CSS | 하나뿐 (`${student.className}` 사용) | 같은 파일 |

### 프로젝트 준비
**Spring Boot 3.5.x · Java 17 · Gradle Groovy · 내장 Tomcat** 기준이다. 강사가 제공한 시작 프로젝트가 있다면 그것을 쓴다.

| 항목 | 설정 |
|---|---|
| Project | Gradle - Groovy |
| Language | Java |
| Spring Boot | 3.5.x 안정 버전 |
| Group | `com.hancoding` |
| Artifact | `rendering-demo` |
| Package name | `com.hancoding.renderingdemo` |
| Packaging | **War** |
| Java | 17 |
| Dependencies | Spring Web |

> 💡 보충: 2026-11-24 확인 기준 start.spring.io(IntelliJ의 Spring Boot 새 프로젝트 화면도 이 목록을 쓴다)에서는 Spring Boot **4.0.10 · 4.1.3 · 4.2.0만** 고를 수 있고 3.5.x는 없다. 아무 4.x로 만든 뒤 `build.gradle` 전체를 아래 강의 코드로 바꾸면 플러그인 버전이 `3.5.16`이 된다 (Initializr가 만든 Gradle Wrapper 9.9.2로 빌드되는 것을 확인함). MyBatis 스타터 `3.0.x`는 Spring Boot 3용이다.

> 💡 보충: [Spring 02](../03_Spring과정/02_SpringBoot시작.md)에서는 Java 21로 만들었다. 강의 `build.gradle`은 `JavaLanguageVersion.of(17)`이라 **JDK 17이 설치되어 있어야** 한다. 없으면 `Cannot find a Java installation on your machine … matching: {languageVersion=17, …}` 오류로 빌드가 멈춘다 → IntelliJ의 Download JDK로 17을 받는다 ([IntelliJ-JDK](../00_개발환경/IntelliJ-JDK.md)).

**`build.gradle`** — `plugins` 안에 `id 'war'`가 있는지 확인한다 (이미 있으면 중복으로 넣지 않는다). 원문은 "생성된 기존 Spring Boot 플러그인 버전은 유지"라고 하면서 아래처럼 구성한다.

```groovy
plugins {
    id 'java'
    id 'war'
    id 'org.springframework.boot' version '3.5.16'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
description = 'jsp'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.apache.tomcat.embed:tomcat-embed-jasper'
    providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat'
    implementation 'jakarta.servlet.jsp.jstl:jakarta.servlet.jsp.jstl-api'
    implementation 'org.glassfish.web:jakarta.servlet.jsp.jstl'

    // MyBatis + MariaDB
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.5'
    runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

MySQL을 쓰는 버전은 DB 드라이버 한 줄만 다르다.

```groovy
    // MyBatis + MariaDB
		implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.5'
		runtimeOnly 'com.mysql:mysql-connector-j'
```

| 의존성 | 역할 |
|---|---|
| Spring Web | Controller와 웹 요청 처리 |
| Tomcat Jasper | JSP를 처리하는 엔진 |
| JSTL API·구현체 | JSP에서 반복·조건·출력 태그 사용 |
| Tomcat | 웹 요청을 처리하는 서블릿 컨테이너 |

- 버전을 생략한 항목은 Spring Boot의 의존성 관리 설정을 쓴다. 👉 [Spring Boot 3.5 의존성 목록](https://docs.spring.io/spring-boot/3.5/appendix/dependency-versions/coordinates.html)
- 수정 후 IntelliJ에서 **Gradle 변경 사항을 불러온다.**

> 💡 보충: 원문에 "이번 프로젝트에는 DB·JPA·MyBatis·Thymeleaf 의존성을 추가하지 않습니다"라는 ① 버전 문장이 남아 있지만, 수업 `build.gradle`에는 **MyBatis·DB 드라이버·Lombok**이 들어 있다. 프로젝트 설정 표의 Dependencies(Spring Web)에도 Lombok은 없다.

**`application.properties`** — DB·MyBatis 설정 (MariaDB 버전)

```properties
spring.application.name=jsp

spring.datasource.url=jdbc:mariadb://localhost:3306/school
spring.datasource.username=root
spring.datasource.password=****
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

mybatis.mapper-locations=classpath:/mappers/*.xml
mybatis.configuration.map-underscore-to-camel-case=true
```

MySQL 버전은 두 줄이 다르다.

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/school
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

같은 파일에 4장의 JSP 경로·인코딩 설정도 넣는다.

```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp

server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true
```

> 💡 보충: 원문의 비밀번호 값은 공개 저장소라 `****`로 가렸다. [DB 06](../06_데이터베이스과정/06_Spring-MyBatis.md)처럼 `spring.datasource.password=${DB_PASSWORD}`로 쓰고 IntelliJ 실행 설정의 환경변수에 넣으면 파일에 비밀번호가 남지 않는다. `build.gradle`의 드라이버와 `url`·`driver-class-name`은 같은 DB(MariaDB 또는 MySQL)로 맞춘다. 데이터베이스과정에서 MySQL을 설치했다면 MySQL 버전을 쓴다. `school` DB와 `students` 테이블(`id`, `name`, `email`, `class_id`)이 미리 있어야 한다 ([DB 02](../06_데이터베이스과정/02_테이블-데이터추가.md), [DB 05](../06_데이터베이스과정/05_테이블관계-JOIN.md)).

### 파일 구조

```text
src/main
├─ java
│  └─ com/hancoding/renderingdemo
│     ├─ JspApplication.java
│     ├─ Student.java
│     ├─ StudentService.java
│     ├─ StudentMapper.java
│     └─ StudentPageController.java
│
├─ resources
│  ├─ mappers
│     └─ StudentMapper.xml
│  ├─ application.properties
│  └─ static
│     └─ css
│        └─ students.css
│
└─ webapp
   └─ WEB-INF
      └─ views
         └─ students.jsp
```

- `webapp`, `WEB-INF`, `views` 폴더가 없다면 직접 만든다. `webapp`은 `resources` 안이 아니라 **`src/main` 바로 아래**다.
- 수업 화면(IntelliJ): 프로젝트 `jsp` → `src/main/java`의 `com.example.jsp` 패키지에 `JspApplication`, `ServletInitializer`, `Student`, `StudentMapper`(인터페이스), `StudentPageController`, `StudentService` / `resources`에 `mappers/StudentMapper.xml`, `static.css/students.css`, 빈 `templates` 폴더, `application.properties` / `src/main/webapp/WEB-INF/views/students.jsp`.

> 💡 보충: 텍스트 구조도는 ①의 패키지 경로(`com/hancoding/renderingdemo`)에 ②의 `JspApplication`·Mapper가 섞여 있다. 수업 화면대로 `com.example.jsp`를 기준으로 한다. `static.css`는 IntelliJ가 `static/css`를 한 줄로 합쳐 보여 준 것이다 (폴더 이름을 `static.css`로 만들지 않는다).

### 단계 흐름
1. Gradle - Groovy · Java 17 · **War** · Spring Web으로 프로젝트 생성 → `build.gradle`을 강의 코드로 구성 → Gradle 변경 사항 불러오기
2. `application.properties`에 DB·MyBatis 설정과 JSP 경로(`prefix`·`suffix`)·인코딩 설정
3. `src/main/webapp/WEB-INF/views` 폴더 만들기
4. `Student`, `StudentMapper`(`findAll`, `insert`), `StudentMapper.xml`, `StudentService`(`studentList`, `insertStudent`) 작성 → 테스트용 컨트롤러(`/test1`, `/test2`)로 DB 연결 확인
5. Mapper에 `searchByName`, Service에 `findStudents` 추가 → 컨트롤러를 `/students` 화면용으로 교체 (Model에 `students`, ①은 `keyword`도)
6. `students.jsp` 작성 (검색 폼, `<c:if>`, `<c:forEach>`, `<c:out>`, `<c:url>`)
7. `static/css/students.css` 작성
8. 프로젝트 최상위에서 `bootRun` → `http://localhost:8080/students`에서 동작 확인

#### 4단계 코드 — Mapper 연결 테스트용 컨트롤러
4단계의 Mapper·XML·Service는 아래 최종 코드에서 `searchByName`·`findStudents`를 뺀 모습이다.

```java
package com.example.jsp;


import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@AllArgsConstructor
public class StudentPageController {

    private final StudentService service;

    @GetMapping("/test1")
    public String test() {

        List<Student> list = service.studentList();

        for (Student s : list) {
            System.out.println("이름: " + s.getName() + " / 이메일: " + s.getEmail());
        }
        return "";
    }

    @GetMapping("/test2") // localhost:8080/test2?name=…&email=…&classId=1
    public String test2(String name, String email, Long classId) {

        service.insertStudent(name, email, classId);

        return "";
    }
}
```

- `/test1`: 전체 학생을 콘솔에 출력한다. `/test2`: 주소의 쿼리 파라미터(`name`, `email`, `classId`)로 학생을 등록한다.

> 💡 보충: 주석의 예시 값은 공개 저장소라 `…`로 줄였다. `@Controller`에서 `return "";`이면 빈 뷰 이름으로 JSP를 찾다 실패해 브라우저에는 **404 오류 화면**이 뜬다. 메서드는 실행되므로 콘솔 출력·DB 등록은 확인할 수 있다 (실행 확인). 이 클래스는 5단계에서 `/students` 컨트롤러로 통째로 바뀐다.

### 최종 코드 (버전 ②, 패키지 `com.example.jsp`)

> 💡 보충: 아래 코드는 원문 그대로다. 보충의 "실행 확인"은 이 코드를 그대로 넣고 **DB만 H2(메모리)로 바꿔** Spring Boot 3.5.16으로 실행해 본 결과다 (2026-11-24).

**`Student.java`**

```java
package com.example.jsp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Student {
    private Long id;
    private String name;
    private String email;
    private Long classId;

    public Student(String name, String email, Long classId) {
        this.name = name;
        this.email = email;
        this.classId = classId;
    }
}
```

> 💡 보충: 이 코드에서 주의할 점
> - **`${student.className}` 오류**: 이 `Student`에는 `className`이 아니라 `classId`가 있다. 아래 JSP를 그대로 쓰면 `PropertyNotFoundException: Property [className] not found on type [com.example.jsp.Student]`로 **500 오류**가 난다 (실행 확인). JSP를 `${student.classId}`로 바꾸거나, 반 이름을 보이려면 `classes`와 JOIN해 `className`을 채워야 한다 ([DB 05](../06_데이터베이스과정/05_테이블관계-JOIN.md)).
> - **기본 생성자 없음**: `NoArgsConstructor`를 import만 하고 붙이지 않았다. 기본 생성자가 없으면 MyBatis는 **조회한 열의 개수·순서가 맞는 생성자**로 객체를 만든다. `searchByName`(name, email, class_id)은 3개짜리 생성자 `(name, email, classId)`와 맞아서 동작하지만 `id`가 비어 **번호 칸이 빈칸**이다. `findAll`(id, name, email)은 순서가 어긋나 `Error attempting to get column 'email'` 오류가 난다 (`/test1`). `@NoArgsConstructor`를 붙이면 기본 생성자 + setter로 값을 채워 `findAll`도 동작한다 (실행 확인).
> - 원문 설명 "수정 기능이 없으므로 Setter는 만들지 않습니다"는 ① 버전 설명이다. ② 코드에는 `@Setter`가 있다.

> 💡 보충: Lombok 어노테이션 (강의 밖 설명)
>
> | 어노테이션 | 만들어 주는 것 |
> |---|---|
> | `@Getter` · `@Setter` | 필드마다 getter · setter |
> | `@AllArgsConstructor` | 모든 필드를 받는 생성자 |
> | `@NoArgsConstructor` | 매개변수 없는 기본 생성자 |
> | `@Slf4j` | `log` 변수 (`log.info(...)`, `log.error(...)`로 로그 출력) |
>
> Controller·Service에 붙인 `@AllArgsConstructor`는 `private final` 필드를 받는 생성자를 만든다 → ① 버전에서 직접 쓴 생성자와 같은 **생성자 주입**이다.

**`StudentMapper.java`**

```java
package com.example.jsp;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface StudentMapper {

    List<Student> findAll();

    int insert(Student student);

    List<Student> searchByName(String keyword);
}
```

**`resources/mappers/StudentMapper.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.jsp.StudentMapper">

    <select id="findAll" resultType="com.example.jsp.Student">
        SELECT id, name, email
        FROM students
        ORDER BY id
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        insert into students (name, email, class_id)
        values (#{name}, #{email}, #{classId})
    </insert>

    <select id="searchByName" resultType="com.example.jsp.Student">
        SELECT name, email, class_id
        FROM students
        WHERE name LIKE CONCAT('%', #{keyword}, '%')
    </select>


</mapper>
```

> 💡 보충: `findAll`은 `class_id`를, `searchByName`은 `id`를 조회하지 않는다. `LIKE CONCAT('%', #{keyword}, '%')`에서 검색어가 빈 문자열이면 `'%%'`가 되어 **모든 학생**이 나온다 → "검색어 없음 → 전체 학생"을 Service가 아니라 SQL이 처리한다 (실행 확인). `namespace`·`id`·`resultType`·`#{}`는 [DB 06](../06_데이터베이스과정/06_Spring-MyBatis.md).

**`StudentService.java`**

```java
package com.example.jsp;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class StudentService {

    private final StudentMapper mapper;

    public List<Student> studentList() {
        return mapper.findAll();
    }

    public void insertStudent(String name, String email, Long classId) {

        Student s = new Student(name, email, classId);

        try {
            mapper.insert(s);
            log.info("데이터 등록에 성공했습니다");
        } catch (Exception e) {
            log.error("데이터 등록에 실패했습니다.");
        }
    }

    public List<Student> findStudents(String keyword) {
        return mapper.searchByName(keyword);
    }
}
```

| 코드 | 의미 |
|---|---|
| `@Service` | 조회·검색 로직을 담당할 객체로 Spring에 등록 |
| `trim()` | 검색어 앞뒤 공백 제거 (Controller에서 호출) |

```text
검색어 없음 또는 공백
        ↓
전체 학생 반환

검색어 있음
        ↓
이름에 검색어가 포함된 학생만 반환
```

- 이 Service는 **JSP를 알지 못한다.** 학생 데이터를 조회하는 역할만 한다.

> 💡 보충: 원문 "코드에서 확인할 부분" 표의 `List.of(...)`, `isBlank()`, `contains(...)`, `results.add(...)`, `1L`(`L` = long 타입 숫자)은 ① 버전의 Java 목록 Service 설명인데, 그 코드는 원문에 없다. ② 코드에서 이름 검색은 SQL의 `LIKE`가 한다.

**`StudentPageController.java`**

```java
package com.example.jsp;


import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@AllArgsConstructor
@Slf4j
public class StudentPageController {

    private final StudentService service;

    @GetMapping("/students")
    public String students(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            Model model) {
        log.info("/students 경로로 접속했습니다.");

        String searchKeyword = keyword.trim(); // 양쪽 공백 제거

        List<Student> students = service.findStudents(searchKeyword);

        model.addAttribute("students", students);

        return "students";
    }
}
```

> 💡 보충: 이 버전은 `model.addAttribute("keyword", …)`가 없다. 그래서 검색해도 **입력창이 비고 "검색어:" 줄이 나오지 않는다** (실행 확인). 아래 ① 버전 컨트롤러에는 `model.addAttribute("keyword", searchKeyword);`가 있다.

**`src/main/webapp/WEB-INF/views/students.jsp`**

```jsp
<%@ page contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>학생 목록 | 한코딩</title>

    <c:url var="cssUrl" value="/css/students.css" />
    <link rel="stylesheet" href="${cssUrl}">
</head>
<body>
    <main class="container">
        <header class="page-header">
            <p class="label">Spring Boot + JSP</p>
            <h1>학생 목록</h1>
            <p>이름의 일부를 입력하여 학생을 검색하세요.</p>
        </header>

        <c:url var="studentsUrl" value="/students" />

        <form class="search-form"
              action="${studentsUrl}"
              method="get">

            <label for="keyword">학생 이름</label>

            <div class="search-controls">
                <input
                    id="keyword"
                    type="text"
                    name="keyword"
                    placeholder="예: 한"
                    value="<c:out value='${keyword}' />"
                >

                <button type="submit">검색</button>

                <a href="${studentsUrl}">전체 보기</a>
            </div>
        </form>

        <c:if test="${not empty keyword}">
            <p class="search-summary">
                검색어:
                <strong><c:out value="${keyword}" /></strong>
            </p>
        </c:if>

        <c:if test="${empty students}">
            <p class="empty-message">
                검색 결과가 없습니다.
            </p>
        </c:if>

        <c:if test="${not empty students}">
            <div class="table-wrapper">
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
                        <c:forEach
                            var="student"
                            items="${students}">

                            <tr>
                                <td>
                                    <c:out value="${student.id}" />
                                </td>
                                <td>
                                    <c:out value="${student.name}" />
                                </td>
                                <td>
                                    <c:out value="${student.email}" />
                                </td>
                                <td>
                                    <c:out value="${student.className}" />
                                </td>
                            </tr>

                        </c:forEach>
                    </tbody>
                </table>
            </div>
        </c:if>
    </main>
</body>
</html>
```

**`src/main/resources/static/css/students.css`** — CSS는 화면의 표현을 담당한다. 학생 목록을 조회하거나 검색하는 로직은 없다.

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

#### ① 원래 자료의 코드 (비교용, 패키지 `com.hancoding.renderingdemo`)

**`Student.java`**

```java
package com.hancoding.renderingdemo;

public class Student {

    private final Long id;
    private final String name;
    private final String email;
    private final String className;

		public Student() {}

    public Student(
            Long id,
            String name,
            String email,
            String className) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.className = className;
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

    public String getClassName() {
        return className;
    }
}
```

> 💡 보충: `final` 필드인데 값을 넣지 않는 `public Student() {}`가 있어 **컴파일 오류**가 난다 (`variable id might not have been initialized`, 확인함). 이 생성자를 빼면 원문 설명대로 "생성·조회만 하고 Setter는 없는" 클래스가 된다.

**`StudentPageController.java`**

```java
package com.hancoding.renderingdemo;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class StudentPageController {

    private final StudentService studentService;

    public StudentPageController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/students")
    public String students(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            Model model) {

        String searchKeyword = keyword.trim();

        List<Student> students =
                studentService.findStudents(searchKeyword);

        model.addAttribute("students", students);
        model.addAttribute("keyword", searchKeyword);

        return "students";
    }
}
```

- 생성자를 직접 써서 `StudentService`를 받고, **`keyword`도 Model에 담는다** → JSP가 검색어를 입력창과 "검색어:" 줄에 다시 출력한다.

### 실행하고 확인하기
프로젝트 최상위 폴더에서 실행한다. 그 위치에 `build.gradle`과 Gradle Wrapper 파일이 있어야 한다.

Windows PowerShell:

```text
.\gradlew.bat bootRun
```

Mac 터미널:

```bash
./gradlew bootRun
```

실행된 뒤 접속한다.

```text
http://localhost:8080/students
```

- `/` 주소에는 Controller를 만들지 않았으므로, 루트 화면이 없다고 오류로 판단하지 않는다.

| 입력·동작 | 기대 결과 |
|---|---|
| 처음 접속 | 학생 네 명 표시 |
| `한` 검색 | 한코딩 표시 |
| `자바` 검색 | 김자바 표시 |
| `없는학생` 검색 | 검색 결과 없음 안내 |
| 검색어 없이 검색 | 전체 학생 표시 |
| 공백만 입력 | 전체 학생 표시 |
| 전체 보기 클릭 | 검색어가 없는 전체 목록 |
| 검색 후 입력창 확인 | 검색어 유지 |

> 💡 보충: "학생 네 명", "한코딩", "김자바"는 ① 버전의 고정 목록 기준이다. ② 코드는 DB `students` 테이블에 있는 학생대로 나온다. 또 최종 코드를 그대로 쓰면 `className` 때문에 처음 접속부터 500 오류가 나고, `keyword`를 Model에 담지 않아 "검색어 유지"가 안 된다 (위 보충).

## 헷갈리기 쉬운 점
- **JSP는 실행 가능한 JAR에서 동작하지 않는다.** 프로젝트를 **WAR**로 만든다.
- **JSP 위치는 `src/main/webapp/WEB-INF/views/`** 다. Thymeleaf처럼 `resources/templates/`에 두지 않는다.
- **`return "students"`는 글자가 아니라 뷰 이름이다.** prefix·suffix가 붙어 `/WEB-INF/views/students.jsp`가 된다. `.jsp`를 붙이지 않는다.
- **`students`라는 글자만 보이면 `@RestController`를 쓴 것**이다. 화면 응답은 `@Controller`.
- **`WEB-INF` 안의 JSP는 주소로 직접 열 수 없다** (404). 항상 Controller 주소 `/students`로 들어간다.
- **`${student.name}`은 필드가 아니라 `getName()`을 부른다.** JSP의 속성 이름과 getter 이름이 다르면 오류가 난다 (수업 코드의 `className` ↔ `classId`).
- **Model에 담지 않은 값은 JSP에서 비어 있다.** 검색어를 유지하려면 `model.addAttribute("keyword", …)`가 필요하다.
- **빈 목록 안내와 표는 `<c:if>` 두 개로 나눈다.** `empty students` / `not empty students`.
- **사용자 입력은 `<c:out>`으로 출력한다** (HTML 특수문자 이스케이프). 입력창 `value` 속성 안에서도 쓴다.
- **JSTL URI는 `jakarta.tags.core`**, 의존성은 jakarta JSTL API + 구현체 둘 다 필요하다.
- **검색은 JavaScript가 아니라 GET 폼 제출**이다. 결과 URL(`?keyword=한`)을 새로고침해도 같은 검색이 다시 실행된다.
- **`/` 주소에 화면이 없는 것은 정상**이다. 루트 Controller를 만들지 않았다.

**오류가 발생하면 확인하기**

| 증상 | 확인할 내용 |
|---|---|
| 8080 포트 사용 중 | 이전 Spring 서버가 실행 중인지 확인 |
| `/students`가 404 | Controller 경로와 패키지 위치 확인 |
| JSP를 찾지 못함 | `webapp/WEB-INF/views/students.jsp` 위치 확인 |
| 화면에 `students`라는 글자만 표시 | `@RestController`를 사용했는지 확인 |
| JSTL URI를 찾지 못함 | JSTL API·구현체와 Gradle 갱신 확인 |
| `${student.name}` 접근 오류 | `Student`의 `getName()` 확인 |
| CSS가 적용되지 않음 | `static/css/students.css` 위치와 요청 상태 확인 |
| 한글이 깨짐 | 파일 UTF-8 저장과 인코딩 설정 확인 |
| 파일은 있는데 JSP가 안 열림 | 프로젝트 최상위에서 `bootRun`으로 실행했는지 확인 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| WAR 패키징 | `build.gradle` plugins | `id 'war'` |
| JSP 엔진 | Tomcat Jasper | `implementation 'org.apache.tomcat.embed:tomcat-embed-jasper'` |
| JSTL 태그 | JSTL API + 구현체 | `jakarta.servlet.jsp.jstl:jakarta.servlet.jsp.jstl-api`, `org.glassfish.web:jakarta.servlet.jsp.jstl` |
| 뷰 이름 → JSP 경로 | prefix·suffix | `spring.mvc.view.prefix=/WEB-INF/views/`, `spring.mvc.view.suffix=.jsp` |
| JSP 파일 위치 | `src/main/webapp/WEB-INF/views/` | `students.jsp` ↔ `return "students";` |
| HTML 화면 응답 | `@Controller` | `public class StudentPageController { … }` |
| 쿼리 파라미터 받기 | `@RequestParam` | `@RequestParam(name = "keyword", defaultValue = "") String keyword` |
| JSP에 데이터 넘기기 | `Model` | `model.addAttribute("students", students);` |
| 페이지 인코딩 | page 지시어 | `<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>` |
| JSTL 쓰기 선언 | taglib 지시어 | `<%@ taglib prefix="c" uri="jakarta.tags.core" %>` |
| 값 접근 | EL (getter 호출) | `${student.name}` → `getName()` |
| 안전하게 출력 | `<c:out>` | `<c:out value="${student.name}" />` |
| 목록 반복 | `<c:forEach>` | `<c:forEach var="student" items="${students}">` |
| 조건 표시 | `<c:if>` + `empty` / `not empty` | `<c:if test="${empty students}">` |
| URL 만들기 | `<c:url>` | `<c:url var="studentsUrl" value="/students" />` → `href="${studentsUrl}"` |
| 입력창에 검색어 유지 | `value` + `<c:out>` | `value="<c:out value='${keyword}' />"` |
| 이름 일부 검색 SQL | `LIKE` + `CONCAT` | `WHERE name LIKE CONCAT('%', #{keyword}, '%')` |
| 실행 | Gradle `bootRun` | `./gradlew bootRun` → `http://localhost:8080/students` |

## 확인 문제

<details><summary>Q. JSP는 무엇이고, 브라우저는 무엇을 받는가?</summary>

**Jakarta Server Pages**. HTML과 함께 데이터 출력·반복 표현을 쓰고 **서버에서 처리해 HTML을 생성**하는 기술이다. 브라우저는 처리된 HTML(`<p>한코딩</p>`)만 받는다. `${student.name}`이나 `<c:out>`을 브라우저가 실행하지 않는다.
</details>

<details><summary>Q. 왜 이번 프로젝트는 JAR가 아니라 WAR로 준비하는가? WAR는 어떻게 실행하는가?</summary>

Spring Boot에서 **JSP는 실행 가능한 JAR 패키징을 지원하지 않기** 때문이다. 내장 Tomcat을 쓰는 실행 가능한 WAR는 `java -jar`로 실행할 수 있고, 개발 중에는 `./gradlew bootRun`으로 실행한다.
</details>

<details><summary>Q. JSP를 쓰려고 `build.gradle`에 추가한 의존성은 무엇이고, 각각 무슨 역할인가?</summary>

`tomcat-embed-jasper`(JSP를 처리하는 엔진), `jakarta.servlet.jsp.jstl-api` + `org.glassfish.web:jakarta.servlet.jsp.jstl`(JSTL API·구현체 — 반복·조건·출력 태그), `spring-boot-starter-tomcat`(서블릿 컨테이너, `providedRuntime`). 버전은 Spring Boot 의존성 관리가 정한다.
</details>

<details><summary>Q. `@Controller`에서 `return "students";`하면 어떤 파일을 찾는가?</summary>

`spring.mvc.view.prefix=/WEB-INF/views/`와 `suffix=.jsp`를 조합해 **`/WEB-INF/views/students.jsp`** (프로젝트에서는 `src/main/webapp/WEB-INF/views/students.jsp`). 반환값은 화면 문장도 JSON도 아닌 **뷰 이름**이다.
</details>

<details><summary>Q. JSP를 `WEB-INF` 안에 두는 이유는? `http://localhost:8080/WEB-INF/views/students.jsp`로 열면 어떻게 되는가?</summary>

`WEB-INF` 내부 파일은 **브라우저가 URL로 직접 접근할 수 없어서** 사용자는 반드시 Controller를 거친다. 직접 열면 404다. 정상 진입 주소는 `http://localhost:8080/students`이고, Controller가 데이터를 준비해야 화면이 만들어진다.
</details>

<details><summary>Q. `/students`에 접속했더니 화면 대신 `students`라는 글자만 보인다. 원인은?</summary>

`@Controller` 대신 `@RestController`를 썼다. `@RestController`는 반환 문자열을 그대로 응답 본문으로 보낸다.
</details>

<details><summary>Q. Controller·Service·JSP는 각각 무슨 일을 하는가? Service는 JSP를 아는가?</summary>

Controller: 요청 처리, 검색어 수신(`@RequestParam`), Model에 데이터 저장, 뷰 이름 반환. Service: 학생 조회와 이름 검색 — **JSP를 알지 못하고** 데이터만 돌려준다 (수업 코드는 Mapper로 DB 조회). JSP: 서버에서 데이터를 반영한 HTML 생성.
</details>

<details><summary>Q. `@RequestParam(name = "keyword", defaultValue = "")`에서 `/students`로 검색어 없이 들어오면 어떻게 되는가?</summary>

`keyword`가 **빈 문자열**이 된다. `trim()` 후 빈 검색어로 조회하므로 전체 학생이 나온다 (수업 코드는 `LIKE CONCAT('%', '', '%')` → 모든 이름과 일치). 공백만 입력해도 `trim()`으로 빈 문자열이 되어 전체 목록이다.
</details>

<details><summary>Q. JSP의 `${student.name}`은 무엇을 통해 값을 읽는가? 수업 코드에서 `${student.className}`이 오류가 나는 이유는?</summary>

객체의 **`getName()`** 을 통해 읽는다. 수업 코드(②)의 `Student`에는 `classId`만 있어 `getClassName()`이 없으므로 `PropertyNotFoundException`(500)이 난다. JSP의 속성 이름과 getter 이름이 맞아야 한다.
</details>

<details><summary>Q. `<c:forEach var="student" items="${students}">`에서 `items`와 `var`는 각각 무엇인가?</summary>

`items` = 반복할 목록(Model의 `students`), `var` = 현재 학생 한 명을 가리킬 이름. Java의 `for (Student student : students)`와 비슷하다.
</details>

<details><summary>Q. 검색 결과가 없을 때 표 대신 안내 문구를 보이려면?</summary>

```jsp
<c:if test="${empty students}">
    <p>검색 결과가 없습니다.</p>
</c:if>
```
표는 반대 조건 `<c:if test="${not empty students}">` 안에 둔다. 둘 중 하나만 표시된다.
</details>

<details><summary>Q. 값을 출력할 때 `<c:out>`을 쓰는 이유는? 어디에 썼는가?</summary>

값을 출력하면서 **HTML 특수문자를 이스케이프**해, 사용자가 입력한 검색어 등이 HTML로 해석되지 않게 한다. 일반 텍스트(이름·이메일·검색어)와 **따옴표로 감싼 입력창 `value` 속성**에 썼다.
</details>

<details><summary>Q. `<c:url var="studentsUrl" value="/students" />`은 무엇을 하는가?</summary>

애플리케이션의 경로를 고려한 URL을 만들어 `studentsUrl`이라는 이름에 담는다. 폼 `action="${studentsUrl}"`과 "전체 보기" 링크 `href="${studentsUrl}"`, CSS 링크(`cssUrl`)에 썼다.
</details>

<details><summary>Q. 검색 후 입력창에 검색어가 남아 있는 이유는? 이 페이지에 검색용 JavaScript가 있는가?</summary>

폼의 `name="keyword"` → `GET /students?keyword=한` → Controller가 `keyword`를 Model에 담고 → JSP가 `value="<c:out value='${keyword}' />"`로 **다시 출력**했기 때문이다. JavaScript는 없다. 브라우저의 기본 폼 제출과 서버의 HTML 응답으로 동작하며, 결과 페이지를 새로고침해도 URL의 검색어로 다시 조회된다.
</details>

## 완료 체크
- [ ] Gradle에 JSP·JSTL 의존성을 설정했다.
- [ ] JSP를 `webapp/WEB-INF/views`에 배치했다.
- [ ] 학생 데이터와 검색 로직을 만들었다.
- [ ] Controller에서 Model로 데이터를 전달했다.
- [ ] JSP에서 학생 목록을 반복 출력했다.
- [ ] 이름 일부로 학생을 검색했다.
- [ ] 검색어가 없으면 전체 목록을 표시했다.
- [ ] 검색 결과가 없으면 안내를 표시했다.
- [ ] 검색 후에도 입력창의 검색어를 유지했다.
- [ ] 서버에서 JSP를 처리하여 HTML을 응답한다는 흐름을 이해했다.

## 질문 노트

<details><summary>Q. Controller는 React 컴포넌트 같은 건가요? <sub>2026-11-24 · 수업 중</sub></summary>

**A.** 하는 일이 다르다. React 컴포넌트는 **브라우저**에서 화면 한 부분(JSX)을 그린다. Controller는 **서버**에서 돌아가는 Java 클래스로, "이 주소로 요청이 오면 이 메서드를 실행한다"를 정하고 화면 이름(`@Controller` → JSP) 또는 데이터(`@RestController` → JSON)를 돌려준다. React는 `fetch`로 요청을 보내는 쪽, Controller는 그 요청을 받는 쪽이다.

(강의 밖 내용) Spring에서 말하는 "컴포넌트"는 Spring이 만들어 관리하는 객체(빈)를 뜻한다. `@Controller`·`@Service`·`@Repository`가 모두 그 한 종류라서 Spring 기준으로는 Controller도 컴포넌트지만, 화면 조각인 React 컴포넌트와는 다른 개념이다.

관련: 이 파일의 "5. Controller · Service · Mapper · JSP 역할 나누기"
</details>
