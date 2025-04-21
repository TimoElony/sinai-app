import TopSpot from './components/TopSpot.tsx'
import Nav from './components/Nav.tsx'
import Dashboard from './components/Dashboard.tsx'
import Highlights from './components/Highlights.tsx'


function App() {

  return (
    <div className="min-h-screen min-w-screen flex flex-col gap-4 bg-gray-100 px-4">
      <header className="flex justify-between items-center py-2">
        <TopSpot />
        <Nav />
      </header>
      <main className="flex-grow gap-4">
        <Dashboard/>
      </main>
      <footer className='grid grid-cols-3 align-middle gap-4 p-4 bg-gray-200'>
        <div/>
        <div/>
        <p className="text-sm">Copyright</p>
      </footer>
    </div>
  )
}

export default App