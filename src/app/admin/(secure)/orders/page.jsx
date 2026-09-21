"use client";
import { useEffect, useMemo, useState } from "react";
import { RiCloseLine, RiEyeLine } from "react-icons/ri";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders", { cache: "no-store" }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Unable to load orders");
      setOrders(d.data || []);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => [o.number, o.name, o.email, o.phone, o.status].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [orders, search]);

  return <div className="card-spacing">
    <div className="card"><div className="card-body">
      <div className="title-header option-title"><div><h5>Customer Orders</h5><small>Orders placed through the storefront</small></div></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3"><input className="form-control" placeholder="Search order, customer, email or status" value={search} onChange={(e)=>setSearch(e.target.value)} /></div>
      {loading ? <div className="admin-content-loading">Loading orders…</div> : visible.length === 0 ? <div className="admin-empty-category">No orders found.</div> :
        <div className="table-responsive"><table className="table all-package theme-table align-middle admin-list-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map(order => <tr key={order.uuid}>
          <td><strong>{order.number}</strong></td><td>{order.name}<br/><small>{order.email}</small></td><td>{new Date(order.date).toLocaleString()}</td><td>₹{Number(order.total).toFixed(2)}</td><td><span className="badge bg-light text-dark">{order.status}</span><br/><small>{order.payment_status}</small></td><td><button className="admin-table-icon-btn" type="button" title="View order" onClick={()=>setSelected(order)}><RiEyeLine/></button></td>
        </tr>)}</tbody></table></div>}
    </div></div>

    <div className={`admin-offcanvas-backdrop ${selected ? "show" : ""}`} onClick={()=>setSelected(null)} />
    <aside className={`admin-offcanvas ${selected ? "show" : ""}`} aria-hidden={!selected}>
      <div className="admin-offcanvas-header"><div><small>Order details</small><h5>{selected?.number || "Order"}</h5></div><button type="button" onClick={()=>setSelected(null)}><RiCloseLine/></button></div>
      {selected && <div className="admin-offcanvas-body">
        <div className="admin-order-summary"><div><span>Customer</span><strong>{selected.name}</strong><small>{selected.email}</small><small>{selected.phone}</small></div><div><span>Amount</span><strong>₹{Number(selected.total).toFixed(2)}</strong></div></div>
        <h6 className="mt-4">Delivery Address</h6><p>{selected.address}, {selected.city}, {selected.state} - {selected.pincode}</p>
        <h6 className="mt-4">Items</h6><div className="admin-order-items">{selected.items.map((item,i)=><div key={i}><span>{item.quantity} × {item.name}</span><strong>₹{Number(item.price).toFixed(2)}</strong></div>)}</div>
      </div>}
    </aside>
  </div>;
}
