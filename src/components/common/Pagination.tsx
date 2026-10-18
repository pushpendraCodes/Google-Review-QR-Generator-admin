import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  /** Shows a rows-per-page selector when provided. */
  onItemsPerPageChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

const Pagination = ({
  currentPage: requestedPage,
  totalPages: rawTotalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) => {
  if (totalItems <= 0) return null;

  // The list can shrink (filters, deletes) while a later page is selected.
  const totalPages = Math.max(1, rawTotalPages);
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const go = (page: number) => onPageChange(Math.min(Math.max(1, page), totalPages));

  return (
    <div className="mt-auto flex flex-col items-center justify-between gap-3 border-t border-[#EEF3EF] bg-[#F7FAF8] px-5 py-3 sm:flex-row">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>
          <span className="font-semibold text-gray-800 tabular-nums">
            {startItem}–{endItem}
          </span>{' '}
          of <span className="font-semibold text-gray-800 tabular-nums">{totalItems.toLocaleString('en-IN')}</span>
        </span>
        {onItemsPerPageChange && (
          <label className="flex items-center gap-1.5">
            <span className="text-gray-400">Rows</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="cursor-pointer rounded-md border border-[#D1E7DA] bg-white px-1.5 py-1 text-xs font-medium text-gray-700 outline-none focus:border-[#1A6B45]"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => go(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white hover:text-[#1A6B45] hover:shadow-sm disabled:pointer-events-none disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers(currentPage, totalPages).map((page, i) =>
            page === '…' ? (
              <span key={`dots-${i}`} className="px-1.5 text-xs text-gray-400">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => go(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold tabular-nums transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-[#1A6B45] text-white shadow-sm shadow-emerald-900/20'
                    : 'text-gray-600 hover:bg-white hover:text-[#1A6B45] hover:shadow-sm'
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => go(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white hover:text-[#1A6B45] hover:shadow-sm disabled:pointer-events-none disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;
