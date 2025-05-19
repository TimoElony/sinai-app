import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";

type AddLineModalProps = {
    imageUrl: string;
}

type PointerOrTouchEvent = React.PointerEvent<HTMLElement>;

function drawCardinalSpline(ctx: CanvasRenderingContext2D, points: [number, number][], tension = 0.5) {
    // did not have the time to really check the validity of this, but smooth enough, close enough and the control points are there to check
        if (points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = i > 0 ? points[i - 1] : points[0];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = i < points.length - 2 ? points[i + 2] : p2;

            // Control points (cardinal spline tangent calculations)
            const cp1x = p1[0] + (p2[0] - p0[0]) * tension / 3;
            const cp1y = p1[1] + (p2[1] - p0[1]) * tension / 3;
            const cp2x = p2[0] - (p3[0] - p1[0]) * tension / 3;
            const cp2y = p2[1] - (p3[1] - p1[1]) * tension / 3;

            // Cubic Bézier segment
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
    }

    ctx.stroke();
    }

export type ControlPoint = [number, number];

export default function AddLineModal ({ imageUrl }: AddLineModalProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
    const [imageReady, setImageReady] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [nearestIndex, setNearestIndex] = useState<number | undefined>(undefined);
    const [isDragging, setIsDragging] = useState(false);

    // in case mouse leaves the canvas
    // useEffect(() => {
    //     const handleGlobalMouseUp = () => setIsDragging(false);
    //     window.addEventListener('mouseup', handleGlobalMouseUp);
    //     return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    // }, []);

    useEffect(()=> {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctxRef.current = ctx;
    },[imageReady, imageRef]);

    function handleMouseDown (e: PointerOrTouchEvent) {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        if(!controlPoints) throw new Error("there is no line to edit, add one")
        if(!ctxRef.current) throw new Error("context not defined"); 
        const squaredDistance = controlPoints.map(point=>(point[0]-x)*(point[0]-x)+(point[1]-y)*(point[1]-y)); // pythagoras square distance
        let minDistance = 30; //needs to be closer than 30 to trigger
        let nearestIndex = undefined;
        for (let i = 0; i < squaredDistance.length; i++) {
            if (squaredDistance[i] < minDistance) {
                minDistance = squaredDistance[i];
                nearestIndex = i;
            }
        }
        if (nearestIndex != undefined) {
            setNearestIndex(nearestIndex);
            setIsDragging(true);
        }
        ctxRef.current.beginPath();
        ctxRef.current.strokeStyle = 'blue';
        ctxRef.current.lineWidth = 2;
        ctxRef.current.moveTo(x,y);

    }

    function handleMouseMove (e: PointerOrTouchEvent) {
        if(!isDragging || nearestIndex === undefined) return;
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        console.log(x , y);
        console.log("mousemove", e);
        if(!ctxRef.current) throw new Error("mousemove fail bc of context");
        ctxRef.current.lineTo(x,y);
        ctxRef.current.stroke();
        let newPoints = [...controlPoints]
        newPoints[nearestIndex] = [x,y];
        setControlPoints(newPoints);
    }

    function handleMouseUp (e: PointerOrTouchEvent) {
        if(!isDragging) return;
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        console.log(x,y)
        if(!ctxRef.current) throw new Error("mouseup fail"); 
        ctxRef.current.closePath();
        drawRoute();
        setIsDragging(false);
    }

    function handleImageload () {
        setImageReady(true);

        if (!imageRef.current) throw new Error("Imageref should be defined at this point but somehow isnt");
        const interval = (imageRef.current.height-50)/8;
        const startingPoints = Array.from({length: 8}, (_, i): [number, number] => [20+(i*interval%100), i*interval+10])
        setControlPoints(startingPoints);

        const canvas = canvasRef.current;
        if (!canvas) throw new Error("canvas not defined");

        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
    }

    function handleOpenChange (open: boolean) {
        //open is determined by internal Dialog Logic, if it opens, we just abide, if it closes we clean up the context
        if (!open) {
            setImageReady(false);
            setControlPoints([]);
            ctxRef.current = null;
            imageRef.current = null;
            canvasRef.current = null;
        }
        setIsOpen(open); 
    }

    
    function drawRoute () {
        if (!ctxRef.current) throw new Error("Canvas Context not initialized");
        const context = ctxRef.current;
        if(!canvasRef.current) throw new Error("Canvas ref is null");
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        context.strokeStyle = 'blue';
        context.lineWidth = 1;
        
        drawCardinalSpline(context, controlPoints);

        controlPoints.map((point)=> {
            context.beginPath();
            context.arc(point[0], point[1], 5, 0, Math.PI*2);
            context.stroke();
        })

    }

    return(
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild><Button className="bg-green-400">Line Editor</Button></DialogTrigger>
        <DialogContent className="h-[80vh]">
            <DialogHeader>
            <DialogTitle>Edit Line in Topo</DialogTitle>
            <DialogDescription>
                Click Plus to add Line, move nodes to correct path
            </DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-[50vh] md:h-[60vh] overflow-auto">
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
                <canvas
                    ref={canvasRef}
                    onPointerDown={handleMouseDown}
                    onPointerMove={handleMouseMove}
                    onPointerUp={handleMouseUp}
                    className="border-none absolute top-0 left-0 z-10"
                    style={{
                        pointerEvents: 'auto',
                        width: imageRef.current?.width,
                        height: imageRef.current?.height,
                    }}></canvas>
            </div>
            <Button onClick={()=>drawRoute()}>Add Line</Button>
        </DialogContent>
        </Dialog>
    );
}