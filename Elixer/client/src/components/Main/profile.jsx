import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./profile.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
    // State to hold profile data
    const [profileData, setProfileData] = useState(null);
    const navigate = useNavigate();
    const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
		window.location.reload();
	};

    const home = () => {
        navigate("/");
    };

    // Fetch data from the backend
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`${apiurl}/users/profile/${localStorage.getItem("token")}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const totalFields = 5;
                const completedFields = Object.keys(response.data).filter(
                    (key) => ["age", "height", "weight", "ethnicity", "sex"].includes(key) && response.data[key]
                ).length;

                response.data.progress = (completedFields / totalFields) * 100;
                setProfileData(response.data);
                console.log(response.data)
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };
        fetchProfileData();
    }, []);

    // Show loading state if data is not yet loaded
    if (!profileData) {
        return <div className={styles.profile_container}>Loading...</div>;
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
            <div className={styles.profile_container}>
                {/* Back and Title Section */}
                <div className={styles.header}>
                    <button className={styles.back_button} onClick={home}>&larr;</button>
                    <h1>Health Profile</h1>
                </div>

                {/* Subtitle */}
                <p className={styles.subtitle}>
                </p>

                {/* Progress Bar */}
                <div className={styles.progress_container}>
                    <div className={styles.progress_bar}>
                        <div
                            className={styles.progress_fill}
                            style={{ width: `${profileData.progress}%` }}
                        ></div>
                    </div>
                    <span className={styles.progress_text}>{profileData.progress}% completed</span>
                </div>

                {/* General Information Section */}
                <div className={styles.info_section}>
                    <h2>General Information</h2>
                    <div className={styles.info_container}>
                        {/* Left Column */}
                        <div className={styles.info_left}>
                            <div className={styles.info_card}>
                                <span>{profileData.age} years</span>
                                <span className={styles.info_label}>Age</span>
                            </div>
                            <div className={styles.info_card}>
                                <span>{profileData.height}</span>
                                <span className={styles.info_label}>Height</span>
                            </div>
                            <div className={styles.info_card}>
                                <span>{profileData.weight}</span>
                                <span className={styles.info_label}>Weight</span>
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className={styles.info_right}>
                            <div className={styles.info_card}>
                                <span>{profileData.ethnicity}</span>
                                <span className={styles.info_label}>Ethnicity</span>
                            </div>
                            <div className={styles.info_card}>
                                <span>{profileData.sex}</span>
                                <span className={styles.info_label}>Sex</span>
                            </div>
                        </div>
                        {/* Center Avatar */}
                        <div className={styles.avatar_container}>
                            <img src="/images/body.svg" alt="Avatar" className={styles.avatar} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
