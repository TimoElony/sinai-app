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

export default function AddLineModal ({ imageUrl }: AddLineModalProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [imageLoaded, setImageLoaded] = useState(false);

    function handleMouseDown () {

    }

    function handleMouseMove () {
        
    }

    function handleMouseUp () {
        
    }

    useEffect(() => {

    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => 
        {
            setImageLoaded(true);
            console.log("loeaded");
        }
    img.onerror = () => console.error("Failed to load image");

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

    useEffect(()=>{
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const context = canvas.getContext("2d");
        if (!context) return;

        if (!imageRef.current) return;

        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
        context.drawImage(imageRef.current, 0, 0)
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
        
        


    },[imageLoaded]);

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
            <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="the image to be edited"
                    />
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="border border-gray-300 bg-gray-300"
            >Add a line to topo</canvas>
        </DialogContent>
        </Dialog>
    );
}