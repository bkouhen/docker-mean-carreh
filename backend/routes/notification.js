const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification');

const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-role');
const errorAdmin = require('../middleware/error-admin');

router.get('/', checkAuth, checkAdmin, errorAdmin, notificationController.getNotifications);

module.exports = router;