import { redirect } from "next/navigation";
import AdminThemeShell from "@/components/admin/AdminThemeShell";
import { getAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export default async function SecureAdminLayout({ children }) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return <AdminThemeShell admin={admin}>{children}</AdminThemeShell>;
}
