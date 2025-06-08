const mongoose = require("mongoose");
const Joi = require("joi");

const fileSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	fileName: { type: String, required: true },
	filePath: { type: String, required: true },
	uploadDate: { type: Date, default: Date.now },
	description: { type: String, required: false },
	testDate: { type: Date, required: false, default: Date.now }
});

const File = mongoose.model("File", fileSchema);

const validateFile = (data) => {
	const schema = Joi.object({
		userId: Joi.string().required().label("User ID"),
		fileName: Joi.string().required().label("File Name"),
		filePath: Joi.string().required().label("File Path"),
		description: Joi.string().label("Description"),
		testDate: Joi.date().label("Test Date")
	});
  	return schema.validate(data);
};

module.exports = { File, validateFile };
