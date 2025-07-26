import StudentLayout from "../../components/layout/studentLayout";
import StudentProtectedRoute from "../../components/StudentProtectedRoute";

export default function StudentRootLayout({ children }) {
  return (
    <StudentProtectedRoute>
      <StudentLayout>{children}</StudentLayout>
    </StudentProtectedRoute>
  );
} 