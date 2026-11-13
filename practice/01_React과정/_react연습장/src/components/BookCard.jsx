
const BookCard = ({id, title, writer, pages}) =>{
    return <div className="card">
        <h3>{id}. {title}</h3>
        <p>{writer} · {pages}쪽</p>
    </div>
}

export default BookCard;