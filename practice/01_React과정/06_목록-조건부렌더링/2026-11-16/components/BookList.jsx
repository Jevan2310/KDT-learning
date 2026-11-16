import BookCard from "./BookCard";

const books = [
    {id:1, title: "홍길동전", author: "신원미상", pages: 385},
    {id:2, title: "장금이", author: "개똥이", pages: 225},
    {id:3, title: "콩쥐팥쥐", author: "신원미상", pages: 35},
]

const BookList = () => {
    const bookCard = books.map((book)=>{
            return <BookCard key={book.id} 
            id={book.id} 
            title={book.title} 
            author={book.author}
            pages={book.pages}
            />
        })
    return (
        <section>
            <h2>읽을 책</h2>
            {bookCard}
        </section>
    )
}

export default BookList;