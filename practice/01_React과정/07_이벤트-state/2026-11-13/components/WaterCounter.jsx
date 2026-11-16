
import { useState } from "react";

const WaterCount = () => {
    const [cups, setCount] = useState(0);

    function handleDrink() {
        setCount(cups + 1);
        console.log("클릭 직후 cups:", cups);
    }
    
    return (
        <>
            <h2>오늘 물 {cups}잔</h2>
            {cups >= 8 ? <p>오늘 목표 달성! 🎉</p> : <p>목표까지 {8 - cups}잔</p>}
            <button type="button" onClick={handleDrink}>한 잔 마셨어요</button>
            <button type="button" onClick={() => setCount(0)}>다시시작</button>
        </>
    )
}

export default WaterCount;