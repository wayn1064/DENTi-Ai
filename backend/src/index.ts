import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

import supplyRoutes from './routes/supply';
import authRoutes from './routes/auth';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DENTi-Ai' });
});

app.use('/api/supply', supplyRoutes);
app.use('/api/auth', authRoutes);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});