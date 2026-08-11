'use client';

import React from 'react';
import { RotateCcw, Settings } from 'lucide-react';
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
    <>
      {/* Video Player Section */}
      <div ref={videoContainerRef} className="aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-2xl bg-black">
        <CustomVideoPlayer
          key={shadowingVideo.videoUrl}
          ref={playerRef}
          url={shadowingVideo.videoUrl}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={changeSpeed}
          onTimeUpdate={setCurrentTime}
          className="w-full h-full border-0"
        />
      </div>

      {/* Loop toolbar & speed controls */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-card border border-border rounded-2xl gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* AB Loop Button */}
          <button
            onClick={() => setIsAbLoop(!isAbLoop)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
              isAbLoop 
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20" 
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground"
            )}
            title="Tự động lặp lại câu đang phát"
          >
            <RotateCcw className={cn("h-3.5 w-3.5", isAbLoop && "animate-spin-slow")} />
            <span>Lặp Câu (A-B)</span>
          </button>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1 border border-border bg-muted rounded-xl p-1">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => changeSpeed(speed)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  playbackSpeed === speed
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {speed === 1.0 ? '1x' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-semibold">
          Đang phát: <span className="text-foreground">{shadowingVideo.title}</span>
        </div>
      </div>

      {/* Description & Instruction Card */}
      <div className="p-10 rounded-[2.5rem] bg-card border border-border space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4 underline decoration-primary decoration-4 underline-offset-8">
            {shadowingVideo.title}
          </h1>
          
          <div className="mt-8 p-6 rounded-2xl bg-muted/40 border border-border/50 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Hướng Dẫn Luyện Shadowing
            </h4>

            <ul className="text-sm text-muted-foreground space-y-3 list-disc pl-5">
              <li>
                <strong className="text-foreground">Nghe và Bắt Chước:</strong> Nhấn nút Play video. Lắng nghe phát âm, ngữ điệu, nhịp điệu của người bản xứ và nói đuổi theo ngay lập tức.
              </li>
              <li>
                <strong className="text-foreground">Đồng Bộ Thực Tế:</strong> Chữ bên phải sẽ tự sáng lên và cuộn tới câu đang được nói trên video.
              </li>
              <li>
                <strong className="text-foreground">Nhấp Để Phát Lại:</strong> Bạn có thể click trực tiếp vào bất kỳ dòng chữ nào để video nhảy ngay tới câu đó.
              </li>
              <li>
                <strong className="text-foreground">Tự Lặp Câu:</strong> Bật <strong className="text-primary">Lặp Câu (A-B)</strong> để tự động lặp đi lặp lại một câu duy nhất đến khi bạn nói chuẩn.
              </li>
              <li>
                <strong className="text-foreground">Luyện Nói &amp; So Sánh:</strong> Bấm <strong className="text-primary">Luyện Nói</strong> để ghi âm giọng của bạn, rồi bấm <strong className="text-emerald-500">Nghe Lại</strong> để tự so sánh với giọng mẫu.
              </li>
            </ul>
          </div>

          {shadowingVideo.description && (
            <div className="pt-6 border-t border-border mt-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3">Ghi chú bài học</span>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-5 rounded-2xl border border-border/50">{shadowingVideo.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
