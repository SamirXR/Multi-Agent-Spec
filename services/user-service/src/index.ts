import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Enforce Content-Type: application/json on POST/PUT/PATCH requests
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({ error: 'Content-Type must be application/json', code: 400 });
      return;
    }
  }
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`🟢 User Service running on http://localhost:${PORT}`);
});

export default app;
