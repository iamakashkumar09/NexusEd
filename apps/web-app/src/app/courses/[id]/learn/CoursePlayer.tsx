'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

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
  // Already just an ID (11 chars, no slashes)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function flattenLectures(sections: Section[]): Lecture[] {
  return sections.flatMap(s => s.lectures);
}

// ─── Icon Components ──────────────────────────────────────────────────────────

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);
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
const SkipIcon = ({ direction }: { direction: 'prev' | 'next' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
    style={{ transform: direction === 'prev' ? 'scaleX(-1)' : 'none' }}>
    <polygon points="5 4 15 12 5 20 5 4" opacity="0.6" />
    <polygon points="13 4 23 12 13 20 13 4" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" />
    <path d="M8 12h8M12 8v8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ─── YouTube Player Hook ──────────────────────────────────────────────────────

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

function useYouTubePlayer(videoId: string | null, containerId: string) {
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initPlayer = useCallback((vid: string) => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    setReady(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    playerRef.current = new window.YT.Player(containerId, {
      videoId: vid,
      playerVars: {
        autoplay: 1,           // autoplay when ready
        controls: 0,          // hide native controls
        disablekb: 1,          // disable keyboard shortcuts
        modestbranding: 1,     // minimise YouTube branding
        rel: 0,                // no related videos at end
        showinfo: 0,           // hide video title info bar
        iv_load_policy: 3,     // no annotations
        fs: 0,                 // disable native fullscreen
        playsinline: 1,        // inline playback on iOS
        enablejsapi: 1,        // required for API control
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        cc_load_policy: 0,     // no auto captions
        hl: 'en',              // language hint
      },
      events: {
        onReady: (e: any) => {
          setDuration(e.target.getDuration());
          e.target.setVolume(volume);
          setReady(true);
          e.target.playVideo(); // Autoplay as soon as ready
        },
        onStateChange: (e: any) => {
          const state = e.data;
          if (state === 1) { // playing
            setPlaying(true);
            setDuration(e.target.getDuration());
            timerRef.current = setInterval(() => {
              setCurrentTime(e.target.getCurrentTime());
            }, 500);
          } else {
            setPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (state === 0) setCurrentTime(0); // ended
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

  const requestFullscreen = useCallback(() => {
    // Request fullscreen on the parent wrapper so our custom controls are included
    const wrapper = document.getElementById('course-player-wrapper');
    if (wrapper && wrapper.requestFullscreen) {
      wrapper.requestFullscreen();
    } else {
      const iframe = document.getElementById(containerId) as HTMLIFrameElement;
      if (iframe?.requestFullscreen) iframe.requestFullscreen();
    }
  }, [containerId]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!playerRef.current) return;
    if (typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(rate);
    }
    setPlaybackRateState(rate);
  }, []);

  return { ready, playing, currentTime, duration, volume, muted, togglePlay, seekTo, setVol, toggleMute, requestFullscreen, playbackRate, setPlaybackRate };
}


// ─── Custom Control Bar ───────────────────────────────────────────────────────

function ControlBar({
  playing, currentTime, duration, volume, muted, playbackRate,
  onTogglePlay, onSeek, onVolumeChange, onToggleMute, onFullscreen, onPlaybackRateChange,
  onPrev, onNext, hasPrev, hasNext,
}: any) {
  const [hovering, setHovering] = useState(false);
  const [seekHover, setSeekHover] = useState(false);
  const [hoverPct, setHoverPct] = useState(0);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPct(pct);
  };

  return (
    <div
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
        padding: '40px 20px 16px',
        transition: 'opacity 0.3s',
        opacity: hovering ? 1 : 0,
        zIndex: 10,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Seek bar */}
      <div
        style={{ position: 'relative', height: seekHover ? 8 : 6, background: 'rgba(255,255,255,0.2)', borderRadius: 999, cursor: 'pointer', marginBottom: 12, transition: 'height 0.15s' }}
        onMouseEnter={() => setSeekHover(true)}
        onMouseLeave={() => setSeekHover(false)}
        onMouseMove={handleSeekMove}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onSeek(pct * duration);
        }}
      >
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.1s' }} />
        <div style={{
          position: 'absolute', top: '50%', left: `${progress}%`,
          transform: 'translate(-50%, -50%)',
          width: seekHover ? 16 : 0, height: seekHover ? 16 : 0,
          background: '#fff', borderRadius: '50%',
          transition: 'all 0.15s', boxShadow: '0 0 4px rgba(0,0,0,0.5)',
        }} />
        
        {/* Hover Time Tooltip */}
        {seekHover && (
          <div style={{
            position: 'absolute', top: -36, left: `${hoverPct * 100}%`,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 12, fontWeight: 600,
            padding: '4px 8px', borderRadius: 6, pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
          }}>
            {formatTime(hoverPct * duration)}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Skip prev */}
        <button onClick={onPrev} disabled={!hasPrev} style={{ background: 'none', border: 'none', color: hasPrev ? '#fff' : 'rgba(255,255,255,0.3)', cursor: hasPrev ? 'pointer' : 'default', padding: 6 }}>
          <SkipIcon direction="prev" />
        </button>

        {/* Play/Pause */}
        <button onClick={onTogglePlay} style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none',
          background: '#fff', color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Skip next */}
        <button onClick={onNext} disabled={!hasNext} style={{ background: 'none', border: 'none', color: hasNext ? '#fff' : 'rgba(255,255,255,0.3)', cursor: hasNext ? 'pointer' : 'default', padding: 6 }}>
          <SkipIcon direction="next" />
        </button>

        {/* Volume */}
        <button onClick={onToggleMute} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}>
          <VolumeIcon muted={muted} />
        </button>
        <input
          type="range" min={0} max={100} value={muted ? 0 : volume}
          onChange={e => onVolumeChange(Number(e.target.value))}
          style={{ width: 72, accentColor: '#fff', cursor: 'pointer' }}
        />

        {/* Time */}
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginLeft: 4, whiteSpace: 'nowrap' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Speed */}
        <div style={{ position: 'relative' }} onMouseLeave={() => setSpeedMenuOpen(false)}>
          <button onClick={() => setSpeedMenuOpen(!speedMenuOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', fontSize: 13, fontWeight: 700, minWidth: 44, opacity: 0.8 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
          >
            {playbackRate}x
          </button>

          {/* Speed Menu */}
          {speedMenuOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
              background: 'rgba(28,28,30,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
              border: '1px solid rgba(255,255,255,0.1)', minWidth: 80,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                <button
                  key={rate}
                  onClick={() => { onPlaybackRateChange(rate); setSpeedMenuOpen(false); }}
                  style={{
                    background: rate === playbackRate ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: '#fff', padding: '10px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = rate === playbackRate ? 'rgba(255,255,255,0.1)' : 'transparent'}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button onClick={onFullscreen} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}>
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
}

// ─── AI Tutor Panel ───────────────────────────────────────────────────────────

function AIPanelButton({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: open ? '10px 18px' : '12px 20px',
        borderRadius: 999, border: 'none', cursor: 'pointer',
        background: open ? 'var(--surface-3)' : 'linear-gradient(135deg, #5e6ad2, #828fff)',
        color: '#fff', fontSize: 14, fontWeight: 700,
        boxShadow: open ? 'none' : '0 4px 24px rgba(94,106,210,0.5), 0 0 0 1px rgba(94,106,210,0.3)',
        transition: 'all 0.2s',
        letterSpacing: '-0.01em',
      }}
    >
      <AIIcon />
      {open ? 'Close Tutor' : 'AI Tutor'}
    </button>
  );
}

interface AIMessage { role: 'user' | 'ai'; text: string; }

function AIPanel({ courseTitle, lectureTitle, open }: { courseTitle: string; lectureTitle: string; open: boolean }) {
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'ai', text: `Hi! I'm your AI Tutor for **${courseTitle}**. Ask me anything about this lecture — concepts, code, or career advice!` }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    // Placeholder AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Great question about "${q}"! The AI model will be connected here soon. Stay tuned — this panel is ready for your questions about ${lectureTitle}.`,
      }]);
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 88, right: 28, zIndex: 99,
      width: 380, maxHeight: '60vh',
      background: 'var(--surface-1)',
      border: '1px solid var(--hairline-strong)',
      borderRadius: 20,
      boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column',
      transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'all' : 'none',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #5e6ad2, #828fff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AIIcon />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>AI Tutor</div>
          <div style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>Ask about: {lectureTitle}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid rgba(94,106,210,0.2)' }}>
            BETA
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            {m.role === 'ai' && (
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #5e6ad2, #828fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
              </div>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 14px',
              borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: m.role === 'user' ? 'var(--primary)' : 'var(--surface-3)',
              color: m.role === 'user' ? '#fff' : 'var(--ink-muted)',
              fontSize: 13, lineHeight: 1.55,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Explain this concept', 'Give me an example', 'What should I learn next?'].map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{
              padding: '5px 12px', borderRadius: 999, border: '1px solid var(--hairline-strong)',
              background: 'var(--surface-2)', color: 'var(--ink-subtle)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--hairline)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything about this lecture..."
          rows={1}
          style={{
            flex: 1, padding: '9px 12px',
            background: 'var(--surface-2)', border: '1px solid var(--hairline-strong)',
            borderRadius: 12, color: 'var(--ink)', fontSize: 13, outline: 'none',
            resize: 'none', fontFamily: 'var(--font-sans)',
            lineHeight: 1.5,
          }}
        />
        <button onClick={send} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: input.trim() ? 'var(--primary)' : 'var(--surface-3)',
          color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s', flexShrink: 0,
        }}>
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
  const [activeTab, setActiveTab] = useState<'about' | 'notes' | 'resources'>('about');
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [playerHovered, setPlayerHovered] = useState(false);

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
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lectureId, completed: isCompleted })
      });
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const videoId = activeLecture ? getYouTubeId(activeLecture.videoUrl) : null;

  const {
    ready, playing, currentTime, duration, volume, muted,
    togglePlay, seekTo, setVol, toggleMute, requestFullscreen,
    playbackRate, setPlaybackRate
  } = useYouTubePlayer(videoId, 'yt-player-frame');

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
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header style={{
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 20,
      }}>
        {/* Left: back + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href={`/courses/${course.id}`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--ink-subtle)', fontSize: 13, fontWeight: 500,
            transition: 'color 0.15s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </Link>
          <div style={{ width: 1, height: 16, background: 'var(--hairline)' }} />
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #5e6ad2, #828fff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em' }}>NexusEd</span>
          </Link>
        </div>

        {/* Center: course + lecture name */}
        <div style={{ flex: 1, textAlign: 'center', overflow: 'hidden', padding: '0 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            {activeLecture?.title || 'Select a lecture'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 1 }}>
            {course.title}
          </div>
        </div>

        {/* Right: progress + sidebar toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 80, height: 3, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${totalProgress}%`, background: 'var(--primary)', borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink-subtle)', fontWeight: 600 }}>{totalProgress}%</span>
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--surface-2)', border: '1px solid var(--hairline)',
            color: 'var(--ink-subtle)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Player + Content column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Video player */}
          <div
            id="course-player-wrapper"
            style={{ position: 'relative', background: '#000', aspectRatio: '16/9', width: '100%', flexShrink: 0 }}
            onMouseEnter={() => setPlayerHovered(true)}
            onMouseLeave={() => setPlayerHovered(false)}
          >
            {/* YouTube iframe target wrapper - disables all pointer events to the iframe */}
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <div id="yt-player-frame" style={{ width: '100%', height: '100%' }} />
            </div>

            {/* ── Full-size pointer interceptor ─────────────────────────────
                Catches clicks for our custom UI since the iframe is completely
                deaf to pointer events now.
            ──────────────────────────────────────────────────────────────── */}
            <div
              style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'pointer' }}
              onClick={togglePlay}
              onDoubleClick={requestFullscreen}
            />

            {/* No video placeholder */}
            {!videoId && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#0a0a0a', zIndex: 6 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-ghost)" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div style={{ fontSize: 15, color: 'var(--ink-subtle)', fontWeight: 500 }}>No video for this lecture</div>
                <div style={{ fontSize: 13, color: 'var(--ink-ghost)' }}>Check the notes tab for content</div>
              </div>
            )}

            {/* Loading overlay */}
            {videoId && !ready && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 7 }}>
                <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
              </div>
            )}



            {/* Custom control bar — shows on hover */}
            {videoId && ready && (
              <ControlBar
                playing={playing} currentTime={currentTime} duration={duration}
                volume={volume} muted={muted} playbackRate={playbackRate}
                onTogglePlay={togglePlay} onSeek={seekTo}
                onVolumeChange={setVol} onToggleMute={toggleMute}
                onFullscreen={requestFullscreen} onPlaybackRateChange={setPlaybackRate}
                onPrev={goPrev} onNext={goNext}
                hasPrev={hasPrev} hasNext={hasNext}
              />
            )}

            {/* Always-visible hover zone for control bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, zIndex: 9 }} />
          </div>

          {/* Lecture Nav bar */}
          <div style={{
            padding: '10px 24px', background: 'var(--surface-1)',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <button onClick={goPrev} disabled={!hasPrev} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
              borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-2)',
              color: hasPrev ? 'var(--ink-muted)' : 'var(--ink-ghost)',
              fontSize: 13, fontWeight: 600, cursor: hasPrev ? 'pointer' : 'default',
            }}>
              ← Previous
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeLecture && (
                <button onClick={() => toggleComplete(activeLecture.id, !completed.has(activeLecture.id))} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  borderRadius: 8, border: '1px solid rgba(74,222,128,0.3)',
                  background: completed.has(activeLecture.id) ? 'rgba(74,222,128,0.12)' : 'transparent',
                  color: completed.has(activeLecture.id) ? 'var(--success)' : 'var(--ink-subtle)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <CheckIcon />
                  {completed.has(activeLecture.id) ? 'Completed' : 'Mark Complete'}
                </button>
              )}
            </div>
            <button onClick={goNext} disabled={!hasNext} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
              borderRadius: 8, border: 'none',
              background: hasNext ? 'var(--primary)' : 'var(--surface-2)',
              color: hasNext ? '#fff' : 'var(--ink-ghost)',
              fontSize: 13, fontWeight: 700, cursor: hasNext ? 'pointer' : 'default',
              boxShadow: hasNext ? '0 2px 12px rgba(94,106,210,0.3)' : 'none',
            }}>
              Next →
            </button>
          </div>

          {/* Tabs */}
          <div style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--hairline)', padding: '0 24px', display: 'flex', gap: 0, flexShrink: 0 }}>
            {(['about', 'notes', 'resources'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '12px 20px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? 'var(--ink)' : 'var(--ink-subtle)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                textTransform: 'capitalize', transition: 'all 0.15s',
                letterSpacing: '-0.01em',
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: 'var(--canvas)' }}>
            {activeTab === 'about' && (
              <div style={{ maxWidth: 720 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                  {activeLecture?.title || 'Select a lecture to begin'}
                </h2>
                <div style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.75, borderLeft: '2px solid var(--hairline-strong)', paddingLeft: 20 }}>
                  {course.description || 'No description available for this lecture.'}
                </div>
              </div>
            )}
            {activeTab === 'notes' && (
              <div style={{ maxWidth: 720 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>My Notes</h2>
                  <span style={{ fontSize: 12, color: 'var(--ink-subtle)', background: 'var(--surface-1)', border: '1px solid var(--hairline)', padding: '4px 10px', borderRadius: 6 }}>
                    Coming soon
                  </span>
                </div>
                <div style={{ padding: '24px', background: 'var(--surface-1)', border: '1px dashed var(--hairline-strong)', borderRadius: 12, color: 'var(--ink-subtle)', fontSize: 14, textAlign: 'center', lineHeight: 1.7 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
                  Note-taking will be available here. You'll be able to add timestamps, write markdown, and export to PDF.
                </div>
              </div>
            )}
            {activeTab === 'resources' && (
              <div style={{ maxWidth: 720 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 20 }}>Resources</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'Lecture Slides.pdf', size: '2.4 MB', icon: '📄' },
                    { name: 'Starter Code.zip', size: '1.1 MB', icon: '🗃️' },
                    { name: 'Cheat Sheet.pdf', size: '340 KB', icon: '📋' },
                  ].map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      background: 'var(--surface-1)', border: '1px solid var(--hairline)',
                      borderRadius: 10, cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: 22 }}>{r.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>{r.size}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-subtle)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar Tracklist ────────────────────────────────────────── */}
        <aside style={{
          width: sidebarCollapsed ? 0 : 320,
          flexShrink: 0,
          borderLeft: '1px solid var(--hairline)',
          background: 'var(--surface-1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--hairline)', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>
              Course Content
            </div>
            {/* Course progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalProgress}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-subtle)', fontWeight: 700, flexShrink: 0 }}>
                {completed.size}/{allLectures.length}
              </span>
            </div>
          </div>

          {/* Sections */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {(course.sections || []).map((section, sIdx) => (
              <div key={section.id}>
                {/* Section header */}
                <div style={{ padding: '10px 16px 6px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)', position: 'sticky', top: 0, zIndex: 2 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--ink-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 1 }}>
                    Section {sIdx + 1}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
                    {section.title}
                  </div>
                </div>

                {/* Lectures */}
                {(section.lectures || []).map((lecture, lIdx) => {
                  const isActive = activeLecture?.id === lecture.id;
                  const isDone = completed.has(lecture.id);
                  const hasVideo = !!getYouTubeId(lecture.videoUrl);

                  return (
                    <button
                      key={lecture.id}
                      onClick={() => goTo(lecture)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '10px 16px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: isActive ? 'rgba(94,106,210,0.1)' : 'transparent',
                        border: 'none', borderBottom: '1px solid var(--hairline)',
                        borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                        cursor: 'pointer', transition: 'background 0.12s',
                      }}
                    >
                      {/* Status icon */}
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--surface-3)',
                        border: `1px solid ${isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--hairline-strong)'}`,
                      }}>
                        {isDone ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : isActive ? (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        ) : (
                          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-ghost)' }}>{lIdx + 1}</span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--ink)' : isDone ? 'var(--ink-subtle)' : 'var(--ink-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lecture.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-ghost)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {hasVideo ? (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          ) : (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                          )}
                          {lecture.videoDuration ? formatTime(lecture.videoDuration) : hasVideo ? 'Video' : 'Article'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Empty state */}
            {(!course.sections || course.sections.length === 0) && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-subtle)', fontSize: 13 }}>
                No curriculum yet.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── AI Tutor Floating ─────────────────────────────────────────────── */}
      <AIPanel
        courseTitle={course.title}
        lectureTitle={activeLecture?.title || 'this lecture'}
        open={aiOpen}
      />
      <AIPanelButton onClick={() => setAiOpen(!aiOpen)} open={aiOpen} />

      {/* Keyboard shortcut: Space = play/pause */}
      <KeyboardShortcuts onTogglePlay={togglePlay} />
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
