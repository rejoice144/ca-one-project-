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
module.exports = router;



