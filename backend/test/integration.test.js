// tests/integration.test.js - FIXED VERSION WITH TRULY UNIQUE DATA
const request = require('supertest');
const app = require('../server');

describe('Frontend-Backend Integration Test', () => {
  test('Complete workflow: Create client → Create job → Update status', async () => {
    // Generate truly unique data for each test run
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Step 1: Create a client via API (simulating frontend call)
    const clientData = {
      name: `Integration Test Company ${uniqueId}`,
      contact: `John Smith ${uniqueId}`,
      phone: `555-${Math.floor(Math.random() * 10000)}`,
      email: `john.${uniqueId}@integration-test.com`,
      address: `123 Test Street ${uniqueId}, Test City, TC1 2AB`
    };
    
    const clientResponse = await request(app)
      .post('/api/clients')
      .send(clientData);
    
    // Check if client creation succeeded
    if (clientResponse.status !== 201) {
      console.log('Client creation failed:', clientResponse.body);
    }
    
    expect(clientResponse.status).toBe(201);
    expect(clientResponse.body.name).toBe(clientData.name);
    expect(clientResponse.body.id).toBeDefined();
    
    const createdClient = clientResponse.body;
    
    // Step 2: Create a job for this client (simulating frontend workflow)
    const jobData = {
      clientName: createdClient.name,
      description: 'Integration test fabrication job - custom steel gate',
      materials: ['steel bars', 'hinges', 'primer paint'],
      estimatedCost: 750,
      status: 'pending',
      startDate: '2025-02-15'
    };
    
    const jobResponse = await request(app)
      .post('/api/jobs')
      .send(jobData);
    
    // Check if job creation succeeded
    if (jobResponse.status !== 201) {
      console.log('Job creation failed:', jobResponse.body);
    }
    
    expect(jobResponse.status).toBe(201);
    expect(jobResponse.body.clientName).toBe(createdClient.name);
    expect(jobResponse.body.id).toBeDefined();
    
    const createdJob = jobResponse.body;
    
    // Step 3: Update job status (simulating frontend status change)
    const statusUpdate = { 
      status: 'in-progress',
      description: jobData.description // Keep existing description
    };
    
    const updateResponse = await request(app)
      .put(`/api/jobs/${createdJob.id}`)
      .send(statusUpdate);
    
    // Check if update succeeded
    if (updateResponse.status !== 200) {
      console.log('Job update failed:', updateResponse.body);
    }
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe('in-progress');
    
    // Step 4: Verify data consistency across the system
    const finalJobCheck = await request(app).get(`/api/jobs/${createdJob.id}`);
    expect(finalJobCheck.status).toBe(200);
    expect(finalJobCheck.body.clientName).toBe(createdClient.name);
    expect(finalJobCheck.body.status).toBe('in-progress');
    
    // Step 5: Verify client still exists and is linked
    const clientCheck = await request(app).get(`/api/clients/${createdClient.id}`);
    expect(clientCheck.status).toBe(200);
    expect(clientCheck.body.name).toBe(createdClient.name);
    
    console.log('✅ Integration test completed successfully!');
    console.log(`Created client: ${createdClient.name} (ID: ${createdClient.id})`);
    console.log(`Created job: ${createdJob.description} (ID: ${createdJob.id})`);
    console.log(`Final job status: ${updateResponse.body.status}`);
  });
  
  test('Error handling: Cannot delete client with active jobs', async () => {
    // Generate unique data for this test
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a client
    const clientData = {
      name: `Client With Jobs ${uniqueId}`,
      contact: `Jane Doe ${uniqueId}`,
      phone: `555-${Math.floor(Math.random() * 10000)}`,
      email: `jane.${uniqueId}@test-company.com`,
      address: `456 Business Ave ${uniqueId}, Business City`
    };
    
    const clientResponse = await request(app)
      .post('/api/clients')
      .send(clientData);
    
    expect(clientResponse.status).toBe(201);
    const client = clientResponse.body;
    
    // Create a job for this client
    const jobData = {
      clientName: client.name,
      description: 'Active job preventing client deletion',
      materials: ['materials'],
      estimatedCost: 100,
      status: 'pending',
      startDate: '2025-02-01'
    };
    
    const jobResponse = await request(app)
      .post('/api/jobs')
      .send(jobData);
    
    expect(jobResponse.status).toBe(201);
    
    // Try to delete client with active job (should fail)
    const deleteResponse = await request(app)
      .delete(`/api/clients/${client.id}`);
    
    expect(deleteResponse.status).toBe(400);
    expect(deleteResponse.body.error).toContain('Cannot delete client with existing jobs');
  });
});