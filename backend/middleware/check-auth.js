const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log('Checking authorization');
    console.log(req.headers);
    console.log(req.cookies);
    try {
        const xsrfToken = req.headers.authorization.split(' ')[1];
        const jwt_token = req.cookies.access_token;
        console.log(xsrfToken, jwt_token);
        if ((xsrfToken || jwt_token) === 'undefined' || (xsrfToken || jwt_token) === 'null') {
            const thrownError = new Error('[Error] : Authentication fail - No token found');
            thrownError.status = 401;
            throw thrownError
        } 
        //const decodedToken = jwt.verify(xsrfToken, process.env.JWT_KEY);
        jwt.verify(jwt_token, process.env.JWT_KEY, (err, decoded) => {
            console.log(decoded);
            console.log(err);
            if (decoded.xsrfToken !== xsrfToken) {
                // Attaque CSRF
                const thrownError = new Error('[Error] : Breach fail - CSRF/XSRF');
                thrownError.status = 403;
                throw thrownError
            } else {
                req.userData = {email : decoded.email, userId : decoded.userId, role: decoded.role};
                next();
            }
        })
    } catch (error) {
        console.log(error);
        if (error.message === 'invalid signature') {
            thrownError = Error('[Error] : Authentication fail - No token found');
            thrownError.status = 401;
            return next(thrownError)
        }
        next(error);
    }
    

}