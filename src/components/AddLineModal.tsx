import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useEffect, useRef } from "react";

type AddLineModalProps = {
    topoImage: HTMLImageElement | null;
}

export default function AddLineModal ({ topoImage }: AddLineModalProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    function handleMouseDown () {

    }

    function handleMouseMove () {
        
    }

    function handleMouseUp () {
        
    }

    useEffect(()=>{
        const canvas = canvasRef.current;
        if (canvas && topoImage) {
            const context = canvas.getContext("2d");
            if (context) {
                canvas.width = topoImage.naturalWidth;
                canvas.height = topoImage.naturalHeight;
                context.drawImage(topoImage, 0, 0)
                context.beginPath();
                context.moveTo(5,5);
                context.strokeStyle = 'red';  // Add color
                context.lineWidth = 3;       // Add line width
                context.bezierCurveTo(5,5,10,10,20,20);
                context.stroke();
                context?.closePath();
                ctxRef.current = context;
                if (ctxRef.current) {

                }
            }
        }


    },[topoImage]);

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
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="w-full h-[70vh] border border-gray-300 bg-gray-300"
            >Add a line to topo</canvas>
        </DialogContent>
        </Dialog>
    );
}