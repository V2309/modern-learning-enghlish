import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/user.service';
import WorkspaceLayoutClient from '@/components/workspace/layout/WorkspaceLayoutClient';

export const dynamic = 'force-dynamic';

export default async function WorkspaceLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <WorkspaceLayoutClient
      userId={user.uid}
      userName={user.name || 'User'}
      userEmail={user.email || ''}
    >
      {children}
    </WorkspaceLayoutClient>
  );
}
