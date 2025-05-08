import { useState } from "react";
import { NewClimbingRoute } from "../types/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  

export default function CreateRouteModal({sessionToken, selectedCrag, selectedArea}:{sessionToken: string; selectedCrag: string; selectedArea: string}) {
    
    const [newRoute, setNewRoute] = useState<NewClimbingRoute>({
        name: "",
        grade: "",
        length: 0,
        bolts: 0,
        info: "",
        area: selectedArea,
        crag: selectedCrag,
        setters: ""
    });

     const addRoute = async (newRoute: NewClimbingRoute) => {
            if (!sessionToken) {
                console.error("Not logged in");
                return;
            } else if (newRoute.name === "") {
                console.error('No route name added')
                return;
            }

    
            console.log("Adding route with session token:", sessionToken);
            try {
                const response = await fetch('https://sinai-backend.onrender.com/climbingroutes/new', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`,
                    },
                    body: JSON.stringify(newRoute),
                });
                const data = await response.json();
                console.log("Route added:", data);
            } catch (error) {
                console.error("Error adding route:", error);
            }
        };

    return( 
        <Dialog>
            <DialogTrigger asChild><Button>Add route to this crag</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Create new route</DialogTitle>
                </DialogHeader>
                    <form className="flex flex-col" onSubmit={(e) => {
                        e.preventDefault();
                        addRoute(newRoute);
                    }}>
                        <label className="mb-2">Route Name</label>
                        <input type="text" placeholder="Route Name" value={newRoute.name} onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })} className="border p-2 mb-4 w-full"/>
                        <label className="mb-2">Route Grade</label>
                        <input type="text" placeholder="Route Grade" value={newRoute.grade} onChange={(e) => setNewRoute({ ...newRoute, grade: e.target.value })} className="border p-2 mb-4 w-full"/>
                        <label className="mb-2">Route Length</label>
                        <input type="number" placeholder="Route Length" value={newRoute.length} onChange={(e) => setNewRoute({ ...newRoute, length: parseInt(e.target.value) })} className="border p-2 mb-4 w-full"/>
                        <label className="mb-2">Route Bolts</label>
                        <input type="number" placeholder="Route Bolts" value={newRoute.bolts} onChange={(e) => setNewRoute({ ...newRoute, bolts: parseInt(e.target.value) })} className="border p-2 mb-4 w-full"/>
                        <label className="mb-2">Route Description</label>
                        <textarea placeholder="Route Description" value={newRoute.info} onChange={(e) => setNewRoute({ ...newRoute, info: e.target.value })} className="border p-2 mb-4 w-full"></textarea>
                        <label className="mb-2">Route Setters</label>
                        <input type="text" placeholder="Setters" value={newRoute.setters} onChange={(e) => setNewRoute({...newRoute, setters: e.target.value})} className="border p-2 mb-4 w-full"/>
                        <Button type="submit" className="px-2" >Add Route</Button>
                    </form>
                <DialogDescription>
                    click to submit this route permanently
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}