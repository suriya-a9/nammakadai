export const STORE_POLICIES = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "refund-policy", title: "Refund Policy" },
  { slug: "cancellation-policy", title: "Cancellation Policy" },
];
export function validPolicy(slug) { return STORE_POLICIES.find((item) => item.slug === slug); }
