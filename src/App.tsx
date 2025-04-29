
import Dashboard from './components/Dashboard.tsx'
import Login from './components/Login.tsx'
// added email and little change

function App() {

  return (
    <div className="min-h-screen min-w-screen flex flex-col gap-4 bg-gray-100">
      <header>
        <Login/>
      </header>
      <main>
        <Dashboard/>
      </main>
    </div>
  )
}

export default App