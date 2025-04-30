
import { useState } from 'react';
import Dashboard from './components/Dashboard.tsx'
import Login from './components/Login.tsx'
// added email and little change

function App() {
  const [sessionToken, setSessionToken] = useState<string>('');
  return (
    <div className="min-h-screen min-w-screen flex flex-col gap-4 bg-gray-100">
      <header>
        <Login loggedIn={!(sessionToken==='')} setSessionToken={setSessionToken}/>
      </header>
      <main>
        <Dashboard sessionToken={sessionToken}/>
      </main>
    </div>
  )
}

export default App