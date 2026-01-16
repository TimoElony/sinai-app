"use client";

import { useState } from 'react';
import Link from 'next/link';
import Dashboard from '../src/components/Dashboard';
import Login from '../src/components/Login';
import { Toaster } from '../src/components/ui/sonner';

export default function Home() {
  const [sessionToken, setSessionToken] = useState<string>('');
  
  return (
    <div className="min-h-screen flex flex-col gap-4 bg-gray-100">
      <header>
        <Login loggedIn={!(sessionToken==='')} setSessionToken={setSessionToken}/>
      </header>
      <main className='w-full lg:max-w-3xl mx-auto px-4'>
        <Dashboard sessionToken={sessionToken}/>
      </main>
      <Toaster/>
      <footer className="mt-auto bg-gray-900 text-gray-200 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          <p>© {new Date().getFullYear()} Timo Elony</p>
          <Link href="/imprint" className="text-blue-400 hover:text-blue-300 underline">Imprint / Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
