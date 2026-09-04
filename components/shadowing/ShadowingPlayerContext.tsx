'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CustomVideoPlayerRef } from '@/components/CustomVideoPlayer';

// Types
export interface TranscriptLine {
  start: number;
  end: number;
  text: string;
}

export interface ShadowingVideoData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  transcript: string;
}

interface ShadowingContextType {
  shadowingVideo: ShadowingVideoData;
  lines: TranscriptLine[];
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  activeLineIdx: number | null;
  setActiveLineIdx: React.Dispatch<React.SetStateAction<number | null>>;
  recordings: Record<number, string>;
  setRecordings: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  recordingIndex: number | null;
  setRecordingIndex: React.Dispatch<React.SetStateAction<number | null>>;
  isPlayingRecordingIdx: number | null;
  setIsPlayingRecordingIdx: React.Dispatch<React.SetStateAction<number | null>>;
  isAbLoop: boolean;
  setIsAbLoop: React.Dispatch<React.SetStateAction<boolean>>;
  playbackSpeed: number;
  setPlaybackSpeed: React.Dispatch<React.SetStateAction<number>>;
  videoHeight: number;
  setVideoHeight: React.Dispatch<React.SetStateAction<number>>;
  isDesktopSidebarOpen: boolean;
  setIsDesktopSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Refs
  playerRef: React.RefObject<CustomVideoPlayerRef | null>;
  videoContainerRef: React.RefObject<HTMLDivElement | null>;
  desktopContainerRef: React.RefObject<HTMLDivElement | null>;
  mobileContainerRef: React.RefObject<HTMLDivElement | null>;
  desktopLineRefs: React.RefObject<Record<number, HTMLDivElement | null>>;
  mobileLineRefs: React.RefObject<Record<number, HTMLDivElement | null>>;

  // Actions
  seekToTime: (time: number) => void;
  changeSpeed: (speed: number) => void;
  speakText: (text: string) => void;
  startRecording: (idx: number) => Promise<void>;
  stopRecording: () => Promise<void>;
  playRecording: (idx: number) => void;
  formatTime: (time: number) => string;
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

const ShadowingContext = createContext<ShadowingContextType | undefined>(undefined);

export function useShadowingPlayer() {
  const context = useContext(ShadowingContext);
  if (!context) {
    throw new Error('useShadowingPlayer must be used within a ShadowingPlayerProvider');
  }
  return context;
}

export function ShadowingPlayerProvider({
  shadowingVideo,
  children
}: {
  shadowingVideo: ShadowingVideoData;
  children: React.ReactNode;
}) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [isPlayingRecordingIdx, setIsPlayingRecordingIdx] = useState<number | null>(null);
  const [isAbLoop, setIsAbLoop] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoHeight, setVideoHeight] = useState<number>(0);

  // Refs
  const playerRef = useRef<CustomVideoPlayerRef | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopLineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const mobileLineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // Parse transcript on mount or video change
  useEffect(() => {
    const parsed = parseTranscript(shadowingVideo.transcript);
    if (parsed.length > 0) {
      setLines(parsed);
    } else {
      setLines(generateFallbackTranscript(shadowingVideo.description));
    }
    setRecordings({});
    setActiveLineIdx(null);
  }, [shadowingVideo.transcript, shadowingVideo.description]);

  // Manage current line highlight & auto-scroll (Container-only scroll, never moves window/page)
  useEffect(() => {
    if (lines.length === 0) return;
    
    const activeIdx = lines.findIndex(
      (line) => currentTime >= line.start && currentTime < line.end
    );

    if (activeIdx !== -1 && activeIdx !== activeLineIdx) {
      setActiveLineIdx(activeIdx);
      
      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth >= 1024;
        const container = isDesktop ? desktopContainerRef.current : mobileContainerRef.current;
        const lineRefs = isDesktop ? desktopLineRefs.current : mobileLineRefs.current;
        const activeElement = lineRefs[activeIdx];

        if (container && activeElement) {
          const elementTop = activeElement.offsetTop;
          const elementHeight = activeElement.offsetHeight;
          const containerHeight = container.clientHeight;
          const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);

          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentTime, lines, activeLineIdx]);

  // Measure video height for desktop transcript height match
  useEffect(() => {
    if (!videoContainerRef.current) return;

    const updateHeight = () => {
      if (videoContainerRef.current) {
        setVideoHeight(videoContainerRef.current.offsetHeight);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(videoContainerRef.current);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [isDesktopSidebarOpen]);

  // AB-Loop checking
  useEffect(() => {
    if (!isAbLoop || activeLineIdx === null || lines.length === 0) return;
    const activeLine = lines[activeLineIdx];
    
    if (currentTime >= activeLine.end) {
      seekToTime(activeLine.start);
    }
  }, [currentTime, isAbLoop, activeLineIdx, lines]);

  // Player APIs
  const seekToTime = (time: number) => {
    setCurrentTime(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time);
      playerRef.current.play();
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setPlaybackSpeed(speed);
    }
  };

  // TTS
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  // Recording
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
      
      if (playerRef.current) {
        playerRef.current.pause();
      }
    } catch (err) {
      alert("Vui lòng cấp quyền micro để ghi âm giọng nói!");
      console.error(err);
    }
  };

  const stopRecording = () => {
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordings(prev => ({ ...prev, [recordingIndex as number]: audioUrl }));
          setRecordingIndex(null);
          
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
    <ShadowingContext.Provider
      value={{
        shadowingVideo,
        lines,
        currentTime,
        setCurrentTime,
        activeLineIdx,
        setActiveLineIdx,
        recordings,
        setRecordings,
        recordingIndex,
        setRecordingIndex,
        isPlayingRecordingIdx,
        setIsPlayingRecordingIdx,
        isAbLoop,
        setIsAbLoop,
        playbackSpeed,
        setPlaybackSpeed,
        videoHeight,
        setVideoHeight,
        isDesktopSidebarOpen,
        setIsDesktopSidebarOpen,
        playerRef,
        videoContainerRef,
        desktopContainerRef,
        mobileContainerRef,
        desktopLineRefs,
        mobileLineRefs,
        seekToTime,
        changeSpeed,
        speakText,
        startRecording,
        stopRecording,
        playRecording,
        formatTime
      }}
    >
      {children}
    </ShadowingContext.Provider>
  );
}
