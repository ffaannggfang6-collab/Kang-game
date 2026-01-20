import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
const socket = io('http://localhost:3001');

function App() {
    const [myHand, setMyHand] = useState([]);
    const [credits, setCredits] = useState(0);

    const playSound = (soundName) => {
        new Audio(`/sounds/${soundName}.mp3`).play();
    };

    const handleKang = () => {
        playSound('kang-voice'); // เสียงการ์ตูน "แคง!"
        socket.emit('action_kang', { roomId: '101', playerId: 'me' });
    };

    return (
        <div className="table" style={{ background: 'green', height: '100vh', padding: '20px' }}>
            <div className="profile">
                <img src="my-avatar.jpg" style={{ width: 80, borderRadius: '50%', border: '3px solid gold' }} />
                <p>เครดิต: {credits}</p>
            </div>
            
            <div className="cards-area">
                {/* แสดงไพ่ในมือ 5 ใบ */}
            </div>

            <div className="controls" style={{ position: 'fixed', bottom: 20 }}>
                <button onClick={() => playSound('draw')}>จั่วไพ่</button>
                <button onClick={() => playSound('discard')}>ทิ้งไพ่</button>
                <button onClick={handleKang} style={{ background: 'red' }}>แคง!</button>
            </div>
        </div>
    );
}
export default App;
