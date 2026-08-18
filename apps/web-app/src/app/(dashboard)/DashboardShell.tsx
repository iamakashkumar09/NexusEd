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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-canvas font-sans selection:bg-primary-bg selection:text-ink overflow-hidden">
      
      {/* ─── Mobile Overlay ────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed md:sticky top-0 z-50 h-screen shrink-0 bg-surface-1 border-r border-hairline flex flex-col transition-all duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'w-16' : 'w-60'}
      `}>
        {/* Logo + collapse button */}
        <div className={`h-16 flex items-center border-b border-hairline shrink-0 ${collapsed ? 'justify-center px-0' : 'justify-between pl-5 pr-4'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg shrink-0 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-glow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                  <line x1="12" y1="2" x2="12" y2="22"/>
                  <line x1="2" y1="8.5" x2="22" y2="8.5"/>
                </svg>
              </div>
              <span className="text-[15px] font-extrabold text-ink tracking-tight whitespace-nowrap">
                NexusEd
              </span>
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-8 h-8 rounded-lg bg-transparent border border-transparent text-ink-subtle hover:text-ink hover:bg-surface-2 items-center justify-center transition-colors shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronIcon collapsed={collapsed} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden flex w-8 h-8 rounded-lg bg-transparent border border-transparent text-ink-subtle hover:text-ink hover:bg-surface-2 items-center justify-center transition-colors shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-0.5 custom-scrollbar">
          {NAV_ITEMS(isInstructor).map(({ href, label, icon }) => {
            const isActive = pathname === href || (pathname.startsWith(href) && href !== '/dashboard');
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap overflow-hidden
                  ${collapsed ? 'justify-center p-2.5' : 'justify-start px-3 py-2.5'}
                  ${isActive ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'}
                `}
              >
                <span className="shrink-0 flex items-center justify-center">{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user chip */}
        <div className={`p-3 border-t border-hairline flex ${collapsed ? 'justify-center' : 'items-center gap-2.5'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#a682ff] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <div className="text-[13px] font-semibold text-ink truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-ink-subtle truncate capitalize">
                {(profile.role || 'student').toLowerCase()}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Column ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-screen relative">
        
        {/* ─── Top Bar ─────────────────────────────────────────────── */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-hairline bg-canvas/80 backdrop-blur-xl sticky top-0 z-30">
          
          <div className="flex items-center flex-1 gap-2 md:gap-0">
            {/* Mobile Hamburger */}
            <button 
              className="md:hidden p-1.5 -ml-1.5 text-ink-subtle hover:text-ink rounded-md hover:bg-surface-2 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <HamburgerIcon />
            </button>

            {/* Left: Search */}
            <div className="relative flex-1 max-w-[280px] md:max-w-[380px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none flex">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-1 border border-hairline rounded-full py-1.5 pl-9 pr-8 text-[13px] text-ink outline-none transition-all focus:border-primary focus:shadow-glow placeholder:text-ink-ghost"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink flex p-0.5 rounded-full hover:bg-surface-2 transition-colors"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Notification bell */}
            <button className="relative w-8 h-8 rounded-lg bg-transparent border border-transparent text-ink-subtle hover:text-ink hover:bg-surface-1 transition-colors flex items-center justify-center">
              <BellIcon />
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-primary border-[1.5px] border-canvas" />
            </button>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 p-1 pr-2.5 rounded-full border transition-all ${profileOpen ? 'bg-surface-1 border-hairline-strong' : 'bg-transparent border-transparent hover:bg-surface-1 hover:border-hairline'}`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[#a682ff] flex items-center justify-center text-[11px] font-bold text-white">
                  {initials}
                </div>
                <span className="hidden md:block text-[13px] font-medium text-ink max-w-[100px] truncate">
                  {profile.firstName || profile.email.split('@')[0]}
                </span>
                <span className={`text-ink-subtle transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}>
                  <DropChevronIcon />
                </span>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-surface-1 border border-hairline rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 origin-top-right">
                  <div className="p-3.5 border-b border-hairline">
                    <div className="text-[13px] font-semibold text-ink mb-0.5 truncate">{displayName}</div>
                    <div className="text-xs text-ink-subtle truncate">{profile.email}</div>
                  </div>
                  <div className="p-1.5">
                    <DropdownItem href="/profile" icon={<UserIcon />} label="My Profile" onClick={() => setProfileOpen(false)} />
                    <DropdownItem href="/settings" icon={<SettingsIcon />} label="Settings" onClick={() => setProfileOpen(false)} />
                    <div className="h-px bg-hairline my-1.5" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-error hover:bg-error/10 transition-colors text-left"
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
          className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-up custom-scrollbar"
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
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-ink-muted text-[13px] font-medium hover:bg-surface-2 hover:text-ink transition-colors"
    >
      <span className="flex text-inherit">{icon}</span>
      {label}
    </Link>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function HamburgerIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function BookIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function ChartIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CompassIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>; }
function MessageIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function UserIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function SettingsIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
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
