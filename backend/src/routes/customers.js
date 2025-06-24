// src/routes/customers.js - Customer API Routes
const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const { validateCustomer } = require('../middleware/validation');

// GET all customers
router.get('/', async (req, res, next) => {
    try {
        const customers = await customerService.listCustomers(req.query);
        res.json({
            success: true,
            data: customers,
            count: customers.length
        });
    } catch (error) {
        next(error);
    }
});

// GET single customer
router.get('/:id', async (req, res, next) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found'
            });
        }
        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
});

// POST create customer
router.post('/', validateCustomer, async (req, res, next) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
});

// PUT update customer
router.put('/:id', async (req, res, next) => {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
});

// DELETE customer
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await customerService.deleteCustomer(req.params.id);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// GET customer projects
router.get('/:id/projects', async (req, res, next) => {
    try {
        const projects = await customerService.getCustomerProjects(req.params.id);
        res.json({
            success: true,
            data: projects,
            count: projects.length
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
