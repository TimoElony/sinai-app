import React, { useEffect, useState } from "react";
import { ClimbingArea, ClimbingRoute, AreaDetails, Crag, WallTopo } from "../types/types";
import CreateRouteModal from "./CreateRouteModal";
import { Button } from "@/components/ui/button";
import UploadTopoModal from "./UploadTopoModal";




export default function  ClimbingRoutes ({areas, areaDetails, changeHandler, crags, sessionToken}: {areas: ClimbingArea[]; areaDetails: AreaDetails | undefined; changeHandler: (selectedValue: string) => void; crags: Crag[] | undefined; sessionToken: string}) {
    const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
    const [selectedCrag, setCrag] = useState<string>(crags?.[0]?.name || ""); // Initialize with the first crag name or an empty string
    const [topos, setTopos] = useState<WallTopo[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<ClimbingRoute>();
    const [formTopoNumber, setFormTopoNumber] = useState<number>(0);


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
        changeHandler(e.target.value);
    };

    const handleCragChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setCrag(selectedValue);
        if (areaDetails) {
            fetchRoutesAndTopos(areaDetails.name, selectedValue);
        }
    }

    const removeRouteFromTopo = async (topoId: string) => {
        // remove the route from the topo, even if it is in there multiple times then remove all
        
        if(!selectedRoute){
            return;
        }
        
        const wall_topo_ids_new = selectedRoute.wall_topo_ids.filter((tid)=>tid !== topoId);
        const wall_topo_numbers_new = selectedRoute.wall_topo_numbers.filter((_,i)=>selectedRoute.wall_topo_ids[i] !== topoId);
        
        const payload = {id: selectedRoute.id, wall_topo_ids: wall_topo_ids_new, wall_topo_numbers: wall_topo_numbers_new};
        console.log('payload', payload);
        const response = await fetch('https://sinai-backend.onrender.com/climbingroutes/updateTopoNumber', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(payload),
        });
        console.log(response);
    }

    const addRouteToTopo = async (topoId: string) => {
        // topo numbers are mapped to the array of linked topos, if the route is already part then it will be updated, otherwise kept previous value
        // if numbers were missing in the db they will be added as 0
        // if the topo is new to the route then the given number and the id of the topo will be appended
        if(!selectedRoute){
            return;
        }
        const index = selectedRoute.wall_topo_ids.indexOf(topoId);
        console.log('add route called: index of topo in route', index);
        const wall_topo_numbers = selectedRoute.wall_topo_ids.map((_,i)=> (
            i===index 
                ? formTopoNumber
                : (selectedRoute.wall_topo_numbers[i] || 0)
        ));

        if(index >= 0 && index != -1) {
            const payload = {id: selectedRoute.id, wall_topo_ids: selectedRoute.wall_topo_ids, wall_topo_numbers: wall_topo_numbers};
            const response = await fetch('https://sinai-backend.onrender.com/climbingroutes/updateTopoNumber', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(payload),
            });
            console.log(response);
        } else {
            console.log('route does not exist on this topo yet')
            try {
                const wall_topo_ids_new = [...selectedRoute.wall_topo_ids, topoId];
                const wall_topo_numbers_new = [...wall_topo_numbers, formTopoNumber];
                const payload = {id: selectedRoute.id, wall_topo_ids: wall_topo_ids_new, wall_topo_numbers: wall_topo_numbers_new};
                const response = await fetch('https://sinai-backend.onrender.com/climbingroutes/addToTopo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`,
                    },
                    body: JSON.stringify(payload),
                });
                console.log(response);
            } catch (error) {
                console.error('error posting add route to topo')
            }
        }
    }
    // Rendering below:
    // Area Selector
    // Crag Selector and adding options when logged in
    // Topos repeater and adding. editing and removing options when logged in
    return (
        <div className="flex flex-col items-baseline gap-4 p-2 md:p-4">
            {sessionToken && <Button onClick={()=>fetchRoutesAndTopos(areaDetails?.name || "", selectedCrag)}>Refresh</Button>}
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
                    <h3>Select Crag within {areaDetails.name}</h3>
                    <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
                        <select className="bg-gray-200 p-2 rounded-lg shadow-md" onChange={handleCragChange} value={selectedCrag}>
                            {crags.map((crag) => {
                                const cragName = crag.name;
                                return(
                                    <option key={cragName} value={cragName}>{cragName}</option>
                                );
                            })}
                        </select>
                        {sessionToken && 
                        <div>
                            <CreateRouteModal sessionToken={sessionToken} selectedCrag={selectedCrag} selectedArea={areaDetails.name}/>
                            <UploadTopoModal sessionToken={sessionToken} selectedCrag={selectedCrag} selectedArea={areaDetails.name}/>
                        </div>
                        }
                    </div>
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
                <div key={topo.id} className="flex flex-col max-w-vw">
                    <div className="flex flex-col  md:flex-row md:items-center">
                        <h2 >{topo.description}</h2>
                        { sessionToken && (
                            <div className="flex flex-col md:flex-row md:items-center bg-gray-200 rounded-lg gap-2 mx-1 p-2">
                                <select value={selectedRoute?.id || " "} onChange={(e)=>setSelectedRoute(routes.find(route=>route.id === e.target.value))}>
                                    <option value=" ">select route to add</option>
                                    {routes.map((route)=><option key={route.id} value={route.id}>{route.name}</option>)}
                                </select>
                                <label htmlFor="topoNumber" className="text-xs">
                                <input  className="bg-accent max-w-8 mx-1" id="topoNumber" type="number" value={formTopoNumber.toString()} onChange={(e)=>setFormTopoNumber(+e.target.value)}/>
                                # in Topo</label>
                                <div className="flex flex-row gap-2">
                                    <Button onClick={()=>addRouteToTopo(topo.id)}>add/edit route</Button>
                                    <Button className="bg-red-600" onClick={()=>removeRouteFromTopo(topo.id)}>remove</Button>
                                </div>
                            </div>
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
                    {routes.filter((route)=>(route.wall_topo_ids.includes(topo.id))).sort((a, b) => a.wall_topo_numbers[a.wall_topo_ids.indexOf(topo.id)] - b.wall_topo_numbers[b.wall_topo_ids.indexOf(topo.id)]).map((route) => {
                        return (
                            <tr key={route.id} className="hover:bg-gray-200">
                                <td>{route.wall_topo_numbers[route.wall_topo_ids.indexOf(topo.id)] || "n.n."}<span className="text-xs opacity-30">{route.wall_topo_ids.indexOf(topo.id)}</span></td>
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