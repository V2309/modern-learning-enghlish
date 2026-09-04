'use client';

import React from 'react';
import { RotateCcw, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomVideoPlayer } from '@/components/CustomVideoPlayer';
import { useShadowingPlayer } from './ShadowingPlayerContext';

export function ShadowingVideoPlayer() {
  const {
    shadowingVideo,
    playbackSpeed,
    changeSpeed,
    setCurrentTime,
    playerRef,
    videoContainerRef,
    isAbLoop,
    setIsAbLoop
  } = useShadowingPlayer();

  return (
    <div className="flex flex-col w-full p-0 m-0">
      {/* Video Player Section - Flush at top */}
      <div ref={videoContainerRef} className="aspect-video w-full bg-black relative shrink-0">
        <CustomVideoPlayer
          key={shadowingVideo.videoUrl}
          ref={playerRef}
          url={shadowingVideo.videoUrl}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={changeSpeed}
          onTimeUpdate={setCurrentTime}
          className="w-full h-full border-0 rounded-none"
        />
      </div>

      {/* Loop toolbar & speed controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-card border-t border-b border-border gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* AB Loop Button */}
          <button
            type="button"
            onClick={() => setIsAbLoop(!isAbLoop)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer",
              isAbLoop 
                ? "bg-brand text-white border-brand shadow-xs" 
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            )}
            title="Tự động lặp lại câu đang phát"
          >
            <RotateCcw className={cn("h-3.5 w-3.5", isAbLoop && "animate-spin-slow")} />
            <span>Lặp câu (A-B)</span>
          </button>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1 border border-border/60 bg-muted/40 rounded-lg p-0.5">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => changeSpeed(speed)}
                className={cn(
                  "px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
                  playbackSpeed === speed
                    ? "bg-card text-brand font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {speed === 1.0 ? '1x' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground truncate max-w-xs font-medium">
          {shadowingVideo.title}
        </div>
      </div>

      {/* Video Details & Instruction Section - Smooth flow */}
      <div className="p-5 sm:p-6 space-y-4 bg-card/20">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-md">
            Luyện Shadowing Phản Xạ
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight pt-1">
            {shadowingVideo.title}
          </h1>
        </div>
        
        {/* Method guidance */}
        <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2 text-xs">
          <h4 className="font-semibold text-foreground flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-brand" />
            Hướng dẫn luyện tập 4 bước
          </h4>

          <ul className="text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong className="text-foreground font-medium">Nghe &amp; Bắt chước:</strong> Lắng nghe phát âm và nói đuổi theo ngay lập tức.
            </li>
            <li>
              <strong className="text-foreground font-medium">Đồng bộ câu chữ:</strong> Transcript bên cạnh sẽ tự động sáng lên và cuộn theo từng câu.
            </li>
            <li>
              <strong className="text-foreground font-medium">Click để tua câu:</strong> Bấm trực tiếp vào câu bất kỳ trong transcript để nghe lại.
            </li>
            <li>
              <strong className="text-foreground font-medium">Thu âm &amp; So sánh:</strong> Bấm <strong className="text-brand font-semibold">Luyện nói</strong> để ghi âm và <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Nghe lại</strong> để tự đánh giá.
            </li>
          </ul>
        </div>

        {shadowingVideo.description && (
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Ghi chú bài học
            </span>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {shadowingVideo.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
