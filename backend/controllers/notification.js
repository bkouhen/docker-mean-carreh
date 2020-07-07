const User = require('../models/user');
const Order = require('../models/order');
const Appointment = require('../models/appointment');

exports.getNotifications = (req, res, next) => {
    let totalCount = 0;
    let gUserCount = 0;
    let gOrderCount = 0;
    let gAppointmentCount = 0;
    User.countDocuments({readStatus: 0})
        .then(userCount => {
            totalCount += userCount;
            gUserCount = userCount;
            return Appointment.countDocuments({readStatus: 0})
        })
        .then(appointmentCount => {
            totalCount += appointmentCount;
            gAppointmentCount = appointmentCount
            return Order.countDocuments({readStatus: 0})
        })
        .then(orderCount => {
            totalCount += orderCount;
            gOrderCount = orderCount
            res.status(200).json({
                message: '[Success] : Notifications retrieved successfully',
                notificationsCount: totalCount,
                userCount : gUserCount,
                orderCount: gOrderCount,
                appointmentCount: gAppointmentCount
            })
        })
        .catch(error => {
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
}