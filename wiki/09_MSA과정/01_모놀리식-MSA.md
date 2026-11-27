# 01. 모놀리식과 MSA — 왜 서비스를 나눌까?

> 과정: MSA과정 · [노션 원문](https://app.notion.com/p/422848f71c9b80338e06fb496dedde08) · 최종 갱신일: 2026-11-27

## 한눈에 보기
- **모놀리식**(Monolithic)은 여러 기능을 **하나의 애플리케이션 배포 단위**로 만드는 구조다. Controller·Service·Mapper로 패키지를 나눠도 **하나로 배포되면 모놀리식**이다. 기준은 파일 개수가 아니다.
- **MSA**(Microservices Architecture)는 **업무 기능별 서비스**로 나누고, 서비스마다 **따로 배포**할 수 있게 설계하는 방식이다. "Micro"는 코드 크기가 아니라 책임·경계·독립 배포로 판단한다.
- **패키지 분리 ≠ 서비스 분리.** 같은 프로그램 안에서는 메서드를 부른다(`studentService.findById(authorId)`). 별도 서비스는 상대의 **API를 HTTP로 부른다**(`GET /students/3`). 그래서 Spring(Java)과 Express(JavaScript)처럼 기술이 달라도 **HTTP·JSON 약속(API 계약)** 만 지키면 통신할 수 있다.
- 나누면 **독립 실행·배포·확장**을 얻는다. 대신 **네트워크 실패·지연(타임아웃), 장애 전파, 로그 분산, 여러 서비스에 걸친 변경**이라는 비용이 생긴다.
- **데이터 소유권**: 학생 정보는 학생 서비스(Spring :8081), 공지는 공지 서비스(Express :3000)가 관리한다. 공지에는 이름 대신 `authorId`만 두고 필요하면 학생 API를 부른다. 같은 장애라도 **조회는 공지를 보여 주고 등록은 멈춘다** (업무 규칙). MSA가 항상 정답은 아니다. **서비스 개수보다 책임과 경계가 중요하다.**

> 💡 보충: 수업에서는 SSR-CSR 과정의 Spring 프로젝트(`jsp`, MyBatis + DB)를 `controller`·`service`·`mapper`·`dto` 패키지로 나누고 **공지 기능**(`notices` 테이블, `/api/notice`)을 붙여 **모놀리식의 예**로 보여 줬다. 공지 Service가 학생 Mapper를 **직접** 불러 학생 이름을 가져오는 `/api/hello/{id}`도 있다. 코드는 실습 정리에 있다.

## 학습 목표
- 모놀리식과 MSA의 차이를 이해한다.
- 패키지 분리와 서비스 분리를 구분한다.
- 업무 기능에 따라 서비스의 역할을 나눈다.
- 독립 실행·배포·확장의 의미를 이해한다.
- 서비스 분리로 얻는 장점과 늘어나는 복잡도를 설명한다.
- 이번 실습에서 각 서비스가 관리할 데이터를 구분한다.

## 핵심 개념

### 1. 기능이 늘어나면 서버도 나누어야 할까?
교육 서비스에 처음에는 학생 목록만 있었다. 기능이 늘어 다음을 제공하게 되었다.

```text
교육 서비스
 ├─ 학생 관리
 ├─ 공지 관리
 ├─ 출결 관리
 └─ 상담 기록
```

- 이 기능들을 **하나의 Spring 애플리케이션**에 구현할 수 있다. 수업에서는 학생 목록 프로젝트에 공지 기능을 더해 보였다 (실습 정리).
- 기능이 네 개니 서버도 네 개로 나눠야 할까? **반드시 그럴 필요는 없다.** 먼저 하나로 만드는 방식과 나누는 방식이 어떻게 다른지 본다.

### 2. 모놀리식 — 하나의 애플리케이션으로 구성하기
**모놀리식**(Monolithic) = 여러 기능을 **하나의 애플리케이션 배포 단위**로 구성하는 방식. 예를 들어 학생·공지·출결 기능을 하나의 Spring 프로젝트에서 제공한다.

```text
React 화면
    ↓
Spring 애플리케이션
 ├─ 학생 기능
 ├─ 공지 기능
 └─ 출결 기능
```

프로젝트 안에서는 역할에 따라 패키지와 클래스를 나눌 수 있다.

```text
com.hancoding.education
 ├─ controller
 ├─ service
 ├─ mapper (repository)
 └─ dto (data transfer object)
```

```text
com.hancoding.education
 ├─ student
 ├─ notice
 └─ attendance
```

> 💡 보충: 위는 **역할별** 패키지, 아래는 **업무별** 패키지다. 수업 프로젝트는 위 방식을 썼다 (실습 정리의 파일 구조). 어느 쪽이든 **한 프로그램으로 실행·배포**하므로 모놀리식이다. Controller·Service·Mapper가 맡는 일은 [SSR-CSR 02](../08_SSR-CSR과정/02_JSP-SSR화면.md) 5장에 있다.

**모놀리식이면 코드가 모두 한 파일에 있나?** 아니다. Controller·Service·Repository를 나누고 업무별 패키지를 만들 수 있다. **모놀리식의 핵심은 파일 개수가 아니라, 하나의 애플리케이션으로 배포된다는 점**이다.

장점
- 처음 프로젝트를 구성하기가 비교적 단순하다.
- 기능 사이에서 메서드를 직접 호출할 수 있다.
- 한 애플리케이션의 로그에서 흐름을 확인하기 쉽다.
- 하나의 DB를 쓰면 관련 변경을 **하나의 DB 트랜잭션**으로 묶기 쉽다.

고려할 점
- 일부 기능만 바꿔도 애플리케이션 전체를 다시 배포할 수 있다.
- 특정 기능만 따로 확장하기 어려울 수 있다.
- 구조를 관리하지 않으면 기능 간 의존성이 복잡해질 수 있다.

모놀리식도 **여러 인스턴스로 실행해 확장**할 수 있다. 다만 특정 기능 하나만 별도 서비스처럼 확장하는 것과는 다르다.

> 💡 보충: 인스턴스 = 같은 프로그램을 띄워 실제로 실행 중인 하나하나. 트랜잭션(모두 확정 `COMMIT` / 모두 취소 `ROLLBACK`)은 [DB 04](../06_데이터베이스과정/04_수정삭제-트랜잭션.md) 6장에서 배웠다.

### 3. MSA — 업무 기능별 서비스로 나누기
**MSA**(Microservices Architecture, 마이크로서비스 아키텍처) = 업무 기능별로 역할을 가진 서비스를 구성하고, 각 서비스를 **독립적으로 배포**할 수 있도록 설계하는 방식.

이번 실습은 두 서비스로 나눈다.

```text
학생 서비스
 └─ 학생 정보 관리

공지 서비스
 └─ 공지 정보 관리
```

각 서비스는 **별도의 프로그램**으로 실행된다.

```text
React 화면
    ↓
Express 공지 서비스
    ↓ HTTP 요청
Spring 학생 서비스
```

**"Micro"는 코드가 작다는 뜻일까?** 코드 줄 수나 파일 개수로 판단하지 않는다. 중요한 것은 다음이다.
- 어떤 업무를 책임지는가?
- 다른 서비스와의 경계가 명확한가?
- 내부 구현을 지나치게 공유하지 않는가?
- 독립적으로 배포할 수 있는가?

**기능을 무조건 잘게 나누는 것이 목표는 아니다.**

### 4. 패키지를 나누는 것과 무엇이 다른가?

**구성 A — 하나의 Spring 프로젝트**

```text
Spring 애플리케이션
 ├─ StudentService
 └─ NoticeService
```

공지 기능에서 학생 정보가 필요하면 같은 프로그램 안의 **메서드를 호출**한다.

```java
studentService.findById(authorId);
```

수업 코드에서는 `NoticeService`가 `StudentMapper`를 주입받아 학생 이름을 바로 조회했다 (`/api/hello/{id}`, 전체 코드는 실습 정리).

```java
    public String getNoticeAndStudentTitleAndName(Long id) {
        String studentName = studentMapper.searchNameById(id);
        String noticeTitle = noticeMapper.findById(id).getTitle();

        return "해당 번호의 학생은 " + studentName + "이고 해당 번호의 게시글은 " + noticeTitle + "입니다.";
    }
```

> 💡 보충: 이 메서드는 **같은 번호**로 학생과 공지를 각각 찾는 연습용 코드다. 공지의 작성자를 찾는 것이 아니다 (지금 `notices` 테이블에는 작성자 열이 없다). 하나의 프로그램·하나의 DB라서 공지 기능이 **학생 테이블을 조회하는 Mapper를 직접** 쓸 수 있다. 서비스를 나누면 이렇게 할 수 없고, 8장처럼 학생 서비스의 API를 불러야 한다.

**구성 B — 별도의 서비스**

```text
Express 공지 서비스
        ↓ HTTP 요청
Spring 학생 서비스
```

Express는 다른 프로세스에 있는 Java 메서드를 직접 호출하지 않는다. 학생 서비스가 제공하는 **API를 호출**한다.

```text
GET /students/3
```

> 💡 보충: 프로세스 = 실행 중인 프로그램 하나. `node server.js`와 Spring `bootRun`을 따로 띄우면 프로세스가 두 개다. 서로의 변수나 메서드를 직접 쓸 수 없다.

| 항목 | 같은 애플리케이션 내부 | 별도 서비스 |
|---|---|---|
| 실행 | 하나의 프로그램 | 별도 프로그램 |
| 일반적인 호출 | 메서드 호출 | HTTP 등 서비스 간 통신 |
| 오류 원인 | 내부 코드 오류 등 | 내부 오류 + 연결 실패·시간 초과 등 |
| 배포 | 애플리케이션 단위 | 서비스별 독립 배포를 목표로 설계 |

**코드 폴더를 나누는 것과 실행·배포 단위를 나누는 것은 다르다.**

### 5. 서로 다른 기술을 사용해도 되나?

| 서비스 | 기술 |
|---|---|
| 학생 서비스 | Java + Spring Boot |
| 공지 서비스 | JavaScript + Express |

Express가 Java 코드를 이해해야 통신할 수 있을까? **그렇지 않다.** 두 서비스는 **HTTP 요청과 JSON 응답이라는 약속**을 쓴다.

요청 예시

```text
GET http://localhost:8081/students/3
```

응답 예시

```json
{
  "id": 3,
  "name": "이리액트",
  "email": "react@example.com"
}
```

공지 서비스는 이 JSON의 의미와 구조를 알고 쓰면 된다.

```text
공지 서비스가 알아야 할 것
 ├─ 어느 주소로 요청하는가?
 ├─ 어떤 값을 보내는가?
 ├─ 어떤 형태로 응답하는가?
 └─ 실패하면 어떤 상태 코드가 오는가?
```

- 이런 약속을 **API 계약**이라고 부른다.
- 서비스마다 다른 기술을 쓸 수 있지만, **MSA라고 반드시 다른 언어를 써야 하는 것은 아니다.**

> 💡 보충: Express의 `res.json()`과 Spring의 `@RestController`는 둘 다 객체를 **같은 모양의 JSON 글자**로 바꿔 응답한다 ([Node 03](../02_Node과정/03_서버-데이터보내기.md) 8장, [Spring 06](../03_Spring과정/06_JSON-API-React연결.md) 3장). 받는 쪽은 어떤 언어로 만든 서버인지 몰라도 된다. React가 Express API와 Spring API를 똑같이 `fetch`로 불렀던 것도 같은 이유다.

> 💡 보충: 이 강의와 과정 페이지는 학생 서비스를 **8081**로 적는다. 그런데 02회차 본문의 `application.properties`는 `server.port=8080`이다 (2026-11-27 기준, [_과정개요](_과정개요.md) 보충). 02회차 경로는 `/students`, `/students/{id}`다.

### 6. 독립 실행·배포·확장은 무엇인가?

**① 독립 실행** — 학생 서비스와 공지 서비스를 각각 실행하거나 종료할 수 있다.

```text
학생 서비스 실행
공지 서비스 실행
        ↓
학생 서비스만 종료 가능
```

- 다만 공지 서비스가 학생 서비스에 기대는 기능은 영향을 받을 수 있다.
- **프로그램이 계속 실행된다는 것과 모든 기능이 정상이라는 것은 다르다.**

**② 독립 배포** — 공지 서비스만 고쳤으면 학생 서비스는 다시 배포하지 않고 공지 서비스만 배포할 수 있게 구성한다. 단, **API 계약을 깨뜨리는 변경**이 있으면 상대 서비스도 영향을 받는다. 예를 들어 학생 API가 이렇게 바뀌면 문제가 생길 수 있다.

```json
{
  "id": 3,
  "name": "이리액트"
}
```

```json
{
  "id": 3,
  "studentName": "이리액트"
}
```

- 공지 서비스가 `name`을 읽고 있다면 수정이 필요하다.
- 독립 배포를 하려면 **호환성을 고려한 API 변경**도 중요하다.

> 💡 보충: JavaScript에서 없는 속성을 읽으면 오류가 아니라 `undefined`가 나온다. 바뀐 JSON에서 `student.name`을 읽으면 `undefined`이고, `` `작성자: ${student.name}` ``은 `작성자: undefined`가 된다 (Node로 확인). 서버는 멀쩡히 돌지만 화면에 틀린 값이 나가서 알아차리기 어렵다.

**③ 독립 확장** — 공지 조회 요청만 많아지면 공지 서비스의 실행 인스턴스를 늘리는 방식을 고려할 수 있다.

```text
공지 서비스
 ├─ 인스턴스 A
 ├─ 인스턴스 B
 └─ 인스턴스 C
```

- 실제 운영에서는 요청 분산과 데이터 공유 등 추가 구성이 필요하다.
- 이번 **메모리 배열 예제를 그대로 여러 개 실행하면 프로그램마다 데이터가 달라질 수 있다.** 그래서 곧바로 운영용 확장 구조가 되지는 않는다.

> 💡 보충: 인스턴스 A에 공지를 등록하면 A의 배열에만 들어간다. 다음 조회 요청이 B로 가면 그 공지가 없다. 그래서 여러 인스턴스는 보통 DB 같은 **공유 저장소**를 함께 쓴다.

### 7. 나누면 무엇이 어려워질까?

**① 네트워크 통신은 실패할 수 있다.** 같은 프로그램의 메서드 호출과 달리 다음 문제가 추가된다.
- 상대 서비스가 종료됨
- 주소나 포트가 잘못됨
- 연결이 끊김
- 응답이 지나치게 늦음
- 예상과 다른 데이터가 반환됨

> 💡 보충: [비동기 04](../05_비동기과정/04_느린API-화면.md) 9장에서 본 것처럼, **오류 응답(404·500)을 받은 것**과 **응답을 아예 받지 못한 것(연결 실패)** 은 다르다. 서비스 사이 호출에서도 둘을 따로 처리한다 (06회차 "`404`와 연결 실패 구분").

**② 다른 서비스의 지연이 영향을 준다.**

```text
공지 상세 조회
      ↓
작성자 이름 조회
      ↓
학생 서비스 응답 지연
      ↓
공지 응답도 지연
```

- 기다리는 시간을 제한하는 **타임아웃**과 실패 처리 규칙이 필요하다.

> 💡 보충: 비동기 04의 화면은 시간제한이 없어서 응답이 안 오면 로딩이 계속됐다. 타임아웃은 06회차에서 다룬다.

**③ 장애가 전파될 수 있다.** 학생 서비스가 실패했는데 공지 서비스가 이를 처리하지 않으면 공지 조회까지 실패할 수 있다. **서비스를 나누었다고 장애가 자동으로 격리되는 것은 아니다.**

**④ 로그와 실행 환경이 나뉜다.** 공지 조회가 실패하면 어느 프로그램에서 문제가 생겼는지 찾아야 한다.

```text
React 요청 실패
      ↓
Express 로그 확인
      ↓
필요하면 Spring 로그 확인
```

**⑤ 여러 서비스의 변경을 함께 처리하기 어렵다.**
- 서로 다른 서비스와 저장소에 걸친 변경은 **하나의 DB 안에서 처리하는 트랜잭션과 다르다.**
- 예를 들어 공지 등록과 다른 서비스의 기록 변경을 함께 한다면, **일부만 성공했을 때의 처리 방법**을 설계해야 한다.
- 이번 실습에서는 분산 트랜잭션을 구현하지 않고, 이런 어려움이 있다는 점만 이해한다.

> 💡 보충: 모놀리식 + 하나의 DB라면 `ROLLBACK` 한 번으로 둘 다 취소할 수 있다 ([DB 04](../06_데이터베이스과정/04_수정삭제-트랜잭션.md)). 저장소가 서비스마다 다르면 한쪽의 `ROLLBACK`이 다른 서비스의 변경까지 되돌리지 못한다.

### 8. 데이터는 누가 관리해야 할까? — 데이터 소유권
이번 실습에서는 데이터 소유권을 분명하게 나눈다.

학생 서비스가 관리할 데이터

```json
{
  "id": 3,
  "name": "이리액트",
  "email": "react@example.com"
}
```

공지 서비스가 관리할 데이터

```json
{
  "id": 1,
  "title": "프로젝트 발표 안내",
  "content": "발표 자료를 준비해 주세요.",
  "authorId": 3
}
```

- 공지에는 학생 이름 대신 **학생 번호 `authorId`** 를 보관한다.
- 작성자 이름이 필요하면 **학생 API를 요청**한다.

**왜 공지 서비스가 학생 이름을 직접 수정하지 않을까?**
- 학생 이름은 **학생 서비스가 책임지는 정보**이기 때문이다.
- 공지 서비스가 학생 서비스의 DB를 직접 수정하면 **내부 테이블 구조와 규칙에 강하게 의존**하게 된다.

```text
권장하는 실습 흐름

공지 서비스
    ↓ 학생 API 호출
학생 서비스
    ↓
학생 데이터 조회
```

- **데이터를 소유한 서비스가 정해진 API로 정보를 제공**하도록 한다.
- `authorId`는 이번 실습에서 서비스 간 참조에 쓰는 번호다. 별도 서비스의 저장소 사이에 **하나의 DB 외래키가 자동으로 생기는 것은 아니다.**

> 💡 보충: [DB 05](../06_데이터베이스과정/05_테이블관계-JOIN.md) 6장에서는 `students.class_id`에 외래키가 있어서, 없는 반 번호(999)를 넣으면 DB가 막았다. `authorId`에는 그런 검사가 없다. 그래서 없는 학생 번호로 공지가 등록되지 않게 하려면 **공지 서비스가 학생 API로 직접 확인**해야 한다 (05회차 "등록 전에 작성자 존재 여부 확인"). JOIN으로 이름을 붙이던 일도 **API 응답을 합치는 일**로 바뀐다 (10장의 `authorName`).

### 9. 실습에서 만들 서비스 구조

```text
사용자
  ↓
React 공지 화면 :5173
  ↓ /api 요청
Express 공지 서비스 :3000
  ↓ 학생 API 요청
Spring 학생 서비스 :8081
```

개발 중 React의 `/api` 요청은 **Vite 프록시**로 Express에 전달한다.

| 구성 | 책임 |
|---|---|
| React | 입력·화면·로딩·오류 안내 |
| Express | 공지 관리와 작성자 정보 결합 |
| Spring | 학생 정보 조회 |

- React는 MSA라는 이유로 **모든 백엔드를 직접 호출할 필요가 없다.**
- 이번에는 Express가 공지를 제공하면서 필요한 학생 정보를 가져오도록 구성한다.

과정 페이지의 서비스별 소유 데이터:

| 구성 | 실행 주소 예 | 소유하는 데이터·기능 |
|---|---|---|
| React | `localhost:5173` | 화면과 사용자 입력 상태 |
| Express 공지 서비스 | `localhost:3000` | 공지 번호·제목·내용·작성자 번호 |
| Spring 학생 서비스 | `localhost:8081` | 학생 번호·이름·이메일 |

> 💡 보충: CORS는 어디에 필요할까? 브라우저(React :5173)는 Vite 프록시를 거쳐 **같은 출처**로 요청하므로 CORS 설정이 필요 없다 ([SSR-CSR 04](../08_SSR-CSR과정/04_React-CSR화면.md) 4장). Express → Spring 호출은 **서버끼리의 HTTP 요청**이라 브라우저 규칙인 CORS가 끼어들지 않는다. [Spring 06](../03_Spring과정/06_JSON-API-React연결.md) 6장의 `@CrossOrigin`은 브라우저의 React가 Spring을 **직접** 부를 때 필요했던 설정이다. 자세한 차이는 05회차 "서버 간 통신과 브라우저 CORS의 차이"에서 다룬다.

### 10. 활동 — 요청 흐름과 실패 상황 살펴보기

**상황 A — 공지 상세 조회.** 사용자가 공지 1번을 선택한다.
1. React가 Express에 공지를 요청한다.
2. Express가 공지의 `authorId`를 확인한다.
3. Express가 Spring에 학생 정보를 요청한다.
4. Spring이 학생 정보를 응답한다.
5. Express가 공지와 작성자 이름을 합쳐 응답한다.
6. React가 결과를 표시한다.

최종 응답 예시

```json
{
  "id": 1,
  "title": "프로젝트 발표 안내",
  "content": "발표 자료를 준비해 주세요.",
  "authorId": 3,
  "authorName": "이리액트"
}
```

**상황 B — 학생 서비스 종료.** 공지 자체는 Express에 있지만 작성자 정보를 가져오지 못한다. 이번 실습에서는 이렇게 처리한다.

```text
공지 내용: 표시
작성자: 정보 확인 불가
```

**상황 C — 학생 서비스 장애 중 공지 등록.** 공지 등록은 작성자 존재 확인을 **필수**로 정한다. 그래서 학생 서비스에 연결할 수 없으면 **등록하지 않고 재시도하도록 안내**한다.

| 동작 | 이번 실습의 실패 처리 |
|---|---|
| 공지 조회 | 작성자 정보 없이 공지 표시 가능 |
| 공지 등록 | 작성자 확인이 안 되면 등록 중단 |

**동일한 장애라도 업무 규칙에 따라 처리 방식이 달라질 수 있다.** 작성자 없음·없는 공지(`404`)까지 포함한 전체 규칙은 [_과정개요](_과정개요.md)의 "상황별 처리 규칙" 표에 있다.

> 💡 보충: 왜 다르게 처리할까? 조회는 작성자 이름이 빠져도 공지 내용 자체는 쓸모가 있다. 등록은 확인 없이 저장하면 **없는 학생 번호를 가진 공지**가 남을 수 있다 (8장 보충: 외래키가 대신 막아 주지 않는다).

### 11. MSA를 항상 선택해야 할까?
기능이 몇 개 있다는 이유만으로 서비스를 나눌 필요는 없다.

| 상황 | 검토할 방향 |
|---|---|
| 작은 팀이 단순한 서비스를 빠르게 개발 | 모놀리식부터 시작 가능 |
| 여러 팀이 서로 다른 기능을 독립적으로 운영 | MSA 검토 |
| 특정 업무만 별도 배포·확장이 필요 | 서비스 분리 검토 |
| 서비스 간 경계가 불명확함 | 먼저 업무와 데이터 구조 정리 |
| 통신·배포·장애 관리 역량이 부족함 | 분리로 늘어나는 비용을 신중하게 평가 |

- 모놀리식도 구조를 잘 나누어 개발할 수 있다.
- 반대로 서비스를 여러 개 만들었더라도 **서로의 내부 구현에 강하게 의존하면** 독립적으로 운영하기 어렵다.
- **서비스 개수보다 명확한 책임과 경계가 중요하다.**

> 이번 과정의 예제는 MSA의 기본 원리를 경험하는 **축소 실습**이다. 프로젝트와 포트를 나누는 것만으로 MSA 설계가 완성되는 것은 아니다. (과정 페이지)

### 정리

| 개념 | 의미 |
|---|---|
| 모놀리식 | 여러 기능을 하나의 애플리케이션 배포 단위로 구성 |
| MSA | 업무별 서비스를 독립적으로 배포할 수 있도록 설계 |
| 서비스 경계 | 각 서비스가 책임지는 업무의 범위 |
| API 계약 | 요청 경로·입력·응답·상태 코드 등의 약속 |
| 독립 실행 | 서비스를 별도 프로그램으로 실행·종료 |
| 독립 배포 | 다른 서비스 전체를 함께 배포하지 않고 변경 반영 |
| 독립 확장 | 필요한 서비스의 실행 규모를 개별적으로 조정 |
| 데이터 소유권 | 해당 데이터의 관리 책임을 특정 서비스에 둠 |
| 타임아웃 | 응답을 기다리는 시간 제한 |
| 장애 전파 | 한 서비스의 문제가 호출한 서비스에 영향을 줌 |

## 실습 정리
이번 회차는 개념 위주다. 서비스를 실제로 나눠 만드는 실습은 [02_Spring학생API](02_Spring학생API.md)부터 시작한다. 수업에서는 비교용으로 **모놀리식 Spring 프로젝트에 공지 기능을 붙인 코드**를 보여 줬다. 활동(요청 흐름과 실패 상황)은 핵심 개념 10장에 있다.

### 수업 코드 — 모놀리식 프로젝트에 공지 기능 추가
바탕 프로젝트는 [SSR-CSR 02](../08_SSR-CSR과정/02_JSP-SSR화면.md)의 `jsp`(패키지 `com.example.jsp`, MyBatis + MariaDB/MySQL `school` DB)와 [SSR-CSR 04](../08_SSR-CSR과정/04_React-CSR화면.md)의 `StudentApiController`다.

**파일 구조** (수업 화면)

```text
jsp
└─ src/main
   ├─ java/com/example/jsp
   │  ├─ controller
   │  │  ├─ NoticeApiController
   │  │  └─ StudentApiController
   │  ├─ dto
   │  │  ├─ Notice
   │  │  └─ Student
   │  ├─ mapper
   │  │  ├─ NoticeMapper       (인터페이스)
   │  │  └─ StudentMapper      (인터페이스)
   │  ├─ service
   │  │  ├─ NoticeService
   │  │  └─ StudentService
   │  ├─ JspApplication
   │  └─ ServletInitializer
   └─ resources/mappers
      ├─ NoticeMapper.xml
      └─ StudentMapper.xml
```

- SSR-CSR 02에서는 `com.example.jsp` 한 패키지에 클래스를 모두 뒀다. 이번에는 **역할별 하위 패키지**로 나눴다 (핵심 개념 2장의 위쪽 구조). 패키지를 여러 개로 나눠도 **`jsp` 하나로 실행·배포**하므로 모놀리식이다.

> 💡 보충: 수업 화면에는 `StudentPageController`가 보이지 않는다 (화면 아래가 잘려 `webapp`·`application.properties`는 보이지 않는다). `Student`·`StudentMapper` 인터페이스·`StudentService`·`StudentApiController` 코드는 이번 원문에 없다. 클래스를 하위 패키지로 옮기면 파일 맨 위 `package`와 import, 그리고 XML의 `namespace`·`resultType`도 새 경로(`com.example.jsp.mapper.…`, `com.example.jsp.dto.…`)로 바뀌어야 한다. XML 안의 경로는 글자라서 함께 바뀌었는지 직접 확인한다.

**단계 흐름**
1. DB에 `notices` 테이블을 만들고 예시 공지 2개를 넣는다.
2. `dto/Notice` → `mapper/NoticeMapper` + `NoticeMapper.xml` → `service/NoticeService` → `controller/NoticeApiController` (`/api/notice`, `/api/notice/{id}`) (강의 1장)
3. `NoticeService`에 `StudentMapper`를 더 주입하고 `getNoticeAndStudentTitleAndName` 추가 → Controller에 `/api/hello/{id}` 추가, `StudentMapper.xml`에 `searchNameById` (강의 4장, 핵심 개념 4장의 구성 A)

#### 1. `notices` 테이블과 예시 데이터 (SQL)

```sql
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

```sql
insert into notices (title, content, created_at)
values ('제목 테스트1', '내용 테스트2', now()), ('제목 테스트1', '내용 테스트2', now()); 

```

> 💡 보충: MySQL 8.4에서 두 SQL을 그대로 실행하면 `id` 1·2에 **똑같은** 제목·내용이 들어간다 (오류는 아니다). `updated_at`은 값을 주지 않아도 `DEFAULT CURRENT_TIMESTAMP`로 등록 시각이 채워진다. `ON UPDATE CURRENT_TIMESTAMP`는 행을 수정할 때 그 시각으로 바꾸라는 뜻이다. `ENGINE=InnoDB`는 트랜잭션을 지원하는 MySQL 저장 방식, `utf8mb4`는 한글·이모지를 저장할 수 있는 문자 집합이다.

#### 2. `dto/Notice.java`

```java
package com.example.jsp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor // 모든 필드를 매개변수로 받는 생성자
@NoArgsConstructor // 기본 생성자
public class Notice {

    private Long id;

    private String title;

    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

```

> 💡 보충: `GetMapping`·`LocalDate` import는 쓰이지 않는다 (그대로 둬도 컴파일된다). `LocalDateTime`은 JSON에서 `"2026-11-27T08:58:33"` 같은 글자로 나온다 (실행 확인). `created_at` → `createdAt`처럼 이름이 바뀌어 담기는 것은 `map-underscore-to-camel-case=true` 설정 덕분이다 ([DB 06](../06_데이터베이스과정/06_Spring-MyBatis.md) 5장).

#### 3. `mapper/NoticeMapper.java`

```java
package com.example.jsp.mapper;

import com.example.jsp.dto.Notice;
import com.example.jsp.dto.Student;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NoticeMapper {

    List<Notice> findAll();

    Notice findById(Long id);

    int insert(Notice notice);

    int deleteById(Long id);
}

```

#### 4. `resources/mappers/NoticeMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.jsp.mapper.NoticeMapper">

    <select id="findAll" resultType="com.example.jsp.dto.Notice">
        SELECT id, title, created_at
        FROM notices
        ORDER BY id
    </select>

    <select id="findById" resultType="com.example.jsp.dto.Notice">
        SELECT id, title, content, created_at, updated_at
        FROM notices
        WHERE id = #{id}
    </select>


    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        insert into notices (title, content, created_at)
        values (#{title}, #{content}, now())
    </insert>

    <delete id="deleteById">
        delete from notices where id = #{id}
    </delete>

</mapper>
```

> 💡 보충: `findAll`은 `id, title, created_at`만 조회한다. 그래서 목록 JSON에서는 `content`·`updatedAt`이 `null`이다 (실행 확인). 목록에는 제목만, 내용은 상세에서 보여 주는 구성이다. `insert`·`deleteById`는 Mapper에만 있고 이번 Service·Controller에서는 쓰지 않는다. `NoticeMapper.java`의 `Student` import도 쓰이지 않는다.

#### 5. `service/NoticeService.java`

1단계 (강의 1장) — 공지만 다룬다.

```java
package com.example.jsp.service;

import com.example.jsp.dto.Notice;
import com.example.jsp.mapper.NoticeMapper;
import com.example.jsp.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeMapper mapper;

    public List<Notice> noticeList() {
        return mapper.findAll();
    }

    public Notice getNotice(Long id) {
        return mapper.findById(id);
    }
}
```

최종 (강의 4장) — `StudentMapper`도 주입받아 학생 이름과 공지 제목을 함께 쓴다. 필드 이름이 `mapper` → `noticeMapper`로 바뀌었다.

```java
package com.example.jsp.service;

import com.example.jsp.dto.Notice;
import com.example.jsp.mapper.NoticeMapper;
import com.example.jsp.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeMapper noticeMapper;
    private final StudentMapper studentMapper;

    public List<Notice> noticeList() {
        return noticeMapper.findAll();
    }

    public Notice getNotice(Long id) {
        return noticeMapper.findById(id);
    }

    public String getNoticeAndStudentTitleAndName(Long id) {
        String studentName = studentMapper.searchNameById(id);
        String noticeTitle = noticeMapper.findById(id).getTitle();

        return "해당 번호의 학생은 " + studentName + "이고 해당 번호의 게시글은 " + noticeTitle + "입니다.";
    }
}
```

> 💡 보충: `@RequiredArgsConstructor`(Lombok)는 `final` 필드를 받는 생성자를 만든다. SSR-CSR 02에서 쓴 `@AllArgsConstructor`처럼 **생성자 주입**이 된다. 1단계에서는 `StudentMapper` import가 아직 쓰이지 않는다.

#### 6. `controller/NoticeApiController.java` (최종)
1단계는 이 코드에서 `/hello/{id}` 메서드만 없다.

```java
package com.example.jsp.controller;

import com.example.jsp.dto.Notice;
import com.example.jsp.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class NoticeApiController {

    private final NoticeService service;

    @GetMapping("/notice")
    public List<Notice> noticeList() {
        return service.noticeList();
    }

    @GetMapping("/notice/{id}")
    public Notice notice(@PathVariable(name = "id") Long id) {
        return service.getNotice(id);
    }

    @GetMapping("/hello/{id}")
    public String hello(@PathVariable(name = "id") Long id) {
        return service.getNoticeAndStudentTitleAndName(id);
    }

}
```

> 💡 보충: `@RequestMapping("/api/")` 끝의 `/`와 `@GetMapping("/notice")` 앞의 `/`가 겹쳐도 주소는 `/api/notice`가 된다 (`/api//notice`는 404, 실행 확인). `@PathVariable(name = "id")`는 주소의 `{id}` 자리 값을 `Long id`로 받는다 ([DB 06](../06_데이터베이스과정/06_Spring-MyBatis.md) 9장). `@RestController`에서 `String`을 돌려주면 JSON이 아니라 **글자 그대로**(`text/plain`) 응답한다.

#### 7. `resources/mappers/StudentMapper.xml` (강의 4장)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.jsp.mapper.StudentMapper">

    <select id="findAll" resultType="com.example.jsp.dto.Student">
        SELECT id, name, email, class_id
        FROM students
        ORDER BY id
    </select>

    <select id="searchByName" resultType="com.example.jsp.dto.Student">
        SELECT name, email, class_id
        FROM students
        WHERE name LIKE #{keyword}
    </select>

    <select id="searchNameById" resultType="String">
        SELECT name
        FROM students
        WHERE id = #{id}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        insert into students (name, email, class_id)
        values (#{name}, #{email}, #{classId})
    </insert>

    <delete id="deleteById">
        delete from students where id = #{id}
    </delete>

</mapper>
```

> 💡 보충
> - `searchNameById`는 이름 하나만 돌려주므로 `resultType="String"`이다. `StudentMapper` 인터페이스에 `String searchNameById(Long id);`가 있어야 한다 (원문에 인터페이스 코드는 없다).
> - `searchByName`이 SSR-CSR 02의 `LIKE CONCAT('%', #{keyword}, '%')`에서 **`LIKE #{keyword}`** 로 바뀌었다. 이대로면 `%`가 없어 **이름 전체가 같아야** 찾는다. MySQL에서 `LIKE '한'`·`LIKE ''`는 0건, `LIKE '%한%'`는 한코딩 1건이다 (확인함). 부분 검색을 하려면 Service에서 `"%" + keyword + "%"`를 넘기거나 XML을 예전처럼 둔다. 이번 원문에는 `StudentService`가 없어서 수업에서 어떻게 넘겼는지는 알 수 없다.

#### 실행 확인
> 💡 보충: 위 코드를 그대로 넣고 Spring Boot 3.5.16 · JDK 21 · MySQL 8.4로 API만 실행해 본 결과다 (2026-11-27). 학생은 1 한코딩·2 김자바·3 이리액트, 공지는 위 SQL의 1·2번이다. JSP 설정과 `Student`·`StudentMapper` 인터페이스는 원문에 없어서 직접 채웠다.
>
> | 요청 | 결과 |
> |---|---|
> | `GET /api/notice` | 200, 공지 배열. `content`·`updatedAt`은 `null` |
> | `GET /api/notice/1` | 200, `{"id":1,"title":"제목 테스트1","content":"내용 테스트2","createdAt":"…","updatedAt":"…"}` |
> | `GET /api/notice/999` | **200, 빈 본문** (404가 아니다) |
> | `GET /api/notice/abc` | 400 (`Long`으로 바꿀 수 없음) |
> | `GET /api/hello/1` | 200, `해당 번호의 학생은 한코딩이고 해당 번호의 게시글은 제목 테스트1입니다.` |
> | `GET /api/hello/3` (3번 학생은 있고 3번 공지는 없음) | **500**. 서버 로그: `NullPointerException: Cannot invoke "com.example.jsp.dto.Notice.getTitle()" because the return value of "com.example.jsp.mapper.NoticeMapper.findById(java.lang.Long)" is null` |
> | `GET /api/hello/4` (공지 3·4를 더 넣은 뒤, 4번 학생은 없음) | 200, `해당 번호의 학생은 null이고 해당 번호의 게시글은 네번째 공지입니다.` |
>
> - Controller가 `null`을 돌려주면 Spring은 **200 + 빈 본문**을 보낸다. 02·03회차에서는 없는 학생·공지를 **`404`** 로 응답하게 만든다. "실패하면 어떤 상태 코드가 오는가"도 API 계약이다 (핵심 개념 5장).
> - `/api/hello`는 학생이 없으면 `null`이 글자로 들어가고, 공지가 없으면 `null`에서 `getTitle()`을 불러 서버 오류가 난다.

## 헷갈리기 쉬운 점
- **모놀리식 ≠ 코드가 한 파일.** Controller·Service·Mapper로 패키지를 나눠도 **하나의 애플리케이션으로 배포**되면 모놀리식이다.
- **"Micro" ≠ 코드가 작다.** 책임 업무, 경계, 내부 구현 공유 여부, 독립 배포 가능 여부로 판단한다. 무조건 잘게 나누는 것이 목표가 아니다.
- **패키지(폴더) 분리 ≠ 서비스 분리.** 실행·배포 단위가 나뉘어야 서비스 분리다. 같은 프로그램이면 메서드 호출, 별도 서비스면 HTTP 호출이다.
- **기능 개수만큼 서버를 나눌 필요는 없다.**
- **MSA라고 다른 언어를 꼭 써야 하는 것은 아니다.** 다른 언어여도 HTTP·JSON 계약만 맞으면 통신할 수 있다는 뜻이다.
- **실행 중 ≠ 모든 기능 정상.** 학생 서비스가 꺼지면 공지 서비스는 돌아가도 작성자 기능은 영향을 받는다.
- **독립 배포라도 API 계약을 깨면** 상대 서비스를 고쳐야 한다 (`name` → `studentName`).
- **모놀리식도 여러 인스턴스로 확장할 수 있다.** 다만 특정 기능 하나만 따로 확장하는 것과 다르다.
- **메모리 배열 예제를 여러 개 띄우면** 인스턴스마다 데이터가 달라진다. 곧바로 운영용 확장 구조가 아니다.
- **서비스를 나눴다고 장애가 자동으로 격리되지 않는다.** 실패를 처리하지 않으면 공지 조회까지 실패한다.
- **여러 서비스에 걸친 변경은 하나의 DB 트랜잭션처럼 한 번에 취소되지 않는다.**
- **`authorId` ≠ 외래키.** 저장소가 다르면 DB가 학생 존재 여부를 검사해 주지 않는다.
- **다른 서비스의 DB를 직접 고치지 않는다.** 데이터를 소유한 서비스의 API를 쓴다.
- **React가 모든 백엔드를 직접 부를 필요는 없다.** 이번에는 Express가 학생 정보를 가져와 합친다.
- **같은 장애라도 처리가 다를 수 있다.** 조회는 공지를 표시하고, 등록은 중단한다.
- **프로젝트와 포트를 나누는 것만으로 MSA 설계가 완성되지 않는다.**
- 학생 서비스 포트는 이 강의·과정 페이지에선 **8081**, 02회차 본문에선 **8080**이다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 모놀리식인지 판단 | 배포 단위 확인 | 하나로 배포 = 모놀리식 (패키지 수와 무관) |
| 같은 앱 안의 다른 기능 쓰기 | 메서드 호출 | `studentService.findById(authorId);` |
| 다른 서비스의 데이터 쓰기 | HTTP API 호출 | `GET http://localhost:8081/students/3` |
| 다른 서비스의 데이터 가리키기 | 번호만 보관 | `"authorId": 3` |
| 서비스 사이 약속 정하기 | API 계약 | 주소 · 보낼 값 · 응답 형태 · 실패 상태 코드 |
| 응답 필드 바꾸기 | 호환성 확인 | `name` → `studentName`이면 읽는 쪽도 수정 |
| 느린 상대 서비스 대비 | 타임아웃 + 실패 처리 규칙 | 06회차 |
| 실패 위치 찾기 | 로그를 차례로 | React → Express 로그 → Spring 로그 |
| 조회 중 상대 장애 | 대체 응답 | `작성자: 정보 확인 불가` |
| 등록 중 상대 장애 | 등록 중단 | 재시도 안내 |
| 공지 + 작성자 이름 응답 | Express가 결합 | `"authorId": 3, "authorName": "이리액트"` |
| (수업 모놀리식 코드) 공지 API | `@RequestMapping("/api/")` | `/api/notice`, `/api/notice/{id}`, `/api/hello/{id}` |

## 확인 문제

<details><summary>Q. 기능이 네 개(학생·공지·출결·상담)로 늘었다. 서버도 네 개로 나눠야 하는가?</summary>

반드시 그럴 필요는 없다. 네 기능을 하나의 Spring 애플리케이션(모놀리식)에 만들 수 있다. 나눌지는 기능 개수가 아니라 팀 운영 방식, 별도 배포·확장 필요, 경계의 명확함, 늘어나는 운영 비용을 보고 정한다 (11장).
</details>

<details><summary>Q. 모놀리식이면 코드가 모두 한 파일에 있는가? 모놀리식의 핵심은?</summary>

아니다. Controller·Service·Repository(Mapper)를 나누고 업무별 패키지도 만들 수 있다. 핵심은 파일 개수가 아니라 **하나의 애플리케이션으로 배포된다**는 점이다.
</details>

<details><summary>Q. 모놀리식의 장점과 고려할 점을 두 가지씩 말해 보자.</summary>

장점: 처음 구성이 단순하다, 기능 사이에서 메서드를 직접 호출한다, 한 애플리케이션 로그로 흐름을 보기 쉽다, 하나의 DB면 변경을 한 트랜잭션으로 묶기 쉽다. 고려할 점: 일부만 바꿔도 전체를 다시 배포할 수 있다, 특정 기능만 따로 확장하기 어렵다, 관리하지 않으면 기능 간 의존성이 복잡해진다.
</details>

<details><summary>Q. MSA의 "Micro"는 코드가 작다는 뜻인가?</summary>

아니다. 코드 줄 수·파일 개수로 판단하지 않는다. 어떤 업무를 책임지는지, 다른 서비스와 경계가 분명한지, 내부 구현을 지나치게 공유하지 않는지, 독립적으로 배포할 수 있는지가 중요하다. 무조건 잘게 나누는 것이 목표가 아니다.
</details>

<details><summary>Q. 패키지를 나누는 것과 서비스를 나누는 것은 무엇이 다른가?</summary>

패키지 분리는 **한 프로그램 안의 코드 폴더**를 나누는 것이라 다른 기능을 **메서드 호출**로 쓴다. 서비스 분리는 **실행·배포 단위**를 나누는 것이라 다른 서비스를 **HTTP 등 통신**으로 부른다. 그래서 별도 서비스는 내부 오류에 더해 연결 실패·시간 초과 같은 오류도 생긴다.
</details>

<details><summary>Q. 수업 코드에서 `NoticeService`가 `StudentMapper`로 학생 이름을 바로 조회했다. 공지 서비스(Express)와 학생 서비스(Spring)로 나누면 어떻게 바뀌는가?</summary>

공지 서비스는 다른 프로세스의 Java 코드나 학생 DB를 직접 쓸 수 없다(쓰지도 않는다). 학생 서비스가 제공하는 API(`GET /students/3`)를 HTTP로 불러 이름을 받는다. 학생 데이터의 소유자는 학생 서비스이기 때문이다.
</details>

<details><summary>Q. Spring(Java)과 Express(JavaScript)는 언어가 다른데 어떻게 통신하는가? MSA면 반드시 다른 언어를 써야 하는가?</summary>

두 서비스는 **HTTP 요청과 JSON 응답**이라는 약속을 쓴다. Express는 Java 코드를 몰라도 JSON의 의미와 구조만 알면 된다. 이 약속(주소, 보낼 값, 응답 형태, 실패 상태 코드)을 **API 계약**이라 한다. 다른 기술을 쓸 수 있다는 뜻이지 꼭 다른 언어를 써야 하는 것은 아니다.
</details>

<details><summary>Q. 독립 실행·독립 배포·독립 확장은 각각 무엇인가?</summary>

독립 실행: 서비스를 각각 실행·종료할 수 있다 (학생 서비스만 종료 가능). 독립 배포: 한 서비스만 고쳤을 때 그 서비스만 배포한다. 독립 확장: 요청이 몰리는 서비스(예: 공지)의 인스턴스만 늘린다.
</details>

<details><summary>Q. 학생 서비스만 꺼도 공지 서비스는 계속 실행된다. 그럼 모든 기능이 정상인가?</summary>

아니다. 공지 서비스가 학생 서비스에 기대는 기능(작성자 이름 표시, 등록 전 작성자 확인)은 영향을 받는다. 프로그램이 실행 중인 것과 모든 기능이 정상인 것은 다르다.
</details>

<details><summary>Q. 학생 API 응답의 `name`을 `studentName`으로 바꿔 학생 서비스만 배포했다. 무슨 일이 생기는가?</summary>

공지 서비스가 `name`을 읽고 있었다면 값을 못 읽는다 (JavaScript에서는 `undefined`). 공지 서비스도 고쳐야 한다. API 계약을 깨는 변경은 독립 배포를 막으므로 **호환성을 고려한 API 변경**이 중요하다.
</details>

<details><summary>Q. 메모리 배열을 쓰는 공지 서비스를 인스턴스 3개로 띄우면 곧바로 운영용 확장이 되는가?</summary>

아니다. 인스턴스마다 배열이 따로 있어서 데이터가 달라질 수 있다. 실제 운영에서는 요청 분산과 데이터 공유 같은 추가 구성이 필요하다.
</details>

<details><summary>Q. 서비스를 나누면 무엇이 어려워지는가? (다섯 가지)</summary>

① 네트워크 통신 실패 (상대 종료, 주소·포트 오류, 연결 끊김, 느린 응답, 예상과 다른 데이터) ② 다른 서비스의 지연이 내 응답도 늦춤 → 타임아웃 필요 ③ 장애 전파 ④ 로그와 실행 환경이 나뉘어 실패 위치 찾기가 어려움 ⑤ 여러 서비스·저장소에 걸친 변경을 하나의 트랜잭션처럼 처리할 수 없음.
</details>

<details><summary>Q. 서비스를 나누면 장애가 자동으로 격리되는가?</summary>

아니다. 학생 서비스가 실패했는데 공지 서비스가 그 실패를 처리하지 않으면 공지 조회까지 실패한다. 실패 처리 규칙과 타임아웃을 직접 만들어야 한다.
</details>

<details><summary>Q. 공지에는 왜 작성자 이름 대신 `authorId`를 저장하는가? 공지 서비스가 학생 DB를 직접 고치면 안 되는 이유는?</summary>

학생 이름은 **학생 서비스가 소유·책임**지는 데이터다. 공지는 번호만 갖고, 이름이 필요하면 학생 API를 요청한다. 공지 서비스가 학생 DB를 직접 고치면 학생 서비스의 내부 테이블 구조와 규칙에 강하게 묶인다. 데이터를 소유한 서비스가 정해진 API로 제공하게 한다.
</details>

<details><summary>Q. `authorId`가 있으면 DB 외래키처럼 없는 학생 번호를 막아 주는가?</summary>

아니다. 별도 서비스의 저장소 사이에는 하나의 DB 외래키가 생기지 않는다. 없는 작성자를 막으려면 공지 서비스가 등록 전에 학생 API로 직접 확인해야 한다.
</details>

<details><summary>Q. 이번 실습 구조에서 React는 Spring 학생 서비스를 직접 호출하는가?</summary>

아니다. React(:5173)는 `/api` 요청을 Vite 프록시로 Express(:3000)에 보내고, Express가 필요한 학생 정보를 Spring(:8081)에 요청해 합친다. MSA라는 이유로 React가 모든 백엔드를 직접 부를 필요는 없다.
</details>

<details><summary>Q. (활동 A) 사용자가 공지 1번을 선택했을 때의 요청 흐름을 순서대로 말해 보자.</summary>

React → Express에 공지 요청 → Express가 공지의 `authorId` 확인 → Express → Spring에 학생 정보 요청 → Spring이 학생 정보 응답 → Express가 공지와 작성자 이름(`authorName`)을 합쳐 응답 → React가 표시.
</details>

<details><summary>Q. (활동 B·C) 학생 서비스가 꺼졌을 때 공지 조회와 공지 등록은 각각 어떻게 처리하는가? 왜 다른가?</summary>

조회: 공지 내용은 표시하고 작성자는 "정보 확인 불가"로 표시한다. 등록: 작성자 존재 확인이 필수라서 등록하지 않고 재시도를 안내한다. 이번 실습의 **업무 규칙**이 다르기 때문이다. 같은 장애라도 업무 규칙에 따라 처리 방식이 달라질 수 있다.
</details>

<details><summary>Q. MSA를 항상 선택해야 하는가? 어떤 상황에서 모놀리식부터 시작할 수 있는가?</summary>

아니다. 작은 팀이 단순한 서비스를 빠르게 만들 때는 모놀리식부터 시작할 수 있다. 여러 팀이 기능을 독립적으로 운영하거나 특정 업무만 따로 배포·확장해야 할 때 MSA를 검토한다. 경계가 불명확하면 업무·데이터 구조부터 정리하고, 통신·배포·장애 관리 역량이 부족하면 늘어나는 비용을 신중히 평가한다. 서비스 개수보다 책임과 경계가 중요하다.
</details>

<details><summary>Q. 프로젝트를 여러 개 만들고 포트를 다르게 띄우면 MSA가 완성되는가?</summary>

아니다. 서비스를 여러 개 만들어도 서로의 내부 구현에 강하게 의존하면 독립적으로 운영하기 어렵다. 명확한 책임·경계·데이터 소유권, API 계약, 실패 처리까지 갖춰야 한다. 이번 과정은 기본 원리를 경험하는 축소 실습이다.
</details>

## 완료 체크
- [ ] 모놀리식이 코드 한 파일을 의미하지 않는다는 점을 이해했다.
- [ ] 패키지 분리와 서비스 분리의 차이를 설명할 수 있다.
- [ ] 서로 다른 언어의 서비스가 HTTP와 JSON으로 통신하는 이유를 이해했다.
- [ ] 독립 실행·배포·확장의 의미를 구분했다.
- [ ] 서비스 분리로 네트워크 실패와 지연 처리가 추가됨을 이해했다.
- [ ] 학생 데이터와 공지 데이터의 소유권을 구분했다.
- [ ] 공지 조회의 전체 요청 흐름을 설명할 수 있다.
- [ ] 조회와 등록의 실패 처리 규칙이 다른 이유를 이해했다.
- [ ] 프로젝트를 여러 개 만드는 것만으로 MSA가 완성되지 않는다는 점을 이해했다.

## 질문 노트

_아직 없음_
