import React, { useEffect, useState } from 'react';
import { Download, BookOpen, ShieldCheck, FileCheck } from 'lucide-react';
import api from '../../services/api';
import { EbookItem } from '../../types';
import { handleBookImageError } from '../../utils/imageFallbacks';

export const CustomerEbooksPage: React.FC = () => {
  const [ebooks, setEbooks] = useState<EbookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/my-ebooks').then((res) => {
      if (res.data.success) {
        setEbooks(res.data.data.ebooks);
      }
      setLoading(false);
    });
  }, []);

  const handleDownload = async (bookId: string, title: string) => {
    try {
      setDownloadingId(bookId);
      const response = await api.get(`/my-ebooks/${bookId}/download`, {
        responseType: 'blob',
      });

      // Trigger browser download via object URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Failed to initiate eBook download. Access might be restricted.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Accessing digital eBook library...</div>;
  }

  if (ebooks.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-gray-200 p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Download className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-navy text-lg">No eBooks purchased yet</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          When you purchase any digital eBook, it will appear here permanently with private authenticated download access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">My eBook Library ({ebooks.length})</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Verified digital purchases available for offline reading on mobile, tablet, or eReader.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ebooks.map((item) => (
          <div
            key={item.purchaseId}
            className="bg-surface rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start space-x-4">
              <img
                src={item.book.coverImage}
                alt={item.book.title}
                className="w-16 h-24 object-cover rounded-lg shadow-sm bg-gray-100 flex-shrink-0"
                onError={handleBookImageError}
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Format: {item.book.format.toUpperCase()}
                </span>
                <h4 className="font-bold text-navy text-sm sm:text-base line-clamp-2">
                  {item.book.title}
                </h4>
                <p className="text-xs text-gray-500">by {item.book.author}</p>
                <p className="text-[11px] text-gray-400">
                  Purchased on {new Date(item.purchasedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(item.book.id, item.book.title)}
              disabled={downloadingId === item.book.id}
              className="w-full py-2.5 px-4 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-golden" />
              <span>{downloadingId === item.book.id ? 'Preparing Secure File...' : 'Download PDF / EPUB'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
