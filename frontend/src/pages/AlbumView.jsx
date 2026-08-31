import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, Share2, Heart, Trash2, UploadCloud } from 'lucide-react';
import api from '../services/api';
import PhotoViewer from '../components/PhotoViewer';
import ShareModal from '../components/ShareModal';

export default function AlbumView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const fetchAlbum = useCallback(async () => {
    try {
      const res = await api.get(`/albums/${id}`);
      setAlbum(res.data.album);
      setPhotos(res.data.album.photos);
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchAlbum(); }, [fetchAlbum]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append('photos', file));
    try {
      await api.post(`/photos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAlbum();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [id, fetchAlbum]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true
  });

  async function toggleFavorite(photo) {
    try {
      const res = await api.patch(`/photos/${photo.id}/favorite`);
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? res.data.photo : p)));
    } catch (err) {
      alert('Failed to update favorite');
    }
  }

  async function deletePhoto(photo) {
    if (!confirm('Delete this photo?')) return;
    try {
      await api.delete(`/photos/${photo.id}`);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setViewerIndex(null);
    } catch (err) {
      alert('Failed to delete photo');
    }
  }

  const displayedPhotos = favoritesOnly ? photos.filter((p) => p.isFavorite) : photos;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!album) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-700 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{album.title}</h1>
              {album.description && <p className="text-xs text-gray-500 truncate">{album.description}</p>}
            </div>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1 text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 shrink-0"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 cursor-pointer transition ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {uploading ? 'Uploading...' : isDragActive ? 'Drop photos here' : 'Drag & drop photos here, or click to select'}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border ${
              favoritesOnly ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-300 text-gray-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-red-500' : ''}`} /> Favorites only
          </button>
        </div>

        {displayedPhotos.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">No photos {favoritesOnly ? 'favorited' : 'yet'}.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {displayedPhotos.map((photo, i) => (
              <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={photo.url}
                  alt=""
                  onClick={() => setViewerIndex(i)}
                  className="w-full h-full object-cover cursor-pointer group-hover:opacity-90 transition"
                />
                <button
                  onClick={() => toggleFavorite(photo)}
                  className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <Heart className={`w-4 h-4 text-white ${photo.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button
                  onClick={() => deletePhoto(photo)}
                  className="absolute top-2 left-2 bg-black/40 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={displayedPhotos}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNext={() => setViewerIndex((i) => Math.min(i + 1, displayedPhotos.length - 1))}
          onPrev={() => setViewerIndex((i) => Math.max(i - 1, 0))}
          onToggleFavorite={toggleFavorite}
          onDelete={deletePhoto}
        />
      )}

      {showShare && (
        <ShareModal album={album} onClose={() => setShowShare(false)} onUpdated={(updated) => { setAlbum(updated); }} />
      )}
    </div>
  );
}