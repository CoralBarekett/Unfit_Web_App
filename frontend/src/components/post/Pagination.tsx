import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  
  // Create an array of page numbers to display
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination">
      <button 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        className="pagination-button"
      >
        &laquo; Prev
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`pagination-button ${currentPage === number ? 'active' : ''}`}
        >
          {number}
        </button>
      ))}
      
      <button 
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        className="pagination-button"
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default Pagination;