import React, { useEffect, useState } from "react";
import { ClimbingArea, ClimbingRoute, AreaDetails, Crag, WallTopo } from "../types/types";
import CreateRouteModal from "./CreateRouteModal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
import { renderToPipeableStream } from "react-dom/server";




export default function  ClimbingRoutes ({areas, areaDetails, changeHandler, crags, sessionToken}: {areas: ClimbingArea[]; areaDetails: AreaDetails | undefined; changeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void; crags: Crag[] | undefined; sessionToken: string}) {
    const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
    const [selectedCrag, setCrag] = useState<string>(crags?.[0]?.name || ""); // Initialize with the first crag name or an empty string
    const [topos, setTopos] = useState<WallTopo[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<ClimbingRoute>();
    const [formTopoNumber, setFormTopoNumber] = useState<Number>(1);


    useEffect(() => {
        if (!areaDetails) { 
            return;
        }  else if (areaDetails.crags.length <= 1) {
            console.log("No crags available for this area");
            fetchRoutesAndTopos(areaDetails.name, 'singlecrag');
            setCrag(areaDetails.name)
        } else {
            console.log("Fetching routes for the first crag");
            fetchRoutesAndTopos(areaDetails.name, crags ? crags[0].name: ""); // Use the first crag name or an empty string
            setCrag(crags ? crags[0].name: areaDetails.name);
        }
    }, [areaDetails]);

    const fetchRoutesAndTopos = async (areaName: string, cragName: string) => {
        try {
            const response = await fetch(`https://sinai-backend.onrender.com/climbingroutes/${areaName}/${cragName}`);
            const routeData: ClimbingRoute[] = await response.json();
            setRoutes(routeData);
            const topoResponse = await fetch(`https://sinai-backend.onrender.com/walltopos/${areaName}/${cragName}`);
            const topoData: WallTopo[] = await topoResponse.json();
            setTopos(topoData);
        } catch (error) {
            console.error("Error fetching routes or topos:");
        } finally {
            console.log("Fetching routes and topos completed");
        }
        
    };

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        changeHandler(e);
    };

    const handleCragChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setCrag(selectedValue);
        if (areaDetails) {
            fetchRoutesAndTopos(areaDetails.name, selectedValue);
        }
    }

    const addRouteToTopo = async (topoId: string) => {
        const selectedRouteTopos = selectedRoute?.wall_topo_ids;
        if(selectedRouteTopos?.includes(topoId)) {
            alert('Route is already part of this Topo or doesnt exist')
            return;
        } else {
            try {
                const payload = {id: selectedRoute?.id, wall_topo_id: topoId }
                const response = await fetch('https://sinai-backend.onrender.com/climbingroutes/addTopo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`,
                    },
                    body: JSON.stringify(payload),
                });
                console.log(response);
            } catch (error) {
                console.error('error posting updated info')
            }
        }
    }

    return (
        <div className="flex flex-col items-baseline gap-4 p-4">
            <h3>Select Area you want to see Routes of</h3>
            <select className="bg-gray-200 p-2 rounded-lg shadow-md" value={areaDetails?.name || 'none selected'} onChange={handleAreaChange}>
                <option key="none selected" value='none selected'>none selected</option>
                {areas.map((area) => {
                    return(
                        <option key={area.id} value={area.name}>{area.name}</option>
                    );
                })}
            </select>
            {areaDetails && crags && crags.length > 1  && (
                <>  
                    <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
                        <h3>Select Crag within {areaDetails.name}</h3>
                        {sessionToken && <CreateRouteModal sessionToken={sessionToken} selectedCrag={selectedCrag} selectedArea={areaDetails.name}/>}
                    </div>
                    
                    <select className="bg-gray-200 p-2 rounded-lg shadow-md" onChange={handleCragChange} value={selectedCrag}>
                        {crags.map((crag) => {
                            const cragName = crag.name;
                            return(
                                <option key={cragName} value={cragName}>{cragName}</option>
                            );
                        })}
                    </select>
                </>
            )}
            <h1>Topos</h1>
            {topos.map((topo)=> {
                const maxWidth = 800;
                const breakpoints = [400, 600, 800, 1200]; // Your preferred breakpoints
                const src = "https://pub-5949e21c7d4c4f3e91058712f265f987.r2.dev/"
                // Generate srcset with Cloudflare resizing
                const srcSet = breakpoints
                  .filter(bp => bp <= maxWidth)
                  .map(bp => `${src}${topo.extracted_filename}?width=${bp}&format=webp ${bp}w`)
                  .join(', ');

                const url = `${src}${topo.extracted_filename}?width=${maxWidth}&quality=75&format=webp`;
            return (
                <div key={topo.name} className="flex flex-col max-w-vw">
                    <div className="flex flex-col  md:flex-row md:items-center">
                        <h2 >{topo.description}</h2>
                        { sessionToken && (
                            <form className="flex items-center justify-around bg-gray-200 rounded-lg gap-2 mx-1 p-2" onSubmit={(e)=>{
                                e.preventDefault();
                                addRouteToTopo(topo.id)
                            }}>
                                <select value={selectedRoute?.id || " "} onChange={(e)=>setSelectedRoute(routes.find(route=>route.id === e.target.value))}>
                                    <option value=" ">select route to add</option>
                                    {routes.map((route)=><option key={route.id} value={route.id}>{route.name}</option>)}
                                </select>
                                <label htmlFor="topoNumber" className="text-xs"># in Topo</label>
                                <input  className="bg-accent max-w-8" id="topoNumber" type="number" value={formTopoNumber.toString()} onChange={(e)=>setFormTopoNumber(Number(e.target.value))}/>
                                <Button type="submit">add/edit route</Button>
                            </form>
                        )}
                    </div>
                    <img
                        src={url}
                        srcSet={srcSet}
                        sizes={`(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`}
                        alt={topo.description}
                        style={{ width: '100%', height: 'auto' }}
                        loading="lazy"
                    />
                    <p>{topo.details}</p>
                    <table className="table-auto">
                        <thead>
                            <tr>
                                <th>No in Topo</th>
                                <th>Name</th>
                                <th>Grade</th>
                                <th>Length</th>
                            </tr>
                        </thead>
                    <tbody>
                    {routes.filter((route)=>(topo.climbing_routes_ids.includes(route.id))).sort((a, b) => a.wall_topo_numbers[a.wall_topo_ids.indexOf(topo.id)] - b.wall_topo_numbers[b.wall_topo_ids.indexOf(topo.id)]).map((route) => {
                        return (
                            <tr key={route.id} className="hover:bg-gray-200">
                                <td>{route.wall_topo_numbers[0]}<span className="text-xs opacity-30">{route.wall_topo_ids.indexOf(topo.id)}</span></td>
                                <td className="font-semibold">{route.name}</td>
                                <td>{route.grade_best_guess}</td>
                                <td>{route.length}m</td>
                            </tr>
                        );
                    })}
                    </tbody>
                    </table>
                </div>
            )})}           
        </div>
    );
}