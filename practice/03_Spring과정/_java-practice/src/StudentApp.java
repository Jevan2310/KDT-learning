import java.util.ArrayList;
import java.util.List;

public class StudentApp {

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
