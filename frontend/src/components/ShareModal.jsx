import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import api from '../services/api';

export default function ShareModal({ album, onClose, onUpdated }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareLink = album.accessCode
    ? `${window.location.origin}/shared/${album.accessCode}`
    : null;

  async function generateCode() {
    setLoading(true);
    try {
      const res = await api.post(`/albums/${album.id}/share`);
      onUpdated({ ...album, accessCode: res.data.accessCode, hasAccessCode: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  }

  async function revokeCode() {
    if (!confirm('Disable sharing for this album? The current link will stop working.')) return;
    setLoading(true);
    try {
      await api.delete(`/albums/${album.id}/share`);
      onUpdated({ ...album, accessCode: null, hasAccessCode: false });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke code');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-30">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Share "{album.title}"</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {shareLink ? (
          <>
            <p className="text-sm text-gray-500 mb-2">Anyone with this link can view this album only:</p>
            <div className="flex gap-2 mb-4">
              <input readOnly value={shareLink} className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              <button onClick={copyLink} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button onClick={revokeCode} disabled={loading} className="text-sm text-red-500 hover:underline">
              Disable sharing
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">This album is currently private. Generate a link to share it.</p>
            <button
              onClick={generateCode}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}