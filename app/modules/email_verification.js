const mongoose = require('mongoose');
const User = require('../models/user');

var schema = mongoose.Schema;

const emailverification = mongoose.model('Email_Verification', new schema({
    email: {
        type: String,
        index: {
            unique: true
        }
    },
    verification_no: String
}));

module.exports.writequeue = function (info) {
    var result = {
        success: false
    }
    User.findOne({
        email: info.email
    }, (err, record) => {
        if (err) {
            console.log('Writing to verification queue was faild');
            result.success = false;
            return;
        }

        if (record) {
            emailverification.findOne({
                email: info.email
            }, (err, queuerecord) => {
                if (err) {
                    result.success = false;
                    return;
                }

                if (!queuerecord) {
                    newrecord = new emailverification({
                        email: info.email,
                        verification_no: info.code
                    })

                    newrecord.save((err) => {
                        if (err) {
                            result.success = false;
                            return;
                        }

                        console.log('Email verification code added to queue');
                        result.success = true;
                        return;
                    });
                } else {
                    queuerecord.verification_no = info.code;
                    queuerecord.save();

                    result.success = true;
                    return;
                }
            });
        } else {
            console.log('there is no user with ' + info.email + ' email address');
            result.success = false;
            return;
        }
        result.success = false;
        return;
    });
    return result;
}

module.exports.verifyemail = function (query, next) {
    emailverification.deleteMany({
        email: query.email,
        verification_no: query.code
    }, (err) => {
        if (err) {
            return {
                success: false
            };
        }

        next();

        return {
            success: true
        };
    });
}

module.exports.schema = emailverification;