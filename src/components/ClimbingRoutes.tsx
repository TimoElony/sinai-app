import React, { useEffect, useState } from "react";
import { ClimbingArea, ClimbingRoute, AreaDetails, Crag, WallTopo } from "../types/types";
import CreateRouteModal from "./CreateRouteModal";




export default function  ClimbingRoutes ({areas, areaDetails, changeHandler, crags, sessionToken}: {areas: ClimbingArea[]; areaDetails: AreaDetails | undefined; changeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void; crags: Crag[] | undefined; sessionToken: string}) {
    const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
    const [selectedCrag, setCrag] = useState<string>(crags?.[0]?.name || ""); // Initialize with the first crag name or an empty string
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [topos, setTopos] = useState<WallTopo[]>([])

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

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

    return (
        <div className="flex flex-col items-baseline gap-4 p-4">
            <CreateRouteModal sessionToken={sessionToken} isVisible={isModalVisible} setIsVisible={setIsModalVisible} />
            <button className="StandardButton" onClick={()=>toggleModal()}>Add Route</button>
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
                    <h2 >{topo.description}</h2>
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
                    {routes.filter((route)=>(topo.climbing_routes_ids.includes(route.id))).sort((a, b) => a.wall_topo_numbers[0] - b.wall_topo_numbers[0]).map((route) => {
                        return (
                            <tr key={route.id} className="hover:bg-gray-200">
                                <td>{route.wall_topo_numbers[0]}</td>
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