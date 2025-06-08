import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import axios from "axios";

function Main() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ progress: 0 });
    const apiurl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await axios.get(`${apiurl}/profile`, {
                        headers: {
                            Authorization: token
                        }
                    });
                    setProfileData(response.data);
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        fetchProfileData();
    }, [apiurl]);

    const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.reload();
	};

    const chat = () => {
        navigate("/chat");
    };

    const reports = () => {
        navigate("/reports");
    };

    const profile = () => {
        navigate("/profile");
    };

    return (
        <div className={styles.main_wrapper}>
            {/* Navbar */}
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

            <div className={styles.dashboard_container}>
                {/* Dashboard Header */}
                <div className={styles.dashboard_header} onClick={profile}>
                    <div className={styles.profile_summary}>
                        <h2>Welcome back!</h2>
                        <div className={styles.progress_container}>
                            <div className={styles.progress_circle}>
                                <span>10{profileData.progress}%</span>
                            </div>
                            <p>Profile Completion</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Body */}
                <div className={styles.dashboard_grid}>
                    <div className={`${styles.card} ${styles.chatdoctor}`} onClick={chat}>
                        <div className={styles.card_content}>
                            <div className={styles.card_text}>
                                <h3>Chat with AI</h3>
                                <p>Get instant answers to your health questions</p>
                            </div>
                            <div className={styles.card_image_container}>
                                <img src="/images/ai_doctor.webp" alt="Chat with AI Doctor" className={styles.card_image} />
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.card} ${styles.labtests}`} onClick={reports}>
                        <div className={styles.card_content}>
                            <div className={styles.card_text}>
                                <h3>Lab Reports</h3>
                                <p>View and analyze your medical test results</p>
                            </div>
                            <div className={styles.card_image_container}>
                                <img src="/images/lab_tests.webp" alt="Lab Tests" className={styles.card_image} />
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.card} ${styles.consultation}`}>
                        <div className={styles.card_content}>
                            <div className={styles.card_text}>
                                <h3>Consult Top Doctors</h3>
                                <p>Coming Soon. Online consultation with doctors worldwide</p>
                            </div>
                            <div className={styles.card_image_container}>
                                <img src="/images/online.webp" alt="Consult Top Doctors" className={styles.card_image} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main;
