import styles from "./styles.module.css";
import axios from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCloudUploadAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const apiurl = process.env.REACT_APP_API_BASE_URL;

function Chat() {
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState([]);
	const inputRef = useRef(null);
	const [progress, setProgress] = useState(0);
	const [description, setDescription] = useState("");
	const [medicalInfo, setMedicalInfo] = useState([]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
		window.location.reload();
	};

	const clickInput = () => {
		inputRef.current.click();
	};

	const onDescriptionChange = (e) => {
		setDescription(e.target.value);
	};

	const handleSendMessage = async () => {
		if (!message.trim()) return;

		const newMessage = {
			text: message,
			sender: 'user',
			timestamp: new Date().toISOString()
		};

		setChatHistory(prev => [...prev, newMessage]);
		setMessage("");

		try {
			const response = await axios.post(`${apiurl}/chat`, {
				message: message
			}, {
				headers: {
					Authorization: localStorage.getItem("token")
				}
			});

			const botResponse = {
				text: response.data.message,
				sender: 'bot',
				timestamp: new Date().toISOString()
			};

			setChatHistory(prev => [...prev, botResponse]);
		} catch (error) {
			console.error("Error sending message:", error);
			setError("Failed to send message. Please try again.");
		}
	};

	const onFileChange = async (e) => {
		try {
			let upload = e.target.files;
			if (upload.length < 1) return;

			let fileUpload = new FormData();
			fileUpload.append("file", upload[0]);
			fileUpload.append("description", description);

			axios.defaults.headers.common['Authorization'] = `${localStorage.getItem("token")}`;
			const response = await axios.post(`${apiurl}/files`, fileUpload);
			setMedicalInfo(response.data.medicalInfo);

			const botResponse = {
				text: "I've analyzed your medical report. How can I help you understand the results?",
				sender: 'bot',
				timestamp: new Date().toISOString()
			};

			setChatHistory(prev => [...prev, botResponse]);
		} catch (error) {
			if (error.response && error.response.status >= 400 && error.response.status <= 500) {
				setError(error.response.data.message);
			}
		}
	};

	return (
		<div className={styles.chat_wrapper}>
			<div className={styles.main_container}>
				<nav className={styles.navbar}>
					<div className={styles.title_container}>
						<FontAwesomeIcon icon={faHome} className={styles.home_icon} />
						<h1>Elixer AI</h1>
					</div>
					<button className={styles.white_btn} onClick={handleLogout}>
						Logout
					</button>
				</nav>
			</div>

			<div className={styles.chat_container}>
				<div className={styles.chat_window}>
					{chatHistory.map((msg, index) => (
						<div
							key={index}
							className={msg.sender === 'user' ? styles.user_message : styles.bot_message}
						>
							{msg.text}
						</div>
					))}
				</div>

				<div className={styles.input_container}>
					<div className={styles.dropzone} onClick={clickInput}>
						<FontAwesomeIcon icon={faCloudUploadAlt} className={styles.upload_icon} />
						<input
							type="file"
							name="file"
							className={styles.dropzone_input}
							ref={inputRef}
							onChange={onFileChange}
							accept=".pdf, .txt, .png, .jpeg, .jpg"
						/>
					</div>
					<input
						type="text"
						className={styles.input}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type your message here..."
						onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
					/>
					<button className={styles.send_btn} onClick={handleSendMessage}>
						<FontAwesomeIcon icon={faPaperPlane} />
					</button>
				</div>
			</div>

			{error && <div className={styles.error}>{error}</div>}
		</div>
	);
}

export default Chat;
