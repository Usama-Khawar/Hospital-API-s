"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const yup = __importStar(require("yup"));
const lodash_1 = __importDefault(require("lodash"));
const appointment_1 = __importDefault(require("../models/appointment"));
const patient_1 = __importDefault(require("../models/patient"));
const constants_1 = require("../utils/constants");
const index_1 = require("../utils/index");
const router = express_1.default.Router();
const schema = yup.object().shape({
    appointmentStartTime: yup.date().required(),
    appointmentEndTime: yup.date().required(),
    paid: yup.number().required(),
    unPaid: yup.number().required(),
    total: yup.number().required(),
});
router.get('/', async (req, res) => {
    const appointments = await appointment_1.default.find()
        .populate('patient', 'petName ownerName ownerPhone -_id')
        .select('appointmentStartTime appointmentEndTime -_id')
        .sort('appointmentStartTime');
    res.send(appointments);
});
router.get('/today', async (req, res) => {
    const today = new Date();
    const tomorrow = new Date(today);
    const appointments = await appointment_1.default.find({
        appointmentStartTime: {
            $gte: today,
            $lt: tomorrow.setDate(tomorrow.getDate() + 1),
        },
    })
        .populate('patient', 'petName ownerName ownerPhone -_id')
        .select('appointmentStartTime appointmentEndTime -_id')
        .sort('appointmentStartTime');
    res.send(appointments);
});
router.get('/day', async (req, res) => {
    const day = req.query.value;
    const appointments = await appointment_1.default.find()
        .populate('patient', 'petName ownerName ownerPhone -_id')
        .select('appointmentStartTime appointmentEndTime -_id')
        .sort('appointmentStartTime');
    if (!appointments)
        return res
            .status(404)
            .send('The appointments with the given day was not found.');
    const filteredAppointments = appointments.filter((appointment) => {
        return constants_1.days[appointment.appointmentStartTime.getDay()] === day;
    });
    res.send(filteredAppointments);
});
router.get('/unpaid', async (req, res) => {
    const appointments = await appointment_1.default.find({
        unPaid: {
            $gt: 0,
        },
    })
        .populate('patient', 'petName ownerName ownerPhone -_id')
        .select('appointmentStartTime appointmentEndTime -_id')
        .sort('appointmentStartTime');
    res.send(appointments);
});
router.get('/report', async (req, res) => {
    const filter = req.query.filter;
    const dateRange = (0, index_1.calculateDateRange)(filter);
    if (!dateRange) {
        return res.status(400).send('Invalid filter');
    }
    const appointments = await appointment_1.default.find({
        appointmentStartTime: dateRange,
    })
        .select('paid unPaid  total -_id')
        .sort('paid');
    if (!appointments)
        return res
            .status(404)
            .send('The appointments with the given date range was not found.');
    res.send((0, index_1.sum)(appointments));
});
router.get('/most-popular', async (req, res) => {
    const appointments = await appointment_1.default.find()
        .populate('patient', 'petType -_id')
        .select('total -_id')
        .sort('total');
    if (!appointments)
        return res.status(404).send('There are no appointments');
    res.send((0, index_1.mostPopular)(appointments));
});
router.get('/remaining-bill/:id', async (req, res) => {
    const appointment = await appointment_1.default.findById(req.params.id)
        .select('unPaid -_id')
        .sort('appointmentStartTime');
    if (!appointment)
        return res
            .status(404)
            .send('The appointment with the given ID was not found.');
    res.send(appointment);
});
router.get('/:id', async (req, res) => {
    const appointment = await appointment_1.default.findById(req.params.id)
        .populate('patient', 'petName ownerName ownerPhone -_id')
        .select('appointmentStartTime appointmentEndTime -_id')
        .sort('appointmentStartTime');
    if (!appointment)
        return res
            .status(404)
            .send('The appointment with the given ID was not found.');
    res.send(appointment);
});
router.post('/', async (req, res) => {
    try {
        await schema.validate(req.body);
        const patientId = req.query.patientId;
        if (!patientId)
            return res.status(400).send('patientId is required');
        const patientData = await patient_1.default.findById(patientId);
        if (!patientData)
            return res.status(400).send('patient not found');
        const appointment = new appointment_1.default({
            ...lodash_1.default.pick(req.body, [
                'appointmentStartTime',
                'appointmentEndTime',
                'paid',
                'unPaid',
                'total',
            ]),
            patient: patientData._id,
        });
        await appointment.save();
        res.send(appointment);
    }
    catch (error) {
        res.status(400).send('appointment not added');
    }
});
router.put('/:id', async (req, res) => {
    try {
        await schema.validate(req.body);
        const patientId = req.query.patientId;
        if (patientId) {
            const patientData = await patient_1.default.findById(patientId);
            if (!patientData)
                return res.status(400).send('patient not found');
            const appointment = await appointment_1.default.findByIdAndUpdate(req.params.id, {
                ...lodash_1.default.pick(req.body, [
                    'appointmentStartTime',
                    'appointmentEndTime',
                    'paid',
                    'unPaid',
                    'total',
                ]),
                patient: patientData._id,
            }, {
                new: true,
            });
            if (!appointment)
                return res
                    .status(404)
                    .send('The appointment with the given ID was not found.');
            res.send(appointment);
        }
        const appointment = await appointment_1.default.findByIdAndUpdate(req.params.id, lodash_1.default.pick(req.body, [
            'appointmentStartTime',
            'appointmentEndTime',
            'paid',
            'unPaid',
            'total',
        ]), {
            new: true,
        });
        if (!appointment)
            return res
                .status(404)
                .send('The appointment with the given ID was not found.');
        res.send(appointment);
    }
    catch (error) {
        res.status(400).send('appointment not updated');
    }
});
router.delete('/:id', async (req, res) => {
    const appointment = await appointment_1.default.findByIdAndDelete(req.params.id);
    if (!appointment)
        return res
            .status(404)
            .send('The appointment with the given ID was not found.');
    res.send(appointment);
});
exports.default = router;
