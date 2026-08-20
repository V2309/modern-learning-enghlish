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
  if (isNaN(seconds) || seconds === Infinity) return '00:00';
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
      // Check if tag already exists in HTML
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Intercept or hook into standard callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        resolve();
      };

      // In case the script is already cached/run or loaded but ready callback is missed
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

export const CustomVideoPlayer = forwardRef<CustomVideoPlayerRef, CustomVideoPlayerProps>(
  (
    {
      url,
      poster,
      playbackSpeed = 1.0,
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
    const [volume, setVolume] = useState(80); // 0 - 100
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // YT Player Reference
    const ytPlayerRef = useRef<any>(null);
    const ytIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Dynamic origin checking for security
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

        // Clean up previous instance if any
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
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1,
            enablejsapi: 1,
            origin: getOrigin(),
          },
          events: {
            onReady: (event: any) => {
              if (destroyed) return;
              event.target.setPlaybackRate(playbackSpeed);
              setDuration(event.target.getDuration() || 0);
              
              // Set initial volume & mute
              event.target.setVolume(isMuted ? 0 : volume);
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }
            },
            onStateChange: (event: any) => {
              if (destroyed) return;
              const state = event.data;
              // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
              if (state === 1) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }

              if (state === 1) {
                startYtTracking();
              } else {
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
    useEffect(() => {
      if (isYouTube) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
          ytPlayerRef.current.setPlaybackRate(playbackSpeed);
        }
      } else {
        if (videoRef.current) {
          videoRef.current.playbackRate = playbackSpeed;
        }
      }
    }, [playbackSpeed, isYouTube]);

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
      e.stopPropagation();
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

    // Sync fullscreen state if changed externally (e.g. Escape key)
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
      setPlaybackSpeed: (speed: number) => {
        if (isYouTube) {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
            ytPlayerRef.current.setPlaybackRate(speed);
          }
        } else {
          if (videoRef.current) {
            videoRef.current.playbackRate = speed;
          }
        }
      },
    }));

    // Auto-hide controls timer on mouse move inside container (useful when in fullscreen or playing)
    const [controlsVisible, setControlsVisible] = useState(true);
    const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseMove = () => {
      setControlsVisible(true);
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      if (isPlaying) {
        mouseTimerRef.current = setTimeout(() => {
          setControlsVisible(false);
        }, 2500);
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
            'group relative aspect-video w-full overflow-hidden rounded-[10px] bg-[#0a0a0a] shadow-md border border-white/5 transition-all select-none',
            className
          )}
          onMouseEnter={() => {
            setIsHovered(true);
            setControlsVisible(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            if (isPlaying) setControlsVisible(false);
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Video element wrappers */}
          {isYouTube ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <div id={ytContainerId} className="w-full h-full border-0" />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={url}
              poster={poster}
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover z-0"
              onTimeUpdate={handleHtml5TimeUpdate}
              onLoadedMetadata={handleHtml5LoadedMetadata}
              onPlay={handleHtml5Play}
              onPause={handleHtml5Pause}
              onClick={togglePlay}
            />
          )}

          {/* Clickable Overlay to Play/Pause (since YouTube iframe is pointer-events: none) */}
          <div
            className="absolute inset-0 z-10 cursor-pointer w-full h-full"
            onClick={togglePlay}
          />

          {/* Central Big Circular Play Button (Hidden when playing) */}
          <div
            className={cn(
              'absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-300',
              isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
            )}
          >
            <button
              onClick={togglePlay}
              className="pointer-events-auto flex items-center justify-center w-16 h-16 rounded-full bg-[#1ea3e0] text-white hover:bg-[#1582b5] shadow-lg shadow-[#1ea3e0]/30 transform active:scale-95 transition-all hover:scale-105"
            >
              <Play className="h-7 w-7 fill-current translate-x-0.5" />
            </button>
          </div>

          {/* Bottom Custom Styled Controls Overlay */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 z-30 flex flex-col gap-3.5 px-4 pb-4 pt-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-auto transition-opacity duration-300',
              (isHovered && controlsVisible) ? 'opacity-100' : 'opacity-0'
            )}
            onClick={(e) => e.stopPropagation()} // Prevents toggling play when clicking controls
          >
            {/* Seek Bar Row */}
            <div className="relative w-full h-1.5 group/seek flex items-center">
              {/* Background Track */}
              <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full" />
              {/* Blue Active Progress Bar */}
              <div
                className="absolute left-0 h-1 bg-[#1ea3e0] rounded-full"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
              {/* White Circular Thumb (visible on hover or drag) */}
              <div
                className="absolute w-3.5 h-3.5 bg-white border border-[#1ea3e0] rounded-full shadow cursor-pointer transform -translate-y-[0px] hover:scale-110 transition-transform"
                style={{
                  left: `calc(${(currentTime / (duration || 1)) * 100}% - 7px)`,
                }}
              />
              {/* Invisible Range Input on Top for Clicking and Dragging */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step="any"
                value={currentTime}
                onChange={handleSeekChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>

            {/* Bottom Row: Left & Right Controls */}
            <div className="flex items-center justify-between text-white/95">
              {/* Left Side: Play/Pause, Time, Volume */}
              <div className="flex items-center gap-4">
                {/* Play / Pause button */}
                <button
                  onClick={togglePlay}
                  className="hover:text-[#1ea3e0] active:scale-95 transition-all"
                  title={isPlaying ? 'Tạm dừng' : 'Phát'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </button>

                {/* Time Display */}
                <span className="text-xs font-mono font-medium tracking-tight text-white/70 select-none">
                  {formatTime(currentTime)} <span className="text-white/40 mx-0.5">/</span> {formatTime(duration)}
                </span>

                {/* Volume Section */}
                <div className="flex items-center gap-2 group/volume">
                  {/* Volume Icon */}
                  <button
                    onClick={toggleMute}
                    className="hover:text-[#1ea3e0] transition-colors"
                    title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>

                  {/* Volume Slider Track */}
                  <div className="relative w-16 h-1 flex items-center transition-all duration-300">
                    <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full" />
                    <div
                      className="absolute left-0 h-1 bg-[#1ea3e0] rounded-full"
                      style={{ width: `${isMuted ? 0 : volume}%` }}
                    />
                    <div
                      className="absolute w-2.5 h-2.5 bg-white rounded-full shadow transform"
                      style={{
                        left: `calc(${isMuted ? 0 : volume}% - 5px)`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-[#1ea3e0] active:scale-95 transition-all"
                title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CustomVideoPlayer.displayName = 'CustomVideoPlayer';
