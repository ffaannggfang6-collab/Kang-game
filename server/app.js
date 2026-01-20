const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

const { setupSocket } = require('./socket');

app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.send('KANG GAME SERVER RUNNING');
});

setupSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('✅ Server running on port', PORT);
});
