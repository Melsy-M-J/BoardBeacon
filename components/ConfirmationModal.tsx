import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-brand-dark bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-brand-primary rounded-lg shadow-2xl p-8 w-full max-w-md animate-scale-in border border-brand-secondary"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-center text-red-400 mb-4">{title}</h2>
                <p className="text-center text-brand-light mb-8">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="bg-brand-secondary text-brand-light font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;