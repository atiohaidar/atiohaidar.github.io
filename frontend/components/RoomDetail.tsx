import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { bookingService } from '../services/bookingService';
import { getStoredUser } from '../apiClient';
import type { Room } from '../types/room';
import type { Booking } from '../types/booking';

interface RoomDetailProps {
  showActions?: boolean;
}

const RoomDetail: React.FC<RoomDetailProps> = ({ showActions = true }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('RoomDetail - roomId:', roomId);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    room_id: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'week' ? 7 : 1;
    setSelectedDate((prev) => new Date(prev.getTime() + (direction === 'next' ? days : -days) * 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getWeekDates = (startDate: Date) => {
    const dates: Date[] = [];
    const startOfWeek = new Date(startDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatWeekRange = (date: Date) => {
    const weekDates = getWeekDates(date);
    const start = weekDates[0];
    const end = weekDates[6];

    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    const startLabel = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(start);

    const endOptions: Intl.DateTimeFormatOptions = { day: 'numeric' };
    if (!sameMonth) {
      endOptions.month = 'long';
    }
    if (!sameYear) {
      endOptions.year = 'numeric';
    }

    const endLabel = new Intl.DateTimeFormat('id-ID', endOptions).format(end);

    return `${startLabel} - ${endLabel}`;
  };

  const getDisplayDates = () => {
    return viewMode === 'week' ? getWeekDates(selectedDate) : [selectedDate];
  };

  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId);
    }
    // Get user role
    const user = getStoredUser();
    setUserRole(user?.role || null);
    setUsername(user?.username || null);
  }, [roomId]);

  useEffect(() => {
    if (room) {
      fetchBookings();
    }
  }, [room, selectedDate, viewMode]);

  useEffect(() => {
    if (editingBooking) {
      setEditForm({
        room_id: editingBooking.room_id,
        title: editingBooking.title,
        description: editingBooking.description || '',
        start_time: toLocalInputValue(editingBooking.start_time),
        end_time: toLocalInputValue(editingBooking.end_time),
      });
      setEditError(null);
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [editingBooking]);

  const fetchRoom = async (id: string) => {
    try {
      setLoading(true);
      const data = await roomService.getRoom(id);
      setRoom(data);
      setError(null);
    } catch (err) {
      setError('Ruangan tidak ditemukan');
      console.error('Error fetching room:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!room) return;
    
    try {
      setBookingLoading(true);
      // Get bookings for this room
      const allBookings = await bookingService.getBookings(room.id);
      const roomBookings = allBookings.filter(booking => booking.room_id === room.id);
      setBookings(roomBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const getBookingsForDate = (bookings: Booking[] | undefined, date: Date) => {
    if (!bookings) return [];
    if (viewMode === 'week') {
      // For week view, get all bookings for the current week
      return bookings.filter(booking => {
        const bookingDate = new Date(booking.start_time);
        const weekDates = getDisplayDates();
        return weekDates.some(weekDate => 
          bookingDate.toDateString() === weekDate.toDateString()
        );
      }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    } else {
      // For day view, get bookings for the selected date
      return bookings.filter(booking => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate.toDateString() === date.toDateString();
      }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
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

  const canEditBooking = (booking: Booking) => {
    if (userRole === 'admin') return true;
    if (username && booking.user_username === username) return true;
    return false;
  };

  const toLocalInputValue = (isoString: string) => {
    const date = new Date(isoString);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fromLocalInputValue = (value: string) => {
    return new Date(value).toISOString();
  };

  const closeModal = () => {
    setEditingBooking(null);
    setEditLoading(false);
    setEditError(null);
  };

  const handleBookingClick = (booking: Booking) => {
    if (canEditBooking(booking)) {
      setEditingBooking(booking);
    } else {
      navigate(`/dashboard/bookings/${booking.id}`);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    if (!editForm.title || !editForm.start_time || !editForm.end_time) {
      setEditError('Semua field wajib diisi');
      return;
    }

    const startTime = new Date(editForm.start_time);
    const endTime = new Date(editForm.end_time);

    if (startTime >= endTime) {
      setEditError('Waktu selesai harus setelah waktu mulai');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      await bookingService.updateBooking(editingBooking.id, {
        room_id: editForm.room_id,
        title: editForm.title,
        description: editForm.description,
        start_time: fromLocalInputValue(editForm.start_time),
        end_time: fromLocalInputValue(editForm.end_time),
      });

      await fetchBookings();
      closeModal();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Gagal memperbarui booking');
      setEditLoading(false);
    }
  };

  const getRoomStatusBadge = (room: Room) => {
    if (!room.available) {
      return (
        <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
          Tidak Tersedia
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
        Tersedia
      </span>
    );
  };

  // BookingTimeline Component - Google Calendar Style
  const BookingTimeline: React.FC<{
    bookings: Booking[];
    selectedDate: Date;
  }> = ({ bookings, selectedDate }) => {
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

    return (
      <div className="border border-gray-200 dark:border-soft-gray/20 rounded-lg overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <div
            className="min-w-[480px]"
            style={{
              minWidth: `${minTableWidth}px`,
            }}
          >
            {/* Header Row */}
            <div
              className="grid border-b border-gray-200 dark:border-soft-gray/20"
              style={{
                gridTemplateColumns: `80px repeat(${displayDates.length}, minmax(${columnWidth}px, 1fr))`,
              }}
            >
              <div className="sticky left-0 z-20 p-3 text-xs font-medium text-soft-gray bg-gray-50 dark:bg-light-slate border-r border-gray-200 dark:border-soft-gray/20">
                Jam
              </div>
              {displayDates.map((date, index) => (
                <div key={index} className="p-3 text-center border-r border-gray-200 dark:border-soft-gray/20">
                  <div className="text-xs font-medium text-white">
                    {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-base font-semibold ${
                      date.toDateString() === new Date().toDateString()
                        ? 'text-accent-blue'
                        : 'text-soft-gray'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="text-xs text-soft-gray">
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
                  className="grid border-b border-gray-100 dark:border-soft-gray/10"
                  style={{
                    gridTemplateColumns: `80px repeat(${displayDates.length}, minmax(${columnWidth}px, 1fr))`,
                    height: '64px',
                  }}
                >
                <div className="sticky left-0 z-10 px-3 py-2 text-xs text-soft-gray bg-gray-50 dark:bg-light-slate border-r border-gray-200 dark:border-soft-gray/20 flex items-start">
                  {hour.toString().padStart(2, '0')}:00
                </div>

                {displayDates.map((date, dateIndex) => {
                  const hourBookings = getBookingsForHour(date, hour);

                  return (
                    <div
                      key={dateIndex}
                      className={`relative border-r border-gray-200 dark:border-soft-gray/20 ${
                        date.toDateString() === new Date().toDateString()
                          ? 'bg-blue-50/5 dark:bg-accent-blue/5'
                          : hour % 2 === 0
                            ? 'bg-gray-50/30 dark:bg-light-slate/10'
                            : 'bg-white dark:bg-light-navy'
                      }`}
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
                            onClick={() => handleBookingClick(booking)}
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error || 'Ruangan tidak ditemukan'}</div>
        <Link
          to="/dashboard/rooms"
          className="inline-block px-4 py-2 bg-accent-blue text-white rounded hover:bg-blue-600 transition-colors"
        >
          Kembali ke Daftar Ruangan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard/rooms"
          className="text-accent-blue hover:text-blue-400 transition-colors text-sm mb-4 inline-block"
        >
          ← Kembali ke Daftar Ruangan
        </Link>
        
        <div className="bg-light-navy border border-soft-gray/20 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-white">{room.name}</h1>
            {getRoomStatusBadge(room)}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Informasi Ruangan */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Informasi Ruangan</h2>
              
              <div className="space-y-3">
                <div className="flex items-center text-soft-gray">
                  <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">Kapasitas</div>
                    <div className="text-sm">{room.capacity} orang</div>
                  </div>
                </div>
                
                {room.description && (
                  <div className="flex items-start text-soft-gray">
                    <svg className="w-5 h-5 mr-3 text-accent-blue mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-medium text-white">Deskripsi</div>
                      <div className="text-sm whitespace-pre-wrap">{room.description}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status & Informasi Tambahan */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Status & Informasi</h2>
              
              <div className="space-y-3 text-sm text-soft-gray">
                <div>
                  <span className="font-medium text-white">Status Ketersediaan:</span>
                  <span className="ml-2">{room.available ? 'Tersedia' : 'Tidak Tersedia'}</span>
                </div>
                
                <div>
                  <span className="font-medium text-white">ID Ruangan:</span>
                  <span className="ml-2 font-mono">{room.id}</span>
                </div>
                
                <div>
                  <span className="font-medium text-white">Dibuat:</span>
                  <span className="ml-2">
                    {new Date(room.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                
                {room.updated_at !== room.created_at && (
                  <div>
                    <span className="font-medium text-white">Diperbarui:</span>
                    <span className="ml-2">
                      {new Date(room.updated_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Booking Timeline */}
          <div className="mt-8 pt-6 border-t border-soft-gray/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Jadwal Penggunaan Ruangan</h2>
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      viewMode === 'day' 
                        ? 'bg-accent-blue text-white' 
                        : 'bg-gray-100 dark:bg-light-slate text-gray-700 dark:text-soft-gray hover:bg-gray-200 dark:hover:bg-light-slate/50'
                    }`}
                  >
                    Hari
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      viewMode === 'week' 
                        ? 'bg-accent-blue text-white' 
                        : 'bg-gray-100 dark:bg-light-slate text-gray-700 dark:text-soft-gray hover:bg-gray-200 dark:hover:bg-light-slate/50'
                    }`}
                  >
                    Minggu
                  </button>
                </div>
                
                {/* Date Navigation */}
                <button
                  onClick={() => navigateDate('prev')}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-light-slate text-gray-700 dark:text-soft-gray rounded hover:bg-gray-200 dark:hover:bg-light-slate/50 transition-colors"
                >
                  ←
                </button>
                <div className="text-center">
                  <div className="text-sm font-medium text-white">
                    {viewMode === 'week'
                      ? formatWeekRange(selectedDate)
                      : new Intl.DateTimeFormat('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }).format(selectedDate)}
                  </div>
                  {(viewMode === 'day' && selectedDate.toDateString() === new Date().toDateString()) && (
                    <div className="text-xs text-accent-blue">Hari Ini</div>
                  )}
                </div>
                <button
                  onClick={() => navigateDate('next')}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-light-slate text-gray-700 dark:text-soft-gray rounded hover:bg-gray-200 dark:hover:bg-light-slate/50 transition-colors"
                >
                  →
                </button>
                {selectedDate.toDateString() !== new Date().toDateString() && (
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-xs bg-accent-blue text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Hari Ini
                  </button>
                )}
              </div>
            </div>

            {bookingLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
              </div>
            ) : (
              <BookingTimeline 
                bookings={getBookingsForDate(bookings, selectedDate)} 
                selectedDate={selectedDate}
              />
            )}
          </div>
          
          {/* Edit Booking Modal */}
          {isModalOpen && editingBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-2xl bg-light-navy border border-soft-gray/20 rounded-2xl shadow-2xl">
                <button
                  onClick={closeModal}
                  className="absolute right-4 top-4 text-soft-gray hover:text-white transition-colors"
                  aria-label="Tutup"
                >
                  ×
                </button>
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-1">Edit Booking</h3>
                    <p className="text-sm text-soft-gray">Perbarui informasi booking sesuai kebutuhan</p>
                  </div>

                  {editError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                      {editError}
                    </div>
                  )}

                  <form onSubmit={handleEditSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Ruangan</label>
                      <input
                        type="text"
                        value={room?.name || editingBooking.room_id}
                        disabled
                        className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-soft-gray cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Judul Booking *</label>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditInputChange}
                        required
                        maxLength={100}
                        className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Deskripsi</label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditInputChange}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Waktu Mulai *</label>
                        <input
                          type="datetime-local"
                          name="start_time"
                          value={editForm.start_time}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Waktu Selesai *</label>
                        <input
                          type="datetime-local"
                          name="end_time"
                          value={editForm.end_time}
                          min={editForm.start_time}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="w-full md:w-auto px-5 py-3 border border-soft-gray/30 text-soft-gray rounded-lg hover:border-soft-gray/60 hover:text-white transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="w-full md:w-auto px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="mt-8 pt-6 border-t border-soft-gray/20">
              <div className="flex flex-wrap gap-4">
                {room.available && (
                  <Link
                    to={`/dashboard/bookings/new?roomId=${room.id}`}
                    className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Booking Ruangan
                  </Link>
                )}
                
                {userRole === 'admin' && (
                  <Link
                    to={`/dashboard/rooms/${room.id}/edit`}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    ✏️ Edit Ruangan
                  </Link>
                )}
                
                <Link
                  to={`/dashboard/rooms`}
                  className="px-6 py-3 border border-soft-gray text-soft-gray rounded-lg hover:border-accent-blue hover:text-accent-blue transition-colors"
                >
                  Lihat Ruangan Lain
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
