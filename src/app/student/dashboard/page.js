import StudentDashboard from '../../../components/student/dashboard'
import { getPageMetadata } from "../../../lib/metadata";

export const metadata = getPageMetadata('student_dashboard');

export default function StudentDashboardPage() {
  return (
    <StudentDashboard />
  )
}
