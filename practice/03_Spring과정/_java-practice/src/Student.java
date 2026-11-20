// 학생 한 명의 정보를 담는 클래스
public class Student {

    // 필드: 객체마다 따로 갖는 값
    private int id;
    private String name;
    private boolean learning;

    // 생성자: new Student(...)를 할 때 실행돼요
    public Student(int id, String name, boolean learning) {
        this.id = id;              // this.id = 이 객체의 필드, id = 전달받은 값
        this.name = name;
        this.learning = learning;
    }

    // getter: 필드 값을 밖에서 읽게 해 줘요
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isLearning() {  // boolean은 get 대신 is로 시작해요
        return learning;
    }

    // setter: 필드 값을 밖에서 바꾸게 해 줘요
    public void setName(String name) {
        this.name = name;
    }

    // System.out.println(객체)를 할 때 보여 줄 글자
    @Override
    public String toString() {
        return "Student{id=" + id + ", name='" + name + "', learning=" + learning + "}";
    }
}
