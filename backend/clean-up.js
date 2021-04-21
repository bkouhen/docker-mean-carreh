const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const secrets = require('./secrets');

const Background = require('./models/background');
const Product = require('./models/product');

let backgroundFileNames = [];
let productFileNames = [];

const env = process.env.NODE_ENV;
const MONGO_ATLAS_PASSWORD = secrets.read('mongo_atlas_password') || process.env.MONGO_ATLAS_PASSWORD;
let MONGO_URI = '';

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

Background.find()
    .then(background => {
        if (background) {
            background.forEach(bkg => {
                const fileName = bkg.url.split('/').pop();
                backgroundFileNames.push(fileName);
            })
        }
        return Product.find()
    })
    .then(products => {
        if (products) {
            products.forEach(product => {
                const fileName = product.image.split('/').pop();
                productFileNames.push(fileName);
            })
        }
    })
    .then(() => {
        let filesDeleted = 0;
        const backgroundFolder = path.join(__dirname, './static/images/background');
        const productsFolder = path.join(__dirname, './static/images/products');
        const backgroundFiles = fs.readdirSync(backgroundFolder);
        const productsFiles = fs.readdirSync(productsFolder);
        backgroundFiles.forEach(bkg => {
            if (!backgroundFileNames.includes(bkg)) {
                fs.unlinkSync(backgroundFolder + '/' + bkg);
                filesDeleted += 1;
            }
        });
        productsFiles.forEach(product => {
            if (!productFileNames.includes(product)) {
                fs.unlinkSync(productsFolder + '/' + product);
                filesDeleted += 1;
            }
        });
        console.log(filesDeleted + ' fichiers supprimés.');
        mongoose.disconnect();
        process.exit();
    })
    .catch(error => {
        console.log(error);
    });