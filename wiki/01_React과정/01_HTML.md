# 01. HTML — 웹페이지의 내용과 구조 만들기

> 과정: React과정 · [노션 원문](https://app.notion.com/p/01-HTML-40a848f71c9b801a8928e7408727b7a7) · 최종 갱신일: 2026-11-09

## 한눈에 보기
- 웹페이지는 **HTML(내용·구조) + CSS(모양·배치) + JavaScript(동작)**로 만든다. HTML만으로도 페이지는 된다.
- HTML은 **태그**로 내용의 역할(제목·문단·목록 등)을 표시하고, **속성**으로 주소·파일 위치 같은 추가 정보를 준다.
- 요소 안에 요소를 **중첩**해 문서 구조를 만든다. **블록**(새 줄, 가로 전체)과 **인라인**(문장 안, 내용만큼)은 기본 배치가 다르다.
- 태그는 모양이 아니라 **목적·의미에 맞게** 고른다 (`a`/`button`, `header`/`main`/`section`/`footer` 같은 시맨틱 태그).
- 실습: `my-profile/index.html`로 자기소개 페이지를 만들었다.

## 학습 목표
- 화면의 내용이 어떤 HTML 코드와 연결되는지 찾는다.
- 내용에 맞는 태그를 선택한다.
- 기존 코드를 수정하고 브라우저에서 확인한다.

## 핵심 개념

### 1. 웹페이지를 만드는 세 가지 기술

| 기술 | 역할 | 예시 |
|---|---|---|
| **HTML** | 내용의 의미와 구조 | 제목, 설명, 이미지, 입력창 |
| **CSS** | 모양과 배치 | 색상, 글꼴, 간격 |
| **JavaScript** | 동작과 데이터 처리 | 클릭하면 내용 변경 |
| **React.js** (JavaScript) | 위 세 개를 합친 최신 기술 | |

먼저 HTML로 내용을 구성하고, 다음 회차 [02_CSS](02_CSS.md)에서 모양을 바꾼다.

### 2. HTML, 태그와 요소
HTML(Hyper Text Markup Language)은 **태그를 사용해 웹 문서의 내용과 구조를 표현하는 마크업 언어**다. 브라우저는 태그를 해석해 내용을 화면에 표시한다.

```html
<h1>한코딩의 자기소개</h1>
<p>직접 사용하는 서비스를 만들고 싶습니다.</p>
```
- `h1`: 대표 제목 / `p`: 문단

```html
<p>안녕하세요!</p>
```

| 구성 | 의미 |
|---|---|
| `<p>` | 시작 태그 |
| `안녕하세요!` | 내용 |
| `</p>` | 종료 태그 |
| 전체 | 하나의 **요소** |

- 대부분의 요소는 시작·종료 태그가 한 쌍이다.
- `img`, `input`처럼 **종료 태그를 쓰지 않는 요소**도 있다.

### 3. HTML 문서 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>나의 자기소개</title>
</head>
<body>
  <h1>안녕하세요, 한코딩입니다!</h1>
  <p>직접 사용하는 서비스를 만들고 싶습니다.</p>
</body>
</html>
```

| 코드 | 역할 |
|---|---|
| `<!DOCTYPE html>` | 현대 HTML 문서임을 알리는 선언 |
| `<html>` | 문서 전체를 감싸는 요소 |
| `lang="ko"` | 문서의 기본 언어가 한국어임을 표시 |
| `<head>` | 문서 설정과 메타데이터 (화면에 직접 안 보임) |
| `<meta charset="UTF-8">` | 한글 등을 표현할 문자 인코딩 설정 |
| `<meta name="viewport" ...>` | 모바일 화면 크기에 맞춰 표시하기 위한 기본 설정 |
| `<title>` | **브라우저 탭의 제목** |
| `<body>` | **화면에 표시할 내용** |

- 기본 구조는 제공된 코드를 그대로 써도 된다. 지금은 **`title`(탭 제목)과 `body`(화면 내용)의 차이**를 먼저 기억한다.

### 4. 제목·문단·목록

**제목 `h1`~`h6`**: 중요도와 계층에 따라 구분한다.
```html
<h1>한코딩의 자기소개</h1>
<h2>나에 대해</h2>
<h3>요즘 관심사</h3>
```
- 숫자는 글자 크기를 고르는 기준이 아니다. 이 페이지에서는 대표 제목 `h1`, 그 아래 각 주제 `h2`. 글자 크기는 나중에 CSS로 조절한다.

**문단 `p`**
```html
<p>안녕하세요. 개발을 공부하는 한코딩입니다.</p>
<p>취미는 산책과 음악 감상입니다.</p>
```
- 문단을 나누려면 `p` 요소를 추가한다. 편집기에서 Enter를 친다고 브라우저에도 줄바꿈이 생기지 않는다.

**목록 `ul`, `ol`, `li`**

| 태그 | 뜻 |
|---|---|
| `ul` | 순서가 중요하지 않은 목록 |
| `ol` | 순서가 있는 목록 |
| `li` | 목록의 각 항목 |

```html
<ul>
  <li>산책</li>
  <li>음악 감상</li>
</ul>
```
```html
<ol>
  <li>코드를 수정합니다.</li>
  <li>파일을 저장합니다.</li>
  <li>브라우저에서 확인합니다.</li>
</ol>
```

### 5. 요소의 중첩과 주석
- `ul` 안에 `li`가 들어가듯, 요소 안에 다른 요소가 들어갈 수 있다(중첩).
- 들여쓰기는 포함 관계를 읽기 쉽게 해 준다.
- 태그를 닫을 때는 **안쪽에서 연 요소부터** 닫는다.
- `<!-- -->`는 **주석**. 코드에 설명을 남기고, 화면에는 표시되지 않는다.

```html
<!-- 올바른 중첩 -->
<div>
  <p>소개 문장입니다.</p>
</div>
```

### 6. 속성 — 링크 `a`, 이미지 `img`
속성은 요소에 필요한 정보를 주며, **시작 태그 안에** 쓴다.

```html
<a href="https://github.com/">GitHub 방문하기</a>
```

| 부분 | 역할 |
|---|---|
| `a` | 링크를 나타내는 태그 |
| `href` | 이동할 주소를 지정하는 속성 |
| `"https://github.com/"` | 속성값 |
| `GitHub 방문하기` | 화면에 표시할 링크 문구 |

- 링크 문구는 "여기 클릭"보다 **이동할 곳을 알 수 있게** 쓴다.

```html
<img src="profile.png" alt="산책 중 촬영한 풍경">
```

| 속성 | 역할 |
|---|---|
| `src` | 이미지 파일의 위치 |
| `alt` | 이미지의 의미를 전달하는 대체 텍스트 |
| `width` | 이미지 너비 (이후에는 CSS로 조절) |

- `img`는 종료 태그를 쓰지 않는다.
- 의미 있는 이미지는 내용을 설명하는 `alt`를, 단순 장식용이면 `alt=""`를 쓴다.

### 7. 블록과 인라인 — 기본 배치의 차이

| 방식 | 배치 | 대표 요소 |
|---|---|---|
| **블록** | 새 줄에 놓이고, 쓸 수 있는 가로 공간을 채운다 | `div`, `p`, `h1`, `ul` |
| **인라인** | 문장 흐름 안에 놓이고, 내용에 필요한 만큼만 차지한다 | `span`, `a`, `strong` |

```html
<div>첫 번째 영역</div>
<div>두 번째 영역</div>
```
```html
<span>첫 번째 문구</span>
<span>두 번째 문구</span>
```

- 블록·인라인은 **기본 표시 방식**일 뿐이다. CSS의 `display`로 바꿀 수 있다.
- 표시 방식을 바꿔도 HTML 태그의 **의미나 중첩 규칙은 바뀌지 않는다**.

**`div`와 `span`**

| 요소 | 쓰임 |
|---|---|
| `div` | 특별한 의미 없이 여러 내용을 묶는 범용 요소 (블록) |
| `span` | 문장 안의 일부를 묶는 범용 요소 (인라인) |

```html
<div>
  <h2>나에 대해</h2>
  <p>저는 <span>웹 개발</span>에 관심이 있습니다.</p>
</div>
```
- 지금은 눈에 띄는 차이가 없을 수 있다. CSS 수업에서 묶은 영역·문구에 스타일을 적용한다.

### 8. 의미에 맞는 태그 고르기 (시맨틱 태그)
화면에 표시할 수 있다고 모두 `div`로 만들지 않는다.

| 목적 | 사용할 태그 |
|---|---|
| 다른 페이지나 위치로 이동 | `a` |
| 클릭해서 특정 동작 실행 | `button` |
| 사용자 입력 받기 | `input` |
| 입력 항목의 이름 표시 | `label` |
| 입력 내용을 하나의 제출 단위로 묶기 | `form` |

페이지의 영역에도 의미를 줄 수 있다. 이렇게 의미를 표현하는 태그를 **시맨틱 태그**라고 한다.

| 태그 | 대표적인 용도 |
|---|---|
| `header` | 소개나 탐색을 위한 머리 영역 |
| `nav` | 주요 탐색 링크 |
| `main` | 페이지의 주요 내용 |
| `section` | 주제별로 묶은 영역 |
| `footer` | 작성자·관련 정보 등의 마무리 영역 |

이번 실습에서는 `header`, `main`(+`section`), `footer`를 쓴다.

```html
<header>
  <h1>한코딩의 자기소개</h1>
</header>

<main>
  <section>
    <h2>나에 대해</h2>
    <p>직접 사용하는 서비스를 만들고 싶습니다.</p>
  </section>
</main>

<footer>
  <p>한코딩의 학습 기록</p>
</footer>
```
- 의미에 맞게 쓰면 사람과 보조 기술(화면 낭독기 등)이 문서 구조를 이해하기 쉽다.
- 입력창과 버튼은 이후 JavaScript·React 실습에서 직접 쓴다.

## 실습 정리

**만든 것**: `my-profile` 폴더의 `index.html` 자기소개 페이지 (편집기 사용법은 [VSCode-Node](../00_개발환경/VSCode-Node.md))

### 1단계: 첫 HTML 파일 만들고 브라우저로 열기
1. VS Code에서 `my-profile` 폴더를 만들고, 그 안에 `index.html`을 만든다.
2. [핵심 개념 3](#3-html-문서-기본-구조)의 기본 구조 코드를 붙여 넣고 저장한다.
3. `index.html` 우클릭 → **Reveal in File Explorer** → 탐색기에서 `index.html`을 더블클릭하면 브라우저에서 열린다.
4. 브라우저 **탭 제목**(`title`: 나의 자기소개)과 **화면 제목**(`h1`)을 확인한다.
5. 코드를 고친 뒤에는 **저장 → 브라우저 새로고침**으로 확인한다.

> 💡 보충: Mac에서는 우클릭 메뉴 이름이 **Reveal in Finder**다. Finder에서 `index.html`을 더블클릭하면 기본 브라우저로 열린다.

### 2단계: 제목·문단·목록으로 확장

```html
<body>
  <h1>안녕하세요, 한코딩입니다!</h1>

  <h2>나에 대해</h2>
  <p>직접 사용하는 서비스를 만들고 싶습니다.</p>

  <h2>이번 과정의 목표</h2>
  <ul>
    <li>웹페이지의 구조 이해하기</li>
    <li>나에게 필요한 기능 만들기</li>
    <li>다른 사람에게 서비스 보여주기</li>
  </ul>
</body>
```

### 3단계: 이미지와 링크 추가
강사가 준 `profile.png`를 `index.html`과 **같은 폴더**에 넣는다.

```text
my-profile (여러분들의 폴더명)
├─ index.html
└─ profile.png
```

`<body>` 안에 추가한다.
```html
<img
  src="profile.png"
  alt="나의 관심사를 표현하는 이미지"
  width="200"
>

<p>
  <a href="https://github.com/">GitHub 방문하기</a>
</p>
```

**이미지가 안 보이면**: ① 파일 이름과 확장자 ② HTML 파일과 같은 폴더인지 ③ `src` 오타 확인.

### 4단계: 블록·인라인 비교
페이지 아래에 넣고 결과를 비교한다. `div`는 한 줄씩 따로, `span`은 한 줄에 나란히 나온다.
```html
<div>블록 A</div>
<div>블록 B</div>

<span>인라인 A</span>
<span>인라인 B</span>
```

### 5단계: 종합 실습 — 자기소개 페이지 완성 (최종 코드)
기존 `<body>`를 `header` / `main`(`section` 3개) / `footer` 구조로 정리한다. `<head>`는 1단계 그대로.

```html
<body>
  <header>
    <h1>안녕하세요, 한코딩입니다!</h1>
    <p>직접 사용하는 서비스를 만들고 싶습니다.</p>
  </header>

  <main>
    <section>
      <h2>나에 대해</h2>

      <img
        src="profile.png"
        alt="나의 관심사를 표현하는 이미지"
        width="200"
      >

      <p>저는 웹 개발을 공부하고 있습니다.</p>
      <p>취미는 산책과 음악 감상입니다.</p>
    </section>

    <section>
      <h2>이번 과정의 목표</h2>

      <ul>
        <li>웹페이지의 구조 이해하기</li>
        <li>나에게 필요한 기능 만들기</li>
        <li>다른 사람에게 서비스 보여주기</li>
      </ul>
    </section>

    <section>
      <h2>나의 링크</h2>

      <p>
        <a href="https://github.com/">GitHub 방문하기</a>
      </p>
    </section>
  </main>

  <footer>
    <p>한코딩의 학습 기록</p>
  </footer>
</body>
```

### ✍️ 필수 미션
- 이름과 소개를 자신의 내용으로 수정합니다.
- 학습 목표를 세 개 이상 작성합니다.
- 이미지를 표시하고 적절한 대체 텍스트를 작성합니다.
- 링크의 주소와 문구를 수정합니다.

### 🚀 도전 미션
- 만들고 싶은 서비스를 소개하는 `section`을 추가합니다.
- `ol`로 하루 학습 순서를 작성합니다.

## 참고 코드: 주요 태그 총정리
강의 페이지 끝에 붙어 있던 코드다. 오늘 배운 태그에 더해 표·폼·미디어 등 자주 쓰는 태그를 한 파일에 모아 두었다. 외울 필요는 없고, 필요할 때 찾아 쓴다.

이 코드에서 새로 나오는 태그 (코드 주석 기준):

| 분류 | 태그·속성 | 뜻 |
|---|---|---|
| 구분·줄바꿈 | `hr`, `br` | 가로 구분선 / 문단 안 줄바꿈 (둘 다 닫는 태그 없음) |
| 글자 꾸밈 | `strong`, `em` / `b`, `i`, `u` | 중요(굵게), 강조(기울임) / 단순 굵게·기울임·밑줄 |
| 글자 꾸밈 | `mark`, `del`, `ins`, `small` | 형광펜, 삭제된 내용, 추가된 내용, 작은 글씨 |
| 글자 꾸밈 | `sub`, `sup`, `code` | 아래 첨자, 위 첨자, 코드 한 줄 |
| 인용·서식 | `blockquote`, `q`, `pre` | 긴 인용문, 짧은 인라인 인용(따옴표 자동), 공백·줄바꿈 그대로 표시 |
| 링크 | `target="_blank"`, `href="#id"`, `mailto:` | 새 탭에서 열기, 같은 페이지의 해당 `id` 위치로 이동, 메일 보내기 |
| 목록 | `ol type="A" start="3"`, `dl`/`dt`/`dd` | 번호 모양·시작 번호 지정 / 정의 목록(용어·설명) |
| 표 | `table` > `thead`/`tbody`/`tfoot` > `tr` > `th`/`td`, `caption` | 표 구조, 행, 제목칸, 내용칸, 표 제목 |
| 표 | `colspan`, `rowspan` | 가로로 칸 합치기, 세로로 칸 합치기 |
| 폼 | `form action method`, `fieldset`/`legend` | 보낼 주소·전송 방식(get/post), 입력 항목 묶음과 그 제목 |
| 폼 | `label for` = `input id` | 글자를 눌러도 입력칸이 선택됨 |
| 폼 | `input type=` text/password/email/number/date/radio/checkbox | 입력 종류. radio는 같은 `name`끼리 하나만, checkbox는 여러 개 |
| 폼 | `select`+`option`, `textarea`, `button type=` submit/reset/button | 드롭다운, 여러 줄 입력, 전송·초기화·일반 버튼 |
| 미디어 | `figure`+`figcaption`, `video`/`audio controls` | 이미지와 설명 묶기, `controls`가 있어야 재생 버튼이 보임 |
| 기타 | `details`+`summary` | 클릭하면 펼쳐지는 영역 |
| 영역 | `article`, `aside` | 독립 콘텐츠(블로그 글 등), 부가 내용(사이드바 등) |
| 엔티티 | `&copy;`, `&lt;`, `&gt;`, `&nbsp;` | ©, <, >, 공백 |

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>나의 자기소개</title>

</head>
<body>

  <!-- =========================================================
       1. 시맨틱 레이아웃 태그
       header / nav / main / section / article / aside / footer
       → 모양은 div와 같지만 "의미"를 가진 영역 태그
       ========================================================= -->
  <header>
    <h1>안녕하세요, 한코딩입니다!</h1>

    <!-- nav: 주요 메뉴(링크 모음) -->
    <nav>
      <a href="#text">텍스트</a> |
      <a href="#list">목록</a> |
      <a href="#table">표</a> |
      <a href="#form">폼</a> |
      <a href="#media">미디어</a>
    </nav>
  </header>

  <hr> <!-- hr: 가로 구분선 (닫는 태그 없음) -->

  <main>

    <!-- =========================================================
         2. 이미지 태그 (img)
         src: 이미지 경로 / alt: 대체 텍스트(필수!) / width: 너비
         ========================================================= -->
    <section>
      <h2>프로필 이미지</h2>
      <img
        src="profile.png"
        alt="나의 관심사를 표현하는 이미지"
        width="300"
      >
    </section>


    <!-- =========================================================
         3. 텍스트 관련 태그
         ========================================================= -->
    <section id="text">
      <h2>텍스트 태그</h2>

      <!-- 제목: h1(가장 큼) ~ h6(가장 작음) -->
      <h3>h3 제목</h3>
      <h4>h4 제목</h4>
      <h5>h5 제목</h5>
      <h6>h6 제목</h6>

      <!-- p: 문단 / br: 줄바꿈 -->
      <p>
        p 태그는 하나의 문단입니다.<br>
        br 태그를 쓰면 문단 안에서 줄이 바뀝니다.
      </p>

      <!-- 인라인 텍스트 꾸밈 태그 -->
      <p>
        <strong>strong: 중요한 내용(굵게)</strong>,
        <em>em: 강조(기울임)</em>,
        <b>b: 단순 굵게</b>,
        <i>i: 단순 기울임</i>,
        <u>u: 밑줄</u>
      </p>
      <p>
        <mark>mark: 형광펜</mark>,
        <del>del: 삭제된 내용</del>,
        <ins>ins: 추가된 내용</ins>,
        <small>small: 작은 글씨</small>
      </p>
      <p>
        물의 화학식은 H<sub>2</sub>O (sub: 아래 첨자),
        2<sup>10</sup> = 1024 (sup: 위 첨자)
      </p>
      <p>
        <code>code: console.log("hello");</code> ← 코드 한 줄
      </p>

      <!-- blockquote: 긴 인용문 / q: 짧은 인라인 인용 -->
      <blockquote>
        blockquote: 배움에는 끝이 없다.
      </blockquote>
      <p>선생님이 <q>q 태그는 따옴표가 자동으로 붙어요</q>라고 하셨다.</p>

      <!-- pre: 공백·줄바꿈을 입력한 그대로 보여줌 -->
      <pre>
pre 태그는
    띄어쓰기와
        줄바꿈이 그대로 유지됩니다.
      </pre>

      <!-- span: 의미 없는 인라인 묶음 / div: 의미 없는 블록 묶음 -->
      <div>
        div는 블록 요소라서 한 줄을 통째로 차지하고,
        <span>span은 인라인 요소라서 글자 사이에 들어갑니다.</span>
      </div>
    </section>


    <!-- =========================================================
         4. 링크 태그 (a)
         ========================================================= -->
    <section>
      <h2>링크 태그</h2>
      <p>
        <!-- target="_blank": 새 탭에서 열기 -->
        <a href="https://www.google.com" target="_blank">구글 (새 탭)</a><br>
        <!-- # + id: 같은 페이지 안의 위치로 이동 -->
        <a href="#form">폼 영역으로 이동</a><br>
        <!-- mailto: 메일 보내기 -->
        <a href="mailto:test@example.com">메일 보내기</a>
      </p>
    </section>


    <!-- =========================================================
         5. 목록 태그
         ul: 순서 없는 목록 / ol: 순서 있는 목록 / dl: 정의 목록
         ========================================================= -->
    <section id="list">
      <h2>목록 태그</h2>

      <h3>ul (순서 없는 목록)</h3>
      <ul>
        <li>사과</li>
        <li>배</li>
        <li>
          과일 바구니
          <!-- 목록 안에 목록 넣기(중첩) -->
          <ul>
            <li>바나나</li>
            <li>포도</li>
          </ul>
        </li>
      </ul>

      <h3>ol (순서 있는 목록)</h3>
      <ol>
        <li>HTML 배우기</li>
        <li>CSS 배우기</li>
        <li>JavaScript 배우기</li>
      </ol>

      <!-- type="A": A, B, C... / start="3": 3번부터 시작 -->
      <ol type="A" start="3">
        <li>C부터 시작</li>
        <li>다음은 D</li>
      </ol>

      <h3>dl (정의 목록)</h3>
      <dl>
        <dt>HTML</dt>
        <dd>웹 페이지의 구조를 만드는 언어</dd>
        <dt>CSS</dt>
        <dd>웹 페이지를 꾸미는 언어</dd>
      </dl>
    </section>


    <!-- =========================================================
         6. 표 태그
         table > thead / tbody / tfoot > tr(행) > th(제목칸) / td(내용칸)
         ========================================================= -->
    <section id="table">
      <h2>표 태그</h2>
      <table border="1">
        <caption>주간 시간표</caption> <!-- caption: 표 제목 -->
        <thead>
          <tr>
            <th>시간</th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1교시</td>
            <!-- colspan: 가로로 칸 합치기 -->
            <td colspan="2">HTML (월~화)</td>
            <td>CSS</td>
          </tr>
          <tr>
            <td>2교시</td>
            <td>JavaScript</td>
            <!-- rowspan: 세로로 칸 합치기 -->
            <td rowspan="2">프로젝트</td>
            <td>React</td>
          </tr>
          <tr>
            <td>3교시</td>
            <td>복습</td>
            <td>복습</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4">tfoot: 표의 요약/합계 영역</td>
          </tr>
        </tfoot>
      </table>
    </section>


    <!-- =========================================================
         7. 폼 태그 (사용자 입력)
         form / label / input / select / textarea / button
         ========================================================= -->
    <section id="form">
      <h2>폼 태그</h2>

      <!-- action: 데이터를 보낼 주소 / method: 전송 방식(get, post) -->
      <form action="#" method="post">

        <!-- fieldset: 입력 항목 묶기 / legend: 묶음의 제목 -->
        <fieldset>
          <legend>기본 정보</legend>

          <!-- label의 for 값 = input의 id 값 → 글자를 눌러도 입력칸 선택됨 -->
          <label for="username">이름</label>
          <input type="text" id="username" name="username" placeholder="이름을 입력하세요" required>
          <br>

          <label for="userpw">비밀번호</label>
          <input type="password" id="userpw" name="userpw">
          <br>

          <label for="email">이메일</label>
          <input type="email" id="email" name="email">
          <br>

          <label for="age">나이</label>
          <input type="number" id="age" name="age" min="1" max="120">
          <br>

          <label for="birth">생일</label>
          <input type="date" id="birth" name="birth">
        </fieldset>

        <fieldset>
          <legend>선택 항목</legend>

          <!-- radio: 같은 name끼리 하나만 선택 -->
          <p>성별:
            <input type="radio" id="male" name="gender" value="male">
            <label for="male">남</label>
            <input type="radio" id="female" name="gender" value="female">
            <label for="female">여</label>
          </p>

          <!-- checkbox: 여러 개 선택 가능 / checked: 기본 선택 -->
          <p>관심 분야:
            <input type="checkbox" id="front" name="interest" value="front" checked>
            <label for="front">프론트엔드</label>
            <input type="checkbox" id="back" name="interest" value="back">
            <label for="back">백엔드</label>
          </p>

          <!-- select + option: 드롭다운 -->
          <label for="level">실력</label>
          <select id="level" name="level">
            <option value="">-- 선택하세요 --</option>
            <option value="beginner">입문</option>
            <option value="middle" selected>중급</option>
            <option value="expert">고급</option>
          </select>
          <br>

          <!-- textarea: 여러 줄 입력 -->
          <label for="intro">자기소개</label><br>
          <textarea id="intro" name="intro" rows="4" cols="40" placeholder="자유롭게 적어주세요"></textarea>
        </fieldset>

        <!-- button type: submit(전송) / reset(초기화) / button(일반 버튼) -->
        <button type="submit">제출</button>
        <button type="reset">초기화</button>
        <button type="button">그냥 버튼</button>
      </form>
    </section>


    <!-- =========================================================
         8. 미디어 / 기타 태그
         ========================================================= -->
    <section id="media">
      <h2>미디어 · 기타 태그</h2>

      <!-- figure + figcaption: 이미지와 설명을 한 묶음으로 -->
      <figure>
        <img src="profile.png" alt="프로필 사진" width="150">
        <figcaption>figcaption: 이미지 설명</figcaption>
      </figure>

      <!-- video / audio: controls 속성이 있어야 재생 버튼이 보임 -->
      <video src="sample.mp4" controls width="300">
        브라우저가 video 태그를 지원하지 않을 때 보이는 문구
      </video>
      <br>
      <audio src="sample.mp3" controls></audio>

      <!-- details + summary: 클릭하면 열리고 닫히는 영역 -->
      <details>
        <summary>details: 클릭해서 펼치기</summary>
        <p>숨겨져 있던 내용이 나타납니다.</p>
      </details>
    </section>


    <!-- article: 독립적으로 배포할 수 있는 콘텐츠(블로그 글, 뉴스 기사 등) -->
    <article>
      <h2>article: 오늘의 학습 일기</h2>
      <p>오늘은 HTML의 주요 태그들을 공부했다.</p>
    </article>

  </main>

  <!-- aside: 본문과 관련은 있지만 부가적인 내용(사이드바, 광고 등) -->
  <aside>
    <p>aside: 참고 사이트 – <a href="https://developer.mozilla.org/ko/" target="_blank">MDN</a></p>
  </aside>

  <hr>

  <!-- footer: 페이지 하단 정보 -->
  <footer>
    <p><small>&copy; 2026 한코딩. All rights reserved.</small></p>
    <!-- &copy; 같은 것을 "HTML 엔티티"라고 함: &lt; → <  &gt; → >  &nbsp; → 공백 -->
  </footer>

</body>
</html>
```

## 헷갈리기 쉬운 점
- **`title` vs `h1`**: `title`(`head` 안)은 브라우저 탭 제목, `h1`(`body` 안)은 화면에 보이는 제목이다.
- **`h1`~`h6`의 숫자는 크기가 아니라 계층**이다. 크기 때문에 `h3`를 고르지 않는다. 크기는 CSS로.
- **편집기의 Enter ≠ 브라우저 줄바꿈**. 문단은 `p`로 나눈다 (문단 안 줄바꿈은 참고 코드의 `br`).
- **종료 태그가 없는 요소**: `img`, `input` (참고 코드의 `br`, `hr`도).
- 중첩된 태그는 **안쪽부터** 닫는다.
- **이미지가 안 보일 때**: 파일 이름·확장자, 같은 폴더인지, `src` 오타.
- **`alt`**: 의미 있는 이미지는 내용을 설명, 장식용은 `alt=""`.
- 링크 문구는 "여기 클릭" 대신 목적지가 드러나게.
- **블록/인라인은 기본 표시 방식**일 뿐. CSS `display`로 바꿔도 태그의 의미·중첩 규칙은 그대로다.
- 모두 `div`로 만들지 않는다. 이동은 `a`, 동작 실행은 `button`.
- 파일을 고친 뒤에는 **저장 → 새로고침**해야 브라우저에 반영된다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 브라우저 탭 제목 | `title` (`head` 안) | `<title>나의 자기소개</title>` |
| 대표 제목 / 소제목 | `h1` / `h2`~`h6` | `<h2>나에 대해</h2>` |
| 문단 | `p` | `<p>취미는 산책입니다.</p>` |
| 순서 없는 목록 | `ul` > `li` | `<ul><li>산책</li></ul>` |
| 순서 있는 목록 | `ol` > `li` | `<ol><li>저장하기</li></ol>` |
| 중요·강조 | `strong`, `em` | `<strong>중요</strong>` |
| 링크 | `a href` | `<a href="https://github.com/">GitHub</a>` |
| 이미지 | `img src alt` | `<img src="profile.png" alt="풍경">` |
| 여러 내용 묶기 (블록) | `div` | `<div>…</div>` |
| 문장 일부 묶기 (인라인) | `span` | `<p>저는 <span>웹 개발</span>…</p>` |
| 페이지 영역 나누기 | `header` `nav` `main` `section` `footer` | `<main><section>…</section></main>` |
| 입력과 동작 | `form` `label` `input` `button` | `<button>추가</button>` |
| 표 | `table` `tr` `th` `td` | `<tr><td>1교시</td></tr>` |
| 오디오·영상 | `audio`, `video` | `<video src="a.mp4" controls>` |
| 주석 (화면에 안 보임) | `<!-- -->` | `<!-- 메모 -->` |

## 확인 문제

<details><summary>Q. 다음 코드에서 화면에 보이는 내용은? <code>&lt;p&gt;오늘부터 개발 공부를 시작합니다.&lt;/p&gt;</code></summary>

"오늘부터 개발 공부를 시작합니다." 문장만 보인다. `<p>`, `</p>` 태그는 화면에 나오지 않고, 브라우저가 해석해 이 내용을 하나의 문단으로 표시한다.
</details>

<details><summary>Q. 브라우저 탭 제목과 본문 제목은 각각 어디서 바꾸나?</summary>

탭 제목은 `<head>` 안의 `<title>`, 본문 제목은 `<body>` 안의 `<h1>`이다.
</details>

<details><summary>Q. <code>ul</code>과 <code>li</code>는 어떤 관계인가?</summary>

`ul`은 순서가 중요하지 않은 목록 전체, `li`는 그 안의 각 항목이다. `li`는 `ul`(또는 `ol`) 안에 중첩해서 쓴다.
</details>

<details><summary>Q. 어떤 요소가 기본적으로 새 줄에서 시작하나?</summary>

블록 요소. 예: `div`, `p`, `h1`, `ul`. 새 줄에 놓이고 가로 공간을 채운다. (`span`, `a`, `strong` 같은 인라인 요소는 문장 흐름 안에 놓인다.)
</details>

<details><summary>Q. 문장 안의 특정 단어만 묶으려면 무엇을 쓰면 좋을까?</summary>

`span`. 문장 안의 일부를 묶는 인라인 범용 요소다. 예: `<p>저는 <span>웹 개발</span>에 관심이 있습니다.</p>`
</details>

## 완료 체크
- [ ] HTML 파일을 저장하고 브라우저로 열 수 있다.
- [ ] 제목·문단·목록을 수정할 수 있다.
- [ ] 링크와 이미지의 속성을 찾을 수 있다.
- [ ] `div`와 `span`의 기본 배치 차이를 확인했다.
- [ ] 문서의 주요 영역을 구분할 수 있다.

## 질문 노트

<details><summary>Q. 목록 안에 목록(중첩 목록)은 어떻게 만들어요? <sub>2026-11-09 · 연습 중</sub></summary>

**A.** 하위 목록을 넣고 싶은 **항목(`li`) 안에** `ul`(또는 `ol`)을 하나 더 넣는다. 안쪽 목록은 그 `li`의 `</li>`보다 **앞에** 와야 한다.

```html
<ul>
  <li>한식
    <ul>
      <li>김치찌개</li>
      <li>비빔밥</li>
    </ul>
  </li>
  <li>양식</li>
</ul>
```

- 화면에는 "한식" 아래에 김치찌개·비빔밥이 한 단계 들여 써져 표시된다 (목차의 1장 → 1-1, 1-2처럼).
- 흔한 실수: `<li>한식</li>`를 먼저 닫고 그 아래에 `<ul>`을 두는 것. `ul`의 바로 안에는 `li`만 와야 한다.

관련: 이 파일의 "참고 코드: 주요 태그 총정리" — 과일 바구니 예제
</details>

<details><summary>Q. 종료 태그를 쓰지 않는 요소는 뭐가 있어요? <code>a</code>나 <code>button</code>도 그런가요? <sub>2026-11-09 · 연습 중</sub></summary>

**A.** `img`, `input`, `br`, `hr`, `meta`가 대표적이다. 감쌀 내용이 없는 요소라서 시작 태그 하나로 끝난다.

- `a`, `button`은 화면에 보일 글자(링크 문구, 버튼 문구)를 감싸야 하므로 종료 태그가 **있다**: `<a href="…">GitHub</a>`, `<button>추가</button>`
- 구분법: "태그 사이에 들어갈 내용이 있나?" → 있으면 종료 태그가 있다.
- (2026-11-09 2회차) `button`을 또 종료 태그 없는 요소로 착각함 → 버튼 위에 보이는 글자("삭제")를 감싸야 하므로 `<button>삭제</button>`처럼 종료 태그가 있다.

관련: 이 파일의 "2. HTML, 태그와 요소", "헷갈리기 쉬운 점"
</details>
