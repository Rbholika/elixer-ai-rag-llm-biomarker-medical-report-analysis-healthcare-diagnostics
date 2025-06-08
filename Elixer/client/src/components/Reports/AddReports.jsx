import React, { useState } from "react";
import styles from "./addreports.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const AddReports = () => {
	const [step, setStep] = useState(1);
	const [screeningType, setScreeningType] = useState("");
	const [testType, setTestType] = useState("");
	const [testDate, setTestDate] = useState("");
	const [additionalInfo, setAdditionalInfo] = useState("");
	const [file, setFile] = useState(null);
	const navigate = useNavigate();

	const inputRef = React.createRef();

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
		window.location.reload();
	};

	const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
	const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

	const onFileChange = (event) => {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			// Validate file size and type
			if (selectedFile.size > 15 * 1024 * 1024) {
				alert("File size must be less than 15MB.");
				return;
			}
			const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jfif", "image/webp"];
			if (!allowedTypes.includes(selectedFile.type)) {
				alert("Invalid file type. Only PDF, PNG, JPEG, JFIF, and WEBP are allowed.");
				return;
			}
			setFile(selectedFile);
		}
	};

	const handleSubmit = async () => {
		if (!file) {
			alert("Please attach a lab report.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("testDate", testDate);
		formData.append("description", additionalInfo);

		try {
			// Append the token to the request headers
			axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem("token")}`;

			console.log("Uploading file...");
			const response = await axios.post(`${apiurl}/files`, formData);
			const biomarkers = response.data.biomarkers;

			// Generate the blood report
			const generateResponse = await axios.post(
				`${apiurl}/bloodreport/`,
				{
					reportDate: new Date(testDate).toISOString(), // Example: current date
					biomarkers: biomarkers // Pass the biomarkers array received from the `/api/files` endpoint
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}` // Pass the token in headers
					}
				}
			);
			console.log("Blood report generation response:", generateResponse.data);

			alert("Report submitted successfully!");
			navigate(-1); // Redirect after submission
		} catch (error) {
			if (error.response && error.response.status >= 400 && error.response.status <= 500) {
				alert(error.response.data.message);
			} else {
				alert("Error submitting report. Please try again.");
				console.error("Submission error:", error);
			}
		}
	};

	const labTypes = [
		{ type: "Lab Test", description: "Includes blood tests, urine tests, Pap smear, semen analysis, and stool tests like FOBT.", enabled: true },
		// { type: "Physical Examination", description: "General and specific physical examinations.", enabled: false },
		{ type: "Imaging Test", description: "Includes X-rays, CT scans, MRIs, ultrasounds, etc, to visualize internal organs and structures.", enabled: false },
		{ type: "Specialized Test", description: "Heart, brain, and nerve function tests (e.g., ECG, EEG, EMG, etc).", enabled: false },
	];

	const testTypes = [
		{ type: "Fluid Test", description: "Evaluates biomarkers in bodily fluids to monitor organ performance, inflammation, and immune status.", enabled: true },
		// { type: "Urine Test", description: "Kidney function, urinary tract infections, etc.", enabled: true },
		// { type: "Pap Smear", description: "Precancerous conditions, cervical cancer, HPV, etc.", enabled: true },
		// { type: "Semen Analysis", description: "Sperm count, motility, morphology, fertility issues.", enabled: true },
		// { type: "Stool Test", description: "Digestive conditions, infections, parasites, etc.", enabled: true},
		// { type: "Swab Test", description: "Bacterial infections, viruses, fungal infections, etc.", enabled: true },
	];

	return (
		<div>
			<div className={styles.main_container}>
				<nav className={styles.navbar}>
					<div className={styles.title_container} onClick={() => navigate("/")}>
						<FontAwesomeIcon icon={faHome} className={styles.home_icon} />
						<h1>Elixer AI</h1>
					</div>
					<button className={styles.white_btn} onClick={handleLogout}>
						Logout
					</button>
				</nav>
			</div>

			<div className={styles.container}>
				<div className={styles.card}>
					<div className={styles.header}>
						<button
							className={styles.backIcon}
							onClick={prevStep}
							disabled={step === 1}
						>
							&larr;
						</button>
						<h2>New Report</h2>
					</div>
					<div className={styles.progressContainer}>
						<p className={styles.stepCount}>{step}/5</p>
						<div className={styles.progressBar}>
							<div
								className={styles.progress}
								style={{ width: `${(step / 5) * 100}%` }}
							></div>
						</div>
					</div>

					{/* Step 1 */}
					{step === 1 && (
						<>
							<p className={styles.instructions}>
								<span className={styles.highlight}>Please note!</span> Upload only text-based medical reports (e.g., blood tests, screening summaries). Image files like CT, X-ray, or MRI scans are not currently supported.
							</p>
							<div className={styles.fileUploadWrapper}>
								<button className={styles.fileButton}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M9 7a5 5 0 1 1 10 0v8a7 7 0 1 1-14 0V9a1 1 0 0 1 2 0v6a5 5 0 0 0 10 0V7a3 3 0 1 0-6 0v8a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v6a3 3 0 1 1-6 0z"
										></path>
									</svg>
									<span>
										{file ? `Attached: ${file.name}` : "Attach Lab Report"}
									</span>
									<input
										type="file"
										name="file"
										className={styles.fileInput}
										ref={inputRef}
										onChange={onFileChange}
									/>
								</button>
							</div>
							<p className={styles.fileHint}>
								PDF, PNG, or JPEG, max 15MB, max 5 pages.
							</p>
							<div className={styles.buttons}>
								<button
									className={styles.backButton}
									disabled
								>
									Back
								</button>
								<button
									className={styles.nextButton}
									onClick={nextStep}
									disabled={!file} // Disables the button if no file is uploaded
								>
									Next
								</button>
							</div>
						</>
					)}

					{/* Step 2 */}
					{step === 2 && (
						<div className={styles.optionsContainer}>
							<h3>Choose the Screening Type</h3>
							<div className={styles.testOptions}>
								{labTypes.map(({ type, description, enabled }) => (
									<button
										key={type}
										onClick={() => enabled && setScreeningType(type)}
										className={`${styles.optionButton} ${screeningType === type ? styles.selected : ""}`}
										disabled={!enabled}
										style={!enabled ? { opacity: 0.6, cursor: "not-allowed" } : {}}
									>
										<div className={styles.testType}>{type}</div>
										<div className={styles.testDescription}>{description}</div>
									</button>
								))}
							</div>
							<div className={styles.buttons}>
								<button className={styles.backButton} onClick={prevStep}>
									Back
								</button>
								<button
									className={styles.nextButton}
									onClick={nextStep}
									disabled={!screeningType}
								>
									Next
								</button>
							</div>
						</div>
					)}

					{/* Step 3 */}
					{step === 3 && (
						<div className={styles.optionsContainer}>
							<h3>Choose the Test Result Type</h3>
							<div className={styles.testOptions}>
								{testTypes.map(({ type, description, enabled }) => (
									<button
										key={type}
										onClick={() => enabled && setTestType(type)}
										className={`${styles.optionButton} ${testType === type ? styles.selected : ""}`}
										disabled={!enabled}
										style={!enabled ? { opacity: 0.6, cursor: "not-allowed" } : {}}
									>
										<div className={styles.testType}>{type}</div>
										<div className={styles.testDescription}>{description}</div>
									</button>
								))}
							</div>
							<div className={styles.buttons}>
								<button className={styles.backButton} onClick={prevStep}>
									Back
								</button>
								<button
									className={styles.nextButton}
									onClick={nextStep}
									disabled={!testType}
								>
									Next
								</button>
							</div>
						</div>
					)}

					{/* Step 4 */}
					{step === 4 && (
						<div className={styles.optionsContainer}>
							<h3>Select Test Date</h3>
							<input
								type="date"
								value={testDate}
								onChange={(e) => setTestDate(e.target.value)}
								style={{width: "20%", padding: "10px", margin: "20px 0px 0px 0px"}}
								className={styles.dateInput}
							/>
							<div className={styles.buttons}>
								<button className={styles.backButton} onClick={prevStep}>
									Back
								</button>
								<button
									className={styles.nextButton}
									onClick={nextStep}
									disabled={!testDate}
								>
									Next
								</button>
							</div>
						</div>
					)}

					{/* Step 5 */}
					{step === 5 && (
						<div className={styles.optionsContainer}>
							<h3>Additional Information</h3>
							<textarea
								className={styles.textArea}
								placeholder="Provide any additional information here"
								value={additionalInfo}
								style={{ padding: "20px", margin: "20px", width: "85%", height: "200px", resize: "none"}}
								onChange={(e) => setAdditionalInfo(e.target.value)}
							></textarea>
							<div className={styles.buttons}>
								<button className={styles.backButton} onClick={prevStep}>
									Back
								</button>
								<button className={styles.nextButton} onClick={handleSubmit}>
									Submit
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AddReports;
