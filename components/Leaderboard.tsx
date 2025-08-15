import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User, GameId } from '../types';

interface LeaderboardProps {
    onBack: () => void;
}

const calculateScore = (user: User): { score: number, totalWins: number } => {
    let score = 0;
    let totalWins = 0;
    Object.keys(user.stats).forEach(gameId => {
        const stats = user.stats[gameId as GameId];
        score += stats.wins * 10;
        score += stats.draws * 3;
        score -= stats.losses * 2;
        totalWins += stats.wins;
    });
    return { score, totalWins };
};

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
    const { allUsers, user: currentUser } = useContext(AuthContext);

    const rankedPlayers = useMemo(() => {
        return allUsers
            .map(player => {
                const { score, totalWins } = calculateScore(player);
                return {
                    name: player.playerName,
                    email: player.email,
                    score,
                    wins: totalWins
                };
            })
            .sort((a, b) => b.score - a.score)
            .map((player, index) => ({ ...player, rank: index + 1 }));
    }, [allUsers]);

    return (
        <div className="w-full max-w-3xl mx-auto bg-brand-primary p-6 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-brand-light">Weekly Leaderboard</h2>
                <button onClick={onBack} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
            </div>
            {rankedPlayers.length > 0 ? (
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="min-w-full text-left">
                        <thead className="border-b border-brand-secondary sticky top-0 bg-brand-primary">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-brand-accent">Rank</th>
                                <th className="p-3 text-sm font-semibold text-brand-accent">Player</th>
                                <th className="p-3 text-sm font-semibold text-brand-accent">Score</th>
                                <th className="p-3 text-sm font-semibold text-brand-accent">Total Wins</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankedPlayers.map((player) => (
                                <tr 
                                    key={player.email} 
                                    className={`
                                        border-b border-brand-secondary/50 
                                        ${player.rank === 1 ? 'bg-yellow-500/20' : ''}
                                        ${player.rank === 2 ? 'bg-gray-400/20' : ''}
                                        ${player.rank === 3 ? 'bg-orange-400/20' : ''}
                                        ${currentUser?.email === player.email ? 'ring-2 ring-brand-accent' : ''}
                                    `}
                                >
                                    <td className="p-3 font-bold text-brand-light text-lg">{player.rank}</td>
                                    <td className="p-3 text-brand-light">{player.name}</td>
                                    <td className="p-3 text-brand-accent font-semibold">{player.score}</td>
                                    <td className="p-3 text-brand-light">{player.wins}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <div className="text-center py-10">
                    <p className="text-gray-400">No players on the leaderboard yet. Be the first to play and set a score!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
