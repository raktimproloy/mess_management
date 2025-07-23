import React from 'react'
import EditStudent from '../../../../../components/admin/students/edit'
export default function page({ params }) {
  return (
    <EditStudent student={params.id} />
  )
}
