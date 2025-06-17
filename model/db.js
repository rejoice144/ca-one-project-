import sqlite3 from 'sqlite3';
import path from 'path';
const sql3 = sqlite3.verbose();
const drname = path.resolve();
const db = new sql3.Database(path.join(drname,'/db/metal.db'),sqlite3.OPEN_READWRITE,connected);
function connected(err)
{
    if(err)
    {

    
    console.log(err.message);
    return;
}
console.log("created");
}
export default db