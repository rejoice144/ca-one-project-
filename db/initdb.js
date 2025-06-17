import fs from 'fs'
import path from 'path'
import db from '../model/db.js'
const drname = path.resolve();

function initdbSql()
{
const initSql = fs.readFileSync(path.join(drname,'db/initdb.sql'),'utf-8');
db.run(initSql,[],(err)=>{
    if(err)
    {
        console.log('error'+ err.message);
        return;
    }
    console.log("initialized");
});
}
initdbSql();