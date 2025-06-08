import React from "react";
import styles from "./biomarkerCard.module.css";
import { useNavigate } from "react-router-dom";

const BiomarkerCard = ({ biomarker }) => {
    const { name, result, unit, referenceRange, reportDate } = biomarker;
    const navigate = useNavigate();

    // Range and status calculations
    const min = referenceRange.min;
    const max = referenceRange.max;
    const margin = (max - min) * 0.25; // 15% margin
    const isInRange = result >= min && result <= max;
    const isClose = (result >= min - margin && result < min) || (result > max && result <= max + margin);
    const statusColor = isInRange ? "green" : isClose ? "orange" : "red";

    // Progress bar positioning
    const position = Math.min(100, Math.max(0, ((result - min) / (max - min)) * 100));

    // Navigate to sub-chart page
    const handleArrowClick = () => {
        navigate(`/reports/biomarker/${name.toLowerCase()}`);
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{name}</h3>
                <p className={styles.value}>
                    <span className={styles.indicator} style={{ color: statusColor }}>
                        &#9654;
                    </span>
                    {result} {unit}
                </p>
            </div>
            <div className={styles.chartContainer}>
                <div className={styles.chart}>
                    <div className={styles.rangeBar}></div>
                    <div
                        className={styles.indicatorDot}
                        style={{
                            left: `${position}%`,
                            backgroundColor: statusColor,
                        }}
                    ></div>
                </div>
                <div className={styles.rangeLabels}>
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            </div>
            <div className={styles.footer}>
                <p className={styles.updatedDate}>
                    Updated: {new Date(reportDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <span className={styles.arrow} onClick={handleArrowClick}>
                    <p style={{fontWeight: "bold"}}>View More &rarr; </p>
                </span>
            </div>
        </div>
    );
};

export default BiomarkerCard;
