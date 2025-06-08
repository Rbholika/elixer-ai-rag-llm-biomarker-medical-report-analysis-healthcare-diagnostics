import React, { useState, useEffect } from "react";
import axios from "axios";
import BiomarkerCard from "./BiomarkerCard"; // Import the BiomarkerCard component
import styles from "./results.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const Results = () => {
    const [biomarkers, setBiomarkers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Navigate to other pages
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    const home = () => navigate("/");
    const navReports = () => navigate(-1);

    // Fetch biomarkers on component mount
    useEffect(() => {
        const fetchBiomarkers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${apiurl}/bloodreport/biomarkers`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log(response.data);
                setBiomarkers(response.data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching biomarkers:", err);
                setError("Failed to fetch biomarkers. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBiomarkers();
    }, []);

    // Filter biomarkers based on search input
    const filteredBiomarkers = biomarkers.filter((biomarker) =>
        biomarker.name.toLowerCase().includes(search.toLowerCase())
    );

    // Render loading or error states
    if (loading) {
        return <div className={styles.loading}>Loading biomarkers...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div>
            {/* Navigation Bar */}
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

            {/* Content */}
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backButton} onClick={navReports}>
                        &larr;
                    </button>
                    <h1>Biomarkers Overview</h1>
                    <p>
                        Track the biomarkers extracted from your lab tests to monitor your health
                        trends.
                    </p>
                </header>

                {/* Search Input */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search By Biomarker Name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Biomarkers List */}
                <div className={styles.biomarkerList}>
                    {filteredBiomarkers.length > 0 ? (
                        filteredBiomarkers.map((biomarker, index) => (
                            <BiomarkerCard key={index} biomarker={biomarker} />
                        ))
                    ) : (
                        <div className={styles.noResults}>
                            No biomarkers match your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Results;
