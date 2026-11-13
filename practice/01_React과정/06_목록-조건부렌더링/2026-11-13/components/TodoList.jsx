const todos =[
    {id:1, title:"React 복습", minutes:20},
    {id:2, title:"map 연습", minutes:40},
    {id:3, title:"html 복습", minutes:10},
    {id:4, title:"Css 복습", minutes:15},
]

const TodoList = () => {
    return <section>
        <h2>오늘 할 일 {todos.length}개</h2>
        <ul>
            {todos.map((todo)=> {
                return <li key={todo.id}>{todo.title} - {todo.minutes}분</li>
            })}
        </ul>
    </section>
}

export default TodoList;