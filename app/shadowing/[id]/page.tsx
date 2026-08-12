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
      <div className="container mx-auto px-4 py-8 relative lg:h-[calc(100vh-64px)] lg:overflow-hidden flex flex-col">
        <ShadowingHeader userId={user.uid} videoId={shadowing.id} initialCompleted={!!progress} />
        
        <div className="grid lg:grid-cols-12 gap-12 items-start relative flex-1 min-h-0">
          {/* Main content: Video player, controls, description, and mobile transcript */}
          <div className="lg:col-span-8 space-y-8 lg:h-full lg:overflow-y-auto lg:pr-4 scrollbar-thin">
            <ShadowingVideoPlayer />
            
            {/* Transcript Panel for Mobile/Tablet (visible only below lg) */}
            <div className="block lg:hidden w-full h-[380px] transition-all duration-300">
              <ShadowingTranscript isMobile={true} />
            </div>
          </div>
          
          {/* Sidebar content: Desktop Transcript */}
          <ShadowingSidebar />
        </div>
      </div>
    </ShadowingPlayerProvider>
  );
}
