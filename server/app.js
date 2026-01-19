const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// เก็บผู้เล่นในหน่วยความจำ (ชั่วคราว)
const players = {};

// serve client
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// ===== login =====
app.post('/login', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'ต้องใส่ชื่อผู้เล่น' });
  }

  players[username] = {
    username,
    credit: 1000
  };

  res.json({
    success: true,
    player: players[username]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('SERVER RUNNING ON PORT', PORT);
});
