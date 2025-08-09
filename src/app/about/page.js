import React from 'react'
import MainLayout from '../../components/layout/mainLayout'
import AboutPage from '../../components/pages/about'
import { getPageMetadata } from "../../lib/metadata";

export const metadata = getPageMetadata('about');

export default function page() {
  return (
    <MainLayout>
        <AboutPage />
    </MainLayout>
  )
}
