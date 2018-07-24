const nodemailer = require('nodemailer');
const emailverification = require('./email_verification');

const mailsubject = '';
const mailcodelength = 6;

module.exports.senderemail = {
    service: 'gmail',
    auth: {
        user: 'info.chat.v2@gmail.com',
        pass: '333xwx333'
    }
}

module.exports.sender = function (sendto, text, senderemail) {
    if (!senderemail) {
        senderemail = require('./email').senderemail;
    }

    var transporter = nodemailer.createTransport(senderemail);

    var code = require('../../unil/random_letter')(mailcodelength);

    text = text + ' ' + code;

    var mailoptions = {
        from: senderemail.auth.user,
        to: sendto,
        subject: mailsubject,
        text
    }

    var result = emailverification.writequeue({
        email: sendto,
        code: code
    });


    transporter.sendMail(mailoptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    return {
        success: true
    };

}