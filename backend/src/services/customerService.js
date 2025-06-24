// src/services/customerService.js - Customer Business Logic
const db = require('../database/db');
const { promisify } = require('util');

class CustomerService {
    constructor() {
        this.dbRun = promisify(db.run.bind(db));
        this.dbGet = promisify(db.get.bind(db));
        this.dbAll = promisify(db.all.bind(db));
    }

    async createCustomer(customerData) {
        const { name, email, phone, address, company_name, tax_id } = customerData;
        
        // Check if email already exists
        const existing = await this.dbGet('SELECT id FROM customers WHERE email = ?', [email]);
        if (existing) {
            throw new Error('Customer with this email already exists');
        }

        const sql = `
            INSERT INTO customers (name, email, phone, address, company_name, tax_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await this.dbRun(sql, [name, email, phone, address, company_name, tax_id]);
        
        // Log to audit
        await this.logAudit('customers', result.lastID, 'INSERT', null, JSON.stringify(customerData));
        
        return this.getCustomerById(result.lastID);
    }

    async getCustomerById(id) {
        const customer = await this.dbGet('SELECT * FROM customers WHERE id = ?', [id]);
        
        if (customer) {
            // Get customer's projects
            customer.projects = await this.dbAll(`
                SELECT id, name, status, budget, created_at
                FROM projects
                WHERE customer_id = ?
                ORDER BY created_at DESC
            `, [id]);
            
            // Calculate customer metrics
            const metrics = await this.dbGet(`
                SELECT 
                    COUNT(*) as total_projects,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
                    SUM(CASE WHEN status = 'completed' THEN budget ELSE 0 END) as total_revenue,
                    AVG(CASE WHEN status = 'completed' THEN budget ELSE NULL END) as avg_project_value
                FROM projects
                WHERE customer_id = ?
            `, [id]);
            
            customer.metrics = metrics;
        }
        
        return customer;
    }

    async updateCustomer(id, updateData) {
        const currentCustomer = await this.dbGet('SELECT * FROM customers WHERE id = ?', [id]);
        if (!currentCustomer) {
            throw new Error('Customer not found');
        }

        // Check email uniqueness if being updated
        if (updateData.email && updateData.email !== currentCustomer.email) {
            const existing = await this.dbGet(
                'SELECT id FROM customers WHERE email = ? AND id != ?', 
                [updateData.email, id]
            );
            if (existing) {
                throw new Error('Email already in use by another customer');
            }
        }

        const fields = [];
        const values = [];
        
        ['name', 'email', 'phone', 'address', 'company_name', 'tax_id'].forEach(field => {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updateData[field]);
            }
        });
        
        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        
        const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
        await this.dbRun(sql, values);
        
        // Log to audit
        await this.logAudit('customers', id, 'UPDATE', JSON.stringify(currentCustomer), JSON.stringify(updateData));
        
        return this.getCustomerById(id);
    }

    async deleteCustomer(id) {
        const customer = await this.dbGet('SELECT * FROM customers WHERE id = ?', [id]);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Check if customer has projects
        const projectCount = await this.dbGet(
            'SELECT COUNT(*) as count FROM projects WHERE customer_id = ?', 
            [id]
        );
        
        if (projectCount.count > 0) {
            throw new Error('Cannot delete customer with existing projects');
        }

        await this.dbRun('DELETE FROM customers WHERE id = ?', [id]);
        
        // Log to audit
        await this.logAudit('customers', id, 'DELETE', JSON.stringify(customer), null);
        
        return { message: 'Customer deleted successfully' };
    }

    async listCustomers(filters = {}) {
        let sql = 'SELECT * FROM customers WHERE 1=1';
        const params = [];

        if (filters.search) {
            sql += ' AND (name LIKE ? OR email LIKE ? OR company_name LIKE ?)';
            const searchParam = `%${filters.search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
            
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }
        }

        return await this.dbAll(sql, params);
    }

    async getCustomerProjects(customerId) {
        const customer = await this.dbGet('SELECT id FROM customers WHERE id = ?', [customerId]);
        if (!customer) {
            throw new Error('Customer not found');
        }

        return await this.dbAll(`
            SELECT 
                p.*,
                (SELECT SUM(pm.quantity_used * pm.unit_cost) 
                 FROM project_materials pm 
                 WHERE pm.project_id = p.id) as material_cost,
                (SELECT SUM(pe.hours_worked * pe.hourly_rate) 
                 FROM project_employees pe 
                 WHERE pe.project_id = p.id) as labor_cost
            FROM projects p
            WHERE p.customer_id = ?
            ORDER BY p.created_at DESC
        `, [customerId]);
    }

    async logAudit(tableName, recordId, action, oldValues, newValues, userId = null) {
        await this.dbRun(
            'INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [tableName, recordId, action, oldValues, newValues, userId]
        );
    }
}

module.exports = new CustomerService();
