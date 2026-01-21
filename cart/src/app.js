const express = require('express');
const cartRoutes = require('../src/routes/cart.routes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/cart", cartRoutes);

// Only connect to DB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const connectDB = require('./db/db');
  connectDB();
}

module.exports = app;