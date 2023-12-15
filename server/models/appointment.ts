import mongoose, { Types } from 'mongoose';
import { IPatient } from './patient';

export interface IAppointment {
  appointmentStartTime: Date;
  appointmentEndTime: Date;
  paid: number;
  unPaid: number;
  total: number;
  patient?: Types.ObjectId | null | undefined;
}

const appointmentSchema = new mongoose.Schema({
  appointmentStartTime: {
    type: Date,
    required: true,
  },
  appointmentEndTime: {
    type: Date,
    required: true,
  },
  paid: {
    type: Number,
    required: true,
  },
  unPaid: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'patient',
  },
});

const Appointment = mongoose.model('appointment', appointmentSchema);

export default Appointment;
