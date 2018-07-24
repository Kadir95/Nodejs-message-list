const messagegroups = require('../models/messageGroup');
const User = require('../models/user');
const arrayutil = require('../../unil/arrayuitl');

module.exports.createandsend = function (messagetext, messagegroupid, messagewriter, user) {
    console.log('');
    send(create(messagetext, messagewriter), messagegroupid, user);
}

var send = function (message, messagegroupid, user) {
    messagegroups.findById(messagegroupid, (err, group) => {
        if (err) {

        } else {
            group.messages.push({
                messagetext: message,
                user: {
                    email: user.email,
                    name: user.name,
                    date: new Date()
                }
            });
            group.save();
        }
    });
}
module.exports.send = send;

var sendtoperson = function (message, senderuser, reciveruser) {
    messagegroups.findOne({
        users: {
            $all: [
                senderuser,
                reciveruser
            ]
        }
    }, {
        $push: {
            messages: message
        }
    });
}
module.exports.sendtoperson = sendtoperson;

var create = function (messagetext, messagewriter) {
    var message = {
        text: messagetext,
        date: new Date(),
        writer: messagewriter
    }

    return message;
}
module.exports.create = create;

var findmessagegroups = function (user, foo, next) {
    messagegroups.find({
        users: {
            $elemMatch: {
                email: user.email
            }
        }
    }, (err, results) => {
        if (err) {
            foo({
                success: false,
                message: 'finding message groups operation failed'
            });
            return;
        } else {
            next(results);
            return;
        }
    });
}
module.exports.findmessagegroups = findmessagegroups;

var createmessagegroup = function (user, groupname) {
    var messagegroup = new messagegroups({
        groupName: groupname,
        creationDate: new Date(),
        creator: user,
        users: [user]
    });

    var success = false;

    messagegroup.save((err) => {
        if (err) {
            console.log('An error occur when message group was creating');
        } else {
            success = true;
        }
    });

    return messagegroup;
}
module.exports.createmessagegroup = createmessagegroup;

var addperson = function (groupid, email, foo) {
    return messagegroups.findById(groupid, (err, group) => {
        if (err) {
            console.log(err);
            foo({
                success: false,
                message: 'An error occur in adding operation'
            });
            return;
        } else {
            return User.findOne({
                email: email
            }, (err, person) => {
                if (err) {
                    console.log(err);
                    foo({
                        success: false,
                        message: 'An error occur in adding operation\nPerson could not find'
                    });
                    return;
                } else {
                    if (person != null) {
                        if (arrayutil.containsperson(group.users, person)) {
                            foo({
                                success: false,
                                message: 'User already in the group'
                            });
                            return;
                        }

                        group.users.push(person);
                        group.save();
                        foo({
                            success: true,
                            message: 'person added successfully\n' + person.name + ' -> ' + group.groupName
                        });
                        return;
                    } else {
                        foo({
                            success: false,
                            message: 'there is no user'
                        });
                    }
                }
            });
        }
    });
    foo({
        success: false,
        message: 'An error occur'
    });
}
module.exports.addperson = addperson;

var findgroupanduser = function (groupid, email, foo, next) {
    messagegroups.findById(groupid, (err, group) => {
        if (err) {
            foo({
                success: false,
                message: 'group could not found'
            });
            return;
        } else {
            User.find({
                email: email
            }, (err, user) => {
                if (err) {
                    foo({
                        success: false,
                        message: 'user could not found'
                    });
                    return
                } else {
                    next(group, user);
                    return;
                }
            });
        }
    });
    foo({
        success: false,
        message: 'An error occur'
    });
}
module.exports.findgroupanduser = findgroupanduser;

var finduser = function (email, foo, next) {
    User.findOne({
        email
    }, (err, user) => {
        if (err) {
            foo({
                success: false,
                message: 'user could not found'
            });
            return;
        } else {
            next(user);
            return;
        }
    });
}
module.exports.finduser = finduser;

var findgroups = function (user, foo, next) {
    messagegroups.find({});
}
module.exports.findgroups = findgroups;