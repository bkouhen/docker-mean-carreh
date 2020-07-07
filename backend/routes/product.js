const express = require('express');
const router = express.Router();

const productController = require('../controllers/product');

const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-role');
const errorAdmin = require('../middleware/error-admin');

const uploadProducts = require('../middleware/multer-file').uploadProducts;

router.post('/create', checkAuth, checkAdmin, errorAdmin, (req, res, next) => {
    uploadProducts(req, res, (err) => {
        if (err && err.message === 'Invalid Mime Type') {
            const thrownError = errorHandler('[Error] : Upload fail - Mime type not authorized',401)
            next(thrownError)
        } else if (err) {
            const thrownError = errorHandler('[Error] : Upload fail - Error occurred while uploading files',401)
            next(thrownError)
        }
        next()
    })
}, productController.createProduct);

router.put('/update/:id' , checkAuth, checkAdmin, errorAdmin, (req, res, next) => {
    uploadProducts(req, res, (err) => {
        if (err && err.message === 'Invalid Mime Type') {
            const thrownError = errorHandler('[Error] : Upload fail - Mime type not authorized',401)
            next(thrownError)
        } else if (err) {
            const thrownError = errorHandler('[Error] : Upload fail - Error occurred while uploading files',401)
            next(thrownError)
        }
        next()
    })
}, productController.updateProduct);

router.get('/', productController.getProducts)

router.get('/:id', checkAuth, checkAdmin, errorAdmin, productController.getProduct);

router.delete('/:id', checkAuth, checkAdmin, errorAdmin, productController.deleteProduct)

module.exports = router;