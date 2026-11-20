public class Methods {

    // 두 정수를 받아 합을 돌려줘요
    public static int add(int num1, int num2) {
        return num1 + num2;
    }

    // 이름을 받아 인사 문장을 돌려줘요
    public static String createGreeting(String name) {
        return name + "님, 반갑습니다!";
    }

    // 돌려줄 값이 없어요 (void). 출력만 해요
    public static void printMenu() {
        System.out.println("1. 학생 등록");
        System.out.println("2. 학생 목록");
        System.out.println("0. 프로그램 종료");
    }

    public static void main(String[] args) {
        int result = add(10, 20);
        System.out.println(result);

        String message = createGreeting("한코딩");
        System.out.println(message);

        createGreeting("이학생");   // 돌려받은 값을 쓰지 않으면 아무것도 안 보여요

        printMenu();
    }
}
