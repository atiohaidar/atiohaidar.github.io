import React from 'react';
import { useParams } from 'react-router-dom';
import RoomDetail from '../components/RoomDetail';

const DashboardRoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  // Debug logging
  console.log('DashboardRoomDetailPage - roomId:', roomId);

  return (
    <div>
      <RoomDetail showActions={true} />
    </div>
  );
};

export default DashboardRoomDetailPage;
