const router = require("express").Router();
const jwt = require("jsonwebtoken");
const BloodReport = require("../models/bloodReport");
const biomarkerDescriptions = require("../data/biomarkers.json"); // Ensure this JSON file exists and is correctly referenced

// Utility to decode token and retrieve user ID
const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        return decoded._id;
    } catch (err) {
        throw new Error("Invalid token");
    }
};

router.get("/biomarkers", async (req, res) => {
    try {
        // Extract token and validate user
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const userId = decodeToken(token);

        // Fetch all reports for the user, sorted by reportDate descending
        const reports = await BloodReport.find({ userId })
            .sort({ reportDate: -1 })
            .lean();

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: "No reports found for user" });
        }
        // Build a map of the most recent biomarkers
        const biomarkerMap = new Map();

        for (const report of reports) {
            for (const biomarker of report.biomarkers) {
                // Add biomarker to the map if not already present
                if (!biomarkerMap.has(biomarker.name)) {
                    biomarkerMap.set(biomarker.name, {
                        name: biomarker.name,
                        description: biomarker.description,
                        result: biomarker.result,
                        unit: biomarker.unit,
                        referenceRange: biomarker.referenceRange,
                        reportDate: report.reportDate, // Keep track of where it came from
                    });
                }
            }
        }

        // Convert the map back to an array and send it as a response
        const mostRecentBiomarkers = Array.from(biomarkerMap.values());
        //mostRecentBiomarkers)
        res.json(mostRecentBiomarkers);
    } catch (error) {
        console.error("Error fetching biomarkers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to fetch the most recent blood report for a user
router.get("/latest/:token", async (req, res) => {
    const { token } = req.params;
    try {
        const userId = decodeToken(token);

        const latestReport = await BloodReport.findOne({ userId })
            .sort({ reportDate: -1 }) // Sort by most recent date
            .lean();

        if (!latestReport) {
            return res.status(404).json({ message: "No reports found for user" });
        }

        res.json(latestReport);
    } catch (error) {
        console.error("Error fetching latest blood report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to fetch historical data for a specific biomarker
router.get("/history/:token/:biomarker", async (req, res) => {
    const { token, biomarker } = req.params;
    try {
        const userId = decodeToken(token);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        // Fetch all reports for the user, sorted by date
        const reports = await BloodReport.find({ userId }).sort({ reportDate: 1 }).lean();
        // Extract historical values for the specified biomarker
        const history = reports
            .map((report) => {
                const biomarkerData = report.biomarkers.find((b) => b.name.toLowerCase() === biomarker.toLowerCase());

                return biomarkerData
                    ? {
                          date: new Date(report.reportDate).toLocaleDateString("en-US"),
                          value: biomarkerData.result,
                          unit: biomarkerData.unit,
                          normalRange: biomarkerData.referenceRange,
                          description: biomarkerData.description, // Optional for additional info
                      }
                    : null;
            })
            .filter(Boolean); // Remove null entries

        if (!history.length) {
            return res.status(404).json({ message: `No data found for biomarker: ${biomarker}` });
        }
        res.json(history);
    } catch (error) {
        console.error("Error fetching biomarker history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to provide data for LLM insights
router.get("/llm/insights/:token", async (req, res) => {
    const { token } = req.params;
    try {
        const userId = decodeToken(token);

        const reports = await BloodReport.find({ userId })
            .sort({ reportDate: -1 })
            .lean();

        if (!reports.length) {
            return res.status(404).json({ message: "No reports found for user" });
        }

        const mostRecentReport = reports[0];
        const historicalData = {};

        // Extract historical data for each biomarker
        reports.forEach((report) => {
            report.biomarkers.forEach((biomarker) => {
                if (!historicalData[biomarker.name]) {
                    historicalData[biomarker.name] = [];
                }
                historicalData[biomarker.name].push({
                    date: report.reportDate,
                    value: biomarker.result,
                    unit: biomarker.unit,
                });
            });
        });

        res.json({
            mostRecent: mostRecentReport,
            historical: historicalData,
        });
    } catch (error) {
        console.error("Error fetching biomarker insights:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const userId = decodeToken(token);
        const { reportDate, biomarkers } = req.body;

        if (!userId || !reportDate || !biomarkers) {
            return res.status(400).send({ message: "userId, reportDate, and biomarkers are required." });
        }

        // Format biomarkers to match MongoDB schema
        const formattedBiomarkers = biomarkers.map(biomarker => ({
            name: biomarker.testName,
            description: biomarker.description,
            result: biomarker.resultValue,
            unit: biomarker.unit,
            referenceRange: {
                min: biomarker.referenceRange.min,
                max: biomarker.referenceRange.max
            },
            status: biomarker.status
        }));

        // Create the blood report
        const bloodReport = new BloodReport({
            userId: userId,
            reportDate: new Date(reportDate),
            biomarkers: formattedBiomarkers
        });

        // Save to the database
        await bloodReport.save();

        res.status(201).send({
            message: "Blood report saved successfully!",
            bloodReport
        });
    } catch (error) {
        console.error("Error saving blood report:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
