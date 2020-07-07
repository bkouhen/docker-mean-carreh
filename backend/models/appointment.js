const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    date: {type: Date, required: true},
    time: {type: {hours: Number, minutes: Number}, required: true},
    service: {type: String, required: true},
    userId : {type : mongoose.Schema.Types.ObjectId || String, ref : 'User'},
    readStatus: {type: Number},
    email: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    phoneNumber: {type: String, required: true},
});

module.exports = mongoose.model('Appointment', appointmentSchema);