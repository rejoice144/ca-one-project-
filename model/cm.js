import db from './db.js'
function getAllcustomer(){
    const sqlstmt =' SELECT * FROM customer;';
    let data = { customer:[]};
    db.all(sqlstmt,[],(err,rows)=>{
        if(err)
        {
            console.log('error'+ err.message);
            
            return;
        }
        rows.forEach((row) =>{
            let customer = {
                id:row.customer_id,
                name:row.customer_name
            };
            data.customer.push(customer);

        })
    });
return JSON.stringify(data);
}
export { getAllcustomer }