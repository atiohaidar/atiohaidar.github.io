import React from 'react';
import type { Booking } from '../../types/booking';
import { useTheme } from '../../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../../utils/styles';

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ');

interface BookingTimelineProps {
    bookings: Booking[];
    selectedDate: Date;
    onBookingClick: (booking: Booking) => void;
    canEditBooking: (booking: Booking) => boolean;
    getDisplayDates: () => Date[];
}

const BookingTimeline: React.FC<BookingTimelineProps> = ({
    bookings,
    selectedDate,
    onBookingClick,
    canEditBooking,
    getDisplayDates
}) => {
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const displayDates = getDisplayDates();
    const columnWidth = 170;
    const minTableWidth = Math.max(displayDates.length * columnWidth, 480);
    const rowHeight = 64;

    const getBookingsForHour = (date: Date, hour: number) => {
        return bookings.filter((booking) => {
            const bookingDate = new Date(booking.start_time);
            const bookingEndTime = new Date(booking.end_time);
            return (
                bookingDate.toDateString() === date.toDateString() &&
                bookingDate.getHours() <= hour &&
                bookingEndTime.getHours() > hour
            );
        });
    };

    const getBookingStyle = (booking: Booking, hour: number) => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const startHour = startTime.getHours() + startTime.getMinutes() / 60;
        const endHour = endTime.getHours() + endTime.getMinutes() / 60;

        // Only render the block in the first hour cell it appears in
        if (startHour < hour || startHour >= hour + 1) {
            return null;
        }

        const top = (startHour - hour) * rowHeight;
        const height = Math.max((endHour - startHour) * rowHeight, 16);

        return { top: `${top}px`, height: `${height}px` };
    };

    const getBookingStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            case 'rejected': return 'bg-red-500';
            case 'cancelled': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className={cx('rounded-lg overflow-hidden', palette.timeline.border)}>
            <div className="max-h-[600px] overflow-auto">
                <div
                    className="min-w-[480px]"
                    style={{
                        minWidth: `${minTableWidth}px`,
                    }}
                >
                    {/* Header Row */}
                    <div
                        className={cx('grid border-b', palette.timeline.border)}
                        style={{
                            gridTemplateColumns: `80px repeat(${displayDates.length}, minmax(${columnWidth}px, 1fr))`,
                        }}
                    >
                        <div
                            className={cx(
                                'sticky left-0 z-20 p-3 text-xs font-medium border-r',
                                palette.timeline.headerText,
                                palette.timeline.hourBg,
                                palette.timeline.border
                            )}
                        >
                            Jam
                        </div>
                        {displayDates.map((date, index) => (
                            <div
                                key={index}
                                className={cx('p-3 text-center border-r', palette.timeline.border, palette.timeline.headerBg)}
                            >
                                <div className={cx('text-xs font-medium', palette.timeline.headerText)}>
                                    {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                                </div>
                                <div
                                    className={cx(
                                        'text-base font-semibold',
                                        date.toDateString() === new Date().toDateString()
                                            ? 'text-accent-blue'
                                            : palette.panel.textMuted
                                    )}
                                >
                                    {date.getDate()}
                                </div>
                                <div className={cx('text-xs', palette.panel.textMuted)}>
                                    {date.toLocaleDateString('id-ID', { month: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Rows */}
                    <div
                        className="relative"
                        style={{
                            gridTemplateColumns: `80px repeat(${displayDates.length}, minmax(${columnWidth}px, 1fr))`,
                        }}
                    >
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className={cx('grid border-b', palette.timeline.border)}
                                style={{
                                    gridTemplateColumns: `80px repeat(${displayDates.length}, minmax(${columnWidth}px, 1fr))`,
                                    height: '64px',
                                }}
                            >
                                <div
                                    className={cx(
                                        'sticky left-0 z-10 px-3 py-2 text-xs flex items-start border-r',
                                        palette.timeline.hourBg,
                                        palette.panel.textMuted,
                                        palette.timeline.border
                                    )}
                                >
                                    {hour.toString().padStart(2, '0')}:00
                                </div>

                                {displayDates.map((date, dateIndex) => {
                                    const hourBookings = getBookingsForHour(date, hour);

                                    return (
                                        <div
                                            key={dateIndex}
                                            className={cx(
                                                'relative border-r',
                                                palette.timeline.border,
                                                date.toDateString() === new Date().toDateString()
                                                    ? palette.timeline.today
                                                    : hour % 2 === 0
                                                        ? palette.timeline.stripeEven
                                                        : palette.timeline.stripeOdd
                                            )}
                                        >
                                            {hourBookings.map((booking) => {
                                                const style = getBookingStyle(booking, hour);
                                                if (!style) return null;

                                                const startTime = new Date(booking.start_time);
                                                const endTime = new Date(booking.end_time);

                                                return (
                                                    <div
                                                        key={booking.id}
                                                        className={`absolute left-1 right-1 ${getBookingStatusColor(booking.status)} rounded text-white text-xs p-1 overflow-hidden ${canEditBooking(booking) ? 'cursor-pointer' : 'cursor-default'} hover:z-10 transition-all hover:shadow-lg`}
                                                        style={{ ...style, minHeight: '16px' }}
                                                        onClick={() => onBookingClick(booking)}
                                                        title={`${booking.title} - ${booking.user_username}\n${startTime.toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })} - ${endTime.toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}`}
                                                    >
                                                        <div className="truncate font-medium">{booking.title}</div>
                                                        {parseFloat(style.height ?? '0') >= 45 && (
                                                            <div className="truncate opacity-90 text-xs">{booking.user_username}</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingTimeline;
