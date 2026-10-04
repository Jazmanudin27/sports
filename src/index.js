import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ app: 'ArenaKu API', status: 'ok' }));
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error('❌', err);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ArenaKu API jalan di http://localhost:${PORT}`));
