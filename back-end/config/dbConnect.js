const mongoose = require('mongoose');

const dbConnect = async () => {
    try{
        const connect = await mongoose.connect(process.env.DBSTRING);
        console.log("Mongodb connected ", connect.connection.name);

    }catch(error){
        console.log(error);
    }
}

module.exports = dbConnect;