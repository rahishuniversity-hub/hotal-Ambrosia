export const metadata = {
  title: "Admin Portal | Hotel Ambrosia",
  description: "Hotel Ambrosia Management System",
};

import AuthProvider from "@/components/admin/AuthProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
