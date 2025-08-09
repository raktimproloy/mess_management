import Image from "next/image";
import MainLayout from "../components/layout/mainLayout";
import HomePage from "../components/pages/home";
import { getPageMetadata } from "../lib/metadata";

export const metadata = getPageMetadata('home');

export default function Home() {
  return (
    <MainLayout>
      <HomePage />
      
    </MainLayout>
  );
}
