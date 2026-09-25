"use client";
import { useEffect, useState } from "react";
import { STORE_POLICIES } from "@/lib/storePolicies";
export default function PolicyContent({ slug }) {
 const definition = STORE_POLICIES.find((p) => p.slug === slug);
 const [policy, setPolicy] = useState(null);
 useEffect(() => { let alive = true; fetch(`/api/policies/${slug}`).then((r) => r.json()).then((r) => { if (alive) setPolicy(r.data); }).catch(() => { if (alive) setPolicy({ content: "" }); }); return () => { alive = false; }; }, [slug]);
 return <main className="nk-policy-page"><div className="nk-policy-hero"><h1>{definition?.title}</h1></div><article className="nk-policy-content">
 {!policy ? <p>Loading…</p> : !policy.content.trim() ? <p>Policy content will be available soon.</p> : policy.content.split(/\r?\n/).map((line, index) => { const value = line.trim(); if (!value) return <div key={index} className="nk-policy-space" />; if (/^#{1,3}\s/.test(value)) { const heading = value.replace(/^#{1,3}\s/, ""); return <h2 key={index}>{heading}</h2>; } if (/^[-*]\s/.test(value)) return <p key={index} className="nk-policy-bullet">{value.slice(2)}</p>; return <p key={index}>{line}</p>; })}
 </article></main>;
}
