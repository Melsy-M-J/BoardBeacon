import React, { useState, useEffect } from 'react';

interface DiceProps {
    value: number | null;
    isRolling: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, isRolling }) => {
    const [displayValue, setDisplayValue] = useState<number>(1);

    useEffect(() => {
        if (isRolling) {
            const interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * 6) + 1);
            }, 80);
            return () => clearInterval(interval);
        } else if (value) {
            setDisplayValue(value);
        }
    }, [isRolling, value]);

    const faces = [
        <div key="1" className="flex justify-center items-center"><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>,
        <div key="2" className="flex justify-between">
            <span className="w-3 h-3 bg-brand-primary rounded-full self-start"></span>
            <span className="w-3 h-3 bg-brand-primary rounded-full self-end"></span>
        </div>,
        <div key="3" className="flex justify-between">
            <span className="w-3 h-3 bg-brand-primary rounded-full self-start"></span>
            <span className="w-3 h-3 bg-brand-primary rounded-full self-center"></span>
            <span className="w-3 h-3 bg-brand-primary rounded-full self-end"></span>
        </div>,
        <div key="4" className="flex justify-between">
            <div className="flex flex-col justify-between"><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>
            <div className="flex flex-col justify-between"><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>
        </div>,
        <div key="5" className="flex justify-between">
            <div className="flex flex-col justify-between"><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>
            <div className="flex flex-col justify-center"><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>
            <div className="flex flex-col justify-between"><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>
        </div>,
        <div key="6" className="flex justify-between">
            <div className="flex flex-col justify-between"><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>
            <div className="flex flex-col justify-between"><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span><span className="w-3 h-3 bg-brand-primary rounded-full"></span></div>
        </div>
    ];
    
    return (
        <div className={`w-20 h-20 bg-brand-light rounded-lg p-2 flex items-center justify-center shadow-lg transition-transform duration-300 ${isRolling ? 'animate-tumble' : ''}`}>
            { value === null && !isRolling ? <div className="text-brand-primary font-bold text-4xl">?</div> : faces[displayValue - 1] }
        </div>
    );
};
export default Dice;
