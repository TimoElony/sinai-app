import { useEffect, useState } from "react";
import ClimbingAreas from "./ClimbingAreas.tsx";
import ClimbingRoutes from "./ClimbingRoutes.tsx";
import { ClimbingArea, AreaDetails, TopoPoints} from "../types/types.ts";
import MapView from "./MapView.tsx";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"




export default function Dashboard({sessionToken}: {sessionToken: string}) {
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<ClimbingArea[]>([]);
  const [areaDetails, setAreaDetails] = useState<AreaDetails>();
  const [topoPoints, setTopopoints] = useState<TopoPoints[]>([]);
  const [activeTab, setActiveTab] = useState<string>("areas");


  useEffect ( () => {
    
    setLoading(true);
    try{
      fetchAreas();
      fetchTopoPoints();
    } catch(err) {
      console.error('error fetching areas or points');
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

  const areaChange = (selectedValue: string) => {
    
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

  const fetchTopoPoints = async () =>{
        try {
          const response = await fetch('https://sinai-backend.onrender.com/geodata/topos');
          setTopopoints(await response.json());
        } catch (error) {
          console.error("Error fetching topo points:", error);
        }
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="areas" className="w-[100%]">Areas</TabsTrigger>
          <TabsTrigger value="routes" className="w-[100%]">Routes</TabsTrigger>
          <TabsTrigger value="map" className="w-[100%]">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="areas">
          <ClimbingAreas areaDetails={areaDetails} changeHandler={areaChange} areas={areas} />
        </TabsContent>
        <TabsContent value="routes">
          <ClimbingRoutes areaDetails={areaDetails} changeHandler={areaChange} areas={areas} crags={areaDetails?.crags} sessionToken={sessionToken}/>
        </TabsContent>
        <TabsContent value="map">
          <MapView topoPoints={topoPoints} onValueChange={setActiveTab} changeHandler={areaChange}/>
        </TabsContent>
      </Tabs>
      {loading &&
      <h2>Loading areas...</h2>}
    </>
  );
}