'use client';

import React from 'react';
import { Info, Volume2, Square, Mic, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShadowingPlayer } from './ShadowingPlayerContext';

export function ShadowingTranscript({ isMobile }: { isMobile: boolean }) {
  const {
    lines,
    currentTime,
    activeLineIdx,
    recordings,
    recordingIndex,
    isPlayingRecordingIdx,
    seekToTime,
    speakText,
    startRecording,
    stopRecording,
    playRecording,
    formatTime,
    desktopContainerRef,
    mobileContainerRef,
    desktopLineRefs,
    mobileLineRefs
  } = useShadowingPlayer();

  const containerRef = isMobile ? mobileContainerRef : desktopContainerRef;
  const lineRefs = isMobile ? mobileLineRefs : desktopLineRefs;

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden select-none p-0 m-0">
      {/* Transcript Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-card/60 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Info className="h-4 w-4 text-brand" />
          Transcript ({lines.length} câu)
        </span>
        <div className="text-[11px] font-mono text-muted-foreground bg-muted/60 border border-border px-2.5 py-0.5 rounded-md">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Transcript Scrolling Line List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2.5 scroll-smooth scrollbar-thin relative"
      >
        {lines.map((line, idx) => {
          const isActive = activeLineIdx === idx;
          const hasRecorded = !!recordings[idx];
          const isRecordingThis = recordingIndex === idx;
          const isPlayingRecord = isPlayingRecordingIdx === idx;

          return (
            <div
              key={idx}
              ref={el => { lineRefs.current[idx] = el; }}
              onClick={() => seekToTime(line.start)}
              className={cn(
                "group relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2",
                isActive
                  ? "bg-brand/8 border-brand/30 shadow-2xs relative overflow-hidden"
                  : "bg-card/40 border-border/50 hover:bg-muted/40 hover:border-border"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-l-xl" />
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="font-semibold text-brand/80">Câu {idx + 1}</span>
                <span>{formatTime(line.start)} &rarr; {formatTime(line.end)}</span>
              </div>

              <p className={cn(
                "text-xs sm:text-sm leading-relaxed select-none transition-colors duration-200",
                isActive ? "font-semibold text-foreground" : "font-normal text-foreground/75 group-hover:text-foreground"
              )}>
                {line.text}
              </p>

              <div className={cn(
                "flex items-center gap-1.5 transition-all duration-200 shrink-0 pt-1",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              )}
              onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => speakText(line.text)}
                  className="p-1.5 bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors cursor-pointer"
                  title="Phát giọng mẫu AI (TTS)"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => isRecordingThis ? stopRecording() : startRecording(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-all cursor-pointer",
                    isRecordingThis
                      ? "bg-rose-500 text-white border-rose-500 animate-pulse shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:text-rose-500 hover:border-rose-500/30"
                  )}
                  title={isRecordingThis ? "Dừng ghi âm" : "Ghi âm giọng của bạn"}
                >
                  {isRecordingThis ? <Square className="h-3 w-3 fill-current" /> : <Mic className="h-3 w-3" />}
                  <span>{isRecordingThis ? "Đang ghi..." : "Luyện nói"}</span>
                </button>

                {hasRecorded && (
                  <button
                    type="button"
                    onClick={() => playRecording(idx)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-all cursor-pointer",
                      isPlayingRecord
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                    )}
                    title="Nghe lại bản thu của bạn"
                  >
                    <PlayCircle className={cn("h-3 w-3", isPlayingRecord && "animate-pulse")} />
                    <span>Nghe lại</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
