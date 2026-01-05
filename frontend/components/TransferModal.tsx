import React, { useState } from 'react';
import { useTransferBalance } from '../hooks/useApi';
import { Card, Input, Button, Heading, Typography, Text } from './ui';
import { COLORS } from '../utils/styles';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, currentBalance }) => {
    const [toUsername, setToUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { mutate: transfer, isPending } = useTransferBalance();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Jumlah transfer tidak valid');
            return;
        }

        if (amountNum > currentBalance) {
            setError('Saldo tidak mencukupi');
            return;
        }

        transfer(
            { toUsername, amount: amountNum, description },
            {
                onSuccess: () => {
                    onClose();
                    setAmount('');
                    setToUsername('');
                    setDescription('');
                },
                onError: (err) => {
                    setError(err.message || 'Transfer gagal');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card variant="glass" className="w-full max-w-md relative overflow-hidden p-8 shadow-2xl">
                {/* Tape deco */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-green-100/80 dark:bg-green-900/30 rotate-1 shadow-sm z-20"></div>

                <div className="flex justify-between items-center mb-6">
                    <Heading level={2} className={`${COLORS.TEXT_PRIMARY}`}>Transfer Saldo</Heading>
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
                        label="Username Penerima"
                        value={toUsername}
                        onChange={(e) => setToUsername(e.target.value)}
                        placeholder="username"
                        required
                        fullWidth
                        variant="glass"
                        className="font-patrick"
                    />

                    <div className="space-y-1">
                        <Input
                            label="Jumlah Transfer"
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
                        <Typography variant="caption" className={`${COLORS.TEXT_SECONDARY} font-mono italic`}>
                            Saldo saat ini: Rp {currentBalance.toLocaleString()}
                        </Typography>
                    </div>

                    <div className="space-y-1">
                        <label className={`block text-sm font-bold font-patrick mb-1 ${COLORS.TEXT_PRIMARY}`}>
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${COLORS.BORDER} bg-white/50 dark:bg-black/20 ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-patrick text-lg`}
                            placeholder="Untuk beli kopi..."
                            rows={3}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="success"
                        isLoading={isPending}
                        fullWidth
                        size="lg"
                        className="font-patrick text-xl mt-2 shadow-md"
                    >
                        {isPending ? 'Memproses...' : 'Kirim Sekarang 🚀'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default TransferModal;
