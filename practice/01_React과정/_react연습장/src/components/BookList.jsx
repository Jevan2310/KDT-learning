import BookCard from "./BookCard";

const books =[
    {id:1, title: "모던 자바스크립트", writer:"홍길동", pages:250},
    {id:2, title: "포스트 자바스크립트", writer:"김자바", pages:150},
    {id:3, title: "퓨처 자바스크립트", writer:"한코딩", pages:180},
    
]

const BookList = () =>{
    const bookCards = books.map((book)=>{
        return <BookCard key={book.id} id={book.id} title={book.title} 
        writer={book.writer} pages={book.pages}/>
    })
    return <section>
            <h2>읽을 책</h2>
            {bookCards}
        </section>
}

export default BookList; 