import type { Metadata } from "next";
import { isAdmin, isAdminConfigured } from "@server/admin-auth";
import { countKratongs, listKratongs } from "@server/admin";
import { AdminLogin } from "./admin-login";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ตรวจสอบระบบ", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={isAdminConfigured()} />;
  }
  const [list, counts] = await Promise.all([listKratongs({ status: "ALL" }), countKratongs()]);
  if (!list.status || !counts.status) {
    return (
      <main data-scene="plain" className="font-ui px-6 py-10 text-center text-red-700">
        โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชหน้านี้
      </main>
    );
  }
  return (
    <AdminDashboard initialItems={list.data.items} initialCursor={list.data.nextCursor} initialCounts={counts.data} />
  );
}
