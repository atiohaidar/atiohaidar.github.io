import React from 'react';
import { Link } from 'react-router-dom';
import BookingList from '../components/BookingList';

const DashboardBookingsPage: React.FC = () => {
  const userRole = 'admin'; // This should come from auth context in dashboard
  
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Manajemen Booking
          </h2>
          <p className="text-sm text-gray-600 dark:text-soft-gray">
            Kelola dan pantau status booking ruangan
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to="/dashboard/bookings/new"
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            + Booking Baru
          </Link>
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white dark:bg-light-navy rounded-lg border border-gray-200 dark:border-soft-gray/20 p-6">
        <BookingList userRole={userRole} />
      </div>
    </div>
  );
};

export default DashboardBookingsPage;
