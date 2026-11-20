import java.util.Scanner;

public class NameCheck {
    public static void main(String[] args) {
        Scanner scn = new Scanner(System.in);   // 키보드 입력을 읽는 객체

        System.out.print("이름: ");
        String name = scn.nextLine();           // 한 줄 읽기 (파이썬 input())

        System.out.println("== 로 비교: " + (name == "한코딩"));
        System.out.println("equals로 비교: " + "한코딩".equals(name));

        System.out.print("나이: ");
        int age = scn.nextInt();                // 정수 읽기 (파이썬 int(input()))
        System.out.println("내년 나이: " + (age + 1));
    }
}
