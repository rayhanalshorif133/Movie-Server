import React, { useEffect } from 'react';
import { FaEye } from 'react-icons/fa';

export default function VisualBadge({ title }) {
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
        <div
            style={color}
            className="group inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[12px] font-bold border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer active:scale-95 shadow-sm"
        >
            <FaEye
                className="transition-transform duration-300 group-hover:scale-120 group-hover:rotate-12"
                size={12}
            />

            <span className="uppercase">
                {title}
            </span>
        </div>
    );
}