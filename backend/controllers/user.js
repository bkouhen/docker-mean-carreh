const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uid = require('uid-safe');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const hbs = require('nodemailer-express-handlebars');
const secrets = require('../secrets');

const env = process.env.NODE_ENV;
const JWT_KEY = secrets.read('jwt_key') || process.env.JWT_KEY;
const SG_API_KEY = secrets.read('sg_api_key') || process.env.SG_API_KEY
const SG_SENDER = secrets.read('sg_sender') || process.env.SG_SENDER
const contact_email = process.env.CONTACT_EMAIL;
let url = '';

let top_background = url + process.env.top_background;
let carreh_logo = url + process.env.carreh_logo;
let fb_logo = url + process.env.fb_logo;
let ig_logo = url + process.env.ig_logo;

if (env === 'development') {
    top_background = process.env.top_background;
    carreh_logo = process.env.carreh_logo;
    fb_logo = process.env.fb_logo;
    ig_logo = process.env.ig_logo;
}

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SG_API_KEY
    }
}))

transporter.use('compile', hbs({
    extName: '.hbs',
    viewEngine: {
        extName: '.hbs',
        partialsDir: './email-templates',
        layoutsDir: './email-templates',
        defaultLayout: false
    },
    viewPath: './email-templates'
}))

const User = require('../models/user');

const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

exports.createUser = (req, res, next) => {
    let host = req.get('host');
    const port = host.split(':')[1];
    if (port === '80' || port === '443') {
        host = host.split(':')[0]
    }
    url = req.get('x-forwarded-proto') + '://' + host;
    User.findOne({email : req.body.email})
    .then((user) => {
        if (user) {
            throw errorHandler('[Error] : Signup Fail - Email already exists', 401);
        }
        if (req.body.password !== req.body.confirmPassword) {
            throw errorHandler('[Error] : Signup Fail - Incorrect password confirmation', 401)
        }
        return bcrypt.hash(req.body.password, 10)
    })
    .then(hashedPassword => {
        const user = new User({
            email : req.body.email,
            password : hashedPassword,
            role: 'User',
            readStatus: 0
        });
        return user.save().then(createdUser => {
            const payload = {email: createdUser.email, userId: createdUser._id, role: createdUser.role, xsrfToken: uid.sync(18)};
            const jwt_token = jwt.sign(payload, JWT_KEY, {expiresIn: '1h'});
            res.cookie('access_token', jwt_token, {httpOnly: true, secure: false});
            res.status(201).json({
                message : 'User created successfully',
                xsrfToken : payload.xsrfToken,
                expiresIn : 3600,
                userId : createdUser._id,
                userEmail : createdUser.email
            });
            if (env === 'development') {
                return transporter.sendMail({
                    to: createdUser.email,
                    from: SG_SENDER,
                    subject: 'Bienvenue chez Carre H Spa',
                    template: 'signup',
                    context: {
                        url: url,
                        top_background: top_background,
                        carreh_logo: carreh_logo,
                        fb_logo: fb_logo,
                        ig_logo: ig_logo,
                        contact_email: contact_email
                    },
                    attachments: [
                        {
                            filename: 'carreh_logo.png',
                            path: 'static/images/email/carreh_logo.png',
                            cid: 'carreh_logo'
                        },
                        {
                            filename: 'fb_logo.png',
                            path: 'static/images/email/fb_logo.png',
                            cid: 'fb_logo'
                        },
                        {
                            filename: 'ig_logo.png',
                            path: 'static/images/email/ig_logo.png',
                            cid: 'ig_logo'
                        },
                        {
                            filename: 'top_background.jpg',
                            path: 'static/images/email/top_background.jpg',
                            cid: 'top_background'
                        }
                    ]
                }).catch(error => {
                    console.log(error);
                })
            }
            return transporter.sendMail({
                to: createdUser.email,
                from: SG_SENDER,
                subject: 'Bienvenue chez Carre H Spa',
                template: 'signup',
                context: {
                    url: url,
                    top_background: top_background,
                    carreh_logo: carreh_logo,
                    fb_logo: fb_logo,
                    ig_logo: ig_logo,
                    contact_email: contact_email
                }
            }).catch(error => {
                console.log(error);
            })
        }).catch(error => {
            console.log(error);
            throw errorHandler('[Error] : Signup server error occurred', 500)
        })
    }).catch(error => {
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    })
};

exports.loginUser = (req, res, next) => {
    let fetchedUser;
    User.findOne({email : req.body.email}).then(user => {
        if (!user) {
            throw errorHandler('[Error] : Authentication fail - User not found',401);
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password) 
    })
    .then(result => {
        if (!result) {
            throw errorHandler('[Error] : Authentication fail - Password not correct', 401);
        }
        const payload = {email: fetchedUser.email, userId: fetchedUser._id, role: fetchedUser.role, xsrfToken: uid.sync(18)};
        const jwt_token = jwt.sign(payload, JWT_KEY, {expiresIn: '1h'});
        res.cookie('access_token', jwt_token, {httpOnly: true, secure: false, maxAge: 4000000});
        res.status(200).json({
            message : 'User logged in successfully',
            xsrfToken : payload.xsrfToken,
            expiresIn : 3600,
            userId : fetchedUser._id,
            userEmail : fetchedUser.email
        })
    }).catch(error => {
        console.log(error);
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    });
};

exports.logoutUser = (req, res, next) => {
    res.clearCookie('access_token', {httpOnly: true, secure: false, maxAge: 0});
    return res.status(200).json({message: '[Success] : User logged out successfully'})
}

exports.updateUser = (req, res, next) => {
    const data = req.body;
    User.updateOne(
        {_id: data.id}, 
        {$set: {
            firstName: data.userInfo.firstName,
            lastName: data.userInfo.lastName,
            address: data.userInfo.address,
            city: data.userInfo.city,
            phoneNumber: data.userInfo.phoneNumber
        } })
        .then(result => {
            if (result.nModified > 0) {
                res.status(201).json({
                    message : '[Success] : User updated successfully'
                });
            }
        })
        .catch(error => {
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
};

exports.retrieveUser = (req, res, next) => {
    const id = req.params.id;
    User
    .findById(id)
    .select('email firstName lastName address city phoneNumber')
    .then(user => {
        if (!user) {
            throw errorHandler('[Error] : Authorization fail - User not found', 401);
        }
        return user;
    })
    .then(user => {
        console.log(user);
        res.status(200).json({
            message : '[Success] : User retrieved successfully',
            user: user
        });
    })
    .catch(error => {
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    })
}

exports.retrieveUsers = (req, res, next) => {
    User.find({role: 'User'})
        .select('email firstName lastName address city phoneNumber readStatus')
        .then(users => {
            if (!users) {
                throw errorHandler('[Error] : Authorization fail - Users not found', 401);
            }
            return users;
        })
        .then(users => {
            res.status(200).json({
                message: '[Success] : Users retrieved successfully',
                users: users
            })
        })
        .catch(error => {
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
}

exports.deleteUser = (req, res, next) => {
    User.findOne({_id: req.params.id})
        .then((user) => {
            if (user.role === 'Admin') {
                throw errorHandler('[Error] : Delete Fail - Admin account', 401);
            }
            return User.deleteOne({_id: req.params.id});
        })
        .then((result) => {
            console.log(result);
            if (result.deletedCount > 0) {
                res.status(200).json({message : '[Success] : User deleted successfully'});    
            } else {
                throw errorHandler('[Error] : Authorization Delete fail', 401)
            }
        })
        .catch((error) => {
            console.log(error);
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
}

exports.checkAdmin = (req, res, next) => {
    try {
        const isAdmin = req.userAdmin;
        if (!isAdmin) {
            throw errorHandler('[Error] : Admin authentication fail', 401);
        }
        if (!isAdmin.admin) {
            return res.status(200).json({
                isAdmin: false
            })
        }
        res.status(200).json({
            isAdmin: true
        })
    } catch (error) {
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    }
}

exports.checkProfileComplete = (req, res, next) => {
    User.findOne({_id: req.params.id})
        .select('email firstName lastName address city phoneNumber')
        .then((user) => {
            if (!user) {
                throw errorHandler('[Error] : Verification fail - User not found', 401);
            }
            return user
        })
        .then((fetchedUser) => {
            console.log(fetchedUser);
            if (!fetchedUser.firstName || !fetchedUser.lastName || !fetchedUser.address || !fetchedUser.phoneNumber) {
                return res.status(200).json({
                    profileComplete: false
                })
            }
            res.status(200).json({
                profileComplete: true
            })

        })
        .catch((error) => {
            console.log(error);
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server', 500);
                next(unknownError);
            }
        })
}

exports.sendContactMail = (req, res, next) => {
    let host = req.get('host');
    const port = host.split(':')[1];
    if (port === '80' || port === '443') {
        host = host.split(':')[0]
    }
    url = req.get('x-forwarded-proto') + '://' + host;
    console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    res.status(200).json({
        message: '[Success] : Email successfully sent'
    })
    if (env === 'development') {
        return transporter.sendMail({
            to: process.env.CONTACT_EMAIL,
            from: SG_SENDER,
            subject: 'Demande d\'information',
            template: 'contact',
            context: {
                name: name,
                email: email,
                message: message,
                url: url,
                top_background: top_background,
                carreh_logo: carreh_logo,
                fb_logo: fb_logo,
                ig_logo: ig_logo,
                contact_email: contact_email
            },
            attachments: [
                {
                    filename: 'carreh_logo.png',
                    path: 'static/images/email/carreh_logo.png',
                    cid: 'carreh_logo'
                },
                {
                    filename: 'fb_logo.png',
                    path: 'static/images/email/fb_logo.png',
                    cid: 'fb_logo'
                },
                {
                    filename: 'ig_logo.png',
                    path: 'static/images/email/ig_logo.png',
                    cid: 'ig_logo'
                },
                {
                    filename: 'top_background.jpg',
                    path: 'static/images/email/top_background.jpg',
                    cid: 'top_background'
                }
            ]
        }).catch(error => {
            console.log(error);
        })
    }
    return transporter.sendMail({
        to: process.env.CONTACT_EMAIL,
        from: SG_SENDER,
        subject: 'Demande d\'information',
        template: 'contact',
        context: {
            name: name,
            email: email,
            message: message,
            url: url,
            top_background: top_background,
            carreh_logo: carreh_logo,
            fb_logo: fb_logo,
            ig_logo: ig_logo,
            contact_email: contact_email
        }
    }).catch(error => {
        console.log(error);
    })
    .catch((error) => {
        console.log(error);
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server', 500);
            next(unknownError);
        }
    })}

    exports.resetPassword = (req, res, next) => {
        let host = req.get('host');
        const port = host.split(':')[1];
        if (port === '80' || port === '443') {
            host = host.split(':')[0]
        }
        url = req.get('x-forwarded-proto') + '://' + host;
        let token;
        User.findOne({email : req.body.email})
        .then(user => {
            if (!user) {
                throw errorHandler('[Error] : Authentication fail - User not found', 401);
            }
            token = uid.sync(32);
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save()  
        })
        .then(result => {
            res.status(200).json({
                message: '[Success] : Reset password email successfully sent'
            })
            if (env === 'development') {
                return transporter.sendMail({
                    to: req.body.email,
                    from: SG_SENDER,
                    subject: 'Réiniatilisation de votre mot de passe',
                    template: 'reset_password',
                    context: {
                        token: token,
                        url: url,
                        top_background: top_background,
                        carreh_logo: carreh_logo,
                        fb_logo: fb_logo,
                        ig_logo: ig_logo,
                        contact_email: contact_email
                    },
                    attachments: [
                        {
                            filename: 'carreh_logo.png',
                            path: 'static/images/email/carreh_logo.png',
                            cid: 'carreh_logo'
                        },
                        {
                            filename: 'fb_logo.png',
                            path: 'static/images/email/fb_logo.png',
                            cid: 'fb_logo'
                        },
                        {
                            filename: 'ig_logo.png',
                            path: 'static/images/email/ig_logo.png',
                            cid: 'ig_logo'
                        },
                        {
                            filename: 'top_background.jpg',
                            path: 'static/images/email/top_background.jpg',
                            cid: 'top_background'
                        }
                    ]
                }).catch(error => {
                    console.log(error);
                })
            }
            return transporter.sendMail({
                to: req.body.email,
                from: SG_SENDER,
                subject: 'Réiniatilisation de votre mot de passe',
                template: 'reset_password',
                context: {
                    token: token,
                    url: url,
                    top_background: top_background,
                    carreh_logo: carreh_logo,
                    fb_logo: fb_logo,
                    ig_logo: ig_logo,
                    contact_email: contact_email
                }
            }).catch(error => {
                console.log(error);
            })  
        })
        .catch((error) => {
            console.log(error);
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server', 500);
                next(unknownError);
            }
        })
    }

    exports.checkResetPasswordToken = (req, res, next) => {
        const token = req.params.token;
        User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if (!user) {
                throw errorHandler('[Error] : Authentication fail - Reset token not found', 401);
            }
            res.status(200).json({
                message: '[Success] : Password reset token successfully verified',
                email: user.email,
                userId: user._id
            })
        })
        .catch((error) => {
            console.log(error);
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server', 500);
                next(unknownError);
            }
        })
    }

    exports.setNewPassword = (req, res, next) => {
        const data = req.body;
        console.log(data);  
        let resetUser;
        if (data.password !== data.confirmPassword) {
            throw errorHandler('[Error] : Reset Password Fail - Incorrect password confirmation', 401)
        }
        User.findOne({_id: data.userId, email: data.email, resetToken: data.passwordToken, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if (!user) {
                throw errorHandler('[Error] : Authentication fail - User not found', 401);
            }
            resetUser = user;
            return bcrypt.compare(data.password, user.password)
        })
        .then(result => {
            if (result) {
                throw errorHandler('[Error] : Reset fail - Change password not correct', 401);
            }
            return bcrypt.hash(data.password, 10)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save()
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message : '[Success] : User Password updated successfully'
            });
        })
        .catch(error => {
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
    }

    exports.updateReadStatus = (req, res, next) => {
        User.updateOne(
            {_id: req.params.id}, 
            {$set: {
                readStatus: 1
            } })
            .then(result => {
                if (result.nModified > 0) {
                    res.status(201).json({
                        message : '[Success] : User Read Status updated successfully'
                    });
                }
            })
            .catch(error => {
                if (error && error.status) {
                    next(error)
                } else {
                    const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                    next(unknownError);
                }
            })
    }