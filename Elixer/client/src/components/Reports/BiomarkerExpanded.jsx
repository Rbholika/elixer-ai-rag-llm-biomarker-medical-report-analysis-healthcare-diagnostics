import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./biomarkerexpanded.module.css";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const BiomarkerExpanded = () => {
	const navigate = useNavigate();
	const { name } = useParams();
	const [biomarkerData, setBiomarkerData] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	// Logout handler
	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
		window.location.reload();
	};

	// Fetch biomarker data
	useEffect(() => {
		const fetchBiomarkerData = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setError("No token found. Please log in again.");
					setLoading(false);
					return;
				}

				const response = await axios.get(
					`${apiurl}/bloodreport/history/${token}/${name}`
				);
				console.log(response.data)
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

				if (history.length > 0) {
					setBiomarkerData({
						description: history[0].description,
						unit: history[0].unit,
						history,
					});
				} else {
					setError("No historical data available for this biomarker.");
				}
			} catch (err) {
				console.error("Error fetching biomarker data:", err);
				setError("Failed to load biomarker data. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchBiomarkerData();
	}, [name]);

	// Handle errors and loading states
	if (error) {
		return <div className={styles.error}>{error}</div>;
	}

	if (loading || !biomarkerData) {
		return <div className={styles.loading}>Loading...</div>;
	}

	const { description, unit, history } = biomarkerData;

	// Calculate dynamic Y-axis range
	const rawMin = Math.min(
		...history.map((data) => data.range[0]),
		...history.map((data) => data.value)
	);
	const rawMax = Math.max(
		...history.map((data) => data.range[1]),
		...history.map((data) => data.value)
	);
	const rangeDelta = (rawMax - rawMin); // Use (max-min)*2 for range delta
	const yAxisMin = Math.max(0, Math.round((rawMin - rangeDelta) * 10) / 10); // Round to 1 decimal place
	const yAxisMax = Math.round((rawMax + rangeDelta) * 10) / 10;

	const renderTooltipWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};

	const renderLegendWithoutRange = ({ payload, ...rest }) => {
		const newPayload = payload ? payload.filter((x) => x.dataKey !== "range") : [];
		return <DefaultLegendContent payload={newPayload} {...rest} />;
	};
	const latestResult = history[history.length - 1];
	console.log(latestResult, description, unit, history)

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

	return (
		<div>
			{/* Navigation */}
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

			{/* Header and Description */}
			<div className={styles.container}>
				<button className={styles.backButton} onClick={() => navigate(-1)}>
					&larr; Back
				</button>
				<div className={styles.header}>
					<h1>{name}</h1>
					<p>{description}</p>
					<div className={styles.lastResult}>
						<p><strong>Last Result:</strong> {history[history.length - 1].date}</p>
						<p>
						<strong>Status:</strong> {latestResult.value >= latestResult.range[0] && latestResult.value <= latestResult.range[1] ? "Normal" : "Abnormal"}
						</p>
						<p><strong>Value:</strong> {history[history.length - 1].value} {unit}</p>
						<p>
						<strong>Normal Range:</strong>{" "}
						{history[history.length - 1].range[0]} - {history[history.length - 1].range[1]} {unit}
						</p>
					</div>
				</div>
				{/* Chart */}
				<div className={styles.chartContainer}>
					{history.length > 0 ? (
						<ComposedChart
							width={800}
							height={400}
							data={historyWithPadding}
							margin={{
								top: 10,
								right: 30,
								left: 10,
								bottom: 10,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="date"
								padding={{ left: 20, right: 20 }}
								tickFormatter={(date) => {
									const [month, , year] = date.split("/"); // Assuming "MM/DD/YYYY"
									return `${month}/${year.slice(2)}`; // Format as "MM/YY"
								}}
							/>
							<YAxis domain={[yAxisMin, yAxisMax]} />
							<Tooltip content={renderTooltipWithoutRange} />
							<Legend content={renderLegendWithoutRange} />
							<Area
								type="monotone"
								dataKey="range"
								fill="lightgreen"
								stroke="none"
							/>
							<Line
								type="monotone"
								dataKey="value"
								stroke="#ff7300"
								strokeWidth={2}
							/>
						</ComposedChart>
					) : (
						<p>No historical data available for this biomarker.</p>
					)}
				</div>

				{/* Past Results */}
				<div className={styles.historyList}>
			<h2>Past Results</h2>
			<ul>
				{history
				.slice() // Create a shallow copy of the array
				.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by latest date
				.map((record, index) => {
					const lowerBound = record.range[0];
					const upperBound = record.range[1];
					const isGood = record.value >= lowerBound && record.value <= upperBound;
					const isModerate =
					(record.value >= lowerBound * 0.9 && record.value < lowerBound) ||
					(record.value > upperBound && record.value <= upperBound * 1.1);
					const isBad = !isGood && !isModerate;

					let status = "Good";
					let backgroundColor = "#e6ffe6"; // Green
					let textColor = "green";

					if (isModerate) {
					status = "Moderate";
					backgroundColor = "#fffbe6"; // Yellow
					textColor = "#ffcc00"; // Orange-yellow
					} else if (isBad) {
					status = "Bad";
					backgroundColor = "#ffe6e6"; // Red
					textColor = "red";
					}

					return (
					<li
						key={index}
						style={{
						display: "flex",
						flexDirection: "column",
						gap: "5px",
						marginBottom: "10px",
						padding: "10px",
						border: "1px solid #ddd",
						borderRadius: "5px",
						background: backgroundColor,
						}}
					>
						<div>
						<strong style={{ fontSize: "1.1rem" }}>{record.date}</strong>
						<p style={{ margin: "10px 0px 5px 0px" }}>
							Value: <strong>{record.value} {unit}</strong>{" "}
							<span style={{ color: textColor }}>({status})</span>
						</p>
						</div>
					</li>
					);
				})}
			</ul>
		</div>
		<div style={{ textAlign: "center", marginTop: "20px" }}>
			<button
			className={styles.add_new_btn}
				onClick={() => navigate("/chat")}
			>
				Talk to Elixer AI
			</button>
		</div>
			</div>
		</div>
	);
};

export default BiomarkerExpanded;
