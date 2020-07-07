const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email : {type : String, required : true, unique : true},
    password : {type : String, required : true},
    role : {type: String, required: true},
    firstName: {type: String},
    lastName: {type: String},
    address : {type: String},
    city: {type: String},
    phoneNumber: {type: String},
    resetToken: {type: String},
    resetTokenExpiration: {type: Date},
    readStatus: {type: Number}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);