const todos =[
    {id: 1, title: "React 복습", minutes: 30},
    {id: 2, title: "map 복습", minutes: 40},
    {id: 3, title: "useState 복습", minutes: 50},
    {id: 4, title: "html 복습", minutes: 10},
]

const TodoList = () => {
    return (
        <section>
            <h2>오늘 할 일 {todos.length}개</h2>
            <ul>
                {todos.map((todo)=>(
                    <li key={todo.id}>{todo.title} - {todo.minutes}분</li>
                ))}
            </ul>
        </section>
    )
}

export default TodoList;