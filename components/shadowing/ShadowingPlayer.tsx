'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Mic, Square, PlayCircle, SkipForward, HelpCircle, ArrowLeft, Settings, Info } from 'lucide-react';
import { parseYouTubeUrl } from '@/components/course/AddLessonModal';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Declare global YT interface
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface TranscriptLine {
  start: number;
  end: number;
  text: string;
}

interface ShadowingPlayerProps {
  shadowingVideo: {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string;
    transcript: string;
  };
  onBack?: () => void;
}

export function parseTranscript(text: string): TranscriptLine[] {
  if (!text) return [];
  
  if (text.includes('-->')) {
    return parseSRT(text);
  }
  
  const lines = text.split('\n');
  const result: TranscriptLine[] = [];
  const timeRegex = /(?:\[?(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?\]?)/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const match = line.match(timeRegex);
    if (match) {
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      let ms = 0;
      
      if (match[3] !== undefined) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        seconds = parseInt(match[3]);
      } else {
        minutes = parseInt(match[1]);
        seconds = parseInt(match[2]);
      }
      
      if (match[4] !== undefined) {
        const msStr = match[4];
        if (msStr.length === 1) ms = parseInt(msStr) * 100;
        else if (msStr.length === 2) ms = parseInt(msStr) * 10;
        else ms = parseInt(msStr);
      }
      
      const startTime = hours * 3600 + minutes * 60 + seconds + ms / 1000;
      const rawText = line.replace(timeRegex, '').replace(/^[:-]\s*/, '').trim();
      
      result.push({
        start: startTime,
        end: startTime + 4,
        text: rawText,
      });
    }
  }
  
  for (let i = 0; i < result.length - 1; i++) {
    result[i].end = result[i + 1].start;
  }
  
  return result;
}

/**
 * Merge consecutive short transcript lines into longer, natural sentences.
 * @param lines - raw parsed lines
 * @param mode - 'short' (no merge), 'medium' (~8s chunks), 'full' (merge until sentence end)
 */
export function mergeTranscriptLines(
  lines: TranscriptLine[],
  mode: 'short' | 'medium' | 'full'
): TranscriptLine[] {
  if (lines.length === 0 || mode === 'short') return lines;

  const result: TranscriptLine[] = [];
  let i = 0;

  while (i < lines.length) {
    let merged = { ...lines[i] };
    let j = i + 1;

    if (mode === 'medium') {
      // Merge until combined duration >= ~8 seconds or sentence ends with punctuation
      while (j < lines.length) {
        const duration = lines[j].end - merged.start;
        const prevText = merged.text.trim();
        // Stop merging if sentence already ends cleanly AND we've got at least ~4s
        if (/[.!?]$/.test(prevText) && duration >= 4) break;
        // Stop merging if chunk would be too long (>10s)
        if (duration > 10) break;
        merged = {
          start: merged.start,
          end: lines[j].end,
          text: merged.text.trimEnd() + ' ' + lines[j].text.trimStart(),
        };
        j++;
      }
    } else if (mode === 'full') {
      // Merge until we hit a sentence-ending punctuation, with a max of ~15s
      while (j < lines.length) {
        const duration = lines[j].end - merged.start;
        const prevText = merged.text.trim();
        // Stop if current merged text ends with sentence punctuation
        if (/[.!?]$/.test(prevText)) break;
        // Safety cap: don't let a single chunk exceed ~15s
        if (duration > 15) break;
        merged = {
          start: merged.start,
          end: lines[j].end,
          text: merged.text.trimEnd() + ' ' + lines[j].text.trimStart(),
        };
        j++;
      }
    }

    result.push(merged);
    i = j;
  }

  return result;
}

function parseSRT(text: string): TranscriptLine[] {
  const blocks = text.trim().split(/\r?\n\r?\n/);
  const result: TranscriptLine[] = [];
  const timeRegex = /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/;
  
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length < 2) continue;
    
    let timeIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timeIndex = i;
        break;
      }
    }
    
    if (timeIndex === -1) continue;
    
    const timeMatch = lines[timeIndex].match(timeRegex);
    if (!timeMatch) continue;
    
    const startSec = 
      parseInt(timeMatch[1]) * 3600 + 
      parseInt(timeMatch[2]) * 60 + 
      parseInt(timeMatch[3]) + 
      parseInt(timeMatch[4]) / 1000;
      
    const endSec = 
      parseInt(timeMatch[5]) * 3600 + 
      parseInt(timeMatch[6]) * 60 + 
      parseInt(timeMatch[7]) + 
      parseInt(timeMatch[8]) / 1000;
      
    const textLines = lines.slice(timeIndex + 1);
    const content = textLines.join(' ').trim();
    
    result.push({
      start: startSec,
      end: endSec,
      text: content
    });
  }
  
  return result;
}

function generateFallbackTranscript(description: string | null): TranscriptLine[] {
  const desc = description || "Chào mừng đến với bài luyện nói tiếng Anh Shadowing. Hãy bắt đầu luyện tập nào.";
  const cleanText = desc.replace(/[#*`_-]/g, '').trim();
  const sentences = cleanText.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return [{ start: 0, end: 10, text: desc }];
  }
  
  return sentences.map((sentence, idx) => ({
    start: idx * 6,
    end: (idx + 1) * 6,
    text: sentence.trim() + "."
  }));
}

export function ShadowingPlayer({ shadowingVideo, onBack }: ShadowingPlayerProps) {
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  
  // Chunk size mode: 'short' = raw, 'medium' = ~8s groups, 'full' = full sentences
  const [chunkMode, setChunkMode] = useState<'short' | 'medium' | 'full'>('medium');

  // Media recorder states
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [isPlayingRecordingIdx, setIsPlayingRecordingIdx] = useState<number | null>(null);
  
  // Control states
  const [isAbLoop, setIsAbLoop] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  // YouTube states
  const [isYtReady, setIsYtReady] = useState(false);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [ytState, setYtState] = useState<number>(-1); // -1: unstarted, 1: playing, 2: paused
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  const ytInfo = parseYouTubeUrl(shadowingVideo.videoUrl);
  const isYouTube = !!ytInfo;

  // 1. Load YouTube Script if needed
  useEffect(() => {
    if (isYouTube && typeof window !== 'undefined') {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          setIsYtReady(true);
        };
      } else {
        setIsYtReady(true);
      }
    }
  }, [isYouTube]);

  // 2. Instantiate YouTube Player
  useEffect(() => {
    if (!isYouTube || !isYtReady || !ytInfo) return;

    let player: any;
    const container = document.getElementById('youtube-shadow-player');
    if (!container) return;

    container.innerHTML = '';
    const innerDiv = document.createElement('div');
    innerDiv.id = 'yt-player-inner';
    container.appendChild(innerDiv);

    player = new window.YT.Player('yt-player-inner', {
      videoId: ytInfo.videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: (event: any) => {
          setYtPlayer(event.target);
          event.target.setPlaybackRate(playbackSpeed);
        },
        onStateChange: (event: any) => {
          setYtState(event.data);
        }
      }
    });

    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
      setYtPlayer(null);
    };
  }, [isYouTube, isYtReady, ytInfo?.videoId]);

  // 3. Set speed for YT
  useEffect(() => {
    if (ytPlayer && typeof ytPlayer.setPlaybackRate === 'function') {
      ytPlayer.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, ytPlayer]);

  // 4. Parse transcript (re-merge when chunkMode changes)
  useEffect(() => {
    const parsed = parseTranscript(shadowingVideo.transcript);
    if (parsed.length > 0) {
      setLines(mergeTranscriptLines(parsed, chunkMode));
    } else {
      setLines(generateFallbackTranscript(shadowingVideo.description));
    }
    // Reset recordings when chunk mode changes (indices shift)
    setRecordings({});
    setActiveLineIdx(null);
  }, [shadowingVideo.transcript, shadowingVideo.description, chunkMode]);

  // 5. Track Time & AB-Loop for YouTube (interval polling when playing)
  useEffect(() => {
    if (!isYouTube || !ytPlayer || ytState !== 1) return;

    const interval = setInterval(() => {
      const time = ytPlayer.getCurrentTime();
      setCurrentTime(time);
    }, 100);

    return () => clearInterval(interval);
  }, [isYouTube, ytPlayer, ytState]);

  // 6. Manage current line highlighted state
  useEffect(() => {
    if (lines.length === 0) return;
    
    // Find matching index
    const activeIdx = lines.findIndex(
      (line) => currentTime >= line.start && currentTime < line.end
    );

    if (activeIdx !== -1 && activeIdx !== activeLineIdx) {
      setActiveLineIdx(activeIdx);
      
      // Auto scroll
      const activeElement = lineRefs.current[activeIdx];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentTime, lines, activeLineIdx]);

  // 7. AB-Loop checking
  useEffect(() => {
    if (!isAbLoop || activeLineIdx === null || lines.length === 0) return;
    const activeLine = lines[activeLineIdx];
    
    if (currentTime >= activeLine.end) {
      seekToTime(activeLine.start);
    }
  }, [currentTime, isAbLoop, activeLineIdx, lines]);

  const seekToTime = (time: number) => {
    setCurrentTime(time);
    if (isYouTube && ytPlayer) {
      ytPlayer.seekTo(time, true);
      if (ytState !== 1) {
        ytPlayer.playVideo();
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (videoRef.current.paused) {
        void videoRef.current.play();
      }
    }
  };

  const handleTimeUpdateDirect = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // 8. TTS Voice guidance
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  // 9. Recorder APIs
  const startRecording = async (idx: number) => {
    try {
      if (recordingIndex !== null) {
        await stopRecording();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings(prev => ({ ...prev, [idx]: audioUrl }));
        setRecordingIndex(null);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingIndex(idx);
      
      // Auto pause video when recording
      if (isYouTube && ytPlayer) {
        ytPlayer.pauseVideo();
      } else if (videoRef.current) {
        videoRef.current.pause();
      }
    } catch (err) {
      alert("Vui lòng cấp quyền micro để ghi âm giọng nói!");
      console.error(err);
    }
  };

  const stopRecording = () => {
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = (e) => {
          // Trigger standard stop handler
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordings(prev => ({ ...prev, [recordingIndex as number]: audioUrl }));
          setRecordingIndex(null);
          
          // Stop stream tracks
          const stream = mediaRecorderRef.current?.stream;
          stream?.getTracks().forEach(track => track.stop());
          resolve();
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve();
      }
    });
  };

  const playRecording = (idx: number) => {
    const audioUrl = recordings[idx];
    if (!audioUrl) return;

    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }

    setIsPlayingRecordingIdx(idx);
    const audio = new Audio(audioUrl);
    audioPlaybackRef.current = audio;
    
    audio.onended = () => {
      setIsPlayingRecordingIdx(null);
    };

    void audio.play().catch(() => {
      setIsPlayingRecordingIdx(null);
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60 shrink-0 gap-4 mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{shadowingVideo.title}</h1>
            <p className="text-xs text-muted-foreground leading-none mt-1">Chế độ Shadowing: Luyện nói đuổi theo phụ đề thực tế</p>
          </div>
        </div>

        {/* Global Toolbar Options */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Chunk size selector */}
          <div className="flex items-center gap-1 border border-border bg-card rounded-xl p-1" title="Cỡ câu: gộp các dòng ngắn lại để thu âm dễ hơn">
            {([
              { key: 'short', label: 'Ngắn' },
              { key: 'medium', label: 'Vừa' },
              { key: 'full', label: 'Dài' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setChunkMode(key)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  chunkMode === key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* AB Loop Button */}
          <button
            onClick={() => setIsAbLoop(!isAbLoop)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
              isAbLoop 
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20" 
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            )}
            title="Tự động lặp lại câu đang phát"
          >
            <RotateCcw className={cn("h-3.5 w-3.5", isAbLoop && "animate-spin-slow")} />
            <span>Lặp Câu (A-B)</span>
          </button>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1 border border-border bg-card rounded-xl p-1">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => changeSpeed(speed)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  playbackSpeed === speed
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {speed === 1.0 ? '1x' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid lg:grid-cols-10 gap-6 flex-1 min-h-0">

        {/* Left Side: Video Player (7/10) */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
          {/* The Video Wrapper */}
          <div className="aspect-video rounded-[2rem] bg-black border border-border overflow-hidden shadow-2xl relative">
            {isYouTube ? (
              <div
                id="youtube-shadow-player"
                className="w-full h-full"
                key={shadowingVideo.videoUrl}
              />
            ) : (
              <video
                ref={videoRef}
                src={shadowingVideo.videoUrl}
                controls
                onTimeUpdate={handleTimeUpdateDirect}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Description & Instruction Card */}
          <div className="flex-1 bg-card border border-border rounded-[2rem] p-6 overflow-y-auto space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Hướng Dẫn Luyện Shadowing
            </h3>

            <ul className="text-xs text-muted-foreground space-y-2.5 list-disc pl-4">
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

            {shadowingVideo.description && (
              <div className="pt-4 border-t border-border mt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Ghi chú bài học</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{shadowingVideo.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Transcript (3/10) */}
        <div className="lg:col-span-3 flex flex-col min-h-0 bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
          {/* Transcript pane header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/50 shrink-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Transcript ({lines.length})
            </span>
            <div className="text-[10px] font-mono text-muted-foreground bg-muted border border-border/80 px-2 py-0.5 rounded-full">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Scrolling area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scroll-smooth"
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
                    "group relative p-3 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-2",
                    isActive
                      ? "bg-primary/5 border-primary/30 shadow-sm relative overflow-hidden"
                      : "bg-transparent border-transparent opacity-45 hover:opacity-100 hover:bg-muted/30"
                  )}
                >
                  {/* Active highlight dot glow */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" />
                  )}

                  {/* Timing indicator */}
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground/60">
                    <span>Câu {idx + 1}</span>
                    <span>{formatTime(line.start)} → {formatTime(line.end)}</span>
                  </div>

                  {/* The sentence text */}
                  <p className={cn(
                    "text-sm leading-relaxed select-none transition-colors duration-300",
                    isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"
                  )}>
                    {line.text}
                  </p>

                  {/* Playback & Practice Action Controls (Visible always when active, or on hover) */}
                  <div className={cn(
                    "flex items-center gap-2 transition-all duration-300 shrink-0",
                    isActive ? "opacity-100 mt-1" : "opacity-0 group-hover:opacity-100 mt-1 pointer-events-none group-hover:pointer-events-auto"
                  )}
                  onClick={(e) => e.stopPropagation() /* Prevent double clicking seeking */}
                  >
                    {/* Speak TTS sentence button */}
                    <button
                      onClick={() => speakText(line.text)}
                      className="p-2 bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all cursor-pointer"
                      title="Phát giọng mẫu AI (TTS)"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>

                    {/* Record user voice */}
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

                    {/* Replay User voice */}
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

      </div>
    </div>
  );
}
