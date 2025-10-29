import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import type { Booking, BookingStatus } from '../types/booking';

interface BookingDetailProps {
  userRole?: 'admin' | 'member';
}

const BookingDetail: React.FC<BookingDetailProps> = ({ userRole = 'member' }) => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  const fetchBooking = async (id: string) => {
    try {
      setLoading(true);
      const data = await bookingService.getBooking(id);
      setBooking(data);
      setError(null);
    } catch (err) {
      setError('Booking tidak ditemukan');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    if (!booking) return;

    try {
      setActionLoading(newStatus);
      await bookingService.updateBookingStatus(booking.id, { status: newStatus });
      // Refresh booking data
      await fetchBooking(booking.id);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Gagal memperbarui status booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
      return;
    }

    try {
      setActionLoading('cancelled');
      await bookingService.cancelBooking(booking.id);
      // Refresh booking data
      await fetchBooking(booking.id);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Gagal membatalkan booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Persetujuan' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dibatalkan' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 text-sm font-medium ${config.bg} ${config.text} rounded-full`}>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error || 'Booking tidak ditemukan'}</div>
        <Link
          to="/dashboard/bookings"
          className="inline-block px-4 py-2 bg-accent-blue text-white rounded hover:bg-blue-600 transition-colors"
        >
          Kembali ke Daftar Booking
        </Link>
      </div>
    );
  }

  const canCancel = userRole === 'admin' || booking.status === 'pending';
  const canUpdateStatus = userRole === 'admin' && booking.status === 'pending';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard/bookings"
          className="text-accent-blue hover:text-blue-400 transition-colors text-sm mb-4 inline-block"
        >
          ← Kembali ke Daftar Booking
        </Link>
        
        <div className="bg-light-navy border border-soft-gray/20 rounded-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{booking.title}</h1>
              <p className="text-soft-gray">ID Booking: {booking.id}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Informasi Booking */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Informasi Booking</h2>
              
              <div className="space-y-3">
                <div className="flex items-center text-soft-gray">
                  <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Ruangan</div>
                    <div className="text-sm">{booking.room_name || booking.room_id}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-soft-gray">
                  <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Pemesan</div>
                    <div className="text-sm">{booking.user_username}</div>
                  </div>
                </div>
                
                <div className="flex items-start text-soft-gray">
                  <svg className="w-5 h-5 mr-3 text-accent-blue mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Deskripsi</div>
                    <div className="text-sm">
                      {booking.description || 'Tidak ada deskripsi'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Waktu & Status */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Waktu & Status</h2>
              
              <div className="space-y-3 text-sm text-soft-gray">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Mulai</div>
                    <div>{formatDate(booking.start_time)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Selesai</div>
                    <div>{formatDate(booking.end_time)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Durasi</div>
                    <div>
                      {Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60))} jam
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-white">Dibuat:</span>
                  <span className="ml-2">
                    {formatDate(booking.created_at)}
                  </span>
                </div>
                
                {booking.updated_at !== booking.created_at && (
                  <div>
                    <span className="font-medium text-white">Diperbarui:</span>
                    <span className="ml-2">
                      {formatDate(booking.updated_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-soft-gray/20">
            <div className="flex flex-wrap gap-3">
              {/* Admin actions */}
              {canUpdateStatus && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={actionLoading === 'approved'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === 'approved' ? 'Memproses...' : 'Setujui'}
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={actionLoading === 'rejected'}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === 'rejected' ? 'Memproses...' : 'Tolak'}
                  </button>
                </>
              )}
              
              {/* Cancel action for admin or user with pending status */}
              {canCancel && !canUpdateStatus && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancelled'}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'cancelled' ? 'Membatalkan...' : 'Batalkan Booking'}
                </button>
              )}
              
              <Link
                to="/dashboard/bookings"
                className="px-4 py-2 border border-soft-gray text-soft-gray rounded-lg hover:border-accent-blue hover:text-accent-blue transition-colors"
              >
                Kembali ke Daftar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
