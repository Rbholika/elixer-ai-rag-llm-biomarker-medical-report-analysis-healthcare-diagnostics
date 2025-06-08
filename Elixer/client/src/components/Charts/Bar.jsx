import React from 'react';
import './Bar.css';

const Bar = ({ value, range_min, range_max, min, max, title }) => {
  const range = range_max - range_min;
  const normalizedValue = (value - min) / (max - min) * 100;

  let barColor;
  if (value >= range_min && value <= range_max) {
    barColor = 'green';
  } else {
    barColor = 'red';
  }

  const barStyle = {
    width: `${normalizedValue}%`,
    backgroundColor: barColor,
  };

  const rangeMinPosition = (range_min - min) / (max - min) * 100;
  const rangeMaxPosition = (range_max - min) / (max - min) * 100;

  return (
    <div className="bar-chart">
      <div className='title'>{title}</div>
      <div className="bar-wrapper">
        <div className="bar"
            style={{ left: `${rangeMinPosition}%`,
                    width: `${rangeMaxPosition - rangeMinPosition}%`,
                    backgroundColor: "green" }}>
        </div>
        <div className="bar"
            style={{ right: `${rangeMinPosition}%`,
                    width: `${rangeMinPosition}%`,
                    backgroundColor: "red" }}>
        </div>
        <div className="bar"
            style={{ left: `${rangeMaxPosition}%`,
                    width: `${rangeMaxPosition}%`,
                    backgroundColor: "red" }}>
        </div>
        <div className="point" style={{ left: `${normalizedValue}%` }}></div>
        <div className="range-marker" style={{ left: `${rangeMinPosition}%` }}><div>{range_min}</div></div>
        <div className="range-marker" style={{ left: `${rangeMaxPosition}%`}}><div>{range_max}</div></div>
      </div>
      <div className="range">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Bar;
