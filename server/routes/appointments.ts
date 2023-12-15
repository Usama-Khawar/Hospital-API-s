import express from 'express';
import * as yup from 'yup';
import _ from 'lodash';
import Appointment, { IAppointment } from '../models/appointment';
import Patient from '../models/patient';
import { days } from '../utils/constants';
import { sum, calculateDateRange, mostPopular } from '../utils/index';

const router = express.Router();

const schema = yup.object().shape({
  appointmentStartTime: yup.date().required(),
  appointmentEndTime: yup.date().required(),
  paid: yup.number().required(),
  unPaid: yup.number().required(),
  total: yup.number().required(),
});

router.get('/', async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patient', 'petName ownerName ownerPhone -_id')
    .select('appointmentStartTime appointmentEndTime -_id')
    .sort('appointmentStartTime');
  res.send(appointments);
});

router.get('/today', async (req, res) => {
  const today = new Date();
  const tomorrow = new Date(today);
  const appointments = await Appointment.find({
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
  const appointments = await Appointment.find()
    .populate('patient', 'petName ownerName ownerPhone -_id')
    .select('appointmentStartTime appointmentEndTime -_id')
    .sort('appointmentStartTime');
  if (!appointments)
    return res
      .status(404)
      .send('The appointments with the given day was not found.');
  const filteredAppointments = appointments.filter((appointment: any) => {
    return days[appointment.appointmentStartTime.getDay()] === day;
  });
  res.send(filteredAppointments);
});

router.get('/unpaid', async (req, res) => {
  const appointments = await Appointment.find({
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
  const filter: String = req.query.filter as String;
  const dateRange = calculateDateRange(filter);
  if (!dateRange) {
    return res.status(400).send('Invalid filter');
  }
  const appointments = await Appointment.find({
    appointmentStartTime: dateRange,
  })
    .select('paid unPaid  total -_id')
    .sort('paid');
  if (!appointments)
    return res
      .status(404)
      .send('The appointments with the given date range was not found.');
  res.send(sum(appointments));
});

router.get('/most-popular', async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patient', 'petType -_id')
    .select('total -_id')
    .sort('total');
  if (!appointments) return res.status(404).send('There are no appointments');
  res.send(mostPopular(appointments));
});

router.get('/remaining-bill/:id', async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .select('unPaid -_id')
    .sort('appointmentStartTime');
  if (!appointment)
    return res
      .status(404)
      .send('The appointment with the given ID was not found.');
  res.send(appointment);
});

router.get('/:id', async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
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
    if (!patientId) return res.status(400).send('patientId is required');
    const patientData = await Patient.findById(patientId);
    if (!patientData) return res.status(400).send('patient not found');
    const appointment = new Appointment({
      ..._.pick(req.body, [
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
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await schema.validate(req.body);
    const patientId = req.query.patientId;
    if (patientId) {
      const patientData = await Patient.findById(patientId);
      if (!patientData) return res.status(400).send('patient not found');
      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        {
          ..._.pick(req.body, [
            'appointmentStartTime',
            'appointmentEndTime',
            'paid',
            'unPaid',
            'total',
          ]),
          patient: patientData._id,
        },
        {
          new: true,
        }
      );
      if (!appointment)
        return res
          .status(404)
          .send('The appointment with the given ID was not found.');
      res.send(appointment);
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, [
        'appointmentStartTime',
        'appointmentEndTime',
        'paid',
        'unPaid',
        'total',
      ]),
      {
        new: true,
      }
    );
    if (!appointment)
      return res
        .status(404)
        .send('The appointment with the given ID was not found.');
    res.send(appointment);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment)
    return res
      .status(404)
      .send('The appointment with the given ID was not found.');
  res.send(appointment);
});

export default router;
