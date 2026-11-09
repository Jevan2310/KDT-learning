# 개발환경 — IntelliJ IDEA + JDK

> 과정: 개발환경 (Java·Spring 수업 준비) · [노션 원문](https://app.notion.com/p/InteliJ-IDEA-408848f71c9b805ea2b6e5b3fe0a4103) · 최종 갱신일: 2026-11-09

## 한눈에 보기
- Java·Spring 수업에서는 **IntelliJ IDEA**로 코드 작성·실행·오류 확인·디버깅을 한곳에서 한다.
- IntelliJ(개발 도구)와 **JDK**(Java 컴파일·실행 도구 모음)는 역할이 다르다. 프로젝트마다 쓸 JDK를 따로 지정한다.
- `hello-java` 프로젝트를 만들고 `Main.java`를 실행해 출력이 나오면 준비 완료.

## 도구별 역할

| 구분 | 역할 |
|---|---|
| IntelliJ IDEA | 코드를 작성하고 실행·디버깅하는 개발 도구 |
| JDK | Java 코드를 컴파일하고 실행하는 데 필요한 개발 도구 모음 |

- IntelliJ 자체를 실행하는 환경은 프로그램에 포함되어 있다. 하지만 Java 프로젝트를 개발하려면 **프로젝트에 사용할 JDK를 따로 설정**해야 한다.
- JDK 버전은 강사가 안내하는 수업용 버전에 맞춘다. **이미 설치된 JDK는 임의로 삭제하지 않는다.**
- Java·Kotlin 핵심 개발 기능은 무료로 쓸 수 있다. 유료 구독·체험은 필수가 아니다.

## 설치·확인 절차

### 1. 설치 파일 받기
[IntelliJ IDEA 공식 다운로드 페이지](https://www.jetbrains.com/idea/download/)에서 운영체제에 맞는 파일을 받는다.

| 운영체제 | 선택할 설치 파일 |
|---|---|
| Windows | Windows용 |
| Mac — Apple Silicon | Apple Silicon용 |
| Mac — Intel | Intel용 |

- Mac 칩 확인: 화면 왼쪽 위 Apple 메뉴 → **이 Mac에 관하여** → 칩(또는 프로세서).
- 이미 설치되어 있으면 다시 설치하지 말고 버전부터 확인한다.

### 2. 설치하기

**Windows**
1. 받은 설치 파일 실행
2. 설치 경로·설치 옵션은 기본값 유지 (바탕화면 바로가기는 필요하면 선택)
3. 설치가 끝나면 IntelliJ IDEA 실행

**macOS**
1. 받은 `.dmg` 파일 열기
2. IntelliJ IDEA 아이콘을 **Applications** 폴더로 옮기기
3. 응용 프로그램에서 IntelliJ IDEA 실행

### 3. 첫 실행 설정
- 기존 설정 가져오기: 처음 쓰는 사람은 가져오지 않고 진행
- 테마: 편한 것으로 선택
- 추가 플러그인: 지금은 설치하지 않아도 됨

### 4. Java 프로젝트 만들고 실행하기
1. 시작 화면에서 **New Project**
2. 언어: **Java**
3. 프로젝트 이름: `hello-java`
4. 빌드 시스템: **IntelliJ**
5. **JDK**: 수업용 JDK 선택. 없으면 **Download JDK**에서 강사가 안내한 버전을 받는다
6. 프로젝트 생성

생성된 예제 코드를 아래 코드로 바꾼다. 파일 이름은 `Main.java`.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("안녕하세요! Java 개발 준비 완료!");
    }
}
```

코드 왼쪽의 **▶ 실행 버튼**을 누른다. 실행 결과 창에 아래 문장이 나오면 성공이다.

```text
안녕하세요! Java 개발 준비 완료!
```

마지막으로 출력 문장을 바꿔서 다시 실행해 본다.

## 자주 쓰는 조작

| 하고 싶은 것 | 하는 법 |
|---|---|
| 새 프로젝트 만들기 | 시작 화면 → **New Project** |
| 프로젝트 JDK 고르기 | New Project 화면의 **JDK** 항목 |
| 수업용 JDK 내려받기 | JDK 항목 → **Download JDK** |
| 코드 실행 | 코드 왼쪽 **▶ 실행 버튼** |

> 💡 보충: 이미 만든 프로젝트의 JDK를 바꾸려면 **File → Project Structure → Project → SDK**에서 고른다. 터미널에서 JDK 설치 여부를 보려면 `java -version`을 입력한다.

## 문제 생겼을 때
- 다운로드나 프로젝트 준비 작업이 아직 진행 중일 수 있다. 오류가 나면 **설정을 여러 번 바꾸기 전에** 함께 확인한다.
- 도움을 요청할 때 알려줄 것: Windows/macOS 여부, 막힌 단계, 오류 메시지 또는 화면 캡처.

> 💡 보충: 프로젝트를 처음 열면 오른쪽 아래에 인덱싱·다운로드 진행 표시줄이 돈다. 이게 끝나기 전에는 ▶ 버튼이 안 보이거나 빨간 줄이 생길 수 있으니 끝날 때까지 기다린다.

## 완료 체크
- [ ] IntelliJ IDEA를 설치하고 실행했다.
- [ ] Java 프로젝트를 만들었다.
- [ ] 수업용 JDK를 설정했다.
- [ ] 예제 코드를 실행했다.
- [ ] 출력 문장을 수정하고 다시 실행했다.

## 질문 노트

_아직 없음_
