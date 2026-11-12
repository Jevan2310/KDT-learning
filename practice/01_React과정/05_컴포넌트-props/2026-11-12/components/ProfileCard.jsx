

function ProfileCard(props) {
  return (
    <div className="card">
      <h2>이름: {props.name}</h2>
      <p>소개: {props.intro}</p>
    </div>
  );
}

export default ProfileCard;