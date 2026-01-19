const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

require('./socket')(io);

// 🔥 สำคัญ
const CLIENT_PATH = path.join(__dirname, '..', 'client');

// serve client
app.use(express.static(CLIENT_PATH));

// route หลัก
app.get('/', (req, res) => {
  res.sendFile(path.join(CLIENT_PATH, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('SERVER RUNNING ON', PORT);
});
