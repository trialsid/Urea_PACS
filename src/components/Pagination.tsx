import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  showInfo = true
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 border-t border-neutral-200">
      {/* Info */}
      {showInfo && (
        <div className="flex-1 flex justify-between sm:hidden">
          <span className="text-sm text-neutral-700">
            Page {currentPage} of {totalPages}
          </span>
          <span className="text-sm text-neutral-700">
            {startItem}-{endItem} of {totalItems}
          </span>
        </div>
      )}

      {showInfo && (
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-neutral-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center sm:justify-end">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
              currentPage === 1
                ? 'bg-neutral-100 border-neutral-300 text-neutral-400 cursor-not-allowed'
                : 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
            }`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              disabled={typeof page === 'string'}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                page === currentPage
                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                  : typeof page === 'string'
                  ? 'bg-white border-neutral-300 text-neutral-700 cursor-default'
                  : 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
              currentPage === totalPages
                ? 'bg-neutral-100 border-neutral-300 text-neutral-400 cursor-not-allowed'
                : 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
            }`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;