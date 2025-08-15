import React, { useContext, useState, FormEvent } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const AuthModal: React.FC = () => {
    const { login, setAuthModalOpen } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (email) {
            login(email);
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
                <h2 className="text-2xl font-bold text-center text-brand-accent mb-6">Welcome Back</h2>
                <p className="text-center text-brand-light mb-6">Login to save your progress and compete on the leaderboard. This is a mock login, just enter any email and click Login.</p>
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
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-brand-light text-sm font-bold mb-2">Password</label>
                         <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 text-brand-light bg-brand-secondary border border-brand-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            placeholder="********"
                        />
                    </div>
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
