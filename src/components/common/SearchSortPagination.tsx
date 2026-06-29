import React from 'react';
import { Search } from 'lucide-react';
import './searchSortPagination.css';

export interface SortOption {
  label: string;
  value: string;
}

interface SearchSortPaginationProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  sortValue: string;
  sortOptions: SortOption[];
  onSortChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  placeholder?: string;
  onSearchSubmit?: (keyword: string) => void | Promise<void>;
}

export const SearchSortPagination: React.FC<SearchSortPaginationProps> = ({
  keyword,
  onKeywordChange,
  sortValue,
  sortOptions,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
  placeholder = 'Tìm kiếm...',
  onSearchSubmit,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSearchSubmit?.(keyword);
  };

  return (
    <div className="ssp-shell">
      <form className="ssp-search" onSubmit={handleSubmit}>
        <button type="submit" className="ssp-search-button" aria-label="Tìm kiếm">
          <Search size={18} />
        </button>
        <input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={placeholder}
        />
      </form>

      <select
        className="ssp-sort"
        value={sortValue}
        onChange={(event) => onSortChange(event.target.value)}
        aria-label="Sắp xếp"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {totalPages > 1 && (
        <div className="ssp-pagination">
          <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
            &laquo;
          </button>
          <span>
            {currentPage}/{totalPages}
          </span>
          <button type="button" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};
