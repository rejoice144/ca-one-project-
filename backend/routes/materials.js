const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../database/materials.json');

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
    try {
        fs.writeFileSync(dataPath, JSON.stringify(materials, null, 2));
    } catch (err) {
        console.error('Failed to write materials:', err);
    }
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
module.exports = router;



