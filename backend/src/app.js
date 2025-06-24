// app.js - Main Express Application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();

// Import routers
const projectsRouter = require('./src/routes/projects');
const customersRouter = require('./src/routes/customers');
const materialsRouter = require('./src/routes/materials');


// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');
const { authenticate } = require('./src/middleware/auth');

const app = express();



app.use('/api/customers', customersRouter);


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Metal Engineering Works API running on port ${PORT}`);
});

module.exports = app;
