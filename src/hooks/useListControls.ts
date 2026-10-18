import { useEffect, useMemo, useState } from 'react';

export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/**
 * Page number that snaps back to 1 whenever `filterKey` changes
 * (search, filters, sort, page size), without a reset effect.
 */
export function usePageForFilters(filterKey: string): [number, (page: number) => void] {
  const [state, setState] = useState({ key: filterKey, page: 1 });
  const page = state.key === filterKey ? state.page : 1;
  return [page, (next: number) => setState({ key: filterKey, page: next })];
}

/** Paginate an in-memory array (for small lists already loaded with a details response). */
export function useClientPagination<T>(items: T[], initialSize = 5) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  return {
    pageItems,
    paginationProps: {
      currentPage,
      totalPages,
      onPageChange: setPage,
      totalItems: items.length,
      itemsPerPage: pageSize,
      onItemsPerPageChange: (size: number) => {
        setPageSize(size);
        setPage(1);
      },
      pageSizeOptions: [5, 10, 25],
    },
  };
}
