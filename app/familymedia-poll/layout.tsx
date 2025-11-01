import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Poll Results - Family Magazine Guide',
  description: 'See how the military community answered this month\'s poll question',
  robots: 'index, follow',
};

export default function FamilyMediaPollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

