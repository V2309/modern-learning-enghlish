'use client';

import React from 'react';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { AppSidebar, AppHeader, AppModals } from '@/components/workspace/layout';

interface WorkspaceLayoutClientProps {
  userId: string;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function WorkspaceLayoutClient({
  userId,
  userName,
  userEmail,
  children,
}: WorkspaceLayoutClientProps) {
  return (
    <WorkspaceProvider initialUser={{ userId, userName, userEmail }}>
      <div className="workspace-container flex h-full w-full overflow-hidden bg-white text-neutral-800 dark:bg-[#191919] dark:text-neutral-200 font-sans">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Right Main Content Area */}
        <main className="relative flex flex-1 flex-col overflow-y-auto bg-white dark:bg-[#191919] font-sans">
          <AppHeader />
          <div className="flex-1 pb-32 font-sans">
            {children}
          </div>
        </main>

        {/* Global Modals (Command Palette, Settings, Trash) */}
        <AppModals />
      </div>
    </WorkspaceProvider>
  );
}
