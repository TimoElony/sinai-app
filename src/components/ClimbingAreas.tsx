import { ClimbingArea, AreaDetails } from "../types/types.ts";



export default function  ClimbingAreas ( {areas, areaDetails, changeHandler}: {areas: ClimbingArea[]; areaDetails: AreaDetails | undefined; changeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void} ) {

    
    return (
        <div>
            <h3>Select Area</h3>
            <select className="bg-gray-200 p-2 rounded-lg shadow-md" onChange={changeHandler}>
                {areas && (areas.map((area) => {
                    return(
                    <option key={area.id} value={area.name}>{area.name}</option>
                    );
                }))}
            </select>
            {areaDetails && (
                <div className="flex flex-col gap-4 rounded-lg p-4 bg-gray-200 shadow-md">
                    <h3>{areaDetails.name}</h3>
                    <p>{areaDetails.description}</p>
                <div className="p-4 ">
                    <table className="text-left text-wrap">
                        <thead>
                            <tr>
                                <th className="w-1/2">Access</th>
                                <th className="w-1/4">Distance from Dahab</th>
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
                </div>
                
                </div>
            )}
            {!areaDetails && (
            <>
                <h3>Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {areas.map((area) => {
                        return (
                            <div key={area.id} className="bg-gray-200 p-4 rounded-lg shadow-md text-sm grid">
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