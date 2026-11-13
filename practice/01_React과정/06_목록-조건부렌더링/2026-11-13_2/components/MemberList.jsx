
const members=[
  {id:1, name: "한코딩", isLearning:false, stars:3 },
  {id:2, name: "파이썬", isLearning:true, stars:0 },
  {id:3, name: "자바", isLearning:false, stars:1 },
  {id:4, name: "리액트", isLearning:true, stars:5 },
]



function MemberList() {
  const learningMembers = members.filter((member)=>(member.isLearning));


  return <section>
    <h2>전체 {members.length}명</h2>
    <ul>
      {members.map((member) =>{
        return <li key={member.id}> {member.name} -  {member.isLearning ? "학습 중..." : "학습 예정"} {member.stars > 0 && "★"+member.stars}
        </li>
      })}
    </ul>
    
    <h2>학습 중 {learningMembers.length}명</h2>
    {learningMembers.length === 0 ? (
      <p>학습중인 학생이 없습니다</p>
    ) : (
    <ul>
      {learningMembers.map((learningMember) =>{
        return <li key={learningMember.id}>
          {learningMember.name}
        </li>
      })}
    </ul>
    )}
  </section>;
  
  
}

export default MemberList;