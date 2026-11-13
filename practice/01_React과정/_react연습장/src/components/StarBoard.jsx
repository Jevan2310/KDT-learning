import { useState } from "react";

const members = [
  { id: 1, name: "한코딩", stars: 2 },
  { id: 2, name: "파이썬", stars: 0 },
  { id: 3, name: "자바", stars: 1 },
];

function StarBoard() {
  const [count, setCount] = useState(0);
  const starMembers = members.filter((member) => member.stars > 0);

  function handleCheer() {
    setCount(count + 1);
    console.log("응원:", count);
  }

  return (
    <section>
      <p>별 받은 사람 {starMembers.length}명</p>
      <p>응원 {count}번 {count && "🎉"}</p>
      <button type="button" onClick={handleCheer}>응원하기</button>
    </section>
  );
}

export default StarBoard;