function ProfileCard({name, intro = "소개를 준비하고 있습니다.", goalCount}) {
  return (
    <div className="card">
      <h2>이름: {name}</h2>
      <p>소개: {intro}</p>
      <p>목표 {goalCount}  → 다음 주 {goalCount + 1}개</p>

    </div>
  );
}

export default ProfileCard;