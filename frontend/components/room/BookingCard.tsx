import React, { memo } from 'react';

interface Booking {
    id: string;
    room_id: string;
    booker_username: string;
    purpose: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at: string;
}

interface BookingCardProps {
    booking: Booking;
    onViewDetail?: (booking: Booking) => void;
    onApprove?: (bookingId: string) => void;
    onReject?: (bookingId: string) => void;
    isAdmin?: boolean;
    className?: string;
}

const statusConfig = {
    pending: {
        label: 'Menunggu',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        dotColor: 'bg-yellow-500'
    },
    confirmed: {
        label: 'Dikonfirmasi',
        bgColor: 'bg-green-100 dark:bg-green-900',
        textColor: 'text-green-800 dark:text-green-200',
        dotColor: 'bg-green-500'
    },
    cancelled: {
        label: 'Dibatalkan',
        bgColor: 'bg-red-100 dark:bg-red-900',
        textColor: 'text-red-800 dark:text-red-200',
        dotColor: 'bg-red-500'
    }
};

const BookingCard: React.FC<BookingCardProps> = memo(({
    booking,
    onViewDetail,
    onApprove,
    onReject,
    isAdmin = false,
    className = ''
}) => {
    const status = statusConfig[booking.status];

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${booking.status === 'confirmed' ? 'border-green-500' :
                    booking.status === 'pending' ? 'border-yellow-500' :
                        'border-red-500'
                } ${className}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {booking.purpose}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        oleh {booking.booker_username}
                    </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                    {status.label}
                </span>
            </div>

            {/* Time Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                    {formatDate(booking.start_time)} • {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {onViewDetail && (
                    <button
                        onClick={() => onViewDetail(booking)}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                        Lihat Detail
                    </button>
                )}

                {isAdmin && booking.status === 'pending' && (
                    <>
                        {onApprove && (
                            <button
                                onClick={() => onApprove(booking.id)}
                                className="ml-auto text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                                Setujui
                            </button>
                        )}
                        {onReject && (
                            <button
                                onClick={() => onReject(booking.id)}
                                className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                Tolak
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

BookingCard.displayName = 'BookingCard';

export default BookingCard;
