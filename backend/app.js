const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const secrets = require('./secrets');

const env = process.env.NODE_ENV;
const MONGO_ATLAS_PASSWORD = secrets.read('mongo_atlas_password') || process.env.MONGO_ATLAS_PASSWORD;
let MONGO_URI = '';

const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const categoryRoutes = require('./routes/category');
const backgroundRoutes = require('./routes/background');
const notificationsRoutes = require('./routes/notification');
const appointmentsRoutes = require('./routes/appointment');
const app = express();

if (env === 'development') {
    console.log('Development environment');
    MONGO_URI = "mongodb://database:27017/docker-mean-db?retryWrites=true&w=majority";
} else if (env === 'production') {
    console.log('Production environment');
    MONGO_URI = "mongodb+srv://bob:" + MONGO_ATLAS_PASSWORD + "@cluster0-t7rkc.mongodb.net/docker-mean-db?retryWrites=true&w=majority";
}

mongoose.connect(MONGO_URI, {useNewUrlParser : true, useUnifiedTopology : true})
.then(() => {
    console.log('Connected to Database');
})
.catch(() => {
    console.log('Connection failed');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());
app.use('/images/products', express.static(path.join(__dirname, './static/images/products')));
app.use('/images/background', express.static(path.join(__dirname, './static/images/background')));
app.use('/images/email', express.static(path.join(__dirname, './static/images/email')));

app.use((req, res, next) => {
    //console.log('Cookies: ', req.cookies);
    /* var allowedOrigins = ['http://52.47.77.66', 'https://52.47.77.66', 'http://carreh.tk', 'http://www.carreh.tk', 'https://carreh.tk', 'https://www.carreh.tk', 'http://localhost:4200'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin);
    } */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Access, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    //res.setHeader('Set-Cookie', 'mycookie=true');
    next();
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/background', backgroundRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/appointments', appointmentsRoutes);

app.use((req, res, next) => {
    const error = new Error('Path not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    console.log('App error handler middleware reached');
    console.log(error);
    res.status(error.status || 500).json({
        message : error.message || '[Error] : This API doesn\'t exist'
    })
})

module.exports = app;
