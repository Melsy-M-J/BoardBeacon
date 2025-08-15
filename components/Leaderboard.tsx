import React from 'react';

interface LeaderboardProps {
    onBack: () => void;
}

const mockData = [
    { rank: 1, name: 'AI_Slayer_X', score: 2450, wins: 120 },
    { rank: 2, name: 'GeminiMaster', score: 2300, wins: 112 },
    { rank: 3, name: 'BoardGamer1', score: 2210, wins: 105 },
    { rank: 4, name: 'Checkmate_King', score: 2150, wins: 98 },
    { rank: 5, name: 'Player_42', score: 2080, wins: 95 },
    { rank: 6, name: 'StrategicMind', score: 1990, wins: 91 },
    { rank: 7, name: 'LobbyLegend', score: 1950, wins: 88 },
    { rank: 8, name: 'TheChallenger', score: 1870, wins: 82 },
    { rank: 9, name: 'Rookie_Rocket', score: 1810, wins: 79 },
    { rank: 10, name: 'PuzzleProdigy', score: 1750, wins: 75 },
];

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
    return (
        <div className="w-full max-w-3xl mx-auto bg-brand-primary p-8 rounded-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-brand-light">Weekly Leaderboard</h2>
                <button onClick={onBack} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="border-b border-brand-secondary">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-brand-accent">Rank</th>
                            <th className="p-3 text-sm font-semibold text-brand-accent">Player</th>
                            <th className="p-3 text-sm font-semibold text-brand-accent">Score</th>
                            <th className="p-3 text-sm font-semibold text-brand-accent">Wins</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockData.map((player, index) => (
                            <tr key={player.rank} className={`border-b border-brand-secondary/50 ${index < 3 ? 'bg-brand-secondary/50' : ''}`}>
                                <td className="p-3 font-bold text-brand-light">{player.rank}</td>
                                <td className="p-3 text-brand-light">{player.name}</td>
                                <td className="p-3 text-brand-accent">{player.score}</td>
                                <td className="p-3 text-brand-light">{player.wins}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
