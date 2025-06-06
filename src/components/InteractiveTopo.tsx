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

async function submitLine (width: number, height: number, offsetPoints: Array<[number, number]>, topoId: string, filename: string, lineLabel: number, sessionToken: string, modifiedLabel: number) {
        let asNew = true;
        if(modifiedLabel == lineLabel) {
            asNew = false;
        }
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
        e.preventDefault;
        //disabled to properly enable interaction with buttons
        // Check if click was directly on a path element
        // const clickedPath = (e.target as HTMLElement).closest('path');
        // const clickedCircle = (e.target as HTMLElement).closest('circle');
        // if (!clickedPath && !clickedCircle) {
        //     setSelectedPath(undefined);
        //     setModifiedPoints(null);
        // }
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
        newPoints[pointIndex] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
        setModifiedPoints(newPoints);

    }

    function handleCircleUp () {
        setIsDragging(false);
    }

    function handleCircleLeave (e: React.PointerEvent<SVGCircleElement>) {
        if(!dimensions) return;
        if (e.nativeEvent.offsetX > dimensions[0] || e.nativeEvent.offsetX < 0 || e.nativeEvent.offsetY > dimensions[1] || e.nativeEvent.offsetY < 0) {
            setIsDragging(false);
        };
        
    }

    function handleNumberChange (value: string) {
        if (!value) {
            setModifiedNumber(0);
        }
        setModifiedNumber(Number(value));
    }

    function handleSubmit () {
        try {
            if (!dimensions || !modifiedNumber || !modifiedPoints || !selectedPath) throw new Error("cannot submit like this");
            submitLine(dimensions[0], dimensions[1], modifiedPoints, topoId, filename, selectedPath, sessionToken, modifiedNumber);
        } catch (error) {
            toast.error(String(error))
        } finally {
            refresh();
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
                                        let label = segment.properties.line_label;
                                        if (!path) return;
                                        return(
                                            <React.Fragment key={`route-${label}`}>
                                                
                                                <path
                                                    d={path}
                                                    stroke="transparent"
                                                    strokeWidth={10} // Wider clickable area
                                                    fill="none"
                                                    pointerEvents="visibleStroke" // Make only the stroke clickable
                                                    onClick={(e) => handlePathClick(label, e, points)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                                <path key={"path"+ label + topoId} d={path} stroke="yellow" strokeWidth={2} fill="none" pointerEvents="none"/>
                                                <circle key={"circle" + label} cx={labelcx} cy={labelcy+30} r={12} fill="white" />
                                                <circle key={"circleend" + label} cx={points[0][0]} cy={points[0][1]} r={5} stroke="yellow" strokeWidth={2} fill="yellow"/>
                                                <text key={"text"+label} x={labelcx} y={labelcy+32} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="black">
                                                    {label}
                                                </text>
                                                {modifiedPoints &&
                                                    <path key={"modifiedPath"+ label + topoId} d={line().curve(curveCardinal)(modifiedPoints) || ""} stroke="red" strokeWidth={1} fill="none" pointerEvents="none"/>
                                                }
                                                {selectedPath===label && modifiedPoints &&
                                                    modifiedPoints.map(([x,y],i) => {
                                                        return (
                                                            <circle 
                                                                key={`controlpoint-${i}-${topoId}`} 
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
                                                                onPointerLeave={handleCircleLeave}
                                                            />
                                                        )
                                                    })
                                                }
                                            </React.Fragment>
                                        )
                                    
                                    })}
                                </svg>
                            }
                            {sessionToken &&
                                <>
                                <Button className="m-2" onClick={()=>handleSubmit()}>Submit Changes</Button>
                                <Input aria-label="number of the line" id="lineLabel" className="p-2 bg-amber-200 max-w-20 mx-2" type="number" value={modifiedNumber?.toString()|| 0} onChange={(e)=>handleNumberChange(e.target.value)}/>
                                </>
                            }
                            </div>
    )
}