import { Link } from 'react-router-dom';
import { Image as ImageIcon, Lock, Globe } from 'lucide-react';

export default function AlbumCard({ album, onRename, onDelete }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
      <Link to={`/albums/${album.id}`}>
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {album.coverImage ? (
            <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-10 h-10 text-gray-300" />
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-gray-900 truncate">{album.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}</p>
          </div>
          {album.isPublic
            ? <Globe className="w-4 h-4 text-gray-400 shrink-0" title="Public" />
            : <Lock className="w-4 h-4 text-gray-400 shrink-0" title="Private" />}
        </div>

        <div className="flex gap-3 mt-3 text-xs">
          <button onClick={() => onRename(album)} className="text-indigo-600 hover:underline">Rename</button>
          <button onClick={() => onDelete(album)} className="text-red-500 hover:underline">Delete</button>
        </div>
      </div>
    </div>
  );
}