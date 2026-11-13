function Member({ name, isLearning, stars }) {
  return (
    <li>
      {name} {isLearning && <span>[학습 중]</span>} {stars && <span>★{stars}</span>}
    </li>
  );
}

export default Member;