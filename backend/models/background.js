const mongoose = require('mongoose');

const backgroundSchema = mongoose.Schema({
    url: {type: String, required: true},
    position: {type: Number}
});

module.exports = mongoose.model('Background', backgroundSchema);