import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roomService } from '../services/roomService';
import type { Room, RoomCreate, RoomUpdate } from '../types/room';

interface RoomFormProps {
  isEdit?: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({ isEdit = false }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RoomCreate>({
    name: '',
    capacity: 1,
    description: '',
    available: true
  });

  useEffect(() => {
    if (isEdit && roomId) {
      fetchRoom();
    }
  }, [isEdit, roomId]);

  const fetchRoom = async () => {
    try {
      setInitialLoading(true);
      const room = await roomService.getRoom(roomId!);
      setFormData({
        name: room.name,
        capacity: room.capacity,
        description: room.description || '',
        available: room.available
      });
      setError(null);
    } catch (err) {
      setError('Gagal memuat data ruangan');
      console.error('Error fetching room:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && roomId) {
        // Update existing room
        const updateData: RoomUpdate = {
          ...formData,
          capacity: formData.capacity
        };
        await roomService.updateRoom(roomId, updateData);
      } else {
        // Create new room
        await roomService.createRoom(formData);
      }
      
      navigate('/dashboard/rooms');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan ruangan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEdit ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
        </h1>
        <p className="text-soft-gray">
          {isEdit ? 'Perbarui informasi ruangan yang sudah ada' : 'Masukkan informasi untuk ruangan baru'}
        </p>
      </div>

      <div className="bg-light-navy border border-soft-gray/20 rounded-lg p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Ruangan */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nama Ruangan *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-white placeholder-soft-gray/50 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              placeholder="Contoh: Meeting Room A"
            />
          </div>

          {/* Kapasitas */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Kapasitas *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-white placeholder-soft-gray/50 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              placeholder="Jumlah maksimal orang"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-deep-navy border border-soft-gray/20 rounded-lg text-white placeholder-soft-gray/50 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-vertical"
              placeholder="Deskripsi fasilitas atau informasi tambahan tentang ruangan"
            />
          </div>

          {/* Ketersediaan */}
          <div className="flex items-center justify-between p-4 bg-deep-navy border border-soft-gray/20 rounded-lg">
            <div>
              <label className="text-sm font-medium text-white">
                Status Ketersediaan
              </label>
              <p className="text-xs text-soft-gray mt-1">
                Ruangan yang tidak tersedia tidak dapat di-booking
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-blue/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
              <span className="ml-3 text-sm text-soft-gray">
                {formData.available ? 'Tersedia' : 'Tidak Tersedia'}
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui Ruangan' : 'Simpan Ruangan')}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/rooms')}
              className="flex-1 px-6 py-3 border border-soft-gray text-soft-gray rounded-lg hover:border-accent-blue hover:text-accent-blue transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
