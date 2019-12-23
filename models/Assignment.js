const mongoose = require('mongoose');

const Assignment = mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'student'
    },
    assignment: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: false
    },
    processId: {
        type: String,
        required: false
    },
    compareResult: {
        type: Object,
        required: false
    }
});

module.exports = mongoose.model('assigment', Assignment);