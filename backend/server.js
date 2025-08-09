require('dotenv').config();
<<<<<<< Current (Your changes)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan('tiny'));

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', uptime: process.uptime() });
});

// API v1 placeholder
const v1 = express.Router();

v1.get('/brands', (_req, res) => {
  res.json({ ok: true, data: [], meta: { page: 1, limit: 0, total: 0 } });
});

app.use('/v1', v1);
=======
const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3001;

const app = createApp();
>>>>>>> Incoming (Background Agent changes)

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});