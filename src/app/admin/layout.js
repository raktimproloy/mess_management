import AdminLayout from "../../components/layout/adminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";

export default function AdminRootLayout({ children }) {
  return (
    <AdminProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminProtectedRoute>
  );
} 