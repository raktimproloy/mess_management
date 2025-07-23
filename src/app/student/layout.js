import StudentLayout from "../../components/layout/studentLayout";

// Placeholder for role check. Replace with real auth logic as needed.
export default function AdminRootLayout({ children }) {
  // In a real app, check user role here and redirect if not admin.
  // For now, always render admin layout.
  return <StudentLayout>{children}</StudentLayout>;
} 