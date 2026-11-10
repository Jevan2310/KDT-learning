# 02. CSS — 자기소개 페이지 꾸미기

> 과정: React과정 · [노션 원문](https://app.notion.com/p/40a848f71c9b8011a1b2ebb36ad1d871) · 최종 갱신일: 2026-11-09

## 한눈에 보기
[01_HTML](01_HTML.md)에서 만든 자기소개 페이지에 CSS로 색상·글꼴·여백을 입혔다.
- CSS는 HTML 요소의 **모양과 배치**를 정하는 스타일 언어다. 이번 실습은 외부 파일 `style.css`를 `<link>`로 연결해서 썼다.
- `선택자 { 속성: 값; }` 형태로 쓴다. 선택자는 태그·class(`.`)·id(`#`) 세 가지이고, 재사용하기 쉬운 **class 중심**으로 작성했다.
- 모든 요소는 박스다. 안쪽부터 content → padding → border → margin. `display`로 블록·인라인 표시 방식을 바꿀 수 있다.
- 링크를 버튼 모양으로 꾸미고 `:hover`를 적용했고, 눈누 웹폰트(`@font-face`)를 붙였다. 스타일이 안 먹으면 개발자 도구(F12)로 확인한다.

## 학습 목표
- HTML과 CSS의 역할을 구분한다.
- 선택자로 스타일을 적용할 요소를 고른다.
- 글자·배경·테두리·여백을 변경한다.
- 블록과 인라인의 표시 방식을 바꿔본다.
- 눈누에서 웹폰트를 찾아 적용한다.

## 핵심 개념

### 1. CSS의 역할
CSS(Cascading Style Sheets)는 **HTML 요소의 모양과 배치를 지정하는 스타일 언어**다.
HTML로 내용의 구조를 만들고, CSS로 그 내용을 어떻게 보여줄지 정한다.

| 바꾸고 싶은 것 | 담당 |
|---|---|
| 자기소개 문장 | HTML |
| 학습 목표 항목 추가 | HTML |
| 제목의 색상과 크기 | CSS |
| 카드의 배경색과 여백 | CSS |
| 이미지의 크기와 모양 | CSS |

### 2. CSS를 적용하는 세 가지 방법

| 방법 | 작성 위치 | 특징 |
|---|---|---|
| 인라인 스타일 | HTML 요소의 `style` 속성 | 특정 요소에 바로 적용. 요소가 많아지면 관리가 어렵다 |
| 내부 스타일 | HTML의 `<style>` 요소 안 | 한 HTML 파일 안에서 관리 |
| 외부 스타일 | 별도 `.css` 파일 | HTML과 CSS 역할을 나누기 쉽다. **이번 실습에서 사용** |

```html
<!-- 인라인 스타일 -->
<h1 style="color: blue;">안녕하세요!</h1>
```

```html
<!-- 내부 스타일 -->
<head>
  <style>
    h1 {
      color: blue;
    }
  </style>
</head>
```

```html
<!-- 외부 스타일: <head> 안에 추가 -->
<link rel="stylesheet" href="style.css">
```

<details><summary>수업 중 예제: 같은 스타일을 세 가지 방법으로 쓰기</summary>

내부 스타일 (`<style>`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KDT 풀스택 4회차</title>


<style>
    
    body {
        margin: 0;
    }
    
    div {
        margin: 10px;
        padding: 10px;
        border: 1px solid black;
        background-color: red;
    }

</style>

</head>
<body>

    <!-- 인라인 -->
    <div>아래 요소</div>

</body>
</html>
```

인라인 스타일 (`style` 속성)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KDT 풀스택 4회차</title>
</head>
<body style="margin: 0">

    <!-- 인라인 -->
    <div style="margin: 10px; padding: 10px; border: 1px solid black; background-color: red;">아래 요소</div>

</body>
</html>
```

외부 스타일 (`index.html` + `style.css`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KDT 풀스택 4회차</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- 인라인 -->
    <div>아래 요소</div>

</body>
</html>
```
```css
body {
    margin: 0;
}

div {
    margin: 10px;
    padding: 10px;
    border: 1px solid black;
    background-color: red;
}
```
</details>

### 3. CSS 문법

```css
h1 {
  color: blue;
  font-size: 28px;
}
```

| 구성 | 역할 |
|---|---|
| `h1` | 적용할 요소를 고르는 **선택자** |
| `{ }` | 스타일 선언을 묶는 중괄호 |
| `color` | 변경할 **속성** |
| `blue` | 적용할 **값** |
| `;` | 각 선언을 구분하는 세미콜론 |

기본 형태와 주석:
```css
선택자 {
  속성: 값;
}

/* 대표 제목 스타일 */
h1 {
  color: blue;
}
```
CSS 주석은 `/* */`이다. HTML 주석 `<!-- -->`와 모양이 다르다.

### 4. 선택자로 적용 대상 고르기

| 선택자 | 예시 | 대상 |
|---|---|---|
| 태그 | `p` | 모든 `p` 요소 |
| 클래스 | `.intro` | `intro` 클래스를 가진 요소 |
| ID | `#page-title` | 해당 ID를 가진 요소 (문서에서 하나만) |

```css
/* 태그 선택자: 페이지의 모든 p */
p {
  color: gray;
}
```

```html
<p class="intro">직접 사용하는 서비스를 만들고 싶습니다.</p>
```
```css
/* 클래스 선택자: HTML의 class="intro" ↔ CSS의 .intro */
.intro {
  color: #2563eb;
}
```

```html
<h1 id="page-title">한코딩의 자기소개</h1>
```
```css
/* ID 선택자: 같은 ID를 여러 요소에 반복하지 않는다 */
#page-title {
  color: purple;
}
```

- 이번 실습은 재사용하기 쉬운 **class 중심**으로 작성한다. 같은 클래스를 여러 요소에 붙이면 같은 스타일이 모두 적용된다.
- `*`는 **모든 요소**를 선택한다 (6장 `box-sizing`에서 사용).
- 한 요소에 태그 규칙과 클래스 규칙이 함께 걸리면 **클래스 선택자가 더 구체적**이라 클래스 스타일이 적용된다. 아래에서 `<p class="intro">`는 `#2563eb`(파란색)이 된다.

```css
p {
  color: #475569;
}

.intro {
  color: #2563eb;
}
```

### 5. 글자와 배경 꾸미기

```css
body {
  background-color: #f1f5f9;
  color: #334155;
  font-family: sans-serif;
  line-height: 1.6;
}

h1 {
  color: #2563eb;
  font-size: 28px;
}

h2 {
  font-size: 20px;
}
```

| 속성 | 역할 |
|---|---|
| `color` | 글자색 |
| `background-color` | 배경색 |
| `font-size` | 글자 크기 |
| `font-weight` | 글자 굵기 |
| `font-family` | 글꼴 |
| `line-height` | 줄 높이 |
| `text-align` | 요소 안의 글 등 인라인 내용 정렬 |

- 색상은 이름(`blue`)이나 색상 코드(`#2563eb`)로 지정한다.
- `28px`의 `px`는 크기 단위다.
- 단위 없는 `line-height: 1.6`은 글자 크기의 1.6배를 줄 높이로 쓴다.

**상속**: `body`에 지정한 글꼴·글자색은 자식 요소에 상속될 수 있다. 그래서 여러 요소의 기본 글자 스타일을 한곳에서 정할 수 있다. 단, **모든 속성이 상속되는 것은 아니다.** 여백과 테두리 등은 일반적으로 상속되지 않는다.

### 6. 박스 모델
CSS에서는 요소의 크기와 간격을 **박스 모델**로 이해한다. 안쪽부터:

**내용(content) → 안쪽 여백(padding) → 테두리(border) → 바깥 여백(margin)**

| 구분 | 의미 |
|---|---|
| content | 글자나 이미지가 놓이는 영역 |
| padding | 내용과 테두리 사이의 공간 |
| border | 요소의 테두리 |
| margin | 테두리 바깥의 여백 |

페이지 전체를 카드로 묶는 예:
```css
.profile-card {
  max-width: 560px;
  margin: 24px auto;
  padding: 32px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}
```

| 코드 | 의미 |
|---|---|
| `max-width: 560px` | 최대 너비 제한 |
| `margin: 24px auto` | 위아래 여백 24px, 좌우 자동 여백 → 공간이 충분하면 카드가 가운데 놓인다 |
| `padding: 32px` | 안쪽 여백 |
| `border: 1px solid ...` | 두께·종류·색상으로 테두리 지정 |
| `border-radius: 20px` | 모서리 둥글기 |

**크기 계산을 단순하게** — CSS 맨 위에 추가한다.
```css
* {
  box-sizing: border-box;
}
```
`border-box`를 쓰면 지정한 너비 안에 안쪽 여백과 테두리까지 포함해서 계산한다. 박스 크기를 예측하기 쉽게 만드는 기본 설정이라고 이해하면 된다.

### 7. 크기와 영역 사이 간격
이미지 크기는 HTML의 `width="200"` 속성을 지우고 CSS에서 관리한다.
```css
.profile-image {
  width: 160px;
  height: 160px;
  border-radius: 50%;
}
```
- `width`, `height`: 너비와 높이
- `border-radius: 50%`: 정사각형 이미지 영역을 원형으로 표현

영역별 간격:
```css
section {
  margin-top: 28px;
}

li {
  margin-bottom: 8px;
}

footer {
  margin-top: 32px;
  color: #64748b;
  font-size: 14px;
}
```

### 8. display로 표시 방식 바꾸기
[01_HTML](01_HTML.md)에서 `div`는 블록, `span`은 인라인으로 기본 표시된다는 것을 확인했다. 이 표시 방식은 CSS로 바꿀 수 있다.
```css
span {
  display: block;
}
```
모든 `span`이 블록 방식으로 표시된다.

| 값 | 기본적인 특징 |
|---|---|
| `block` | 새 줄에 놓이며 너비·높이 지정 가능 |
| `inline` | 문장 흐름 안에 놓이며 일반적인 너비·높이 지정은 적용되지 않음 |
| `inline-block` | 문장 흐름에 놓이면서 너비·높이 지정 가능 |
| `none` | 화면과 배치 공간에서 제외 |

<details><summary>수업 중 예제: 블록과 인라인에 배경색 칠해 보기</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KDT 풀스택 4회차</title>


<style>
    
    body {
        margin: 0;
    }

    div {
        color: blue;
        background-color: yellow;
    }
    
    a {
        color: green;
        background-color: pink;
    }

</style>

</head>
<body>
    <!-- 블럭 -->
    <div>오늘은 화요일입니다.</div>


    <!-- 인라인 -->
    <a href="https://www.naver.com">네이버</a>

</body>
</html>
```

> 💡 보충: 실행하면 블록인 `div`는 배경이 줄 전체 너비로 칠해지고, 인라인인 `a`는 글자가 있는 부분만 칠해진다.
</details>

**링크를 버튼 모양으로 꾸미기**
```html
<a class="profile-link" href="https://github.com/">
  GitHub 방문하기
</a>
```
```css
.profile-link {
  display: inline-block;
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
```
버튼처럼 보여도 다른 페이지로 이동하는 링크이므로 **`a`를 유지한다.** 모양(CSS)과 HTML의 의미는 구분한다.

**마우스를 올렸을 때** — `:hover`는 마우스 포인터가 요소 위에 있는 상태를 선택한다.
```css
.profile-link:hover {
  background-color: #1d4ed8;
}
```

### 9. 웹폰트 적용하기 (눈누)
**웹폰트**: 웹페이지가 폰트 파일을 불러와 사용하는 방식. 한글 폰트는 [눈누](https://noonnu.cc/)에서 찾는다. 수업에서는 **프리텐다드**를 적용했다.

적용 순서:
1. 눈누에서 폰트를 찾는다.
2. 폰트의 사용 조건과 웹폰트 제공 여부를 확인한다.
3. 웹폰트 적용 코드를 복사해 `style.css`에 붙여 넣는다.
4. 복사한 코드에 지정된 글꼴 이름을 확인한다.
5. `body`의 `font-family`에 그 이름을 적용한다.

복사한 코드가 `@font-face` 형식이면 다음 부분을 확인한다.
```css
/* 구조 설명용 코드이며 그대로 실행하는 코드는 아닙니다. */
@font-face {
  font-family: "폰트이름";
  src: url("폰트파일주소");
}
```
```css
body {
  font-family: "폰트이름", sans-serif;
}
```
- `@font-face`: 폰트 파일과 사용할 이름을 등록
- `font-family`: 요소에 사용할 글꼴 지정
- `sans-serif`: 지정한 폰트를 사용할 수 없을 때의 대체 글꼴
- 실제로는 **눈누에서 복사한 코드의 이름과 주소**를 쓴다. 복사한 코드에 `<style>`이 포함되어 있으면 `.css` 파일에는 **그 안의 CSS만** 넣는다.

> 💡 보충: 눈누 코드의 실제 모양은 [03_JavaScript](03_JavaScript.md) 1장 "수업 중 예제"에 있다 (굵기별로 `@font-face`가 여러 개 들어 있다).

### 10. 스타일이 적용되지 않을 때

| 증상 | 먼저 확인할 것 |
|---|---|
| 모든 CSS가 적용되지 않음 | `link` 경로·파일 이름·저장 여부 |
| 특정 요소만 적용되지 않음 | class 이름과 선택자의 철자 |
| 일부 속성이 적용되지 않음 | 속성 이름·값·단위·괄호·세미콜론 |
| 작성한 색과 다른 색이 보임 | 다른 CSS 규칙이 같은 요소에 적용되는지 |
| 웹폰트가 적용되지 않음 | 폰트 이름·파일 주소·네트워크 연결 |

같은 요소에 여러 규칙이 적용되면 선택자의 우선순위 등을 따른다. **우선순위가 같으면 뒤에 쓴 선언이 앞의 선언을 덮어쓴다.** 아래에서 제목은 보라색이다.
```css
h1 {
  color: blue;
}

h1 {
  color: purple;
}
```

**개발자 도구로 확인하기** (F12 또는 Ctrl + Shift + C)
1. F12로 개발자 도구를 연다.
2. 해당 HTML 요소와 적용된 스타일을 확인한다.
3. 스타일 값을 임시로 바꿔본다. **개발자 도구에서 바꾼 값은 원본 파일에 저장되지 않는다.**

## 실습 정리

### 만든 것
[01_HTML](01_HTML.md)의 자기소개 페이지를 카드 모양으로 꾸몄다. 원형 프로필 이미지, 버튼 모양 GitHub 링크(마우스를 올리면 색 변화), 웹폰트까지 적용했다.

```text
my-profile
├─ index.html
├─ profile.png
└─ style.css
```

### 단계 흐름

| 단계 | HTML에서 할 일 | CSS에 추가할 것 |
|---|---|---|
| 1. CSS 연결 | `<head>`에 `<link rel="stylesheet" href="style.css">` | `h1 { color: blue; }` → 새로고침해서 제목이 파란색이면 성공 |
| 2. 소개 문장만 바꾸기 | 대표 소개 문장 `p`에 `class="intro"` | `p`, `.intro` 색상 |
| 3. 글자와 배경 | — | `body`, `h1`, `h2` |
| 4. 카드로 묶기 | `<body>` 안 기존 내용 전체를 `<div class="profile-card">`로 감싸기 | `.profile-card`, 맨 위에 `* { box-sizing: border-box; }` |
| 5. 이미지와 간격 | `img`에 `class="profile-image"`, `width="200"` 삭제 | `.profile-image`, `section`, `li`, `footer` |
| 6. 링크 버튼 | GitHub 링크 `a`에 `class="profile-link"` | `.profile-link`, `.profile-link:hover` |
| 7. 웹폰트 | — | 눈누 `@font-face` 코드, `body`의 `font-family` |

### 최종 코드

> 💡 보충: 강의는 단계별 조각만 보여준다. 아래는 강의 조각을 그대로 모아 한 파일로 합친 것이다. 웹폰트 부분은 눈누에서 복사한 코드와 그 폰트 이름으로 바꿔 넣는다.

`index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./style.css">
    <title>나의 자기소개</title>
</head>
<body>
  <div class="profile-card">
    <header>
      <h1>안녕하세요, 한코딩입니다!</h1>
      <p class="intro">직접 사용하는 서비스를 만들고 싶습니다.</p>
    </header>

    <main>
      <section>
        <h2>나에 대해</h2>

        <img
          class="profile-image"
          src="profile.png"
          alt="나의 관심사를 표현하는 이미지"
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
          <a class="profile-link" href="https://github.com/">
            GitHub 방문하기
          </a>
        </p>
      </section>
    </main>

    <footer>
      <p>한코딩의 학습 기록</p>
    </footer>
  </div>
</body>
</html>
```

`style.css`
```css
* {
  box-sizing: border-box;
}

/* 눈누에서 복사한 웹폰트 코드(@font-face)를 여기에 붙여 넣는다 */

body {
  background-color: #f1f5f9;
  color: #334155;
  font-family: "폰트이름", sans-serif;
  line-height: 1.6;
}

h1 {
  color: #2563eb;
  font-size: 28px;
}

h2 {
  font-size: 20px;
}

p {
  color: #475569;
}

.intro {
  color: #2563eb;
}

.profile-card {
  max-width: 560px;
  margin: 24px auto;
  padding: 32px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.profile-image {
  width: 160px;
  height: 160px;
  border-radius: 50%;
}

section {
  margin-top: 28px;
}

li {
  margin-bottom: 8px;
}

footer {
  margin-top: 32px;
  color: #64748b;
  font-size: 14px;
}

.profile-link {
  display: inline-block;
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}

.profile-link:hover {
  background-color: #1d4ed8;
}
```

### 직접 바꿔보기 (강의의 연습 과제 모음)
- `h1`의 `blue`를 `green`이나 `purple`로 바꿔본다.
- 원하는 문단 하나에 `intro` 클래스를 추가해, 같은 클래스 스타일이 여러 요소에 적용되는지 확인한다.
- 페이지 배경색, 제목 크기를 바꾸고 `line-height`를 `1`과 `1.8`로 바꿔 읽기 편한 값을 비교한다.
- 카드의 `padding`을 `0`과 `40px`로, `margin`의 위아래 값을, `border-radius`를 `0`으로 **한 번에 한 속성씩** 바꿔본다.
- 이미지 크기, 이미지 `border-radius`(`16px`), 영역 사이 간격을 조절한다.
- 링크 배경색·글자색과 `:hover` 배경색을 바꾼다.
- 기존 글꼴과 웹폰트를 비교한다: 제목의 인상, 긴 문장의 가독성, 한글·영문 모두 적용되었는지.

## 헷갈리기 쉬운 점
- HTML에서는 `class="intro"`, CSS에서는 `.intro`(점)로 연결한다. ID는 `#`. 같은 ID를 여러 요소에 반복하지 않는다.
- CSS 주석은 `/* */`, HTML 주석은 `<!-- -->`.
- CSS가 통째로 안 먹으면 파일 이름이 `style.css`인지, `href`의 이름과 실제 파일 이름이 같은지, HTML·CSS 두 파일을 모두 저장했는지부터 본다.
- 카드로 묶을 때 기존 내용을 주석으로 **바꾸는 것이 아니라**, 기존 내용 **바깥에** `div`를 추가한다.
- 이미지 크기는 HTML의 `width="200"`을 지우고 CSS에서 관리한다. (강의 7장 코드에는 `src="profile.jpg"`로 적혀 있으니 실제 파일 이름에 맞춘다.)
- 링크를 버튼처럼 꾸며도 이동하는 링크이면 `a`를 유지한다. 모양과 의미는 따로다.
- 인라인 요소(`a`, `span`)에는 일반적인 너비·높이가 적용되지 않는다. 링크에 padding을 넣어 버튼처럼 만들 때 `display: inline-block`을 쓴 이유다.
- 모든 속성이 상속되지는 않는다. 글꼴·글자색은 상속될 수 있지만 여백·테두리는 일반적으로 상속되지 않는다.
- 우선순위가 같으면 **뒤에 쓴 선언**이 이긴다. 태그와 클래스가 겹치면 **클래스**가 이긴다.
- 웹폰트 코드에 `<style>`이 들어 있으면 `.css` 파일에는 그 안의 CSS만 넣는다.
- 개발자 도구에서 바꾼 값은 원본 파일에 저장되지 않는다. 확인 후 파일에 직접 옮겨 적어야 한다.

> 💡 보충: 상속보다 요소에 직접 걸린 규칙이 우선한다. 최종 코드에서 `footer`에 `color: #64748b`를 줬지만, footer 안의 `<p>`에는 `p { color: #475569; }`가 직접 걸리므로 글자색은 `p` 규칙을 따른다. (`font-size: 14px`는 `p`에 따로 지정한 크기가 없어서 상속된다.)

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 외부 CSS 연결 | `<link>` (`<head>` 안) | `<link rel="stylesheet" href="style.css">` |
| 같은 태그 전부 | 태그 선택자 | `p { color: gray; }` |
| 이름 붙인 요소들 | 클래스 선택자 | `.intro { color: #2563eb; }` |
| 고유한 요소 하나 | ID 선택자 | `#page-title { color: purple; }` |
| 모든 요소 | `*` | `* { box-sizing: border-box; }` |
| 글자색 / 배경색 | `color` / `background-color` | `color: #334155;` |
| 글자 크기 / 굵기 | `font-size` / `font-weight` | `font-size: 28px;` |
| 글꼴 (대체 글꼴 포함) | `font-family` | `font-family: "폰트이름", sans-serif;` |
| 줄 높이 | `line-height` | `line-height: 1.6;` |
| 글 정렬 | `text-align` | `text-align: center;` |
| 안쪽 여백 | `padding` | `padding: 32px;` / `padding: 10px 16px;` (위아래 좌우) |
| 바깥 여백 | `margin` | `margin-top: 28px;` |
| 가운데 놓기 | `max-width` + `margin` 좌우 `auto` | `margin: 24px auto;` |
| 테두리 | `border` (두께 종류 색) | `border: 1px solid #e2e8f0;` |
| 모서리 둥글게 / 원형 | `border-radius` | `20px` / `50%` |
| 너비·높이 | `width` / `height` | `width: 160px;` |
| 표시 방식 | `display` | `block` / `inline` / `inline-block` / `none` |
| 링크 밑줄 없애기 | `text-decoration` | `text-decoration: none;` |
| 마우스 올렸을 때 | `:hover` | `.profile-link:hover { ... }` |
| 웹폰트 등록 | `@font-face` | 눈누에서 복사한 코드 |
| 적용된 스타일 확인 | 개발자 도구 | F12 / Ctrl + Shift + C |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문과 강조된 내용에서 뽑았다.

<details><summary>Q. "자기소개 문장 수정"과 "제목의 색상·크기 변경"은 각각 HTML과 CSS 중 어디서 하나?</summary>

문장(내용·구조)은 HTML, 색상·크기(모양)는 CSS.
</details>

<details><summary>Q. CSS를 적용하는 세 가지 방법과 각각의 작성 위치는?</summary>

인라인 스타일(요소의 `style` 속성), 내부 스타일(`<style>` 요소 안), 외부 스타일(별도 `.css` 파일을 `<link>`로 연결). 이번 실습은 역할 구분이 쉬운 외부 스타일을 썼다.
</details>

<details><summary>Q. `h1 { color: blue; }`에서 선택자, 속성, 값은 각각 무엇인가?</summary>

선택자 `h1`, 속성 `color`, 값 `blue`. `;`는 선언을 구분한다.
</details>

<details><summary>Q. HTML의 `class="intro"`와 `id="page-title"`을 CSS에서 선택하려면?</summary>

`.intro { }`, `#page-title { }`. 클래스는 점, ID는 `#`.
</details>

<details><summary>Q. `p { color: #475569; }`와 `.intro { color: #2563eb; }`가 있을 때 `<p class="intro">`의 글자색은?</summary>

`#2563eb`. 클래스 선택자가 태그 선택자보다 구체적이어서 클래스 스타일이 적용된다.
</details>

<details><summary>Q. `h1 { color: blue; }` 다음 줄에 `h1 { color: purple; }`이 있으면 제목 색은?</summary>

보라색. 우선순위가 같으면 뒤에 쓴 선언이 앞의 선언을 덮어쓴다.
</details>

<details><summary>Q. 박스 모델을 안쪽부터 순서대로 말하면?</summary>

content(내용) → padding(안쪽 여백) → border(테두리) → margin(바깥 여백).
</details>

<details><summary>Q. (강의 질문) 카드의 값을 바꿔볼 때, 내용과 테두리 사이를 바꾸는 것과 카드 바깥을 바꾸는 것은?</summary>

내용과 테두리 사이는 `padding`, 카드 바깥(테두리 바깥 여백)은 `margin`.
</details>

<details><summary>Q. `.profile-card`의 `margin: 24px auto`는 무슨 뜻이고, 어떤 효과가 있나?</summary>

위아래 여백 24px, 좌우는 자동 여백. `max-width`로 너비가 제한된 카드가 공간이 충분하면 가운데 놓인다.
</details>

<details><summary>Q. `* { box-sizing: border-box; }`를 쓰면 무엇이 달라지나?</summary>

지정한 너비 안에 안쪽 여백(padding)과 테두리(border)를 포함해서 계산한다. 박스 크기를 예측하기 쉬워진다.
</details>

<details><summary>Q. `display` 값 `block`, `inline`, `inline-block`, `none`의 차이는?</summary>

`block`: 새 줄에 놓이고 너비·높이 지정 가능. `inline`: 문장 흐름 안에 놓이고 일반적인 너비·높이 지정이 적용되지 않음. `inline-block`: 문장 흐름에 놓이면서 너비·높이 지정 가능. `none`: 화면과 배치 공간에서 제외.
</details>

<details><summary>Q. GitHub 링크를 버튼 모양으로 꾸몄다. `a`를 `button` 태그로 바꿔야 할까?</summary>

아니다. 다른 페이지로 이동하는 링크이므로 `a`를 유지하고 모양만 CSS로 바꾼다. 모양과 HTML의 의미는 구분한다.
</details>

<details><summary>Q. 마우스를 올렸을 때만 링크 배경색을 바꾸려면?</summary>

`:hover`를 쓴다. 예: `.profile-link:hover { background-color: #1d4ed8; }`
</details>

<details><summary>Q. `font-family: "폰트이름", sans-serif;`에서 `sans-serif`의 역할은?</summary>

지정한 웹폰트를 사용할 수 없을 때 쓰는 대체 글꼴.
</details>

<details><summary>Q. `body`에 지정한 스타일 중 자식 요소에 상속되는 것과 일반적으로 상속되지 않는 것의 예는?</summary>

글꼴·글자색은 상속될 수 있다. 여백(margin, padding)과 테두리는 일반적으로 상속되지 않는다.
</details>

<details><summary>Q. CSS가 전부 적용되지 않을 때 먼저 확인할 것은? 개발자 도구에서 바꾼 값은 파일에 남을까?</summary>

`link`의 경로·파일 이름·저장 여부를 먼저 본다. 개발자 도구에서 바꾼 값은 원본 파일에 저장되지 않는다.
</details>

## 완료 체크
- [ ] 외부 CSS 파일을 HTML에 연결했다.
- [ ] class를 사용해 원하는 요소에 스타일을 적용했다.
- [ ] 글자색·배경색·글자 크기를 변경했다.
- [ ] padding과 margin의 차이를 확인했다.
- [ ] 링크를 꾸미고 마우스를 올렸을 때의 스타일을 적용했다.
- [ ] 웹폰트를 적용하고 결과를 확인했다.

## 질문 노트

<details><summary>Q. class와 color는 둘 다 "속성"이라는데 뭐가 달라요? <sub>2026-11-10 · 연습 중</sub></summary>

**A.** `class`는 **HTML 속성**이다. 태그 안에 써서 그 **요소에 이름표를 붙인다.** 이름표만 붙여서는 모양이 바뀌지 않는다. `color`는 **CSS 속성**이다. CSS 규칙의 `{ }` 안에 써서 **모양(글자색)을 정한다.** class는 "누구에게", color는 "어떻게"를 맡고, 둘이 선택자 `.intro`로 이어진다.

```html
<p class="intro">안녕하세요</p>   <!-- p 요소에 intro 이름표 (HTML 속성: 이름="값") -->
```
```css
.intro {
  color: blue;                    /* 이름표가 붙은 요소의 글자색 (CSS 속성: 이름: 값;) */
}
```

class가 나누는 것은 속성이 아니라 **요소**다 ("이 문단은 intro 그룹"). 쓰는 모양도 다르다. HTML 속성은 `=`와 따옴표, CSS 속성은 `:`와 `;`. 그래서 CSS 안에서 `color = red`처럼 쓰면 그 줄이 무시된다.

관련: 이 파일의 "3. CSS 문법", "4. 선택자로 적용 대상 고르기"
</details>
