import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';
import { itemService } from '../lib/api/services';
import type { Item } from '../apiTypes';

const DashboardItemsPage: React.FC = () => {
  const { theme } = useTheme();
  const palette = DASHBOARD_THEME[theme];
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stock: 1,
    attachment_link: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemService.list();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar barang');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await itemService.create(formData);
      setShowAddModal(false);
      setFormData({ name: '', description: '', stock: 1, attachment_link: '' });
      loadItems();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan barang');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      await itemService.update(editingItem.id, formData);
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', stock: 1, attachment_link: '' });
      loadItems();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui barang');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) return;
    
    try {
      await itemService.delete(itemId);
      loadItems();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus barang');
    }
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      stock: item.stock,
      attachment_link: item.attachment_link || '',
    });
    setShowEditModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className={`text-xl font-semibold mb-2 ${palette.panel.text}`}>
            Manajemen Barang
          </h2>
          <p className={`text-sm ${palette.panel.textMuted}`}>
            Kelola barang yang dapat dipinjam
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${palette.buttons.info}`}
          >
            + Tambah Barang
          </button>
          <Link
            to="/dashboard/item-borrowings"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${palette.buttons.primary}`}
          >
            Lihat Peminjaman
          </Link>
        </div>
      </div>

      {/* Items List */}
      <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6`}>
        {loading ? (
          <div className="text-center py-8">
            <p className={palette.panel.textMuted}>Memuat...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <p className={palette.panel.textMuted}>Belum ada barang</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-4`}
              >
                <h3 className={`font-semibold mb-2 ${palette.panel.text}`}>
                  {item.name}
                </h3>
                {item.description && (
                  <p className={`text-sm mb-2 ${palette.panel.textMuted}`}>
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${palette.panel.textMuted}`}>Stok:</span>
                  <span className={`text-sm font-medium ${palette.panel.text}`}>
                    {item.stock}
                  </span>
                </div>
                {item.attachment_link && (
                  <a
                    href={item.attachment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mb-2 block"
                  >
                    Lihat Lampiran
                  </a>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-xs ${palette.panel.textMuted}`}>
                    Pemilik: {item.owner_username}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className={`px-3 py-1 text-xs rounded ${palette.buttons.info}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${palette.panel.bg} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${palette.panel.text}`}>
              Tambah Barang Baru
            </h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Nama Barang *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Stok *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Link Lampiran
                </label>
                <input
                  type="url"
                  value={formData.attachment_link}
                  onChange={(e) => setFormData({ ...formData, attachment_link: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  placeholder="https://example.com/manual.pdf"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', description: '', stock: 1, attachment_link: '' });
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

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${palette.panel.bg} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${palette.panel.text}`}>
              Edit Barang
            </h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Nama Barang *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Stok *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${palette.panel.text}`}>
                  Link Lampiran
                </label>
                <input
                  type="url"
                  value={formData.attachment_link}
                  onChange={(e) => setFormData({ ...formData, attachment_link: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${palette.input.bg} ${palette.input.border} ${palette.input.text}`}
                  placeholder="https://example.com/manual.pdf"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setFormData({ name: '', description: '', stock: 1, attachment_link: '' });
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

export default DashboardItemsPage;
