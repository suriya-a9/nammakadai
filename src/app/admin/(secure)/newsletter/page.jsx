"use client";
import ListPagination, { PAGE_SIZE } from "@/components/admin/ListPagination";
import { useEffect, useMemo, useState } from "react";

export default function NewsletterPage() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("/api/admin/newsletter", { cache: "no-store" })
      .then((r) => r.json()).then((d) => setRows(d.data || [])).finally(() => setLoading(false));
  }, []);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => r.email.toLowerCase().includes(q)) : rows;
  }, [rows, search]);
  useEffect(() => { setPage(1); }, [search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / PAGE_SIZE)));
  const pagedRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return <div className="card-spacing"><div className="card"><div className="card-body">
    <div className="title-header option-title"><div><h5>Newsletter Subscribers</h5><small>{rows.length} subscribed email{rows.length === 1 ? "" : "s"}</small></div></div>
    <div className="admin-filter-bar"><input className="form-control" placeholder="Search email address" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    {loading ? <div className="admin-content-loading">Loading subscribers…</div> : <div className="table-responsive"><table className="table all-package theme-table align-middle admin-list-table"><thead><tr><th>#</th><th>Email</th><th>Subscribed On</th></tr></thead><tbody>{visible.length ? pagedRows.map((r, i) => <tr key={r.uuid}><td>{(currentPage - 1) * PAGE_SIZE + i + 1}</td><td><strong>{r.email}</strong></td><td>{new Date(r.createdAt).toLocaleString()}</td></tr>) : <tr><td colSpan="3" className="text-center py-4">No subscribers found.</td></tr>}</tbody></table><ListPagination page={currentPage} onPageChange={setPage} total={visible.length} /></div>}
  </div></div></div>;
}
