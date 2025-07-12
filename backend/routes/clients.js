const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/clients.json');

// Helper function to read clients data
function readClients() {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, '[]');
            return [];
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading clients:', error);
        return [];
    }
}

// Helper function to write clients data
function writeClients(clients) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2));
    } catch (error) {
        console.error('Error writing clients:', error);
    }
}

// GET all clients
router.get('/', (req, res) => {
    try {
        const clients = readClients();
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error getting clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET single client
router.get('/:id', (req, res) => {
    try {
        const clients = readClients();
        const clientId = parseInt(req.params.id);
        const client = clients.find(c => c.id === clientId);
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.status(200).json(client);
    } catch (error) {
        console.error('Error getting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST create new client
router.post('/', (req, res) => {
    try {
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
        
        // Generate new ID
        const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
        
        const newClient = {
            id: newId,
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
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update client
router.put('/:id', (req, res) => {
    try {
        const clients = readClients();
        const clientId = parseInt(req.params.id);
        const clientIndex = clients.findIndex(c => c.id === clientId);
        
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
            c.id !== clientId && 
            c.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingClient) {
            return res.status(400).json({ error: 'Email already in use by another client' });
        }
        
        // Update client
        const updatedClient = {
            ...clients[clientIndex],
            name: name.trim(),
            contact: contact.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            address: address.trim(),
            updatedDate: new Date().toISOString().split('T')[0]
        };
        
        clients[clientIndex] = updatedClient;
        writeClients(clients);
        
        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE client
router.delete('/:id', (req, res) => {
    try {
        const clients = readClients();
        const clientId = parseInt(req.params.id);
        const clientIndex = clients.findIndex(c => c.id === clientId);
        
        if (clientIndex === -1) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        // Check if client has associated jobs
        try {
            const jobsPath = path.join(__dirname, '../data/jobs.json');
            if (fs.existsSync(jobsPath)) {
                const jobsData = fs.readFileSync(jobsPath, 'utf8');
                if (jobsData.trim()) {
                    const jobs = JSON.parse(jobsData);
                    const clientJobs = jobs.filter(job => 
                        job.clientName === clients[clientIndex].name
                    );
                    
                    if (clientJobs.length > 0) {
                        return res.status(400).json({ 
                            error: 'Cannot delete client with existing jobs. Please complete or remove associated jobs first.' 
                        });
                    }
                }
            }
        } catch (error) {
            // If jobs file doesn't exist or can't be read, proceed with deletion
            console.log('Warning: Could not check for associated jobs');
        }
        
        const deletedClient = clients.splice(clientIndex, 1)[0];
        writeClients(clients);
        
        res.status(200).json(deletedClient);
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;