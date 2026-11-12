import "./App.css";
import ProfileCard from "./components/ProfileCard.jsx";

function App() {
  const myName = "한코딩";
  return (
    <div>
      <ProfileCard 
        name={myName} intro="프론트엔드 개발자입니다." goalCount={3} 
      />
      <ProfileCard 
        name="파이썬" goalCount={5} 
      />
      <ProfileCard 
        name="자바" intro = "백엔드 도구2" goalCount={2} 
      />
    </div>
  );
}

export default App;