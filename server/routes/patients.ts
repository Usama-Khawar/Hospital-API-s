import express from 'express';
import * as yup from 'yup';
import _ from 'lodash';
import Patient, { IPatient } from '../models/patient';
import { MongooseError } from 'mongoose';

const router = express.Router();

const schema = yup.object().shape({
  petName: yup.string().required().min(3).max(50),
  petType: yup.string().required(),
  ownerName: yup.string().required().min(5).max(255),
  ownerAddress: yup.string().required().min(5).max(255),
  ownerPhone: yup.string().required().min(5).max(20),
});

router.get('/', async (req, res) => {
  const patients = await Patient.find().sort('petName');
  res.send(patients);
});

router.get('/:id', async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient)
    return res.status(404).send('The patient with the given ID was not found.');
  res.send(patient);
});

router.post('/', async (req: express.Request<any, any, IPatient>, res) => {
  try {
    await schema.validate(req.body);
    const patient = new Patient(
      _.pick(req.body, [
        'petName',
        'petType',
        'ownerName',
        'ownerAddress',
        'ownerPhone',
      ])
    );
    await patient.save();
    res.send(patient);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await schema.validate(req.body);
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, [
        'petName',
        'petType',
        'ownerName',
        'ownerAddress',
        'ownerPhone',
      ]),
      {
        new: true,
      }
    );
    if (!patient)
      return res
        .status(404)
        .send('The patient with the given ID was not found.');
    res.send(patient);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .send('The patient with the given ID was not found.');
    }
    await patient.deleteOne();
    res.send(patient);
  } catch (error) {
    console.error(error);
  }
});

export default router;
