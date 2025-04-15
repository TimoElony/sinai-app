import { useState } from "react";
import ClimbingAreas from "./ClimbingAreas";

export default function Dashboard() {

  const [view, setView] = useState('none');
  
  const clickHandler = (selection: string) => {
    setView(selection);
  }

    return (
      <div className="flex flex-col items-center gap-4 rounded-xl p-4 mx-4">
        <h2>Online Routes Database</h2>
        <div className="flex flex-row flex-wrap gap-4">
          <button onClick={() => clickHandler('areas')} className="bg-gray-600 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Climbing Areas</h3>
            <p className="text-gray-300">Browse all areas</p>
          </button>
          <button onClick={() => clickHandler('map')} className="bg-gray-600 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Map</h3>
            <p className="text-gray-300">Check via map</p>
          </button>
          <button onClick={() => clickHandler('routes')} className="bg-gray-600 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Routes</h3>
            <p className="text-gray-300">Search routes directly</p>
          </button>
        </div>
        {view === 'areas' && (
          <ClimbingAreas />
          )}
      </div>
    );
}