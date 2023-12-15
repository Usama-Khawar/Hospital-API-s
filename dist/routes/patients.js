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
const patient_1 = __importDefault(require("../models/patient"));
const router = express_1.default.Router();
const schema = yup.object().shape({
    petName: yup.string().required().min(3).max(50),
    petType: yup.string().required(),
    ownerName: yup.string().required().min(5).max(255),
    ownerAddress: yup.string().required().min(5).max(255),
    ownerPhone: yup.string().required().min(5).max(20),
});
router.get('/', async (req, res) => {
    const patients = await patient_1.default.find().sort('petName');
    res.send(patients);
});
router.get('/:id', async (req, res) => {
    const patient = await patient_1.default.findById(req.params.id);
    if (!patient)
        return res.status(404).send('The patient with the given ID was not found.');
    res.send(patient);
});
router.post('/', async (req, res) => {
    try {
        await schema.validate(req.body);
        const patient = new patient_1.default(lodash_1.default.pick(req.body, [
            'petName',
            'petType',
            'ownerName',
            'ownerAddress',
            'ownerPhone',
        ]));
        await patient.save();
        res.send(patient);
    }
    catch (err) {
        res.status(400).send(err.message);
    }
});
router.put('/:id', async (req, res) => {
    try {
        await schema.validate(req.body);
        const patient = await patient_1.default.findByIdAndUpdate(req.params.id, lodash_1.default.pick(req.body, [
            'petName',
            'petType',
            'ownerName',
            'ownerAddress',
            'ownerPhone',
        ]), {
            new: true,
        });
        if (!patient)
            return res
                .status(404)
                .send('The patient with the given ID was not found.');
        res.send(patient);
    }
    catch (error) {
        res.status(400).send('patient not updated');
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const patient = await patient_1.default.findById(req.params.id);
        if (!patient) {
            return res
                .status(404)
                .send('The patient with the given ID was not found.');
        }
        await patient.deleteOne();
        res.send(patient);
    }
    catch (error) {
        console.error(error);
    }
});
exports.default = router;
