import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/user.service';
import { getShadowingVideoById } from '@/services/shadowing.service';
import { ShadowingPlayer } from '@/components/shadowing/ShadowingPlayer';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShadowingPlayerPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const shadowing = await getShadowingVideoById(id);
  if (!shadowing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Không tìm thấy video Shadowing</h1>
        <p className="text-muted-foreground text-sm">Video này không tồn tại hoặc đã bị xóa.</p>
        <Link href="/shadowing" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
          <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="mb-4">
        <Link href="/shadowing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-semibold text-sm">
          <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
      </div>
      <ShadowingPlayer shadowingVideo={shadowing} />
    </div>
  );
}
