'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarNavProps {
  isInstructor: boolean;
}

export function SidebarNav({ isInstructor }: SidebarNavProps) {
  const pathname = usePathname();

  const getNavItemClass = (path: string) => {
    const isActive = pathname === path || (pathname.startsWith(path) && path !== '/dashboard');
    return `flex items-center px-3 py-2.5 rounded-geist font-sans text-sm font-medium mb-1 transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
    }`;
  };

  return (
    <nav className="flex flex-col gap-1">
      <Link href="/dashboard" className={getNavItemClass('/dashboard')}>
        Dashboard
      </Link>
      
      <Link href="/courses" className={getNavItemClass('/courses')}>
        {isInstructor ? 'My Courses (Taught)' : 'My Courses'}
      </Link>
      
      {isInstructor && (
        <>
          <Link href="/analytics" className={getNavItemClass('/analytics')}>
            Analytics
          </Link>
          <Link href="/courses/create" className={getNavItemClass('/courses/create')}>
            Create Course
          </Link>
        </>
      )}
      
      {!isInstructor && (
        <Link href="/catalog" className={getNavItemClass('/catalog')}>
          Browse Catalog
        </Link>
      )}
      
      <Link href="/messages" className={getNavItemClass('/messages')}>
        Messages
      </Link>
      
      <Link href="/profile" className={getNavItemClass('/profile')}>
        My Profile
      </Link>

      <Link href="/settings" className={getNavItemClass('/settings')}>
        Settings
      </Link>
    </nav>
  );
}
