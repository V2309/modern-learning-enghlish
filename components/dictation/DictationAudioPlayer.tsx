"use client";

import React, { useRef, useEffect } from "react";

interface DictationAudioPlayerProps {
  audioUrl: string;
  onAudioEnd?: () => void;
}

export default function DictationAudioPlayer({ audioUrl, onAudioEnd }: DictationAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  return (
    <div className="w-full bg-card p-1 rounded-2xl flex justify-center items-center">
      <audio
        ref={audioRef}
        src={audioUrl}
        controls
        onEnded={onAudioEnd}
        className="w-full focus:outline-none"
        controlsList="nodownload"
      />
    </div>
  );
}
