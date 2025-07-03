const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/clients.json');

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