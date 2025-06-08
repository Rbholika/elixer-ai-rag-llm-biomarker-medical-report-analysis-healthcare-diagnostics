const { File } = require('../models/file'); // Ensure correct import

async function getFilesByUserId(userId) {
    try {
        // Query the File model to find all files for the specified user
        const files = await File.find({ userId }).sort({ uploadDate: -1 }); // Sort by most recent uploads
        return files;
    } catch (error) {
        // Log and rethrow the error for the caller to handle
        console.error("Error fetching files for user ID:", userId, error);
        throw new Error("Failed to fetch files."); // Optionally throw a more user-friendly error
    }
}

module.exports = { getFilesByUserId };
