import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/user.service';
import { getShadowingVideos } from '@/services/shadowing.service';
import ShadowingListClient from '@/components/shadowing/ShadowingListClient';

export const dynamic = "force-dynamic";

export default async function ShadowingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const shadowings = await getShadowingVideos();

  return <ShadowingListClient initialShadowings={shadowings} userId={user.uid} />;
}
