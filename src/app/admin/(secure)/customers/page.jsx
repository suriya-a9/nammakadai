"use client";
import { useEffect, useMemo, useState } from "react";
export default function AdminCustomersPage(){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState("");
 useEffect(()=>{fetch('/api/admin/customers',{cache:'no-store'}).then(r=>r.json()).then(d=>setRows(d.data||[])).finally(()=>setLoading(false))},[]);
 const visible=useMemo(()=>{const q=search.toLowerCase().trim();return q?rows.filter(c=>[c.name,c.email,c.phone].some(v=>String(v||'').toLowerCase().includes(q))):rows},[rows,search]);
 return <div className="card-spacing"><div className="card"><div className="card-body"><div className="title-header option-title"><div><h5>Customers</h5><small>Registered customer directory</small></div></div><div className="admin-filter-bar"><input className="form-control" placeholder="Search name, email or phone" value={search} onChange={e=>setSearch(e.target.value)}/></div>{loading?<div className="admin-content-loading">Loading customers…</div>:<div className="table-responsive"><table className="table all-package theme-table align-middle admin-list-table"><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th></tr></thead><tbody>{visible.map(c=><tr key={c.uuid}><td><strong>{c.name}</strong></td><td>{c.email}</td><td>{c.phone||'—'}</td><td>{c.orders}</td><td>{new Date(c.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</div></div></div>
}
