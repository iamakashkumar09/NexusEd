'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MarkdownRenderer } from '../../../../components/MarkdownRenderer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lecture {
  id: string;
  title: string;
  videoUrl?: string;
  videoDuration?: number;
  order?: number;
}

interface Section {
  id: string;
  title: string;
  order?: number;
  lectures: Lecture[];
}

interface Course {
  id: string;
  title: string;
  sections: Section[];
  thumbnailUrl?: string;
  description?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function flattenLectures(sections: Section[]): Lecture[] {
  return sections.flatMap(s => s.lectures);
}

// ─── Icon Components ──────────────────────────────────────────────────────────

const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const PauseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>;
const VolumeIcon = ({ muted }: { muted: boolean }) => (
  muted ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
);
const FullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const ExitFullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const SkipIcon = ({ direction }: { direction: 'prev' | 'next' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={direction === 'prev' ? '-scale-x-100' : ''}>
    <polygon points="5 4 15 12 5 20 5 4" className="opacity-60" />
    <polygon points="13 4 23 12 13 20 13 4" />
  </svg>
);
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>;
const AIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" />
    <path d="M8 12h8M12 8v8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" fill="currentColor" className="opacity-20" />
  </svg>
);
const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;

// ─── YouTube Player Hook ──────────────────────────────────────────────────────

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

function useYouTubePlayer(videoId: string | null, containerId: string, onEnded?: () => void) {
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [quality, setQualityState] = useState('auto');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const initPlayer = useCallback((vid: string) => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    setReady(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const disableCaptions = (player: any) => {
      try {
        if (typeof player?.unloadModule === 'function') {
          player.unloadModule('captions');
          player.unloadModule('cc');
        }
        if (typeof player?.setOption === 'function') {
          player.setOption('captions', 'track', {});
          player.setOption('cc', 'track', {});
          player.setOption('captions', 'fontSize', 0);
        }
      } catch (err) {
        // Ignore caption unload failures
      }
    };

    playerRef.current = new window.YT.Player(containerId, {
      videoId: vid,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        fs: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        cc_load_policy: 0,
        cc_lang_pref: 'none',
        hl: 'en',
      },
      events: {
        onReady: (e: any) => {
          setDuration(e.target.getDuration());
          e.target.setVolume(volume);
          disableCaptions(e.target);
          setReady(true);
          e.target.playVideo();
        },
        onApiChange: (e: any) => {
          disableCaptions(e.target);
        },
        onStateChange: (e: any) => {
          const state = e.data;
          if (state === 1) { // playing
            setPlaying(true);
            setDuration(e.target.getDuration());
            disableCaptions(e.target);
            timerRef.current = setInterval(() => {
              setCurrentTime(e.target.getCurrentTime());
            }, 500);
          } else {
            setPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (state === 0) { // ended
              setCurrentTime(0);
              if (onEndedRef.current) onEndedRef.current();
            }
          }
        },
      },
    });
  }, [containerId, volume]);

  useEffect(() => {
    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        if (videoId) initPlayer(videoId);
        return;
      }
      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => {
        if (videoId) initPlayer(videoId);
      };
    };
    loadAPI();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!videoId) return;
    if (window.YT && window.YT.Player) {
      initPlayer(videoId);
    }
  }, [videoId]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [playing]);

  const seekTo = useCallback((secs: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(secs, true);
    setCurrentTime(secs);
  }, []);

  const setVol = useCallback((v: number) => {
    if (!playerRef.current) return;
    playerRef.current.setVolume(v);
    setVolume(v);
    if (v > 0 && muted) {
      playerRef.current.unMute();
      setMuted(false);
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (muted) { playerRef.current.unMute(); setMuted(false); }
    else { playerRef.current.mute(); setMuted(true); }
  }, [muted]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const isFs = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isFs) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } else {
      const wrapper = document.getElementById('course-player-wrapper');
      if (wrapper) {
        if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen().catch(() => {});
        } else if ((wrapper as any).webkitRequestFullscreen) {
          (wrapper as any).webkitRequestFullscreen();
        } else if ((wrapper as any).mozRequestFullScreen) {
          (wrapper as any).mozRequestFullScreen();
        } else if ((wrapper as any).msRequestFullscreen) {
          (wrapper as any).msRequestFullscreen();
        }
      } else {
        const iframe = document.getElementById(containerId) as HTMLIFrameElement;
        if (iframe?.requestFullscreen) iframe.requestFullscreen().catch(() => {});
      }
    }
  }, [containerId]);

  const setPlaybackRate = useCallback((rate: number) => {
    try {
      if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(rate);
      }
    } catch (err) {
      console.warn('Could not set YouTube playback rate', err);
    }
    setPlaybackRateState(rate);
  }, []);

  const setPlaybackQuality = useCallback((q: string) => {
    try {
      if (playerRef.current) {
        if (typeof playerRef.current.setPlaybackQuality === 'function') {
          playerRef.current.setPlaybackQuality(q);
        }
        if (typeof playerRef.current.setPlaybackQualityRange === 'function') {
          playerRef.current.setPlaybackQualityRange(q, q);
        }
      }
    } catch (err) {
      console.warn('Could not set YouTube playback quality', err);
    }
    setQualityState(q);
  }, []);

  return { ready, playing, currentTime, duration, volume, muted, togglePlay, seekTo, setVol, toggleMute, isFullscreen, toggleFullscreen, requestFullscreen: toggleFullscreen, playbackRate, setPlaybackRate, quality, setPlaybackQuality };
}

// ─── Custom Control Bar ───────────────────────────────────────────────────────

function ControlBar({
  playing, currentTime, duration, volume, muted, playbackRate, quality, isFullscreen,
  onTogglePlay, onSeek, onVolumeChange, onToggleMute, onFullscreen, onPlaybackRateChange, onQualityChange,
  onPrev, onNext, hasPrev, hasNext,
}: any) {
  const [hovering, setHovering] = useState(false);
  const [seekHover, setSeekHover] = useState(false);
  const [hoverPct, setHoverPct] = useState(0);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setSpeedMenuOpen(false);
      }
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(e.target as Node)) {
        setQualityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeekMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPct(pct);
  };

  const isAnyMenuOpen = speedMenuOpen || qualityMenuOpen;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 pb-4 pt-12 z-20 transition-opacity duration-300 ${
        hovering || isAnyMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 md:opacity-0 opacity-100 pointer-events-auto'
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        if (!isAnyMenuOpen) setHovering(false);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Seek bar */}
      <div
        className="relative bg-white/20 rounded-full cursor-pointer mb-3 transition-all duration-150"
        style={{ height: seekHover ? 8 : 6 }}
        onMouseEnter={() => setSeekHover(true)}
        onMouseLeave={() => setSeekHover(false)}
        onMouseMove={handleSeekMove}
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onSeek(pct * duration);
        }}
      >
        <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        <div
          className="absolute top-1/2 bg-white rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(0,0,0,0.6)]"
          style={{
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            width: seekHover ? 16 : 0,
            height: seekHover ? 16 : 0,
          }}
        />
        {/* Hover Time Tooltip */}
        {seekHover && (
          <div
            className="absolute top-[-36px] bg-black/90 text-white text-xs font-semibold px-2 py-1 rounded-md pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.5)] whitespace-nowrap border border-white/10"
            style={{ left: `${hoverPct * 100}%`, transform: 'translateX(-50%)' }}
          >
            {formatTime(hoverPct * duration)}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          disabled={!hasPrev}
          className={`p-1.5 ${hasPrev ? 'text-white hover:text-white/80 cursor-pointer' : 'text-white/30 cursor-default'}`}
        >
          <SkipIcon direction="prev" />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          disabled={!hasNext}
          className={`p-1.5 ${hasNext ? 'text-white hover:text-white/80 cursor-pointer' : 'text-white/30 cursor-default'}`}
        >
          <SkipIcon direction="next" />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className="p-1.5 text-white cursor-pointer hover:text-white/80"
        >
          <VolumeIcon muted={muted} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="hidden sm:block w-[72px] accent-white cursor-pointer"
        />

        <span className="text-xs text-white/80 font-medium ml-1 whitespace-nowrap hidden sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex-1" />

        {/* Speed */}
        <div ref={speedMenuRef} className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSpeedMenuOpen((prev) => !prev);
              setQualityMenuOpen(false);
            }}
            className={`text-white text-[13px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              speedMenuOpen
                ? 'bg-white/20 border-primary shadow-[0_0_8px_rgba(94,106,210,0.4)]'
                : 'bg-white/5 border-white/10 hover:bg-white/15'
            }`}
          >
            <span>{playbackRate}x</span>
          </button>
          {speedMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full right-0 mb-2 bg-[#1c1c1e] backdrop-blur-2xl rounded-xl overflow-hidden flex flex-col border border-white/20 min-w-[100px] shadow-[0_12px_36px_rgba(0,0,0,0.8)] z-50 animate-fade-in"
            >
              <div className="px-3 py-1.5 text-[10px] text-white/50 uppercase tracking-wider font-bold border-b border-white/10">
                Speed
              </div>
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaybackRateChange(rate);
                    setSpeedMenuOpen(false);
                  }}
                  className={`text-left px-3.5 py-2 text-[13px] font-semibold text-white flex items-center justify-between transition-colors cursor-pointer ${
                    rate === playbackRate ? 'bg-primary text-white font-bold' : 'hover:bg-white/15'
                  }`}
                >
                  <span>{rate}x</span>
                  {rate === playbackRate && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quality */}
        <div ref={qualityMenuRef} className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQualityMenuOpen((prev) => !prev);
              setSpeedMenuOpen(false);
            }}
            className={`text-white text-[13px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              qualityMenuOpen
                ? 'bg-white/20 border-primary shadow-[0_0_8px_rgba(94,106,210,0.4)]'
                : 'bg-white/5 border-white/10 hover:bg-white/15'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            <span className="text-[11px] uppercase tracking-wide">
              {quality === 'auto' ? 'Auto' : quality.replace('hd', '').replace('large', '480p').replace('medium', '360p')}
            </span>
          </button>
          {qualityMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full right-0 mb-2 bg-[#1c1c1e] backdrop-blur-2xl rounded-xl overflow-hidden flex flex-col border border-white/20 min-w-[130px] shadow-[0_12px_36px_rgba(0,0,0,0.8)] z-50 animate-fade-in"
            >
              <div className="px-3.5 py-1.5 text-[10px] text-white/50 uppercase tracking-wider font-bold border-b border-white/10">
                Quality
              </div>
              {[
                { label: '1080p HD', value: 'hd1080' },
                { label: '720p HD', value: 'hd720' },
                { label: '480p', value: 'large' },
                { label: '360p', value: 'medium' },
                { label: 'Auto', value: 'auto' },
              ].map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQualityChange) onQualityChange(q.value);
                    setQualityMenuOpen(false);
                  }}
                  className={`text-left px-3.5 py-2 text-[13px] font-semibold text-white flex items-center justify-between transition-colors cursor-pointer ${
                    quality === q.value ? 'bg-primary text-white font-bold' : 'hover:bg-white/15'
                  }`}
                >
                  <span>{q.label}</span>
                  {quality === q.value && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
          className="p-1.5 text-white hover:text-white/80 cursor-pointer transition-transform active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      </div>
    </div>
  );
}

// ─── AI Tutor Panel ───────────────────────────────────────────────────────────

interface AIMessage { role: 'user' | 'ai'; text: string; }

function AIPanelContent({ courseId, lectureId, courseTitle, lectureTitle }: { courseId: string; lectureId: string; courseTitle: string; lectureTitle: string }) {
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'ai', text: `Hi! I'm your AI Tutor for **${courseTitle}**. Ask me anything about this lecture — concepts, code, or career advice!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);
    
    try {
      const match = typeof document !== 'undefined' ? document.cookie.match(/(?:^|;\s*)token=([^;]+)/) : null;
      const token = match ? decodeURIComponent(match[1]) : '';

      const res = await fetch(`/api/ai/courses/${courseId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: q, lectureId })
      });
      const data = await res.json();
      
      setIsTyping(false);
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: `Sorry, I couldn't process that: ${data.message || data.error || 'Unknown error'}` }]);
        return;
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, the AI service is currently unreachable.' }]);
    }
  };

  const SUGGESTIONS = ['Explain this concept', 'Give me an example', 'Summarize this'];

  return (
    <div className="flex flex-col h-full bg-surface-1">
      {/* Header */}
      <div className="p-4 border-b border-hairline bg-gradient-to-br from-primary/10 to-primary/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#828fff] flex items-center justify-center shadow-[0_4px_16px_rgba(94,106,210,0.5)] shrink-0">
          <AIIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold text-ink tracking-tight">AI Tutor</div>
          <div className="text-xs text-ink-subtle truncate mt-0.5">📖 {lectureTitle}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 items-start animate-fade-in ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[#828fff] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg>
              </div>
            )}
            <div
              className={`leading-relaxed shadow-sm transition-all ${
                m.role === 'user'
                  ? 'max-w-[85%] p-3.5 text-[13px] sm:text-sm rounded-[16px_4px_16px_16px] bg-gradient-to-br from-primary to-[#828fff] text-white shadow-[0_4px_12px_rgba(94,106,210,0.3)]'
                  : 'max-w-[92%] sm:max-w-[88%] p-4 rounded-[6px_18px_18px_18px] bg-surface-2/95 border border-hairline/80 text-ink shadow-[0_2px_12px_rgba(0,0,0,0.2)]'
              }`}
            >
              {m.role === 'ai' ? (
                <MarkdownRenderer content={m.text} />
              ) : (
                <div className="whitespace-pre-wrap">{m.text}</div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5 items-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[#828fff] flex items-center justify-center shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg>
            </div>
            <div className="p-3 rounded-[4px_16px_16px_16px] bg-surface-3 flex items-center gap-1.5 h-10">
              <div className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-pulse delay-75" />
              <div className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-pulse delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !isTyping && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => { setInput(s); textareaRef.current?.focus(); }} className="px-3 py-1.5 rounded-full border border-hairline-strong bg-surface-2 text-ink-muted text-[11px] font-bold hover:bg-surface-3 hover:text-ink hover:border-primary transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-hairline bg-surface-2 flex items-end gap-2 shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything..."
          rows={1}
          className="flex-1 p-2.5 bg-surface-3 border border-hairline-strong rounded-xl text-ink text-[13px] outline-none resize-none min-h-[40px] max-h-[120px] focus:border-primary focus:shadow-[0_0_0_2px_rgba(94,106,210,0.15)] transition-all"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
            input.trim() ? 'bg-gradient-to-br from-primary to-[#828fff] text-white shadow-[0_2px_8px_rgba(94,106,210,0.4)] scale-100' : 'bg-surface-3 text-ink-muted scale-95 cursor-default'
          }`}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Main CoursePlayer ────────────────────────────────────────────────────────

export function CoursePlayer({ course, initialLectureId }: { course: Course; initialLectureId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const allLectures = flattenLectures(course.sections || []);
  const firstLecture = allLectures[0] || null;

  const [activeLecture, setActiveLecture] = useState<Lecture | null>(() => {
    if (initialLectureId) return allLectures.find(l => l.id === initialLectureId) || firstLecture;
    return firstLecture;
  });
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'curriculum' | 'about' | 'notes' | 'resources' | 'ai'>('curriculum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Set default tab based on screen size
  useEffect(() => {
    if (window.innerWidth >= 1024 && activeTab === 'curriculum') {
      setActiveTab('about');
    }
  }, []);

  useEffect(() => {
    fetch(`/api/courses/${course.id}/progress`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.completedLectureIds) {
          setCompleted(new Set(data.completedLectureIds));
        }
      })
      .catch(console.error);
  }, [course.id]);

  const toggleComplete = async (lectureId: string, isCompleted: boolean) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (isCompleted) next.add(lectureId);
      else next.delete(lectureId);
      return next;
    });

    try {
      await fetch(`/api/courses/${course.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, completed: isCompleted })
      });
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const videoId = activeLecture ? getYouTubeId(activeLecture.videoUrl) : null;

  const {
    ready, playing, currentTime, duration, volume, muted,
    togglePlay, seekTo, setVol, toggleMute, isFullscreen, toggleFullscreen,
    playbackRate, setPlaybackRate, quality, setPlaybackQuality
  } = useYouTubePlayer(videoId, 'yt-player-frame', () => {
    if (activeLecture && !completed.has(activeLecture.id)) {
      toggleComplete(activeLecture.id, true);
    }
  });

  const currentIdx = activeLecture ? allLectures.findIndex(l => l.id === activeLecture.id) : -1;
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allLectures.length - 1;

  const goTo = (lecture: Lecture) => {
    setActiveLecture(lecture);
    router.replace(`${pathname}?lecture=${lecture.id}`, { scroll: false });
  };

  const goPrev = () => hasPrev && goTo(allLectures[currentIdx - 1]);
  const goNext = () => {
    if (activeLecture && !completed.has(activeLecture.id)) {
      toggleComplete(activeLecture.id, true);
    }
    if (hasNext) goTo(allLectures[currentIdx + 1]);
  };

  const totalProgress = allLectures.length > 0
    ? Math.round((completed.size / allLectures.length) * 100)
    : 0;

  return (
    <div className="h-[100dvh] bg-black flex flex-col font-sans overflow-hidden">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="h-[52px] shrink-0 flex items-center justify-between px-3 md:px-5 bg-black/90 backdrop-blur-xl border-b border-white/10 z-20">
        {/* Left: back + logo */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href={`/courses/${course.id}`} className="flex items-center gap-1.5 text-ink-subtle text-xs md:text-[13px] font-medium hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-4 bg-hairline" />
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-[#828fff] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/>
              </svg>
            </div>
            <span className="hidden md:inline text-[13px] font-extrabold text-white tracking-tight">NexusEd</span>
          </Link>
        </div>

        {/* Center: course + lecture name */}
        <div className="flex-1 text-center truncate px-2 md:px-6">
          <div className="text-[13px] font-bold text-white truncate tracking-tight">
            {activeLecture?.title || 'Select a lecture'}
          </div>
          <div className="text-[11px] text-white/50 truncate mt-0.5 hidden sm:block">
            {course.title}
          </div>
        </div>

        {/* Right: progress + sidebar toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-16 md:w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${totalProgress}%` }} />
            </div>
            <span className="text-xs text-white/60 font-semibold">{totalProgress}%</span>
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex w-8 h-8 rounded-lg bg-surface-2 border border-hairline text-ink-subtle items-center justify-center hover:bg-surface-3 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Player + Tabs column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          
          {/* Video Player */}
          <div className="bg-black w-full shrink-0 flex justify-center border-b border-hairline">
            <div id="course-player-wrapper" className="relative bg-black w-full aspect-video lg:max-h-[70vh]" style={{ maxWidth: 'calc(70vh * 16 / 9)' }}>
              {/* iframe wrapper */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
                <div id="yt-player-frame" className="w-full h-full" />
              </div>

              {/* Interaction interceptor */}
              <div className="absolute inset-0 z-[5] cursor-pointer" onClick={togglePlay} onDoubleClick={toggleFullscreen} />

              {/* No video placeholder */}
              {!videoId && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] z-[6]">
                  <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink-ghost)" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-ink-subtle">No video for this lecture</div>
                    <div className="text-xs text-ink-ghost mt-1">Check the content tab below</div>
                  </div>
                </div>
              )}

              {/* Loading overlay */}
              {videoId && !ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-[7]">
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
                </div>
              )}

              {/* Controls */}
              {videoId && ready && (
                <ControlBar
                  playing={playing} currentTime={currentTime} duration={duration}
                  volume={volume} muted={muted} playbackRate={playbackRate} quality={quality}
                  isFullscreen={isFullscreen}
                  onTogglePlay={togglePlay} onSeek={seekTo}
                  onVolumeChange={setVol} onToggleMute={toggleMute}
                  onFullscreen={toggleFullscreen} onPlaybackRateChange={setPlaybackRate}
                  onQualityChange={setPlaybackQuality}
                  onPrev={goPrev} onNext={goNext}
                  hasPrev={hasPrev} hasNext={hasNext}
                />
              )}
            </div>
          </div>

          {/* Lecture Nav bar */}
          <div className="px-4 py-2.5 bg-surface-1 border-b border-hairline flex items-center justify-between shrink-0 overflow-x-auto gap-4">
            <button onClick={goPrev} disabled={!hasPrev} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-[13px] font-semibold shrink-0 transition-colors ${hasPrev ? 'border-hairline bg-surface-2 text-ink-muted hover:bg-surface-3 cursor-pointer' : 'border-transparent text-ink-ghost cursor-default'}`}>
              ← Prev
            </button>
            <div className="flex items-center">
              {activeLecture && (
                <button onClick={() => toggleComplete(activeLecture.id, !completed.has(activeLecture.id))} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-[13px] font-semibold shrink-0 transition-colors ${completed.has(activeLecture.id) ? 'border-success/30 bg-success/10 text-success' : 'border-hairline bg-transparent text-ink-subtle hover:bg-surface-2'}`}>
                  <CheckIcon />
                  {completed.has(activeLecture.id) ? 'Completed' : 'Mark Complete'}
                </button>
              )}
            </div>
            <button onClick={goNext} disabled={!hasNext} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-[13px] font-bold shrink-0 transition-colors ${hasNext ? 'border-transparent bg-primary text-white shadow-glow hover:bg-primary-light cursor-pointer' : 'border-hairline bg-surface-2 text-ink-ghost cursor-default'}`}>
              Next →
            </button>
          </div>

          {/* Mobile-friendly Tabs */}
          <div className="bg-surface-1 border-b border-hairline flex overflow-x-auto shrink-0 scrollbar-hide hide-scrollbars">
            {/* The 'curriculum' and 'ai' tabs are only visible on mobile screens */}
            {(['curriculum', 'about', 'notes', 'resources', 'ai'] as const).map(tab => {
              const hideOnDesktop = tab === 'curriculum' || tab === 'ai';
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${hideOnDesktop ? 'lg:hidden' : ''} px-4 sm:px-5 py-3 text-xs sm:text-[13px] capitalize whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'font-bold text-ink border-primary'
                      : 'font-semibold text-ink-subtle border-transparent hover:text-ink-muted'
                  }`}
                >
                  {tab === 'ai' ? 'AI Tutor' : tab}
                </button>
              );
            })}
          </div>

          {/* Tab content area */}
          <div className="flex-1 overflow-y-auto bg-canvas relative">
            
            {/* Curriculum Tab (Mobile only) */}
            {activeTab === 'curriculum' && (
              <div className="lg:hidden flex flex-col h-full bg-surface-1">
                {(course.sections || []).map((section, sIdx) => (
                  <div key={section.id}>
                    <div className="px-4 py-2 bg-surface-2 border-b border-hairline sticky top-0 z-10">
                      <div className="text-[10px] font-bold text-ink-subtle uppercase tracking-widest mb-0.5">Section {sIdx + 1}</div>
                      <div className="text-sm font-bold text-ink">{section.title}</div>
                    </div>
                    <div>
                      {(section.lectures || []).map((lecture, lIdx) => {
                        const isActive = activeLecture?.id === lecture.id;
                        const isDone = completed.has(lecture.id);
                        return (
                          <button key={lecture.id} onClick={() => goTo(lecture)} className={`w-full text-left p-3 flex items-start gap-3 border-b border-hairline transition-colors ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'bg-transparent border-l-4 border-l-transparent hover:bg-surface-2'}`}>
                            <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 border ${isDone ? 'bg-success border-success' : isActive ? 'bg-primary border-primary' : 'bg-surface-3 border-hairline-strong'}`}>
                              {isDone ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : isActive ? <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg> : <span className="text-[9px] font-bold text-ink-ghost">{lIdx + 1}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[13px] font-medium truncate ${isActive ? 'text-primary font-bold' : isDone ? 'text-ink-subtle' : 'text-ink-muted'}`}>{lecture.title}</div>
                              <div className="text-[11px] text-ink-ghost mt-0.5">{lecture.videoDuration ? formatTime(lecture.videoDuration) : 'Article'}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="p-5 sm:p-8 max-w-3xl">
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mb-4">{activeLecture?.title || 'Lecture Details'}</h2>
                <div className="text-sm sm:text-[15px] text-ink-muted leading-relaxed border-l-2 border-hairline-strong pl-4">
                  {course.description || 'No description available for this lecture.'}
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="p-5 sm:p-8 max-w-3xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-ink tracking-tight">My Notes</h2>
                  <span className="text-xs font-semibold text-ink-subtle bg-surface-2 px-2.5 py-1 rounded-md border border-hairline">Coming Soon</span>
                </div>
                <div className="p-8 text-center border border-dashed border-hairline-strong rounded-2xl bg-surface-1 text-ink-subtle">
                  <div className="text-4xl mb-3">📝</div>
                  <div className="text-[15px] font-medium mb-1">Take structured notes</div>
                  <div className="text-[13px]">Notes with timestamps and markdown support will be available here soon.</div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="p-5 sm:p-8 max-w-3xl">
                <h2 className="text-xl font-bold text-ink tracking-tight mb-5">Resources</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Lecture_Slides.pdf', size: '2.4 MB', icon: '📄' },
                    { name: 'Starter_Code.zip', size: '1.1 MB', icon: '🗃️' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 bg-surface-1 border border-hairline rounded-xl cursor-pointer hover:bg-surface-2 transition-colors">
                      <span className="text-2xl">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-ink">{r.name}</div>
                        <div className="text-[11px] text-ink-subtle">{r.size}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-subtle)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Tab (Mobile only) */}
            {activeTab === 'ai' && (
              <div className="absolute inset-0 lg:hidden">
                 <AIPanelContent courseId={course.id} lectureId={activeLecture?.id || ''} courseTitle={course.title} lectureTitle={activeLecture?.title || ''} />
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar Curriculum (Desktop) ────────────────────────────── */}
        <aside className={`hidden lg:flex flex-col shrink-0 bg-surface-1 border-l border-hairline transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-[320px] xl:w-[360px]'}`}>
          <div className="p-4 border-b border-hairline shrink-0">
            <div className="text-[13px] font-bold text-ink mb-2.5 tracking-tight">Course Content</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${totalProgress}%` }} />
              </div>
              <span className="text-[11px] font-bold text-ink-subtle shrink-0">{completed.size}/{allLectures.length}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {(course.sections || []).map((section, sIdx) => (
              <div key={section.id}>
                <div className="px-4 py-2 bg-surface-2 border-b border-hairline sticky top-0 z-10">
                  <div className="text-[10px] font-bold text-ink-subtle uppercase tracking-widest mb-0.5">Section {sIdx + 1}</div>
                  <div className="text-[13px] font-bold text-ink leading-snug">{section.title}</div>
                </div>
                <div>
                  {(section.lectures || []).map((lecture, lIdx) => {
                    const isActive = activeLecture?.id === lecture.id;
                    const isDone = completed.has(lecture.id);
                    return (
                      <button key={lecture.id} onClick={() => goTo(lecture)} className={`w-full text-left px-4 py-2.5 flex items-start gap-3 border-b border-hairline transition-colors ${isActive ? 'bg-primary/5 border-l-[3px] border-l-primary' : 'bg-transparent border-l-[3px] border-l-transparent hover:bg-surface-2'}`}>
                        <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 border ${isDone ? 'bg-success border-success' : isActive ? 'bg-primary border-primary' : 'bg-surface-3 border-hairline-strong'}`}>
                          {isDone ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : isActive ? <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg> : <span className="text-[9px] font-bold text-ink-ghost">{lIdx + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium truncate ${isActive ? 'text-ink font-bold' : isDone ? 'text-ink-subtle' : 'text-ink-muted'}`}>{lecture.title}</div>
                          <div className="text-[10px] text-ink-ghost mt-0.5 flex items-center gap-1">
                            {lecture.videoUrl ? <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>}
                            {lecture.videoDuration ? formatTime(lecture.videoDuration) : 'Resource'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── AI Tutor Floating Panel (Desktop only) ────────────────────────────── */}
      <div className="hidden lg:block">
        <div className={`fixed bottom-24 right-8 z-[99] w-[400px] h-[65vh] max-h-[600px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-hairline-strong rounded-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${activeTab === 'ai' ? 'scale-100 opacity-100 pointer-events-auto translate-y-0' : 'scale-95 opacity-0 pointer-events-none translate-y-4'}`}>
           <AIPanelContent courseId={course.id} lectureId={activeLecture?.id || ''} courseTitle={course.title} lectureTitle={activeLecture?.title || ''} />
        </div>
        <button
          onClick={() => setActiveTab(activeTab === 'ai' ? 'about' : 'ai')}
          className={`fixed bottom-8 right-8 z-[100] flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-bold text-white shadow-glow transition-all hover:scale-105 ${activeTab === 'ai' ? 'bg-surface-3 shadow-none text-ink border border-hairline' : 'bg-gradient-to-r from-primary to-[#828fff]'}`}
        >
          <AIIcon />
          {activeTab === 'ai' ? 'Close Tutor' : 'Ask AI Tutor'}
        </button>
      </div>

      <KeyboardShortcuts onTogglePlay={togglePlay} />
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbars::-webkit-scrollbar { display: none; }
        .hide-scrollbars { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function KeyboardShortcuts({ onTogglePlay }: { onTogglePlay: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onTogglePlay]);
  return null;
}
