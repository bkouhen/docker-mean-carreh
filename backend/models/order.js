const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    email: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    date: {type: Date, required: true},
    price: {type: Number, required: true},
    items: [],
    userId : {type : mongoose.Schema.Types.ObjectId || String, ref : 'User'},
    readStatus: {type: Number}
});

module.exports = mongoose.model('Order', orderSchema);