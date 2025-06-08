const BloodReport = require("../models/bloodReport");

// Create a new blood report
const createBloodReport = async (userId, data, date) => {
    try {
        const bloodReport = new BloodReport({
            userId,
            reportDate: date,
            biomarkers: data.biomarkers, // Ensuring biomarkers field is correctly mapped
        });
        await bloodReport.save();
        return bloodReport; // Return the created report if needed
    } catch (error) {
        console.error("Error creating blood report:", error);
        throw error;
    }
};

// Get all blood reports
const getAllBloodReports = async (req, res) => {
    try {
        const bloodReports = await BloodReport.find();
        res.status(200).json(bloodReports);
    } catch (error) {
        console.error("Error fetching all blood reports:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get a specific blood report by ID
const getBloodReportById = async (req, res) => {
    try {
        const bloodReport = await BloodReport.findById(req.params.id);
        if (!bloodReport) {
            return res.status(404).json({ message: "Blood report not found" });
        }
        res.status(200).json(bloodReport);
    } catch (error) {
        console.error("Error fetching blood report by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all blood reports by userId
const getBloodReportsByUserId = async (userId) => {
    try {
        const bloodReports = await BloodReport.find({ userId }).sort({ reportDate: -1 });
        return bloodReports;
    } catch (error) {
        console.error("Error fetching blood reports by userId:", error);
        throw error;
    }
};

// Get specific biomarker history for a userId
const getReportItemByUserId = async (req, res) => {
    const { userId, itemName } = req.params;
    try {
        const bloodReports = await BloodReport.find({ userId }).sort({ reportDate: 1 });

        // Extract biomarker history
        const itemValues = bloodReports.map((report) => {
            const biomarker = report.biomarkers.find((b) => b.name === itemName);
            return biomarker
                ? {
                      date: report.reportDate,
                      value: biomarker.result,
                      unit: biomarker.unit,
                      referenceRange: biomarker.referenceRange,
                  }
                : null;
        }).filter(Boolean); // Remove null entries

        if (!itemValues.length) {
            return res.status(404).json({ message: `Biomarker '${itemName}' not found` });
        }

        res.status(200).json(itemValues);
    } catch (error) {
        console.error("Error fetching biomarker history:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update a blood report by ID
const updateBloodReport = async (req, res) => {
    try {
        const bloodReport = await BloodReport.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document
        );

        if (!bloodReport) {
            return res.status(404).json({ message: "Blood report not found" });
        }

        res.status(200).json(bloodReport);
    } catch (error) {
        console.error("Error updating blood report:", error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a blood report by ID
const deleteBloodReport = async (req, res) => {
    try {
        const bloodReport = await BloodReport.findByIdAndDelete(req.params.id);
        if (!bloodReport) {
            return res.status(404).json({ message: "Blood report not found" });
        }
        res.status(200).json({ message: "Blood report deleted successfully" });
    } catch (error) {
        console.error("Error deleting blood report:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    createBloodReport,
    getAllBloodReports,
    getBloodReportById,
    getBloodReportsByUserId,
    getReportItemByUserId,
    updateBloodReport,
    deleteBloodReport,
};
