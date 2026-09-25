import Link from "next/link";
const policies = [{ label: "Refund Policy", href: "/refund-policy" }, { label: "Cancellation Policy", href: "/cancellation-policy" }, { label: "Privacy Policy", href: "/privacy-policy" }];
export default function FooterHelpCenter() { return <div className="footer-content"><ul>{policies.map((p) => <li key={p.href}><Link href={p.href} className="text-content">{p.label}</Link></li>)}</ul></div>; }
