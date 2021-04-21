const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const hbs = require('nodemailer-express-handlebars');
const secrets = require('../secrets');

const env = process.env.NODE_ENV;
const SG_API_KEY = secrets.read('sg_api_key') || process.env.SG_API_KEY
const SG_SENDER = secrets.read('sg_sender') || process.env.SG_SENDER
const contact_email = process.env.CONTACT_EMAIL;
let url = '';

const top_background = process.env.top_background;
const carreh_logo = process.env.carreh_logo;
const fb_logo = process.env.fb_logo;
const ig_logo = process.env.ig_logo;

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

const Order = require('../models/order');
const User = require('../models/user');

const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

exports.createOrder = (req, res, next) => {
    let host = req.get('host');
    const port = host.split(':')[1];
    if (port === '80' || port === '443') {
        host = host.split(':')[0]
    }
    url = req.get('x-forwarded-proto') + '://' + host;
    const userId = req.body.userId;
    User.findOne({email : req.body.email})
    .then((user) => {
        if (!user && userId) {
            throw errorHandler('[Error] : Authentication fail - User not found',401);
        }
        if (userId) {
            return user;
        } else {
            return null;
        }
    })
    .then((userFound) => {
        let newOrder;
        if (userFound) {
            newOrder = new Order({
                email: req.body.email,
                firstName: userFound.firstName,
                lastName: userFound.lastName,
                address: userFound.address,
                city: userFound.city,
                phoneNumber: userFound.phoneNumber,
                price: req.body.price,
                date: req.body.date,
                items : req.body.items,
                userId: req.body.userId,
                readStatus: 0
            })
        } else {
            newOrder = new Order({
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                city: req.body.city,
                phoneNumber: req.body.phoneNumber,
                price: req.body.price,
                date: req.body.date,
                items : req.body.items,
                readStatus: 0
            })
        }
        return newOrder.save()
        .then(createdOrder => {
            res.status(201).json({
                message : '[Success] : Order added successfully',
                order: createdOrder
            });
            if (env === 'development') {
                return transporter.sendMail({
                    to: createdOrder.email,
                    from: SG_SENDER,
                    subject: 'Merci pour votre commande !',
                    template: 'order_conf',
                    context: {
                        firstName: createdOrder.firstName,
                        lastName: createdOrder.lastName,
                        address: createdOrder.address,
                        city: createdOrder.city,
                        phoneNumber: createdOrder.phoneNumber,
                        price: createdOrder.price,
                        items: createdOrder.items,
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
                to: createdOrder.email,
                from: SG_SENDER,
                subject: 'Merci pour votre commande !',
                template: 'order_conf',
                context: {
                    firstName: createdOrder.firstName,
                    lastName: createdOrder.lastName,
                    address: createdOrder.address,
                    city: createdOrder.city,
                    phoneNumber: createdOrder.phoneNumber,
                    price: createdOrder.price,
                    items: createdOrder.items,
                    url: url,
                    top_background: url + top_background,
                    carreh_logo: url + carreh_logo,
                    fb_logo: url + fb_logo,
                    ig_logo: url + ig_logo,
                    contact_email: contact_email
                }
            }).catch(error => {
                console.log(error);
            })
        })
        .catch((error) => {
            console.log(error);
            throw errorHandler('[Error] : Order creation error occurred', 500);
        })
    })
    .catch((error) => {
        console.log(error);
        const serverError = errorHandler('[Error] : Server error occurred', 500);
        next(serverError);
    })
    
    
}

exports.retrieveOrders = (req, res, next) => {
    Order.find()
        .then(orders => {
            if (!orders) {
                throw errorHandler('[Error] : Authorization fail - Orders not found', 401);
            }
            return orders;
        })
        .then(orders => {
            res.status(200).json({
                message: '[Success] : Orders retrieved successfully',
                orders: orders
            })
        })
        .catch(error => {
            console.log(error);
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
}

exports.retrieveUserOrder = (req, res, next) => {
    Order.find({userId: req.params.id})
    .select('-userId')
    .then(orders => {
        if (!orders) {
            throw errorHandler('[Error] : Authorization fail - Orders not found', 401);
        }
        return orders;
    })
    .then(orders => {
        res.status(200).json({
            message: '[Success] : Orders retrieved successfully',
            orders: orders
        })
    })
    .catch(error => {
        console.log(error);
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    })
}

exports.updateReadStatus = (req, res, next) => {
    Order.updateOne(
        {_id: req.params.id}, 
        {$set: {
            readStatus: 1
        } })
        .then(result => {
            if (result.nModified > 0) {
                res.status(201).json({
                    message : '[Success] : Order Read Status updated successfully'
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