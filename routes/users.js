import express from 'express';
const router = express.Router();
const users=[
    {
        "material": "Stainless Steel",
  "length": 120,
  "width": 60,
  "thickness": 5,
  "services": ["Welding"],
  "quantity": 3,
    }
];
 router.get('/',(req,res)=>{
    res.send(users);
 })
 export default router