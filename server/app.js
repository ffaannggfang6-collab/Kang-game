const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: '*' }
});

require('./socket')(io);

// 👉 ชี้ไปที่ client
app.use(express.static(path.join(__dirname, '../client')));

// 👉 หน้าเว็บหลัก
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('✅ Server running on port', PORT);
});
