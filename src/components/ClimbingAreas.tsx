import { use, useEffect } from "react";

type ClimbingArea = {
    areas: JSON[];
    id: number;
    name: string;
    description: string;
    location: string; 
}

export default function  ClimbingAreas () {
    const areas: ClimbingArea[] = [];

    useEffect(() => {
        const fetchAreas = async () => {
            const response = await fetch("http://localhost:5000/areas");
            const data = await response.json();
            console.log(data);
            areas.push(...data);
        };
        fetchAreas();
    }, []);
    return (
        <div>
            <h3>List of Areas</h3>
            {areas.map((area) => {
                return (
                    <div key={area.id} className="bg-gray-600 p-4 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold">{area.name}</h4>
                        <p>{area.description}</p>
                    </div>
                );
            })}
        </div>
    );
}