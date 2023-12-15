import mongoose from 'mongoose';
import Appointment from './appointment';

export interface IPatient {
  petName: string;
  petType: string;
  ownerName: string;
  ownerAddress: string;
  ownerPhone: string;
}

const patientSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true,
  },
  petType: {
    type: String,
    required: true,
    enum: {
      values: ['cat', 'dog', 'bird'],
      message: 'petType must be either cat, dog or bird',
    },
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerAddress: {
    type: String,
    required: true,
  },
  ownerPhone: {
    type: String,
    required: true,
  },
});

patientSchema.pre('deleteOne', { document: true }, async function (next) {
  const patientId = this._id;
  await Appointment.deleteMany({ patient: patientId });
  next();
});

const Patient = mongoose.model('patient', patientSchema);
export default Patient;
