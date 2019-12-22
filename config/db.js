const mongoose = require('mongoose')
const url = require('./keys').dbURL;
const InitDB = async () => {
    try{
        await mongoose.connect(url, {useNewUrlParser: true});
        console.log('Connected to db.')
    }catch (e) {
        console.log(e)
        throw e;
    }
};
module.exports = InitDB;