const express = require('express');
const router = express.Router();

const backgroundController = require('../controllers/background');

const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-role');
const errorAdmin = require('../middleware/error-admin');

const uploadBackground = require('../middleware/multer-file').uploadBackground;

router.post('/update', checkAuth, checkAdmin, errorAdmin, (req, res, next) => {
    uploadBackground(req, res, (err) => {
        if (err && err.message === 'Invalid Mime Type') {
            const thrownError = errorHandler('[Error] : Upload fail - Mime type not authorized',401)
            next(thrownError)
        } else if (err) {
            const thrownError = errorHandler('[Error] : Upload fail - Error occurred while uploading files',401)
            next(thrownError)
        }
        next()
    })
},backgroundController.updateBackground);

router.get('/', backgroundController.getBackground);

router.delete('/delete/:position', checkAuth, checkAdmin, errorAdmin, backgroundController.deleteBackground);

module.exports = router;