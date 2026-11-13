import { useState } from "react";

function StepCounter() {
  const [count, setCount] = useState(0);

  function handleAdd() {
    setCount(count + 1);
  }

  return (
    <section>
      <h2>오늘 걸음 {count}보</h2>
      <button type="button" onClick={handleAdd}>+1</button>
      <button type="button" onClick={() => setCount(0)}>초기화</button>
    </section>
  );
}

export default StepCounter;
