import React, { useState, useEffect } from 'react';
import BotResponse from './BotResponse'; // Ensure correct import path
import styles from './styles.module.css';

function AnimatedBotMessage({ message }) {
    const [displayedMessage, setDisplayedMessage] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            setDisplayedMessage(message.substring(0, currentIndex));
            currentIndex += 10;
            if (currentIndex > message.length) clearInterval(interval);
        }, 1); // Adjust the interval for typing speed

        return () => clearInterval(interval);
    }, [message]);

    return (
        <div className={styles.bot_message}>
            <BotResponse response={displayedMessage} />
        </div>
    );
}

export default AnimatedBotMessage;
