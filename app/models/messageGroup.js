const mongoose = require('mongoose');

var schema = mongoose.Schema;

module.exports = mongoose.model('Message Groups', new schema({
    groupName: String,
    creationDate: Date,
    creator: String,
    users: Array,
    messages: Array
}));