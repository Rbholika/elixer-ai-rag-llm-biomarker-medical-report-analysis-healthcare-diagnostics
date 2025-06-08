const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { saveMessage, getConversationsByUser, getConversationByID } = require("../controllers/conversationController");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const OLLAMA_HOST = "http://127.0.0.1:11434/";
const OLLAMA_MODEL = "monotykamary/medichat-llama3";

const loadBiomarkerData = () => {
	const biomarkerDataPath = path.resolve(__dirname, "../data/biomarkers.json");
	const biomarkerData = JSON.parse(fs.readFileSync(biomarkerDataPath, "utf-8"));
	return biomarkerData;
};

// ----------- Gemini (Google) API Response (optional) ----------------
const getChatbotResponse = async (message, biomarkerData, messages) => {
	const biomarkerList = loadBiomarkerData();
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

	const model = genAI.getGenerativeModel({
		model: "gemini-1.5-pro",
		system_instruction: [
			"You are a concise and precise medical assistant.",
			"Only utilize the biomarker data if the user asks a question about it.",
			"Respond only to the user's specific query using the data explicitly provided.",
			"Use only the biomarker data and context provided; do not fabricate or infer any new data.",
			"If the question cannot be answered with the given data, state: \"I require more specific information to answer this question.\"",
			"Avoid all disclaimers, legal statements, or irrelevant remarks. Keep answers short, direct, and focused on the user's query.",
			"For biomarker data, analyze trends or abnormalities based solely on the provided historical data.",
			"Utilize the biomarker data and reference ranges provided in the mostRecent and historical biomarker data to analyze and talk about health parameters.",
			"Don't format list elements with bold"
		]
	});

	const containsBiomarkerMention = (message, biomarkerList) => {
		const keywords = ["report", "test", "result", "level", "measurement"];
		for (const biomarker in biomarkerList) {
			const aliases = biomarkerList[biomarker].aliases;
			if (aliases.some(alias => message.toLowerCase().includes(alias.toLowerCase()))) {
				return biomarker;
			}
		}
		if (keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()))) {
			return "report";
		}
		return null;
	};

	const mentionedBiomarker = containsBiomarkerMention(message, biomarkerList);

	let fullMessage = message;
	if (mentionedBiomarker) {
		fullMessage += `. Here is the biomarker data: ${JSON.stringify(biomarkerData)}`;
	}
	const context = messages.map(item => `${item.sender}: ${item.text}`).join('\n');
	fullMessage = `Previous context: ${context}. New message: ${fullMessage}`;

	const result = await model.generateContent(fullMessage);
	const response = result.response;

	return response.text();
};

// ----------- Ollama (LLaMA3) Local Response ----------------
const generateResponse = async (message, biomarkerData, messages) => {
	const biomarkerList = loadBiomarkerData();

	try {
		console.log("Generating response from Ollama...");

		const containsBiomarkerMention = (message, biomarkerList) => {
			const keywords = ["report", "test", "result", "level", "measurement", "blood"];
			for (const biomarker in biomarkerList) {
				const aliases = biomarkerList[biomarker].aliases;
				if (aliases.some(alias => message.toLowerCase().includes(alias.toLowerCase()))) {
					return biomarker;
				}
			}
			if (keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()))) {
				return "report";
			}
			return null;
		};

		const mentionedBiomarker = containsBiomarkerMention(message, biomarkerList);

		let fullMessage = message;
		if (mentionedBiomarker) {
			fullMessage += `. Here is the biomarker data: ${JSON.stringify(biomarkerData)}`;
		}

		// ✅ FIXED: Define context here before using it
		const context = messages && messages.length > 0
			? messages.map(item => `${item.sender}: ${item.text}`).join('\n')
			: "";

		if (context) {
			fullMessage = `Previous context: ${context}. New message: ${fullMessage}`;
		}

		const requestPayload = {
			model: "monotykamary/medichat-llama3",
			messages: [
				{
					role: "system",
					content: "You are a concise and precise medical assistant. Only utilize the biomarker data if the user asks a question about it. Respond only to the user's specific query using the data explicitly provided. Use only the biomarker data and context provided; do not fabricate or infer any new data. If the question cannot be answered with the given data, state: \"I require more specific information to answer this question.\" Avoid all disclaimers, legal statements, or irrelevant remarks. Keep answers short, direct, and focused on the user's query. For biomarker data, analyze trends or abnormalities based solely on the provided historical data. Utilize the biomarker data and reference ranges provided in the mostRecent and historical biomarker data to analyze and talk about health parameters."
				},
				{
					role: "user",
					content: fullMessage,
				}
			],
			stream: false
		};

		const response = await fetch(`${OLLAMA_HOST}api/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestPayload)
		});

		if (!response.ok) {
			throw new Error(`Ollama API Error: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.message || !data.message.content) {
			throw new Error("Ollama API did not return a valid response");
		}

		return data.message.content;

	} catch (error) {
		console.error("Error generating response from Ollama:", error);
		return "Sorry, I am unable to process your request right now.";
	}
};


// ---------------- Routes ----------------
router.get("/conversation/:token/:conversationID", async (req, res) => {
	const { token, conversationID } = req.params;
	try {
		const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
		const userId = decoded._id;
		const messages = await getConversationByID(userId, conversationID);
		res.json(messages);
	} catch (error) {
		console.error("Error fetching conversation:", error);
		res.status(500).send({ message: "Error fetching conversation" });
	}
});

router.get("/user/:token", async (req, res) => {
	try {
		const decoded = jwt.verify(req.params.token, process.env.JWTPRIVATEKEY);
		const userId = decoded._id;
		const conversations = await getConversationsByUser(userId);
		res.json({ conversations });
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).send({ message: "Token expired, please log in again" });
		} else {
			return res.status(401).send({ message: "Invalid token" });
		}
	}
});

router.post("/chat", async (req, res) => {
	const { token, message, messages, data, conversationID, topic } = req.body;

	try {
		const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
		const userId = decoded._id;

		await saveMessage(userId, conversationID, "user", message, topic);

		// 👇 Use either Gemini or Ollama
		// const botResponse = await getChatbotResponse(message, data, messages); // Gemini (Google)
		const botResponse = await generateResponse(message, data, messages); // Ollama (LLaMA3)

		await saveMessage(userId, conversationID, "bot", botResponse, topic);
		res.json({ botResponse });
	} catch (error) {
		console.error("Chat error:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;
