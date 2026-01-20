const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

connectDB(); // เชื่อมต่อ Database

io.on('connection', (socket) => {
    // ระบบเล่นไพ่แคง Real-time
    socket.on('join_table', (data) => {
        socket.join(data.roomId);
        console.log(`ผู้เล่น ${data.name} เข้าโต๊ะ ${data.roomId}`);
    });

    // ระบบจ่ายเงิน "ไหล" และ "แคง"
    socket.on('action_kang', (gameData) => {
        // คำนวณแต้มตามกติกา: A=1, JQK=10, แต้มเท่าดูดอกเล็กสุด (จิก)
        io.to(gameData.roomId).emit('game_result', { winner: gameData.playerId });
    });

    // Admin อนุมัติเครดิต
    socket.on('admin_approve_credit', async ({ userId, amount }) => {
        const user = await User.findByIdAndUpdate(userId, { $inc: { credits: amount } });
        io.emit('update_credit', { userId, newBalance: user.credits + amount });
    });
});

server.listen(3001, () => console.log('Server running on port 3001'));
