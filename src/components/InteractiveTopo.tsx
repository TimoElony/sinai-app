import React, { RefObject, useState } from "react";
import AddLineModal from "./AddLineModal";
import { Feature } from "@/types/types";
import { curveCardinal, line } from "d3-shape";
import { toast } from "sonner";

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

export default function InteractiveTopo({ topoRef, index, topoId, filename, sessionToken, description, line_segments, refresh}: InteractiveTopoProps) {
    const [topoLoaded, setTopoLoaded] = useState<boolean[]>([false]);
    const [selectedPath, setSelectedPath] = useState<number | undefined>(undefined);

    const maxWidth = 800;
    const breakpoints = [400, 600, 800, 1200]; // Your preferred breakpoints
    const src = "https://pub-5949e21c7d4c4f3e91058712f265f987.r2.dev/"
    // Generate srcset with Cloudflare resizing
    const srcSet = breakpoints
    .filter(bp => bp <= maxWidth)
    .map(bp => `${src}${filename}?width=${bp}&format=webp ${bp}w`)
    .join(', ');

    const url = `${src}${filename}?width=${maxWidth}&quality=75&format=webp`;


    function handleTopoLoaded (index: number) {
        if (!topoRef.current || !topoRef.current[index] || !line_segments || line_segments.length < 1) {
            return; //this handler is only important where custom lines have been uploaded
        }
        setTopoLoaded(prev=> {
            const currentlyLoaded = [...(prev || false)];
            currentlyLoaded[index] = true;
            return currentlyLoaded;
        })
    }

    function handlePathClick(line_label: number) {
        toast(`path ${line_label} clicked`);
        setSelectedPath(line_label);
    }

    return (
        <div style={{position:'relative', display: 'inline-block'}}>
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
                                onLoad={()=>handleTopoLoaded(index)}
                            />
                            {line_segments && topoLoaded[index] && 
                                <svg
                                    width={topoRef.current? topoRef.current[index].width : 200}
                                    height={topoRef.current? topoRef.current[index].height : 200}
                                    style={{ position: "absolute" , top: 1, left: 1 }}
                                >
                                    {line_segments.map((segment)=>{
                                        if (!Array.isArray(segment.geometry.coordinates) || segment.geometry.type === 'Point') return;
                                        const width = topoRef.current ? topoRef.current[index].width : 200;
                                        const height = topoRef.current ? topoRef.current[index].height : 200;
                                        const points: Array<[number, number]> = segment.geometry.coordinates.map(([xn,yn]) => {
                                            const x = xn*width;
                                            const y = yn*height; //normalised coords back to scale
                                            return [x,y];
                                        });
        
                                        const path = line().curve(curveCardinal)(points);
                                        const [labelcx, labelcy] = points[points.length-1];
                                        const label = segment.properties.line_label;
                                        if (!path) return;
                                        return(
                                            <React.Fragment key={label}>
                                                {selectedPath===label && points.map(([x,y]) => {
                                                    return (
                                                        <circle key={x + y + "controlpoint"} cx={x} cy={y} r={12} fill="none" stroke="red"/>
                                                    )
                                                })}
                                                <path key={"path"+ label} d={path} stroke="yellow" strokeWidth={2} fill="none" onClick={()=>handlePathClick(label)}/>
                                                <circle key={"circle" + label} cx={labelcx} cy={labelcy+30} r={12} fill="white" />
                                                <circle key={"circleend" + label} cx={points[0][0]} cy={points[0][1]} r={5} stroke="yellow" strokeWidth={2} fill="yellow"/>
                                                <text key={"text"+label} x={labelcx} y={labelcy+32} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="black">
                                                    {label}
                                                </text>
                                            </React.Fragment>
                                        )
                                    
                                    })}
                                </svg>
                            }
                            {url && 
                                <AddLineModal imageUrl={url} topoId={topoId} filename={filename} sessionToken={sessionToken} refresh={refresh}/>
                            }
                            </div>
    )
}