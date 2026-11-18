# 개발환경 — MySQL + DBeaver

> 과정: 개발환경 (데이터베이스과정 01회차) · [노션 원문](https://app.notion.com/p/41a848f71c9b80a6bff5f6855a50d876) · 최종 갱신일: 2026-11-18

## 한눈에 보기
- 데이터베이스 수업은 **MySQL Community Server 8.4 LTS**(데이터를 저장하고 SQL을 처리하는 DBMS)에 **DBeaver Community**(접속해서 SQL을 쓰고 결과를 보는 도구)로 접속해서 진행한다. 나중에는 Spring도 같은 MySQL에 접속한다.
- 강의는 **Windows 기준**이다: MSI 설치 파일로 설치 → **MySQL Configurator**에서 포트 `3306`, `root` 비밀번호, Windows 서비스 설정.
- DBeaver에서 `localhost` · `3306` · `root`로 **연결 테스트**에 성공하고, `SELECT VERSION(), CURRENT_USER();` 결과가 나오면 준비 완료.
- 개념(DB·DBMS·SQL, 호스트·포트의 의미)은 [01_DB이해-실습환경](../06_데이터베이스과정/01_DB이해-실습환경.md)에 정리했다.

## 도구별 역할

| 구분 | 역할 |
|---|---|
| MySQL Community Server | 데이터를 저장하고 SQL을 처리하는 DBMS (서버 프로그램) |
| MySQL Configurator | 설치 후 서버 설정(포트, `root` 비밀번호, Windows 서비스)을 하는 프로그램 |
| DBeaver Community | MySQL에 접속해 SQL을 작성하고 결과를 확인하는 도구 |
| 드라이버 | DBeaver가 MySQL과 통신하게 해 주는 연결용 라이브러리 (처음 연결할 때 받는다) |

```text
DBeaver ──→ MySQL ←── Spring
```

- **DBeaver를 설치했다고 MySQL까지 설치되는 것은 아니다.** 둘 다 설치한다.
- DBeaver를 꺼도 MySQL 서버가 실행 중이면 다른 프로그램(Spring 등)은 계속 접속할 수 있다.

## 설치·확인 절차

### 1. MySQL 설치 파일 받기
[MySQL Community Server 다운로드](https://dev.mysql.com/downloads/mysql/8.4.html?os=3)

| 항목 | 선택 기준 |
|---|---|
| 버전 | 8.4 LTS 계열 |
| 운영체제 | Microsoft Windows |
| 설치 파일 | Windows 64비트 **MSI Installer** |

강의 화면: **General Availability (GA) Releases** 탭 → *MySQL Community Server 8.4.x LTS* → Select Operating System = **Microsoft Windows** → 목록 맨 위 **Windows (x86, 64-bit), MSI Installer** (`mysql-8.4.x-winx64.msi`, 약 130MB)의 **Download**. 아래의 ZIP Archive 두 개는 고르지 않는다.

- 로그인 안내가 나오면 **"No thanks, just start my download."** 링크로 받는다.
- 별도의 **"MySQL Installer"** 다운로드 페이지와 헷갈리지 않는다. 이 수업은 **MySQL Community Server 8.4의 MSI 설치 파일** 기준이다.

### 2. 설치 파일 실행
- 받은 MSI 파일을 실행한다. 설치 경로는 기본값을 써도 된다.
- 필수 구성 요소 설치 안내가 나오면 안내대로 설치한 뒤 진행한다.
- 설치가 끝나면 **MySQL Configurator**에서 서버 설정을 한다. ([공식 Windows 설치 안내](https://dev.mysql.com/doc/refman/8.4/en/windows-installation.html))

### 3. MySQL Configurator 설정
**① 서버 종류와 접속 포트**
- 개발용 PC에 맞는 **Development Computer** 항목이 있으면 선택한다.

| 항목 | 실습 설정 |
|---|---|
| TCP/IP | 사용 |
| Port | `3306` (MySQL 기본 포트) |
| 외부 접속을 위한 방화벽 포트 개방 | 로컬 실습에서는 필요 없음 |

- 이미 다른 MySQL이 `3306`을 쓰고 있으면 새로 설치하기 전에 기존 설치 상태를 확인한다. 포트를 바꿨다면 DBeaver에서도 같은 번호를 쓴다.

**② `root` 비밀번호**
- `root`는 MySQL의 **관리자 계정**이다. 기억할 수 있는 비밀번호를 정한다.

```text
사용자 이름: root
비밀번호: <비밀번호>
```

- **MySQL 계정은 Windows 로그인 계정이나 MySQL 웹사이트 계정과 별개다.**
- 이번 로컬 확인은 `root`로 하지만, 실제 서비스 연결에는 필요한 권한만 준 **별도 계정**을 쓰는 것이 좋다.

**③ Windows 서비스**
- MySQL을 **Windows 서비스**로 실행하도록 설정한다. 서비스 이름은 `MySQL84`처럼 보일 수 있다 (실제 화면의 이름을 확인).
- **자동 시작**을 고르면 컴퓨터를 켤 때 MySQL 서버가 실행된다.

**④ 적용**
- **Apply Configuration → Execute** 등을 눌러 설정을 적용하고, 모든 단계가 정상 완료됐는지 확인한다. ([MySQL Configurator 안내](https://dev.mysql.com/doc/refman/8.4/en/mysql-configurator.html))

### 4. DBeaver 설치
- [DBeaver Community 다운로드](https://dbeaver.io/download/)에서 Windows용 설치 파일을 받는다. **Community Edition**을 쓴다.
- 설치 프로그램 안내대로 설치하고 실행한다. 샘플 데이터베이스 생성 안내가 나오면 **건너뛰어도 된다.**

### 5. DBeaver에서 MySQL 연결
1. 상단 메뉴 **데이터베이스 → 새 데이터베이스 연결**
2. DB 종류에서 **MySQL** 선택
3. 접속 정보 입력

| 항목 | 입력할 값 |
|---|---|
| Host | `localhost` |
| Port | `3306` 또는 설치 때 정한 번호 |
| Database | 우선 비워 두기 |
| Username | `root` |
| Password | 설치할 때 정한 비밀번호 (`<비밀번호>`) |

4. **Test Connection / 연결 테스트** 클릭 → 처음이면 **드라이버 다운로드** 안내가 나온다. 다운로드한다.
5. 연결 성공 메시지를 확인하고 연결 설정을 **저장**한다. ([DBeaver 연결 생성 안내](https://dbeaver.com/docs/dbeaver/Create-Connection/))

### 6. 첫 SQL 실행으로 확인
1. 왼쪽 연결 목록에서 방금 만든 MySQL 연결 → 마우스 오른쪽 → **SQL 편집기 → 새 SQL 스크립트**
2. 아래 SQL을 쓰고 문장을 선택한 뒤 **SQL 문 실행** 버튼이나 `Ctrl + Enter`

```sql
SELECT VERSION(), CURRENT_USER();
```

3. 결과 영역에 **MySQL 버전과 현재 계정**이 나오면 SQL 요청과 응답이 정상이다. (테이블이 없어도 실행된다.)

> 💡 보충: **macOS에서 설치할 때** — 같은 다운로드 페이지에서 Select Operating System을 **macOS**로 바꾸고 칩에 맞는 **DMG Archive**(Apple Silicon = ARM 64-bit, Intel = x86 64-bit)를 받는다. 설치 중에 `root` 비밀번호를 정하고, 서버 시작·중지와 자동 시작은 **시스템 설정 맨 아래의 MySQL 항목**에서 한다 (Windows의 서비스 설정 대신). DBeaver도 macOS용 DMG를 받는다. DBeaver 단축키는 `Ctrl` 대신 **`Cmd`** 다 (문장 실행 `Cmd + Enter`).

## 자주 쓰는 명령

| 하고 싶은 것 | 명령·조작 |
|---|---|
| 버전·현재 계정 확인 | `SELECT VERSION(), CURRENT_USER();` |
| 데이터베이스 목록 | `SHOW DATABASES;` |
| 사용할 DB 선택 | `USE school;` |
| 지금 선택된 DB 확인 | `SELECT DATABASE();` |
| 테이블 목록 | `SHOW TABLES;` |
| 테이블 구조 | `DESCRIBE students;` |
| SQL 편집기 열기 | 연결에서 마우스 오른쪽 → **SQL 편집기 → 새 SQL 스크립트** |
| 선택한 문장 실행 | **SQL 문 실행** 버튼 또는 `Ctrl + Enter` (macOS `Cmd + Enter`) |
| 왼쪽 목록에 새 DB·테이블이 안 보일 때 | 연결이나 데이터베이스 목록에서 **새로고침** |

## 문제 생겼을 때
설치·접속 오류는 SQL 문법 오류와 **구분해서** 확인한다.

| 증상 | 먼저 확인할 내용 |
|---|---|
| `Connection refused`, 연결 실패 | MySQL 서비스가 실행 중인지, 호스트·포트가 맞는지 |
| `Access denied for user` | 사용자 이름, 비밀번호, 계정 권한 |
| `Unknown database 'school'` | DB를 만들었는지, 연결한 서버가 맞는지 |
| `No database selected` | `USE school;`을 실행했는지 |
| 드라이버 다운로드 실패 | 인터넷 연결과 다운로드 오류 내용 |
| SQL을 실행했는데 목록에 안 보임 | 왼쪽 목록 새로고침, 실제로 실행한 연결 확인 |

**MySQL 서비스 실행 상태 확인 (Windows)** — 시작 메뉴에서 **서비스**를 검색하고, 설치 때 정한 MySQL 서비스 이름(예: `MySQL84`)의 상태를 본다.

```text
MySQL 서비스 실행
        ↓
DBeaver 연결 테스트
        ↓
SQL 실행
```

- 서버가 실행되지 않았으면 **비밀번호가 맞아도 접속할 수 없다.**
- 오류가 나면 무조건 재설치하기보다 **오류 메시지와 연결 정보를 먼저 확인**한다.
- DBeaver 버전에 따라 데이터베이스가 `Schemas` 또는 데이터베이스 항목 아래에 보일 수 있다.

## 완료 체크
- [ ] MySQL 서버를 설치하고 실행했다.
- [ ] DBeaver를 설치했다.
- [ ] DBeaver에서 MySQL 연결 테스트에 성공했다.
- [ ] SQL 편집기에서 `SELECT VERSION(), CURRENT_USER();`를 실행했다.

## 질문 노트

_아직 없음_
