import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useRef, useState } from "react";

type AddLineModalProps = {
    imageUrl: string;
}

export type ControlPoint = [number, number];

export default function AddLineModal ({ imageUrl }: AddLineModalProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [imageLoaded, setImageLoaded] = useState(false);
    const [controlPoints, setControlPoints] = useState<ControlPoint[]>([[5,5],[5,10],[5,50]])

    function handleMouseDown () {

    }

    function handleMouseMove () {
        
    }

    function handleMouseUp () {
        
    }

    function handleImageload () {
        setImageLoaded(true);
        if (!imageRef.current) throw new Error("Imageref should be defined at this point but somehow isnt");
        const interval = (imageRef.current.height-50)/8;
        const startingPoints = Array.from({length: 8}, (_, i): [number, number] => [20+(i*interval%100), i*interval+10])
        setControlPoints(startingPoints);

        const canvas = canvasRef.current;
        if (!canvas) throw new Error("canvas not defined");
        const context = canvas.getContext("2d");
        ctxRef.current = context;
        if (!ctxRef.current) throw new Error("context somehow not initialised")
        console.log("context: ", ctxRef.current);
        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
    }

    function addBezierSpline (context: CanvasRenderingContext2D) {
        context.moveTo(controlPoints[0][0],controlPoints[0][1]);
        
        for (let i = 1; i < controlPoints.length-1; i++) {
            const prev = controlPoints[i-1];
            const curr = controlPoints[i];
            const next = controlPoints[i+1];
            
            // Calculate midpoints for smoother control points
            const cp1x = (prev[0] + curr[0]) / 2;
            const cp1y = (prev[1] + curr[1]) / 2;
            const cp2x = (curr[0] + next[0]) / 2;
            const cp2y = (curr[1] + next[1]) / 2;
            
            context.bezierCurveTo(
                cp1x, cp1y, // First control point (midpoint between prev and current)
                cp2x, cp2y, // Second control point (midpoint between current and next)
                next[0], next[1] // Destination point
            );
        }
    }

    function addLineToCanvas () {
        console.log("button pressed, control points", controlPoints, "image dimensions", imageRef.current?.height);
        if (!ctxRef.current) throw new Error("Canvas Context not initialized");
        const context = ctxRef.current;

        context.beginPath();
        context.strokeStyle = 'red';
        
        addBezierSpline(context);
        
        context.stroke();
    }

    return(
        <Dialog>
        <DialogTrigger asChild><Button className="bg-green-400">Line Editor</Button></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Line in Topo</DialogTitle>
            <DialogDescription>
                Click Plus to add Line, move nodes to correct path
            </DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-[70vh] overflow-auto">
                <img
                            ref={imageRef}
                            src={imageUrl}
                            className="absolute top-0 left-0"
                            alt="the image to draw lines over"
                            onLoad={()=>handleImageload()}
                            style={{
                                pointerEvents: 'none' // Image shouldn't intercept any clicks
                            }}
                        />
                {imageLoaded && <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="border-none absolute top-0 left-0 z-10"
                    style={{
                        pointerEvents: 'auto',
                        width: imageRef.current?.width,
                        height: imageRef.current?.height,
                    }}></canvas>
                }
            </div>
            <Button onClick={()=>addLineToCanvas()}>Add Line</Button>
        </DialogContent>
        </Dialog>
    );
}