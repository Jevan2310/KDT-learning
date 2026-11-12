
import "./App.css";

function App() {
  const profile = {
    name: "한코딩",
    intro: "저는 프론트엔드 개발자입니다.",
    goalCount: 3,
    imageUrl: "profile.png",
  };


  return (
    <div className="card">
      <h1>안녕하세요, 저는{profile.name}입니다!</h1>
      <img className="profile-image" src={profile.imageUrl} alt={`${profile.name}의 프로필 이미지`} />
      <p>소개: {profile.intro}</p>
      <p>목표 수: {profile.goalCount}</p>
      <p>목표 {profile.goalCount}개 중 {profile.goalCount - 2}개 달성. 남은목표 {profile.goalCount -1}개 </p>
    </div>
  );
}

export default App;
