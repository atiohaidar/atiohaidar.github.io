import React from 'react';
import { Link } from 'react-router-dom';
import RoomList from '../components/RoomList';
import { getStoredUser } from '../apiClient';

const DashboardRoomsPage: React.FC = () => {
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {isAdmin ? 'Manajemen Ruangan' : 'Daftar Ruangan'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-soft-gray">
            {isAdmin ? 'Kelola ruangan yang tersedia untuk booking' : 'Lihat informasi ruangan yang tersedia'}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-3">
            <Link
              to="/dashboard/rooms/new"
              className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              + Tambah Ruangan
            </Link>
          </div>
        )}
      </div>

      {/* Room List */}
      <div className="bg-white dark:bg-light-navy rounded-lg border border-gray-200 dark:border-soft-gray/20 p-6">
        <RoomList showActions={isAdmin} showBookingAction={false} />
      </div>
    </div>
  );
};

export default DashboardRoomsPage;
