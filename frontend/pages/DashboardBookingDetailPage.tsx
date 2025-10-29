import React from 'react';
import BookingDetail from '../components/BookingDetail';

const DashboardBookingDetailPage: React.FC = () => {
  const userRole = 'admin'; // This should come from auth context in dashboard
  
  return (
    <div>
      <BookingDetail userRole={userRole} />
    </div>
  );
};

export default DashboardBookingDetailPage;
