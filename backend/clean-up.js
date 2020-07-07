const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Background = require('./models/background');
const Product = require('./models/product');

let backgroundFileNames = [];
let productFileNames = [];

const MONGO_ATLAS_PASSWORD = 'KCOQEN4jquXHF3od';

/* mongoose.connect("mongodb+srv://bob:" + MONGO_ATLAS_PASSWORD + "@cluster0-t7rkc.mongodb.net/carreh-db?retryWrites=true&w=majority", {useNewUrlParser : true, useUnifiedTopology : true})
.then(() => {
    console.log('Connected to Database');
})
.catch(() => {
    console.log('Connection failed');
}); */

mongoose.connect("mongodb://database:27017/docker-mean-db?retryWrites=true&w=majority", {useNewUrlParser : true, useUnifiedTopology : true})
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