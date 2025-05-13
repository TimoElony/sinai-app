import { ClimbingArea} from "../types/types.ts";
import { GradeBarChart } from "./GradeBarChart.tsx";
import { Button } from "./ui/button.tsx";

export default function  ClimbingAreas ( {areas, selectedArea, areaDetails, onAreaChange}: {areas: ClimbingArea[]; selectedArea: string | undefined; areaDetails: ClimbingArea | undefined; onAreaChange: (selectedValue: string) => void} ) {
    return (
        <div className="flex flex-col items-baseline gap-4 p-2 md:p-4">
            <h3>Select Area</h3>
            <div className="flex gap-2">
                <select className="bg-gray-200 rounded-lg p-2 shadow-md" value={selectedArea} onChange={(e)=>onAreaChange(e.target.value)}>
                    <option value="none">All areas</option>
                    {areas && (areas.map((area) => {
                        return(
                        <option key={area.id} value={area.name}>{area.name}</option>
                        );
                    }))}
                </select>
                <Button variant="outline" onClick={() => onAreaChange("none")}>
                    All areas
                </Button>
            </div>
            {areaDetails && areaDetails.grade_distribution && areaDetails.access && (
                <div className="flex flex-col gap-4 rounded-lg p-2 bg-gray-200 shadow-md">
                    <h3>{areaDetails.name}</h3>
                    <div className="md:w-1/2">
                        <h3>Route Distribution for {areaDetails.name}</h3>
                        {areaDetails.grade_distribution ? <GradeBarChart data={areaDetails.grade_distribution}/>:<p>no data</p>}
                    </div>
                    <p>{areaDetails.description}</p>
                    <div className="md:p-4">
                        <table className="[&_td]:overflow-hidden [&_td]:text-ellipsis bg-gray-300 rounded-sm shadow-md">
                            <thead>
                                <tr>
                                    <th className="w-2/3 text-start">Access</th>
                                    <th className="w-1/3 text-end">Distance from Dahab</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{areaDetails.access.length > 120 ? areaDetails.access.substring(0,120) + "..." : areaDetails.access}</td>
                                    <td className="text-end">{areaDetails.access_from_dahab_minutes}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            )}
            {!areaDetails && (
            <>
                <h3>Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {areas.map((area) => {
                        return (
                            <div key={area.id} className="bg-gray-200 p-4 rounded-lg shadow-md [&_p]:overflow-ellipsis [&_p]:overflow-clip" onClick={() => onAreaChange(area.name)}>
                                <h3>{area.name}</h3>
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