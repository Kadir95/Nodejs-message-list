const User = require('../models/user');
const express = require('express');

var apiverifyRouter = express.Router();

module.exports = apiverifyRouter;

apiverifyRouter.use((req, res, next) => {
    User.findOne({
        email: req.decoded.email,
        name: req.decoded.username
    }, (err, user) => {
        if (err) {
            res.json({
                success: false,
                message: 'User could not found'
            });
        } else {
            if (!user.emailverify) {
                next();
            } else {
                res.json({
                    success: false,
                    message: 'User already verified'
                });
            }
        }
    });
});

apiverifyRouter.get('/sendmail', (req, res) => {
    console.log('tring to send email to ' + req.decoded.email);
    require('../modules/email').sender(req.decoded.email, 'Your Verification Code:');
    res.json({
        success: true,
        message: 'request is received'
    });
});

apiverifyRouter.post('/', (req, res) => {
    if (!req.body.verifycode) {
        res.json({
            success: false,
            message: 'request body does not have verifycode value'
        });
    }

    require('../modules/email_verification').verifyemail({
        email: req.decoded.email,
        code: req.body.verifycode
    }, () => {
        User.findOne({
            email: req.decoded.email
        }, (err, result) => {
            if (err) {
                res.json({
                    success: false
                });
                return;
            }

            if (result.emailverify) {
                res.json({
                    success: true,
                    message: 'Account already verified'
                });
            }

            result.emailverify = true;
            result.save();
        });

        res.json({
            success: true,
            message: 'Email verification done'
        });
    });
});