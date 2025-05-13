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
  const [areaDetails, setAreaDetails] = useState<AreaDetails | undefined>(undefined);
  const [topoPoints, setTopopoints] = useState<TopoPoints[]>([]);
  const [activeTab, setActiveTab] = useState<string>("areas");
  const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
  const [topos, setTopos] = useState<WallTopo[]>([]);


  useEffect ( () => {
    
    setLoading(true);
    try{
      fetchAreas();
      fetchTopoPoints();
    } catch(err) {
      console.error('error fetching areas or points');
    }
  },[]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('https://sinai-backend.onrender.com/climbingareas');
      const data = await response.json();
      console.log(data);
      setAreas(data);
      setProgress(50);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  }

  const handleAreaChange = async (selectedValue: string) => {
    setLoading(true);
    setProgress(50);
    try {
      if (selectedValue === 'none') {
        setAreaDetails(undefined);
        setSelectedArea(undefined);
        setSelectedCrag(undefined);
        setRoutes([]);
        setTopos([]);
        return;
      } else {
        setProgress(70);
        await fetchDetails(selectedValue);
        setSelectedArea(selectedValue);
        setProgress(80);
      }
      
    } catch (error) {
      console.error("Error changing area:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
    
  }

  const fetchDetails = async (area: string | undefined) => {
    const areaData = areas.find((areaObj) => areaObj.name === area);
    try {
      if(areaData) {
        const response = await fetch(`https://sinai-backend.onrender.com/climbingareas/details/${area}`);
        const responseData = await response.json();        

        setAreaDetails({...areaData, ...responseData});
        console.log('areaDetails fetched and set', responseData);
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
          setProgress(80);
        } catch (error) {
          console.error("Error fetching topo points:", error);
        } finally {
          setLoading(false);
          setProgress(100);
        }
  }

  const handleCragChange = async (selectedValue: string) => {
    setLoading(true);
    setProgress(50);
    try {
      if (!selectedArea) {
        throw new Error("Area not selected");
      }
      await fetchRoutesAndTopos(selectedArea, selectedValue);
      setProgress(80);
      setSelectedCrag(selectedValue);
    } catch (error) {
      console.error("Error changing crag:", error);
    } finally {
      setLoading(false);
      setProgress(100);
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
      <>
        <div className="fixed inset-0 z-40 bg-gray-800 opacity-30">
        </div>
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg w-40">
                <video 
                autoPlay 
                preload="auto"
                loop 
                muted 
                playsInline
                className="w-30 h-auto object-contain"
              >
                <source src="https://pub-5949e21c7d4c4f3e91058712f265f987.r2.dev/camelGoingClimbing.mp4&quality=75" type="video/mp4" />
              </video>
              <Progress value={progress} className="w-30" />
            </div>
          </div>
          </>}
    </>
  );
}