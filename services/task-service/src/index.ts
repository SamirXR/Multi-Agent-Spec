import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'task-service', timestamp: new Date().toISOString() });
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`🟢 Task Service running on http://localhost:${PORT}`);
});

export default app;
