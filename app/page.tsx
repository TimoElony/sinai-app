"use client";

import { useState } from 'react';
import Dashboard from '../src/components/Dashboard';
import Login from '../src/components/Login';
import { Toaster } from '../src/components/ui/sonner';

export default function Home() {
  const [sessionToken, setSessionToken] = useState<string>('');
  
  return (
    <div className="min-h-screen min-w-screen flex flex-col gap-4 bg-gray-100">
      <header>
        <Login loggedIn={!(sessionToken==='')} setSessionToken={setSessionToken}/>
      </header>
      <main className='lg:w-3xl lg:mx-auto'>
        <Dashboard sessionToken={sessionToken}/>
      </main>
      <Toaster/>
    </div>
  );
}
