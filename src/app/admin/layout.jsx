import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin | Accord Tours & Travels" };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
