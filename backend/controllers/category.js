const Category = require('../models/category');

const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

exports.createCategory = (req, res, next) => {
    const newCategory = new Category({
        title: req.body.title,
        subCategories: req.body.subCategories
    })
    newCategory.save().then(createCategory => {
        res.status(201).json({
            message : '[Success] : Category added successfully',
            category: createCategory
        });
    }).catch((error) => {
        console.log(error);
        const serverError = errorHandler('[Error] : Server error occurred', 500);
        next(serverError);
    })
}

exports.getCategories = (req, res, next) => {
    Category.find()
        .then((categories) => {
            res.status(200).json({
                message: '[Success] Categories retrieved successfully',
                categories: categories
            })
        })
        .catch((error) => {
            console.log(error);
            const serverError = errorHandler('[Error] : Server error occurred', 500);
            next(serverError);
        })
}

exports.getCategory = (req, res, next) => {
    Category.findById(req.params.id)
    .then((category) => {
        res.status(200).json({
            message: '[Success] Category retrieved successfully',
            category: category
        })
    })
    .catch((error) => {
        console.log(error);
        const serverError = errorHandler('[Error] : Server error occurred', 500);
        next(serverError);
    })
}

exports.updateCategory = (req, res, next) => {
    const newCategory = new Category({
        _id: req.params.id,
        title: req.body.title,
        subCategories: req.body.subCategories
    });
    Category.updateOne({_id: req.params.id}, newCategory) 
        .then(result => {
            if (result.nModified > 0) {
                res.status(201).json({
                    message : '[Success] : Category updated successfully'
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

exports.deleteCategory = (req, res, next) => {
    Category.deleteOne({_id: req.params.id})
        .then((result) => {
            console.log(result);
            if (result.deletedCount > 0) {
                res.status(200).json({message : '[Success] : Category deleted successfully'});    
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