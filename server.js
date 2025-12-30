const express = require('express');
const path = require('path');

const app = express();

// Serve all static files from your build output
app.use(express.static(path.join(__dirname, 'dist')));  // ← change 'dist' to 'build' if using Create React App

// SPA fallback: send index.html for ANY path that isn't a static file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend SPA server running on port ${PORT}`);
});