const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Route to create a new user
router.post("/", async (req, res) => {
	try { 
		// Validate request body
		const { error } = validate(req.body);
		if (error) return res.status(400).send({ message: error.details[0].message });

		// Check if user already exists
		const user = await User.findOne({ email: req.body.email });
		if (user)
			return res.status(409).send({ message: "Email already in use" });

		// Hash the password
		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		// Create and save the new user
		await new User({
			...req.body, // Spread all fields (firstName, lastName, age, etc.)
			password: hashPassword,
		}).save();

		res.status(201).send({ message: "User created successfully!" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

// Route to fetch user profile
router.get("/profile/:token", async (req, res) => {
	try {
		const decoded = jwt.verify(req.params.token, process.env.JWTPRIVATEKEY);
        const userId = decoded._id;

		const user = await User.findById(userId).select("-password");
		if (!user) return res.status(404).send("User not found");

		// Return user profile data
		res.status(200).send({
			age: user.age,
			height: user.height,
			weight: user.weight,
			ethnicity: user.ethnicity,
			sex: user.sex,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
