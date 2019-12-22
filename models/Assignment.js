const mongoose = require('mongoose');

const Assignment = mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'student'
    },
    assignment: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('assigment', Assignment);