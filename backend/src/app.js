// app.js - Main Express Application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();

// Import routers

const customersRouter = require('./src/routes/customers');





const app = express();



app.use('/api/customers', customersRouter);




// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Metal Engineering Works API running on port ${PORT}`);
});

module.exports = app;
