const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/materials.json');

// Helper function to read materials data
function readMaterials() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write materials data
function writeMaterials(materials) {
    fs.writeFileSync(dataPath, JSON.stringify(materials, null, 2));
}

// GET all materials
router.get('/', (req, res) => {
    const materials = readMaterials();
    res.json(materials);
});

// GET single material
router.get('/:id', (req, res) => {
    const materials = readMaterials();
    const material = materials.find(m => m.id === parseInt(req.params.id));
    
    if (!material) {
        return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json(material);
});

// POST create new material
router.post('/', (req, res) => {
    const materials = readMaterials();
    
    // Validate required fields
    const { name, quantity, unit, costPerUnit, supplier } = req.body;
    if (!name || quantity === undefined || !unit || costPerUnit === undefined || !supplier) {
        return res.status(400).json({ error: 'Name, quantity, unit, cost per unit, and supplier are required' });
    }
    
    // Validate numeric fields
    if (quantity < 0 || costPerUnit < 0) {
        return res.status(400).json({ error: 'Quantity and cost per unit must be non-negative' });
    }
    
    // Check if material already exists
    const existingMaterial = materials.find(m => 
        m.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingMaterial) {
        return res.status(400).json({ error: 'Material with this name already exists' });
    }
    
    const newMaterial = {
        id: materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1,
        name: name.trim(),
        quantity: parseInt(quantity),
        unit: unit.trim(),
        costPerUnit: parseFloat(costPerUnit),
        supplier: supplier.trim(),
        description: req.body.description ? req.body.description.trim() : '',
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    materials.push(newMaterial);
    writeMaterials(materials);
    res.status(201).json(newMaterial);
});

// PUT update material
router.put('/:id', (req, res) => {
    const materials = readMaterials();
    const materialIndex = materials.findIndex(m => m.id === parseInt(req.params.id));
    
    if (materialIndex === -1) {
        return res.status(404).json({ error: 'Material not found' });
    }
    
    // Validate required fields
    const { name, quantity, unit, costPerUnit, supplier } = req.body;
    if (!name || quantity === undefined || !unit || costPerUnit === undefined || !supplier) {
        return res.status(400).json({ error: 'Name, quantity, unit, cost per unit, and supplier are required' });
    }
    
    // Validate numeric fields
    if (quantity < 0 || costPerUnit < 0) {
        return res.status(400).json({ error: 'Quantity and cost per unit must be non-negative' });
    }
    
    // Check if name is taken by another material
    const existingMaterial = materials.find(m => 
        m.id !== parseInt(req.params.id) && 
        m.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingMaterial) {
        return res.status(400).json({ error: 'Material name already in use' });
    }
    
    // Update material
    materials[materialIndex] = {
        ...materials[materialIndex],
        name: name.trim(),
        quantity: parseInt(quantity),
        unit: unit.trim(),
        costPerUnit: parseFloat(costPerUnit),
        supplier: supplier.trim(),
        description: req.body.description ? req.body.description.trim() : '',
        updatedDate: new Date().toISOString().split('T')[0]
    };
    
    writeMaterials(materials);
    res.json(materials[materialIndex]);
});
// DELETE client
router.delete('/:id', (req, res) => {
    const materials = readMaterials();
    const materialIndex = materials.findIndex(m => m.id === parseInt(req.params.id));
    
    if (materialIndex === -1) {
        return res.status(404).json({ error: 'Material not found' });
    }
    
    // Check if material is used in any jobs
    try {
        const jobsPath = path.join(__dirname, '../data/jobs.json');
        const jobsData = fs.readFileSync(jobsPath, 'utf8');
        const jobs = JSON.parse(jobsData);
        
        const materialName = materials[materialIndex].name.toLowerCase();
        const jobsUsingMaterial = jobs.filter(job => {
            if (Array.isArray(job.materials)) {
                return job.materials.some(mat => 
                    mat.toLowerCase().includes(materialName)
                );
            }
            if (quantity === undefined || quantity < 0) {
              res.status(400).json({ error: 'Valid quantity is required' }); 
               }
            return false;
        });
        
        if (jobsUsingMaterial.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete material that is used in existing jobs. Please update or complete associated jobs first.' 
            });
        }
    } catch (error) {
        // If jobs file doesn't exist or can't be read, proceed with deletion
        console.log('Warning: Could not check for material usage in jobs');
    }
    
    const deletedMaterial = materials.splice(materialIndex, 1)[0];
    writeMaterials(materials);
    res.json(deletedMaterial);
});





module.exports = router;



