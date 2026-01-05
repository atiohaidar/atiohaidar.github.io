import React, { useState } from 'react';
import { useTopUpBalance } from '../hooks/useApi';
import { Card, Input, Button, Heading, Typography } from './ui';
import { COLORS } from '../utils/styles';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
    const [targetUsername, setTargetUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { mutate: topUp, isPending } = useTopUpBalance();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Jumlah top up tidak valid');
            return;
        }

        topUp(
            { targetUsername, amount: amountNum, description },
            {
                onSuccess: () => {
                    onClose();
                    setAmount('');
                    setTargetUsername('');
                    setDescription('');
                },
                onError: (err) => {
                    setError(err.message || 'Top up gagal');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card variant="glass" className="w-full max-w-md relative overflow-hidden p-8 shadow-2xl border-purple-200 dark:border-purple-800">
                {/* Tape deco */}
                <div className="absolute -top-3 left-10 w-24 h-8 bg-purple-100/80 dark:bg-purple-900/30 -rotate-2 shadow-sm z-20"></div>

                <div className="flex justify-between items-center mb-6">
                    <Heading level={2} className={`${COLORS.TEXT_PRIMARY}`}>Top Up Saldo</Heading>
                    <button
                        onClick={onClose}
                        className={`${COLORS.TEXT_SECONDARY} hover:text-red-500 transition-colors p-1`}
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-dashed border-red-300 rounded-xl flex items-center gap-3 transform -rotate-1">
                        <span className="text-xl">⚠️</span>
                        <Typography variant="caption" className="text-red-800 dark:text-red-200 font-bold font-patrick">{error}</Typography>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Username Target"
                        value={targetUsername}
                        onChange={(e) => setTargetUsername(e.target.value)}
                        placeholder="username"
                        required
                        fullWidth
                        variant="glass"
                        className="font-patrick"
                    />

                    <Input
                        label="Jumlah Top Up"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        min="1"
                        required
                        fullWidth
                        variant="glass"
                        className="font-patrick"
                    />

                    <div className="space-y-1">
                        <label className={`block text-sm font-bold font-patrick mb-1 ${COLORS.TEXT_PRIMARY}`}>
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${COLORS.BORDER} bg-white/50 dark:bg-black/20 ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-purple-500/50 outline-none transition-all font-patrick text-lg`}
                            placeholder="Bonus bulanan..."
                            rows={3}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isPending}
                        fullWidth
                        size="lg"
                        className="font-patrick text-xl mt-2 shadow-md"
                        style={{ backgroundColor: 'rgb(147 51 234)' }} // Purple color for top up
                    >
                        {isPending ? 'Memproses...' : 'Top Up Sekarang 💎'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default TopUpModal;
