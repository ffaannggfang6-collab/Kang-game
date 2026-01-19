const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// ===== middleware =====
app.use(cors());
app.use(express.json());

// ===== serve client =====
const CLIENT_PATH = path.join(__dirname, '../client');
app.use(express.static(CLIENT_PATH));

app.get('/', (req, res) => {
  res.sendFile(path.join(CLIENT_PATH, 'index.html'));
});

// ===== health check =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===== start server =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('KANG GAME SERVER RUNNING ON PORT', PORT);
});
