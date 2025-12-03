import React from 'react';
import { Link } from 'react-router-dom';
import RoomList from '../components/RoomList';
import { getStoredUser } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';

const DashboardRoomsPage: React.FC = () => {
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className={`text-xl font-semibold mb-2 ${palette.panel.text}`}>
            {isAdmin ? 'Manajemen Ruangan' : 'Daftar Ruangan'}
          </h2>
          <p className={`text-sm ${palette.panel.textMuted}`}>
            {isAdmin ? 'Kelola ruangan yang tersedia untuk booking' : 'Lihat informasi ruangan yang tersedia'}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-3">
            <Link
              to="/dashboard/rooms/new"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${palette.buttons.info}`}
            >
              + Tambah Ruangan
            </Link>
          </div>
        )}
      </div>

      {/* Room List */}
      <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6`}>
        <RoomList showActions={isAdmin} showBookingAction={false} />
      </div>
    </div>
  );
};

export default DashboardRoomsPage;
