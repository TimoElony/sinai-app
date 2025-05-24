
import { useState } from 'react';
import Dashboard from './components/Dashboard.tsx'
import Login from './components/Login.tsx'
import { Toaster } from './components/ui/sonner.tsx';
// added email and little change

function App() {
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
  )
}

export default App