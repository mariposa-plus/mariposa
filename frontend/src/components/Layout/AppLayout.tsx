'use client';

import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: '260px',
          flex: 1,
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
