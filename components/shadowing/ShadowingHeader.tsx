import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, Check } from 'lucide-react';
import { useShadowingPlayer } from './ShadowingPlayerContext';
import { toggleShadowingProgressAction } from '@/actions/shadowing.action';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ShadowingHeaderProps {
  userId?: string;
  videoId?: string;
  initialCompleted?: boolean;
}

export function ShadowingHeader({ userId, videoId, initialCompleted = false }: ShadowingHeaderProps) {
  const { isDesktopSidebarOpen, setIsDesktopSidebarOpen } = useShadowingPlayer();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);

  const handleToggleComplete = async () => {
    if (!userId || !videoId) return;
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    const res = await toggleShadowingProgressAction(userId, videoId, nextState);
    if (!res.success) {
      setIsCompleted(!nextState); // revert
      toast.error('Không thể cập nhật tiến trình: ' + (res.error || 'Có lỗi xảy ra'));
    } else {
      toast.success(nextState ? 'Đã đánh dấu hoàn thành video!' : 'Đã bỏ đánh dấu hoàn thành!');
    }
  };
  
  return (
    <div className="flex items-center justify-between mb-8">
      <Link href="/shadowing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group font-semibold text-sm">
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Back to Shadowing
      </Link>

      <div className="flex gap-2">
        {userId && videoId && (
          <button
            onClick={handleToggleComplete}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer",
              isCompleted 
                ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-sm" 
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            <Check className="h-4 w-4" />
            <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
          </button>
        )}

        <button
          onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          className="hidden lg:flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold hover:bg-muted transition-all cursor-pointer"
        >
          <Menu className="h-4 w-4 text-primary" />
          <span>{isDesktopSidebarOpen ? 'Cinema View (Ẩn transcript)' : 'Hiện transcript'}</span>
        </button>
      </div>
    </div>
  );
}
