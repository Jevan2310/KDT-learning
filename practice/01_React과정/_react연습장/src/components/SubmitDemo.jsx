import { useState } from "react";

function SubmitDemo() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("아직 제출 안 함");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (trimmedMessage === "") {
      setResult("⚠️ 빈 내용은 보낼 수 없어요");
      return;
    }

    setResult("보낸 메시지: " + trimmedMessage);
    setMessage("");
  }

  return (
    <section>
      <h2>② 폼 제출</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="demo-message">한 줄 메시지 </label>
        <input
          id="demo-message"
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit">보내기</button>
        <button type="button" onClick={() => setMessage("")}>지우기</button>
      </form>

      <p>{result}</p>
    </section>
  );
}

export default SubmitDemo;
