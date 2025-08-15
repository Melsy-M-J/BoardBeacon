import React from 'react';

interface ContinueGameModalProps {
    isOpen: boolean;
    onContinue: () => void;
    onStartNew: () => void;
    title: string;
    message: string;
}

const ContinueGameModal: React.FC<ContinueGameModalProps> = ({ isOpen, onContinue, onStartNew, title, message }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-brand-dark bg-opacity-70 z-50 flex items-center justify-center p-4"
        >
            <div 
                className="bg-brand-primary rounded-lg shadow-2xl p-8 w-full max-w-md animate-scale-in border border-brand-secondary"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-center text-brand-accent mb-4">{title}</h2>
                <p className="text-center text-brand-light mb-8">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onStartNew}
                        className="bg-brand-secondary text-brand-light font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors"
                    >
                        Start New Game
                    </button>
                    <button
                        onClick={onContinue}
                        className="bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors"
                    >
                        Continue Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContinueGameModal;