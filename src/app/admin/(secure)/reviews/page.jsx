"use client";

import ListPagination, { PAGE_SIZE } from "@/components/admin/ListPagination";
import { useEffect, useMemo, useState } from "react";
import { RiDeleteBinLine, RiStarFill } from "react-icons/ri";

export default function AdminReviewsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reviews", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load reviews");
      setRows(result.data || []);
    } catch (error) {
      setMessage(error.message || "Unable to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((review) => [review.product?.name, review.customer?.name, review.customer?.phone, review.customer?.email, review.description]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [rows, search]);

  useEffect(() => { setPage(1); }, [search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / PAGE_SIZE)));
  const pagedRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const deleteReview = async (review) => {
    if (!window.confirm(`Delete this review for ${review.product?.name || "this product"}?`)) return;
    setDeleting(review.uuid);
    setMessage("");
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_uuid: review.uuid }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to delete review");
      setRows((current) => current.filter((item) => item.uuid !== review.uuid));
      setMessage("Review deleted successfully");
    } catch (error) {
      setMessage(error.message || "Unable to delete review");
    } finally {
      setDeleting("");
    }
  };

  return (
    <div className="card-spacing">
      <div className="card">
        <div className="card-body">
          <div className="title-header option-title">
            <div><h5>Product Reviews</h5><small>View and moderate customer reviews for every product</small></div>
          </div>
          <div className="admin-filter-bar">
            <input className="form-control" placeholder="Search product, customer or review" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          {message ? <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"} py-2`}>{message}</div> : null}
          {loading ? <div className="admin-content-loading">Loading reviews…</div> : (
            <div className="table-responsive">
              <table className="table all-package theme-table align-middle admin-list-table">
                <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {pagedRows.length ? pagedRows.map((review) => (
                    <tr key={review.uuid}>
                      <td><strong>{review.product?.name || "—"}</strong></td>
                      <td><strong>{review.customer?.name || "Customer"}</strong><small className="d-block">{review.customer?.phone || review.customer?.email || "—"}</small></td>
                      <td><span className="d-inline-flex align-items-center gap-1"><RiStarFill /> {review.rating}/5</span></td>
                      <td style={{ minWidth: 260, whiteSpace: "normal" }}>{review.description || <span className="text-muted">No comment</span>}</td>
                      <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td><button type="button" className="btn btn-sm btn-outline-danger" disabled={deleting === review.uuid} onClick={() => deleteReview(review)} title="Delete review"><RiDeleteBinLine /> {deleting === review.uuid ? "Deleting…" : "Delete"}</button></td>
                    </tr>
                  )) : <tr><td colSpan="6" className="text-center py-4">No reviews found.</td></tr>}
                </tbody>
              </table>
              <ListPagination page={currentPage} onPageChange={setPage} total={visible.length} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
