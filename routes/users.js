import express from 'express';
import { getAllcustomer} from '../model/cm.js'
const router = express.Router();
// const users=[
//     {
//         "material": "Stainless Steel",
//         "length": 120,
//         "width": 60,
//         "thickness": 5,
//         "services": ["Welding"],
//         "quantity": 3,
//     },
//     {
//         "material": "Aluminium",
//         "length": 120,
//         "width": 60,
//         "thickness": 5,
//         "services": ["Cutting"],
//         "quantity": 3
//     }
    
// ];
 router.get('/',(req,res)=>{
    let customer = getAllcustomer();
    res.send(customer);
 })
 export default router