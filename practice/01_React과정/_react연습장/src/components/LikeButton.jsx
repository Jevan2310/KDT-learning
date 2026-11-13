

function LikeButton() {
  let likes = 0;

  function handleLike() {
    likes = likes + 1;
    console.log("좋아요:", likes);
  }

  return (
    <div>
      <p>좋아요 {likes}개</p>
      <button type="button" onClick={handleLike}>좋아요</button>
    </div>
  );
}

export default LikeButton;