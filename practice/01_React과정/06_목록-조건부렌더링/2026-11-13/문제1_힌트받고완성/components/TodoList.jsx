
const todos = [
  { id: 1, title: "런닝", minutes: 30},
  { id: 2, title: "공부", minutes: 60},
  { id: 3, title: "휴식", minutes: 10},
  { id: 4, title: "티비시청", minutes: 20},
];



const TodoList = () => {
    return <section>
        <h2>오늘 할 일 {todos.length}개</h2>
        <ul>
            {todos.map((todo)=>(
                <li key = {todo.id}> {todo.title} - {todo.minutes}분</li>
            ))}        
        </ul>
    </section>;
}

export default TodoList;