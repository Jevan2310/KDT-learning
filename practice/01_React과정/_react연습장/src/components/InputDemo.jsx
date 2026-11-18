import { useState } from "react";

function InputDemo() {
  const [name, setName] = useState("");

  return (
    <section>
      <h2>① 입력창과 state 연결</h2>

      <label htmlFor="demo-name">이름 </label>
      <input
        id="demo-name"
        type="text"
        placeholder="아무거나 입력해 보세요"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <p>미리보기: {name}</p>
      <p>글자 수: {name.length}자</p>
      {name === "" ? <p>아직 비어 있어요</p> : <p>안녕하세요, {name}님!</p>}

      <button type="button" onClick={() => setName("")}>지우기</button>
      <button type="button" onClick={() => setName("한코딩")}>"한코딩" 넣기</button>

      <hr />
      <label htmlFor="demo-locked">onChange 없는 입력창 </label>
      <input id="demo-locked" type="text" value="여기는 안 써져요" />
    </section>
  );
}

export default InputDemo;
