const express = require('express');

const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-role');
const errorAdmin = require('../middleware/error-admin');

const orderController = require('../controllers/order')

router.post('/create', orderController.createOrder);

router.get('', checkAuth, checkAdmin, errorAdmin, orderController.retrieveOrders);

router.get('/users/:id', checkAuth, orderController.retrieveUserOrder);

router.put('/updateReadStatus/:id', orderController.updateReadStatus);

module.exports = router;