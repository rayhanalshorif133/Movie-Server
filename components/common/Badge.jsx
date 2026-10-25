import React, { use, useEffect } from 'react';

export default function Badge({ title }) {
    const generateRandomColors = () => {
        const hue = Math.floor(Math.random() * 360);
        return {
            backgroundColor: `hsla(${hue}, 70%, 90%, 1)`,
            color: `hsla(${hue}, 70%, 20%, 1)`,
            borderColor: `hsla(${hue}, 70%, 80%, 1)`,
        };
    };

    const [color, setColor] = React.useState();

    useEffect(() => {
        setColor(generateRandomColors());
    }, []);

    return (
        <span
            style={color}
            className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-105 cursor-default shadow-sm"
        >
            {title}
        </span>
    );
}