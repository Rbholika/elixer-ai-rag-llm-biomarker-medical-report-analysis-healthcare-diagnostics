import styles from "./styles.module.css";
import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { FiMessageSquare, FiPlus } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import BotResponse from "./BotResponse";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

import {
	ComposedChart,
	Line,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	DefaultLegendContent,
} from "recharts";

const apiurl = process.env.REACT_APP_API_BASE_URL;

function Chatbot() {
	const [input, setInput] = useState("");
	const [error, setError] = useState("");
	const [showReportSummary, setShowReportSummary] = useState(true);
	const [messages, setMessages] = useState([]);
	const [conversations, setConversations] = useState([]);
	const [conversationID, setConversationID] = useState("");
	const inputRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchConversations();
		setConversationID(generateConversationID());
	}, []);

	const fetchConversations = async () => {
		try {
			const response = await axios.get(
				`${apiurl}/conversations/user/${localStorage.getItem("token")}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			setConversations(response.data.conversations);
		} catch (error) {
			if (error.response?.status === 401) {
				handleLogout();
			} else {
				console.error("Error fetching conversations:", error);
				setError("Error fetching conversations");

			}
		}
	};

	const generateConversationID = () => uuidv4().replace(/-/g, "").substring(0, 24);

	const newChat = () => {
		setConversationID(generateConversationID());
		setMessages([]);
	};

	const chatClicks = async (conversationID) => {
		try {
			const response = await axios.get(
				`${apiurl}/conversations/conversation/${localStorage.getItem("token")}/${conversationID}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			const messages = response.data.map(({ sender, message }) => ({
				sender,
				text: message,
			}));
			setMessages(messages);
			setConversationID(conversationID);
		} catch (error) {
			console.error("Error fetching conversation:", error);
			setError("Error fetching conversation");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
		window.location.reload();
	};

	const fetchBiomarkerData = async (name) => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
			setError("No token found. Please log in again.");
			return null;
			}

			const response = await axios.get(
			`${apiurl}/bloodreport/history/${token}/${name}`
			);
			const history = response.data.map((record) => ({
			date: record.date,
			value: record.value,
			unit: record.unit,
			range: [
				record.normalRange?.min ?? 0,
				record.normalRange?.max ?? 0,
			],
			description: record.description || "No description available",
			}));

			// Add padding data points to extend the chart
			const historyWithPadding = [
			{
				date: "01/01/2000", // Dummy start point
				value: null, // No value
				range: history[0]?.range || [0, 0], // Use first range
			},
			...history,
			{
				date: "12/31/3000", // Dummy end point
				value: null, // No value
				range: history[history.length - 1]?.range || [0, 0], // Use last range
			},
			];

			return historyWithPadding;
		} catch (err) {
			console.error("Error fetching biomarker data:", err);
			setError("Failed to load biomarker data.");
			return null;
		}
	};

	const llmReports = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setError("No token found. Please log in again.");
				return;
			}
			// Pass token as a URL parameter
			const response = await axios.get(
				`${apiurl}/bloodreport/llm/insights/${token}`
			);
			console.log(response.data);
			return response.data;
		} catch (err) {
			console.error("Error fetching reports:", err);
			setError("Failed to fetch biomarkers. Please try again later.");
		}
	};

	const sendMessage = async () => {
		if (!input.trim()) return; // Prevent sending empty messages

		const userMessage = { sender: "user", text: input };

		// Use the functional form of setMessages to ensure the latest state is used
		setMessages((prevMessages) => [...prevMessages, userMessage]);

		let temp = input;
		setInput(""); // Clear input field

		if (temp.startsWith("View Results for ")) {
			const biomarkerName = temp.replace("View Results for ", "").trim();
			if (!biomarkerName) {
				setMessages((prevMessages) => [
					...prevMessages,
					{ sender: "bot", text: "Please specify a biomarker name." },
				]);
				return;
			}
			try {
				const history = await fetchBiomarkerData(biomarkerName);
				if (history) {
					const chartMessage = { sender: "chart", data: history };
					setMessages((prevMessages) => [...prevMessages, chartMessage]);
				} else {
					setMessages((prevMessages) => [
						...prevMessages,
						{ sender: "bot", text: `No data found for biomarker: ${biomarkerName}` },
					]);
				}
			} catch (err) {
				console.error("Error fetching biomarker data:", err);
				setMessages((prevMessages) => [
					...prevMessages,
					{ sender: "bot", text: "Failed to fetch biomarker data. Please try again later." },
				]);
			}
			return;
		}

		try {
			const biodata = await llmReports(); // Fetch the LLM report data
			console.log(biodata); // Log the biodata for debugging

			// Ensure correct message structure for API call
			const response = await axios.post(`${apiurl}/conversations/chat`, {
				message: temp, // Current input message
				messages: messages, // Full conversation context
				data: biodata, // Biomarker data for context
				token: localStorage.getItem("token"), // Ensure token exists in localStorage
				conversationID, // Unique conversation ID
				topic: temp, // Topic derived from the input
			});

			console.log(response); // Log response for debugging

			// After receiving the response, update messages with bot response
			setMessages((prevMessages) => [
				...prevMessages,
				{ sender: "bot", text: response.data.botResponse },
			]);
		} catch (error) {
			console.error("Error sending message:", error);
			setError("Error sending message");
		}
	};

	const handleInputChange = (e) => setInput(e.target.value);

	const handleKeyPress = (e) => {
		if (e.key === "Enter") sendMessage();
	};

	const clickInput = () => navigate("/reports/add");

	const toggleReportSummary = () => setShowReportSummary(!showReportSummary);
	const onFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			console.log("Selected file:", file.name);
			// Optional: Trigger upload logic or preview here
		}
	};
	

	const renderTooltipWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};

	const renderLegendWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};

	return (
		<div style={{overflow: "hidden"}}>
			<div className={styles.nav_container}>
				<nav className={styles.navbar}>
					<div className={styles.button_nav_bar}>
						<button className={styles.minimize_btn} onClick={toggleReportSummary}>
							Minimize
						</button>
						<button className={styles.new_chat_button} onClick={newChat}>
							<FiPlus style={{ width: "24px", height: "24px" }} />
						</button>
					</div>
					<div className={styles.title_container} onClick={() => navigate("/")}>
						<FontAwesomeIcon icon={faHome} className={styles.home_icon} />
						<h1>Elixer AI</h1>
					</div>
					<button className={styles.white_btn} onClick={handleLogout}>
						Logout
					</button>
				</nav>
			</div>
			<div className={styles.page}>
				{showReportSummary && (
					<div className={styles.side_panel}>
						<div className={styles.chat_title}>Previous Chats</div>
						<div className={styles.chat_summary}>
							{conversations.slice().reverse().map((conversation, index) => (
								<div
									key={index}
									className={styles.summary}
									onClick={() => chatClicks(conversation.conversationID)}
								>
									<FiMessageSquare />
									<p>{conversation.topic}</p>
								</div>
							))}
						</div>
					</div>
				)}
				<div className={styles.chat}>
					<div className={styles.chat_container}>
						<div className={styles.chat_window}>
							{messages.map((message, index) =>
								message.sender === "chart" ? (
									<ComposedChart
										key={index}
										width={600}
										height={300}
										data={message.data}
										margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											tickFormatter={(date) => {
												const [month, , year] = date.split("/"); // Assuming "MM/DD/YYYY"
												return `${month}/${year.slice(2)}`; // Format as "MM/YY"
											}}
										/>
										<YAxis />
										<Tooltip content={renderTooltipWithoutRange} />
										<Legend content={renderLegendWithoutRange} />
										<Area
											type="monotone"
											dataKey="range"
											fill="lightgreen"
											stroke="none"
											connectNulls={true}
										/>
										<Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} />
									</ComposedChart>
								) : (
									<div key={index} className={styles[`${message.sender}_message`]}>
										{message.text}
									</div>
								)
							)}
						</div>
						<div className={styles.options_container}>
							<button
								className={styles.option_btn}
								onClick={() => {
									setInput("View Results for ");
									sendMessage();
								}}
							>
								View Results for ...
							</button>
							<button
							className={styles.option_btn}
							onClick={() => {
								navigate("/reports/results");
							}}
							>
							View All Results
							</button>
							<button
								className={styles.option_btn}
								onClick={() => {
									setInput("Discuss my latest report");
									sendMessage();
								}}
							>
								Discuss my Latest Report
							</button>
						</div>
						<div className={styles.input_container}>
							{/* <button className={styles.file_btn} onClick={clickInput}>
								Upload
							</button> */}
							<div className={styles.dropzone} onClick={clickInput}>
								<FontAwesomeIcon icon={faCloudUploadAlt} className={styles.upload_icon} />
								<input
								type="file"
								name="file"
								className={styles.dropzone_input}
								ref={inputRef}
								onChange={onFileChange}
								accept=".pdf"/>
								</div>
							<input
								type="text"
								className={styles.input}
								placeholder="Type a message here..."
								value={input}
								onChange={handleInputChange}
								onKeyPress={handleKeyPress}
							/>
							<button className={styles.send_btn} onClick={sendMessage}>
								Send
							</button>
						</div>
						{error && <div className={styles.error}>{error}</div>}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Chatbot;
