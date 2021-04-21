const Product = require('../models/product');

const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

exports.createProduct = (req, res, next) => {
    let host = req.get('host');
    const port = host.split(':')[1];
    if (port === '80' || port === '443') {
        host = host.split(':')[0]
    }
    const url = req.get('x-forwarded-proto') + '://' + host;
    //const url = req.get('origin');
    const newProduct = new Product({
        title: req.body.title,
        category: req.body.category,
        subCategory: req.body.subCategory,
        image: url + '/images/products/' + req.file.filename,
        price: parseInt(req.body.price),
        description: req.body.description
    })
    newProduct.save().then(createdProduct => {
        res.status(201).json({
            message : '[Success] : Product added successfully',
            product: createdProduct
        });
    }).catch((error) => {
        console.log(error);
        const serverError = errorHandler('[Error] : Server error occurred', 500);
        next(serverError);
    })
}

exports.getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.status(200).json({
                message: '[Success] Products retrieved successfully',
                products: products
            })
        })
        .catch((error) => {
            console.log(error);
            const serverError = errorHandler('[Error] : Server error occurred', 500);
            next(serverError);
        })
}

exports.getProduct = (req, res, next) => {
    Product.findById(req.params.id)
    .then((product) => {
        res.status(200).json({
            message: '[Success] Product retrieved successfully',
            product: product
        })
    })
    .catch((error) => {
        console.log(error);
        const serverError = errorHandler('[Error] : Server error occurred', 500);
        next(serverError);
    })
}

exports.updateProduct = (req, res, next) => {
    let imagePath = req.body.image;
    if (req.file) {
        //const url = req.protocol + '://' + req.get('host');
        const url = req.get('origin');
        imagePath = url + '/images/products/' + req.file.filename;
    }
    const newProduct = new Product({
        _id: req.params.id,
        title: req.body.title,
        category: req.body.category,
        subCategory: req.body.subCategory,
        image: imagePath,
        price: parseInt(req.body.price),
        description: req.body.description
    });
    Product.updateOne({_id: req.params.id}, newProduct) 
        .then(result => {
            if (result.nModified > 0) {
                res.status(201).json({
                    message : '[Success] : Product updated successfully'
                });
            }
        }).catch((error) => {
            if (error && error.status) {
                next(error);
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })

}

exports.deleteProduct = (req, res, next) => {
    Product.deleteOne({_id: req.params.id})
        .then((result) => {
            console.log(result);
            if (result.deletedCount > 0) {
                res.status(200).json({message : '[Success] : Product deleted successfully'});    
            } else {
                throw errorHandler('[Error] : Authorization Delete fail', 401)
            }
        })
        .catch((error) => {
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
}