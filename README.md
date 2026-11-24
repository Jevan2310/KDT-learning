# KDT-learning

KDT 수업 복습 및 학습용 저장소.
수업 내용을 정리하고(**wiki**), 정리한 내용으로 연습하고(**practice**), 실력을 점검한다(**실력점검.md**).

## 구조

```
├── 강의목록.md      전체 강의 색인 (강의 순서 = 연습 순서)
├── 실력점검.md      항목별 수준(0~4), 복습 대기열, 점검 이력
├── wiki/            강의 정리본
│   ├── _풀스택과정소개.md  과정 구조·수업 방식·과정 흐름·만들 수 있는 결과물
│   ├── 00_개발환경/  VS Code·Node.js, IntelliJ·JDK·단축키, git, GitHub·블로그 기록, MySQL·DBeaver
│   ├── 01_React과정/ HTML → CSS → JavaScript → React
│   ├── 02_Node과정/  백엔드·Node.js → Express 서버 → React와 연결
│   ├── 03_Spring과정/ Java 기초 → Spring Boot → Thymeleaf → 폼 → H2·JPA 저장 → JSON API·React 연결
│   ├── 04_SEO과정/    검색엔진 이해 → 검색 친화 페이지 → 사이트 등록 → 사이트맵
│   ├── 05_비동기과정/  실행 순서 → Promise·async/await → 블로킹·논블로킹 → 느린 API 화면
│   ├── 06_데이터베이스과정/ SQL 기초 → 조회 → 수정·삭제·트랜잭션 → JOIN → Spring + MyBatis
│   ├── 07_Git협업과정/ 버전 관리 → 3가지 영역 → 원격 저장소 → 브랜치 → 충돌 → Organization·PR
│   └── 08_SSR-CSR과정/ SSR·CSR 배경 → JSP로 SSR → 요청 흐름 확인 → React로 CSR
├── practice/        연습 기록 (과정/회차/날짜별 답안·코드·채점)
└── scripts/         노션 강의 페이지를 받아오는 스크립트
```

## 공부하는 방법

1. **개념 정리** — 오늘 범위의 개념을 먼저 짚는다
2. **문제 풀기** — `practice/`에 답안과 코드를 직접 작성한다
3. **채점** — 틀린 문제는 힌트를 받고 다시 고친다
4. **기록** — 채점 결과를 남기고 `실력점검.md`를 갱신한다
5. **복습** — 수준에 따라 3·7·21일 뒤 다시 출제하고, 주 1회 지난 회차 전체를 종합 복습한다

수업 내용을 질문하고 답을 들은 것은 각 강의 wiki 파일 끝의 **질문 노트**에 쌓는다.

## 과정

| 과정 | 내용 | 정리 |
|---|---|---|
| 01. React 과정 | 직접 사용하는 첫 웹 앱 만들기 (HTML · CSS · JavaScript · React) | 01~08회차 |
| 02. Node 과정 | 백엔드 이해하고 React와 연결하기 (Node.js · Express · fetch) | 01~04회차 |
| 03. Spring 과정 | Java Spring 학생 목록 API 만들기 (Java · Spring Boot · Thymeleaf · H2·JPA) | 000·01~06회차 |
| 04. SEO 과정 | 내가 만든 서비스를 검색에 알리기 (title·meta · robots.txt · sitemap · Search Console) | 01~04회차 |
| 05. 비동기 과정 | 동기·비동기와 블로킹·논블로킹 (setTimeout · Promise · async/await · 느린 API 화면) | 01~04회차 |
| 06. 데이터베이스 과정 | SQL부터 Spring 연동까지 (MySQL · DBeaver · JOIN · 트랜잭션 · MyBatis) | 01~06회차 |
| 07. Git 협업 과정 | Git 활용 협업 (add·commit · push·pull·clone · 브랜치 · 충돌 해결 · Fork·PR) | 01~06회차 |
| 08. SSR·CSR 과정 | 같은 화면, 다른 처리 방식 (JSP · 개발자 도구 Network · React CSR · Thymeleaf) | 01~04회차 (05·06 공개 전) |

## 출처

- 강의 자료: KDT 수업 노션 페이지 (링크는 `강의목록.md`). wiki는 개인 복습을 위해 정리한 것이다.
- 정리·연습·채점은 [Claude Code](https://claude.com/claude-code)와 함께 진행한다. 작업 규칙은 `CLAUDE.md`에 있다.
