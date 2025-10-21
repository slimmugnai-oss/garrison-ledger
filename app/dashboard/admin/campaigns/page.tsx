import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CampaignsPageClient from './CampaignsPageClient';

export const metadata: Metadata = {
  title: "Email Campaigns - Admin Dashboard",
  description: "Manage email automation, sequences, and manual campaigns",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

export default async function AdminCampaignsPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  return <CampaignsPageClient />;
}
