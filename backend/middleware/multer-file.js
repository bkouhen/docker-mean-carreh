const multer = require('multer');

const MIME_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpg',
    'image/jpg' : 'jpg'
}

const storageProducts = multer.diskStorage({
    destination : (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid Mime Type');
        if (isValid) {
            error = null;
        }
        cb(error, './static/images/products')
    },
    filename : (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-').split('.')[0];
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
})

const storageBackground = multer.diskStorage({
    destination : (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid Mime Type');
        if (isValid) {
            error = null;
        }
        cb(error, './static/images/background')
    },
    filename : (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-').split('.')[0];
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
})

var uploadProducts = multer({storage: storageProducts}).single('image');
var uploadBackground = multer({storage: storageBackground}).array('background', 3);

module.exports.uploadProducts = uploadProducts;
module.exports.uploadBackground = uploadBackground;