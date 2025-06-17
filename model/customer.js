import db from '/db.js';
function getAllCustomer()
{
    const sqls=  'SELECT * FROM Customer;';
    
    db.all(aqlstmt,[],(err,rows) =>{

    });
}