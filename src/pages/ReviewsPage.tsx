import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquareHeart,
  TrendingUp,
  ThumbsUp,
  Award,
  EyeOff,
  Eye,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Quote,
} from 'lucide-react';
import {
  useGetPlatformReviewStatsQuery,
  useListPlatformReviewsQuery,
  useUpdatePlatformReviewMutation,
  useDeletePlatformReviewMutation,
  type PlatformReview,
  type ReviewSort,
  type ReviewStatusFilter,
} from '../store/api/adminPlatformReviewsApi';
import Pagination from '../components/common/Pagination';
import {
  PageHeader,
  Card,
  StatCard,
  GrowthPill,
  FilterChips,
  Select,
  SearchInput,
  FetchBar,
  EmptyState,
  ErrorState,
  Toast,
  type Notice,
} from '../components/ui';
import { UserAvatar, PlanBadge } from '../components/users/UserBits';
import { useDebounced, usePageForFilters } from '../hooks/useListControls';
import { apiErrorMessage, formatDate, formatNumber, timeAgo } from '../lib/format';

const RATING_COLORS: Record<number, string> = {
  5: '#1A6B45',
  4: '#2ECC71',
  3: '#F59E0B',
  2: '#F97316',
  1: '#DC2626',
};

const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        style={{ width: size, height: size }}
        className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}
      />
    ))}
  </span>
);

const ReviewCard = ({
  review,
  index,
  onNotice,
  onDelete,
}: {
  review: PlatformReview;
  index: number;
  onNotice: (n: Notice) => void;
  onDelete: (r: PlatformReview) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [update, { isLoading }] = useUpdatePlatformReviewMutation();
  const hidden = review.status === 'hidden';
  const long = review.text.length > 220;

  const run = async (body: { status?: 'published' | 'hidden'; featured?: boolean }, success: string) => {
    try {
      await update({ id: review._id, ...body }).unwrap();
      onNotice({ type: 'success', text: success });
    } catch (err) {
      onNotice({ type: 'error', text: apiErrorMessage(err, 'Failed to update review') });
    }
  };

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/5 animate-fade-up ${
        review.featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-[#E3EEE7]'
      } ${hidden ? 'opacity-60 hover:opacity-100' : ''}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {review.featured && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          <Award className="h-3 w-3" /> Featured
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={review.user?.name || review.user?.email || '?'} picture={review.user?.picture} size={40} />
          <div className="min-w-0">
            {review.user ? (
              <Link to={`/users/${review.user._id}`} className="block truncate text-sm font-semibold text-gray-900 hover:text-[#1A6B45]">
                {review.user.name || review.user.email}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-gray-400">Deleted user</p>
            )}
            <p className="truncate text-xs text-gray-400">
              {[review.user?.businessName, review.user?.businessCity].filter(Boolean).join(' · ') || review.user?.email || '—'}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <Stars rating={review.rating} />
          <p className="mt-1 text-[11px] text-gray-400" title={formatDate(review.createdAt, true)}>
            {timeAgo(review.createdAt)}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex-1 rounded-xl bg-[#F7FAF8] p-4">
        <Quote className="absolute right-3 top-3 h-6 w-6 text-[#D1E7DA]" />
        <p className={`whitespace-pre-line pr-6 text-sm leading-relaxed text-gray-700 ${!expanded && long ? 'line-clamp-4' : ''}`}>
          {review.text}
        </p>
        {long && (
          <button onClick={() => setExpanded((v) => !v)} className="mt-1 text-xs font-semibold text-[#1A6B45] hover:text-[#2ECC71]">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {review.user?.plan && <PlanBadge plan={review.user.plan} />}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              hidden ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {hidden ? 'Hidden' : 'Published'}
          </span>
          {review.updatedAt !== review.createdAt && <span className="text-[10px] text-gray-400">edited</span>}
        </div>

        <div className="flex items-center gap-1">
          {isLoading && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin text-gray-400" />}
          <button
            onClick={() => run({ featured: !review.featured }, review.featured ? 'Removed from featured' : 'Marked as featured')}
            disabled={isLoading}
            title={review.featured ? 'Unfeature' : 'Feature this review'}
            className={`rounded-lg p-2 transition-all active:scale-90 disabled:opacity-50 ${
              review.featured ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'text-gray-400 hover:bg-amber-50 hover:text-amber-500'
            }`}
          >
            <Award className="h-4 w-4" />
          </button>
          <button
            onClick={() => run({ status: hidden ? 'published' : 'hidden' }, hidden ? 'Review published' : 'Review hidden')}
            disabled={isLoading}
            title={hidden ? 'Publish' : 'Hide'}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-90 disabled:opacity-50"
          >
            {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(review)}
            title="Delete"
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-90"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

const ReviewsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<ReviewStatusFilter | ''>('');
  const [rating, setRating] = useState<number | ''>('');
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [limit, setLimit] = useState(10);
  const [notice, setNotice] = useState<Notice>(null);
  const [toDelete, setToDelete] = useState<PlatformReview | null>(null);

  const search = useDebounced(searchInput.trim());
  const [page, setPage] = usePageForFilters(JSON.stringify([search, status, rating, sort, limit]));

  const { data: stats } = useGetPlatformReviewStatsQuery();
  const { data, isLoading, isFetching, error, refetch } = useListPlatformReviewsQuery({ search, status, rating, sort, page, limit });
  const [deleteReview, { isLoading: isDeleting }] = useDeletePlatformReviewMutation();

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination ?? { total: 0, totalPages: 0 };
  const hasFilters = !!(search || status || rating);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteReview(toDelete._id).unwrap();
      setNotice({ type: 'success', text: 'Review deleted' });
    } catch (err) {
      setNotice({ type: 'error', text: apiErrorMessage(err, 'Failed to delete review') });
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="min-h-screen flex-1 bg-[#F4F7F4]">
      <PageHeader
        title="Platform reviews"
        subtitle={
          stats && stats.total > 0
            ? `What businesses say about GetReviewQR · ${stats.average.toFixed(1)}★ from ${formatNumber(stats.total)} review${stats.total === 1 ? '' : 's'}`
            : 'What businesses say about GetReviewQR'
        }
      />
      <Toast notice={notice} onClose={() => setNotice(null)} />

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card delay={0} className="relative">
            {!stats ? (
              <div className="skeleton h-52 rounded-xl" />
            ) : (
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="text-center sm:w-36 sm:shrink-0">
                  <p className="text-5xl font-black leading-none text-gray-900 tabular-nums">{stats.average ? stats.average.toFixed(1) : '—'}</p>
                  <div className="mt-2 flex justify-center">
                    <Stars rating={stats.average} size={18} />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {formatNumber(stats.total)} review{stats.total === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((r) => {
                    const count = stats.distribution[r as 1 | 2 | 3 | 4 | 5];
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    const active = rating === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRating(active ? '' : r)}
                        className={`group flex w-full items-center gap-2 rounded-lg px-2 py-1 transition-colors ${active ? 'bg-[#E8F5EE]' : 'hover:bg-[#F7FAF8]'}`}
                        title={active ? 'Clear rating filter' : `Show ${r}-star reviews`}
                      >
                        <span className="flex w-7 items-center gap-0.5 text-xs font-semibold text-gray-600">
                          {r}
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEF3EF]">
                          <span
                            className="block h-full rounded-full transition-[width] duration-1000 ease-out"
                            style={{ width: `${pct}%`, backgroundColor: RATING_COLORS[r] }}
                          />
                        </span>
                        <span className="w-8 text-right text-xs font-medium text-gray-500 tabular-nums">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[118px] rounded-2xl" />)
            ) : (
              <>
                <StatCard
                  label="Reviews (30 days)"
                  value={stats.last30}
                  icon={TrendingUp}
                  accent="#1A6B45"
                  delay={60}
                  sub={
                    <div className="flex flex-wrap items-center gap-2">
                      <GrowthPill growth={stats.last30Growth} fallback="No reviews in the 30 days before" />
                      {stats.last30Average > 0 && <span className="text-[11px] text-gray-400">avg {stats.last30Average.toFixed(1)}★</span>}
                    </div>
                  }
                />
                <StatCard
                  label="Positive (4–5★)"
                  value={stats.positivePct}
                  format={(n) => `${Math.round(n)}%`}
                  icon={ThumbsUp}
                  accent="#10B981"
                  delay={100}
                  sub={<span className="text-[11px] text-gray-400">{stats.negativePct}% negative (1–2★)</span>}
                />
                <StatCard
                  label="Featured"
                  value={stats.featured}
                  icon={Award}
                  accent="#D97706"
                  delay={140}
                  sub={<span className="text-[11px] text-gray-400">Picked as testimonials</span>}
                />
                <StatCard
                  label="Hidden"
                  value={stats.byStatus.hidden}
                  icon={EyeOff}
                  accent="#6B7280"
                  delay={180}
                  sub={<span className="text-[11px] text-gray-400">{formatNumber(stats.byStatus.published)} published</span>}
                />
              </>
            )}
          </div>
        </div>

        {/* List */}
        <Card
          flush
          title="All reviews"
          icon={MessageSquareHeart}
          delay={220}
          action={<SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search text, name, email, business…" className="w-full sm:w-80" />}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF3EF] px-5 py-3">
            <FilterChips<ReviewStatusFilter | ''>
              value={status}
              onChange={setStatus}
              options={[
                { value: '', label: 'All', count: stats?.total },
                { value: 'published', label: 'Published', count: stats?.byStatus.published },
                { value: 'featured', label: 'Featured', count: stats?.featured },
                { value: 'hidden', label: 'Hidden', count: stats?.byStatus.hidden },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select<string>
                value={String(rating)}
                onChange={(v) => setRating(v ? Number(v) : '')}
                options={[
                  { value: '', label: 'Any rating' },
                  { value: '5', label: '5 stars' },
                  { value: '4', label: '4 stars' },
                  { value: '3', label: '3 stars' },
                  { value: '2', label: '2 stars' },
                  { value: '1', label: '1 star' },
                ]}
              />
              <Select<ReviewSort>
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'highest', label: 'Highest rated' },
                  { value: 'lowest', label: 'Lowest rated' },
                ]}
              />
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setStatus('');
                    setRating('');
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>

          <FetchBar active={isFetching && !isLoading} />

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-52 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState text="Couldn't load reviews" onRetry={refetch} />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={MessageSquareHeart}
              title="No reviews found"
              hint={hasFilters ? 'Try a different search or filter.' : 'Reviews appear when businesses rate GetReviewQR from their dashboard.'}
            />
          ) : (
            <div className={`grid grid-cols-1 gap-4 bg-[#FAFCFA] p-5 transition-opacity duration-200 lg:grid-cols-2 ${isFetching ? 'opacity-60' : ''}`}>
              {reviews.map((r, i) => (
                <ReviewCard key={r._id} review={r} index={i} onNotice={setNotice} onDelete={setToDelete} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            totalItems={pagination.total}
            itemsPerPage={limit}
            onItemsPerPageChange={setLimit}
          />
        </Card>
      </div>

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-up" onClick={() => setToDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete this review?</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              {toDelete.user?.name || 'This user'}'s {toDelete.rating}★ review will be removed permanently. Use "Hide" instead if you may want it back.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setToDelete(null)} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
