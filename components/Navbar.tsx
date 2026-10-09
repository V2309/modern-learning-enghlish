'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { UserButton, useUser } from '@clerk/nextjs';

interface ActivityItem {
  name: string;
  path: string;
}

const ACTIVITY_ITEMS: ActivityItem[] = [
  { name: 'Từ vựng', path: '/vocabulary' },
  { name: 'Khóa học', path: '/courses' },
  { name: 'Shadowing', path: '/shadowing' },
  { name: 'Dictation', path: '/dictation' },
  { name: 'Mục tiêu', path: '/todo' },
];

const Navbar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [mobileActivitiesOpen, setMobileActivitiesOpen] = useState(true);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsActivitiesOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsActivitiesOpen(false);
    }, 180);
  };

  // Primary top-level navigation items
  const mainNavItems = [
    { name: 'Trang chủ', path: '/', requiresAuth: false },
    { name: 'Workspace', path: '/workspace', requiresAuth: false },
  ];

  // Activities dropdown is active if current path starts with any child item's path
  const isActivitiesActive = ACTIVITY_ITEMS.some((item) =>
    pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
  );

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setIsActivitiesOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="w-full">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 text-lg sm:text-xl font-black text-foreground tracking-tight shrink-0"
            onClick={handleLinkClick}
          >
            <span>Linguify</span>
            <span className="text-[#f28500] text-2xl leading-none">.</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
            {/* Desktop & Tablet Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5 lg:gap-3 xl:gap-4">
              {/* Main Top Nav Items */}
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'text-xs lg:text-sm font-semibold transition-colors hover:text-foreground whitespace-nowrap px-3 py-1.5 rounded-lg',
                    pathname === item.path
                      ? 'text-[#f28500] font-bold bg-[#f28500]/10'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {/* ── Submenu Dropdown Trigger: "Hoạt động" ── */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setIsActivitiesOpen((prev) => !prev)}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs lg:text-sm font-semibold transition-all hover:text-foreground whitespace-nowrap px-3 py-1.5 rounded-lg cursor-pointer',
                    isActivitiesActive
                      ? 'text-[#f28500] font-bold bg-[#f28500]/10'
                      : isActivitiesOpen
                      ? 'text-foreground bg-muted/60'
                      : 'text-muted-foreground'
                  )}
                  aria-expanded={isActivitiesOpen}
                  aria-haspopup="true"
                >
                  <span>Hoạt động</span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 stroke-[2.5]',
                      isActivitiesOpen && 'rotate-180 text-[#f28500]'
                    )}
                  />
                </button>

                {/* Dropdown Menu Popup with Smooth Animation */}
                <AnimatePresence>
                  {isActivitiesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl bg-white/95 dark:bg-[#0f1115]/95 backdrop-blur-md border border-[#e5e7eb] dark:border-[#1f2937] shadow-xl p-1.5 z-50 overflow-hidden"
                    >
                      {/* Submenu Item List without leading icon or description */}
                      <div className="space-y-0.5">
                        {ACTIVITY_ITEMS.map((item) => {
                          const isActive =
                            pathname === item.path ||
                            (item.path !== '/' && pathname.startsWith(item.path));

                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={handleLinkClick}
                              className={cn(
                                'group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer',
                                isActive
                                  ? 'bg-[#f28500]/10 text-[#f28500] font-bold'
                                  : 'hover:bg-[#f3f4f6] dark:hover:bg-[#14171b] text-foreground'
                              )}
                            >
                              <span
                                className={cn(
                                  'text-xs font-bold tracking-tight transition-colors duration-200',
                                  isActive
                                    ? 'text-[#f28500]'
                                    : 'text-foreground group-hover:text-[#f28500]'
                                )}
                              >
                                {item.name}
                              </span>

                              {/* Lucide ArrowRight with Hover Translation */}
                              <ArrowRight
                                className={cn(
                                  'h-3.5 w-3.5 stroke-[2.5] transition-all duration-200 shrink-0 ml-2',
                                  isActive
                                    ? 'text-[#f28500] translate-x-0.5'
                                    : 'text-muted-foreground/40 group-hover:text-[#f28500] group-hover:translate-x-1'
                                )}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dashboard Link (requires auth) */}
              {isSignedIn && (
                <Link
                  href="/dashboard"
                  className={cn(
                    'text-xs lg:text-sm font-semibold transition-colors hover:text-foreground whitespace-nowrap px-3 py-1.5 rounded-lg',
                    pathname === '/dashboard'
                      ? 'text-[#f28500] font-bold bg-[#f28500]/10'
                      : 'text-muted-foreground'
                  )}
                >
                  Tổng quan
                </Link>
              )}

              {/* My Courses Link (requires auth) */}
              {isSignedIn && (
                <Link
                  href="/my-courses"
                  className={cn(
                    'text-xs lg:text-sm font-semibold transition-colors hover:text-foreground whitespace-nowrap px-3 py-1.5 rounded-lg',
                    pathname === '/my-courses'
                      ? 'text-[#f28500] font-bold bg-[#f28500]/10'
                      : 'text-muted-foreground'
                  )}
                >
                  Khóa học của tôi
                </Link>
              )}
            </div>

            {/* Toggle Theme Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-muted hover:bg-accent transition-all text-foreground cursor-pointer shrink-0"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Desktop Account States */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-border min-h-[36px] shrink-0">
              {!isLoaded ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : isSignedIn && clerkUser ? (
                <div className="flex items-center gap-2.5">
                  <div className="hidden xl:flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-foreground leading-none">
                      {clerkUser.fullName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {clerkUser.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <UserButton />
                </div>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="px-3.5 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all whitespace-nowrap shadow-xs"
                >
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Responsive Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-muted hover:bg-accent transition-all text-foreground cursor-pointer shrink-0"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Dropdown / Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2 flex flex-col">
              {/* Main Nav Items */}
              {mainNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Accordion for "Hoạt động" */}
              <div className="border border-border/60 rounded-2xl overflow-hidden bg-muted/20">
                <button
                  type="button"
                  onClick={() => setMobileActivitiesOpen(!mobileActivitiesOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span className={cn('font-bold', isActivitiesActive && 'text-[#f28500]')}>
                    Hoạt động
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200 stroke-[2.5]',
                      mobileActivitiesOpen && 'rotate-180 text-[#f28500]'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {mobileActivitiesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-2 pb-2 space-y-1 border-t border-border/40 pt-1"
                    >
                      {ACTIVITY_ITEMS.map((item) => {
                        const isActive =
                          pathname === item.path ||
                          (item.path !== '/' && pathname.startsWith(item.path));

                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={handleLinkClick}
                            className={cn(
                              'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                              isActive
                                ? 'bg-[#f28500]/15 text-[#f28500] font-bold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <span>{item.name}</span>
                            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] text-muted-foreground/50 group-hover:text-[#f28500] group-hover:translate-x-1 transition-all" />
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dashboard Link for mobile */}
              {isSignedIn && (
                <Link
                  href="/dashboard"
                  onClick={handleLinkClick}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === '/dashboard'
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  Tổng quan
                </Link>
              )}

              {/* My courses for mobile */}
              {isSignedIn && (
                <Link
                  href="/my-courses"
                  onClick={handleLinkClick}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === '/my-courses'
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  Khóa học của tôi
                </Link>
              )}

              {/* Account / Login Area */}
              <div className="pt-4 mt-2 border-t border-border space-y-2">
                {!isLoaded ? (
                  <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
                ) : isSignedIn && clerkUser ? (
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border border-border/40 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground leading-tight">
                        {clerkUser.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {clerkUser.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>
                    <UserButton />
                  </div>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    onClick={handleLinkClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-primary-foreground bg-primary text-sm font-bold hover:bg-primary/90 transition-all text-center shadow-lg shadow-primary/20"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
