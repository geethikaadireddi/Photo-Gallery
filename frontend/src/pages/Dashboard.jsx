import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, LogOut } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlbumCard from '../components/AlbumCard';

export default function Dashboard() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (sort) params.sort = sort;
      const res = await api.get('/albums', { params });
      setAlbums(res.data.albums);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchAlbums, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchAlbums]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.post('/albums', { title: newTitle, description: newDesc });
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
      fetchAlbums();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create album');
    }
  }

  async function handleRename(album) {
    const title = prompt('New album name:', album.title);
    if (!title || title === album.title) return;
    try {
      await api.put(`/albums/${album.id}`, { title });
      fetchAlbums();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to rename album');
    }
  }

  async function handleDelete(album) {
    if (!confirm(`Delete "${album.title}" and all its photos? This can't be undone.`)) return;
    try {
      await api.delete(`/albums/${album.id}`);
      fetchAlbums();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete album');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">📸 My Gallery</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search albums..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Newest first</option>
              <option value="name">Name (A-Z)</option>
            </select>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> New Album
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading albums...</p>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No albums yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} onRename={handleRename} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-20">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Create Album</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Album title"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}