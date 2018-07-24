const express = require('express');
const User = require('../models/user');
const messageops = require('../modules/message');

var messageRouter = express.Router();

module.exports = messageRouter;

messageRouter.use((req, res, next) => {
    User.findOne({
        email: req.decoded.email,
        name: req.decoded.username
    }, (err, user) => {
        if (err) {
            console.log('message router middleware finding the verifing states error\n' + err);
        } else {
            if (!user) {
                res.json({
                    success: false,
                    message: 'user could not found'
                });
            } else if (user.emailverify) {
                next();
            } else {
                res.json({
                    success: false,
                    message: 'verification does not complete'
                });
            }
        }
    });
});

messageRouter.get('/group/create', (req, res) => {
    if (!req.query.groupname) {
        res.json({
            success: false,
            message: 'Group name did not unspecified'
        });
        return;
    }
    
    User.findOne({
        email: req.decoded.email,
        name: req.decoded.username
    }, (err, user) => {
        if (err) {
            res.json({
                success: false,
                message: 'could not find the user'
            });
        } else {
            var msggroup = messageops.createmessagegroup(user, req.query.groupname);
            res.json({
                success: true,
                message: 'Message group created successfuly',
                messagegroup: {
                    id: msggroup._id,
                    creationdate: msggroup.creationDate,
                    name: msggroup.groupName
                }
            });
        }
    });
});

// id, name, email 
messageRouter.get('/group/addperson', (req, res) => {
    if (!req.query.groupid) {
        res.json({
            success: false,
            message: 'group id does not define'
        });
        return;
    }

    if (!req.query.email) {
        req.json({
            success: false,
            message: 'person does not define'
        });
        return;
    }

    messageops.addperson(req.query.groupid, req.query.email, (result) => {
        res.json(result);
    });
});

messageRouter.post('/group/sendmsg', (req, res) => {
    messagetext = req.body.message || req.query.message || req.headers['message']
    if (!messagetext) {
        res.json({
            success: false,
            message: 'request does not includes message'
        });
        return;
    }

    groupid = req.body.groupid || req.query.groupid || req.headers['groupid'] 
    if (!groupid) {
        res.json({
            success: false,
            message: 'groupid does not define'
        });
        return;
    }

    messageops.finduser(req.decoded.email, (returnresult) => {
        res.json(returnresult);
    }, (user) => {
        messageops.send(req.body.message, groupid, user);
        res.json({
            success: true,
            message: 'message send'
        });
    })
});

messageRouter.get('/group/mygroups', (req, res) => {

});

messageRouter.get('/group/left', (req, res) => {

});

messageRouter.get('/group/delete', (req, res) => {

});

messageRouter.post('/sendmsg', (req, res) => {

});

messageRouter.get('/get', (req, res) => {
    
});