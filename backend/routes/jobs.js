const express = require('express');
const fs = require('fs');
const path = require('path')
const router = express.Router();

const dataPath = path.join(__dirname,'../data/jobs.json')
//helper function read job data
function readjobs(){
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
  const jobs = readjobs();
  res.json(jobs)
});
// get single job
router.get('/:id', (req, res) => {
  const jobs = readjobs();
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if(!jobs)
  {
    return res.status(404).json({error : 'job not found'});
  }

  res.json(jobs);
});
// create a new job
router.get('/',(req,res)=>{
  const jobs = readjobs();
  const newjob = {
    id:jobs.lenght > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1,
    ...req.body,
    createdDate : new Date().toISOString().split('T')[0]
  };
  jobs.push(newjob);
  writeJobs(jobs)
  res.status(201).json(newjob);
  });
module.exports = router;