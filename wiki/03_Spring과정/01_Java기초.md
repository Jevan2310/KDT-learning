# 01. 서버 개발에 필요한 Java 기초 — 학생 객체와 목록 만들기

> 과정: Spring과정 · [노션 원문](https://app.notion.com/p/414848f71c9b80bcad3af1cb4e4eb795) · 최종 갱신일: 2026-11-12

## 한눈에 보기
- Java는 JavaScript와 **다른 언어**다. 변수·조건문·반복문·함수 개념은 그대로 쓰지만, **변수마다 자료형(`String`, `int`, `boolean`)을 적고** JVM에서 실행한다.
- Java에서는 클래스 안에 쓴 함수를 **메서드**라고 부른다. 메서드는 **반환형·매개변수 자료형**을 적고, `return`(호출한 곳에 돌려주기)과 `System.out.println()`(콘솔 출력)은 다른 일이다.
- 학생 정보는 **`Student` 클래스**(필드 + 생성자 + getter)로 정의하고 `new Student(1, "한코딩", true)`로 객체를 만든다. 필드는 `private`으로 막고 getter로 읽는다 (캡슐화).
- 여러 학생은 **`List<Student>`** (`new ArrayList<>()`)에 담고 `add`·`size`·`get`·`remove`로 다루며, **향상된 for문**으로 하나씩 출력한다.
- 문자열 내용 비교는 `==`가 아니라 **`equals()`**, 재대입 막기는 **`final`**.

## 학습 목표
- Java와 JavaScript의 차이를 알아본다.
- 변수의 자료형을 지정한다.
- 메서드(클래스 안에 들어가 있는 함수)에 값을 전달하고 결과를 반환한다.
- 클래스와 객체로 학생 정보를 표현한다.
- 생성자와 getter를 사용한다.
- `List`에 학생을 추가하고 목록을 출력한다.

## 핵심 개념

### 1. Java와 JavaScript는 다른 언어
이름은 비슷하지만 서로 다른 프로그래밍 언어다.

| 구분 | JavaScript (동적 할당 언어) | Java (정적 할당 언어) |
|---|---|---|
| 변수 선언 예시 | `let name = "한코딩";` | `String name = "한코딩";` |
| 대표 실행 환경 | 브라우저, Node.js | JVM |
| 이번 과정의 사용처 | React·Node.js·Express | Spring Boot 백엔드 |
| 자료형 | 변수 선언 시 자료형을 직접 적지 않음 | 자료형을 명시하거나 정해진 규칙으로 추론 |

- JavaScript에서 배운 변수·조건문·반복문·함수의 개념은 Java에서도 활용할 수 있다. **다만 작성 문법과 실행 방법이 다르다.**

> 💡 보충: 보통 "동적 **타입** 언어 / 정적 **타입** 언어"라고 부른다. JavaScript는 `let x = 1; x = "글자";`처럼 같은 변수에 다른 종류의 값을 넣어도 되지만, Java는 `int x = 1;`로 선언하면 **정수만** 넣을 수 있고 다른 종류를 넣으면 실행 전(컴파일)에 오류가 난다. "정해진 규칙으로 추론"은 `var name = "한코딩";`처럼 오른쪽 값을 보고 자료형을 정하는 문법을 말한다.

### 2. JDK·JVM·IntelliJ 구분하기

| 도구 | 역할 |
|---|---|
| JDK (Java Development Kit) | Java 코드를 개발하고 실행하는 데 필요한 도구 모음 |
| JVM | Java 바이트코드를 실행하는 환경 |
| IntelliJ IDEA | 코드 작성·실행·오류 확인을 돕는 개발 도구 |

일반적인 Java 실행 흐름:

```text
Java 소스 코드
    ↓ 컴파일
바이트코드
    ↓ JVM에서 실행
실행 결과
```

- IntelliJ에서 실행 버튼을 누르면 필요한 빌드·실행 작업을 도와준다.
- 설치·JDK 설정은 [IntelliJ-JDK](../00_개발환경/IntelliJ-JDK.md) 참고.

### 3. 첫 Java 프로그램 — `main`이 시작점
IntelliJ에서 Java 프로젝트를 만들고(수업용 JDK 선택) `src` 폴더에 `Main` 클래스를 만든다.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("안녕하세요, 한코딩입니다!");
    }
}
```

`main` 메서드 옆의 실행 버튼을 누르면:

```text
안녕하세요, 한코딩입니다!
```

| 코드 | 역할 |
|---|---|
| `public class Main` | `Main` 클래스 선언 |
| `main` | 이번 프로그램의 실행 시작점 |
| `System.out.println()` | 콘솔에 출력하고 줄바꿈 |
| `;` | 문장의 끝. **Ctrl + Shift + Enter**를 누르면 커서가 어디 있든 그 줄 끝에 `;`를 붙여 준다 |

- `public static void main(String[] args)`는 지금은 **실행을 시작하기 위한 기본 형태**로 외워 둔다.
  - `public`: 외부에서 접근할 수 있다.
  - `static`: 객체를 만들지 않고 클래스에 속한 기능을 사용할 수 있다.
- **파일 이름과 public 클래스 이름을 일치시킨다** — `Main.java` ↔ `Main`.

> 💡 보충: 강의 본문에는 Mac 키가 "Command + Enter"로 적혀 있지만, [단축키 표](../00_개발환경/IntelliJ-단축키.md)의 "현재 구문 완성"은 **⌘ + ⇧ + Enter**다. 표 쪽이 IntelliJ 기본 키맵과 같다.

### 4. 변수와 자료형
Java에서는 변수에 저장할 값의 종류에 맞는 **자료형**을 앞에 쓴다.

```java
String name = "한코딩";
int age = 25;
boolean learning = true;
```

| 자료형 | 저장할 값 | 예시 |
|---|---|---|
| `String` | 문자열 | `"한코딩"` |
| `int` | 정수 | `25` |
| `boolean` | 참·거짓 | `true`, `false` |

- 문자열은 **큰따옴표**로 감싼다. 정수와 불리언은 따옴표 없이 쓴다.

```java
int age = 25;       // 정수
String text = "25"; // 문자열
```

수업 실습 코드 (`double` 실수 자료형도 함께 써 봤다):

```java
public class Main {

    public static void main(String[] args) {

        String name = "한코딩"; // 문자열
        int age = 34; // 숫자(정수)
        boolean learning = true; // 불린(불리언)
        double pi = 3.14;

        System.out.println(name);
        System.out.println(age);
        System.out.println(learning);
        System.out.println(pi);

    }
}

```

문자열과 값을 연결할 때는 `+`를 쓴다.

```java
System.out.println("이름: " + name);
System.out.println("나이: " + age);
System.out.println("학습 중: " + learning);
```

**값 변경하기** — 기존 변수의 값을 바꿀 때는 **자료형을 다시 쓰지 않는다.**

```java
int age = 25;
age = 26;
```

> 💡 보충: JavaScript와 비교
>
> | JavaScript | Java |
> |---|---|
> | `let name = "한코딩";` | `String name = "한코딩";` |
> | `let age = 25;` | `int age = 25;` |
> | `let learning = true;` | `boolean learning = true;` |
> | `const school = "…";` | `final String school = "…";` (5번) |
>
> JavaScript의 `let`/`const` 자리에 Java는 **자료형 이름**이 온다. 작은따옴표 `'한코딩'`은 Java에서 문자열이 아니다 (`'A'`처럼 글자 하나인 `char`용).

### 5. `final`로 재대입 막기
JavaScript의 `const`와 비슷하게, Java에서는 `final`로 재대입을 제한한다.

```java
final String schoolName = "한코딩 스쿨";
```

다음 코드는 오류다.

```java
schoolName = "다른 학교";
```

- 단, `final` 변수가 객체를 가리키면 **그 객체 내부의 변경까지 막는 것은 아니다.**

```java
final List<Student> students = new ArrayList<>();
```

- 다른 목록으로 **재대입은 못 하지만**, 같은 목록에 학생을 **추가·삭제는 할 수 있다.**

> 💡 보충: JavaScript에서 `const arr = [];`로 만든 배열에 `arr.push(1)`은 되지만 `arr = [2]`는 안 되는 것과 같은 원리다.

### 6. 메서드로 동작 묶기
Java에서는 **클래스 안에 작성한 함수를 메서드**라고 부른다.

```java
public class Main {

    public static int add(int num1, int num2) {
        return num1 + num2;
    }

    public static void main(String[] args) {

        int result = add(10, 20);

        System.out.println(result);
    }
}

```

수업 화면(IntelliJ)에서는 위 코드의 `int result = add(10, 20);` 줄에 **중단점(줄 번호 자리의 빨간 점)** 을 찍어 둔 상태였다. 디버그 실행으로 `add` 호출 흐름을 따라가 볼 수 있다 ([단축키 — 디버깅](../00_개발환경/IntelliJ-단축키.md)).

```java
public static String createGreeting(String name) {
    return name + "님, 반갑습니다!";
}
```

| 부분 | 의미 |
|---|---|
| `String` | 반환할 값의 자료형 |
| `createGreeting` | 메서드 이름 |
| `String name` | 전달받을 문자열 매개변수 |
| `return` | 결과를 호출한 곳으로 반환 |

실습 코드:

```java
public class Main {

    public static String createGreeting(String name) {
        return name + "님, 반갑습니다!";
    }

    public static void main(String[] args) {
        String message = createGreeting("한코딩");

        System.out.println(message);
    }
}
```

```text
한코딩님, 반갑습니다!
```

#### 반환과 출력은 다르다
- `return name + "님, 반갑습니다!";` → 호출한 곳에 값을 **돌려준다.**
- `System.out.println(message);` → 값을 콘솔에 **출력한다.**
- **값을 반환했다고 콘솔에 자동으로 출력되지는 않는다.**

#### 반환값이 없으면 `void`

```java
public class Main {

    public static void printAddNum(int num1, int num2) {
        System.out.println(num1 + num2);
    }
    
    public static void printMenu() {
        System.out.println("1. 학생 등록");
        System.out.println("2. 학생 목록");
        System.out.println("0. 프로그램 종료");
    }

    public static void main(String[] args) {

        // 10과 20을 더해서 출력하겠다.
        printAddNum(10, 20);
        
        // 메뉴 출력이 끝
        printMenu();
        
    }
}

```

- `void`는 **반환할 값이 없다**는 뜻이다.

> 💡 보충: JavaScript `function add(a, b) { return a + b; }`와 같은 일을 하지만, Java는 **반환형(`int`)과 매개변수 자료형(`int a`)** 을 반드시 적는다. 반환형과 다른 종류의 값을 `return`하면 오류다. 지금 `main`과 같은 클래스에 쓰는 메서드는 `main`이 `static`이라 `static`을 붙여 호출한다.

### 7. `Student` 클래스 만들기 — 필드, setter
JavaScript에서는 객체를 바로 만들었다.

```javascript
const student = {
  id: 1,
  name: "한코딩",
  learning: true
};
```

이번 Java 예제에서는 **먼저 `Student` 클래스를 정의한 뒤** 객체를 만든다. `Main.java`와 같은 `src` 폴더에 `Student.java`를 만든다.

```text
src
├─ Main.java
└─ Student.java
```

수업에서 처음 만든 `Student.java` (필드 + `id`의 getter·setter):

```java
// 학생 정보를 보관하기 위한 클래스
public class Student {

    // 필드
    private int id;
    private String name;
    private boolean learning;

    // 나이를 가지고 오는 메소드
    public int getId() {
        return id;
    }

    // 나이를 세팅하는 메소드
    public void setId(int id) {
        if (id < 0) {
            System.out.println("올바른 나이를 입력해 주세요.");
            this.id = 0;
        } else {
            this.id = id;
        }
    }

}

```

```java
public class Main {
    public static void main(String[] args) {

        // int, String, boolean ... double, float...

        // 객체 생성
        Student 학생 = new Student();
        학생.setId(-2);

        System.out.println(학생.getId());

    }
}
```

> 💡 보충: 주석과 안내 문구는 "나이"라고 되어 있지만 실제 필드는 `id`(학생 번호)다. 나이 예시를 번호에 옮기며 남은 것으로 보인다. 실행하면 `-2`는 음수라서 "올바른 나이를 입력해 주세요."가 출력되고, `id`에는 0이 저장되어 `0`이 출력된다. 이처럼 **setter는 값을 저장하기 전에 검사할 수 있다.** 변수 이름 `학생`처럼 한글도 쓸 수는 있지만 보통은 영어로 쓴다.

#### 필드

```java
private int id;
private String name;
private boolean learning;
```

- 클래스 안에서 객체의 정보를 저장하는 변수를 **필드**라고 한다.
- `private` 필드는 **다른 클래스에서 직접 접근하지 못하도록** 제한한다.

> 💡 보충: JavaScript 객체 리터럴 `{ id: 1, name: "한코딩" }`는 그 자체가 객체 하나다. Java의 클래스는 **객체의 설계도**라서, 설계도(`Student`)를 먼저 만들고 `new`로 실제 객체를 찍어 낸다. 설계도 하나로 학생 객체를 여러 개 만들 수 있다.

### 8. 생성자와 `this`, getter
필드들을 매개변수로 받는 **생성자**를 넣은 클래스:

```java
// 학생 정보를 보관하기 위한 클래스
public class Student {

    // 필드
    private int id;
    private String name;
    private boolean learning;

    public Student(int id, String name, boolean learning) {
        this.id = id;
        this.name = name;
        this.learning = learning;
    }


    // alt + insert (Ins)
    public int getId() {
        return id;
    }

    public void setId(int id) {
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

```java
public class Main {
    public static void main(String[] args) {

        // 객체 생성
        Student s1 = new Student(1, "한코딩", true);
        s1.setName("파이썬");

        System.out.println("안녕하세요 제 이름은 " + s1.getName() + "입니다.");

    }
}

```

- `// alt + insert (Ins)`: getter·setter를 [단축키](../00_개발환경/IntelliJ-단축키.md) Alt + Insert(⌘ + N)로 만들었다는 표시다.

**생성자**는 객체를 만들 때 **초기 정보를 설정**한다.
- 이름이 **클래스 이름과 같다.**
- `String`, `void` 같은 **반환형을 쓰지 않는다.**

**`this`**

```java
this.name = name;
```

| 표현 | 의미 |
|---|---|
| `this.name` | 현재 객체의 필드 |
| `name` | 생성자가 전달받은 매개변수 |

→ 전달받은 이름을 **현재 객체의 이름 필드에 저장**한다.

**getter** — 외부에서 필드 값을 읽을 수 있도록 제공하는 메서드다.

```java
public String getName() {
    return name;
}
```

- 불리언은 `isLearning()` 형태로 쓴다.

> 💡 보충: 위 코드처럼 생성자를 직접 만들면, 7번의 `new Student()`(인자 없음)는 더 이상 쓸 수 없다. 인자 없는 생성자는 클래스에 생성자가 **하나도 없을 때만** Java가 자동으로 만들어 주기 때문이다.

### 9. 객체 만들고 값 읽기 — 캡슐화

```java
public class Main {
    public static void main(String[] args) {
        Student student = new Student(
            1,
            "한코딩",
            true
        );

        System.out.println("번호: " + student.getId());
        System.out.println("이름: " + student.getName());
        System.out.println("학습 중: " + student.isLearning());
    }
}
```

```java
Student student = new Student(1, "한코딩", true);
```

| 부분 | 역할 |
|---|---|
| `Student` | 변수의 자료형 |
| `student` | 변수 이름 |
| `new Student(...)` | 생성자를 호출해 새 객체 생성 |

필드에 직접 접근하지 않고 getter를 호출한다 **(캡슐화)**.

```java
// name이 private이므로 다른 클래스에서 직접 접근할 수 없습니다.
student.name
```

```java
student.getName()
```

- 객체를 하나 더 만들면(`new Student(2, "이학생", false)`) **각 객체는 자신의 필드 값을 따로 가진다.**

#### `toString()` — 객체를 출력할 때 필드 전체 보기

```java
// 학생 정보를 보관하기 위한 클래스
public class Student {

    // 필드
    private int id;
    private String name;
    private boolean learning;

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", learning=" + learning +
                '}';
    }

    public Student(int id, String name, boolean learning) {
        this.id = id;
        this.name = name;
        this.learning = learning;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

> 💡 보충: `toString()`이 있으면 `System.out.println(student);`가 `Student{id=1, name='한코딩', learning=true}`처럼 필드 값을 보여 준다. 없으면 `Student@1b6d3586` 같은 알아보기 어려운 값이 나온다. `toString()`도 Alt + Insert(⌘ + N) 메뉴에서 만들 수 있다.

### 10. `List`로 여러 학생 관리하기

```java
List<Student> students = new ArrayList<>();
```

| 표현 | 의미 |
|---|---|
| `List` | 순서가 있는 목록을 다루는 인터페이스 |
| `<Student>` | 목록에 담을 요소의 자료형 |
| `ArrayList` | 이번에 사용할 List 구현 클래스 |
| `new ArrayList<>()` | 새 목록 생성 |

- 인터페이스·구현 클래스의 상세 설계는 지금 외우지 않아도 된다. **`List<Student>` = 학생 객체를 담는 목록, `ArrayList` = 그 목록을 만드는 방법**으로 쓴다.

**import** — 다른 패키지의 클래스를 쓸 때 `import`로 가져온다. `Main.java`의 클래스 선언 위에 쓴다.

```java
import java.util.ArrayList;
import java.util.List;
```

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();

        students.add(new Student(1, "한코딩", true));
        students.add(new Student(2, "이학생", false));
        students.add(new Student(3, "박학생", true));

        System.out.println("전체 학생: " + students.size() + "명");

        Student first = students.get(0);

        System.out.println("첫 번째 학생: " + first.getName());
    }
}
```

**JavaScript 배열과 비교**

| 작업 | JavaScript 배열 | Java List |
|---|---|---|
| 추가 | `students.push(student)` | `students.add(student)` |
| 개수 | `students.length` | `students.size()` |
| 첫 항목 | `students[0]` | `students.get(0)` |
| 인덱스로 삭제 | `students.splice(0, 1)` | `students.remove(0)` |

- Java의 List도 **인덱스는 `0`부터** 시작한다.

> 💡 보충: JavaScript 배열에는 숫자·문자열·객체를 섞어 넣을 수 있지만, `List<Student>`에는 **`Student` 객체만** 넣을 수 있다 (`<>` 안의 자료형). `<Student>`를 빼먹으면 `get(0)`의 결과로 `getName()`을 바로 부를 수 없다.

### 11. 반복문으로 목록 출력하기 — 향상된 for문

```java
for (Student student : students) {
    System.out.println(student.getName());
}
```

- **"`students`의 각 학생을 `student`라는 이름으로 사용한다"** 고 읽는다.

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {

        // 이 리스트에는 학생 객체만 넣을 수 있습니다.
        List<Student> students = new ArrayList<>();

        students.add(new Student(1, "한코딩", true));
        students.add(new Student(2, "파이썬", true));
        students.add(new Student(3, "코틀린", true));

        // 향상된 for문
        for (Student student : students) {
            System.out.println(student.getId() + ". " + student.getName()); // 1. 한코딩
        }

    }
}

```

```text
1. 한코딩
2. 파이썬
3. 코틀린
```

> 💡 보충: JavaScript의 `for (const student of students) { … }`와 같은 모양이다. Java는 `of` 대신 `:`를 쓰고, 변수 앞에 자료형(`Student`)을 적는다.

#### 조건에 맞는 학생만 출력하기
Java에서도 `if`의 조건이 참일 때 중괄호 안의 코드를 실행한다.

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {

        // 이 리스트에는 학생 객체만 넣을 수 있습니다.
        List<Student> students = new ArrayList<>();

        students.add(new Student(1, "한코딩", true));
        students.add(new Student(2, "파이썬", false)); // 학습을 하고 있지 않은 학생
        students.add(new Student(3, "코틀린", true));

        // 향상된 for문
        for (Student student : students) {
            if (student.getLearning()) {
                System.out.println(student.getName() + " — 학습 중");
            } else {
                System.out.println(student.getName() + " — 미학습");
            }
        }

    }
}

```

> 💡 보충: 이 코드는 그대로 실행하면 **컴파일 오류**가 난다. `Student` 클래스의 불리언 getter 이름은 `getLearning()`이 아니라 **`isLearning()`** 이다 (8번). `if (student.isLearning())`로 고쳐야 한다. 13번 종합 실습 코드는 `isLearning()`을 쓴다.

### 12. 문자열 비교는 `equals()`로
JavaScript에서는 문자열 값을 `===`로 비교했다. Java에서 **문자열의 내용**을 비교할 때는 `equals()`를 쓴다.

```java
String name = "한코딩";

if ("한코딩".equals(name)) {
    System.out.println("한코딩 학생을 찾았습니다.");
}
```

- Java의 `==`는 객체를 비교할 때 **같은 객체를 가리키는지** 판단한다. 문자열 내용 비교에 쓰지 않는다.
- 비교할 문자열을 **앞에** 쓰면(`"한코딩".equals(name)`) `name`이 `null`이어도 안전하게 비교할 수 있다.

> 💡 보충: `null`은 "가리키는 객체가 없음"이다. `name.equals("한코딩")`은 `name`이 `null`이면 오류(NullPointerException)가 나지만, `"한코딩".equals(name)`은 `false`가 될 뿐이다.

### 13. `Scanner`로 입력 받기
강의 중간에 추가된 내용(노션 제목 "00. Scanner 객체를 통한 입력 받기")이다. 콘솔에서 값을 입력받는다.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        // 스캐너 객체를 생성
        Scanner scn = new Scanner(System.in);

        System.out.print("정수:");
        int num = scn.nextInt(); // 정수 입력 10

        scn.nextLine(); // enter

        System.out.print("이름:");
        String str = scn.nextLine(); // 문자열

        System.out.println("입력한 숫자:" + num);
        System.out.println("입력한 문자:" + str);

    }
}
```

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        
        Scanner scn = new Scanner(System.in);

        for (int a = 0; a < 3; a++) {
            System.out.print("이름:");
            String name = scn.nextLine();

            System.out.print("나이:");
            int age = scn.nextInt();

            System.out.print("점수:");
            int score = scn.nextInt();

            scn.nextLine();
        }
    }
}

```

| 코드 | 역할 |
|---|---|
| `new Scanner(System.in)` | 키보드 입력을 읽는 객체 생성 (`import java.util.Scanner;` 필요) |
| `nextInt()` | 정수 하나 읽기 |
| `nextLine()` | 한 줄(문자열) 읽기 |
| `System.out.print()` | 줄바꿈 없이 출력 (`println`은 줄바꿈) |

> 💡 보충: `nextInt()`는 숫자만 읽고 **Enter(줄바꿈)는 남겨 둔다.** 바로 `nextLine()`을 부르면 남은 Enter를 읽어 빈 문자열이 된다. 그래서 수업 코드는 `nextInt()` 뒤에 `scn.nextLine(); // enter`로 남은 줄바꿈을 버린다.

### 정리

| 개념 | 핵심 |
|---|---|
| 자료형 | 변수에 저장할 값의 종류 |
| 메서드 | 클래스 안에서 동작을 정의 |
| `return` | 호출한 곳으로 결과 반환 |
| 클래스 | 객체의 정보와 기능 정의 |
| 객체 | 클래스를 바탕으로 생성한 개별 대상 |
| 생성자 | 객체 생성 시 초기 정보 설정 |
| `this` | 현재 객체 |
| getter | 필드 값을 읽는 메서드 |
| `List<Student>` | 학생 객체 목록 |
| `final` | 변수 재대입 제한 |

## 실습 정리

### 만든 것
학생 3명을 `List<Student>`에 담고, 인사 문장 → 전체 학생 목록 → 학습 중인 학생 → 전체 학생 수를 콘솔에 출력하는 프로그램.

### 단계 흐름
1. Java 프로젝트 생성, `src/Main.java`에서 첫 출력 (핵심 개념 3)
2. 변수·자료형 출력 (4) → `final` (5)
3. `createGreeting` 메서드로 인사 문장 반환 (6)
4. `src/Student.java` 작성: 필드 → 생성자 → getter (7~8)
5. `Main`에서 `new Student(...)`로 객체를 만들고 getter로 읽기 (9)
6. `List<Student>`에 담고 향상된 for문·`if`로 출력 (10~11)

### 파일 위치
`Main.java`와 `Student.java`는 **같은 폴더(`src`)** 에 두고, 두 파일 모두 **`package` 선언 없이** 작성한다. 기존 프로젝트에서 패키지를 쓴다면 두 파일의 패키지 선언을 맞춘다.

### 최종 코드 (종합 실습)

**`src/Student.java`**

```java
public class Student {
    private int id;
    private String name;
    private boolean learning;

    public Student(int id, String name, boolean learning) {
        this.id = id;
        this.name = name;
        this.learning = learning;
    }

    public int getId() {
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

**`src/Main.java`**

```java
import java.util.ArrayList;
import java.util.List;

public class Main {

    public static String createGreeting(String name) {
        return name + "님, 반갑습니다!";
    }

    public static void printStudents(List<Student> students) {
        System.out.println("\n[학생 목록]");

        if (students.isEmpty()) {
            System.out.println("등록된 학생이 없습니다.");
            return;
        }

        for (Student student : students) {
            System.out.println(
                    student.getId() + ". " + student.getName()
            );
        }
    }

    public static void main(String[] args) {
        final List<Student> students = new ArrayList<>();

        students.add(new Student(1, "한코딩", true));
        students.add(new Student(2, "이학생", false));
        students.add(new Student(3, "박학생", true));

        String message = createGreeting("한코딩");

        System.out.println(message);

        printStudents(students);

        System.out.println("\n[학습 중인 학생]");

        for (Student student : students) {
            if (student.isLearning()) {
                System.out.println(student.getName());
            }
        }

        System.out.println("\n전체 학생: " + students.size() + "명");
    }
}
```

**`printStudents` 읽기**
- 학생 목록을 전달받아 콘솔에 출력한다.
- 반환할 값이 없으므로 `void`.
- `students.isEmpty()`는 목록이 비었는지 확인한다. 비었으면 안내 문구를 출력하고 `return;`으로 메서드를 끝낸다.

> 💡 보충: 실행 결과 (강의에 없어 코드대로 정리). `\n`은 줄바꿈이라 각 제목 앞에 빈 줄이 생긴다.
> ```text
> 한코딩님, 반갑습니다!
>
> [학생 목록]
> 1. 한코딩
> 2. 이학생
> 3. 박학생
>
> [학습 중인 학생]
> 한코딩
> 박학생
>
> 전체 학생: 3명
> ```

### 직접 바꿔보기 (미션)
- [ ] 출력할 이름을 바꾸고, 소개 문장을 한 줄 더 출력한다.
- [ ] 학생 번호를 저장할 `int` 변수를 만들고, 이름과 학생 번호를 한 문장으로 출력한다.
- [ ] 두 정수를 받아 합계를 반환하는 `add(int first, int second)` 메서드를 만들고 `main`에서 호출해 출력한다.
- [ ] 학생 객체를 하나 더 만들어(`new Student(2, "이학생", false)`) 두 객체의 이름을 각각 출력한다.
- [ ] 목록에 학생을 추가하고, 특정 학생의 학습 여부를 생성자 인자로 바꿔 전체 목록과 학습 중인 목록의 차이를 확인한다.
- [ ] 종합 실습에 학습 여부가 `true`인 학생을 추가하고 전체 학생 수·학습 중인 학생 출력을 확인한다.
- [ ] `students.remove(0)`으로 첫 학생을 삭제한 뒤 목록을 다시 출력한다. → `remove(0)`은 ID가 0인 학생이 아니라 **현재 목록의 첫 번째 항목**을 삭제한다.

## 헷갈리기 쉬운 점
- **Java ≠ JavaScript.** 개념은 이어지지만 문법과 실행 방법(JVM)이 다르다.
- **public 클래스 이름 = 파일 이름.** `Main` ↔ `Main.java`, `Student` ↔ `Student.java`.
- **문장 끝 `;`를 빠뜨리지 않는다.**
- **문자열은 큰따옴표.** `"25"`는 문자열, `25`는 정수.
- **값을 바꿀 때 자료형을 다시 쓰지 않는다.** `age = 26;` (⭕) / `int age = 26;` 을 같은 곳에 또 쓰면 중복 선언 오류.
- **`return` ≠ 출력.** 반환한 값은 받아서 `println`해야 보인다.
- **반환값이 없으면 `void`.**
- **생성자에는 반환형을 쓰지 않고, 이름은 클래스 이름과 같다.**
- **`this.name`(필드)과 `name`(매개변수)은 다르다.**
- **`private` 필드는 `student.name`으로 못 읽는다.** getter(`getName()`, 불리언은 `isLearning()`)를 쓴다.
- **`List`·`ArrayList`를 쓰면 `import`가 필요하다.**
- **`remove(0)`은 0번 인덱스(첫 항목) 삭제**이지 ID 0 삭제가 아니다.
- **문자열 내용 비교는 `equals()`.** `==`는 같은 객체인지 비교한다.
- **`final` 목록에도 `add`는 된다.** 막는 것은 다른 목록으로의 재대입뿐이다.

**오류가 나면 확인할 것**

| 증상 | 확인할 내용 |
|---|---|
| 클래스 이름 관련 오류 | public 클래스 이름과 파일 이름 일치 여부 |
| `List`·`ArrayList`를 찾지 못함 | import 작성 여부 |
| `Student`를 찾지 못함 | 클래스 파일 위치와 이름 |
| 필드에 접근할 수 없음 | private 필드를 직접 읽고 있는지 |
| 생성자 호출 오류 | 인자의 개수·순서·자료형 |
| 반환형 관련 오류 | 메서드가 약속한 자료형의 값을 반환하는지 |
| 목록 인덱스 오류 | 존재하지 않는 위치에 접근했는지 |

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 프로그램 시작점 | `main` 메서드 | `public static void main(String[] args) { … }` |
| 콘솔 출력 (줄바꿈) | `System.out.println()` | `System.out.println("이름: " + name);` |
| 콘솔 출력 (줄바꿈 없음) | `System.out.print()` | `System.out.print("정수:");` |
| 문자열 변수 | `String` | `String name = "한코딩";` |
| 정수 변수 | `int` | `int age = 25;` |
| 참·거짓 변수 | `boolean` | `boolean learning = true;` |
| 실수 변수 | `double` | `double pi = 3.14;` |
| 재대입 막기 | `final` | `final String schoolName = "한코딩 스쿨";` |
| 값을 돌려주는 메서드 | 반환형 + `return` | `public static int add(int a, int b) { return a + b; }` |
| 돌려줄 값 없는 메서드 | `void` | `public static void printMenu() { … }` |
| 클래스 정의 | `class` + 필드 | `public class Student { private int id; … }` |
| 생성자 | 클래스 이름과 같은 메서드, 반환형 없음 | `public Student(int id, …) { this.id = id; }` |
| 객체 만들기 | `new` | `new Student(1, "한코딩", true)` |
| 필드 읽기 | getter | `student.getName()`, `student.isLearning()` |
| 필드 바꾸기 | setter | `s1.setName("파이썬");` |
| 객체 내용 출력 | `toString()` 재정의 | `@Override public String toString() { … }` |
| 목록 만들기 | `List` + `ArrayList` | `List<Student> students = new ArrayList<>();` |
| 목록 추가·개수·조회·삭제 | `add`·`size`·`get`·`remove` | `students.get(0)` |
| 목록이 비었는지 | `isEmpty()` | `if (students.isEmpty()) { … }` |
| 목록 하나씩 꺼내기 | 향상된 for문 | `for (Student student : students) { … }` |
| 문자열 내용 비교 | `equals()` | `"한코딩".equals(name)` |
| 다른 패키지 클래스 쓰기 | `import` | `import java.util.List;` |
| 키보드 입력 | `Scanner` | `int num = scn.nextInt();` |
| 줄 끝에 `;` 붙이기 | 현재 구문 완성 | Ctrl + Shift + Enter / ⌘ + ⇧ + Enter |
| getter·setter 생성 | 생성 메뉴 | Alt + Insert / ⌘ + N |

## 확인 문제

<details><summary>Q. Java와 JavaScript는 같은 언어인가? 변수 선언은 어떻게 다른가?</summary>

다른 언어다. JavaScript는 `let name = "한코딩";`처럼 자료형을 적지 않고 브라우저·Node.js에서 실행된다. Java는 `String name = "한코딩";`처럼 **자료형을 적고** JVM에서 실행된다. 변수·조건문·반복문·함수 개념은 Java에서도 쓸 수 있다.
</details>

<details><summary>Q. JDK, JVM, IntelliJ IDEA는 각각 무슨 역할인가?</summary>

- **JDK**: Java 코드를 개발하고 실행하는 데 필요한 도구 모음
- **JVM**: Java 바이트코드를 실행하는 환경 (소스 코드 → 컴파일 → 바이트코드 → JVM에서 실행)
- **IntelliJ IDEA**: 코드 작성·실행·오류 확인을 돕는 개발 도구
</details>

<details><summary>Q. `Main.java` 파일 안에 `public class Hello`라고 쓰면 어떻게 되는가?</summary>

오류가 난다. **파일 이름과 public 클래스 이름이 같아야** 한다 (`Main.java` ↔ `public class Main`).
</details>

<details><summary>Q. `int age = 25;`와 `String text = "25";`의 차이는? 이미 선언한 `age`를 26으로 바꾸려면?</summary>

`age`는 정수, `text`는 문자열이다 (큰따옴표). 값을 바꿀 때는 자료형을 다시 쓰지 않고 `age = 26;`이라고 쓴다.
</details>

<details><summary>Q. `final List<Student> students = new ArrayList<>();`로 선언한 목록에 `students.add(...)`를 할 수 있는가?</summary>

할 수 있다. `final`은 **다른 목록으로 재대입**하는 것만 막는다. 같은 목록에 추가·삭제하는 것은 가능하다.
</details>

<details><summary>Q. 메서드에서 값을 `return`하면 콘솔에 출력되는가?</summary>

아니다. `return`은 **호출한 곳에 값을 돌려줄 뿐**이다. 출력하려면 받은 값을 `System.out.println()`에 넘겨야 한다.
```java
String message = createGreeting("한코딩");
System.out.println(message);
```
</details>

<details><summary>Q. `public static String createGreeting(String name)`에서 `String`, `createGreeting`, `String name`은 각각 무엇인가? 반환값이 없으면 무엇을 쓰는가?</summary>

`String` = 반환할 값의 자료형, `createGreeting` = 메서드 이름, `String name` = 전달받을 문자열 매개변수. 반환값이 없으면 반환형 자리에 **`void`** 를 쓴다.
</details>

<details><summary>Q. 생성자는 일반 메서드와 무엇이 다른가?</summary>

객체를 만들 때(`new`) 실행되어 **초기 정보를 설정**한다. 이름이 **클래스 이름과 같고**, `String`·`void` 같은 **반환형을 쓰지 않는다.**
</details>

<details><summary>Q. 생성자 안의 `this.name = name;`은 무슨 뜻인가?</summary>

`this.name`은 **현재 객체의 필드**, `name`은 **생성자가 전달받은 매개변수**다. 전달받은 이름을 현재 객체의 이름 필드에 저장한다.
</details>

<details><summary>Q. `Main`에서 `student.name`으로 이름을 읽을 수 없는 이유와 대신 쓰는 방법은?</summary>

`name` 필드가 `private`이라 다른 클래스에서 직접 접근할 수 없다 (캡슐화). getter `student.getName()`을 호출한다. 불리언 필드 `learning`은 `student.isLearning()`.
</details>

<details><summary>Q. JavaScript 배열의 `push`, `length`, `[0]`, `splice(0, 1)`에 해당하는 Java List 코드는?</summary>

`add(…)`, `size()`, `get(0)`, `remove(0)`. 인덱스는 0부터 시작한다. `List`·`ArrayList`를 쓰려면 `import java.util.ArrayList;`, `import java.util.List;`가 필요하다.
</details>

<details><summary>Q. ID가 1, 2, 3인 학생이 순서대로 들어 있는 목록에서 `students.remove(0)`을 하면 누가 삭제되는가?</summary>

ID 1인 학생(**현재 목록의 첫 번째 항목**)이 삭제된다. `remove(0)`은 ID가 0인 학생을 찾는 것이 아니라 0번 인덱스를 삭제한다.
</details>

<details><summary>Q. `for (Student student : students)`는 어떻게 읽는가?</summary>

"`students`의 각 학생을 `student`라는 이름으로 사용한다." 목록에서 항목을 하나씩 꺼내 처리한다 (JavaScript의 `for...of`와 비슷).
</details>

<details><summary>Q. Java에서 문자열 내용이 같은지 비교할 때 `==` 대신 무엇을 쓰고, 왜 `"한코딩".equals(name)` 순서로 쓰는가?</summary>

`equals()`를 쓴다. `==`는 객체를 비교할 때 **같은 객체를 가리키는지**를 본다. 비교할 문자열을 앞에 쓰면 `name`이 `null`이어도 안전하게 비교할 수 있다.
</details>

<details><summary>Q. "`List`를 찾을 수 없다"는 오류가 나면 무엇을 확인하는가? 생성자 호출 오류라면?</summary>

`List`는 `import java.util.List;`(와 `ArrayList` import)를 썼는지 확인한다. 생성자 호출 오류는 **인자의 개수·순서·자료형**이 생성자와 맞는지 확인한다.
</details>

## 완료 체크
- [ ] Java 프로그램을 실행하고 콘솔에 출력했다.
- [ ] 자료형에 맞게 변수를 선언했다.
- [ ] 메서드에 값을 전달하고 결과를 반환했다.
- [ ] Student 클래스와 객체를 만들었다.
- [ ] 생성자와 getter를 사용했다.
- [ ] List에 학생을 추가하고 조회했다.
- [ ] 반복문과 조건문으로 학생 목록을 처리했다.

## 질문 노트

_아직 없음_
