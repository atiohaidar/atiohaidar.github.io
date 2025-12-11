import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';
import { itemBorrowingService, itemService } from '../lib/api/services';
import type { ItemBorrowing, Item, ItemBorrowingStatus } from '../apiTypes';

const DashboardItemBorrowingsPage: React.FC = () => {
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];
  const [borrowings, setBorrowings] = useState<ItemBorrowing[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<ItemBorrowing | null>(null);
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 1,
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [statusFormData, setStatusFormData] = useState({
    status: 'approved' as ItemBorrowingStatus,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [borrowingsData, itemsData] = await Promise.all([
        itemBorrowingService.list(),
        itemService.list(),
      ]);
      setBorrowings(borrowingsData);
      setItems(itemsData);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await itemBorrowingService.create(formData);
      setShowAddModal(false);
      setFormData({ item_id: '', quantity: 1, start_date: '', end_date: '', notes: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat peminjaman');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowing) return;

    try {
      await itemBorrowingService.updateStatus(selectedBorrowing.id, statusFormData);
      setShowStatusModal(false);
      setSelectedBorrowing(null);
      setStatusFormData({ status: 'approved', notes: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status');
    }
  };

  const handleCancel = async (borrowingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan peminjaman ini?')) return;

    try {
      await itemBorrowingService.cancel(borrowingId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan peminjaman');
    }
  };

  const openStatusModal = (borrowing: ItemBorrowing) => {
    setSelectedBorrowing(borrowing);
    setStatusFormData({
      status: borrowing.status,
      notes: borrowing.notes || '',
    });
    setShowStatusModal(true);
  };

  const getStatusBadge = (status: ItemBorrowingStatus) => {
    const badges: Record<ItemBorrowingStatus, string> = {
      pending: 'bg-yellow-500 text-white',
      approved: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
      returned: 'bg-blue-500 text-white',
      damaged: 'bg-orange-500 text-white',
      extended: 'bg-purple-500 text-white',
    };
    return badges[status] || 'bg-gray-500 text-white';
  };

  const getStatusLabel = (status: ItemBorrowingStatus) => {
    const labels: Record<ItemBorrowingStatus, string> = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      returned: 'Dikembalikan',
      damaged: 'Rusak',
      extended: 'Diperpanjang',
    };
    return labels[status] || status;
  };

  const getItemName = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    return item?.name || itemId;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className={`text-xl font-semibold mb-2 ${palette.panel.text}`}>
            Peminjaman Barang
          </h2>
          <p className={`text-sm ${palette.panel.textMuted}`}>
            Kelola peminjaman barang
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${palette.buttons.info}`}
          >
            + Pinjam Barang
          </button>
          <Link
            to="/dashboard/items"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${palette.buttons.primary}`}
          >
            Lihat Barang
          </Link>
        </div>
      </div>

      {/* Borrowings List */}
      <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6`}>
        {loading ? (
          <div className="text-center py-8">
            <p className={palette.panel.textMuted}>Memuat...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : borrowings.length === 0 ? (
          <div className="text-center py-8">
            <p className={palette.panel.textMuted}>Belum ada peminjaman</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${palette.panel.border}`}>
                  <th className={`text-left py-3 px-4 ${palette.panel.text}`}>Barang</th>
                  <th className={`text-left py-3 px-4 ${palette.panel.text}`}>Peminjam</th>
                  <th className={`text-left py-3 px-4 ${palette.panel.text}`}>Jumlah</th>
                  <th className={`text-left py-3 px-4 ${palette.panel.text}`}>Tanggal</th>
                  <th className={`text-left py-3 px-4 ${palette.panel.text}`}>Status</th>
                  <th className={`text-left py-3 px-4 ${palette.panel.text}`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((borrowing) => (
                  <tr key={borrowing.id} className={`border-b ${palette.panel.border}`}>
                    <td className={`py-3 px-4 ${palette.panel.text}`}>
                      {getItemName(borrowing.item_id)}
                    </td>
                    <td className={`py-3 px-4 ${palette.panel.textMuted}`}>
                      {borrowing.borrower_username}
                    </td>
                    <td className={`py-3 px-4 ${palette.panel.text}`}>
                      {borrowing.quantity}
                    </td>
                    <td className={`py-3 px-4 ${palette.panel.textMuted}`}>
                      <div className="text-sm">
                        {borrowing.start_date} - {borrowing.end_date}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(borrowing.status)}`}>
                        {getStatusLabel(borrowing.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openStatusModal(borrowing)}
                          className={`px-3 py-1 text-xs rounded ${palette.buttons.info}`}
                        >
                          Update
                        </button>
                        {borrowing.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(borrowing.id)}
                            className="px-3 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Borrowing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${palette.panel.bg} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${palette.panel.text}`}>
              Pinjam Barang
            </h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Barang *
                </label>
                <select
                  value={formData.item_id}
                  onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input}`}
                  required
                >
                  <option value="">Pilih Barang</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stok: {item.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Jumlah *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Tanggal Selesai *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input}`}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ item_id: '', quantity: 1, start_date: '', end_date: '', notes: '' });
                  }}
                  className={`px-4 py-2 text-sm rounded-lg ${palette.buttons.secondary}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm rounded-lg ${palette.buttons.primary}`}
                >
                  Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBorrowing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${palette.panel.bg} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${palette.panel.text}`}>
              Update Status Peminjaman
            </h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Status *
                </label>
                <select
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value as ItemBorrowingStatus })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input}`}
                  required
                >
                  <option value="pending">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                  <option value="returned">Dikembalikan</option>
                  <option value="damaged">Rusak</option>
                  <option value="extended">Diperpanjang</option>
                </select>
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Catatan
                </label>
                <textarea
                  value={statusFormData.notes}
                  onChange={(e) => setStatusFormData({ ...statusFormData, notes: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input}`}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedBorrowing(null);
                    setStatusFormData({ status: 'approved', notes: '' });
                  }}
                  className={`px-4 py-2 text-sm rounded-lg ${palette.buttons.secondary}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm rounded-lg ${palette.buttons.primary}`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardItemBorrowingsPage;
