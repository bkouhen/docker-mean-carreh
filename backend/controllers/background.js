const Background = require('../models/background');

const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

exports.updateBackground = (req, res, next) => {
    let host = req.get('host');
    const port = host.split(':')[1];
    if (port === '80' || port === '443') {
        host = host.split(':')[0]
    }
    const url = req.get('x-forwarded-proto') + '://' + host;
    //const url = req.get('origin');
    const files = req.files;
    let newFiles = [];
    let imageFiles = []; 
    if (!req.body.notUpdatedPos) {
        for (let file of files) {
            const i = files.indexOf(file);
            newFiles.push({url: url + '/images/background/' + file.filename, position: i});
            imageFiles.push({url: url + '/images/background/' + file.filename, position: i});
        }
    } else {
        let sum = 0;
        const notUpLength = req.body.notUpdatedPos.length;
        for (let pos of req.body.notUpdatedPos) {
            newFiles.push({url: 'null', position: +pos})
            sum += +pos;
        }
        switch (notUpLength) {
            case 0:
                break;
            case 1:
                switch (sum) {
                    case 0:
                        for (let file of files) {
                            const i = files.indexOf(file) + 1;
                            newFiles.push({url: url + '/images/background/' + file.filename, position: i});
                            imageFiles.push({url: url + '/images/background/' + file.filename, position: i});
                        }
                        break;
                    case 1:
                        for (let file of files) {
                            let i = files.indexOf(file);
                            if (i !== 0) {
                                i += 1;
                            }
                            newFiles.push({url: url + '/images/background/' + file.filename, position: i});
                            imageFiles.push({url: url + '/images/background/' + file.filename, position: i});
                        }
                        break;
                    case 2:
                        for (let file of files) {
                            const i = files.indexOf(file);
                            newFiles.push({url: url + '/images/background/' + file.filename, position: i});
                            imageFiles.push({url: url + '/images/background/' + file.filename, position: i});
                        }
                        break;
                    default:
                        break;
                }
                break;
            case 2:
                switch (sum) {
                    case 1:
                        for (let file of files) {
                            const i = files.indexOf(file) + 2;
                            newFiles.push({url: url + '/images/background/' + file.filename, position: i});
                            imageFiles.push({url: url + '/images/background/' + file.filename, position: i});
                        }
                        break;
                    case 2:
                        for (let file of files) {
                            const i = files.indexOf(file) + 1;
                            newFiles.push({url: url + '/images/background/' + file.filename, position: i});
                            imageFiles.push({url: url + '/images/background/' + file.filename, position: i});
                        }
                        break;
                    case 3:
                        for (let file of files) {
                            const i = files.indexOf(file);
                            newFiles.push({url: url + '/images/background/' + file.filename, position: i});
                            imageFiles.push({url: url + '/images/background/' + file.filename, position: i});
                        }
                        break;
                    default:
                        break;
                }
                break;                
            case 3:
                break;
            default:
                break;
        }
    }
    Background.find()
        .then((background) => {
            if (background && background.length === 0) {
                return Background.insertMany(newFiles)
                .then(() => {
                    res.status(201).json({
                        message : '[Success] : Background updated successfully'
                    });
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            }
            if (background && background.length === 3) {
                imageFiles.forEach((image) => {
                    const pos = image.position;
                    return Background.updateOne({position: pos}, image)
                    .then(() => {
                        res.status(201).json({
                            message : '[Success] : Background ' + pos + ' updated successfully'
                        });
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                })
            }
        })
        .catch(error => {
            console.log(error);
            const serverError = errorHandler('[Error] : Server error occurred', 500);
            next(serverError);
        })
}

exports.getBackground = (req, res, next) => {
    Background.find({})
        .then((background) => {
            if (!background) {
                throw errorHandler('[Error] : Background not found',401);
            }
            res.status(200).json({
                message : '[Success] : Background retrieved successfully',
                background: background
            })
        })
        .catch((error) => {
            console.log(error);
            const serverError = errorHandler('[Error] : Server error occurred', 500);
            next(serverError);
        })
}

exports.deleteBackground = (req, res, next) => {
    const position = req.params.position;
    const newBkg = {
        url : 'null',
        position: position
    }
    Background.updateOne({position: position}, newBkg)
        .then((result) => {
            console.log(result);
            if (result.nModified > 0) {
                res.status(200).json({message : '[Success] : Background ' + position + ' deleted successfully'});    
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
