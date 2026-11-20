public class Basics {
    public static void main(String[] args) {
        String name = "한코딩";    // 문자열
        int age = 25;              // 정수
        boolean learning = true;   // 참·거짓
        double pi = 3.14;          // 실수

        System.out.println("이름: " + name);
        System.out.println("나이: " + age);
        System.out.println("학습 중: " + learning);
        System.out.println("원주율: " + pi);

        age = 26;                  // 값 바꾸기: 자료형을 다시 쓰지 않아요
        System.out.println("내년 나이: " + age);

        final String schoolName = "한코딩 스쿨";   // 다시 대입할 수 없어요
        System.out.println("학교: " + schoolName);
    }
}
