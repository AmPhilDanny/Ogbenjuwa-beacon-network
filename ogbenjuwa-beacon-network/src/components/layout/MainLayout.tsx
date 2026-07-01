import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { EmergencyAlert } from '../emergency/EmergencyAlert';
import { ActiveAlertBanner } from '../emergency/ActiveAlertBanner';
import { BottomNav } from './BottomNav';
import { OfflineIndicator } from '../OfflineIndicator';
import { useAlert } from '@/contexts/AlertContext';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isActive, triggerAlert } = useAlert();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        onSOSClick={() => triggerAlert()}
      />
      <ActiveAlertBanner />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
      <OfflineIndicator />
      
      {isActive && <EmergencyAlert />}
    </div>
  );
}
