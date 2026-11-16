
const BookCard = ({id, title, author, pages}) => {
    return (
        <div className="card">
            <h3>{id}. {title},</h3>
            <p>{author}, {pages}쪽</p>
        </div>
    )
}

export default BookCard;