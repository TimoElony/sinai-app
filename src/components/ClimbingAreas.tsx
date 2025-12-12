import { ClimbingArea} from "../types/types";
import { GradeBarChart } from "./GradeBarChart";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function  ClimbingAreas ( {areas, selectedArea, areaDetails, onAreaChange}: {areas: ClimbingArea[]; selectedArea: string | undefined; areaDetails: ClimbingArea | undefined; onAreaChange: (selectedValue: string) => void} ) {
    return (
        <div className="flex flex-col items-baseline gap-4 p-2 md:p-4">
            <h3>Select Area</h3>
            <div className="flex gap-2">
                <select className="bg-gray-200 rounded-lg p-2 shadow-md" value={selectedArea} onChange={(e)=>onAreaChange(e.target.value)}>
                    <option value="none">All areas</option>
                    {areas && Array.isArray(areas) && areas.map((area) => {
                        return(
                        <option key={area.id} value={area.name}>{area.name}</option>
                        );
                    })}
                </select>
                <Button variant="outline" onClick={() => onAreaChange("none")}>
                    All areas
                </Button>
            </div>
            {areaDetails && areaDetails.grade_distribution && areaDetails.access && (
                <div className="flex flex-col gap-4 rounded-lg p-2 bg-gray-200 shadow-md">
                    <h3>{areaDetails.name}</h3>
                    <p>{areaDetails.access_from_dahab_minutes}</p>
                    <div className="md:w-1/2">
                        <h3>Route Distribution for {areaDetails.name}</h3>
                        {areaDetails.grade_distribution ? <GradeBarChart data={areaDetails.grade_distribution}/>:<p>no data</p>}
                    </div>
                    <p>{areaDetails.description}</p>
                    <Card>
                        <CardHeader>
                            <CardTitle>Access</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {areaDetails.access}
                        </CardContent>  
                        <CardDescription hidden={true}>
                            Description of getting to the area
                        </CardDescription>       
                    </Card>
                </div>
            )}
            {!areaDetails && (
            <>
                <h3>Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {areas && Array.isArray(areas) && areas.map((area) => {
                        return (
                            <div key={area.id} className="bg-gray-200 p-4 rounded-lg shadow-md [&_p]:overflow-ellipsis [&_p]:overflow-clip" onClick={() => onAreaChange(area.name)}>
                                <h3>{area.name}</h3>
                                <p><span className="font-semibold">Distance from Dahab:</span> {area.access_from_dahab_minutes}</p>
                                <p><span className="font-semibold">Route Count:</span> {area.route_count}</p>
                            </div>
                        );
                    })}
                </div>
            </>
            )} 
            
        </div>
    );
}