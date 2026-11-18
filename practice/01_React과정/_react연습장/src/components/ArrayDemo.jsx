import { useState } from "react";

function ArrayDemo() {
  const [snacks, setSnacks] = useState([
    { id: "snack-1", name: "초코칩", liked: false },
    { id: "snack-2", name: "감자칩", liked: true },
  ]);

  // 추가: 기존 항목을 펼치고 새 항목을 붙인 새 배열
  function handleAdd() {
    const newSnack = {
      id: crypto.randomUUID(),
      name: "새 과자 " + (snacks.length + 1),
      liked: false,
    };
    setSnacks((prevSnacks) => [...prevSnacks, newSnack]);
  }

  // 삭제: 그 id만 빼고 남긴 새 배열
  function handleDelete(snackId) {
    setSnacks((prevSnacks) =>
      prevSnacks.filter((snack) => snack.id !== snackId)
    );
  }

  // 수정: 그 id만 새 객체로 바꾼 새 배열
  function handleLike(snackId) {
    setSnacks((prevSnacks) =>
      prevSnacks.map((snack) => {
        if (snack.id === snackId) {
          return { ...snack, liked: !snack.liked };
        }
        return snack;
      })
    );
  }

  // 틀린 방법: 원본 배열을 직접 고침
  function handleWrongAdd() {
    snacks.push({ id: crypto.randomUUID(), name: "push로 넣은 과자", liked: false });
    setSnacks(snacks);
    console.log("push 후 배열:", snacks);
  }

  const likedCount = snacks.filter((snack) => snack.liked).length;

  return (
    <section>
      <h2>③ 배열 state 바꾸기</h2>
      <p>전체 {snacks.length}개 · 좋아요 {likedCount}개</p>

      <button type="button" onClick={handleAdd}>과자 추가</button>
      <button type="button" onClick={handleWrongAdd}>push로 추가 (틀린 방법)</button>

      {snacks.length === 0 ? (
        <p>과자가 하나도 없어요.</p>
      ) : (
        <ul>
          {snacks.map((snack) => (
            <li key={snack.id}>
              {snack.liked ? "❤️" : "🤍"} {snack.name}{" "}
              <button type="button" onClick={() => handleLike(snack.id)}>좋아요</button>
              <button type="button" onClick={() => handleDelete(snack.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ArrayDemo;
