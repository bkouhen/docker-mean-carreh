const express = require('express');

const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-role');
const errorAdmin = require('../middleware/error-admin');

const appointmentController = require('../controllers/appointment')

router.post('/create', appointmentController.createAppointment);

router.get('', checkAuth, checkAdmin, errorAdmin, appointmentController.retrieveAppointments);

router.get('/taken', appointmentController.retrieveTakenAppointments);

router.get('/users/:id', checkAuth, appointmentController.retrieveUserAppointments);

router.put('/updateReadStatus/:id', appointmentController.updateReadStatus);

module.exports = router;