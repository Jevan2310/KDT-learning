# 05. 테이블 관계와 JOIN 이해하기 — 외래키·`INNER JOIN`·`LEFT JOIN`·`GROUP BY`

> 과정: 데이터베이스과정 · [노션 원문](https://app.notion.com/p/41a848f71c9b80d6a83fe687b6d615dd) · 최종 갱신일: 2026-11-18

## 한눈에 보기
- 학생 테이블에 반 이름을 바로 넣으면 **같은 반 이름이 반복**되고, 이름을 바꿀 때 모든 학생 행을 고쳐야 한다. → 반은 **`classes` 테이블**로 나누고, 학생에게는 **반 번호 `class_id`** 만 저장한다.
- **기본키**는 행을 구분하고, **외래키**는 다른 테이블의 행을 가리킨다. `students.class_id` → `classes.id`. 반 하나에 학생 여럿 = **일대다(1:N) 관계**.
- `ALTER TABLE`로 `class_id` 열과 **외래키 제약 조건**(`FOREIGN KEY … REFERENCES classes (id)`)을 추가했다. 이제 없는 반 번호(999)는 DB가 막는다. `NULL`(미배정)은 허용.
- **`INNER JOIN … ON s.class_id = c.id`** 는 연결되는 행만, **`LEFT JOIN`** 은 왼쪽(`FROM` 뒤) 테이블의 행을 모두 남기고 짝이 없으면 `NULL`. `AS`로 결과 열·테이블에 별칭을 붙인다.
- **`COUNT(*)`** 는 행 수, **`COUNT(열)`** 은 그 열이 `NULL`이 아닌 행 수. **`GROUP BY`** 로 반별로 묶어 센다. 학생 없는 반까지 0명으로 보려면 `classes LEFT JOIN students` + **`COUNT(s.id)`**.

## 학습 목표
- 정보를 여러 테이블에 나누어 저장하는 이유를 이해한다.
- 기본키와 외래키의 관계를 설명한다.
- 학생과 반 사이의 일대다 관계를 만든다.
- `INNER JOIN`과 `LEFT JOIN`으로 데이터를 연결한다.
- `COUNT`, `GROUP BY`로 반별 학생 수를 조회한다.

## 핵심 개념

### 1. 학생의 소속 반도 저장하고 싶다면? — 테이블을 나누는 이유
학생 테이블에 반 이름을 바로 넣으면:

| 학생 이름 | 이메일 | 반 이름 |
|---|---|---|
| 한코딩 | hancoding@example.com | 풀스택 A반 |
| 김자바개발자 | java@example.com | 풀스택 A반 |
| 이리액트 | react@example.com | 풀스택 B반 |
| 정데이터 | data@example.com | 풀스택 A반 |

- 같은 반 이름이 **여러 행에 반복**된다.
- 반 이름을 바꾸려면(`풀스택 A반 → 풀스택 개발 A반`) **해당 학생 행을 모두 수정**해야 한다. 일부만 고치면 같은 반인데 이름이 다르게 남는다.

→ **반 정보는 별도 테이블로, 학생에게는 소속 반 번호만** 저장한다.

| id | name |
|---|---|
| 1 | 풀스택 A반 |
| 2 | 풀스택 B반 |
| 3 | 풀스택 C반 |

| 학생 이름 | class_id |
|---|---|
| 한코딩 | 1 |
| 김자바개발자 | 1 |
| 이리액트 | 2 |
| 정데이터 | 1 |

- 반 이름을 바꿀 때 `classes`에서 **한 번만** 수정하면 된다.

### 2. 기본키와 외래키

| 열 | 역할 |
|---|---|
| `classes.id` | 반을 구분하는 **기본키** |
| `students.id` | 학생을 구분하는 **기본키** |
| `students.class_id` | 학생이 소속된 반을 가리키는 **외래키** |

```text
classes                     students

id: 1  풀스택 A반  ←──────  한코딩         class_id: 1
                   ←──────  김자바개발자   class_id: 1
                   ←──────  정데이터       class_id: 1

id: 2  풀스택 B반  ←──────  이리액트       class_id: 2
```

### 3. 일대다(1:N) 관계
- 한 반에는 **여러 학생**이 소속될 수 있다.
- 학생 한 명은 **최대 한 반**에 소속된다.
- 아직 반을 정하지 않은 학생도 있을 수 있다.

→ 반 **하나**와 학생 **여러 명**이 연결되므로 **일대다** 관계다. (학생 한 명이 여러 반을 동시에 수강하는 모델은 다루지 않는다.)

### 4. `classes` 테이블 만들기

```sql
CREATE TABLE classes (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
```

- 반 번호는 **직접 지정**한다. **`PRIMARY KEY` 자체가 번호를 자동 생성하지는 않는다.** 자동 생성을 원하면 `AUTO_INCREMENT`를 추가한다 ([02](02_테이블-데이터추가.md)).

```sql
INSERT INTO classes (id, name)
VALUES
    (1, '풀스택 A반'),
    (2, '풀스택 B반'),
    (3, '풀스택 C반');
```

- 테이블 생성과 데이터 추가는 **한 번만** 실행한다. 이미 했다면 다시 하지 말고 조회로 확인한다.

### 5. 외래키 추가 — `ALTER TABLE`

**① `class_id` 열 추가**

```sql
ALTER TABLE students
ADD COLUMN class_id INT;
```

- `ALTER TABLE` = **이미 있는 테이블의 구조를 변경**하는 명령.
- `NOT NULL`을 지정하지 않았으므로 소속 반이 없는 학생은 `NULL`로 둘 수 있다.

**② 외래키 제약 조건 추가**

```sql
ALTER TABLE students
ADD CONSTRAINT fk_students_class
FOREIGN KEY (class_id)
REFERENCES classes (id);
```

| 코드 | 의미 |
|---|---|
| `ADD CONSTRAINT` | 제약 조건 추가 |
| `fk_students_class` | 제약 조건에 붙인 이름 |
| `FOREIGN KEY (class_id)` | 학생 테이블의 외래키 열 |
| `REFERENCES classes (id)` | 참조할 테이블과 열 |

이제 `students.class_id`에는 다음만 저장할 수 있다.
- `classes.id`에 **실제로 존재하는 번호**
- 소속 반이 없다는 뜻의 **`NULL`**

- **열 이름을 `class_id`로 짓는 것만으로 외래키가 되지 않는다.** 제약 조건을 설정해야 DB가 관계를 검사한다.
- 두 `ALTER TABLE`도 **각각 한 번만** 실행한다. 구조 변경은 [04](04_수정삭제-트랜잭션.md)의 데이터 변경 트랜잭션과 구분해서 실행한다.

### 6. 존재하지 않는 반 번호를 넣으면?
오류 확인용 예제다. 따로 선택해서 실행한다.

```sql
UPDATE students
SET class_id = 999
WHERE email = 'react@example.com';
```

- `classes`에 999번 반이 없으므로 **오류**가 난다. 조회하면 이리액트의 반 번호는 **기존 값 그대로**다.

> "존재하지 않는 반에 학생을 배정하지 못하도록 DB가 검사하는 것"이 외래키 제약 조건의 역할이다.

### 7. 학생 이름과 반 이름 함께 조회 — `INNER JOIN`
학생 테이블에는 반 **번호**만 있다. 화면에는 반 **이름**이 더 알기 쉽다 → `JOIN`으로 두 테이블을 연결한다.

```sql
SELECT
    students.name AS student_name,
    classes.name AS class_name
FROM students
INNER JOIN classes
    ON students.class_id = classes.id
ORDER BY students.id ASC;
```

**`ON` — 어떤 기준으로 연결하나?**

```sql
ON students.class_id = classes.id
```

```text
학생의 class_id가 1
        ↓
classes에서 id가 1인 반과 연결
        ↓
풀스택 A반이라는 이름을 함께 조회
```

**`AS` — 별칭**
- 두 테이블 모두 `name` 열이 있어서, 결과에서 구분하려고 `students.name AS student_name`처럼 별칭을 붙인다.
- `AS`는 **조회 결과에 쓸 이름**을 정할 뿐, 실제 테이블의 열 이름을 바꾸지 않는다.

| student_name | class_name |
|---|---|
| 한코딩 | 풀스택 A반 |
| 김자바개발자 | 풀스택 A반 |
| 이리액트 | 풀스택 B반 |
| 정데이터 | 풀스택 A반 |

- **`INNER JOIN`은 연결 조건을 만족하는 행만 반환한다.** 소속 반이 없는 박스프링은 빠진다. **삭제된 게 아니라** 이번 조회 조건에 포함되지 않은 것이다.

**테이블에도 별칭 붙이기** — 앞의 SQL과 같은 의미다.

```sql
SELECT
    s.name AS student_name,
    c.name AS class_name
FROM students AS s
INNER JOIN classes AS c
    ON s.class_id = c.id
ORDER BY s.id ASC;
```

| 별칭 | 가리키는 테이블 |
|---|---|
| `s` | `students` |
| `c` | `classes` |

### 8. 반이 없는 학생도 조회 — `LEFT JOIN`

```sql
SELECT
    s.name AS student_name,
    c.name AS class_name
FROM students AS s
LEFT JOIN classes AS c
    ON s.class_id = c.id
ORDER BY s.id ASC;
```

| student_name | class_name |
|---|---|
| 한코딩 | 풀스택 A반 |
| 김자바개발자 | 풀스택 A반 |
| 이리액트 | 풀스택 B반 |
| 박스프링부트 | NULL |
| 정데이터 | 풀스택 A반 |

- **`LEFT JOIN`은 왼쪽 테이블의 모든 행을 유지한다.** 오른쪽에 연결할 행이 없으면 오른쪽 열이 `NULL`.
- 왼쪽 테이블 = **`FROM` 뒤에 적은 테이블** (`students`).

| JOIN 종류 | 이번 예제의 결과 |
|---|---|
| `INNER JOIN` | 소속 반과 연결되는 학생만 표시 |
| `LEFT JOIN` | 소속 반이 없는 학생도 표시 |

### 9. 개수 세기 — `COUNT`

```sql
SELECT COUNT(*) AS student_count
FROM students;
```

| student_count |
|---|
| 5 |

```sql
SELECT COUNT(*) AS student_count
FROM students
WHERE class_id = 1;
```

- A반 학생 수 → 예상 결과 3.

**`COUNT(*)`와 `COUNT(열)`의 차이**

```sql
SELECT
    COUNT(*) AS total_students,
    COUNT(class_id) AS assigned_students
FROM students;
```

| 표현 | 의미 |
|---|---|
| `COUNT(*)` | 전체 행 개수 |
| `COUNT(class_id)` | `class_id`가 `NULL`이 아닌 행 개수 |

- 현재 예제: 전체 5명, 반이 배정된 학생 4명.

### 10. 반별 학생 수 — `GROUP BY`

```sql
SELECT
    class_id,
    COUNT(*) AS student_count
FROM students
GROUP BY class_id
ORDER BY class_id ASC;
```

- `GROUP BY class_id` = **같은 반 번호를 가진 학생끼리 묶는다.**
- 미배정 학생이 있으면 **`NULL`도 하나의 그룹**으로 나온다. `NULL` 그룹의 표시 순서는 DB 설정에 따라 다를 수 있다.

**반 이름과 학생 수 함께 — `classes`를 기준으로 연결**

```sql
SELECT
    c.id AS class_id,
    c.name AS class_name,
    COUNT(s.id) AS student_count
FROM classes AS c
LEFT JOIN students AS s
    ON c.id = s.class_id
GROUP BY c.id, c.name
ORDER BY c.id ASC;
```

| class_id | class_name | student_count |
|---|---|---|
| 1 | 풀스택 A반 | 3 |
| 2 | 풀스택 B반 | 1 |
| 3 | 풀스택 C반 | 0 |

- C반은 학생이 없지만, 왼쪽 테이블 `classes`의 행을 유지하므로 결과에 나온다.

**왜 `COUNT(*)`가 아니라 `COUNT(s.id)`일까?**

```text
C반 | 학생 id: NULL | 학생 이름: NULL
```

- 학생 없는 C반도 `LEFT JOIN` 결과에 **한 행**으로 남는다 (학생 쪽 열은 모두 `NULL`).
- `COUNT(*)`는 이 행도 세서 **1**, `COUNT(s.id)`는 `NULL`을 세지 않아 **0**.
- → **실제 학생 수를 세려고 학생의 기본키 `s.id`를 쓴다.**

**이 결과에 미배정 학생이 없는 이유** — 반 목록 기준으로 집계했기 때문에, 연결할 반이 없는 미배정 학생은 어느 반에도 포함되지 않는다. 그래서 **반별 학생 수의 합(4)이 전체 학생 수(5)와 다를 수 있다.**

### 11. JOIN을 쓸 때 확인할 점

**두 테이블의 `id`끼리 연결하면 될까? — 안 된다**

```sql
-- 잘못된 연결을 설명하기 위한 예제
SELECT s.name, c.name
FROM students AS s
INNER JOIN classes AS c
    ON s.id = c.id;
```

- 학생 번호와 반 번호는 **서로 다른 의미**다. 숫자가 우연히 같다고 같은 반은 아니다. 올바른 연결은 `ON s.class_id = c.id`.

**한 반이 여러 행으로 나오는 것은 오류일까? — 정상이다**

```sql
SELECT
    c.name AS class_name,
    s.name AS student_name
FROM classes AS c
INNER JOIN students AS s
    ON c.id = s.class_id
ORDER BY c.id ASC, s.id ASC;
```

- A반 학생이 세 명이면 A반 이름도 세 번 나온다. **일대다 관계에서 학생마다 한 행을 반환하므로 정상**이다.
- 반마다 한 행으로 학생 수만 보려면 `GROUP BY`로 집계한다.

### 정리

| 개념·문법 | 역할 |
|---|---|
| 기본키 | 테이블의 각 행을 구분 |
| 외래키 | 다른 테이블의 행을 참조하고 관계 검사 |
| 일대다 관계 | 하나의 반에 여러 학생이 연결되는 관계 |
| `ALTER TABLE` | 기존 테이블 구조 변경 |
| `INNER JOIN` | 연결 조건을 만족하는 행만 조회 |
| `LEFT JOIN` | 왼쪽 테이블의 모든 행을 유지해 조회 |
| `ON` | 두 테이블을 연결할 조건 |
| `AS` | 조회 결과의 열이나 테이블에 별칭 지정 |
| `COUNT(*)` | 행 개수 계산 |
| `COUNT(열)` | 해당 열이 `NULL`이 아닌 행 개수 계산 |
| `GROUP BY` | 같은 값을 가진 행끼리 묶어 집계 |

## 실습 정리

### 만든 것
`classes` 테이블(반 3개)을 만들고 `students`에 `class_id` 외래키를 추가해 학생 4명을 A·B반에 배정했다 (박스프링은 미배정). 그다음 JOIN·COUNT·GROUP BY로 조회했다. MySQL은 `USE school;`부터, H2는 연결된 실습 DB에서 `USE` 없이 진행한다.

### 단계 흐름
1. `classes` 생성 → 반 3개 추가 → 조회
2. `ALTER TABLE`로 `class_id` 열 추가 → 외래키 제약 조건 추가
3. 현재 학생 확인 → A반 3명, B반 1명 배정, 박스프링은 `NULL`
4. 없는 반 번호(999)로 외래키 오류 확인
5. `INNER JOIN` → `LEFT JOIN` → 미배정 학생만 찾기
6. `COUNT` → `GROUP BY` → 반 이름별 학생 수

### 반 테이블과 외래키 (한 번만 실행)

```sql
CREATE TABLE classes (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO classes (id, name)
VALUES
    (1, '풀스택 A반'),
    (2, '풀스택 B반'),
    (3, '풀스택 C반');

SELECT *
FROM classes
ORDER BY id ASC;

ALTER TABLE students
ADD COLUMN class_id INT;

ALTER TABLE students
ADD CONSTRAINT fk_students_class
FOREIGN KEY (class_id)
REFERENCES classes (id);
```

### 학생을 반에 배정

```sql
-- 현재 데이터 확인
SELECT id, name, email, class_id
FROM students
ORDER BY id ASC;

-- ① A반에 세 명 (04의 이메일 변경을 했든 안 했든 한코딩을 찾도록 두 이메일 모두 조건에)
UPDATE students
SET class_id = 1
WHERE email = 'han@example.com'
   OR email = 'hancoding@example.com'
   OR email = 'java@example.com'
   OR email = 'data@example.com';

-- ② 이리액트는 B반
UPDATE students
SET class_id = 2
WHERE email = 'react@example.com';

-- ③ 박스프링은 미배정
UPDATE students
SET class_id = NULL
WHERE email = 'spring@example.com';

-- ④ 배정 결과 확인
SELECT id, name, email, class_id
FROM students
ORDER BY id ASC;
```

- 수동 커밋 상태라면 결과를 확인한 뒤 `COMMIT`으로 확정한다.

| 학생 | 소속 반 번호 |
|---|---|
| 한코딩 | 1 |
| 김자바 또는 김자바개발자 | 1 |
| 이리액트 | 2 |
| 박스프링 또는 박스프링부트 | NULL |
| 정데이터 | 1 |

### 🛠️ 실습: 미배정 학생만 찾기

```sql
SELECT
    s.id,
    s.name,
    s.email
FROM students AS s
LEFT JOIN classes AS c
    ON s.class_id = c.id
WHERE c.id IS NULL
ORDER BY s.id ASC;
```

- `LEFT JOIN`에서 연결된 반이 없는 학생(오른쪽이 `NULL`)만 남긴다.
- 이번처럼 외래키로 관계를 보장한 구조에서는 직접 조회해도 된다.

```sql
SELECT id, name, email
FROM students
WHERE class_id IS NULL
ORDER BY id ASC;
```

## 헷갈리기 쉬운 점
- **`PRIMARY KEY` ≠ 자동 번호.** 자동으로 번호를 받으려면 `AUTO_INCREMENT`가 필요하다. `classes.id`는 직접 넣었다.
- **열 이름이 `class_id`라고 외래키가 아니다.** `FOREIGN KEY … REFERENCES` 제약 조건을 걸어야 DB가 검사한다.
- **외래키 열에는 참조 테이블에 있는 값 또는 `NULL`만** 들어간다. 999처럼 없는 번호는 오류.
- **테이블 생성·`ALTER TABLE`은 한 번만.** 다시 실행하지 말고 조회로 확인한다.
- **`ON`에는 의미가 같은 열끼리** 연결한다: `s.class_id = c.id` (O), `s.id = c.id` (X).
- **`AS`는 결과에서만 쓰는 이름이다.** 테이블의 실제 열 이름은 그대로다.
- **`INNER JOIN`에서 빠진 학생은 삭제된 게 아니다.** 연결할 반이 없어서 결과에 안 나온 것이다.
- **`LEFT JOIN`의 왼쪽 = `FROM` 뒤 테이블.** 어느 테이블을 `FROM`에 두느냐에 따라 결과가 달라진다.
- **`COUNT(*)`는 `NULL` 행도 센다. `COUNT(열)`은 그 열이 `NULL`인 행을 세지 않는다.** 학생 없는 반을 0으로 세려면 `COUNT(s.id)`.
- **`GROUP BY class_id`에서는 `NULL`도 한 그룹**이다.
- **반별 학생 수의 합 ≠ 전체 학생 수일 수 있다.** 미배정 학생은 반 기준 집계에 안 들어간다.
- **일대다 JOIN에서 반 이름이 여러 번 나오는 건 정상이다.** 반마다 한 줄이 필요하면 `GROUP BY`.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 기존 테이블에 열 추가 | `ALTER TABLE … ADD COLUMN` | `ALTER TABLE students ADD COLUMN class_id INT;` |
| 외래키 걸기 | `ADD CONSTRAINT … FOREIGN KEY … REFERENCES` | `ALTER TABLE students ADD CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes (id);` |
| 연결되는 행만 합쳐 조회 | `INNER JOIN … ON` | `FROM students AS s INNER JOIN classes AS c ON s.class_id = c.id` |
| 왼쪽 행은 모두 남기고 합치기 | `LEFT JOIN … ON` | `FROM students AS s LEFT JOIN classes AS c ON s.class_id = c.id` |
| 결과 열 이름 바꾸기 | `AS` | `s.name AS student_name` |
| 테이블 별칭 | `AS` | `FROM students AS s` |
| 짝 없는 행만 | `LEFT JOIN` + `IS NULL` | `… LEFT JOIN classes AS c ON s.class_id = c.id WHERE c.id IS NULL` |
| 전체 행 수 | `COUNT(*)` | `SELECT COUNT(*) AS student_count FROM students;` |
| 값이 있는 행 수 | `COUNT(열)` | `COUNT(class_id) AS assigned_students` |
| 그룹별 개수 | `GROUP BY` + `COUNT` | `SELECT class_id, COUNT(*) … GROUP BY class_id` |
| 빈 그룹도 0으로 | 기준 테이블 `LEFT JOIN` + `COUNT(상대.id)` | `FROM classes AS c LEFT JOIN students AS s ON c.id = s.class_id GROUP BY c.id, c.name` + `COUNT(s.id)` |

## 확인 문제

<details><summary>Q. 학생 테이블에 반 이름을 바로 저장하면 어떤 문제가 있는가? 어떻게 바꿨는가?</summary>

같은 반 이름이 여러 행에 **반복**되고, 반 이름을 바꾸려면 **해당 학생 행을 모두** 수정해야 한다 (일부만 고치면 같은 반인데 이름이 달라진다). 그래서 반 정보는 `classes` 테이블로 나누고, 학생에게는 반 번호 `class_id`만 저장했다. 반 이름은 `classes`에서 한 번만 고치면 된다.
</details>

<details><summary>Q. 기본키와 외래키의 차이는? `students.class_id`는 무엇인가?</summary>

기본키 = 그 테이블의 각 행을 구분하는 값 (`students.id`, `classes.id`), 외래키 = **다른 테이블의 행을 가리키는** 값. `students.class_id`는 학생이 소속된 반(`classes.id`)을 가리키는 **외래키**다.
</details>

<details><summary>Q. 학생과 반은 왜 일대다 관계인가?</summary>

한 반에는 여러 학생이 소속될 수 있고, 학생 한 명은 최대 한 반에 소속되기 때문이다. 반 **하나** ↔ 학생 **여러 명**.
</details>

<details><summary>Q. `classes.id INT PRIMARY KEY`에는 번호가 자동으로 붙는가?</summary>

아니다. `PRIMARY KEY` 자체는 번호를 자동 생성하지 않는다. 이번에는 직접 지정했고, 자동 생성을 원하면 `AUTO_INCREMENT`를 추가한다.
</details>

<details><summary>Q. 열 이름을 `class_id`로 지으면 외래키가 되는가? 외래키가 되면 무엇이 달라지는가?</summary>

이름만으로는 안 된다. `ALTER TABLE … ADD CONSTRAINT … FOREIGN KEY (class_id) REFERENCES classes (id)`로 **제약 조건**을 걸어야 DB가 관계를 검사한다. 그러면 `class_id`에는 `classes.id`에 **실제로 있는 번호**나 **`NULL`** 만 저장할 수 있다.
</details>

<details><summary>Q. `UPDATE students SET class_id = 999 WHERE email = 'react@example.com';`을 실행하면?</summary>

`classes`에 999번 반이 없으므로 **외래키 오류**가 나고, 이리액트의 반 번호는 기존 값 그대로 남는다. 없는 반에 배정하지 못하게 DB가 검사하는 것이 외래키 제약 조건의 역할이다.
</details>

<details><summary>Q. `ON students.class_id = classes.id`는 무엇을 뜻하는가? `ON s.id = c.id`로 연결하면 왜 틀리는가?</summary>

학생의 소속 반 번호와 반 테이블의 번호가 **같은 행끼리** 연결한다는 뜻이다. `s.id`(학생 번호)와 `c.id`(반 번호)는 의미가 다르다. 숫자가 우연히 같다고 같은 반인 것은 아니다.
</details>

<details><summary>Q. `students.name AS student_name`의 `AS`는 무엇을 하는가? 테이블의 열 이름이 바뀌는가?</summary>

조회 결과에 쓸 **별칭**을 정한다 (두 테이블 모두 `name`이 있어서 구분용). 실제 테이블의 열 이름은 **바뀌지 않는다.** `FROM students AS s`처럼 테이블에도 별칭을 붙일 수 있다.
</details>

<details><summary>Q. `INNER JOIN` 결과에 박스프링 학생이 없다. 삭제된 것인가?</summary>

아니다. `INNER JOIN`은 **연결 조건을 만족하는 행만** 반환하는데, 박스프링은 `class_id`가 `NULL`이라 연결할 반이 없어서 결과에 포함되지 않은 것이다.
</details>

<details><summary>Q. `LEFT JOIN`은 `INNER JOIN`과 무엇이 다른가? "왼쪽 테이블"은 어느 것인가?</summary>

`LEFT JOIN`은 **왼쪽 테이블의 모든 행을 유지**하고, 오른쪽에 연결할 행이 없으면 오른쪽 열을 `NULL`로 채운다. 왼쪽 테이블은 **`FROM` 뒤에 적은 테이블**이다. 그래서 반이 없는 학생도 `class_name = NULL`로 나온다.
</details>

<details><summary>Q. `COUNT(*)`와 `COUNT(class_id)`의 차이는? 현재 예제의 값은?</summary>

`COUNT(*)` = 전체 행 개수(5), `COUNT(class_id)` = `class_id`가 `NULL`이 **아닌** 행 개수(4, 반 배정된 학생).
</details>

<details><summary>Q. 반별 학생 수를 `classes LEFT JOIN students`로 셀 때 왜 `COUNT(*)`가 아니라 `COUNT(s.id)`를 쓰는가?</summary>

학생이 없는 C반도 `LEFT JOIN` 결과에 학생 쪽 열이 모두 `NULL`인 **한 행**으로 남는다. `COUNT(*)`는 이 행을 세서 1이 되고, `COUNT(s.id)`는 `NULL`을 세지 않아 **0**이 된다. 실제 학생 수를 세려고 학생 기본키 `s.id`를 쓴다.
</details>

<details><summary>Q. 반별 학생 수(3 + 1 + 0)를 더한 값이 전체 학생 수(5)와 다른 이유는?</summary>

**반 목록을 기준으로** 집계했기 때문이다. 미배정 학생(박스프링)은 연결할 반이 없어서 어느 반의 학생 수에도 포함되지 않는다.
</details>

<details><summary>Q. `classes INNER JOIN students` 결과에 A반 이름이 세 번 나온다. 오류인가?</summary>

정상이다. 일대다 관계에서 **학생마다 한 행**을 반환하므로 A반 학생이 세 명이면 A반 이름도 세 번 나온다. 반마다 한 행으로 보고 싶으면 `GROUP BY`로 집계한다.
</details>

## 완료 체크
- [ ] 반 정보를 별도 테이블로 관리하는 이유를 이해했다.
- [ ] `classes` 테이블을 만들고 반 세 개를 추가했다.
- [ ] `students.class_id`와 외래키 제약 조건을 추가했다.
- [ ] 학생을 반에 배정했다.
- [ ] 존재하지 않는 반 번호를 넣었을 때 오류를 확인했다.
- [ ] `INNER JOIN`으로 학생과 반 이름을 함께 조회했다.
- [ ] `LEFT JOIN`으로 미배정 학생도 조회했다.
- [ ] `COUNT(*)`와 `COUNT(열)`의 차이를 이해했다.
- [ ] 학생이 없는 반을 포함해 반별 학생 수를 조회했다.

## 질문 노트

_아직 없음_
