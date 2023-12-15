"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const appointmentSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'patient',
    },
});
const Appointment = mongoose_1.default.model('appointment', appointmentSchema);
exports.default = Appointment;
