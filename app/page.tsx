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
              <p className="font-semibold text-white mb-2">Information according to § 5 TMG:</p>
              <p>Timo Elony</p>
              <p>Sauerbruchstr. 8</p>
              <p>42549 Velbert</p>
              <p>Germany</p>
            </div>

            <div>
              <p className="font-semibold text-white mb-2">Contact:</p>
              <p>Tel: +49 157 70260734</p>
              <p>Email: <a href="mailto:timo.elony@gmail.com" className="text-blue-400 hover:text-blue-300">timo.elony@gmail.com</a></p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">Purpose of this website:</p>
              <p className="text-xs mb-3">
                This website is a purely informational, non-commercial resource providing access to a database of climbing routes in Egypt. 
                No commercial services, tour bookings, guided trips, or paid services are offered through this platform.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">User-Generated Content & Liability:</p>
              <p className="text-xs mb-2">
                This website allows registered users to contribute and upload content. The operator takes no responsibility 
                for the accuracy, completeness, or legality of content uploaded by third parties. Users are solely responsible 
                for the content they submit.
              </p>
              <p className="text-xs mb-3">
                All information about climbing routes, grades, conditions, and access is provided without guarantee of accuracy 
                or completeness. Route information may be outdated, incorrect, or change without notice. Users must verify all 
                information independently before use.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">Safety Warning:</p>
              <p className="text-xs mb-3">
                Rock climbing and mountaineering are inherently dangerous activities that can result in serious injury or death. 
                Users of this website engage in climbing activities entirely at their own risk. The operator assumes no liability 
                for accidents, injuries, or damages that may occur from the use of information provided on this website. 
                Always climb with proper equipment, training, and safety precautions.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">Liability for Content:</p>
              <p className="text-xs mb-3">
                As a service provider, we are responsible for our own content on these pages in accordance with general law. 
                However, we are not obligated to monitor transmitted or stored third-party information or to investigate 
                circumstances that indicate illegal activity. If you become aware of any content that violates rights or is 
                inappropriate, please contact us immediately.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">Liability for Links:</p>
              <p className="text-xs mb-3">
                Our website may contain links to external third-party websites. We have no influence on the content of these 
                linked pages and therefore cannot accept any liability for them. The respective provider or operator of the 
                pages is always responsible for the content of the linked pages.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">Data Protection / Privacy:</p>
              <p className="text-xs mb-2">
                This website processes personal data (user accounts, uploaded content, login information). We take the protection 
                of your personal data seriously and treat it confidentially in accordance with legal data protection regulations 
                and this privacy notice.
              </p>
              <p className="text-xs mb-2">
                <span className="font-semibold">Data Collected:</span> When you create an account, we collect and store your email address, 
                username, and any content you upload (routes, topos, descriptions). We also log access data for security purposes.
              </p>
              <p className="text-xs mb-2">
                <span className="font-semibold">Purpose:</span> Your data is used solely to provide the functionality of this website 
                (user accounts, content management) and to maintain security. We do not sell, share, or use your data for marketing purposes.
              </p>
              <p className="text-xs mb-2">
                <span className="font-semibold">Data Storage:</span> Your data is stored securely on servers located in [hosting location]. 
                We implement appropriate technical and organizational measures to protect your data.
              </p>
              <p className="text-xs mb-2">
                <span className="font-semibold">Your Rights:</span> You have the right to access, correct, delete, or restrict processing 
                of your personal data. To exercise these rights, please contact us at the email above.
              </p>
              <p className="text-xs mb-3">
                <span className="font-semibold">Cookies:</span> This website uses essential cookies for login functionality. No tracking 
                or analytics cookies are used.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs font-semibold text-white mb-2">Dispute Resolution:</p>
              <p className="text-xs mb-3">
                The European Commission provides a platform for online dispute resolution (ODR): 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>. 
                We are not obligated to participate in dispute resolution procedures before a consumer arbitration board, 
                as this is a non-commercial informational website.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs">
                © {new Date().getFullYear()} Timo Elony. All rights reserved.
              </p>
              <p className="text-xs mt-2">
                All content on this website, including but not limited to text, images, logos, graphics, and data, 
                is the property of Timo Elony or respective content contributors and is protected by international copyright laws. 
                Unauthorized reproduction or distribution is prohibited.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
