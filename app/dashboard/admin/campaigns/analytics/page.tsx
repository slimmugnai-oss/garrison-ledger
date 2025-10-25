import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from "next";
import { redirect } from 'next/navigation';

import EmailAnalyticsClient from './EmailAnalyticsClient';

export const metadata: Metadata = {
  title: "Email Analytics - Admin Dashboard",
  description: "Email campaign performance and engagement analytics",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

export default async function EmailAnalyticsPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  return <EmailAnalyticsClient />;
}

