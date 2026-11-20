public class StudentTest {
    public static void main(String[] args) {
        Student s1 = new Student(1, "한코딩", true);
        Student s2 = new Student(2, "이학생", false);

        System.out.println("번호: " + s1.getId());
        System.out.println("이름: " + s1.getName());
        System.out.println("학습 중: " + s1.isLearning());

        System.out.println("두 번째 학생: " + s2.getName());   // 객체마다 값이 따로예요

        s1.setName("파이썬");
        System.out.println("바꾼 이름: " + s1.getName());

        System.out.println(s1);   // toString()이 돌려준 글자가 찍혀요
    }
}
