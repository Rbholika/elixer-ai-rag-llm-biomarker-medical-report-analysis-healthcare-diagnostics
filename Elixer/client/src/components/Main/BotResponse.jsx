import React from 'react';
import styles from './styles.module.css';

const BotResponse = ({ response }) => {
	// Transform response into JSX elements
	if (typeof response === 'object' && response !== null && response.$$typeof === Symbol.for('react.element')) {
		response = response.props.response
	}
	const formattedResponse = response.split('\n')
		.map((line, index) => {
			if (line.startsWith('**') && line.endsWith('**')) {
                const boldText = line.slice(2, -2);
                return <strong key={index}>{boldText}</strong>;
            }
            // Handle bullet points
            else if (line.startsWith('*')) {
                const content = line.slice(1).trim();
                const [bulletText, regularText] = content.split(':');
                return (
                    <li key={index}>
                        <strong>{bulletText}</strong>: {regularText}
                    </li>
                );
            }
			return <p key={index}>{line}</p>;

		});

	return (
		<div className={styles.botResponse}>
			{formattedResponse}
		</div>
	);
};

export default BotResponse;
