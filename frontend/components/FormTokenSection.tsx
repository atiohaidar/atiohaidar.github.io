import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from './Section';
import { Card, Heading, Text, Input, Button } from './ui';

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
        <Section id="form-token" number="06" title="Formulir">
            <div className="max-w-2xl mx-auto">
                <Card padding="lg" className="text-center">
                    <Heading level={2} className="text-3xl md:text-4xl font-bold mb-4">
                        Isi Formulir
                    </Heading>
                    <Text className="text-light-muted dark:text-gray-400 mb-8">
                        Masukkan token untuk mengakses dan mengisi formulir
                    </Text>
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <Input
                            label="Token Formulir"
                            type="text"
                            id="token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Masukkan token formulir"
                            required
                        />
                        <Button type="submit" variant="primary" size="lg" className="w-full">
                            Akses Formulir
                        </Button>
                    </form>
                </Card>
            </div>
        </Section>
    );
};

export default FormTokenSection;

