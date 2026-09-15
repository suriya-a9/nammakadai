import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SetupForm from "@/components/admin/SetupForm";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  const count = await prisma.admin.count();
  if (count > 0) redirect("/admin/login");
  return <SetupForm />;
}
