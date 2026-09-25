"use client";

export const PAGE_SIZE = 10;

export default function ListPagination({ page, onPageChange, total }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total <= PAGE_SIZE) return null;
  const current = Math.min(Math.max(page, 1), pages);
  const first = (current - 1) * PAGE_SIZE + 1;
  const last = Math.min(current * PAGE_SIZE, total);
  const start = Math.max(1, Math.min(current - 2, pages - 4));
  const buttons = Array.from({ length: Math.min(5, pages) }, (_, index) => start + index);
  return (
    <nav className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3" aria-label="Listing pagination">
      <small>Showing {first}–{last} of {total}</small>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <button type="button" className="btn btn-outline-primary btn-sm" disabled={current === 1} onClick={() => onPageChange(current - 1)}>Previous</button>
        {buttons.map(number => <button type="button" key={number} className={`btn btn-sm ${number === current ? "btn-primary" : "btn-outline-primary"}`} aria-current={number === current ? "page" : undefined} onClick={() => onPageChange(number)}>{number}</button>)}
        <button type="button" className="btn btn-outline-primary btn-sm" disabled={current === pages} onClick={() => onPageChange(current + 1)}>Next</button>
      </div>
    </nav>
  );
}
