const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./app/models/user');
const crypto = require('crypto');

var app = express();

var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(morgan('dev'))

app.get('/setup', (req, res) => {
    if (req.query.username && req.query.password && req.query.email) {
        var hashedpassword = crypto.createHmac('sha512', req.query.email)
            .update(req.query.password).digest('base64');

        delete req.query.password

        var user = new User({
            name: req.query.username,
            password: hashedpassword,
            email: req.query.email,
            emailverify: false,
            creationdate: new Date(),
            admin: false
        });

        user.save((err) => {
            if (err) {
                console.log(err);
                res.json({
                    success: false,
                    error: 'User already exists'
                });
                return;
            }

            res.json({
                success: true,
                username: user.name,
                email: user.email
            });
        });
    } else {
        res.json({
            success: false,
            message: "query doesn't include username, password or email"
        });
    }
});

app.post('/authenticate', (req, res) => {

    var hashedpassword = crypto.createHmac('sha512', req.body.email)
        .update(req.body.password).digest('base64');

    delete req.body.password

    User.findOne({
        $and: [{
                password: hashedpassword
            },
            {
                email: req.body.email
            }
        ]
    }, (err, user) => {
        if (err) {
            res.json({
                success: false,
                error: 'authentication failed',
                message: 'An error occur when user name and password searching on data base'
            });
            return;
        }

        if (!user) {
            res.json({
                success: false,
                message: 'Password or Username is wrong'
            });
        } else {
            const payload = {
                tokenDate: new Date(),
                username: user.name,
                email: user.email
            };

            var token = jwt.sign(payload, app.get('superSecret'), {
                expiresIn: 10800
            });

            res.json({
                success: true,
                message: 'Enjoy your token! :)',
                token
            });
        }
    });
});

var apiRouter = express.Router();

apiRouter.use((req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['access-token'];

    if (token) {
        jwt.verify(token, app.get('superSecret'), (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'unvalid token'
                });
            } else {
                req.decoded = decoded;

                User.findOne({
                    email: decoded.email,
                    name: decoded.username
                }, (err, user) => {
                    if (err) {
                        console.log('api middleware last login date update error\n' + err);
                    } else {
                        user.lastinteractiondate = new Date();
                        user.save();
                    }
                });

                next();
            }
        });
    } else {
        return res.status(403).json({
            success: false,
            message: 'No token'
        });
    }
});

apiRouter.get('/', (req, res) => {
    res.json({
        message: 'API is healty'
    });
});

apiRouter.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        res.json(users);
    });
});

const apiverifyRouter = require('./app/routers/verification_router');

apiRouter.use('/verify', apiverifyRouter);

const messageRouter = require('./app/routers/message_router');

apiRouter.use('/msg', messageRouter);

app.use('/api', apiRouter);

app.listen(port, () => {
    console.log('server online at http://localhost:' + port);
});