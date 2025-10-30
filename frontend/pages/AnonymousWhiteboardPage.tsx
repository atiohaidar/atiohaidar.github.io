import React from 'react';
import AnonymousWhiteboard from '../components/AnonymousWhiteboard';

const AnonymousWhiteboardPage: React.FC = () => {
    return <AnonymousWhiteboard isOpen={true} onClose={() => window.history.back()} />;
};

export default AnonymousWhiteboardPage;
