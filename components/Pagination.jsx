function buildDesktopPages(currentPage, totalPages) {
  const pages = [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  pages.push(1);

  if (currentPage > 3) {
    pages.push("start-ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("end-ellipsis");
  }

  pages.push(totalPages);
  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = buildDesktopPages(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Shop pages">
      <div className="pagination__desktop">
        <button
          type="button"
          className="pagination__control"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="pagination__numbers">
          {pages.map((page) => {
            if (typeof page !== "number") {
              return (
                <span key={page} className="pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              );
            }

            return (
              <button
                key={page}
                type="button"
                className={`pagination__page ${page === currentPage ? "pagination__page--active" : ""}`}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="pagination__control"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <div className="pagination__mobile">
        <button
          type="button"
          className="pagination__control"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="pagination__status">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="pagination__control"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
