require('dotenv').config({path:"./src/.env"});
const  connectDB  = require('./src/db/db');
const app = require('./src/app');
connectDB();
app.listen(3002,()=>{
    console.log("The Server is started on the 3002 ");
})