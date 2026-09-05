require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5175' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./features/routes/authRoutes'));
app.use('/api/users', require('./features/routes/userRoutes'));
app.use('/api/deals', require('./features/routes/dealRoutes'));
app.use('/api/quotations', require('./features/routes/quoteRoutes'));
app.use('/api/inventory', require('./features/routes/inventoryRoutes'));
app.use('/api/fulfillment', require('./features/routes/fulfillmentRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('DealFlow360 API is running...');
});

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
