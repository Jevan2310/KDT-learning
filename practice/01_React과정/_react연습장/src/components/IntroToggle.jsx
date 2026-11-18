import { useState } from "react";

const IntroToggle = () => {
  const [isOpen, setIsOpen] = useState(false);   // 처음엔 닫힘

  function handleToggle() {
    setIsOpen((prevIsOpen) => !prevIsOpen);       // 반대로 뒤집기
  }

  return (
    <section>
      <h2>한코딩 소개</h2>
      <button type="button" onClick={handleToggle} aria-expanded={isOpen}>
        {isOpen ? "소개 접기" : "소개 펼치기"}
      </button>
      <div hidden={!isOpen}>
        <p>직접 사용하는 서비스를 만들고 있습니다.</p>
      </div>
    </section>
  );
};

export default IntroToggle;