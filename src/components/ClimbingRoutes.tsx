import React, { useEffect, useState } from "react";
import { ClimbingArea, ClimbingRoute, AreaDetails, Crag } from "../types/types";
import CreateRouteModal from "./CreateRouteModal";




export default function  ClimbingRoutes ({areas, areaDetails, changeHandler, crags, sessionToken}: {areas: ClimbingArea[]; areaDetails: AreaDetails | undefined; changeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void; crags: Crag[] | undefined; sessionToken: string}) {
    const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
    const [selectedCrag, setCrag] = useState<string>(crags?.[0]?.name || ""); // Initialize with the first crag name or an empty string
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    useEffect(() => {
        if (!areaDetails) { 
            return;
        }  else if (areaDetails.crags.length <= 1) {
            console.log("No crags available for this area");
            fetchRoutes(areaDetails.name, 'singlecrag');
        } else {
            console.log("Fetching routes for the first crag");
            fetchRoutes(areaDetails.name, crags ? crags[0].name: ""); // Use the first crag name or an empty string
        }
    }, [areaDetails]);

    const fetchRoutes = async (areaName: string, cragName: string) => {
        try {
            const response = await fetch(`https://sinai-backend.onrender.com/climbingroutes/${areaName}/${cragName}`);
            const data: ClimbingRoute[] = await response.json();
            setRoutes(data);
        } catch (error) {
            console.error("Error fetching routes:");
        } finally {
            console.log("Fetch completed");
        }
        
    };

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        changeHandler(e);
        fetchRoutes(e.target.value, selectedCrag);
    };

    const handleCragChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setCrag(selectedValue);
        if (areaDetails) {
            fetchRoutes(areaDetails.name, selectedValue);
        }
    }

   

    return (
        <div className="flex flex-col items-baseline gap-4 p-4">
            <CreateRouteModal sessionToken={sessionToken} isVisible={isModalVisible} setIsVisible={setIsModalVisible} />
            <button className="rounded-lg p-2 shadow md" onClick={()=>toggleModal()}>Add Route</button>
            <h3>Select Area you want to see Routes of</h3>
            <select className="bg-gray-200 p-2 rounded-lg shadow-md" value={areaDetails?.name || 'none selected'} onChange={handleAreaChange}>
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
            <table className="table-auto">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Length</th>
                    </tr>
                </thead>
                <tbody>
                    {routes.map((route) => {
                        return (
                            <tr key={route.id}>
                                <td className="font-semibold">{route.name}</td>
                                <td>{route.grade_best_guess}</td>
                                <td>{route.length}m</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
                
            
        </div>
    );
}