const countMessage = document.querySelector("#count-message");
const countButton = document.querySelector("#count-button");

const user = { name: "한코딩", goal: 8}
let count = 0;

function addCount() {
  count++;
  
  if (count >= user.goal) {
    countMessage.textContent = `${user.name}님, ${count}잔 마셔서 목표 달성!`;
    return;
  }
  else {  
    countMessage.textContent = `물을 ${count}잔 마셨어요`;
  }


}

countButton.addEventListener("click", addCount);
