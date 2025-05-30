import React, { RefObject, useState } from "react";
import { Feature } from "@/types/types";
import { curveCardinal, line } from "d3-shape";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type InteractiveTopoProps = {
    topoRef: RefObject<HTMLImageElement[] | null>;
    index: number;
    topoId: string;
    filename: string;
    sessionToken: string;
    description: string;
    line_segments: Feature[];
    refresh: () => void;
}

async function submitLine (width: number, height: number, offsetPoints: Array<[number, number]>, topoId: string, filename: string, lineLabel: number, sessionToken: string, modifiedLabel: number, asNew: boolean) {
        if(asNew && modifiedLabel == lineLabel) throw new Error("this line label already exists")
        const normalizedPoints = offsetPoints.map((point)=>[point[0]/width, point[1]/height]);
        const geoJsonFeature = {
            type: "Feature",
            properties: {
                topo_id: topoId,
                file_name: filename,
                line_label: modifiedLabel
            },
            geometry: {
                type: "LineString",
                coordinates: normalizedPoints
            }
        };
        try {
            const response = await fetch(`https://sinai-backend.onrender.com/walltopos/drawnLine/${lineLabel}/${asNew}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(geoJsonFeature),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.details || 'Failed to save line');
            }
            const data = await response.json();
            toast.success(data.message);
        } catch (error) {
            toast.error(String(error));
        }
    }

export default function InteractiveTopo({ topoRef, index, topoId, filename, sessionToken, description, line_segments, refresh}: InteractiveTopoProps) {
    const [topoLoaded, setTopoLoaded] = useState(false);
    const [selectedPath, setSelectedPath] = useState<number | undefined>(undefined);
    const [modifiedPoints, setModifiedPoints] = useState<Array<[number, number]> | null>(null);
    const [modifiedNumber, setModifiedNumber] = useState<number | undefined>(undefined);
    const [isDragging, setIsDragging] = useState(false);
    const [dimensions, setDimensions] = useState<[number, number] | null>(null);

    const maxWidth = 800;
    const breakpoints = [400, 600, 800, 1200]; // Your preferred breakpoints
    const src = "https://pub-5949e21c7d4c4f3e91058712f265f987.r2.dev/"
    // Generate srcset with Cloudflare resizing
    const srcSet = breakpoints
    .filter(bp => bp <= maxWidth)
    .map(bp => `${src}${filename}?width=${bp}&format=webp ${bp}w`)
    .join(', ');

    const url = `${src}${filename}?width=${maxWidth}&quality=75&format=webp`;


    function handleTopoLoad (index: number) {
        if (!topoRef.current || !topoRef.current[index] || !line_segments || line_segments.length < 1) {
            return; //only draw svg lines where they have been uploaded
        }
        setDimensions([topoRef.current[index].width,topoRef.current[index].height]);
        setTopoLoaded(true);

    }

    const handleContainerClick = (e: React.MouseEvent) => {
        // Check if click was directly on a path element
        const clickedPath = (e.target as HTMLElement).closest('path');
         const clickedCircle = (e.target as HTMLElement).closest('circle');
        if (!clickedPath && !clickedCircle) {
            setSelectedPath(undefined);
            setModifiedPoints(null);
        }
    };

    function handlePathClick(line_label: number, e: React.MouseEvent, pointsToEdit: Array<[number, number]>) {
        e.stopPropagation();
        toast(`path ${line_label} clicked`);
        setSelectedPath(line_label);
        setModifiedPoints(pointsToEdit);
        setModifiedNumber(line_label);
    }

    function handleCircleDown(e: React.PointerEvent<SVGCircleElement>) {
        e.stopPropagation;
        setIsDragging(true);
    }

    function handleCircleMoving(e: React.PointerEvent<SVGCircleElement>, pointIndex: number) {
        if (!isDragging || !modifiedPoints) return;
        e.stopPropagation;
        const newPoints = [...modifiedPoints];
        console.log(newPoints[pointIndex]);
        console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        newPoints[pointIndex] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
        setModifiedPoints(newPoints);

    }

    function handleCircleUp () {
        setIsDragging(false);
    }

    function handleNumberChange (value: string) {
        setModifiedNumber(Number(value));
    }

    function handleSubmit (asNew: boolean) {
        try {
            if (!dimensions || !modifiedNumber || !modifiedPoints || !selectedPath) throw new Error("cannot submit like this");
            submitLine(dimensions[0], dimensions[1], modifiedPoints, topoId, filename, selectedPath, sessionToken, modifiedNumber, asNew)
            refresh();
        } catch (error) {
            toast.error(String(error))
        }
        
    }

    return (
        <div style={{position:'relative', display: 'inline-block', touchAction: 'none'}} onClick={handleContainerClick}>
                            <img
                                ref={el => {
                                    if (el && topoRef.current) {
                                        topoRef.current[index] = el;
                                    }
                                }}
                                src={url}
                                srcSet={srcSet}
                                sizes={`(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`}
                                alt={description}
                                style={{ width: '100%', height: 'auto' }}
                                loading="lazy"
                                onLoad={()=>handleTopoLoad(index)}
                            />
                            {line_segments && topoLoaded && dimensions &&
                                <svg
                                    width={dimensions[0]}
                                    height={dimensions[1]}
                                    style={{ position: "absolute" , top: 1, left: 1 }}
                                >
                                    {line_segments.map((segment)=>{
                                        if (!Array.isArray(segment.geometry.coordinates) || segment.geometry.type === 'Point') return;
                                        const points: Array<[number, number]> = segment.geometry.coordinates.map(([xn,yn]) => {
                                            const x = xn*dimensions[0];
                                            const y = yn*dimensions[1]; //normalised coords back to scale
                                            return [x,y];
                                        });
        
                                        const path = line().curve(curveCardinal)(points);
                                        const [labelcx, labelcy] = points[points.length-1];
                                        const label = segment.properties.line_label;
                                        if (!path) return;
                                        return(
                                            <React.Fragment key={label}>
                                                
                                                <path
                                                    d={path}
                                                    stroke="transparent"
                                                    strokeWidth={10} // Wider clickable area
                                                    fill="none"
                                                    pointerEvents="visibleStroke" // Make only the stroke clickable
                                                    onClick={(e) => handlePathClick(label, e, points)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                                <path key={"path"+ label} d={path} stroke="yellow" strokeWidth={2} fill="none" pointerEvents="none"/>
                                                <circle key={"circle" + label} cx={labelcx} cy={labelcy+30} r={12} fill="white" />
                                                <circle key={"circleend" + label} cx={points[0][0]} cy={points[0][1]} r={5} stroke="yellow" strokeWidth={2} fill="yellow"/>
                                                <text key={"text"+label} x={labelcx} y={labelcy+32} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="black">
                                                    {label}
                                                </text>
                                                {modifiedPoints &&
                                                    <path key={"modifiedPath"+ label} d={line().curve(curveCardinal)(modifiedPoints) || ""} stroke="red" strokeWidth={1} fill="none" pointerEvents="none"/>
                                                }
                                                {selectedPath===label && modifiedPoints &&
                                                    modifiedPoints.map(([x,y],i) => {
                                                        return (
                                                            <circle 
                                                                key={`controlpoint-${i}`} 
                                                                cx={x} 
                                                                cy={y} 
                                                                r={15} 
                                                                fill="transparent" 
                                                                stroke="red" 
                                                                data-index={i}
                                                                pointerEvents='visibleFill'
                                                                onPointerDown={handleCircleDown}
                                                                onPointerMove={(e)=>handleCircleMoving(e, i)}
                                                                onPointerUp={()=>handleCircleUp()}
                                                                onPointerLeave={()=>handleCircleUp()}
                                                            />
                                                        )
                                                    })
                                                }
                                            </React.Fragment>
                                        )
                                    
                                    })}
                                </svg>
                            }
                            {modifiedNumber &&
                                <>
                                <Button onClick={()=>handleSubmit(false)}>Submit Changes</Button>
                                <Button onClick={()=>handleSubmit(true)}>Upload as new</Button>
                                <Input aria-label="number of the line" id="lineLabel" className="p-2 bg-amber-200" type="number" value={modifiedNumber.toString()} onChange={(e)=>handleNumberChange(e.target.value)} onBlur={(e)=>handleNumberChange(e.target.value)}/>
                                </>
                            }
                            </div>
    )
}