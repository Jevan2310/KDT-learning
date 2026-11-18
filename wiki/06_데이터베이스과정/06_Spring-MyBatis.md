# 06. Spring과 MyBatis — 작성한 SQL을 서비스에서 실행하기

> 과정: 데이터베이스과정 · [노션 원문](https://app.notion.com/p/41a848f71c9b8003b2fee29896ffb232) · 최종 갱신일: 2026-11-18

## 한눈에 보기
- 지금까지 DBeaver에서 직접 실행한 SQL을 **백엔드가 요청을 받을 때 실행**하도록 만든다: 요청 → Spring → SQL 실행 → DB 조회 → JSON 응답.
- **MyBatis** = 개발자가 **직접 쓴 SQL**을 실행하고, 전달할 값과 조회 결과를 Java 코드에 연결하는 도구 (JPA는 기본 CRUD SQL을 직접 쓰지 않아도 됨).
- **Mapper** = `StudentMapper.java`(호출할 메서드, `@Mapper`) + `StudentMapper.xml`(실행할 SQL). XML의 **`namespace` = 인터페이스 전체 이름**, SQL의 **`id` = 메서드 이름**으로 연결된다. `resultType`에는 **한 행**을 담을 타입(`Student`)을 쓴다.
- 값은 **`#{...}`** 로 바인딩한다 (문자열도 따옴표 없이). `map-underscore-to-camel-case=true`로 `registered_date` ↔ `registeredDate`가 연결된다. `useGeneratedKeys`로 새 `id`를 객체에 받는다.
- `@RestController`에서 Mapper를 **생성자로 받아** 호출하고, 학생 CRUD API(`GET`/`POST`/`PUT`/`DELETE /students`)를 만들었다. 비밀번호는 `application.properties`에 쓰지 않고 **환경변수 `${DB_PASSWORD}`** 로 읽는다.

## 학습 목표
- MyBatis가 하는 일을 이해한다.
- Spring에서 MySQL 또는 H2에 연결한다.
- Mapper 인터페이스와 XML에 작성한 SQL을 연결한다.
- SQL 실행 결과를 Java 객체로 받아 JSON으로 응답한다.
- 학생 조회·추가·수정·삭제 API를 만든다.

## 핵심 개념

### 1. DBeaver에서 쓴 SQL을 서비스에서 실행하려면?

```sql
SELECT *
FROM students
ORDER BY id ASC;
```

사용자가 학생 목록 버튼을 누를 때마다 개발자가 이 SQL을 대신 실행할 수는 없다. **백엔드가 요청을 받고 SQL을 실행**해야 한다.

```text
사용자의 학생 목록 요청
          ↓
Spring이 요청을 받음
          ↓
SQL 실행
          ↓
DB에서 학생 목록 조회
          ↓
JSON으로 응답
```

> 💡 보충: Node 과정의 학생 API([03_서버-데이터보내기](../02_Node과정/03_서버-데이터보내기.md))와 흐름이 같다. 다른 점은 데이터가 코드 안의 배열이 아니라 **MySQL 테이블**에 있다는 것이다.

### 2. MyBatis는 무엇인가? — JPA와 비교

| 구분 | 이번 수업에서 이해할 핵심 |
|---|---|
| JPA | **객체 중심**으로 데이터를 다루며, 기본 CRUD SQL을 직접 쓰지 않아도 됨 |
| MyBatis | **SQL을 직접 작성**하고 Java 메서드와 연결 |

```java
studentMapper.findAll();
```

이 메서드를 호출하면 연결된 SQL이 실행된다.

```sql
SELECT id, name, email, registered_date, class_id
FROM students
ORDER BY id ASC;
```

### 3. Mapper — 인터페이스 + XML

| 파일 | 역할 |
|---|---|
| `StudentMapper.java` | Java에서 호출할 메서드 정의 |
| `StudentMapper.xml` | 메서드가 실행할 SQL 작성 |

```text
StudentMapper의 findAll() 호출
                 ↓
XML에서 id가 findAll인 SQL 실행
                 ↓
조회 결과를 Student 객체 목록으로 반환
```

### 4. 실습 프로젝트 준비
기존 JPA 예제와 설정이 섞이지 않도록 **별도의 Spring Boot 프로젝트**를 만든다. DB는 앞에서 만든 `school`을 그대로 쓴다.

| 항목 | 설정 |
|---|---|
| Project | Gradle - Groovy |
| Language | Java |
| Java | 17 이상 |
| Group | `com.hancoding` |
| Artifact | `student-mybatis` |
| Package name | `com.hancoding.studentmybatis` |
| 기본 의존성 | Spring Web |

- 의존성 예제는 **Spring Boot 3.5.x + MyBatis Starter 3.0.5** 기준이다.
- MyBatis Starter는 **Spring Boot 버전에 맞춰** 고른다. 공식 호환표 기준 Boot 3.2~3.5 → Starter **3.0** 계열, Boot 4 → Starter **4.0** 계열. ([MyBatis 공식 호환 안내](https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/))
- 이번 프로젝트에는 **Spring Data JPA를 추가하지 않는다.** 기존 테이블을 쓰고 SQL은 MyBatis에서 직접 쓴다.

> 💡 보충: Spring 과정 수업 화면의 프로젝트는 Spring Boot 4.x였다 ([02_SpringBoot시작](../03_Spring과정/02_SpringBoot시작.md) 맨 앞). start.spring.io에서 4.x로 만들었다면 Starter도 **4.0 계열**로 맞춘다. 버전이 안 맞으면 서버가 제대로 실행되지 않을 수 있다.

**`build.gradle`** — 기존 플러그인·Java 설정은 그대로 두고 `dependencies`에 추가한다.

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.5'

    runtimeOnly 'com.mysql:mysql-connector-j'
    runtimeOnly 'com.h2database:h2'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

- DB 드라이버를 두 개(MySQL, H2) 넣어도 **실제 접속 대상은 설정에서 고른 하나**다.
- 수정한 뒤 IntelliJ의 **Gradle 변경 사항 불러오기**를 실행한다.

### 5. 데이터베이스 연결 설정 — `application.properties`
`src/main/resources/application.properties`에 **MySQL과 H2 중 내가 쓰는 것 하나만** 쓴다.

**MySQL**

```properties
spring.application.name=student-mybatis

spring.datasource.url=jdbc:mysql://localhost:3306/school
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

mybatis.mapper-locations=classpath:/mappers/*.xml
mybatis.configuration.map-underscore-to-camel-case=true
```

- **`${DB_PASSWORD}`** = 환경변수에서 값을 읽으라는 뜻이다. IntelliJ 실행 설정의 **Environment variables / 환경변수** 항목에 추가한다.

```text
DB_PASSWORD=<비밀번호>
```

- 이번엔 로컬 확인용으로 `root`를 쓰지만, 실제 서비스에서는 **필요한 권한만 가진 별도 계정**을 쓴다.

> 💡 보충: IntelliJ에서 **Run → Edit Configurations…** → 실행할 애플리케이션 → **Environment variables** 칸에 `DB_PASSWORD=실제비밀번호`를 넣는다. 이렇게 하면 비밀번호가 `application.properties`(=공개 저장소에 올라가는 파일)에 남지 않는다.

**H2를 쓰는 경우** — 앞에서 파일 방식으로 만든 DB의 연결 정보를 쓴다.

```properties
spring.application.name=student-mybatis

spring.datasource.url=jdbc:h2:~/school;MODE=MySQL;DATABASE_TO_LOWER=TRUE;IFEXISTS=TRUE
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver

mybatis.mapper-locations=classpath:/mappers/*.xml
mybatis.configuration.map-underscore-to-camel-case=true
```

- 가정: 기존 DB 주소가 `jdbc:h2:~/school`, 처음부터 MySQL 모드·소문자 설정을 썼음, 사용자 `sa`·비밀번호 없음. **다르면 실제 값에 맞춘다.**
- `IFEXISTS=TRUE` = 지정한 파일 DB가 없으면 새 빈 DB를 만들지 않고 **오류**를 낸다.
- 파일 방식 H2는 **다른 프로그램이 같은 DB 파일을 열고 있으면 잠금 오류**가 날 수 있다. → 기존 SQL 작업을 `COMMIT`/`ROLLBACK` → DBeaver·H2 프로그램의 연결 종료 → Spring 실행. 나중에 DBeaver로 확인할 때는 Spring을 먼저 끈다. DB를 만든 H2 버전과 프로젝트의 H2 버전 호환도 확인한다. ([H2 연결·파일 잠금 안내](https://h2database.github.io/html/features.html))

**MyBatis 설정의 의미**

| 설정 | 역할 |
|---|---|
| `mapper-locations` | SQL을 작성한 Mapper XML 파일 위치 |
| `map-underscore-to-camel-case` | `registered_date` 같은 열 이름을 `registeredDate` 같은 Java 속성에 연결 |

- **MyBatis가 테이블을 자동으로 만들지 않는다.** DB에 `students`와 `classes` 테이블이 있어야 한다 ([02](02_테이블-데이터추가.md), [05](05_테이블관계-JOIN.md)).

### 6. 조회 결과를 담을 `Student` 클래스
DB의 학생 **한 행 = Java 객체 하나**로 받는다.

| DB 열 | Java 속성 |
|---|---|
| `id` | `id` |
| `name` | `name` |
| `email` | `email` |
| `registered_date` | `registeredDate` |
| `class_id` | `classId` |

```java
private Integer id;
private String name;
private String email;
private LocalDate registeredDate;
private Integer classId;
```

| 자료형 | 의미 |
|---|---|
| `Integer` | `null`도 표현할 수 있는 정수 타입 |
| `LocalDate` | 시각 없이 연·월·일을 나타내는 타입 (DB의 `DATE`) |

- 소속 반이 없는 학생은 `classId`가 `null`일 수 있으므로 `int` 대신 **`Integer`**.
- Getter·Setter = 객체의 값을 읽고 설정하는 메서드. IntelliJ 코드 생성 기능으로 만들 수 있다.
- 데이터를 담는 용도라서 **JPA의 `@Entity`는 붙이지 않는다.**

### 7. Mapper 인터페이스 — `@Mapper`, `@Param`

```java
@Mapper
public interface StudentMapper {

    List<Student> findAll();

    Student findById(@Param("id") Integer id);

    int insert(Student student);

    int update(Student student);

    int deleteById(@Param("id") Integer id);
}
```

| 메서드 | 역할 | 반환값 |
|---|---|---|
| `findAll()` | 전체 조회 | 학생 객체 목록 |
| `findById(id)` | 번호로 한 명 조회 | 학생 객체 또는 `null` |
| `insert(student)` | 학생 추가 | 영향을 받은 행 수 |
| `update(student)` | 학생 수정 | 영향을 받은 행 수 |
| `deleteById(id)` | 학생 삭제 | 영향을 받은 행 수 |

- **`@Mapper`** = MyBatis가 SQL과 연결할 Mapper 인터페이스라는 표시. 인터페이스에는 메서드 이름과 입력·반환 타입만 정하고, SQL은 XML에 쓴다.
- **`@Param("id")`** = 전달받은 값을 SQL에서 `id`라는 이름으로 쓰게 한다 → XML에서 `WHERE id = #{id}`.

### 8. Mapper XML — `namespace`, `id`, `resultType`, `#{...}`
파일 위치: `src/main/resources/mappers/StudentMapper.xml` (전체 코드는 아래 실습 정리)

**① `namespace` ↔ 인터페이스**

```xml
<mapper namespace="com.hancoding.studentmybatis.StudentMapper">
```

- **패키지 이름을 포함한** Mapper 인터페이스의 전체 이름.

**② SQL `id` ↔ 메서드 이름**

```java
List<Student> findAll();
```

```xml
<select id="findAll">
```

- 이름이 다르면 MyBatis가 실행할 SQL을 **찾지 못한다.**

**③ `resultType` = 결과를 담을 객체 타입**

```xml
resultType="com.hancoding.studentmybatis.Student"
```

- 조회한 각 행을 `Student` 객체로 받는다.
- `findAll()`은 `List<Student>`를 반환하지만, **XML의 `resultType`에는 목록이 아니라 한 행의 타입**을 쓴다.

**④ `#{...}` = 값을 전달하는 자리**

```sql
WHERE id = #{id}
```

```sql
WHERE email = #{email}
```

- MyBatis가 전달받은 값을 SQL에 **바인딩**한다. **문자열도 직접 따옴표로 감싸지 않는다.**
- 입력값을 SQL 문자열에 직접 붙이는 **`${...}`와 구분**한다. 이번 실습은 값 전달에 **`#{...}`** 를 쓴다.

> 💡 보충: `${...}`는 값을 SQL 글자에 그대로 이어 붙인다. 사용자가 입력한 값을 `${...}`로 넣으면 입력 안에 SQL 조각을 섞어 보내는 공격(**SQL 인젝션**)에 노출된다. 값은 `#{...}`로 전달한다.

**⑤ 자동 생성된 번호 받기**

```xml
useGeneratedKeys="true"
keyProperty="id"
keyColumn="id"
```

- 학생을 추가한 뒤 **DB가 만든 번호(`AUTO_INCREMENT`)를 전달했던 `Student` 객체의 `id`에** 넣는다. → Controller가 `student.getId()`로 새 번호를 쓸 수 있다. ([MyBatis Mapper XML 공식 안내](https://mybatis.org/mybatis-3/sqlmap-xml.html))

### 9. Controller에서 Mapper 호출

**생성자로 Mapper 받기**

```java
public StudentController(StudentMapper studentMapper) {
    this.studentMapper = studentMapper;
}
```

- Spring과 MyBatis가 준비한 Mapper를 **생성자로 전달받는다.** Mapper 구현 클래스를 직접 만들거나 `new StudentMapper()`를 쓰지 않는다.
- 처음에는 Controller에서 Mapper를 바로 호출한다. 업무 규칙이 늘면 **Service 계층**으로 나눌 수 있다.

**API 정리**

| 요청 | 기능 | 정상 응답 |
|---|---|---|
| `GET /students` | 전체 조회 | `200` + JSON 목록 |
| `GET /students/{id}` | 상세 조회 | `200` + JSON 객체 |
| `POST /students` | 학생 추가 | `201` + 추가된 객체 |
| `PUT /students/{id}` | 학생 수정 | `204` |
| `DELETE /students/{id}` | 학생 삭제 | `204` |

- **`204`** = 처리는 완료됐고 **응답 본문이 없다.**
- 상세 조회·수정·삭제 대상이 없으면 **`404`**. 수정·삭제는 Mapper가 돌려준 **영향받은 행 수가 0**이면 404로 판단한다.
- 이번 예제는 SQL 연결에 집중한 기본 구조다. 실제 서비스에서는 **입력값 검증**과 **이메일 중복·외래키 오류**에 대한 응답 처리도 추가해야 한다.

> 💡 보충: Controller에 처음 나온 것들
>
> | 코드 | 뜻 |
> |---|---|
> | `@RequestMapping("/students")` | 이 클래스의 모든 경로 앞에 `/students`를 붙인다 (`@GetMapping("/{id}")` → `/students/{id}`) |
> | `@PathVariable("id")` | 주소의 `{id}` 자리 값을 받는다 (`/students/3` → `3`) |
> | `@RequestBody` | 요청 본문의 **JSON**을 `Student` 객체로 바꿔 받는다 (폼 값은 `@RequestParam` — [04_폼-학생등록](../03_Spring과정/04_폼-학생등록.md)) |
> | `@PutMapping`, `@DeleteMapping` | PUT·DELETE 요청 처리 |
> | `ResponseEntity<T>` | 상태 코드와 본문을 함께 정해 응답 (`ok()` 200, `created(주소).body()` 201, `noContent()` 204, `notFound()` 404) |

### 10. 실행 흐름

```text
GET /students/1
        ↓
Controller의 findById(1)
        ↓
Mapper의 findById(1)
        ↓
XML의 findById SQL
        ↓
WHERE id = 1에 해당하는 학생 조회
        ↓
Student 객체
        ↓
JSON 응답
```

응답 JSON은 **Java 속성 이름**(`registeredDate`, `classId`)으로 나온다.

```json
{
  "id": 1,
  "name": "한코딩",
  "email": "hancoding@example.com",
  "registeredDate": "2026-11-16",
  "classId": 1
}
```

### 11. Spring에서 `ROLLBACK` 연습은 왜 하지 않나?
- 이번 API는 여러 SQL을 묶는 별도 트랜잭션 설정 없이 **Mapper 메서드 하나씩** 실행한다. **성공한 변경은 확정**된다.
- DBeaver에서 나중에 `ROLLBACK`을 실행해도 **Spring의 다른 연결에서 확정한 작업은 취소되지 않는다** ([04](04_수정삭제-트랜잭션.md): 트랜잭션은 연결 단위).
- 여러 Mapper 호출을 하나의 작업으로 묶어야 할 때는 Service와 Spring의 **`@Transactional`** 등으로 트랜잭션 경계를 정한다.

### 정리

| 요소 | 역할 |
|---|---|
| `Student` | 학생 데이터를 담는 Java 객체 |
| `StudentMapper` | Java에서 호출할 DB 작업 메서드 정의 |
| `StudentMapper.xml` | 직접 실행할 SQL 작성 |
| `@Mapper` | MyBatis Mapper 인터페이스 표시 |
| `namespace` | XML과 Mapper 인터페이스 연결 |
| SQL의 `id` | XML의 SQL과 Java 메서드 연결 |
| `resultType` | 조회한 한 행을 담을 객체 타입 |
| `#{...}` | SQL에 입력값 바인딩 |
| `useGeneratedKeys` | DB가 생성한 번호를 객체에 반영 |
| Controller | HTTP 요청을 받아 Mapper를 호출하고 응답 |

## 실습 정리

### 만든 것
새 Spring Boot 프로젝트 `student-mybatis`에서 `school` DB의 `students` 테이블을 MyBatis로 조회·추가·수정·삭제하는 **학생 JSON API**. 브라우저 주소창(GET)과 개발자 도구 Console의 `fetch`(POST·PUT·DELETE)로 확인하고, DBeaver로 DB에도 반영됐는지 확인했다.

### 파일 구조

```text
src/main
├─ java
│  └─ com/hancoding/studentmybatis
│     ├─ StudentMybatisApplication.java
│     ├─ Student.java
│     ├─ StudentMapper.java
│     └─ StudentController.java
│
└─ resources
   ├─ application.properties
   └─ mappers
      └─ StudentMapper.xml
```

- 메인 클래스와 **같은 패키지**에 Java 파일을 두어 Spring이 찾을 수 있게 한다.

### 단계 흐름
1. 새 프로젝트 생성 (Gradle - Groovy, Spring Web) → `build.gradle`에 MyBatis Starter·MySQL·H2 드라이버 추가 → Gradle 불러오기
2. `application.properties`에 DB 연결 + MyBatis 설정, IntelliJ 실행 설정에 `DB_PASSWORD` 환경변수
3. `Student` → `StudentMapper` → `StudentMapper.xml` → `StudentController` 작성
4. 서버 실행 (다른 Spring 서버가 8080을 쓰고 있으면 먼저 종료) → 브라우저에서 목록·상세 조회
5. `/students` 페이지의 Console에서 `fetch`로 추가 → 조회 → 수정 → 삭제
6. DBeaver에서 결과 확인

### 최종 코드

**`StudentMybatisApplication.java`** (생성된 메인 클래스)

```java
package com.hancoding.studentmybatis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudentMybatisApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentMybatisApplication.class, args);
    }
}
```

<details><summary><code>Student.java</code> — 필드 + getter·setter</summary>

```java
package com.hancoding.studentmybatis;

import java.time.LocalDate;

public class Student {

    private Integer id;
    private String name;
    private String email;
    private LocalDate registeredDate;
    private Integer classId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getRegisteredDate() {
        return registeredDate;
    }

    public void setRegisteredDate(LocalDate registeredDate) {
        this.registeredDate = registeredDate;
    }

    public Integer getClassId() {
        return classId;
    }

    public void setClassId(Integer classId) {
        this.classId = classId;
    }
}
```
</details>

**`StudentMapper.java`**

```java
package com.hancoding.studentmybatis;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StudentMapper {

    List<Student> findAll();

    Student findById(@Param("id") Integer id);

    int insert(Student student);

    int update(Student student);

    int deleteById(@Param("id") Integer id);
}
```

**`resources/mappers/StudentMapper.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
    PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.hancoding.studentmybatis.StudentMapper">

    <select id="findAll"
            resultType="com.hancoding.studentmybatis.Student">
        SELECT
            id,
            name,
            email,
            registered_date,
            class_id
        FROM students
        ORDER BY id ASC
    </select>

    <select id="findById"
            resultType="com.hancoding.studentmybatis.Student">
        SELECT
            id,
            name,
            email,
            registered_date,
            class_id
        FROM students
        WHERE id = #{id}
    </select>

    <insert id="insert"
            useGeneratedKeys="true"
            keyProperty="id"
            keyColumn="id">
        INSERT INTO students (
            name,
            email,
            registered_date,
            class_id
        )
        VALUES (
            #{name},
            #{email},
            #{registeredDate},
            #{classId}
        )
    </insert>

    <update id="update">
        UPDATE students
        SET name = #{name},
            email = #{email},
            registered_date = #{registeredDate},
            class_id = #{classId}
        WHERE id = #{id}
    </update>

    <delete id="deleteById">
        DELETE FROM students
        WHERE id = #{id}
    </delete>

</mapper>
```

> 💡 보충: XML 안의 SQL 끝에는 `;`을 붙이지 않았다. `#{registeredDate}`처럼 값 자리에는 **Java 속성 이름**을, `SET`·`INSERT`의 열에는 **DB 열 이름**(`registered_date`)을 쓴다.

**`StudentController.java`**

```java
package com.hancoding.studentmybatis;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentMapper studentMapper;

    public StudentController(StudentMapper studentMapper) {
        this.studentMapper = studentMapper;
    }

    @GetMapping
    public List<Student> findAll() {
        return studentMapper.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> findById(
            @PathVariable("id") Integer id) {

        Student student = studentMapper.findById(id);

        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(student);
    }

    @PostMapping
    public ResponseEntity<Student> insert(
            @RequestBody Student student) {

        studentMapper.insert(student);

        URI location = URI.create("/students/" + student.getId());

        return ResponseEntity.created(location).body(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable("id") Integer id,
            @RequestBody Student student) {

        student.setId(id);

        int updatedRows = studentMapper.update(student);

        if (updatedRows == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(
            @PathVariable("id") Integer id) {

        int deletedRows = studentMapper.deleteById(id);

        if (deletedRows == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
```

### 확인 ① — 브라우저에서 목록·상세 조회
- `http://localhost:8080/students` → DB의 학생 목록이 **JSON**으로 나온다 (등록일·반 번호는 `registeredDate`, `classId`).
- 목록에서 실제 번호를 확인하고 `http://localhost:8080/students/1` → 한 명. 없는 번호면 **`404`**.

### 확인 ② — Console에서 `fetch`로 추가·수정·삭제
브라우저 주소창은 주로 GET만 보낸다. **`http://localhost:8080/students` 페이지를 열고 개발자 도구 Console**에서 실행한다. **같은 주소의 서버로 요청하므로 CORS 설정이 필요 없다.**

> 💡 보충: Node 과정([04_React-서버연결](../02_Node과정/04_React-서버연결.md))에서는 React(5173)와 서버(3000)의 포트가 달라서 CORS가 필요했다. 이번에는 8080 페이지에서 8080 서버로 요청하므로 출처가 같다.

**① 학생 추가 (POST)**

```javascript
fetch("/students", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "최마이바티스",
    email: "mybatis-practice@example.com",
    registeredDate: "2026-11-21",
    classId: null,
  }),
})
  .then(async (response) => {
    console.log("상태 코드:", response.status);
    console.log("응답:", await response.json());
  });
```

- `POST` = 추가 요청, `Content-Type` = JSON을 보낸다고 안내, `JSON.stringify` = JS 객체 → JSON 문자열, `classId: null` = 반 미정.
- 성공하면 **`201`** 과 새 학생 객체. **응답에 들어 있는 새 `id`를 기록**한다. 같은 이메일로 다시 추가하면 중복 오류.

**② 추가된 학생 조회**

```javascript
fetch("/students")
  .then((response) => response.json())
  .then((students) => console.table(students));
```

**③ 학생 수정 (PUT)** — `123`을 **방금 추가한 학생의 실제 번호**로 바꾼다.

```javascript
fetch("/students/123", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "최마이바티스수정",
    email: "mybatis-practice@example.com",
    registeredDate: "2026-11-22",
    classId: null,
  }),
})
  .then((response) => {
    console.log("상태 코드:", response.status);
  });
```

- 이번 수정 API는 **수정할 모든 항목을 함께** 보낸다.
- 성공하면 **`204`**. 본문이 없으므로 **`response.json()`을 호출하지 않는다.** 목록을 다시 조회해 이름·등록일이 바뀌었는지 본다.

> 💡 보충: XML의 `UPDATE`가 네 열을 모두 `SET`하기 때문이다. 보내지 않은 항목은 `null`로 바뀌고, `email`처럼 `NOT NULL`인 열을 빼면 오류가 난다.

**④ 학생 삭제 (DELETE)** — 실제 번호로 바꾼다.

```javascript
fetch("/students/123", {
  method: "DELETE",
})
  .then((response) => {
    console.log("상태 코드:", response.status);
  });
```

- 정상 삭제 **`204`**. 같은 번호를 다시 삭제하면 대상이 없어서 **`404`**.

### 확인 ③ — DB에서도 결과 확인
**MySQL** — Spring을 실행한 채로 DBeaver에서 같은 DB에 접속해 조회할 수 있다.

```sql
SELECT *
FROM students
ORDER BY id DESC;
```

**H2 파일 DB** — 같은 파일을 동시에 열 수 없으므로 순서대로 한다.

```text
API 요청과 결과 확인
          ↓
Spring 종료
          ↓
DBeaver에서 같은 H2 파일 DB 연결
          ↓
SQL 조회
```

- 다시 Spring을 실행하려면 DBeaver의 해당 DB 연결을 종료한다.

## 헷갈리기 쉬운 점
- **`namespace`는 인터페이스의 "패키지 포함" 전체 이름, SQL `id`는 메서드 이름과 똑같이.** 하나라도 다르면 `Invalid bound statement`.
- **`resultType`에는 `List`가 아니라 한 행의 타입(`Student`)** 을 쓴다.
- **`#{...}`에는 따옴표를 붙이지 않는다** (문자열도). 값 전달은 `#{...}`, `${...}`와 헷갈리지 않는다.
- **`map-underscore-to-camel-case=true`가 없으면** `registered_date`·`class_id`가 `registeredDate`·`classId`에 안 들어가 계속 `null`이다.
- **`@Param("id")`의 이름과 XML의 `#{id}`가 같아야** 한다.
- **`classId`는 `Integer`** (반이 없으면 `null`). `int`는 `null`을 담을 수 없다.
- **MyBatis는 테이블을 만들지 않는다.** 02·05에서 만든 테이블이 있는 DB에 접속해야 한다.
- **`Student`에 `@Entity`를 붙이지 않는다.** JPA를 쓰지 않는 프로젝트다.
- **`new StudentMapper()`를 쓰지 않는다.** Spring이 준비한 Mapper를 생성자로 받는다.
- **MyBatis Starter 버전은 Spring Boot 버전에 맞춘다** (Boot 3.2~3.5 → 3.0 계열, Boot 4 → 4.0 계열).
- **`204` 응답에는 본문이 없다.** `response.json()`을 부르면 JSON 파싱 오류.
- **수정(PUT)은 수정할 모든 항목을 함께 보낸다** (위 확인 ②의 보충 참고).
- **비밀번호는 `application.properties`에 직접 쓰지 않는다.** `${DB_PASSWORD}` + 실행 설정의 환경변수.
- **H2 파일 DB는 Spring과 DBeaver가 동시에 열 수 없다.** 한쪽을 끄고 다른 쪽을 연다.
- **DBeaver의 `ROLLBACK`으로 Spring이 확정한 변경을 취소할 수 없다.** 연결이 다르고, API의 변경은 바로 확정된다.
- **오류는 브라우저 메시지만 보지 말고 IntelliJ 서버 로그도** 함께 본다.

**실행이 안 될 때 확인할 것**

| 오류·증상 | 확인할 내용 |
|---|---|
| DB 연결 실패 | DB 실행 상태, URL, 계정, 비밀번호 |
| H2의 `Database may be already in use` | 같은 파일 DB를 열어 둔 다른 프로그램 종료 |
| H2의 DB 없음 오류 | 기존 파일 경로, 사용자 홈 위치, 파일 존재 여부 |
| `students` 테이블 없음 | 다른 DB에 접속했는지, 앞선 실습 테이블이 있는지 |
| `Invalid bound statement` | XML 위치, `namespace`, SQL `id`와 메서드 이름 |
| 날짜·반 번호가 계속 `null` | DB 값과 underscore-to-camel-case 설정 |
| `/students`가 `404` | Controller 패키지, 서버 포트, 실제 실행한 프로젝트 |
| 이메일 중복 오류 | 같은 이메일로 POST를 반복했는지 |
| 외래키 오류 | `classId`가 실제 `classes.id`에 존재하는지 |
| `204` 뒤 JSON 파싱 오류 | 본문 없는 응답에 `response.json()`을 호출했는지 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| MyBatis 의존성 | Gradle | `implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.5'` |
| MySQL 드라이버 | Gradle | `runtimeOnly 'com.mysql:mysql-connector-j'` |
| MySQL 접속 주소 | `spring.datasource.url` | `jdbc:mysql://localhost:3306/school` |
| 비밀번호를 환경변수로 | `${…}` | `spring.datasource.password=${DB_PASSWORD}` |
| XML 위치 지정 | `mybatis.mapper-locations` | `classpath:/mappers/*.xml` |
| 밑줄 열 ↔ 카멜 속성 | `map-underscore-to-camel-case` | `mybatis.configuration.map-underscore-to-camel-case=true` |
| Mapper 인터페이스 표시 | `@Mapper` | `@Mapper public interface StudentMapper { … }` |
| SQL에서 쓸 매개변수 이름 | `@Param` | `Student findById(@Param("id") Integer id);` |
| XML ↔ 인터페이스 연결 | `namespace` | `<mapper namespace="com.hancoding.studentmybatis.StudentMapper">` |
| 조회 SQL | `<select id resultType>` | `<select id="findAll" resultType="com.hancoding.studentmybatis.Student">` |
| 값 바인딩 | `#{속성}` | `WHERE id = #{id}` |
| 추가 후 새 번호 받기 | `useGeneratedKeys` | `<insert id="insert" useGeneratedKeys="true" keyProperty="id" keyColumn="id">` |
| Mapper 받기 | 생성자 | `public StudentController(StudentMapper studentMapper) { … }` |
| 공통 경로 | `@RequestMapping` | `@RequestMapping("/students")` |
| 주소의 번호 받기 | `@PathVariable` | `@PathVariable("id") Integer id` |
| JSON 본문 받기 | `@RequestBody` | `@RequestBody Student student` |
| 200 / 201 / 204 / 404 | `ResponseEntity` | `ok(student)` / `created(location).body(student)` / `noContent().build()` / `notFound().build()` |
| Console에서 POST·PUT | `fetch` + JSON | `fetch("/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ … }) })` |

## 확인 문제

<details><summary>Q. 사용자가 학생 목록을 요청할 때 SQL은 어디서 실행되는가? 전체 흐름은?</summary>

**백엔드(Spring)** 가 요청을 받아 실행한다. 사용자 요청 → Spring Controller → MyBatis Mapper → Mapper XML의 SQL → MySQL 조회 → `Student` 객체 → JSON 응답.
</details>

<details><summary>Q. JPA와 MyBatis의 차이는?</summary>

JPA는 **객체 중심**으로 데이터를 다루며 기본 CRUD SQL을 직접 쓰지 않아도 된다. MyBatis는 **SQL을 직접 작성**하고 Java 메서드와 연결한다.
</details>

<details><summary>Q. Mapper를 이루는 두 파일과 각 역할은?</summary>

`StudentMapper.java` = Java에서 호출할 메서드 정의 (`@Mapper` 인터페이스), `StudentMapper.xml` = 각 메서드가 실행할 SQL.
</details>

<details><summary>Q. XML의 `namespace`와 SQL의 `id`는 각각 무엇과 연결되는가? 틀리면 어떤 오류가 나는가?</summary>

`namespace` = Mapper 인터페이스의 **패키지 포함 전체 이름** (`com.hancoding.studentmybatis.StudentMapper`), SQL `id` = **메서드 이름** (`findAll`). 다르면 MyBatis가 SQL을 찾지 못해 `Invalid bound statement` 오류가 난다 (XML 위치도 확인).
</details>

<details><summary>Q. `findAll()`은 `List<Student>`를 반환하는데 XML의 `resultType`에는 무엇을 쓰는가?</summary>

목록이 아니라 **한 행을 담을 타입** `com.hancoding.studentmybatis.Student`를 쓴다. MyBatis가 각 행을 `Student`로 만들어 목록으로 돌려준다.
</details>

<details><summary>Q. `#{...}`는 무엇을 하는가? `WHERE email = #{email}`에 따옴표를 붙여야 하는가?</summary>

전달받은 값을 SQL에 **바인딩**하는 자리다. **문자열도 따옴표를 붙이지 않는다.** 입력값을 SQL 문자열에 직접 붙이는 `${...}`와 구분하고, 값 전달에는 `#{...}`를 쓴다.
</details>

<details><summary>Q. `mybatis.configuration.map-underscore-to-camel-case=true`는 왜 필요한가?</summary>

DB 열 `registered_date`, `class_id`를 Java 속성 `registeredDate`, `classId`에 연결해 준다. 없으면 날짜·반 번호가 계속 `null`로 나온다.
</details>

<details><summary>Q. `Student`의 `classId`를 `int`가 아니라 `Integer`로 쓴 이유는? `LocalDate`는?</summary>

소속 반이 없는 학생은 `class_id`가 `NULL`인데, **`int`는 `null`을 담을 수 없고 `Integer`는 담을 수 있다.** `LocalDate`는 시각 없이 연·월·일을 나타내는 타입으로 DB의 `DATE`에 대응한다.
</details>

<details><summary>Q. `@Mapper`와 `@Param("id")`는 각각 무엇을 하는가?</summary>

`@Mapper` = MyBatis가 SQL과 연결할 Mapper 인터페이스라는 표시. `@Param("id")` = 전달받은 값을 SQL에서 `id`라는 이름으로 쓰게 해서 XML의 `#{id}`와 연결한다.
</details>

<details><summary>Q. `<insert>`의 `useGeneratedKeys="true" keyProperty="id" keyColumn="id"`는 무엇을 하는가?</summary>

학생을 추가한 뒤 **DB가 자동 생성한 번호**를 전달했던 `Student` 객체의 `id`에 넣는다. 그래서 Controller가 `student.getId()`로 `201` 응답의 주소(`/students/새번호`)를 만들 수 있다.
</details>

<details><summary>Q. Controller에서 `new StudentMapper()`를 쓰지 않고 어떻게 Mapper를 얻는가?</summary>

**생성자 매개변수**로 받는다 (`public StudentController(StudentMapper studentMapper)`). Spring과 MyBatis가 Mapper를 준비해 전달해 준다. 구현 클래스를 직접 만들지 않는다.
</details>

<details><summary>Q. 학생 API 5개의 정상 응답 코드는? `204`는 무슨 뜻이고, 대상이 없으면?</summary>

`GET /students` 200 + 목록, `GET /students/{id}` 200 + 객체, `POST /students` 201 + 추가된 객체, `PUT /students/{id}` 204, `DELETE /students/{id}` 204. `204` = 처리 완료, **응답 본문 없음**. 상세 조회·수정·삭제 대상이 없으면 `404` (수정·삭제는 영향받은 행 수가 0일 때).
</details>

<details><summary>Q. PUT 요청 뒤 `response.json()`을 호출했더니 오류가 났다. 왜인가?</summary>

PUT·DELETE 성공 응답은 `204`로 **본문이 없어서** JSON으로 읽을 수 없다. 상태 코드만 확인한다.
</details>

<details><summary>Q. 브라우저 Console에서 `fetch("/students", …)`를 보낼 때 CORS 설정이 필요 없는 이유는?</summary>

`http://localhost:8080/students` 페이지에서 **같은 주소(같은 서버)** 로 요청하기 때문이다.
</details>

<details><summary>Q. `spring.datasource.password=${DB_PASSWORD}`처럼 쓰는 이유는?</summary>

비밀번호를 설정 파일에 직접 쓰지 않고 **환경변수**(IntelliJ 실행 설정의 Environment variables)에서 읽기 위해서다. 그래야 비밀번호가 공개 저장소에 올라가지 않는다.
</details>

<details><summary>Q. API로 학생을 추가한 뒤 DBeaver에서 `ROLLBACK`을 실행하면 그 추가가 취소되는가?</summary>

아니다. API는 Mapper 메서드 하나씩 실행해서 **성공한 변경은 바로 확정**되고, DBeaver는 **다른 연결**이라 Spring이 확정한 작업을 취소할 수 없다. 여러 호출을 하나로 묶으려면 Service와 `@Transactional` 등으로 트랜잭션 경계를 정한다.
</details>

<details><summary>Q. MyBatis 프로젝트를 실행하면 `students` 테이블이 자동으로 만들어지는가?</summary>

아니다. MyBatis는 테이블을 만들지 않는다. 앞에서 만든 `students`·`classes`가 있는 DB에 접속해야 한다.
</details>

## 완료 체크
- [ ] 사용하는 DB에 맞게 접속 정보를 설정했다.
- [ ] `Student` 클래스와 Mapper 인터페이스를 만들었다.
- [ ] XML의 `namespace`와 메서드 이름을 정확히 연결했다.
- [ ] 학생 목록과 상세 정보를 JSON으로 조회했다.
- [ ] `#{...}`로 값을 전달하는 과정을 이해했다.
- [ ] 학생을 추가하고 자동 생성된 번호를 확인했다.
- [ ] 학생 정보를 수정하고 삭제했다.
- [ ] API에서 변경한 결과를 DB에서도 확인했다.
- [ ] 클라이언트 요청부터 SQL 실행과 JSON 응답까지의 흐름을 설명할 수 있다.

## 질문 노트

_아직 없음_
