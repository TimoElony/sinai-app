import React, { useState } from "react";
import { ClimbingArea, AreaDetails } from "../types/types.ts";



export default function  ClimbingAreas ( {areas}: {areas: ClimbingArea[]} ) {
    const [areaDetails, setAreaDetails] = useState<AreaDetails>();


    const fetchDetails = async (area: ClimbingArea) => {
        const response = await fetch(`http://localhost:5000/climbingareas/details/${area.name}`);
        const data = await response.json();
        console.log(data);
        setAreaDetails({...data, ...area});
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const area = areas.find(area => area.name === selectedValue);
        if (area) {
            fetchDetails(area);
        } else {
            console.error("Area not found");
        }
    }
    return (
        <div>
            <h3>Select Area</h3>
            <select className="bg-gray-600 p-2 rounded-lg shadow-md" onChange={handleChange}>
                {areas && (areas.map((area) => {
                    return(
                    <option key={area.id} value={area.name}>{area.name}</option>
                    );
                }))}
            </select>
            {areaDetails && (
                <div className="flex flex-col gap-4 rounded-xl">
                    <h3>{areaDetails.name}</h3>
                    <p>{areaDetails.description}</p>
                <table className="bg-gray-600 p-4 rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th>Access</th>
                            <th>Distance from Dahab</th>
                            <th>Route Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{areaDetails.access}</td>
                            <td>{areaDetails.access_from_dahab_minutes} minutes</td>
                            <td>{areaDetails.route_count}</td>
                        </tr>
                    </tbody>
                </table>
                <ul>{areaDetails.route_distribution}</ul>
                </div>
            )}
            {!areaDetails && (
            <>
                <h3>Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {areas.map((area) => {
                        return (
                            <div key={area.id} className="bg-gray-600 p-4 rounded-lg shadow-md text-sm grid">
                                <h4 className="text-lg font-semibold">{area.name}</h4>
                                <p>Access: {area.access}</p>
                                <p>Distance from Dahab: {area.access_from_dahab_minutes}</p>
                                <p>Route Count: {area.route_count}</p>
                            </div>
                        );
                    })}
                </div>
            </>
            )} 
            
            
        </div>
    );
}