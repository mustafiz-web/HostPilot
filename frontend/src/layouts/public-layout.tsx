import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
