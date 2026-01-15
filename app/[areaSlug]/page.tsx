"use client";

import { useState } from 'react';
import Dashboard from '../../src/components/Dashboard';
import Login from '../../src/components/Login';
import { Toaster } from '../../src/components/ui/sonner';

export default function AreaPage({ params }: { params: Promise<{ areaSlug: string }> }) {
  const [sessionToken, setSessionToken] = useState<string>('');
  const [resolvedParams, setResolvedParams] = useState<{ areaSlug: string } | null>(null);

  // Resolve params on mount
  if (!resolvedParams) {
    params.then(setResolvedParams);
    return null;
  }

  // Convert slug to area name (e.g., "st-catherine" -> "St Catherine")
  const areaName = resolvedParams.areaSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <div className="min-h-screen flex flex-col gap-4 bg-gray-100">
      <header>
        <Login loggedIn={!(sessionToken==='')} setSessionToken={setSessionToken}/>
      </header>
      <main className='w-full lg:max-w-3xl mx-auto px-4'>
        <Dashboard sessionToken={sessionToken} initialArea={areaName}/>
      </main>
      <Toaster/>
    </div>
  );
}
