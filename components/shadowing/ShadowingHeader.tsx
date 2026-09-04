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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-border/60 gap-3">
      <Link href="/shadowing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group font-medium text-xs sm:text-sm">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại danh sách Shadowing</span>
      </Link>

      <div className="flex items-center gap-2">
        {userId && videoId && (
          <button
            type="button"
            onClick={handleToggleComplete}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 border rounded-xl text-xs font-medium transition-colors cursor-pointer",
              isCompleted 
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15" 
                : "bg-card text-foreground border-border hover:bg-muted hover:border-brand/40"
            )}
          >
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <Menu className="h-3.5 w-3.5 text-brand" />
          <span>{isDesktopSidebarOpen ? 'Thu gọn Transcript' : 'Hiện Transcript'}</span>
        </button>
      </div>
    </div>
  );
}
