
import { useState } from 'react';
import Dashboard from './components/Dashboard.tsx'
import Login from './components/Login.tsx'
// added email and little change

function App() {
  const [sessionToken, setSessionToken] = useState<string>('');
  const [showLogin, setShowLogin] = useState(false);
  return (
    <div className="min-h-screen min-w-screen flex flex-col gap-4 bg-gray-100">
      <header>
        <button className='bg-white underline' onClick={()=>setShowLogin(!showLogin)}>Login</button>
        <Login loggedIn={!(sessionToken==='')} setSessionToken={setSessionToken}/>
      </header>
      <main>
        <Dashboard sessionToken={sessionToken}/>
      </main>
    </div>
  )
}

export default App