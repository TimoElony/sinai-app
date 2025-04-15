import { useState } from 'react'
import './App.css'
import TopSpot from './components/TopSpot.tsx'
import Nav from './components/Nav.tsx'
import Dashboard from './components/Dashboard.tsx'
import Highlights from './components/Highlights.tsx'


function App() {

  return (
    <div className="min-h-screen min-w-screen flex flex-col gap-4 bg-gray-800">
      <header className="grid grid-cols-3 items-center py-2">
        <div className="flex justify-center">
          <TopSpot />
        </div>
        <div className='flex justify-center'></div>
        <nav className='flex justify-center'>
          <Nav />
        </nav>
      </header>
      <main className="flex items-center flex-col flex-grow gap-4">
        <Dashboard/>
        <Highlights />
      </main>
      <footer className='grid grid-cols-3 align-middle gap-4 p-4 bg-gray-600'>
        <div/>
        <div/>
        <p className="text-sm">Copyright</p>
      </footer>
    </div>
  )
}

export default App