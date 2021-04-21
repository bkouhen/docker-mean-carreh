const express = require('express');

const router = express.Router();

const userController = require('../controllers/user')

const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-role');
const errorAdmin = require('../middleware/error-admin');

router.post('/signup', userController.createUser);

router.post('/login', userController.loginUser);

router.get('/logout', checkAuth, userController.logoutUser);

router.get('/:id', checkAuth, userController.retrieveUser);

router.get('', checkAuth, checkAdmin, errorAdmin, userController.retrieveUsers);

router.put('/update/:id', checkAuth, userController.updateUser);

router.delete('/delete/:id', checkAuth, checkAdmin, errorAdmin, userController.deleteUser);

router.get('/admin/isAdmin', checkAuth, checkAdmin, userController.checkAdmin);

router.get('/profileComplete/:id', checkAuth, userController.checkProfileComplete);

router.post('/contact', userController.sendContactMail);

router.post('/resetPassword', userController.resetPassword);

router.get('/resetPassword/:token', userController.checkResetPasswordToken);

router.put('/setNewPassword', userController.setNewPassword);

router.put('/updateReadStatus/:id', userController.updateReadStatus);

module.exports = router;