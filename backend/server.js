// Main Express Application
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path =require('path')
const app = express();
const PORT = 3000;
 // middleware
 app.use(cors());
 app.use(bodyParser.json());
 app.use(express.static(path.join(__dirname,'../frontend')));
// Import routers
const jobsRouter = require('./routes/jobs');
const clientsRoutes = require('./routes/clients');

// use routes
app.use('/api/jobs',jobsRouter);
app.use('/api/clients', clientsRoutes);

// server frontend
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../frontend/index.html'));
});
// start server
app.listen(PORT,()=>{
    console.log(`server running on http://localhost:${PORT}`);
});


