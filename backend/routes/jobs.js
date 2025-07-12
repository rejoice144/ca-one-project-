const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/jobs.json');

// Helper function to read jobs data
function readJobs() {
    try {
        if (!fs.existsSync(dataPath)) {
            // Create empty file if it doesn't exist
            fs.writeFileSync(dataPath, '[]');
            return [];
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading jobs:', error);
        return [];
    }
}

// Helper function to write jobs data
function writeJobs(jobs) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(jobs, null, 2));
    } catch (error) {
        console.error('Error writing jobs:', error);
    }
}

// GET all jobs
router.get('/', (req, res) => {
    try {
        const jobs = readJobs();
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error getting all jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET single job
router.get('/:id', (req, res) => {
    try {
        const jobs = readJobs();
        const jobId = parseInt(req.params.id);
        const job = jobs.find(j => j.id === jobId);
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        res.status(200).json(job);
    } catch (error) {
        console.error('Error getting job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST create new job
router.post('/', (req, res) => {
    try {
        const jobs = readJobs();
        
        // Validate required fields
        const { clientName, description, materials, estimatedCost, status, startDate } = req.body;
        
        if (!clientName || !description || !materials || estimatedCost === undefined || !status || !startDate) {
            return res.status(400).json({ 
                error: 'Missing required fields: clientName, description, materials, estimatedCost, status, startDate' 
            });
        }

        // Generate new ID
        const newId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1;
        
        const newJob = {
            id: newId,
            clientName: clientName,
            description: description,
            materials: Array.isArray(materials) ? materials : [materials],
            estimatedCost: parseFloat(estimatedCost),
            status: status,
            startDate: startDate,
            createdDate: new Date().toISOString().split('T')[0]
        };
        
        jobs.push(newJob);
        writeJobs(jobs);
        
        // Return the created job
        res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update job
router.put('/:id', (req, res) => {
    try {
        const jobs = readJobs();
        const jobId = parseInt(req.params.id);
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        
        if (jobIndex === -1) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Update job with new data, keeping existing fields if not provided
        const updatedJob = {
            ...jobs[jobIndex],
            ...req.body,
            id: jobId, // Ensure ID doesn't change
            updatedDate: new Date().toISOString().split('T')[0]
        };
        
        jobs[jobIndex] = updatedJob;
        writeJobs(jobs);
        
        res.status(200).json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE job
router.delete('/:id', (req, res) => {
    try {
        const jobs = readJobs();
        const jobId = parseInt(req.params.id);
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        
        if (jobIndex === -1) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        const deletedJob = jobs.splice(jobIndex, 1)[0];
        writeJobs(jobs);
        
        res.status(200).json(deletedJob);
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;