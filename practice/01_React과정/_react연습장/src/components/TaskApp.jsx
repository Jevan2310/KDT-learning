import { useState } from "react";

function TaskApp() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([
    { id: "task-1", title: "HTML 복습하기", completed: true },
    { id: "task-2", title: "React 입력 폼 만들기", completed: false },
  ]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (trimmedTitle === "") {
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      completed: false,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setTitle("");
  }

  function handleDelete(taskId) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }

  function handleToggle(taskId) {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  }

  const remainingCount = tasks.filter((task) => !task.completed).length;

  return (
    <section>
      <h2>④ 할 일 앱 (전부 합친 것)</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">새로운 할 일 </label>
        <input
          id="task-title"
          type="text"
          placeholder="예: React 복습하기"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit">추가</button>
      </form>

      <p>전체 {tasks.length}개 · 남은 할 일 {remainingCount}개</p>

      {tasks.length === 0 ? (
        <p>등록된 할 일이 없습니다. 첫 번째 목표를 추가해 보세요.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                />
                {task.completed ? <s>{task.title}</s> : task.title}
              </label>{" "}
              <button type="button" onClick={() => handleDelete(task.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}

      {tasks.length > 0 && remainingCount === 0 && (
        <p>모든 학습 목표를 완료했습니다! 🎉</p>
      )}
    </section>
  );
}

export default TaskApp;
