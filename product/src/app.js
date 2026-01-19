const express =require('express');
const cookiesParser = require('cookie-parser');
const productRoutes = require('../src/routes/product.routes');
const app = express();
app.use(cookiesParser());
app.use(express.json());
app.use('/api/products',productRoutes)
module.exports = app;