const mongoose = require('mongoose');

var schema = mongoose.Schema;

module.exports = mongoose.model('User', new schema({
    name: {
        type: String,
        index: {
            unique: true
        }
    },
    password: String,
    email: {
        type: String,
        index: {
            unique: true
        }
    },
    emailverify: Boolean,
    creationdate: Date,
    lastinteractiondate: Date,
    admin: Boolean
}));