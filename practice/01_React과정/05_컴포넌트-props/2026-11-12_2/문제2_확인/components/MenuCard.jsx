function MenuCard({name, price}) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>가격: {price}원</p>
      <p>사이즈업: {price + 500}원</p>
    </div>
  );
}

export default MenuCard;