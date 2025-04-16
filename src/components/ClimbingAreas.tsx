import { useEffect, useState } from "react";

// type ClimbingArea = {
//     id: number;
//     name: string;
//     description: string;
//     access: string;
// }

type AreaDetails = {
    id: number;
    name: string;
    description: string;
    access: string;
    access_from_dahab_minutes: string;
    number_of_routes: number;
}
export default function  ClimbingAreas ( {areas}: { areas: ClimbingArea[] }) {
    const [areaDetails, setAreaDetails] = useState<AreaDetails[]>([]);

    useEffect(() => {
        const fetchAreas = async () => {
            const response = await fetch(`http://localhost:5000/climbingareas/details/${areas[0].name}`);
            const data = await response.json();
            console.log(data);
            setAreaDetails(data);
        };
        fetchAreas();
    }, []);
    return (
        <div>
            <h3>List of Areas</h3>
            {areaDetails.map((area) => {
                return (
                    <div key={area.id} className="bg-gray-600 p-4 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold">{area.name}</h4>
                        <p>{area.description}</p>
                        <p>Access: {area.access}</p>
                        <p>Distance from Dahab: {area.access_from_dahab_minutes}</p>
                    </div>
                );
            })}
        </div>
    );
}