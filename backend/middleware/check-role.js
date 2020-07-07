const User = require('../models/user');

const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

module.exports = (req, res, next) => {
    console.log('Checking admin authorization');
    const userData = req.userData;
    User.findOne({_id: userData.userId, email: userData.email}).then(user => {
        if (!user) {
            throw errorHandler('[Error] : Authentication fail - User not found',401);
        }
        if (!userData) {
            throw errorHandler('[Error] : Admin authentication fail', 401);
        } 
        return user;
    })
    .then(user => {
        if (user.role === 'Admin' && userData.role === 'Admin') {
            req.userAdmin = {admin: true};
            next()
        } else {
            req.userAdmin = {admin: false};
            next();
        }
    }).catch(error => {
        console.log(error);
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    }); 

}