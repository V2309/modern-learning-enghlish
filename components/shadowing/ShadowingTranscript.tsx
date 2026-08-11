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
    <div className="flex flex-col h-full bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 bg-muted/40 border-b border-border/50 shrink-0">
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-primary" />
          Transcript ({lines.length})
        </span>
        <div className="text-xs font-mono font-medium text-muted-foreground bg-muted border border-border/80 px-3 py-1 rounded-full">
          {formatTime(currentTime)}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scroll-smooth"
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
                "group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-2.5",
                isActive
                  ? "bg-primary/5 border-primary/30 shadow-sm relative overflow-hidden"
                  : "bg-transparent border-transparent opacity-50 hover:opacity-100 hover:bg-muted/30"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" />
              )}

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground/60">
                <span>Câu {idx + 1}</span>
                <span>{formatTime(line.start)} → {formatTime(line.end)}</span>
              </div>

              <p className={cn(
                "text-sm leading-relaxed select-none transition-colors duration-300",
                isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"
              )}>
                {line.text}
              </p>

              <div className={cn(
                "flex items-center gap-2 transition-all duration-300 shrink-0",
                isActive ? "opacity-100 mt-1" : "opacity-0 group-hover:opacity-100 mt-1 pointer-events-none group-hover:pointer-events-auto"
              )}
              onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => speakText(line.text)}
                  className="p-2 bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all cursor-pointer"
                  title="Phát giọng mẫu AI (TTS)"
                >
                  <Volume2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => isRecordingThis ? stopRecording() : startRecording(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer",
                    isRecordingThis
                      ? "bg-red-500 text-white border-red-500 animate-pulse"
                      : "bg-card text-muted-foreground border-border hover:text-red-500 hover:border-red-500/30"
                  )}
                  title={isRecordingThis ? "Dừng ghi âm" : "Ghi âm giọng của bạn"}
                >
                  {isRecordingThis ? <Square className="h-3.5 w-3.5 fill-current" /> : <Mic className="h-3.5 w-3.5" />}
                  <span>{isRecordingThis ? "Đang Ghi..." : "Luyện Nói"}</span>
                </button>

                {hasRecorded && (
                  <button
                    onClick={() => playRecording(idx)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer",
                      isPlayingRecord
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                    )}
                    title="Nghe lại bản thu của bạn"
                  >
                    <PlayCircle className={cn("h-3.5 w-3.5", isPlayingRecord && "animate-pulse")} />
                    <span>Nghe Lại</span>
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
