const items =[
    {id:1, name:"감자", price:5000, count:5},
    {id:2, name:"우유", price:1500, count:4},
    {id:3, name:"고구마", price:4000, count:7},
    {id:4, name:"간장", price:2000, count:2},
]

export function ShoppingList(){
    const totals = items.map((item)=>{
        return item.price * item.count;
    })
    console.log(totals);
    return (
        <>
            <h2>장보기 {items.length}</h2>
            {items.map((item)=>{
                return <div className="card" key={item.id}>
                    <h3>{item.name}</h3>
                    <p>{item.price}원 x {item.count}개 = {item.price * item.count}원</p>
                </div>
            })}
            
        </>
    )
}
