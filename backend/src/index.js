require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: [process.env.CLIENT_URL || 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'] }));
app.use(express.json());

const { startScheduler } = require('./utils/recurringBillingEngine');

// Routes
app.use('/api/auth', require('./features/routes/authRoutes'));
app.use('/api/users', require('./features/routes/userRoutes'));
app.use('/api/deals', require('./features/routes/dealRoutes'));
app.use('/api/quotations', require('./features/routes/quoteRoutes'));
app.use('/api/inventory', require('./features/routes/inventoryRoutes'));
app.use('/api/fulfillment', require('./features/routes/fulfillmentRoutes'));
app.use('/api/approvals', require('./features/routes/approvalRoutes'));
app.use('/api/billing', require('./features/routes/billingRoutes'));
app.use('/api/customers', require('./features/routes/customerRoutes'));
app.use('/api/company', require('./features/routes/companyRoutes'));
app.use('/api/products', require('./features/routes/productRoutes'));
app.use('/api/b2b', require('./features/routes/b2bRoutes'));
app.use('/api/chat', require('./features/routes/chatRoutes'));
app.use('/api/subscriptions', require('./features/routes/subscriptionRoutes'));

// Start Automated Recurring Billing Scheduler
startScheduler();

// Basic Route
app.get('/', (req, res) => {
  res.send('DealFlow360 API is running...');
});

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Nodemon trigger 2
