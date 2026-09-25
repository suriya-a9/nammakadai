"use client";
import { useEffect, useState } from "react";
import { STORE_POLICIES } from "@/lib/storePolicies";
export default function PoliciesPage() {
 const [selected, setSelected] = useState("privacy-policy");
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState("");
 useEffect(() => { fetch("/api/admin/policies", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("Could not load policies"); return r.json(); }).then((result) => setItems(result.data || [])).catch((e) => setMessage(e.message)).finally(() => setLoading(false)); }, []);
 const current = items.find((p) => p.slug === selected);
 const save = async () => { setSaving(true); setMessage(""); try { const response = await fetch("/api/admin/policies", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: selected, content: current?.content || "" }) }); if (!response.ok) throw new Error((await response.json()).message || "Save failed"); setMessage("Policy saved successfully."); } catch (error) { setMessage(error.message); } finally { setSaving(false); } };
 return <div className="card-spacing"><div className="card"><div className="card-body nk-policy-admin"><div className="title-header option-title"><div><h5>Store Policies</h5><small>Manage your storefront legal and help pages.</small></div></div>
 <div className="nk-policy-tabs">{STORE_POLICIES.map((p) => <button type="button" key={p.slug} className={selected === p.slug ? "active" : ""} onClick={() => { setSelected(p.slug); setMessage(""); }}>{p.title}</button>)}</div>
 {loading ? <p>Loading policies…</p> : <><label className="form-label fw-bold">{current?.title || "Policy"} content</label><p className="text-muted">Use a line beginning with # for section headings, - for bullet points, and blank lines for paragraph spacing.</p><textarea className="form-control nk-policy-editor" value={current?.content || ""} onChange={(e) => setItems((previous) => previous.map((p) => p.slug === selected ? { ...p, content: e.target.value } : p))} placeholder="# 1. Information We Collect\nWe may collect the following information:\n- Full Name\n- Email Address" /><div className="nk-policy-actions"><a href={`/${selected}`} target="_blank" rel="noopener noreferrer">View storefront page ↗</a><button className="btn btn-solid" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Policy"}</button></div></>}
 {message && <p role="status" className="mt-3">{message}</p>}
 </div></div></div>;
}
