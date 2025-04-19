import { useEffect, useState } from "react";
import ClimbingAreas from "./ClimbingAreas.tsx";
import ClimbingRoutes from "./ClimbingRoutes.tsx";
import { ClimbingArea, AreaDetails } from "../types/types.ts";




export default function Dashboard() {

  const [view, setView] = useState('none');
  const [areas, setAreas] = useState<ClimbingArea[]>([]);
  const [areaDetails, setAreaDetails] = useState<AreaDetails>();


  useEffect (() => {

    fetchAreas();
  },[]);

  useEffect(() => {

    if (areas) {
      fetchDetails(areas[0]);
    }
  },[areas])

  const fetchAreas = async () => {
    try {
      const response = await fetch('http://localhost:5000/climbingareas');
      const data = await response.json();
      console.log(data);
      setAreas(data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      console.log("Fetching areas completed");
    }
  }


  const areaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
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
        const response = (await fetch(`http://localhost:5000/climbingareas/details/${area.name}`)).json();
        
        setAreaDetails({...area, ...await response});

      }
    } catch (error) {
      console.error("Error fetching area details:", error);
    } finally {
      console.log("Fetching area details completed");
    }
  };

  const clickHandler = (selection: string) => {
    setView(selection);
    if (selection === 'areas') {
      setAreaDetails(undefined);
    }
  }

    return (
      <div className="flex flex-col items-center gap-4 rounded-xl p-4 mx-4">
        <h2>Online Routes Database</h2>
        <div className="flex flex-row flex-wrap gap-4">
          <button onClick={() => clickHandler('areas')}>
            <h3>Climbing Areas</h3>
            <p>Browse all areas</p>
          </button>
          <button onClick={() => clickHandler('map')}>
            <h3>Map</h3>
            <p>Check via map</p>
          </button>
          <button onClick={() => clickHandler('routes')}>
            <h3>Routes</h3>
            <p>Search routes directly</p>
          </button>
        </div>
        {view === 'areas' && (
          <ClimbingAreas areaDetails={areaDetails} changeHandler={areaChange} areas={areas} />
          )}
        {view === 'routes' && (
          <ClimbingRoutes areaDetails={areaDetails} changeHandler={areaChange} areas={areas} />
        )}
      </div>
    );
}