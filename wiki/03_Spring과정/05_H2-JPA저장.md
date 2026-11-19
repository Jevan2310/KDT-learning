# 05. H2와 JPA로 학생 정보 저장하기 — Entity·Repository·H2 Console

> 과정: Spring과정 · [노션 원문](https://app.notion.com/p/416848f71c9b8073a839e7ad202d2732) · 최종 갱신일: 2026-11-19

## 한눈에 보기
- 컨트롤러 필드의 Java `List` 대신 **H2 데이터베이스**에 학생을 저장한다. 흐름이 `컨트롤러 → List`에서 **`컨트롤러 → Repository → H2`** 로 바뀐다. 등록 폼과 목록 화면(`students.html`, CSS)은 그대로 쓴다.
- `build.gradle`에 **`spring-boot-starter-data-jpa` + `h2`** (Spring Boot 4.x는 H2 Console용 `spring-boot-h2console`도)를 넣고, `application.properties`에 `jdbc:h2:mem:studentdb`·`ddl-auto=update`·H2 Console 설정을 쓴다.
- `Student`를 **Entity**로 바꾼다: `@Entity`·`@Table(name = "students")`·`@Id`·`@GeneratedValue(IDENTITY)`, ID는 `Long`, **`protected` 기본 생성자** 추가. ID는 DB가 자동으로 만들어서 `nextId`가 필요 없다.
- **`StudentRepository extends JpaRepository<Student, Long>`** 인터페이스만 만들면 `save()`·`findAll()`을 쓸 수 있다. 컨트롤러는 Repository를 **생성자로 전달받는다 (의존성 주입, DI)**.
- `/h2-console`에서 `SELECT * FROM students`로 저장된 행을 본다. **메모리 모드(`mem:`)는 서버를 끄면 사라지고, 파일 모드(`file:./data/studentdb`)는 유지된다.**

> 💡 보충: 강의 본문 코드의 패키지는 `com.hancoding.student`, 수업 코드는 [000](000_세팅-데이터입력.md)에서 만든 `www` 프로젝트(`com.example.www`)다. 의존성 추가는 **Gradle(`build.gradle`) 기준**이다 (Maven이면 `pom.xml`에 같은 의존성을 넣는다). 내 프로젝트 패키지에 맞춰 `package`·`import` 줄을 고친다.

## 학습 목표
- 데이터베이스와 테이블의 기본 구조를 이해한다.
- Gradle에 H2와 Spring Data JPA 의존성을 추가한다.
- 학생 클래스를 Entity로 변경한다.
- Repository로 학생을 저장하고 조회한다.
- 기존 Thymeleaf 등록 폼과 목록 화면을 연결한다.
- H2 Console에서 데이터를 확인한다.
- 메모리 모드와 파일 모드를 비교한다.

## 핵심 개념

### 1. 지금까지 데이터는 어디에 있었을까?
[04](04_폼-학생등록.md)에서는 컨트롤러의 필드에 학생 목록을 보관했다.

```java
private final List<Student> studentList = new ArrayList<>();
```

- 이 목록은 실행 중인 프로그램의 **메모리**에 있다 → 서버를 종료하면 추가한 학생도 사라진다.
- 이번에는 저장과 조회를 **데이터베이스**에 맡긴다.

```text
기존
컨트롤러 → Java List에 추가·조회

변경
컨트롤러 → Repository → H2 데이터베이스
```

- 화면의 등록 폼과 학생 목록은 그대로, **데이터를 관리하는 부분만** 바꾼다.

### 2. 데이터베이스와 테이블
**관계형 데이터베이스**는 데이터를 **테이블** 형태로 관리한다.
- 관계형: H2 / MariaDB(MySQL) / Oracle / PostgreSQL / MSSQL …
- 비관계형: MongoDB

| ID (PK) | 이름 | 학습 여부 |
|---|---|---|
| 1 | 한코딩 | true |
| 2 | 이학생 | false |

| 용어 | 의미 |
|---|---|
| 테이블 (Table) | 같은 종류의 데이터를 모아두는 구조 |
| 행 (Row) | 학생 한 명과 같은 데이터 한 건 |
| 열 (Column) | 이름·학습 여부 같은 항목 |
| 기본 키 (PK) | 각 행을 고유하게 구분하는 값 |

- 이번에는 학생의 `id`를 기본 키로 쓴다.

> 💡 보충: 테이블·기본 키·SQL은 데이터베이스 과정 [01_DB이해-실습환경](../06_데이터베이스과정/01_DB이해-실습환경.md)·[02_테이블-데이터추가](../06_데이터베이스과정/02_테이블-데이터추가.md)에서 MySQL로 자세히 다룬다.

### 3. H2·JPA·Hibernate·Spring Data JPA 구분하기

| 도구·개념 | 역할 |
|---|---|
| H2 | 데이터를 저장하는 **관계형 데이터베이스** |
| JPA | Java 객체와 관계형 데이터베이스를 연결하는 **표준** |
| Hibernate | 이번 프로젝트에서 JPA를 **구현하는 라이브러리** |
| Spring Data JPA | Repository를 통해 저장·조회를 쉽게 쓰도록 지원 |

우리가 쓰는 메서드:

```java
studentRepository.save(student);
```

```java
studentRepository.findAll();
```

- 내부에서는 JPA 구현체(Hibernate)가 필요한 SQL을 실행해 DB와 통신한다.
- **SQL이 없어지는 것이 아니라, 이번에는 객체와 Repository를 통해 쓰는 것**이다. 👉 [Spring 공식 JPA 시작 안내](https://spring.io/guides/gs/accessing-data-jpa/)

> 💡 보충: SQL을 직접 쓰는 방식(MyBatis)과의 비교는 [06_Spring-MyBatis](../06_데이터베이스과정/06_Spring-MyBatis.md) "MyBatis는 무엇인가? — JPA와 비교"에 있다.

### 4. Gradle 의존성 추가하기
프로젝트 루트의 `build.gradle`을 열고 **기존 `dependencies` 안에** 두 줄을 추가한다.

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
runtimeOnly 'com.h2database:h2'
```

- 기존 Spring Web·Thymeleaf 의존성은 유지한다. 같은 블록에 넣고, 이미 있는 의존성은 중복으로 쓰지 않는다.

**Spring Boot 4.x의 H2 Console 의존성** — 4.x에서 H2 웹 콘솔을 쓰려면 이것도 추가한다.

```groovy
runtimeOnly 'org.springframework.boot:spring-boot-h2console'
```

- **Spring Boot 3.x에서는 이 줄을 추가하지 않는다.** 버전은 `build.gradle`의 `plugins` 안 `org.springframework.boot` 항목에서 확인한다. ([Spring Boot 공식 안내](https://docs.spring.io/spring-boot/reference/data/sql.html#data.sql.h2-web-console))

수업 화면의 `dependencies` (Spring Boot 4.x, 화면에서 옮김):

```groovy
// 의존성
dependencies {
    runtimeOnly 'org.springframework.boot:spring-boot-h2console'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.h2database:h2'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    implementation 'org.springframework.boot:spring-boot-starter-webmvc'
    testImplementation 'org.springframework.boot:spring-boot-starter-thymeleaf-test'
    testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

> 💡 보충: Spring Boot 4.x에서는 Spring Web 의존성이 `spring-boot-starter-webmvc`라는 이름으로 들어간다 (3.x는 `spring-boot-starter-web`). 이미 있는 줄이니 그대로 둔다.

**의존성 반영하기**
1. `build.gradle`을 저장한다.
2. IntelliJ의 Gradle 변경 사항 불러오기 또는 Gradle 새로고침을 실행한다.
3. 다운로드가 끝날 때까지 기다린다.

- 버전은 적지 않는다. **프로젝트의 Spring Boot 의존성 관리에 맡긴다.**

### 5. H2 연결 설정 — `application.properties`
`src/main/resources/application.properties`에 추가한다. 기존 포트 설정은 유지하고, 같은 키가 이미 있으면 중복 추가하지 말고 고친다.

```properties
server.port=8080

spring.datasource.url=jdbc:h2:mem:studentdb
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

| 설정 | 역할 |
|---|---|
| `jdbc:h2:mem:studentdb` | 이름이 `studentdb`인 H2 **메모리** DB 사용 |
| `username=sa` | 접속 사용자 이름 |
| `password=` | 이번 실습에서는 빈 비밀번호 |
| `ddl-auto=update` | Entity 정보를 바탕으로 테이블 생성·변경 시도 |
| `show-sql=true` | 실행하는 SQL을 콘솔에 출력 |
| `console.enabled=true` | 개발용 H2 웹 콘솔 활성화 |

- H2 Console 주소: `localhost:<내 포트>/h2-console`
- **메모리 DB는 서버 프로그램이 종료되면 데이터가 사라진다.** 먼저 연결과 저장을 확인한 뒤 파일 모드로 바꿔 본다 (13장).
- `ddl-auto=update`는 **학습용 설정**이다. 실제 서비스에서 DB 구조 변경을 체계적으로 관리하는 방법과는 다르다.

### 6. Student를 Entity로 변경하기
**Entity** = JPA가 데이터베이스와 연결해 관리하는 클래스. 기존 `model/Student.java`를 **수정**한다 (같은 이름의 클래스를 다른 위치에 또 만들지 않는다).

```java
package com.hancoding.student.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private boolean learning;

    protected Student() {
    }

    public Student(String name, boolean learning) {
        this.name = name;
        this.learning = learning;
    }

    public Long getId() {
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

| 코드 | 의미 |
|---|---|
| `@Entity` | JPA가 관리할 Entity 클래스임을 표시 |
| `@Table(name = "students")` | 연결할 테이블 이름을 `students`로 지정 |
| `@Id` | 각 학생을 구분하는 **기본 키 (Primary Key)** |
| `@GeneratedValue(strategy = GenerationType.IDENTITY)` | DB의 **자동 증가** 기능으로 ID 생성 → 컨트롤러에서 `nextId`를 관리하지 않는다 |
| `Long id` | 정수를 표현하는 **참조형**. 저장 전 ID가 없는 상태를 `null`로 표현할 수 있다 |
| `protected Student() {}` | JPA가 객체를 만들 때 쓰는 **매개변수 없는 생성자**. Entity에는 `public` 또는 `protected`인 기본 생성자가 필요하다 |
| `Student(String name, boolean learning)` | 새 학생을 만들 때 쓰는 **등록용 생성자** (ID는 넘기지 않는다) |

```java
Student student = new Student("한코딩", false);
```

- **기존의 `new Student(1, "한코딩", true)` 형태는 새 생성자와 맞지 않는다.** 아래 컨트롤러 교체(9장)까지 마쳐야 컴파일 오류가 사라진다.

> 💡 보충: `long`(기본형)은 `null`을 담을 수 없어서 "아직 저장 안 됨"을 표현하기 어렵다. 그래서 Entity ID는 보통 `Long`(참조형)을 쓴다 ([01_Java기초](01_Java기초.md)의 기본형·참조형).

### 7. Repository 만들기
**Repository** = 데이터 저장·조회를 담당하는 통로. `com.hancoding.student` 아래에 `repository` 패키지를 만들고, 그 안에 **인터페이스** `StudentRepository`를 만든다.

```text
com.hancoding.student
├─ StudentApplication.java
├─ controller/
│  └─ StudentController.java
├─ model/
│  └─ Student.java
└─ repository/
   └─ StudentRepository.java
```

```java
package com.hancoding.student.repository;

import com.hancoding.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository
        extends JpaRepository<Student, Long> {
}
```

| 부분 | 의미 |
|---|---|
| `interface` | 사용할 기능의 규약을 정의하는 형태 |
| `extends JpaRepository` | Spring Data JPA가 제공하는 기능 상속 |
| `Student` | 관리할 Entity 자료형 |
| `Long` | Entity ID의 자료형 |

- **Spring Data JPA가 이 인터페이스를 바탕으로 구현 객체를 만들어 준다.** 그래서 `save()`·`findAll()`의 내부 코드를 직접 쓰지 않는다.

| 메서드 | 역할 |
|---|---|
| `save(student)` | (이번 실습에서) 새 학생 저장 |
| `findAll()` | 전체 학생 조회 |
| `count()` | 저장된 학생 수 조회 |
| `findById(id)` | 특정 ID의 학생 조회 |

### 8. 생성자로 Repository 전달받기 — 의존성 주입(DI)

```java
private final StudentRepository studentRepository;

public StudentController(StudentRepository studentRepository) {
    this.studentRepository = studentRepository;
}
```

- Spring이 컨트롤러를 생성하면서 필요한 Repository 객체를 **전달**한다. 필요한 객체를 외부에서 전달받는 것을 **의존성 주입(DI)** 이라고 한다.
- 생성자가 하나뿐이라 **`@Autowired` 없이** 쓸 수 있다.
- 직접 만들지 않는다. `StudentRepository`는 인터페이스이고, 구현 객체는 Spring Data JPA가 준비한다.

```java
// 작성하지 않습니다.
new StudentRepository();
```

### 9. 기존 목록·등록 기능을 DB 기반으로 바꾸기

| | 기존 (메모리) | DB |
|---|---|---|
| 목록 조회 | `model.addAttribute("students", studentList);` | `model.addAttribute("students",studentRepository.findAll());` |
| 학생 등록 | `studentList.add(student);` + `nextId++` | `studentRepository.save(student);` |

- 기존 `studentList`, `nextId`, 초기 학생을 넣던 생성자는 **제거**한다.
- **이전 Java List의 데이터가 DB로 자동 이전되지 않는다.** 처음 실행하면 **빈 목록**으로 시작한다.
- 이번에는 저장 흐름을 보기 쉽게 **컨트롤러에서 Repository를 직접** 쓴다. `students.html`과 CSS는 그대로 쓴다.

### 10. 등록과 조회 확인 — 콘솔의 SQL
`http://localhost:8080/students`에 접속해 빈 목록 → 등록 → ID 부여 → 새로고침해도 유지를 확인한다. `show-sql=true`라서 서버 콘솔에 이런 SQL이 보인다 (형식은 Hibernate 버전에 따라 다르다).

```sql
insert into students ...
```

```sql
select ... from students ...
```

| 작업 | 내부에서 필요한 DB 작업 |
|---|---|
| `save()`로 새 학생 저장 | INSERT |
| `findAll()`로 목록 조회 | SELECT |

- **화면은 같지만 데이터가 Java List가 아닌 H2에 저장된다.**

### 11. H2 Console에서 데이터 확인하기
**H2 Console** = 브라우저에서 DB에 접속해 테이블과 데이터를 보는 **개발용** 도구. 서버가 실행 중일 때 `http://localhost:8080/h2-console`에 접속한다.

로그인 화면 (Saved Settings는 `Generic H2 (Embedded)` 그대로):

| 항목 | 값 |
|---|---|
| Driver Class | `org.h2.Driver` |
| JDBC URL | `jdbc:h2:mem:studentdb` |
| User Name | `sa` |
| Password | 비워둠 |

- **JDBC URL은 `application.properties`의 값과 같아야 한다.** Connect 후 SQL을 실행한다.

```sql
SELECT * FROM students ORDER BY id;
```

| 부분 | 의미 |
|---|---|
| `SELECT` | 데이터 조회 |
| `*` | 모든 열 |
| `FROM students` | students 테이블에서 |
| `ORDER BY id` | ID 기준 정렬 |

- ID는 학생을 구분하는 고유 값이다. **반드시 빠짐없이 연속된 번호여야 하는 것은 아니다.**

### 12. 메모리 모드에서 재시작해 보기
`jdbc:h2:mem:studentdb` 상태에서 학생을 등록 → 서버 종료 → 다시 실행하면 **목록이 비어 있다.**
- **DB를 써도 메모리 모드라면 프로그램 종료 후 데이터가 유지되지 않는다.**

### 13. 파일 모드로 변경하기
서버를 종료하고 연결 주소만 바꾼다 (나머지 설정, `ddl-auto=update`는 유지).

```text
// 원래 주소
spring.datasource.url=jdbc:h2:mem:studentdb
```

```text
// 파일에 저장하는 방법
spring.datasource.url=jdbc:h2:file:./data/studentdb;DB_CLOSE_ON_EXIT=FALSE
```

> 💡 보충: `// …` 줄은 설명용이다. `.properties` 파일의 주석은 `#`이라서 `//` 줄을 그대로 붙여 넣으면 이상한 설정 키로 읽힌다. 파일에는 `spring.datasource.url=…` 줄만 넣는다 (주석이 필요하면 `# 원래 주소`).

| 부분 | 의미 |
|---|---|
| `jdbc:h2:file:` | H2 파일 모드 |
| `./data/studentdb` | 실행 작업 폴더 기준 DB 파일 경로 |
| `DB_CLOSE_ON_EXIT=FALSE` | DB 종료 처리를 Spring Boot가 관리하도록 설정 |

IntelliJ의 실행 작업 폴더가 프로젝트 루트라면 보통 여기에 파일이 생긴다.

```text
student
└─ data/
   └─ studentdb.mv.db
```

- 메모리 DB와 파일 DB는 **별개**다. 메모리 DB의 학생이 자동으로 복사되지 않는다.
- **H2 Console의 JDBC URL도 바꾼 값과 똑같이** 입력한다: `jdbc:h2:file:./data/studentdb;DB_CLOSE_ON_EXIT=FALSE`

| 구분 | 메모리 모드 | 파일 모드 |
|---|---|---|
| 주소 시작 | `jdbc:h2:mem:` | `jdbc:h2:file:` |
| 데이터 위치 | 메모리 | 파일 |
| 서버 종료 후 유지 | 안 됨 | 같은 DB 파일을 쓰면 유지 |

- **`ddl-auto=create`나 `create-drop`은 테이블을 다시 만들거나 지우므로, 파일 모드여도 데이터를 잃을 수 있다.** 저장 위치와 테이블 생성 설정을 함께 확인한다.

> 💡 보충: 연습장 프로젝트가 GitHub 저장소 안에 있으면 `data/studentdb.mv.db`도 올라갈 수 있다. DB 파일은 `.gitignore`에 넣어 올리지 않는다 (예: `*.mv.db`, `*.trace.db`).

### 14. 전체 처리 흐름

**학생 등록**

```text
이름 입력
    ↓
POST /students
    ↓
컨트롤러에서 빈 이름 검사
    ↓
Student 객체 생성
    ↓
Repository의 save()
    ↓
H2에 저장
    ↓
목록 주소로 리다이렉트
```

**학생 조회**

```text
GET /students
    ↓
Repository의 findAll()
    ↓
H2에서 학생 목록 조회
    ↓
Model에 목록 담기
    ↓
Thymeleaf로 HTML 생성
    ↓
브라우저에 표시
```

### 정리

| 개념 | 핵심 |
|---|---|
| H2 | 학생 정보를 저장하는 데이터베이스 |
| Entity | JPA가 DB와 연결해 관리하는 클래스 |
| `@Id` | 기본 키 |
| `@GeneratedValue` | ID 생성 방식 지정 |
| Repository | 데이터 저장·조회 기능 제공 |
| 의존성 주입 | 필요한 객체를 Spring에서 전달받음 |
| `save()` | (이번 실습에서) 새 학생 저장 |
| `findAll()` | 전체 학생 조회 |
| 메모리·파일 모드 | 데이터 보관 위치와 유지 방식의 차이 |

## 실습 정리

### 만든 것
[04](04_폼-학생등록.md)의 학생 목록·등록 화면을 그대로 두고, 저장소만 **H2 데이터베이스**로 바꿨다. 처음엔 빈 목록으로 시작하고, 등록하면 DB가 ID(1, 2, …)를 붙인다. H2 Console에서 `students` 테이블을 직접 조회하고, 파일 모드로 바꿔 재시작 후에도 학생이 남는 것을 확인했다.

### 단계 흐름
1. `build.gradle`에 JPA·H2(+ Boot 4.x는 `spring-boot-h2console`) 추가 → Gradle 새로고침
2. `application.properties`에 H2 연결·JPA·H2 Console 설정 추가 (메모리 모드)
3. `model/Student.java`를 Entity로 교체 (이 시점엔 컨트롤러에서 컴파일 오류가 나는 게 정상)
4. `repository/StudentRepository.java` 인터페이스 생성
5. `StudentController.java`를 Repository 사용 코드로 교체 (생성자 주입, `findAll()`·`save()`)
6. `/students`에서 등록·조회 확인, 콘솔의 SQL 확인
7. `/h2-console`에 접속해 `SELECT * FROM students ORDER BY id;`
8. 메모리 모드 재시작 → 비어 있음 확인 → 파일 모드로 바꾸고 재시작해도 유지되는지 확인

### 최종 코드 (강의 본문)

**`build.gradle`의 `dependencies`에 추가**

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
runtimeOnly 'com.h2database:h2'
// Spring Boot 4.x만
runtimeOnly 'org.springframework.boot:spring-boot-h2console'
```

**`application.properties`** — 5장 코드. 파일 모드는 `spring.datasource.url`만 13장 값으로 바꾼다.

**`model/Student.java`** — 6장 코드. **`repository/StudentRepository.java`** — 7장 코드.

**`controller/StudentController.java`**

```java
package com.hancoding.student.controller;

import com.hancoding.student.model.Student;
import com.hancoding.student.repository.StudentRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(
            StudentRepository studentRepository
    ) {
        this.studentRepository = studentRepository;
    }

    @GetMapping("/students")
    public String students(Model model) {
        model.addAttribute("schoolName", "한코딩 스쿨");
        model.addAttribute(
                "message",
                "데이터베이스에 저장된 학생 목록입니다."
        );
        model.addAttribute(
                "students",
                studentRepository.findAll()
        );

        return "students";
    }

    @PostMapping("/students")
    public String addStudent(
            @RequestParam(name = "name", defaultValue = "") String name,
            Model model
    ) {
        String trimmedName = name.trim();

        if (trimmedName.isEmpty()) {
            model.addAttribute(
                    "error",
                    "학생 이름을 입력해주세요."
            );

            return students(model);
        }

        Student student = new Student(
                trimmedName,
                false
        );

        studentRepository.save(student);

        return "redirect:/students";
    }
}
```

**`templates/students.html`과 `static/css/students.css`** — [04](04_폼-학생등록.md)의 최종 코드와 같다 (강의 맨 아래에 같은 HTML과 폼 스타일 CSS가 다시 실려 있다).

### 수업 코드 (`com.example.www`)
수업에서는 [000](000_세팅-데이터입력.md)의 `www` 프로젝트에 이어서 만들었다. 수업 화면의 최종 구조:

```text
src/main/
├─ java/com.example.www/
│  ├─ controller/
│  │  └─ StudentController.java
│  ├─ model/
│  │  └─ Student.java
│  ├─ repository/
│  │  └─ StudentRepository.java    ← 인터페이스
│  └─ WwwApplication.java
└─ resources/
   ├─ static/css/students.css      ← IntelliJ 화면에는 static.css로 합쳐 보임
   ├─ templates/students.html
   └─ application.properties
```

**중간 단계 — `@RestController`로 저장만 시험해 본 `MainController`** (그다음 H2 Console에서 `select * from students` 실행)

```java
package com.example.www.controller;

import com.example.www.model.Student;
import com.example.www.repository.StudentRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController // -> 필요한 데이터만 요청하는 쪽에 반환해 준다.
public class MainController {

    List<String> nameList = new ArrayList<>();

    private final StudentRepository repository;

    public MainController(StudentRepository studentRepository) {
        this.repository = studentRepository;
    }

    @GetMapping("/")
    public List<String> index() {
        Student s = new Student("한코딩", true);

        repository.save(s);

        return nameList;
    }

    @PostMapping("/insert")
    public String nameInsert(String hello) {
        nameList.add(hello);
        return "redirect:/";
    }
}

```

```sql
select * from students
```

> 💡 보충: 저장이 되는지 보려는 **시험용 코드**다. `GET /`을 열 때마다(새로고침할 때마다) "한코딩" 행이 하나씩 더 저장되고, 화면에는 `nameList`가 JSON으로 나온다. `@RestController`라서 `nameInsert`의 `"redirect:/"`는 이동하지 않고 **글자로 응답**된다. `Controller`·`Model` import는 쓰지 않는다.

**`controller/StudentController.java` (수업 최종)**

```java
package com.example.www.controller;

import com.example.www.model.Student;
import com.example.www.repository.StudentRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller // -> 필요한 데이터만 요청하는 쪽에 반환해 준다.
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping("/students")
    public String students(Model model) {
        model.addAttribute("schoolName", "한코딩 스쿨");
        model.addAttribute("msg", "데이터베이스에 저장된 학생 목록입니다");

        model.addAttribute("students", studentRepository.findAll());

        return "students";
    }

    @PostMapping("/students")
    public String addStudent(
            @RequestParam(name = "name", defaultValue = "") String name,
            Model model) {

        String trimmedName = name.trim();

        if (trimmedName.isEmpty()) {
            model.addAttribute("error", "학생 이름을 입력해 주세요.");

            return students(model);
        }

        Student s = new Student(trimmedName, false);

        studentRepository.save(s);

        return "redirect:/students";
    }


}

```

> 💡 보충: (1) 안내 문구를 `"msg"`로 넣었는데 `students.html`은 `${message}`를 읽는다 → **안내 문구 자리가 비어 보인다.** 둘 중 하나로 이름을 맞춘다 (강의 본문 코드는 `"message"`). (2) `@Controller` 옆 주석은 `@RestController`의 설명이다. `@Controller`는 반환한 문자열과 같은 이름의 HTML을 응답한다.

**`repository/StudentRepository.java` (수업)**

```java
package com.example.www.repository;

import com.example.www.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
}
```

> 💡 보충: `JpaRepository`를 상속한 인터페이스는 Spring Data JPA가 알아서 찾아 등록하므로 `@Repository`는 없어도 된다 (붙여도 문제없다).

**`model/Student.java` (수업)** — 강의 본문 코드에 **setter**를 더한 것이다.

```java
package com.example.www.model;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private boolean learning;

    protected Student() {
    }

    public Student(String name, boolean learning) {
        this.name = name;
        this.learning = learning;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isLearning() {
        return learning;
    }

    public void setLearning(boolean learning) {
        this.learning = learning;
    }
}
```

**`application.properties` (수업)**

```properties
spring.application.name=www

server.port=8080

spring.datasource.url=jdbc:h2:mem:studentdb
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

### 복습용 코드 (2026-11-16 수업)
새 프로젝트(`com.example.example1116`)에서 **이름·닉네임**을 저장하는 예제를 다시 만들었다. 메인 화면(`/`)에 추가 폼과 학생 목록이 함께 있다.

```java
package com.example.example1116.model;

import jakarta.persistence.*;

@Entity
public class Student {

    @Id // PK
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String nickname;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
}

```

```java
package com.example.example1116.repository;

import com.example.example1116.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
}

```

```java
package com.example.example1116.controller;

import com.example.example1116.model.Student;
import com.example.example1116.repository.StudentRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Controller // 메소드에서 문자열에 들어간 이름을 가진 HTML을 반환해 준다.
public class MainController {

    private final StudentRepository repository;

    // 생성자 주입
    public MainController(StudentRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/")
    public String index(Model model) {

        String name = "한코딩";

        model.addAttribute("name", name);

        List<Student> studentList = repository.findAll();

        model.addAttribute("studentList", studentList);

        return "index";
    }

    @PostMapping("/student/insert")
    public String insert(String name, String nickname) {

        Student newStudent = new Student();
        newStudent.setName(name);
        newStudent.setNickname(nickname);

        repository.save(newStudent);

        return "redirect:/";
    }
}

```

> 💡 보충: 이 `Student`는 생성자를 쓰지 않아서 Java가 만들어 주는 **기본 생성자**(`new Student()`)로 만들고 **setter로 값을 채운다**. `@Table`이 없으면 테이블 이름은 클래스 이름을 따라 `student`가 된다. `insert(String name, String nickname)`은 `@RequestParam`을 생략해 **매개변수 이름 = 입력창 `name`** 으로 값을 받는다 ([000](000_세팅-데이터입력.md) 6장).

<details><summary><code>templates/index.html</code> (복습용, Tailwind CSS 사용)</summary>

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>사이트 메인 - 반갑습니다</title>
    <style>
        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-1Thin.woff2') format('woff2');
            font-weight: 100;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-2ExtraLight.woff2') format('woff2');
            font-weight: 200;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-3Light.woff2') format('woff2');
            font-weight: 300;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-4Regular.woff2') format('woff2');
            font-weight: 400;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-5Medium.woff2') format('woff2');
            font-weight: 500;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-6SemiBold.woff2') format('woff2');
            font-weight: 600;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-7Bold.woff2') format('woff2');
            font-weight: 700;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-8ExtraBold.woff2') format('woff2');
            font-weight: 800;
            font-display: swap;
        }

        @font-face {
            font-family: 'Paperozi';
            src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-9Black.woff2') format('woff2');
            font-weight: 900;
            font-display: swap;
        }

        body {
            font-family: 'Paperozi', sans-serif;
        }

        input,
        button,
        select,
        textarea {
            font-family: inherit;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex items-center justify-center p-4">
<!-- 메인 컨테이너 카드 -->
<main class="w-full max-w-lg bg-white rounded-2xl shadow-md border border-slate-100 p-6 sm:p-8">

    <!-- 학생 추가 폼 -->
    <section class="mb-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">학생 추가</h2>

        <form th:action="@{/student/insert}"
              action="/student/insert"
              method="post"
              class="space-y-3">

            <div>
                <label for="studentName"
                       class="block text-xs font-medium text-slate-600 mb-1">
                    이름
                </label>
                <input type="text"
                       id="studentName"
                       name="name"
                       placeholder="학생 이름을 입력하세요"
                       required
                       class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
            </div>

            <div>
                <label for="studentNickname"
                       class="block text-xs font-medium text-slate-600 mb-1">
                    닉네임
                </label>
                <input type="text"
                       id="studentNickname"
                       name="nickname"
                       placeholder="닉네임을 입력하세요"
                       required
                       class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
            </div>

            <button type="submit"
                    class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                학생 추가
            </button>
        </form>
    </section>
    <!-- 헤더 영역 -->
    <header class="border-b border-slate-100 pb-5 mb-6">
            <span class="inline-block px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full mb-2">
                MAIN DASHBOARD
            </span>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
            사이트 메인입니다.
        </h1>
        <p class="mt-2 text-sm text-slate-600">
            <span th:text="${name}" class="font-semibold text-indigo-600">사용자</span>님 안녕하세요? 반갑습니다.
        </p>
    </header>

    <!-- 학생 목록 섹션 -->
    <section>
        <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-slate-700">학생 목록</h2>
            <span th:unless="${#lists.isEmpty(studentList)}"
                  th:text="|총 ${#lists.size(studentList)}명|"
                  class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                </span>
        </div>

        <!-- 1. 학생이 없을 때 (Empty State) -->
        <div th:if="${#lists.isEmpty(studentList)}"
             class="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p class="text-sm text-slate-500">등록된 학생이 없습니다.</p>
        </div>

        <!-- 2. 학생 목록이 있을 때 -->
        <ul th:unless="${#lists.isEmpty(studentList)}" class="space-y-2.5">
            <li th:each="student : ${studentList}"
                class="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-100 transition-colors">

                <div class="flex items-center gap-3">
                    <!-- 이름 첫 글자 아바타 배지 -->
                    <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0"
                         th:text="${#strings.substring(student.name, 0, 1)}">
                        홍
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800" th:text="${student.name}">홍길동</p>
                        <p class="text-xs text-slate-500">학생</p>
                    </div>
                </div>

                <!-- 닉네임 태그 -->
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-600 border border-slate-200 shadow-xs"
                      th:text="|@${student.nickname}|">
                        @닉네임
                    </span>
            </li>
        </ul>
    </section>

</main>

</body>
</html>

```
</details>

> 💡 보충: `xmlns:th="http://thymeleaf.org"`는 정식 주소(`http://www.thymeleaf.org`)와 다르지만 `th:` 속성은 그대로 동작한다 (IDE 자동 완성용 선언). `|총 ${…}명|`은 글자와 값을 이어 붙이는 Thymeleaf **리터럴 치환**, `#strings.substring(student.name, 0, 1)`은 이름의 **첫 글자**를 꺼낸다.

### 직접 확인하기 (미션)
- [ ] 처음 `/students`에 접속하면 "등록된 학생이 없습니다."가 보인다.
- [ ] 학생을 등록하면 ID가 붙어 목록에 표시되고, 더 등록하면 ID가 늘어난다.
- [ ] 브라우저를 새로고침해도 목록이 유지된다.
- [ ] 서버 콘솔에 `insert into students …`, `select … from students …` SQL이 보인다.
- [ ] `/h2-console`에 로그인해 `SELECT * FROM students ORDER BY id;`로 등록한 이름을 확인한다.
- [ ] 메모리 모드에서 서버를 재시작하면 목록이 빈다.
- [ ] 파일 모드로 바꾸고 등록 → 정상 종료 → 재실행해도 학생이 남는다 (`data/studentdb.mv.db` 생성 확인).

## 헷갈리기 쉬운 점
- **DB를 써도 메모리 모드(`jdbc:h2:mem:`)면 재시작하면 사라진다.** 유지하려면 파일 모드(`jdbc:h2:file:`).
- **H2 Console의 JDBC URL은 `application.properties`의 값과 똑같이** 입력한다. 다르면 다른(빈) DB에 접속해서 테이블이 안 보인다.
- **Spring Boot 4.x는 `spring-boot-h2console` 의존성이 있어야 `/h2-console`이 열린다.** 3.x에서는 넣지 않는다.
- **`Student` Entity에는 매개변수 없는 생성자(`public`/`protected`)가 필요하다.**
- **기존 `new Student(1, "한코딩", true)`는 컴파일 오류.** ID는 DB가 만들므로 `new Student("한코딩", false)`처럼 이름·학습 여부만 넘긴다. `nextId`도 지운다.
- **`StudentRepository`는 인터페이스다.** `new StudentRepository()`로 만들지 않고 생성자로 전달받는다.
- **Entity·Repository는 실행 클래스의 하위 패키지에** 둔다 (`model`, `repository`).
- **Java List의 기존 학생은 DB로 옮겨지지 않는다.** 처음엔 빈 목록이 정상이다.
- **`ddl-auto=create`·`create-drop`은 파일 모드여도 데이터를 지울 수 있다.**
- **ID는 연속 번호가 아닐 수 있다.** 고유하기만 하면 된다.
- **같은 DB 파일을 쓰는 서버를 두 개 띄우면** 파일 사용 중 오류가 난다.

**동작하지 않을 때 확인할 것**

| 증상 | 확인할 내용 |
|---|---|
| `jakarta.persistence`를 찾지 못함 | JPA 의존성 추가와 Gradle 새로고침 |
| 생성자 관련 컴파일 오류 | 기존의 ID 포함 Student 생성 코드를 제거했는지 |
| 기본 생성자 관련 오류 | `protected Student()`가 있는지 |
| Repository를 찾지 못함 | 실행 클래스 하위 패키지인지, 인터페이스 선언이 맞는지 |
| ID 관련 오류 | `@Id`, `@GeneratedValue`, `Long` 자료형 |
| H2 Console이 404 | 활성화 설정, 서버 재시작, Boot 4.x 콘솔 의존성 |
| 콘솔에서 테이블이 안 보임 | 앱과 콘솔의 JDBC URL이 같은지 |
| 파일 모드인데 목록이 사라짐 | URL·작업 폴더·DB 파일·`ddl-auto` 설정 |
| DB 파일 사용 중 오류 | 같은 파일을 쓰는 다른 서버가 실행 중인지 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| JPA·H2 추가 | `build.gradle` | `implementation 'org.springframework.boot:spring-boot-starter-data-jpa'` / `runtimeOnly 'com.h2database:h2'` |
| H2 Console (Boot 4.x) | `build.gradle` | `runtimeOnly 'org.springframework.boot:spring-boot-h2console'` |
| 메모리 DB 연결 | `application.properties` | `spring.datasource.url=jdbc:h2:mem:studentdb` |
| 파일 DB 연결 | `application.properties` | `spring.datasource.url=jdbc:h2:file:./data/studentdb;DB_CLOSE_ON_EXIT=FALSE` |
| 테이블 자동 생성·변경 | `ddl-auto` | `spring.jpa.hibernate.ddl-auto=update` |
| SQL 콘솔 출력 | `show-sql` | `spring.jpa.show-sql=true` |
| H2 Console 켜기 | `h2.console` | `spring.h2.console.enabled=true` → `/h2-console` |
| Entity 표시 | `@Entity` + `@Table` | `@Entity @Table(name = "students")` |
| 기본 키 + 자동 증가 | `@Id` + `@GeneratedValue` | `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;` |
| JPA용 기본 생성자 | `protected` 생성자 | `protected Student() {}` |
| Repository 만들기 | `JpaRepository<Entity, ID>` | `public interface StudentRepository extends JpaRepository<Student, Long> {}` |
| Repository 받기 (DI) | 생성자 주입 | `public StudentController(StudentRepository studentRepository) { … }` |
| 저장 / 전체 조회 | `save()` / `findAll()` | `studentRepository.save(student);` / `studentRepository.findAll()` |
| 개수 / ID로 조회 | `count()` / `findById()` | `studentRepository.count()` / `studentRepository.findById(id)` |
| DB 직접 확인 | H2 Console SQL | `SELECT * FROM students ORDER BY id;` |

## 확인 문제

<details><summary>Q. 04까지 학생 데이터는 어디에 있었고, 서버를 끄면 왜 사라졌는가? 이번에는 어디에 저장하는가?</summary>

컨트롤러 필드의 Java `List`, 즉 실행 중인 프로그램의 **메모리**에 있었다. 프로그램이 끝나면 메모리가 비워지므로 사라졌다. 이번에는 `컨트롤러 → Repository → H2 데이터베이스`로 저장한다.
</details>

<details><summary>Q. H2, JPA, Hibernate, Spring Data JPA는 각각 무슨 역할인가?</summary>

H2 = 데이터를 저장하는 관계형 DB, JPA = Java 객체와 관계형 DB를 연결하는 **표준**, Hibernate = JPA를 **구현한 라이브러리**, Spring Data JPA = Repository로 저장·조회를 쉽게 쓰게 해 주는 지원 기능.
</details>

<details><summary>Q. Repository로 저장하면 SQL이 없어지는가?</summary>

아니다. `save()`는 INSERT, `findAll()`은 SELECT처럼 **JPA 구현체가 필요한 SQL을 만들어 실행**한다. `show-sql=true`면 콘솔에서 볼 수 있다. 이번에는 SQL을 직접 쓰지 않고 객체와 Repository를 통해 쓸 뿐이다.
</details>

<details><summary>Q. `@Entity`, `@Table(name = "students")`, `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`는 각각 무엇을 하는가?</summary>

`@Entity` = JPA가 관리할 클래스 표시, `@Table` = 연결할 테이블 이름을 `students`로 지정, `@Id` = 기본 키, `@GeneratedValue(IDENTITY)` = DB의 자동 증가로 ID 생성 (그래서 `nextId`가 필요 없다).
</details>

<details><summary>Q. Entity의 ID를 `Long`으로 쓰는 이유와 `protected Student() {}`가 필요한 이유는?</summary>

`Long`은 참조형이라 **저장 전 ID가 없는 상태를 `null`** 로 표현할 수 있다. 매개변수 없는 생성자는 **JPA가 객체를 만들 때** 쓰므로 Entity에 `public` 또는 `protected`로 있어야 한다.
</details>

<details><summary>Q. `StudentRepository`는 인터페이스인데 `save()`·`findAll()`의 코드는 누가 만드는가? 컨트롤러에서는 어떻게 받는가?</summary>

`JpaRepository<Student, Long>`을 상속하면 **Spring Data JPA가 구현 객체를 만들어** 준다. 컨트롤러는 `new`로 만들지 않고 **생성자 매개변수로 전달받는다** (의존성 주입, DI). 생성자가 하나면 `@Autowired`가 없어도 된다.
</details>

<details><summary>Q. DB로 바꾼 뒤 처음 실행하면 왜 목록이 비어 있는가?</summary>

이전 Java List의 데이터(초기 학생 3명)는 **DB로 자동 이전되지 않고**, 초기 학생을 넣던 생성자도 지웠기 때문이다. 새 DB의 `students` 테이블은 비어 있다.
</details>

<details><summary>Q. H2 Console에 접속했는데 `students` 테이블이 안 보인다. 무엇을 확인하는가?</summary>

로그인 화면의 **JDBC URL이 `application.properties`의 `spring.datasource.url`과 같은지** 확인한다 (예: `jdbc:h2:mem:studentdb`). 다르면 다른 빈 DB에 접속한 것이다. 서버가 실행 중인지도 본다.
</details>

<details><summary>Q. 메모리 모드와 파일 모드는 주소와 결과가 어떻게 다른가?</summary>

메모리 모드 `jdbc:h2:mem:studentdb`는 서버를 끄면 데이터가 사라진다. 파일 모드 `jdbc:h2:file:./data/studentdb;DB_CLOSE_ON_EXIT=FALSE`는 `data/studentdb.mv.db` 파일에 저장돼 **같은 파일을 쓰면 재시작 후에도 유지**된다.
</details>

<details><summary>Q. 파일 모드인데도 데이터가 사라질 수 있는 설정은?</summary>

`spring.jpa.hibernate.ddl-auto=create` 또는 `create-drop`. 테이블을 다시 만들거나 지운다. 작업 폴더가 달라 다른 DB 파일을 여는 경우도 확인한다.
</details>

## 완료 체크
- [ ] Gradle에 JPA와 H2 의존성을 추가했다.
- [ ] Student를 Entity로 변경했다.
- [ ] Repository를 만들고 컨트롤러에 주입했다.
- [ ] 학생 등록을 DB 저장으로 변경했다.
- [ ] DB에서 조회한 목록을 Thymeleaf에 표시했다.
- [ ] H2 Console에서 데이터를 확인했다.
- [ ] 메모리 모드와 파일 모드의 차이를 확인했다.

## 질문 노트

_아직 없음_
