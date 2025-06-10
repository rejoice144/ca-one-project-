import express from 'express';
import bodyParser from 'body-parser'
import rejoice from './routes/users.js'
const app = express();
const PORT = 5000;
app.use("/users",rejoice);
app.use(bodyParser.json());
app.get('/', (req ,res)=> {
    res.send("hello rejoice");
 });

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
