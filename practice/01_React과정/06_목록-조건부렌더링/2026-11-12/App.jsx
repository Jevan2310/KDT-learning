import ProfileCard from "./components/ProfileCard.jsx";
import { ListTitle } from "./components/ProfileCard.jsx";

const profiles = [
  { id: 1, name: "한코딩", intro: "프론트엔드 개발자입니다.", goalCount: 3},
  { id: 2, name: "파이썬", intro: "벡엔드 언어1", goalCount: 5},
  { id: 3, name: "자바", goalCount: 2},
  { id: 4, name: "리액트", intro: "프레임워크", goalCount: 6},
];

function App() {
  return (
    <div>
      <ListTitle count = {profiles.length} />

      {profiles.map((profile) => {
        return <ProfileCard 
          key={profile.id}
          name={profile.name}
          intro={profile.intro}
          goalCount={profile.goalCount}
        />
      })}
    </div>
  );
}
export default App;