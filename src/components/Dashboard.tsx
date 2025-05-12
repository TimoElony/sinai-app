import { useEffect, useState } from "react";
import ClimbingAreas from "./ClimbingAreas.tsx";
import ClimbingRoutes from "./ClimbingRoutes.tsx";
import { ClimbingArea, AreaDetails, TopoPoints, ClimbingRoute, WallTopo} from "../types/types.ts";
import MapView from "./MapView.tsx";
import { Progress } from "./ui/progress.tsx";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"




export default function Dashboard({sessionToken}: {sessionToken: string}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(13);
  const [areas, setAreas] = useState<ClimbingArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | undefined>(undefined);
  const [selectedCrag, setSelectedCrag] = useState<string | undefined>(undefined);
  const [areaDetails, setAreaDetails] = useState<AreaDetails>();
  const [topoPoints, setTopopoints] = useState<TopoPoints[]>([]);
  const [activeTab, setActiveTab] = useState<string>("areas");
  const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
  const [topos, setTopos] = useState<WallTopo[]>([]);


  useEffect ( () => {
    
    setLoading(true);
    try{
      fetchAreas();
      setProgress(33);
      fetchTopoPoints();
      setProgress(80);
    } catch(err) {
      console.error('error fetching areas or points');
    } finally {
      setLoading(false);
      setProgress(13);
    }
  },[]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('https://sinai-backend.onrender.com/climbingareas');
      const data = await response.json();
      console.log(data);
      setAreas(data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  }

  const handleAreaChange = async (selectedValue: string) => {
    try {
      if (selectedValue === 'none') {
        setAreaDetails(undefined);
        setSelectedArea(undefined);
        setSelectedCrag(undefined);
        setRoutes([]);
        setTopos([]);
        return;
      } else {
        await fetchDetails(selectedValue);
      }
      
    } catch (error) {
      console.error("Error changing area:", error);
    }
    
  }

  const fetchDetails = async (area: string | undefined) => {
    try {
      if(area) {
        const response = await fetch(`https://sinai-backend.onrender.com/climbingareas/details/${area}`);
        const responseData = await response.json();        

        setAreaDetails(responseData);
        console.log('areaDetails fetched and set');
        if (responseData.crags.length <= 1 ) {
          console.log('only one crag, setting selectedCrag, but without fetching');
          setSelectedCrag(area);
        } else {
          console.log('multiple crags, setting selectedCrag to first one, but without fetching');
          setSelectedCrag(responseData.crags[0].name); 
        }

      }
    } catch (error) {
      console.error("Error fetching area details:", error);
    }
  };

  const fetchRoutesAndTopos = async (areaName: string, cragName: string) => {
    try {
        if (!areaName || !cragName) {
            console.error("Area name or crag name is not provided");
            return;
        }
        const response = await fetch(`https://sinai-backend.onrender.com/climbingroutes/${areaName}/${cragName}`);
        const routeData: ClimbingRoute[] = await response.json();
        setRoutes(routeData);
        const topoResponse = await fetch(`https://sinai-backend.onrender.com/walltopos/${areaName}/${cragName}`);
        const topoData: WallTopo[] = await topoResponse.json();
        setTopos(topoData);
    } catch (error) {
        console.error("Error fetching routes or topos:");
    } finally {
        console.log("Fetching routes and topos completed", topos[0], routes[0]);
    }
          
  };

  const fetchTopoPoints = async () =>{
        try {
          const response = await fetch('https://sinai-backend.onrender.com/geodata/topos');
          const data = await response.json();
          setTopopoints(data);
        } catch (error) {
          console.error("Error fetching topo points:", error);
        }
  }

  const handleCragChange = async (selectedValue: string) => {
    try {
      if (!selectedArea) {
        throw new Error("Area not selected");
      }
      fetchRoutesAndTopos(selectedArea, selectedValue);
    } catch (error) {
      console.error("Error changing crag:", error);
    }
    
  }


  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 min-h-15">
          <TabsTrigger value="areas" className="w-[100%]">Areas</TabsTrigger>
          <TabsTrigger value="routes" className="w-[100%]">Routes</TabsTrigger>
          <TabsTrigger value="map" className="w-[100%]">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="areas">
          <ClimbingAreas areaDetails={areaDetails} onAreaChange={handleAreaChange} areas={areas} selectedArea={selectedArea}  />
        </TabsContent>
        <TabsContent value="routes">
          <ClimbingRoutes 
            areaDetails={areaDetails} 
            onAreaChange={handleAreaChange} 
            areas={areas} 
            sessionToken={sessionToken} 
            selectedCrag={selectedCrag} 
            onCragChange={handleCragChange}
            routes={routes}
            topos={topos}
            selectedArea={selectedArea}
          />
        </TabsContent>
        <TabsContent value="map">
          <MapView topoPoints={topoPoints} onValueChange={setActiveTab} onAreaChange={handleAreaChange} areas={areas}/>
        </TabsContent>
      </Tabs>
      {loading &&
        <div className="flex items-center justify-center">
          <Progress value={progress} className="w-56" />
          <h2>Booting up after inactivity...</h2>
        </div>}
    </>
  );
}