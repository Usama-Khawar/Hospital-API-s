import express from 'express';
import mongoose from 'mongoose';
import patients from './routes/patients';
import appointments from './routes/appointments';

const app = express();

mongoose
  .connect('mongodb://localhost:27017/hospital')
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use('/api/patients', patients);
app.use('/api/appointments', appointments);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
