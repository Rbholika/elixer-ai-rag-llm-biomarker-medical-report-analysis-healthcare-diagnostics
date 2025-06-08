import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./labreports.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const LabReports = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    const home = () => {
        navigate("/");
    };

    const navReports = () => {
        navigate("/reports");
    };

    // Fetch reports with pre-signed URLs from the backend
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token"); // Get token from localStorage

                const response = await axios.get(`${apiurl}/files/${token}`); // Adjust endpoint as needed
                setReports(response.data); // Set fetched reports with pre-signed URLs
            } catch (err) {
                console.error("Error fetching reports:", err);
                setError("Failed to fetch reports. Please try again later.");
            }
        };

        fetchReports();
    }, []);

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div>
            <div className={styles.main_container}>
                <nav className={styles.navbar}>
                    <div className={styles.title_container} onClick={home}>
                        <FontAwesomeIcon icon={faHome} className={styles.home_icon} />
                        <h1>Elixer AI</h1>
                    </div>
                    <button className={styles.white_btn} onClick={handleLogout}>
                        Logout
                    </button>
                </nav>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.back_button} onClick={navReports}>&larr;</button>
                    <h1>Lab Reports</h1>
                </div>
                {reports.map((report, index) => (
                    <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.title}>{"Test Report"}</div>
                        <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.view_link}
                        >
                            View PDF
                        </a>
                    </div>
                    {report.description && (
                        <div className={styles.description}>{report.description}</div>
                    )}
                    <div className={styles.dateRow}>
                        <div>
                            <span>Upload Date: </span>
                            <span>
                                {new Date(report.uploadDate).toLocaleString("en-US", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </span>
                        </div>
                        <div>
                            <span>Test Date: </span>
                            <span>
                                {report.testDate
                                    ? new Date(report.testDate).toLocaleString("en-US", {
                                          dateStyle: "medium",
                                      })
                                    : "Not Provided"}
                            </span>
                        </div>
                    </div>
                </div>

                ))}
            </div>
        </div>
    );
};

export default LabReports;
