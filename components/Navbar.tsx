'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { UserButton, useUser } from '@clerk/nextjs';

const Navbar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();

  const allNavItems = [
    { name: 'Home', path: '/', requiresAuth: false },
    { name: 'Vocabulary', path: '/vocabulary', requiresAuth: true },
    { name: 'Courses', path: '/courses', requiresAuth: false },
    { name: 'Shadowing', path: '/shadowing', requiresAuth: true },
    { name: 'Dictation', path: '/dictation', requiresAuth: true },
    { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.requiresAuth || isSignedIn
  );

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary" onClick={handleLinkClick}>
            <span>Linguify</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 mr-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.path ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {isSignedIn && (
                <Link
                  href="/my-courses"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === '/my-courses' ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  My Courses
                </Link>
              )}
            </div>

            {/* Toggle Theme Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-muted hover:bg-accent transition-all text-foreground cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Desktop Account States */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-border min-h-[40px]">
              {!isLoaded ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : isSignedIn && clerkUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-foreground leading-none">{clerkUser.fullName}</span>
                    <span className="text-[10px] text-muted-foreground">{clerkUser.primaryEmailAddress?.emailAddress}</span>
                  </div>
                  <UserButton />
                </div>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all"
                >
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Responsive Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-muted hover:bg-accent transition-all text-foreground cursor-pointer"
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
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              {isSignedIn && (
                <Link
                  href="/my-courses"
                  onClick={handleLinkClick}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    pathname === '/my-courses'
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  My Courses
                </Link>
              )}

              <div className="pt-4 mt-2 border-t border-border space-y-2">
                {!isLoaded ? (
                  <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
                ) : isSignedIn && clerkUser ? (
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border border-border/40 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground leading-tight">{clerkUser.fullName}</span>
                      <span className="text-[10px] text-muted-foreground">{clerkUser.primaryEmailAddress?.emailAddress}</span>
                    </div>
                    <UserButton />
                  </div>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    onClick={handleLinkClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-primary text-sm font-bold hover:bg-primary/90 transition-all text-center shadow-lg shadow-primary/20"
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
