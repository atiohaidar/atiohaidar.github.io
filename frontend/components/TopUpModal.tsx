import React, { useState } from 'react';
import { useTopUpBalance } from '../hooks/useApi';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
    const [targetUsername, setTargetUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { mutate: topUp, isPending } = useTopUpBalance();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Jumlah top up tidak valid');
            return;
        }

        topUp(
            { targetUsername, amount: amountNum, description },
            {
                onSuccess: (data) => {
                    // Close modal immediately, let the overlay show success
                    onClose();
                    setAmount('');
                    setTargetUsername('');
                    setDescription('');
                    setSuccessMessage(null);
                },
                onError: (err) => {
                    setError(err.message || 'Top up gagal');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Top Up Saldo (Admin)</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username Target
                        </label>
                        <input
                            type="text"
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Jumlah Top Up
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Bonus bulanan..."
                            rows={2}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:from-purple-700 hover:to-pink-600 focus:ring-4 focus:ring-purple-500/30 disabled:opacity-50 transition-all"
                    >
                        {isPending ? 'Memproses...' : 'Top Up Sekarang'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TopUpModal;
