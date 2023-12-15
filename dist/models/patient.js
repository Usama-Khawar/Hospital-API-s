"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const appointment_1 = __importDefault(require("./appointment"));
const patientSchema = new mongoose_1.default.Schema({
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
    await appointment_1.default.deleteMany({ patient: patientId });
    next();
});
const Patient = mongoose_1.default.model('patient', patientSchema);
exports.default = Patient;
