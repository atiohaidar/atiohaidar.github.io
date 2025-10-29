import React from 'react';
import { useParams } from 'react-router-dom';
import RoomForm from '../components/RoomForm';

const DashboardRoomFormPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const isEdit = !!roomId;

  return (
    <div>
      <RoomForm isEdit={isEdit} />
    </div>
  );
};

export default DashboardRoomFormPage;
