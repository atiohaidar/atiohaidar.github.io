import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/styles';

const FormTokenSection: React.FC = () => {
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (token.trim()) {
            navigate(`/form/${token.trim()}`);
        }
    };

    return (
        <section id="form-token" className={`py-16 md:py-20 ${COLORS.BG_PRIMARY}`}>
            <div className="container mx-auto px-4 max-w-2xl">
                <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-xl p-8 md:p-12`}>
                    <h2 className={`text-3xl md:text-4xl font-bold ${COLORS.TEXT_PRIMARY} mb-4 text-center`}>
                        Isi Formulir
                    </h2>
                    <p className={`${COLORS.TEXT_SECONDARY} text-center mb-8`}>
                        Masukkan token untuk mengakses dan mengisi formulir
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="token" className={`block ${COLORS.TEXT_PRIMARY} mb-2 font-medium`}>
                                Token Formulir
                            </label>
                            <input
                                type="text"
                                id="token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Masukkan token formulir"
                                className={`w-full px-4 py-3 rounded-lg ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} border ${COLORS.BORDER} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                        >
                            Akses Formulir
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default FormTokenSection;
