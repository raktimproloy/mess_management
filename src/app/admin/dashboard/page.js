import React from 'react'
import AdminDashboard from '../../../components/admin/dashboard'
import { getPageMetadata } from "../../../lib/metadata";

export const metadata = getPageMetadata('admin_dashboard');

export default function AdminDashboardPage() {
  return (
    <AdminDashboard />
  )
}
