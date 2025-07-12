// tests/jobs.test.js - FIXED VERSION WITH PROPER DATA SETUP
const request = require('supertest');
const app = require('../server');

describe('Jobs API Unit Tests', () => {
  let createdJobId;

  test('CREATE: Should create a new job', async () => {
    const jobData = {
      clientName: 'Test Client Company',
      description: 'Test job description for unit testing',
      materials: ['steel bars', 'hinges'],
      estimatedCost: 150,
      status: 'pending',
      startDate: '2025-02-01'
    };
    
    const response = await request(app)
      .post('/api/jobs')
      .send(jobData);
    
    expect(response.status).toBe(201);
    expect(response.body.clientName).toBe('Test Client Company');
    expect(response.body.id).toBeDefined();
    
    // Save the created job ID for other tests
    createdJobId = response.body.id;
  });

  test('READ: Should get all jobs', async () => {
    const response = await request(app).get('/api/jobs');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('READ: Should get specific job', async () => {
    // First create a job to read
    const jobData = {
      clientName: 'Read Test Client',
      description: 'Job for read testing',
      materials: ['steel'],
      estimatedCost: 200,
      status: 'pending',
      startDate: '2025-02-01'
    };
    
    const createResponse = await request(app)
      .post('/api/jobs')
      .send(jobData);
    
    const jobId = createResponse.body.id;
    
    // Now read the specific job
    const response = await request(app).get(`/api/jobs/${jobId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(jobId);
    expect(response.body.clientName).toBe('Read Test Client');
  });

  test('UPDATE: Should update a job', async () => {
    // First create a job to update
    const jobData = {
      clientName: 'Update Test Client',
      description: 'Job for update testing',
      materials: ['steel'],
      estimatedCost: 300,
      status: 'pending',
      startDate: '2025-02-01'
    };
    
    const createResponse = await request(app)
      .post('/api/jobs')
      .send(jobData);
    
    const jobId = createResponse.body.id;
    
    // Now update the job
    const updateData = { status: 'in-progress' };
    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('in-progress');
  });

  test('DELETE: Should delete a job', async () => {
    // First create a job to delete
    const jobData = {
      clientName: 'Delete Test Client',
      description: 'Job for delete testing',
      materials: ['steel'],
      estimatedCost: 100,
      status: 'pending',
      startDate: '2025-02-01'
    };
    
    const createResponse = await request(app)
      .post('/api/jobs')
      .send(jobData);
    
    const jobId = createResponse.body.id;
    
    // Now delete the job
    const response = await request(app).delete(`/api/jobs/${jobId}`);
    expect(response.status).toBe(200);
    
    // Verify job is deleted
    const getResponse = await request(app).get(`/api/jobs/${jobId}`);
    expect(getResponse.status).toBe(404);
  });
});