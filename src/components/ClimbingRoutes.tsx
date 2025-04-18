import { useEffect, useState } from "react";
import { ClimbingArea, ClimbingRoute } from "../types/types";




export default function  ClimbingRoutes ({ areas }: { areas: ClimbingArea[]}) {
    const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
    const [selectedArea, setArea] = useState<ClimbingArea>(areas[0]);

    useEffect(() => {
        fetchData(selectedArea.name);
    }, []);

    const fetchData = async (areaName: string) => {
        try {
            const response = await fetch(`http://localhost:5000/climbingroutes/${areaName}`);
            const data: ClimbingRoute[] = await response.json();
            setRoutes(data);
        } catch (error) {
            console.error("Error fetching routes:");
        } finally {
            console.log("Fetch completed");
        }
        
    };

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        fetchData(selectedValue);
        const area = areas.find(area=> area.name === selectedValue);
        if(area){
            setArea(area);
        } else {
            console.error("Area not found");
        }
        
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl">
            <h3>Select Area you want to see Routes of</h3>
            <select className="bg-gray-200 p-2 rounded-lg shadow-md" onChange={handleAreaChange}>
                {areas.map((area) => {
                    return(
                        <option key={area.id} value={area.name}>{area.name}</option>
                    );
                })}
            </select>
            {routes.map((route) => {
                return (
                    <div key={route.id} className="bg-gray-200 p-4 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold">{route.name}</h4>
                        <p>{route.grade_best_guess}, {route.length}m</p>
                    </div>
                );
            })}
        </div>
    );
}