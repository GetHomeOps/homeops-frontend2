import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve all static files from your build output (assets, images, etc.)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: send index.html for ANY path that isn't a static file
// This catches all routes and lets React Router handle them client-side
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend SPA server running on port ${PORT}`);
});