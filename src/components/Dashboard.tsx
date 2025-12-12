import { useEffect, useState } from "react";
import ClimbingAreas from "./ClimbingAreas";
import ClimbingRoutes from "./ClimbingRoutes";
import { ClimbingArea, AreaDetails, TopoPoints, ClimbingRoute, WallTopo} from "../types/types";
import MapView from "./MapView";
import { Progress } from "./ui/progress";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import { toast } from "sonner";




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
  const [highlightedTopoId, setHighlightedTopoId] = useState<string | undefined>(undefined);


  useEffect ( () => {
    
    setLoading(true);
    try{
      fetchAreas();
      fetchTopoPoints();
    } catch(err) {
      toast.error('error fetching areas or points');
    }
  },[]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/climbingareas');
      const data = await response.json();
      setAreas(data);
      setProgress(50);
    } catch (error) {
      console.error("Error fetching areas:", String(error));
      throw new Error(`Error fetching areas${String(error)}`);
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
      toast.error(`Error changing area: ${String(error)}`);
    } finally {
      setLoading(false);
      setProgress(100);
    }
    
  }

  const fetchDetails = async (area: string | undefined) => {
    const areaData = areas.find((areaObj) => areaObj.name === area);
    try {
      if(areaData) {
        const response = await fetch(`/api/climbingareas/details/${area}`);
        const responseData = await response.json();        

        setAreaDetails({...areaData, ...responseData});
        if (responseData.crags.length <= 1 ) {
          setSelectedCrag(area);
        } else {
          setSelectedCrag(responseData.crags[0].name); 
        }

      }
    } catch (error) {
      console.error("Error fetching area details:", error);
      throw new Error("Error fetching area Details");
    }
  };

  const fetchRoutesAndTopos = async (areaName: string, cragName: string) => {
    try {
        if (!areaName || !cragName) {
            throw new Error("Area name or crag name is not provided");
        }
        
        // Prepare fetch options based on authentication status
        const fetchOptions: RequestInit = sessionToken
            ? {
                // Logged in: disable caching, add auth header, use timestamp
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Authorization': `Bearer ${sessionToken}`
                }
              }
            : {
                // Logged out: allow caching
                cache: 'default'
              };
        
        const timestamp = sessionToken ? `?t=${new Date().getTime()}` : '';
        const response = await fetch(`/api/climbingroutes/${areaName}/${cragName}${timestamp}`, fetchOptions);
        const routeData: ClimbingRoute[] = await response.json();
        setRoutes(routeData);
        const topoResponse = await fetch(`/api/walltopos/${areaName}/${cragName}${timestamp}`, fetchOptions);
        const topoData: WallTopo[] = await topoResponse.json();
        setTopos(topoData);
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching routes or topos");
    }
          
  };

  const fetchTopoPoints = async () =>{
        try {
          const response = await fetch('/api/geodata/topos');
          const data = await response.json();
          setTopopoints(data);
          setProgress(80);
        } catch (error) {
          console.error(error);
          throw new Error("error while fetching topo points");
        } finally {
          setLoading(false);
          setProgress(100);
        }
  }

  const handleCragChange = async (selectedValue: string) => {
    setSelectedCrag(undefined);
    setLoading(true);
    setProgress(50);
    try {
      if (!selectedArea) {
        throw new Error("Area not selected");
      }
      await fetchRoutesAndTopos(selectedArea, selectedValue);
      setProgress(80);
    } catch (error) {
      console.error(error);
      toast.error(`Error changing Crag: ${String(error)}`);
    } finally {
      setLoading(false);
      setProgress(100);
      setSelectedCrag(selectedValue);
    }
    
  }


  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-2">
        <TabsList className="grid w-full grid-cols-3 min-h-15">
          <TabsTrigger value="areas" className="w-[100%]">Areas</TabsTrigger>
          <TabsTrigger value="routes" className="w-[100%]">Topos</TabsTrigger>
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
            setLoading={setLoading}
            setProgress={setProgress}
            onShowTopoOnMap={(topoId) => {
              setHighlightedTopoId(topoId);
              setActiveTab('map');
            }}
          />
        </TabsContent>
        <TabsContent value="map">
          <MapView topoPoints={topoPoints} onValueChange={setActiveTab} onAreaChange={handleAreaChange} areas={areas} highlightedTopoId={highlightedTopoId}/>
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
                <source src="https://pub-5949e21c7d4c4f3e91058712f265f987.r2.dev/camelGoingClimbing.mp4" type="video/mp4" />
              </video>
              <Progress value={progress} className="w-30" />
            </div>
          </div>
          </>}
    </>
  );
}