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

module.exports = router;