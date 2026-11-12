
import "./App.css";

import ProfileCard from "./components/ProfileCard.jsx";

function App() {
  return (
    <div>
      <ProfileCard name="한코딩" intro="프론트엔드 개발자" />
      <ProfileCard name="파이썬" intro="백엔드 도구 1" />
      <ProfileCard name="자바" intro="백엔드 도구 1" />
    </div>
  );
}

export default App;