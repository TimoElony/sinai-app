"use client";

import { useState } from 'react';
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
      <footer className="mt-auto bg-gray-800 text-gray-300 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Imprint / Impressum</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">Responsible for content:</p>
              <p>Timo Elony</p>
              <p>Sauerbruchstr. 8</p>
              <p>42549 Velbert</p>
              <p>Germany</p>
              <p>Tel: +49 157 70260734</p>
              <p>Email: <a href="mailto:timo.elony@gmail.com" className="text-blue-400 hover:text-blue-300">timo.elony@gmail.com</a></p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">Purpose of this website:</p>
              <p className="text-xs mb-3">
                This website is a purely informational resource providing access to a database of climbing routes in Egypt. 
                No commercial services, tour bookings, or guided trips are offered through this platform.
              </p>
              <p className="text-xs font-semibold text-white mb-2">User-Generated Content:</p>
              <p className="text-xs mb-3">
                This website allows registered users to contribute and upload content. The operator takes no responsibility 
                for the accuracy, completeness, or legality of content uploaded by third parties. Users are solely responsible 
                for the content they submit. If you believe any content violates your rights or is inappropriate, please contact us.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs">
                © {new Date().getFullYear()} Timo Elony. All rights reserved.
              </p>
              <p className="text-xs mt-2">
                All content on this website, including but not limited to text, images, logos, graphics, and data, 
                is the property of Timo Elony and is protected by international copyright laws.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
