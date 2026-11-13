import "./App.css";
import MemberList from "./components/MemberList";
import Member from "./components/Member";

const members = [
  { id: 1, name: "한코딩", isLearning: true, stars: 3 },
  { id: 2, name: "파이썬", isLearning: false, stars: 0 },
  { id: 3, name: "자바", isLearning: "false", stars: 5 },
];

function App() {
  const learning = members.filter((member) => member.isLearning);
  const waiting = members.filter((member) => {
    member.isLearning === false;
  });
  return <>
  <MemberList/> 
      <p>학습 중 {learning.length}명</p>
      {waiting.length === 0 ? <p>대기 없음</p> : <p>대기 {waiting.length}명</p>}
      <ul>
        {members.map((member) => (
          <Member key={member.id} name={member.name} isLearning={member.isLearning} stars={member.stars} />
        ))}
      </ul>  
      
  </>
}

export default App;