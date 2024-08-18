const express = require('express');
const app = express();
require('dotenv').config();
require('./config/dbConnect')();
const bodyParser = require('body-parser');
const errorHandler =  require('./middleware/errorHandler');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
const port = process.env.PORT || 5000

//API 
app.use('/api/user',require('./routes/userRoute'));
app.use('/api/admin',require('./routes/adminRoute'));

app.use(errorHandler);
app.listen(port, () => {
    console.log("Node server connected: ", port)
})
