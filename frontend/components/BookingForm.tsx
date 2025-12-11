import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { bookingService } from '../services/bookingService';
import type { BookingCreate } from '../types/booking';
import type { Room } from '../types/room';
import { useBackendLoader } from '../contexts/BackendLoaderContext';

import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRoomId = searchParams.get('roomId');
  const { showLoader, updateLoader } = useBackendLoader();
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server info helpers for loader
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
  const parsedUrl = new URL(API_BASE_URL);
  const serverHost = parsedUrl.host;
  const isSecure = parsedUrl.protocol === 'https:';

  const [formData, setFormData] = useState<BookingCreate>({
    room_id: preselectedRoomId || '',
    title: '',
    description: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const data = await roomService.getRooms(true); // Only available rooms
      setRooms(data);

      // If preselected room is not available, clear it
      if (preselectedRoomId && !data.find(r => r.id === preselectedRoomId)) {
        setFormData(prev => ({ ...prev, room_id: '' }));
      }

      setError(null);
    } catch (err) {
      setError('Gagal memuat daftar ruangan');
      console.error('Error fetching rooms:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.room_id || !formData.title || !formData.start_time || !formData.end_time) {
      setError('Semua field wajib diisi');
      return;
    }

    // Validate dates
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);

    if (startTime >= endTime) {
      setError('Waktu selesai harus setelah waktu mulai');
      return;
    }

    if (startTime <= new Date()) {
      setError('Waktu mulai harus di masa depan');
      return;
    }

    setLoading(true);
    setError(null);
    const requestStartTime = performance.now();

    showLoader({
      title: "Submitting Booking",
      subtitle: "Requesting room reservation",
      endpoint: "/api/bookings",
      method: "POST",
      serverHost,
      isSecure,
      completeDelay: 800
    });

    try {
      const booking = await bookingService.createBooking(formData);

      const latency = Math.round(performance.now() - requestStartTime);

      updateLoader({
        status: 'success',
        actualLatency: latency,
        actualStatusCode: 201, // Created
        successMessage: "Booking submitted successfully"
      });

      navigate(`/dashboard/bookings/${booking.id}`, {
        state: { message: 'Booking berhasil dibuat!' }
      });
    } catch (err: any) {
      setLoading(false);
      const latency = Math.round(performance.now() - requestStartTime);
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal membuat booking';

      updateLoader({
        status: 'error',
        actualLatency: latency,
        actualStatusCode: err?.response?.status || 500,
        errorMessage: errMsg
      });
      setError(errMsg);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setMinimumDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getSelectedRoom = () => {
    return rooms.find(r => r.id === formData.room_id);
  };

  if (roomsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  const selectedRoom = getSelectedRoom();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${palette.panel.text} mb-2`}>Booking Ruangan</h1>
        <p className={palette.panel.textMuted}>
          Isi formulir berikut untuk memesan ruangan
        </p>
      </div>

      <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-8 backdrop-blur-sm shadow-sm`}>
        {error && (
          <div className={`mb-6 p-4 ${palette.badges.danger} rounded-lg`}>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <div className={`${palette.panel.textMuted} mb-4`}>Tidak ada ruangan tersedia untuk booking</div>
            <button
              onClick={() => navigate('/dashboard/rooms')}
              className={`px-4 py-2 ${palette.buttons.primary} rounded transition-colors`}
            >
              Lihat Ruangan
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ruangan */}
            <div>
              <label className={`block text-sm font-medium ${palette.panel.text} mb-2`}>
                Pilih Ruangan *
              </label>
              <select
                name="room_id"
                value={formData.room_id}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 ${palette.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue`}
              >
                <option value="">-- Pilih Ruangan --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} (Kapasitas: {room.capacity})
                  </option>
                ))}
              </select>

              {selectedRoom && (
                <div className={`mt-3 p-3 ${palette.surface} rounded-lg ${palette.panel.border} border`}>
                  <div className={`text-sm ${palette.panel.textMuted}`}>
                    <div className={`font-medium ${palette.panel.text} mb-1`}>Informasi Ruangan:</div>
                    <div>Kapasitas: {selectedRoom.capacity} orang</div>
                    {selectedRoom.description && (
                      <div className="mt-1">{selectedRoom.description}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Judul Booking */}
            <div>
              <label className={`block text-sm font-medium ${palette.panel.text} mb-2`}>
                Judul Booking *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={100}
                className={`w-full px-4 py-3 ${palette.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue`}
                placeholder="Contoh: Meeting Tim Development"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className={`block text-sm font-medium ${palette.panel.text} mb-2`}>
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className={`w-full px-4 py-3 ${palette.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical`}
                placeholder="Agenda atau informasi tambahan tentang booking"
              />
            </div>

            {/* Waktu Mulai */}
            <div>
              <label className={`block text-sm font-medium ${palette.panel.text} mb-2`}>
                Waktu Mulai *
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
                min={setMinimumDateTime()}
                className={`w-full px-4 py-3 ${palette.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue`}
              />
            </div>

            {/* Waktu Selesai */}
            <div>
              <label className={`block text-sm font-medium ${palette.panel.text} mb-2`}>
                Waktu Selesai *
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
                min={formData.start_time || setMinimumDateTime()}
                className={`w-full px-4 py-3 ${palette.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue`}
              />
            </div>

            {/* Informasi */}
            <div className={`p-4 ${palette.badges.info} rounded-lg`}>
              <div className="text-sm">
                <div className="font-medium mb-1">ℹ️ Informasi:</div>
                <ul className="space-y-1 text-xs opacity-90">
                  <li>• Booking akan diajukan dalam status "Menunggu Persetujuan"</li>
                  <li>• Admin akan memreview dan menyetujui booking Anda</li>
                  <li>• Anda dapat membatalkan booking sewaktu-waktu</li>
                  <li>• Pastikan waktu booking tidak bentrok dengan booking lain</li>
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 ${palette.buttons.primary} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {loading ? 'Memproses...' : 'Ajukan Booking'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard/rooms')}
                className={`flex-1 px-6 py-3 ${palette.buttons.ghost} rounded-lg transition-colors`}
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
