"use client";
import ListPagination, { PAGE_SIZE } from "@/components/admin/ListPagination";
import { useEffect, useMemo, useState } from "react";
import { RiCloseLine, RiEyeLine } from "react-icons/ri";

const STATUSES = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const label = (v) => String(v || "").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const loadOrders = async () => {
    try {
      const r=await fetch("/api/admin/orders",{cache:"no-store"}); const d=await r.json();
      if(!r.ok) throw new Error(d.message||"Unable to load orders");
      setOrders(d.data||[]);
      setSelected(current => current ? (d.data||[]).find(o=>o.uuid===current.uuid)||current : null);
    } catch(e){ setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ loadOrders(); },[]);

  const changeStatus=async(uuid,status)=>{
    setSaving(uuid); setError("");
    try{
      const r=await fetch("/api/admin/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({uuid,status})});
      const d=await r.json(); if(!r.ok) throw new Error(d.message||"Unable to update status");
      setOrders(rows=>rows.map(o=>o.uuid===uuid?{...o,status}:o));
      setSelected(o=>o?.uuid===uuid?{...o,status}:o);
    }catch(e){setError(e.message);}finally{setSaving("");}
  };

  const visible=useMemo(()=>{const q=search.trim().toLowerCase();const now=new Date();return orders.filter(o=>{if(q&&![o.number,o.name,o.email,o.phone,o.status].some(v=>String(v||"").toLowerCase().includes(q)))return false;if(statusFilter!=="all"&&o.status!==statusFilter)return false;const d=new Date(o.date);if(dateFilter==="today"){const a=new Date();a.setHours(0,0,0,0);if(d<a)return false}else if(dateFilter==="week"){const a=new Date();a.setDate(a.getDate()-7);if(d<a)return false}else if(dateFilter==="month"){const a=new Date(now.getFullYear(),now.getMonth(),1);if(d<a)return false}else if(dateFilter==="custom"){if(customFrom&&d<new Date(customFrom+"T00:00:00"))return false;if(customTo&&d>new Date(customTo+"T23:59:59"))return false}return true})},[orders,search,statusFilter,dateFilter,customFrom,customTo]);

  useEffect(()=>{setPage(1)},[search,statusFilter,dateFilter,customFrom,customTo]);
  const currentPage=Math.min(page,Math.max(1,Math.ceil(visible.length/PAGE_SIZE)));
  const pagedRows=visible.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  return <div className="card-spacing">
    <div className="card"><div className="card-body">
      <div className="title-header option-title"><div><h5>Customer Orders</h5><small>Manage orders and update fulfilment status</small></div></div>
      {error&&<div className="alert alert-danger">{error}</div>}
      <div className="admin-filter-bar"><input className="form-control admin-filter-search" placeholder="Search order, customer or email" value={search} onChange={e=>setSearch(e.target.value)}/><select className="form-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All Statuses</option>{STATUSES.map(s=><option value={s} key={s}>{label(s)}</option>)}</select><select className="form-select" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}><option value="all">All Dates</option><option value="today">Today</option><option value="week">Last 7 Days</option><option value="month">This Month</option><option value="custom">Custom Date</option></select>{dateFilter==="custom"&&<><input type="date" className="form-control" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/><input type="date" className="form-control" value={customTo} min={customFrom} onChange={e=>setCustomTo(e.target.value)}/></>}</div>
      {loading?<div className="admin-content-loading">Loading orders…</div>:visible.length===0?<div className="admin-empty-category">No orders found.</div>:
      <div className="table-responsive"><table className="table all-package theme-table align-middle admin-list-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{pagedRows.map(order=><tr key={order.uuid}>
        <td><strong>{order.number}</strong></td><td>{order.name}<br/><small>{order.email}</small></td><td>{new Date(order.date).toLocaleString()}</td><td>₹{Number(order.total).toFixed(2)}</td>
        <td><select className={`form-select admin-order-status status-${order.status}`} value={order.status} disabled={saving===order.uuid} onChange={e=>changeStatus(order.uuid,e.target.value)}>{STATUSES.map(s=><option value={s} key={s}>{label(s)}</option>)}</select><small className="d-block mt-1">Payment: {label(order.payment_status)}</small></td>
        <td><button className="admin-table-icon-btn" type="button" title="View order" onClick={()=>setSelected(order)}><RiEyeLine/></button></td>
      </tr>)}</tbody></table><ListPagination page={currentPage} onPageChange={setPage} total={visible.length}/></div>}
    </div></div>
    <div className={`admin-offcanvas-backdrop ${selected?"show":""}`} onClick={()=>setSelected(null)}/>
    <aside className={`admin-offcanvas ${selected?"show":""}`} aria-hidden={!selected}>
      <div className="admin-offcanvas-header"><div><small>Order details</small><h5>{selected?.number||"Order"}</h5></div><button type="button" onClick={()=>setSelected(null)}><RiCloseLine/></button></div>
      {selected&&<div className="admin-offcanvas-body">
        <div className="admin-order-summary"><div><span>Customer</span><strong>{selected.name}</strong><small>{selected.email}</small><small>{selected.phone}</small></div><div><span>Amount</span><strong>₹{Number(selected.total).toFixed(2)}</strong></div></div>
        <div className="mt-4"><label className="form-label fw-semibold">Order Status</label><select className={`form-select admin-order-status status-${selected.status}`} value={selected.status} disabled={saving===selected.uuid} onChange={e=>changeStatus(selected.uuid,e.target.value)}>{STATUSES.map(s=><option value={s} key={s}>{label(s)}</option>)}</select></div>
        <h6 className="mt-4">Delivery Address</h6><p>{selected.address}, {selected.city}, {selected.state} - {selected.pincode}</p>
        <h6 className="mt-4">Items</h6><div className="admin-order-items">{selected.items.map((item,i)=><div key={i}><span>{item.quantity} × {item.name}</span><strong>₹{Number(item.price).toFixed(2)}</strong></div>)}</div>
      </div>}
    </aside>
  </div>;
}
