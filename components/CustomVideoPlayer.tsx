'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useId,
} from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Declare global YT interface
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

// Helper to parse YouTube URL and extract Video ID
function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Format seconds into MM:SS
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export interface CustomVideoPlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
}

interface CustomVideoPlayerProps {
  url: string;
  poster?: string;
  playbackSpeed?: number;
  onPlaybackSpeedChange?: (speed: number) => void;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

// Global script loading state and promise for YT API
let ytApiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (!ytApiPromise) {
    ytApiPromise = new Promise<void>((resolve) => {
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        resolve();
      };

      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  return ytApiPromise;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export const CustomVideoPlayer = forwardRef<CustomVideoPlayerRef, CustomVideoPlayerProps>(
  (
    {
      url,
      poster,
      playbackSpeed: externalSpeed,
      onPlaybackSpeedChange,
      onTimeUpdate,
      className,
    },
    ref
  ) => {
    const videoId = parseYouTubeId(url);
    const isYouTube = !!videoId;

    // Element Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const uniqueId = useId();
    const ytContainerId = `yt-player-${uniqueId.replace(/:/g, '')}`;

    // State variables
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [speed, setSpeed] = useState(externalSpeed || 1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
    const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);

    // YT Player Reference
    const ytPlayerRef = useRef<any>(null);
    const ytIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

    const getOrigin = () => {
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return '';
    };

    // Initialize YouTube Player
    useEffect(() => {
      if (!isYouTube || !videoId) return;

      let destroyed = false;

      loadYouTubeIframeAPI().then(() => {
        if (destroyed) return;

        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch (e) {
            console.error(e);
          }
          ytPlayerRef.current = null;
        }

        const playerDiv = document.getElementById(ytContainerId);
        if (!playerDiv) return;

        ytPlayerRef.current = new window.YT.Player(ytContainerId, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            fs: 1,
            origin: getOrigin(),
          },
          events: {
            onReady: (event: any) => {
              if (destroyed) return;
              event.target.setPlaybackRate(speed);
              setDuration(event.target.getDuration() || 0);
            },
            onStateChange: (event: any) => {
              if (destroyed) return;
              const state = event.data;
              if (state === 1) {
                setIsPlaying(true);
                startYtTracking();
              } else {
                setIsPlaying(false);
                stopYtTracking();
              }
            },
          },
        });
      });

      return () => {
        destroyed = true;
        stopYtTracking();
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch (e) {}
          ytPlayerRef.current = null;
        }
      };
    }, [videoId]);

    // Tracking current playback time for YouTube Player
    const startYtTracking = () => {
      stopYtTracking();
      ytIntervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const time = ytPlayerRef.current.getCurrentTime();
          setCurrentTime(time);
          if (onTimeUpdate) onTimeUpdate(time);

          const dur = ytPlayerRef.current.getDuration();
          if (dur && dur !== duration) {
            setDuration(dur);
          }
        }
      }, 250);
    };

    const stopYtTracking = () => {
      if (ytIntervalRef.current) {
        clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    };

    // Sync Playback Speed
    const handleSetSpeed = (newSpeed: number) => {
      setSpeed(newSpeed);
      setShowSpeedMenu(false);
      if (onPlaybackSpeedChange) onPlaybackSpeedChange(newSpeed);

      if (isYouTube) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
          ytPlayerRef.current.setPlaybackRate(newSpeed);
        }
      } else {
        if (videoRef.current) {
          videoRef.current.playbackRate = newSpeed;
        }
      }
    };

    // Handle HTML5 Video Events
    const handleHtml5TimeUpdate = () => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        setCurrentTime(time);
        if (onTimeUpdate) onTimeUpdate(time);
      }
    };

    const handleHtml5LoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration || 0);
      }
    };

    const handleHtml5Play = () => setIsPlaying(true);
    const handleHtml5Pause = () => setIsPlaying(false);

    // Core Controls Actions
    const togglePlay = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      if (isYouTube) {
        if (ytPlayerRef.current) {
          if (isPlaying) {
            ytPlayerRef.current.pauseVideo();
          } else {
            ytPlayerRef.current.playVideo();
          }
        }
      } else {
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            void videoRef.current.play();
          }
        }
      }
    };

    // Rewind / Forward by seconds (e.g. 10s)
    const handleSeekRelative = (deltaSeconds: number, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const newTime = Math.max(0, Math.min(duration || 1000, currentTime + deltaSeconds));
      setCurrentTime(newTime);

      if (isYouTube) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
          ytPlayerRef.current.seekTo(newTime, true);
        }
      } else {
        if (videoRef.current) {
          videoRef.current.currentTime = newTime;
        }
      }

      if (onTimeUpdate) onTimeUpdate(newTime);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetTime = parseFloat(e.target.value);
      setCurrentTime(targetTime);

      if (isYouTube) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
          ytPlayerRef.current.seekTo(targetTime, true);
        }
      } else {
        if (videoRef.current) {
          videoRef.current.currentTime = targetTime;
        }
      }

      if (onTimeUpdate) onTimeUpdate(targetTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseInt(e.target.value);
      setVolume(vol);
      setIsMuted(vol === 0);

      if (isYouTube) {
        if (ytPlayerRef.current) {
          ytPlayerRef.current.setVolume(vol);
          if (vol === 0) {
            ytPlayerRef.current.mute();
          } else {
            ytPlayerRef.current.unMute();
          }
        }
      } else {
        if (videoRef.current) {
          videoRef.current.volume = vol / 100;
          videoRef.current.muted = vol === 0;
        }
      }
    };

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextMute = !isMuted;
      setIsMuted(nextMute);

      if (isYouTube) {
        if (ytPlayerRef.current) {
          if (nextMute) {
            ytPlayerRef.current.mute();
          } else {
            ytPlayerRef.current.unMute();
            ytPlayerRef.current.setVolume(volume);
          }
        }
      } else {
        if (videoRef.current) {
          videoRef.current.muted = nextMute;
          videoRef.current.volume = nextMute ? 0 : volume / 100;
        }
      }
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (!containerRef.current) return;

      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.error('Error entering fullscreen:', err);
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch((err) => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    };

    // Keyboard shortcuts (ArrowLeft: -10s, ArrowRight: +10s, Space: Play/Pause, M: Mute, F: Fullscreen)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if user is typing in input or textarea
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        ) {
          return;
        }

        if (e.key === ' ' || e.key === 'k') {
          e.preventDefault();
          togglePlay();
        } else if (e.key === 'ArrowLeft' || e.key === 'j') {
          e.preventDefault();
          handleSeekRelative(-10);
        } else if (e.key === 'ArrowRight' || e.key === 'l') {
          e.preventDefault();
          handleSeekRelative(10);
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          setIsMuted((prev) => !prev);
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen(e as any);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentTime, duration, isPlaying, isMuted]);

    // Sync fullscreen state
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Expose control methods via forwardRef
    useImperativeHandle(ref, () => ({
      play: () => {
        if (isYouTube) {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
            ytPlayerRef.current.playVideo();
          }
        } else {
          if (videoRef.current) {
            void videoRef.current.play();
          }
        }
      },
      pause: () => {
        if (isYouTube) {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
            ytPlayerRef.current.pauseVideo();
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      seekTo: (time: number) => {
        setCurrentTime(time);
        if (isYouTube) {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
            ytPlayerRef.current.seekTo(time, true);
          }
        } else {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }
        }
      },
      setPlaybackSpeed: handleSetSpeed,
    }));

    const handleMouseMove = () => {
      setControlsVisible(true);
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      if (isPlaying) {
        mouseTimerRef.current = setTimeout(() => {
          setControlsVisible(false);
          setShowSpeedMenu(false);
        }, 3000);
      }
    };

    useEffect(() => {
      return () => {
        if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      };
    }, [isPlaying]);

    return (
      <div className="w-full flex flex-col gap-2">
        {/* Main Video Frame Container */}
        <div
          ref={containerRef}
          className={cn(
            'relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-md border border-white/10 transition-all',
            className
          )}
        >
          {/* Video element wrappers */}
          {isYouTube ? (
            <div className="absolute inset-0 w-full h-full z-0">
              <div id={ytContainerId} className="w-full h-full border-0" />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={url}
              poster={poster}
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover z-0"
              onTimeUpdate={handleHtml5TimeUpdate}
              onLoadedMetadata={handleHtml5LoadedMetadata}
              onPlay={handleHtml5Play}
              onPause={handleHtml5Pause}
            />
          )}
        </div>
      </div>
    );
  }
);

CustomVideoPlayer.displayName = 'CustomVideoPlayer';
