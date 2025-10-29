import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../services/roomService';
import type { Room } from '../types/room';

interface RoomListProps {
  showActions?: boolean;
  showBookingAction?: boolean;
  defaultAvailableOnly?: boolean;
}

const RoomList: React.FC<RoomListProps> = ({ 
  showActions = false,
  showBookingAction = true,
  defaultAvailableOnly = undefined
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    fetchRooms();
  }, []); // Only fetch once on mount

  const fetchRooms = async () => {
    try {
      setLoading(true);
      // Fetch all rooms once
      const data = await roomService.getRooms();
      setRooms(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat daftar ruangan');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms based on current filter
  const filteredRooms = rooms.filter(room => {
    if (filter === 'available') return room.available;
    if (filter === 'unavailable') return !room.available;
    return true; // Show all
  });

  const allCount = rooms.length;
  const availableCount = rooms.filter(r => r.available).length;
  const unavailableCount = rooms.filter(r => !r.available).length;

  const getRoomStatusBadge = (room: Room) => {
    if (!room.available) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Tidak Tersedia
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Tersedia
      </span>
    );
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
          onClick={fetchRooms}
          className="px-4 py-2 bg-accent-blue text-white rounded hover:bg-blue-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (filteredRooms.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-soft-gray">
        <div className="text-xl mb-2">Belum ada ruangan</div>
        <p className="text-sm">
          {filter === 'available' ? 'Belum ada ruangan tersedia.' : 
           filter === 'unavailable' ? 'Belum ada ruangan tidak tersedia.' :
           'Belum ada ruangan yang terdaftar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter UI */}
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200 dark:border-soft-gray/20">
        <span className="text-sm font-medium text-gray-700 dark:text-soft-gray">Filter:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-accent-blue text-white' 
                : 'bg-gray-100 dark:bg-light-slate text-gray-700 dark:text-soft-gray hover:bg-gray-200 dark:hover:bg-light-slate/50'
            }`}
          >
            Semua ({allCount})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'available' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 dark:bg-light-slate text-gray-700 dark:text-soft-gray hover:bg-gray-200 dark:hover:bg-light-slate/50'
            }`}
          >
            Tersedia ({availableCount})
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'unavailable' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 dark:bg-light-slate text-gray-700 dark:text-soft-gray hover:bg-gray-200 dark:hover:bg-light-slate/50'
            }`}
          >
            Tidak Tersedia ({unavailableCount})
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRooms.map((room) => (
        <div
          key={room.id}
          className="bg-light-navy border border-soft-gray/20 rounded-lg p-6 hover:border-accent-blue/50 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-white">{room.name}</h3>
            {getRoomStatusBadge(room)}
          </div>
          
          <div className="space-y-2 text-sm text-soft-gray mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Kapasitas: {room.capacity} orang
            </div>
            
            {room.description && (
              <p className="text-xs line-clamp-2">{room.description}</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/dashboard/rooms/${room.id}`}
              className="text-accent-blue hover:text-blue-400 transition-colors text-sm"
            >
              Detail
            </Link>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default RoomList;
