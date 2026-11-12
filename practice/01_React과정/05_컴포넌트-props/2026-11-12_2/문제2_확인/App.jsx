import "./App.css";
import MenuCard from "./components/MenuCard.jsx";
import SaleBadge from "./components/SaleBadge.jsx";

function App() {
  return (
    <div>
      <MenuCard name="아메리카노" price={4500} />
      <SaleBadge text="오늘만 할인" />
    </div>
  );
}

export default App;