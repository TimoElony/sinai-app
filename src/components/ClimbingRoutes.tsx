import React, { useEffect, useState } from "react";
import { ClimbingArea, ClimbingRoute, AreaDetails } from "../types/types";




export default function  ClimbingRoutes ({areas, areaDetails, changeHandler}: {areas: ClimbingArea[]; areaDetails: AreaDetails | undefined; changeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void}) {
    const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
    const [selectedCrag, setCrag] = useState<string>(areaDetails?.crags[0]?.name || ""); // Initialize with the first crag name or an empty string

    useEffect(() => {
        if (!areaDetails) { 
            return;
        }  else if (areaDetails.crags.length <= 1) {
            console.log("No crags available for this area");
            fetchRoutes(areaDetails.name, 'singlecrag');
        } else {
            console.log("Fetching routes for the first crag");
            fetchRoutes(areaDetails.name, areaDetails.crags[0].name);
        }
    }, [areaDetails]);

    const fetchRoutes = async (areaName: string, cragName: string) => {
        try {
            const response = await fetch(`http://localhost:5000/climbingroutes/${areaName}/${cragName}`);
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
            <h3>Select Area you want to see Routes of</h3>
            <select className="bg-gray-200 p-2 rounded-lg shadow-md" onChange={handleAreaChange}>
                {areas.map((area) => {
                    return(
                        <option key={area.id} value={area.name}>{area.name}</option>
                    );
                })}
            </select>
            {areaDetails && areaDetails.crags.length > 1 && (
                <>
                    <h3>Select Crag within {areaDetails.name}</h3>
                    <select className="bg-gray-200 p-2 rounded-lg shadow-md" onChange={handleCragChange} defaultValue={areaDetails.crags[0].name}>
                        {areaDetails.crags.map((crag) => {
                            let cragName = crag.name; //error should not be here, name is a string and defined in types
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