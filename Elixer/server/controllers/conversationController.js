const Conversation = require("../models/conversation");

const saveMessage = async (userId, conversationID, sender, message, topic) => {
	try {
		const id = conversationID.trim()
		let conversation = await Conversation.findOne({ userId, conversationID: id });
		if (conversation) {
			conversation.messages.push({ sender, message });
		}
		else {
			conversation = new Conversation({
				userId,
				conversationID,
				messages: [{ sender, message }],
				topic
			});
		}
		await conversation.save();
	} catch (error) {
		console.error("Error saving message:", error);
		throw error;
	}
};

const getConversationByID = async (userId, conversationID) => {
	try {
		const conversation = await Conversation.findOne({ userId, conversationID: conversationID });
		return conversation ? conversation.messages : [];
	} catch (error) {
		console.error("Error fetching conversation:", error);
		throw error;
	}
};

const getConversationsByUser = async (userId) => {
    try {
        const conversations = await Conversation.find({ userId });
        return conversations;
    } catch (error) {
        console.error("Error fetching conversations by user:", error);
        throw error;
    }
};

module.exports = { saveMessage, getConversationsByUser, getConversationByID };
