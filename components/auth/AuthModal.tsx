import React, { useContext, useState, FormEvent } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const AuthModal: React.FC = () => {
    const { login, setAuthModalOpen } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (email && password) {
            const success = login(email, password);
            if (!success) {
                setError('Invalid email or password.');
            } else {
                setError(null);
                // On success, the modal is closed by the context.
            }
        } else {
            setError('Please enter both email and password.');
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-brand-dark bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={() => setAuthModalOpen(false)}
        >
            <div 
                className="bg-brand-primary rounded-lg shadow-2xl p-8 w-full max-w-md animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-center text-brand-accent mb-6">Login or Sign Up</h2>
                <p className="text-center text-brand-light mb-6">Enter your credentials to log in. If the account doesn't exist, one will be created for you.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-brand-light text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 text-brand-light bg-brand-secondary border border-brand-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-brand-light text-sm font-bold mb-2">Password</label>
                         <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 text-brand-light bg-brand-secondary border border-brand-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            placeholder="********"
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center mb-4 animate-fade-in">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-brand-accent text-brand-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300"
                    >
                        Login / Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;