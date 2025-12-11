import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import type { Booking, BookingStatus } from '../types/booking';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';

interface BookingListProps {
  userRole?: 'admin' | 'member';
  showFilters?: boolean;
  roomId?: string;
}

const BookingList: React.FC<BookingListProps> = ({
  userRole = 'member',
  showFilters = true,
  roomId
}) => {
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    roomId: roomId || ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings(
        filters.roomId || undefined,
        filters.status || undefined
      );
      setBookings(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat daftar booking');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      pending: { className: palette.badges.warning, label: 'Menunggu' },
      approved: { className: palette.badges.success, label: 'Disetujui' },
      rejected: { className: palette.badges.danger, label: 'Ditolak' },
      cancelled: { className: palette.badges.info, label: 'Dibatalkan' } // using info/muted for cancelled
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      fetchBookings(); // Refresh the list
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Gagal membatalkan booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-accent-blue text-white rounded hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-soft-gray">
        <div className="text-xl mb-2">Belum ada booking</div>
        <p className="text-sm">Booking ruangan akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${palette.panel.text} mb-4`}>Filter</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${palette.panel.textMuted} mb-2`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={`w-full px-4 py-2 ${palette.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue`}
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            {userRole === 'admin' && (
              <div>
                <label className={`block text-sm font-medium ${palette.panel.textMuted} mb-2`}>
                  ID Ruangan
                </label>
                <input
                  type="text"
                  value={filters.roomId}
                  onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
                  placeholder="Masukkan ID ruangan"
                  className={`w-full px-4 py-2 ${palette.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6 hover:shadow-md transition-all duration-300`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${palette.panel.text} mb-2`}>{booking.title}</h3>
                <div className={`grid md:grid-cols-2 gap-2 text-sm ${palette.panel.textMuted}`}>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Ruangan: {booking.room_name || booking.room_id}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {userRole === 'admin' ? `User: ${booking.user_username}` : 'Booking Anda'}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(booking.start_time)}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {formatDate(booking.end_time)}
                  </div>
                </div>

                {booking.description && (
                  <p className={`mt-3 text-sm ${palette.panel.textMuted}`}>{booking.description}</p>
                )}
              </div>

              <div className="flex flex-col items-end space-y-3 mt-4 md:mt-0 md:ml-6">
                {getStatusBadge(booking.status)}

                <div className="flex space-x-2">
                  <Link
                    to={`/dashboard/bookings/${booking.id}`}
                    className={`px-3 py-1 text-sm ${palette.buttons.ghost} rounded transition-colors`}
                  >
                    Detail
                  </Link>

                  {(userRole === 'admin' || booking.status === 'pending') && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className={`px-3 py-1 text-sm ${palette.buttons.danger} rounded transition-colors`}
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingList;
