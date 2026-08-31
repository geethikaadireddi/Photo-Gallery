import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

export default function SharedAlbum() {
  const { accessCode } = useParams();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewerPhoto, setViewerPhoto] = useState(null);

  useEffect(() => {
    api.get(`/share/${accessCode}`)
      .then((res) => setAlbum(res.data.album))
      .catch((err) => setError(err.response?.data?.message || 'Album not found'))
      .finally(() => setLoading(false));
  }, [accessCode]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-700 font-medium mb-2">{error}</p>
        <p className="text-sm text-gray-400 mb-4">This link may be invalid or sharing was disabled by the owner.</p>
        <Link to="/login" className="text-indigo-600 text-sm hover:underline">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-gray-400 mb-1">Shared album</p>
          <h1 className="text-xl font-semibold text-gray-900">{album.title}</h1>
          {album.description && <p className="text-sm text-gray-500 mt-1">{album.description}</p>}
          <p className="text-xs text-gray-400 mt-1">Shared by {album.ownerName}</p>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {album.photos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No photos in this album yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {album.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setViewerPhoto(photo)}>
                <img src={photo.url} alt="" className="w-full h-full object-cover hover:opacity-90 transition" />
              </div>
            ))}
          </div>
        )}
      </div>

      {viewerPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-30"
          onClick={() => setViewerPhoto(null)}
        >
          <img src={viewerPhoto.url} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}