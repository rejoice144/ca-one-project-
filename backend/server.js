const express = require('express');
const cors = require('cors');

const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes
const jobsRoutes = require('./routes/jobs');
const clientsRoutes = require('./routes/clients');
const materialsRoutes = require('./routes/materials');

// Use routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/materials', materialsRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;