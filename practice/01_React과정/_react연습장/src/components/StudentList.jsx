import { useEffect, useState } from "react";

// 컴포넌트
function StudentList() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      try {
        const response = await fetch(
          "http://localhost:3000/students"
        );

        if (!response.ok) {
          throw new Error(
            "학생 목록을 불러오지 못했습니다."
          );
        }

        const data = await response.json();

        if (!ignore) {
          setStudents(data);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setError(
            "학생 목록을 불러오지 못했습니다. 서버와 주소를 확인해주세요."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="student-list">
      <h2>학생 목록</h2>

      {isLoading ? (
        <p role="status">학생 목록을 불러오는 중입니다.</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : students.length === 0 ? (
        <p>등록된 학생이 없습니다.</p>
      ) : (
        <>
          <p>전체 학생: {students.length}명</p>

          <ul>
            {students.map((student) => (
              <li key={student.id}>
                {student.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default StudentList;
