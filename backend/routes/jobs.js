const express = require('express');
const fs = require('fs');
const path = require('path')
const router = express.Router();

const dataPath = path.join(__dirname,'../database/jobs.json')
//helper function read job data
function readJobs(){
        try{
            const data = fs.readFileSync(dataPath,'utf8');
            return JSON.parse(data);
        }catch(error){
          return[];
        }
      }

      //helper function to write jobs data
function writeJobs(jobs)     {
  fs.writeFileSync(dataPath,JSON.stringify(jobs,null,2));
} 
// get all jobs
router.get('/',(req,res)=>{
  const jobs = readJobs();
  res.json(jobs)
});
// get single job
router.get('/:id', (req, res) => {
  const jobs= readJobs();
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if(!job)
  {
    return res.status(404).json({error : 'job not found'});
  }

  res.json(job);
});
// create a new job
router.post('/',(req,res)=>{
  console.log(' Incoming POST /api/jobs body:', req.body);
  const jobs = readJobs();
  const newjob = {
    id:jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1,
    ...req.body,
    createdDate : new Date().toISOString().split('T')[0]
  };
  jobs.push(newjob);
  try{
  writeJobs(jobs);
  console.log(' Written new job:', newjob);
  res.status(201).json({
    message: ' job added',
    
    data: newjob
  });
  }catch(err){
res.status(500).json({error:'failed'});
  }
    
});
// update job
router.put('/:id',(req,res)=>{
  const jobs= readJobs();
  const jobIndex = jobs.findIndex(j=>j.id === parseInt(req.params.id));
  if(jobIndex === -1)
  {
    return res.status(404).json({error:'job not found'});

  }
  jobs[jobIndex]={...jobs[jobIndex],...req.body};
  try{
  writeJobs(jobs);
  res.json(jobs[jobIndex]);
}catch(err){
  res.status(500).json({error:'failed'})
}
});
//delete job
router.delete('/:id', (req, res) => {
    const jobs = readJobs();
    const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));

    if (jobIndex === -1) {
        return res.status(404).json({ error: 'Job not found' });
    }

    jobs.splice(jobIndex, 1); 

    try {
        writeJobs(jobs);  
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete job' });
    }
});


module.exports = router;