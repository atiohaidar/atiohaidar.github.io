import React, { memo } from 'react';

interface Room {
    id: string;
    name: string;
    capacity: number;
    description?: string;
    available: boolean;
}

interface RoomInfoCardProps {
    room: Room;
    className?: string;
}

const RoomInfoCard: React.FC<RoomInfoCardProps> = memo(({ room, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {room.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        ID: {room.id}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${room.available
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                >
                    {room.available ? 'Tersedia' : 'Tidak Tersedia'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Kapasitas: <strong>{room.capacity}</strong> orang</span>
                </div>
            </div>

            {room.description && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Deskripsi
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                        {room.description}
                    </p>
                </div>
            )}
        </div>
    );
});

RoomInfoCard.displayName = 'RoomInfoCard';

export default RoomInfoCard;
