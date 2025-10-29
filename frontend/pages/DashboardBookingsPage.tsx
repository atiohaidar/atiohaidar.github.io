import React from 'react';
import { Link } from 'react-router-dom';
import BookingList from '../components/BookingList';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';

const DashboardBookingsPage: React.FC = () => {
  const userRole = 'admin'; // This should come from auth context in dashboard
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];
  
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className={`text-xl font-semibold mb-2 ${palette.panel.text}`}>
            Manajemen Booking
          </h2>
          <p className={`text-sm ${palette.panel.textMuted}`}>
            Kelola dan pantau status booking ruangan
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to="/dashboard/bookings/new"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${palette.buttons.info}`}
          >
            + Booking Baru
          </Link>
        </div>
      </div>

      {/* Booking List */}
      <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6`}>
        <BookingList userRole={userRole} />
      </div>
    </div>
  );
};

export default DashboardBookingsPage;
