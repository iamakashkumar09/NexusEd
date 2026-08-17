'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardShellProps {
  children: React.ReactNode;
  profile: {
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}

const NAV_ITEMS = (isInstructor: boolean) => [
  { href: '/dashboard', label: 'Dashboard', icon: <GridIcon /> },
  { href: '/courses', label: isInstructor ? 'My Courses' : 'My Courses', icon: <BookIcon /> },
  ...(isInstructor
    ? [
        { href: '/analytics', label: 'Analytics', icon: <ChartIcon /> },
        { href: '/courses/create', label: 'Create Course', icon: <PlusIcon /> },
      ]
    : [{ href: '/catalog', label: 'Browse Catalog', icon: <CompassIcon /> }]),
  { href: '/messages', label: 'Messages', icon: <MessageIcon /> },
  { href: '/profile', label: 'My Profile', icon: <UserIcon /> },
  { href: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isInstructor = profile.role === 'INSTRUCTOR' || profile.role === 'instructor';
  const initials = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((n) => n![0])
    .join('')
    .toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U';
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    // Clear cookies client-side as well
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    // Redirect to login page and ensure full state reset
    window.location.href = '/login';
  };

  const SIDEBAR_W = collapsed ? 64 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas)' }}>

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside style={{
        width: SIDEBAR_W,
        flexShrink: 0,
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--hairline)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        height: '100vh',
        willChange: 'width',
      }}>

        {/* Logo + collapse button */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 12px' : '0 16px 0 20px',
          borderBottom: '1px solid var(--hairline)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #5e6ad2 0%, #828fff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(94,106,210,0.4)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                  <line x1="12" y1="2" x2="12" y2="22"/>
                  <line x1="2" y1="8.5" x2="22" y2="8.5"/>
                </svg>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.05em', whiteSpace: 'nowrap' }}>
                NexusEd
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'transparent', border: '1px solid var(--hairline)',
              color: 'var(--ink-subtle)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.background = 'var(--surface-2)'; (e.currentTarget).style.color = 'var(--ink)'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--ink-subtle)'; }}
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 8px' }}>
          {NAV_ITEMS(isInstructor).map(({ href, label, icon }) => {
            const isActive = pathname === href || (pathname.startsWith(href) && href !== '/dashboard');
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '9px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8,
                  marginBottom: 2,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--ink-muted)',
                  background: isActive ? 'rgba(94,106,210,0.1)' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-muted)';
                  }
                }}
              >
                <span style={{ flexShrink: 0, color: 'inherit', display: 'flex' }}>{icon}</span>
                {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user chip */}
        {!collapsed && (
          <div style={{
            padding: '12px 12px',
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #a682ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                {(profile.role || 'student').toLowerCase()}
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ padding: '12px 0', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #a682ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
            }}>
              {initials}
            </div>
          </div>
        )}
      </aside>

      {/* ─── Main Column ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* ─── Top Bar ─────────────────────────────────────────────── */}
        <header style={{
          height: 56,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--hairline)',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>

          {/* Left: Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--ink-subtle)', display: 'flex', pointerEvents: 'none',
            }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search courses, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--surface-1)',
                border: '1px solid var(--hairline)',
                borderRadius: 999,
                padding: '8px 16px 8px 36px',
                color: 'var(--ink)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(94,106,210,0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--ink-subtle)', cursor: 'pointer',
                  display: 'flex', padding: 0,
                }}
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Notification bell */}
            <button style={{
              width: 36, height: 36, borderRadius: 8, background: 'transparent',
              border: '1px solid var(--hairline)', color: 'var(--ink-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.background = 'var(--surface-1)'; (e.currentTarget).style.color = 'var(--ink)'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = 'var(--ink-subtle)'; }}
            >
              <BellIcon />
              {/* Badge */}
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--primary)',
                border: '1.5px solid var(--canvas)',
              }} />
            </button>

            {/* Profile dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 10px 5px 5px',
                  background: profileOpen ? 'var(--surface-1)' : 'transparent',
                  border: '1px solid var(--hairline)',
                  borderRadius: 999, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget).style.background = 'var(--surface-1)'; }}
                onMouseLeave={(e) => { if (!profileOpen) (e.currentTarget).style.background = 'transparent'; }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), #a682ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.firstName || profile.email.split('@')[0]}
                </span>
                <span style={{ color: 'var(--ink-subtle)', display: 'flex', transition: 'transform 0.15s', transform: profileOpen ? 'rotate(180deg)' : 'none' }}>
                  <DropChevronIcon />
                </span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 220,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.12s ease',
                  zIndex: 100,
                }}>
                  <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                  {/* User info header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--hairline)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.email}
                    </div>
                  </div>
                  {/* Menu items */}
                  <div style={{ padding: '6px' }}>
                    <DropdownItem href="/profile" icon={<UserIcon />} label="My Profile" onClick={() => setProfileOpen(false)} />
                    <DropdownItem href="/settings" icon={<SettingsIcon />} label="Settings" onClick={() => setProfileOpen(false)} />
                    <div style={{ height: 1, background: 'var(--hairline)', margin: '6px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '8px 10px', borderRadius: 6,
                        background: 'transparent', border: 'none',
                        color: '#ff6b6b', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(238,0,0,0.08)'; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
                    >
                      <LogoutIcon />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── Page Content ─────────────────────────────────────────── */}
        <main
          key={pathname}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 32,
            animation: 'pageEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Dropdown Item ──────────────────────────────────────────────────────────

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 6,
        color: 'var(--ink-muted)', fontSize: 13, fontWeight: 500,
        textDecoration: 'none', transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-muted)'; }}
    >
      <span style={{ display: 'flex', color: 'inherit' }}>{icon}</span>
      {label}
    </Link>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function BookIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function ChartIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CompassIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>; }
function MessageIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function UserIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function SettingsIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function BellIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function LogoutIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function DropChevronIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return collapsed
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
