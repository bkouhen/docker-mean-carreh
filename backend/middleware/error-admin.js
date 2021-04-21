const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

module.exports = (req, res, next) => {
    try {
        const isAdmin = req.userAdmin;
        if (!isAdmin) {
            throw errorHandler('[Error] : Admin authentication fail', 401);
        }
        if (!isAdmin.admin) {
            throw errorHandler('[Error] : Admin authentication fail', 401);
        }
        next();
    } catch (error) {
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    }
    

}