# 02. Promise와 async/await로 결과 처리하기 — 나중에 준비되는 결과 다루기

> 과정: 비동기과정 · [노션 원문](https://app.notion.com/p/419848f71c9b80bfbd49e809f4ca17d5) · 최종 갱신일: 2026-11-18

## 한눈에 보기
- 타이머 콜백 안의 `return`은 **바깥 함수의 반환값이 아니다.** 그래서 `getStudent()`의 결과가 `undefined`가 된다. 나중에 준비되는 결과를 전달할 방법이 **Promise**다.
- **Promise**는 나중에 완료될 작업의 결과를 다루는 객체다. 상태는 **대기(pending) → 이행(fulfilled) 또는 거부(rejected)**, 한 번 정해지면 다시 바뀌지 않는다. `resolve(결과)`로 성공, `reject(오류)`로 실패를 전달한다.
- 결과는 `.then()`/`.catch()` 또는 **`async/await` + `try/catch/finally`** 로 받는다. `await`는 **그 async 함수 안의 다음 코드만** 기다리게 하고, 프로그램 전체를 멈추지 않는다.
- 두 작업을 `await`로 하나씩 기다리면 약 2초(순차), **`Promise.all()`로 함께 시작**하면 약 1초(동시 진행). 결과 배열은 **완료 순서가 아니라 전달한 순서**다.
- 앞 작업의 결과가 다음 작업에 필요하면 순서를 지켜야 한다. **빠른 방식보다 데이터의 의존 관계를 먼저** 본다.

## 학습 목표
- Promise라는 객체의 역할과 상태를 이해한다.
- `.then()`과 `.catch()`로 결과를 처리한다.
- `async/await`로 비동기 코드를 작성한다.
- `try/catch/finally`로 성공과 실패를 처리한다.
- 순차 실행과 동시 진행의 소요 시간을 비교한다.

## 핵심 개념

### 1. 나중에 준비되는 값을 바로 반환할 수 있을까?
학생 정보를 가져오는 데 1초가 걸린다고 가정한다 (`student-result.js`).

```javascript
function getStudent() {
  setTimeout(() => {
    return "한코딩";
  }, 1000);
}

const student = getStudent();

console.log(student);
```

```text
undefined
```

1초 뒤에도 `"한코딩"`은 출력되지 않는다.

**왜?** `return "한코딩"`은 **타이머에 전달한 콜백 함수의 반환값**이다. 바깥의 `getStudent()`가 반환하는 값이 아니다.

```text
getStudent() 호출
    ↓
타이머 예약
    ↓
getStudent() 종료: 반환값 없음
    ↓
student에 undefined 저장
    ↓
나중에 타이머 콜백 실행
```

나중에 준비되는 결과를 전달하고 처리할 방법이 필요하다.

### 2. Promise란?
**나중에 완료될 작업의 결과를 다루는 객체**다. 작업을 시작할 때 최종 결과가 없어도 **Promise를 먼저 반환**하고, 결과가 준비되었을 때 이어서 처리할 수 있다.

| 상태 | 의미 |
|---|---|
| 대기 — pending | 결과를 기다리는 중 |
| 이행 — fulfilled | 성공 결과가 준비됨 |
| 거부 — rejected | 실패 이유가 전달됨 |

**이행과 거부 중 하나로 결정되면 그 Promise의 상태는 다시 바뀌지 않는다.**

```javascript
const promise = new Promise((resolve, reject) => {
  // 성공하면 resolve(결과)
  // 실패하면 reject(오류)
});
```

`resolve`, `reject`는 JavaScript가 이 함수에 전달하는 매개변수다. 이름은 직접 정하지만, 역할을 알아보기 쉽게 보통 이 이름을 쓴다.

### 3. Promise로 결과 전달하고 `.then()`으로 받기

```javascript
function getStudent() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("한코딩");
    }, 1000);
  });
}

console.log("학생 정보 요청");

getStudent().then((student) => {
  console.log("받은 학생:", student);
});

console.log("요청 후 다른 작업");
```

```text
학생 정보 요청
요청 후 다른 작업
```

약 1초 뒤:

```text
받은 학생: 한코딩
```

| 코드 | 의미 |
|---|---|
| `return new Promise(...)` | `getStudent()`가 **Promise를 반환** |
| `resolve("한코딩")` | `"한코딩"`을 **성공 결과로 전달** |
| `.then((student) => { … })` | 성공 결과가 준비되면 실행할 함수 등록. `student`가 성공 결과를 받는 매개변수 |

```text
getStudent() 호출
    ↓
Promise 반환, 타이머 대기
    ↓
바깥 코드 계속 실행
    ↓
resolve("한코딩")
    ↓
등록한 then 처리 함수 실행
```

**Promise를 반환받는 것과 최종 학생 정보를 받는 것은 다르다.**

### 4. 실패 결과 처리하기 — `reject`와 `.catch()`
실제 요청은 항상 성공하지 않는다 (서버 연결 실패, 없는 데이터 등). 수업 코드는 `resolve`·`reject` 자리에 **`성공`·`실패`라는 이름**을 붙였다.

```javascript
function getStudent(shouldSuccess) {
    return new Promise((성공, 실패) => {
        setTimeout(() => {
            if (!shouldSuccess) {
                실패(new Error("학생 정보를 가져오지 못했습니다."));
                return;
            }

            성공("한코딩");
        }, 3000);
    })
}

getStudent(false)
.then((student) => {
    console.log("받은 학생:", student);
})
.catch((error) => {
    console.log("오류:", error.message);
});
```

```text
오류: 학생 정보를 가져오지 못했습니다.
```

| 코드 | 역할 |
|---|---|
| `shouldSuccess` | 성공 여부를 실험하기 위한 매개변수 |
| `new Error("문장")` | 오류 정보를 담는 객체 생성 |
| `reject(error)` (수업 코드의 `실패(…)`) | Promise를 **실패로 처리** |
| `.catch()` | 실패된 결과를 처리하는 함수 등록 |
| `error.message` | 오류 객체의 메시지 |

**`reject()` 호출만으로 현재 함수의 나머지 코드가 중단되지는 않는다.** 그래서 실패 처리 후 성공 코드를 실행하지 않도록 `return`으로 콜백을 끝낸다.

> 💡 보충: 노션에는 "약 1초 뒤"라고 적혀 있지만 이 코드의 지연은 `3000`이라 실제로는 **약 3초 뒤**에 출력된다 (실행해서 확인). 매개변수 이름은 자유라서 `성공`이 `resolve`, `실패`가 `reject` 역할이다(첫 번째가 성공, 두 번째가 실패).

### 5. `async/await`로 같은 결과 처리하기
Promise 결과는 `.then()` 대신 `await`로 받을 수도 있다. 4장의 `getStudent()`는 그대로 두고 호출 부분만 바꾼다.

```javascript
function getStudent(shouldSuccess) {
    return new Promise((성공, 실패) => {
        setTimeout(() => {
            if (!shouldSuccess) {
                실패(new Error("학생 정보를 가져오지 못했습니다."));
                return;
            }

            성공("한코딩");
        }, 3000);
    })
}

async function main() {
  const student = await getStudent(true);

  console.log("받은 학생:", student);
}

main();
```

| 키워드 | 의미 |
|---|---|
| `async function main() { }` | `async` 함수는 **Promise를 반환**한다. 함수 안에서 `await`를 쓸 수 있다 |
| `const student = await getStudent(…)` | **성공 결과가 준비되면** 그 값을 `student`에 넣고 다음 코드로 진행 |

**Promise가 거부되면 그 `await`에서 오류가 발생**하므로 오류 처리도 필요하다 (7장).

> 💡 보충: 노션의 `await` 설명 코드는 `await getStudent(false)`로 적혀 있다. 이 장의 함수(`shouldSuccess`)에서 `false`는 **실패**라서, `try/catch` 없이 실행하면 처리되지 않은 오류가 출력되고 프로그램이 끝난다 (실행해서 확인). 성공 결과를 보려면 위 코드처럼 `true`로 호출한다.

**두 방식 비교** — 둘 다 Promise의 결과를 처리한다. `async/await`는 작업 흐름을 **위에서 아래로 읽기 쉽게** 쓰는 방법이다.

```javascript
getStudent(true).then((student) => {
  console.log(student);
});
```

```javascript
async function main() {
  const student = await getStudent(true);

  console.log(student);
}

main();
```

### 6. `await`는 어디를 기다리게 할까?

```javascript
async function main() {
  console.log("1. 학생 정보 요청");

  const student = await getStudent(true);

  console.log("3. 받은 학생:", student);
}

main();

console.log("2. main 함수 밖의 작업");
```

```text
1. 학생 정보 요청
2. main 함수 밖의 작업
```

잠시 뒤:

```text
3. 받은 학생: 한코딩
```

> 💡 보충: 노션에는 "약 1초 뒤"라고 되어 있다. 5장의 `getStudent()`(3000)를 그대로 쓰면 약 3초 뒤에 나온다. 시간은 `getStudent()`에 적은 지연 시간을 따른다.

- `await`는 **`main` 안에서 결과 이후에 이어질 코드**를 기다리게 한다.
- **프로그램 전체를 멈추거나 실행 스레드를 붙잡아 두지는 않는다** ([01_실행순서-기다림](01_실행순서-기다림.md) 9장).
- **`async`가 자동으로 작업을 분리하지는 않는다.** 함수에 `async`를 붙여도 그 안의 계산이 다른 스레드에서 실행되지 않는다. 오래 걸리는 반복문을 넣으면 여전히 현재 JavaScript 실행 스레드를 오래 점유할 수 있다 ([03_블로킹-논블로킹](03_블로킹-논블로킹.md)에서 서버로 확인).

### 7. `try/catch/finally`로 마무리하기

| 구문 | 역할 |
|---|---|
| `try` | 시도할 작업 |
| `catch` | 오류가 발생했을 때 처리 |
| `finally` | **성공·실패와 관계없이** 마무리 |

```javascript
async function main() {
  console.log("학생 정보를 불러오는 중입니다.");

  try {
    const student = await getStudent(false);

    console.log("받은 학생:", student);
  } catch (error) {
    console.log("오류:", error.message);
  } finally {
    console.log("학생 정보 요청 처리를 마쳤습니다.");
  }
}
```

- **이 장의 `getStudent(shouldFail)`은 매개변수 의미가 4·5장과 반대**다. `true`면 실패, `false`면 성공 (전체 코드는 아래 실습 정리).
- `await`를 `try` 안에서 실행해야 거부된 Promise를 `catch`에서 받는다.
- React에서는 이 구조로 **`finally`에서 로딩 상태를 종료**했다 ([04_React-서버연결](../02_Node과정/04_React-서버연결.md) 10장).

| 경우 | 출력 |
|---|---|
| 성공 `getStudent(false)` | `학생 정보를 불러오는 중입니다.` → `받은 학생: 한코딩` → `학생 정보 요청 처리를 마쳤습니다.` |
| 실패 `getStudent(true)` | `학생 정보를 불러오는 중입니다.` → `오류: 학생 정보를 가져오지 못했습니다.` → `학생 정보 요청 처리를 마쳤습니다.` |

**두 경우 모두 마지막 문장(`finally`)이 출력된다.**

### 8. 두 작업을 차례로 기다리기 — 순차 실행 (`sequential.js`)

```javascript
function getStudent(name, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`${name} 정보 준비 완료`);
      resolve(name);
    }, delay);
  });
}

async function main() {
  console.time("순차 실행");

  const first = await getStudent("한코딩", 1000);
  const second = await getStudent("이학생", 1000);

  console.log("결과:", first, second);

  console.timeEnd("순차 실행");
}

main();
```

| 코드 | 역할 |
|---|---|
| `console.time("순차 실행")` | 시간 측정 시작 |
| `console.timeEnd("순차 실행")` | **같은 이름**으로 시작한 측정을 끝내고 경과 시간 출력 |

```text
첫 학생 요청 시작
    ↓ 약 1초
첫 학생 결과 받음
    ↓
두 번째 학생 요청 시작
    ↓ 약 1초
두 번째 학생 결과 받음
```

실행 결과 (Node.js에서 확인, 시간은 환경마다 조금 다르다):

```text
한코딩 정보 준비 완료
이학생 정보 준비 완료
결과: 한코딩 이학생
순차 실행: 2.009s
```

전체 약 **2초**. **두 번째 작업은 첫 번째 `await`가 끝난 뒤 시작**한다.

### 9. 독립적인 작업을 함께 시작하기 — `Promise.all()` (`concurrent.js`)
두 학생 정보가 서로 관련 없이 조회될 수 있다면 함께 시작할 수 있다. `sequential.js`를 복사해 `concurrent.js`를 만들고 `main()`만 바꾼다.

```javascript
async function main() {
  console.time("동시 진행");

  const results = await Promise.all([
    getStudent("한코딩", 1000),
    getStudent("이학생", 1000)
  ]);

  console.log("결과:", results);

  console.timeEnd("동시 진행");
}

main();
```

실행 결과 (Node.js에서 확인):

```text
한코딩 정보 준비 완료
이학생 정보 준비 완료
결과: [ '한코딩', '이학생' ]
동시 진행: 1.009s
```

전체 약 **1초**.

```text
Promise.all([
  첫번째Promise,
  두번째Promise
])
```

- 전달한 Promise가 **모두 성공하면 결과 배열**을 준다.
- 배열을 만드는 과정에서 두 `getStudent()`를 호출하므로 **두 타이머가 먼저 함께 시작**된다.
- **`Promise.all()`이 함수를 자동으로 별도 스레드에서 실행하는 것은 아니다.**

```text
순차 실행

첫 작업 ── 1초 ── 완료
                  두 번째 작업 ── 1초 ── 완료
```

```text
동시 진행

첫 작업 ── 1초 ── 완료
두 번째 작업 ── 1초 ── 완료
```

이 예제는 **타이머 대기 시간이 겹치는 것**이다. JavaScript 계산을 여러 CPU 코어에서 병렬 실행하는 예제가 아니다.

### 10. 결과 순서는 완료 순서와 다르다
지연 시간을 다르게 준다 (수업 코드는 `getStudent`를 화살표 함수로 썼다).

```javascript
const getStudent = (name, delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`${name} 정보 준비 완료`);
            resolve(name);
        }, delay);
    })
}

async function main() {
  console.time("동시 진행");

  const results = await Promise.all([
    getStudent("한코딩", 2000),
    getStudent("이학생", 500)
  ]);

  console.log("결과:", results);

  console.timeEnd("동시 진행");
}

main();
```

실행 결과 (Node.js에서 확인):

```text
이학생 정보 준비 완료
한코딩 정보 준비 완료
결과: [ '한코딩', '이학생' ]
동시 진행: 2.002s
```

- `이학생`의 준비 완료 로그가 먼저 나오지만, **결과 배열은 전달한 배열의 순서**를 따른다. 첫 번째로 전달한 Promise의 결과가 배열의 첫 번째에 들어간다.
- **하나라도 거부되면 `Promise.all()`도 거부된다.** 다른 작업을 자동으로 취소하지는 않는다. 실제 요청에서는 `try/catch`로 실패를 처리한다.

### 11. 모든 작업을 함께 실행하면 좋을까?
앞 작업의 결과가 다음 작업에 필요하면 **순서를 지켜야** 한다.

```text
로그인 처리
    ↓ 로그인 결과에서 사용자 ID 확인
해당 사용자의 게시글 목록 조회
```

두 번째 요청에 필요한 사용자 ID가 아직 없으므로 두 작업을 무작정 함께 시작할 수 없다.

| 작업 관계 | 처리 방향 |
|---|---|
| 서로 독립적 | 함께 시작하는 방식 고려 (`Promise.all()`) |
| 앞 결과가 필요함 | 결과를 받은 뒤 다음 작업 시작 (`await` 차례로) |

**빠르게 보이는 방식보다 데이터의 의존 관계를 먼저 확인한다.**

### 12. 기존 API 요청 코드와 연결하기
React에서 쓴 요청 코드를 다시 읽는다 ([04_React-서버연결](../02_Node과정/04_React-서버연결.md) 5·7장).

```javascript
const response = await fetch(
  "http://localhost:8080/api/students"
);

if (!response.ok) {
  throw new Error("학생 목록 요청에 실패했습니다.");
}

const students = await response.json();
```

| 코드 | 의미 |
|---|---|
| `fetch()` | 요청하고 **Promise 반환** |
| 첫 번째 `await` | 응답 객체가 준비되면 다음 코드 진행 |
| `response.ok` | HTTP 성공 상태인지 확인 |
| `response.json()` | 응답 본문을 읽고 JSON 해석 |
| 두 번째 `await` | 본문 처리 결과가 준비되면 학생 배열 받기 |

- `response.json()`은 `response`가 있어야 실행할 수 있다 → **앞 결과가 필요한 관계**라 차례로 기다린다.
- `fetch()`는 `404`, `500` 같은 HTTP 상태만으로 **자동 거부되지 않으므로** `response.ok` 검사로 실패를 처리한다.

> 💡 보충: `8080/api/students`는 Spring Boot 서버의 학생 API 주소다. Node과정에서는 같은 흐름을 `http://localhost:3000/students`로 썼다.

### 13. `Promise`와 `await`의 역할 구분

```javascript
const promise = getStudent(false);
```

작업을 **시작하고 Promise를 받는다.**

```javascript
const student = await promise;
```

Promise의 **성공 결과를 받아 사용한다.** **`await`가 비동기 작업 자체를 만들어 주는 것은 아니다.**

### 정리

| 개념 | 핵심 |
|---|---|
| Promise | 나중에 완료되는 작업의 결과를 다루는 객체 |
| `resolve()` | 이번 예제에서 성공 결과 전달 |
| `reject()` | 실패 이유 전달 |
| `.then()` | 성공 결과 처리 |
| `.catch()` | 거부된 결과 처리 |
| `async` | Promise를 반환하는 함수 작성 |
| `await` | 현재 async 함수에서 결과를 기다렸다가 진행 |
| `finally` | 성공·실패와 관계없이 마무리 |
| `Promise.all()` | 여러 Promise의 성공 결과를 함께 받기 |

## 실습 정리

### 파일과 실행 명령
[01_실행순서-기다림](01_실행순서-기다림.md)에서 만든 **`async-basic` 폴더**에 이어서 만든다. 패키지 설치는 없다.

| 파일 | 내용 | 실행 |
|---|---|---|
| `student-result.js` | 1장 `undefined` → 3장 `.then()` → 4장 `.catch()` → 5·6장 `async/await` → 7장 `try/catch/finally` 순서로 **교체**하며 실행 | `node student-result.js` |
| `sequential.js` | 8장 순차 실행 | `node sequential.js` |
| `concurrent.js` | `sequential.js` 복사 후 `main()`만 9장(또는 10장)으로 교체 | `node concurrent.js` |

### 최종 `student-result.js` (7장 전체 코드)

```javascript
function getStudent(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("학생 정보를 가져오지 못했습니다."));
        return;
      }

      resolve("한코딩");
    }, 1000);
  });
}

async function main() {
  console.log("학생 정보를 불러오는 중입니다.");

  try {
    const student = await getStudent(false);

    console.log("받은 학생:", student);
  } catch (error) {
    console.log("오류:", error.message);
  } finally {
    console.log("학생 정보 요청 처리를 마쳤습니다.");
  }
}

main();
```

성공한 경우:

```text
학생 정보를 불러오는 중입니다.
받은 학생: 한코딩
학생 정보 요청 처리를 마쳤습니다.
```

실패한 경우 (`getStudent(true)`로 변경):

```text
학생 정보를 불러오는 중입니다.
오류: 학생 정보를 가져오지 못했습니다.
학생 정보 요청 처리를 마쳤습니다.
```

### 직접 바꿔보기 (강의의 ✍️ 항목)
- **3장**: 학생 이름을 바꾸고, 지연 시간을 2초로 바꾸고, 요청 뒤에 출력문을 추가해 실행 순서를 확인한다.
- **4장**: 호출 값을 바꿔 성공 결과와 오류 처리를 각각 확인한다.
- **7장**: 성공과 실패를 각각 실행하고, 두 경우 모두 마지막 문장이 출력되는지 확인한다.

> 💡 보충: 노션의 4장 "직접 바꿔보기"는 "`getStudent(false)`로 바꾸면 성공 → 다시 `true`로 바꿔 오류 확인"이라고 적혀 있는데, 4장 함수(`shouldSuccess`) 기준으로는 **반대**다. `true` → `받은 학생: 한코딩`, `false` → `오류: …`. 반대로 7장 함수(`shouldFail`)는 `true`가 실패다. 매개변수 이름을 보고 판단한다.

### 실행이 안 될 때 확인하기

| 증상 | 확인할 내용 |
|---|---|
| 결과가 `undefined` | 타이머 콜백에서만 `return`하고 있는지 |
| Promise 객체가 출력됨 | 최종 결과를 `await` 또는 `then`으로 받았는지 |
| `await` 문법 오류 | 이번 파일에서 `async` 함수 안에 작성했는지 |
| 오류가 처리되지 않음 | `await`를 `try` 안에서 실행했는지, `catch`를 연결했는지 |
| 두 작업에 약 2초 소요 | 두 번째 작업을 첫 `await` 뒤에 시작했는지 |
| 함수가 실행되지 않음 | 정의만 하고 `main()` 호출을 빠뜨렸는지 |

이번 실습에서는 `await`를 **`async function` 안에** 작성한다.

## 헷갈리기 쉬운 점
- **콜백 안의 `return`은 바깥 함수의 반환값이 아니다.** 타이머 콜백에서 `return`해도 `getStudent()`는 `undefined`를 반환한다.
- **Promise를 받은 것 ≠ 결과를 받은 것.** `getStudent()`가 돌려주는 건 Promise이고, 학생 정보는 `.then()`이나 `await`로 꺼낸다.
- **Promise 상태는 한 번 정해지면 바뀌지 않는다** (이행 또는 거부).
- **`reject()`를 불러도 함수가 끝나지 않는다.** 뒤의 성공 코드를 막으려면 `return`을 쓴다.
- **`resolve`·`reject`는 이름이 아니라 위치로 역할이 정해진다.** 수업 코드처럼 `성공`·`실패`로 써도 첫 번째가 성공, 두 번째가 실패.
- **`await`는 그 async 함수 안의 다음 줄만 기다린다.** 바깥 코드는 먼저 실행된다 (`1 → 2 → 3` 예제).
- **거부된 Promise를 `await`하면 그 자리에서 오류가 난다.** `try/catch`로 감싼다.
- **`async`를 붙인다고 다른 스레드에서 실행되지 않는다.** 긴 반복문은 여전히 스레드를 점유한다.
- **`Promise.all()`은 별도 스레드 실행이 아니다.** 함께 "시작"해서 기다리는 시간이 겹칠 뿐이다.
- **`Promise.all()` 결과 순서 = 전달한 순서**(완료 순서 아님). 하나라도 거부되면 전체가 거부되고, 나머지 작업은 자동 취소되지 않는다.
- **의존 관계가 있으면 함께 시작할 수 없다.** 로그인 → 사용자 ID → 게시글 조회처럼 앞 결과가 필요하면 차례로 `await`한다.
- **`await`가 비동기 작업을 만드는 게 아니다.** 작업은 함수 호출 시 시작되고, `await`는 그 결과를 받을 뿐이다.
- **`fetch()`는 404·500에 자동 거부되지 않는다.** `response.ok`를 확인한다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 나중에 결과를 주는 함수 만들기 | `return new Promise((resolve, reject) => { … })` | 타이머 안에서 `resolve("한코딩")` |
| 성공 결과 전달 | `resolve(값)` | `resolve("한코딩");` |
| 실패 전달 | `reject(new Error("…"))` + `return` | `reject(new Error("학생 정보를 가져오지 못했습니다.")); return;` |
| 성공 결과 받기 (then) | `.then((값) => { … })` | `getStudent().then((student) => …)` |
| 실패 받기 (catch) | `.catch((error) => { … })` | `console.log("오류:", error.message);` |
| 결과를 기다렸다 받기 | `async function` + `await` | `const student = await getStudent(true);` |
| 성공·실패·마무리 | `try / catch / finally` | `finally`에서 "요청 처리를 마쳤습니다." |
| 실행 시간 재기 | `console.time(이름)` / `console.timeEnd(이름)` | `console.time("순차 실행");` |
| 독립 작업 함께 시작 | `await Promise.all([p1, p2])` | 결과는 `[결과1, 결과2]` (전달 순서) |
| 앞 결과가 필요한 작업 | `await`를 차례로 | `response` → `response.json()` |

## 확인 문제
강의에 별도 "💬 확인하기"는 없어서, 본문의 질문형 제목과 "직접 바꿔보기"에서 뽑았다.

<details><summary>Q. (강의 질문) 타이머 콜백 안에서 `return "한코딩"`을 했는데 `const student = getStudent();`가 `undefined`인 이유는?</summary>

`return "한코딩"`은 타이머에 전달한 **콜백 함수의 반환값**이지 `getStudent()`의 반환값이 아니다. `getStudent()`는 타이머만 예약하고 반환값 없이 끝나므로 `undefined`가 저장된다.
</details>

<details><summary>Q. (강의 질문) Promise는 무엇이고, 상태 세 가지는?</summary>

나중에 완료될 작업의 결과를 다루는 객체. 대기(pending) — 결과를 기다리는 중, 이행(fulfilled) — 성공 결과가 준비됨, 거부(rejected) — 실패 이유가 전달됨. 이행·거부로 결정되면 다시 바뀌지 않는다.
</details>

<details><summary>Q. 3장 코드(`.then()` 사용)의 출력 순서는?</summary>

`학생 정보 요청` → `요청 후 다른 작업` → (약 1초 뒤) `받은 학생: 한코딩`. Promise를 반환받은 뒤 바깥 코드가 계속 실행되고, `resolve` 후에 `then` 함수가 실행된다.
</details>

<details><summary>Q. `reject()`를 호출하면 그 함수의 나머지 코드는 실행되지 않나?</summary>

실행된다. `reject()` 호출만으로 현재 함수가 중단되지 않는다. 그래서 실패 처리 후 성공 코드(`resolve`)를 실행하지 않도록 `return`으로 콜백을 끝낸다.
</details>

<details><summary>Q. `.then()` 방식과 `async/await` 방식은 무엇이 같고 무엇이 다른가?</summary>

둘 다 Promise의 결과를 처리한다. `async/await`는 작업 흐름을 위에서 아래로 읽기 쉽게 쓰는 방법이다. `async` 함수는 Promise를 반환하고, 그 안에서 `await`로 성공 결과를 받는다.
</details>

<details><summary>Q. (강의 질문) `await`는 어디를 기다리게 할까? 6장 코드의 출력 순서는?</summary>

`main` 안에서 결과 이후에 이어질 코드만 기다리게 한다. 프로그램 전체를 멈추거나 실행 스레드를 붙잡지 않는다. 순서: `1. 학생 정보 요청` → `2. main 함수 밖의 작업` → (지연 후) `3. 받은 학생: 한코딩`.
</details>

<details><summary>Q. 함수에 `async`를 붙이면 그 안의 오래 걸리는 계산이 다른 스레드에서 실행되나?</summary>

아니다. `async`는 함수가 Promise를 반환하게 할 뿐이다. 오래 걸리는 반복문은 여전히 현재 JavaScript 실행 스레드를 점유한다.
</details>

<details><summary>Q. 7장 코드에서 `getStudent(true)`로 바꾸면 출력은? `finally`는 언제 실행되나?</summary>

`학생 정보를 불러오는 중입니다.` → `오류: 학생 정보를 가져오지 못했습니다.` → `학생 정보 요청 처리를 마쳤습니다.` `finally`는 성공·실패와 관계없이 마지막에 실행된다 (7장 함수는 `shouldFail`이라 `true`가 실패).
</details>

<details><summary>Q. 1초짜리 작업 두 개를 `await`로 차례로 기다릴 때와 `Promise.all()`로 기다릴 때 전체 시간은? 왜 다른가?</summary>

순차는 약 2초, `Promise.all()`은 약 1초. 순차는 두 번째 작업이 첫 `await`가 끝난 뒤 시작하고, `Promise.all()`은 배열을 만들며 두 작업을 먼저 함께 시작해 기다리는 시간이 겹친다. 별도 스레드에서 병렬 실행하는 것은 아니다.
</details>

<details><summary>Q. `Promise.all([getStudent("한코딩", 2000), getStudent("이학생", 500)])`의 결과 배열 순서는?</summary>

`["한코딩", "이학생"]` (Node 출력은 `[ '한코딩', '이학생' ]`). 완료 로그는 `이학생`이 먼저지만, 결과 배열은 **전달한 순서**를 따른다.
</details>

<details><summary>Q. `Promise.all()`에 넣은 Promise 중 하나가 실패하면?</summary>

`Promise.all()`도 거부된다. 다른 작업을 자동으로 취소하지는 않는다. 실제 요청에서는 `try/catch`로 처리한다.
</details>

<details><summary>Q. (강의 질문) 모든 작업을 함께 실행하면 좋을까? 로그인 후 그 사용자의 게시글을 조회하는 경우는?</summary>

아니다. 게시글 조회에 로그인 결과의 사용자 ID가 필요하므로 차례로 실행해야 한다. 서로 독립적일 때만 함께 시작하는 방식을 고려한다. 빠른 방식보다 데이터의 의존 관계를 먼저 본다.
</details>

<details><summary>Q. `fetch()` 코드에서 `await`가 두 번 나오는 이유와, 404 응답 시 처리 방법은?</summary>

첫 `await`는 응답 객체를, 두 번째 `await`는 `response.json()`의 본문 처리 결과(학생 배열)를 기다린다. `response.json()`은 `response`가 있어야 하므로 앞 결과가 필요한 관계다. `fetch()`는 404·500만으로 거부되지 않으므로 `if (!response.ok) throw new Error(…)`로 처리한다.
</details>

<details><summary>Q. `const promise = getStudent(false);`와 `const student = await promise;`는 각각 무엇을 하나?</summary>

앞 줄은 작업을 시작하고 Promise를 받는다. 뒷줄은 그 Promise의 성공 결과를 받아 쓴다. `await`가 비동기 작업 자체를 만드는 것은 아니다.
</details>

<details><summary>Q. 결과 대신 Promise 객체가 출력되거나, `await`에서 문법 오류가 난다. 무엇을 확인하나?</summary>

Promise 객체 출력 → 최종 결과를 `await`나 `then`으로 받았는지. `await` 문법 오류 → `async` 함수 안에 썼는지. 함수가 아예 실행 안 되면 `main()` 호출을 빠뜨렸는지 본다.
</details>

## 완료 체크
- [ ] 타이머 콜백의 반환값과 바깥 함수의 반환값을 구분했다.
- [ ] Promise로 나중에 준비되는 결과를 전달했다.
- [ ] 성공과 실패를 각각 처리했다.
- [ ] 같은 작업을 async/await로 작성했다.
- [ ] await가 프로그램 전체를 멈추는 것은 아니라는 점을 확인했다.
- [ ] 순차 실행과 동시 진행의 소요 시간을 비교했다.
- [ ] 작업 사이의 의존 관계에 따라 실행 방식을 선택했다.

## 질문 노트

_아직 없음_
