import React, { useEffect, useState } from 'react';
import { Download, BookOpen, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { EbookItem } from '../../types';
import { handleBookImageError } from '../../utils/imageFallbacks';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const CustomerEbooksPage: React.FC = () => {
  const [ebooks, setEbooks] = useState<EbookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    api
      .get('/my-ebooks')
      .then((res) => {
        if (res.data.success) {
          setEbooks(res.data.data.ebooks);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = async (bookId: string, title: string) => {
    try {
      setDownloadingId(bookId);
      toast.info('Generating your private download link...');

      const response = await api.get(`/my-ebooks/${bookId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`"${title}" download started!`);
    } catch (err: any) {
      toast.error('Failed to initiate eBook download. Access might be restricted.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (ebooks.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-borderMuted p-8 sm:p-12 shadow-soft">
        <EmptyState
          icon={Download}
          title="No digital eBooks purchased yet"
          description="Purchase any digital edition to unlock permanent, secure download access for reading on your mobile, Kindle, iPad, or eReader."
          actionLabel="Explore eBooks"
          actionTo="/books?type=ebook"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy">
            My Digital eBook Library
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            {ebooks.length} verified digital title{ebooks.length > 1 ? 's' : ''} available for instant download
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lifetime Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ebooks.map((item) => (
          <div
            key={item.purchaseId}
            className="bg-surface rounded-2xl border border-borderMuted p-5 shadow-soft hover:shadow-elevated transition-all duration-200 flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                <img
                  src={item.book.coverImage}
                  alt={item.book.title}
                  className="w-20 h-28 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300"
                  onError={handleBookImageError}
                />
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <Badge variant="ebook" size="sm">
                  {item.book.format?.toUpperCase() || 'PDF'} EDITION
                </Badge>
                <h3 className="font-serif font-bold text-navy text-sm sm:text-base line-clamp-2 leading-snug">
                  {item.book.title}
                </h3>
                <p className="text-xs text-textSecondary font-medium">
                  by {item.book.author}
                </p>
                <p className="text-[11px] text-textSecondary/80">
                  Added on {new Date(item.purchasedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              isLoading={downloadingId === item.book.id}
              onClick={() => handleDownload(item.book.id, item.book.title)}
            >
              <Download className="w-4 h-4 text-golden" />
              <span>
                {downloadingId === item.book.id
                  ? 'Preparing Secure Download...'
                  : 'Download eBook (PDF)'}
              </span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
