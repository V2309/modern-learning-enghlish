import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/user.service';
import { getShadowingVideoById, getShadowingProgress } from '@/services/shadowing.service';
import {
  ShadowingPlayerProvider,
  ShadowingHeader,
  ShadowingVideoPlayer,
  ShadowingTranscript,
  ShadowingSidebar
} from '@/components/shadowing/ShadowingPlayer';
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

  const [shadowing, progress] = await Promise.all([
    getShadowingVideoById(id),
    getShadowingProgress(user.uid, id)
  ]);

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
    <ShadowingPlayerProvider shadowingVideo={shadowing}>
      <div className="w-full relative flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Top Header Navigation */}
        <ShadowingHeader userId={user.uid} videoId={shadowing.id} initialCompleted={!!progress} />
        
        {/* Main Unified 2-Column Grid Layout (Divided by 1px Hairline Border, Equal Height) */}
        <div className="w-full grid lg:grid-cols-12 border border-border rounded-2xl overflow-hidden bg-background divide-y lg:divide-y-0 lg:divide-x divide-border lg:h-[calc(100vh-12rem)] min-h-[580px] shadow-2xs">
          {/* Left Column: Video Player, Controls, Guide & Notes (Smooth Scrollable Column, Equal Height) */}
          <div className="lg:col-span-7 xl:col-span-8 h-full overflow-y-auto scrollbar-thin p-0 m-0">
            <ShadowingVideoPlayer />
            
            {/* Mobile/Tablet Transcript (flush below video on smaller screens) */}
            <div className="block lg:hidden w-full border-t border-border p-0 h-[420px]">
              <ShadowingTranscript isMobile={true} />
            </div>
          </div>
          
          {/* Right Column: Desktop Transcript (Zero Margin / Zero Outer Padding, Equal Height) */}
          <ShadowingSidebar />
        </div>
      </div>
    </ShadowingPlayerProvider>
  );
}
