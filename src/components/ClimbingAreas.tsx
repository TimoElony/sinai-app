import React, { useEffect, useState } from "react";
import { ClimbingArea, AreaDetails } from "../types/types.ts";



export default function  ClimbingAreas ( {areas}: {areas: ClimbingArea[]} ) {
    const [areaDetails, setAreaDetails] = useState<AreaDetails>();


    const fetchDetails = async (areaName: string) => {
        const response = await fetch(`http://localhost:5000/climbingareas/details/${areaName}`);
        const data = await response.json();
        console.log(data);
        setAreaDetails(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const area = areas.find(area => area.name === selectedValue);
        if (area) {
            fetchDetails(area.name);
        } else {
            console.error("Area not found");
        }
    }
    return (
        <div>
            <h3>List of Areas</h3>
            <select className="bg-gray-600 p-2 rounded-lg shadow-md" onChange={handleChange}>
                {areas && (areas.map((area) => {
                    return(
                    <option key={area.id} value={area.name}>{area.name}</option>
                    );
                }))}
            </select>
            {areas.map((area) => {
                return (
                    <div key={area.id} className="bg-gray-600 p-4 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold">{area.name}</h4>
                        <p>{area.description}</p>
                        <p>Access: {area.access}</p>
                        <p>Distance from Dahab: {area.access_from_dahab_minutes}</p>
                        <p>Route Count: {area.route_count}</p>
                    </div>
                );
            })}
            {areaDetails && (
                <ul>{areaDetails.route_distribution}</ul>
            )}
        </div>
    );
}