const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// Define the user schema with additional fields
const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	age: { type: Number, required: true },
	height: { type: String, required: true },
	weight: { type: String, required: true },
	ethnicity: { type: String, required: true },
	sex: { type: String, enum: ["Male", "Female", "Other"], required: true },
});

// Method to generate authentication token
userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};

// Create the User model
const User = mongoose.model("user", userSchema);

// Joi validation schema for request data
const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
		age: Joi.number().min(0).required().label("Age"),
		height: Joi.string().required().label("Height"),
		weight: Joi.string().required().label("Weight"),
		ethnicity: Joi.string().required().label("Ethnicity"),
		sex: Joi.string()
			.valid("Male", "Female", "Other")
			.required()
			.label("Sex"),
	});
	return schema.validate(data);
};

module.exports = { User, validate };
