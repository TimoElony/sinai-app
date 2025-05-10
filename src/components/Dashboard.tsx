import { useEffect, useState } from "react";
import ClimbingAreas from "./ClimbingAreas.tsx";
import ClimbingRoutes from "./ClimbingRoutes.tsx";
import { ClimbingArea, AreaDetails} from "../types/types.ts";
import MapView from "./MapView.tsx";




export default function Dashboard({sessionToken}: {sessionToken: string}) {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('none');
  const [areas, setAreas] = useState<ClimbingArea[]>([]);
  const [areaDetails, setAreaDetails] = useState<AreaDetails>();


  useEffect ( () => {
    setLoading(true);
    try{
      fetchAreas();
    } catch(err) {
      console.error('error fetching areas');
    }
  },[]);

  useEffect(() => {

    if (areas) {
      fetchDetails(areas[0]);
    }
  },[areas])

  const fetchAreas = async () => {
    try {
      const response = await fetch('https://sinai-backend.onrender.com/climbingareas');
      const data = await response.json();
      console.log(data);
      setAreas(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  }


  const areaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'none') {
      setAreaDetails(undefined);
      return;
    }
    const area = areas.find(area => area.name === selectedValue);
    if (area) {
        fetchDetails(area);
    } else {
        console.error("Area not found");
    }
  }

  const fetchDetails = async (area: ClimbingArea | undefined) => {
    try {
      if(area) {
        const response = await fetch(`https://sinai-backend.onrender.com/climbingareas/details/${area.name}`);
        const responseData = await response.json();        

        setAreaDetails({...area, ...responseData});
        console.log('areaDetails fetched and set');

      }
    } catch (error) {
      console.error("Error fetching area details:", error);
    }
  };

  const clickHandler = (selection: string) => {
    setView(selection);
  }

    return (
      <div className="grid grid-cols-8 gap-4 rounded-xl mx-2">

        <div className="col-span-8 md:col-span-6 md:col-start-2">
          <h1>Online Routes Database</h1>
          <div className="flex flex-wrap gap-4">
            <button className="StandardButton" onClick={() => clickHandler('areas')}>
              <h2>Climbing Areas</h2>
              <p>Browse all areas</p>
            </button>
            <button className="StandardButton" onClick={() => clickHandler('map')}>
              <h2>Map</h2>
              <p>Check via map</p>
            </button>
            <button className="StandardButton" onClick={() => clickHandler('routes')}>
              <h2>Routes</h2>
              <p>Search routes directly</p>
            </button>
          </div>
          <div className="max-w-3xl">
            {view === 'areas' && (
              <ClimbingAreas areaDetails={areaDetails} changeHandler={areaChange} areas={areas} />
              )}
            {view === 'routes' && (
              <ClimbingRoutes areaDetails={areaDetails} changeHandler={areaChange} areas={areas} crags={areaDetails?.crags} sessionToken={sessionToken}/>
            )}
            {view === 'map' && (
              <MapView />
            )}
          </div>
          {loading &&
          <h2>Loading areas...</h2>}
        </div>
      </div>
    );
}