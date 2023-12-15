"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const patients_1 = __importDefault(require("./routes/patients"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const app = (0, express_1.default)();
mongoose_1.default
    .connect('mongodb://localhost:27017/hospital')
    .then(() => console.log('Connected to MongoDB...'))
    .catch((err) => console.error('Could not connect to MongoDB...'));
app.use(express_1.default.json());
app.use('/api/patients', patients_1.default);
app.use('/api/appointments', appointments_1.default);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
