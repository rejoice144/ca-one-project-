const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../database/clients.json');

// Helper function to read clients data
function readClients() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write clients data
function writeClients(clients) {
    fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2));
}
// GET all clients
router.get('/', (req, res) => {
    const clients = readClients();
    res.json(clients);
});

// GET single client
router.get('/:id', (req, res) => {
    const clients = readClients();
    const client = clients.find(c => c.id === parseInt(req.params.id));
    
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
});

// POST create new client
router.post('/', (req, res) => {
    const clients = readClients();
    
    // Validate required fields
    const { name, contact, phone, email, address } = req.body;
    if (!name || !contact || !phone || !email || !address) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if client already exists
    const existingClient = clients.find(c => 
        c.name.toLowerCase() === name.toLowerCase() || 
        c.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingClient) {
        return res.status(400).json({ error: 'Client with this name or email already exists' });
    }
    
    const newClient = {
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        name: name.trim(),
        contact: contact.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    clients.push(newClient);
    writeClients(clients);
    res.status(201).json(newClient);
});
// PUT update client
router.put('/:id', (req, res) => {
    const clients = readClients();
    const clientIndex = clients.findIndex(c => c.id === parseInt(req.params.id));
    
    if (clientIndex === -1) {
        return res.status(404).json({ error: 'Client not found' });
    }
    
    // Validate required fields
    const { name, contact, phone, email, address } = req.body;
    if (!name || !contact || !phone || !email || !address) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if email is taken by another client
    const existingClient = clients.find(c => 
        c.id !== parseInt(req.params.id) && 
        c.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingClient) {
        return res.status(400).json({ error: 'Email already in use by another client' });
    }
    
    // Update client
    clients[clientIndex] = {
        ...clients[clientIndex],
        name: name.trim(),
        contact: contact.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        updatedDate: new Date().toISOString().split('T')[0]
    };
    
    writeClients(clients);
    res.json(clients[clientIndex]);
});
router.delete('/:id', (req, res) => {
    const clients = readClients();
    const clientIndex = clients.findIndex(c => c.id === parseInt(req.params.id));
    
    if (clientIndex === -1) {
        return res.status(404).json({ error: 'Client not found' });
    }
    
    // Check if client has associated jobs
    try {
        const jobsPath = path.join(__dirname, '../data/jobs.json');
        const jobsData = fs.readFileSync(jobsPath, 'utf8');
        const jobs = JSON.parse(jobsData);
        
        const clientJobs = jobs.filter(job => 
            job.clientName === clients[clientIndex].name
        );
        
        if (clientJobs.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete client with existing jobs. Please complete or remove associated jobs first.' 
            });
        }
    } catch (error) {
        // If jobs file doesn't exist or can't be read, proceed with deletion
        console.log('Warning: Could not check for associated jobs');
    }
    
    const deletedClient = clients.splice(clientIndex, 1)[0];
    writeClients(clients);
    res.json(deletedClient);
});

// GET client statistics
router.get('/stats/summary', (req, res) => {
    const clients = readClients();
    
    // Read jobs to get client job counts
    let clientJobCounts = {};
    try {
        const jobsPath = path.join(__dirname, '../data/jobs.json');
        const jobsData = fs.readFileSync(jobsPath, 'utf8');
        const jobs = JSON.parse(jobsData);
        
        jobs.forEach(job => {
            if (clientJobCounts[job.clientName]) {
                clientJobCounts[job.clientName]++;
            } else {
                clientJobCounts[job.clientName] = 1;
            }
        });
    } catch (error) {
        console.log('Warning: Could not read jobs data for statistics');
    }
    
    const stats = {
        totalClients: clients.length,
        clientsWithJobs: Object.keys(clientJobCounts).length,
        averageJobsPerClient: clients.length > 0 ? 
            Object.values(clientJobCounts).reduce((a, b) => a + b, 0) / clients.length : 0,
        topClients: Object.entries(clientJobCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, jobCount]) => ({ name, jobCount }))
    };
    
    res.json(stats);
});

module.exports = router;