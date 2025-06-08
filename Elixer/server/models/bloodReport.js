const mongoose = require("mongoose");

const referenceRangeSchema = new mongoose.Schema({
    min: { type: Number, required: true },
    max: { type: Number, required: true },
});

const biomarkerSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the biomarker (e.g., Hemoglobin)
    description: { type: String, required: true }, // Description of the biomarker
    result: { type: Number, required: true }, // The test result
    unit: { type: String, required: true }, // Unit of measurement
    referenceRange: { type: referenceRangeSchema, required: true }, // Normal range
});

const bloodReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportDate: { type: Date, required: true },
    biomarkers: { type: [biomarkerSchema], required: true },
    description: { type: String, required: false },
});

const BloodReport = mongoose.model("BloodReport", bloodReportSchema);

module.exports = BloodReport;
