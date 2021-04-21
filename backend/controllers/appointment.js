const Appointment = require('../models/appointment');
const User = require('../models/user');

const errorHandler = (message, status) => {
    const newError = new Error(message);
    newError.status = status;
    return newError;
}

exports.createAppointment = (req, res, next) => {
    const userId = req.body.userId;
    User.findOne({_id: userId, email : req.body.email})
    .then((user) => {
        if (!user && userId) {
            throw errorHandler('[Error] : Authentication fail - User not found',401);
        }
        if (userId) {
            return user;
        } else {
            return null;
        }
    })
    .then(userFound => {
        let newAppointment;
        console.log(req.body);
        const date = req.body.date;
        const newDate = new Date(date);
        console.log(date);
        console.log(newDate.toUTCString());
        if (userFound) {
            newAppointment = new Appointment({
                date: req.body.date,
                time: req.body.time,
                service: req.body.service,
                firstName: userFound.firstName,
                lastName: userFound.lastName,
                phoneNumber: userFound.phoneNumber,
                email: req.body.email,
                userId: req.body.userId,
                readStatus: 0
            })
        } else {
            newAppointment = new Appointment({
                date: req.body.date,
                time: req.body.time,
                service: req.body.service,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                readStatus: 0
            })
        }
        return newAppointment.save()
    })
    .then(createdAppointment => {
        res.status(201).json({
            message: '[Success] : Appointment successfully created',
            appointment: createdAppointment
        })
    })
    .catch(error => {
        console.log(error);
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    })
}

exports.retrieveAppointments = (req, res, next) => {
    Appointment.find()
        .then(appointments => {
            if (!appointments) {
                throw errorHandler('[Error] : Authorization fail - Appointments not found', 401);
            }
            return appointments;
        })
        .then(appointments => {
            res.status(200).json({
                message: '[Success] : Appointments retrieved successfully',
                appointments: appointments
            })
        })
        .catch(error => {
            console.log(error);
            if (error && error.status) {
                next(error)
            } else {
                const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
                next(unknownError);
            }
        })
}

exports.retrieveTakenAppointments = (req, res, next) => {
    Appointment.find({date: {$gte: new Date(new Date().setUTCHours(0,0,0,0)) }})
    .select('date time service -_id')
    .then(appointments => {
        if (!appointments) {
            throw errorHandler('[Error] : Authorization fail - Appointments not found', 401);
        }
        return appointments;
    })
    .then(appointments => {
        res.status(200).json({
            message: '[Success] : Appointments retrieved successfully',
            appointments: appointments
        })
    })
    .catch(error => {
        console.log(error);
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    })
}

exports.retrieveUserAppointments = (req, res, next) => {
    Appointment.find({userId: req.params.id})
    .select('-userId')
    .then(appointments => {
        if (!appointments) {
            throw errorHandler('[Error] : Authorization fail - Appointments not found', 401);
        }
        return appointments;
    })
    .then(appointments => {
        res.status(200).json({
            message: '[Success] : Appointments retrieved successfully',
            appointments: appointments
        })
    })
    .catch(error => {
        console.log(error);
        if (error && error.status) {
            next(error)
        } else {
            const unknownError = errorHandler('[Error] : Unknown error occurred on the Server',500);
            next(unknownError);
        }
    })
}

exports.updateReadStatus = (req, res, next) => {
    Appointment.updateOne(
        {_id: req.params.id}, 
        {$set: {
            readStatus: 1
        } })
        .then(result => {
            if (result.nModified > 0) {
                res.status(201).json({
                    message : '[Success] : Appointment Read Status updated successfully'
                });
            }
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