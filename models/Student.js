const mongoose = require('mongoose')
const Student = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('student', Student)