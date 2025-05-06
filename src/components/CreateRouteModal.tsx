import { useEffect, useState } from "react";

type newClimbingRoute = {
    name: string;
    grade: string;
    length: number;
    bolts: number;
    info: string;
    area: string;
    crag: string;
    setters: string;
};

export default function CreateRouteModal({sessionToken, isVisible, setIsVisible}:{sessionToken: string; isVisible: boolean; setIsVisible: (isVisible: boolean) => void}) {
    
    const [newRoute, setNewRoute] = useState<newClimbingRoute>({
        name: "",
        grade: "",
        length: 0,
        bolts: 0,
        info: "",
        area: "",
        crag: "",
        setters: ""
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                console.log("Escape key pressed");
                setIsVisible(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains("bg-black") && !target.classList.contains("bg-white")) {
                console.log("Background clicked");
                setIsVisible(false);
            }
        });
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

     const addRoute = async (newRoute: newClimbingRoute) => {
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
        <>
        {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-lg min-w-md md:min-w-2xl z-10">
                <h2 className="text-xl font-bold mb-4">Create New Route</h2>
                <form className="flex flex-col" onSubmit={(e) => {
                    e.preventDefault();
                    addRoute(newRoute);
                    setIsVisible(false);
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
                    <label className="mb-2">Area</label>
                    <input type="text" placeholder="Area" value={newRoute.area} onChange={(e) => setNewRoute({ ...newRoute, area: e.target.value })} className="border p-2 mb-4 w-full"/>
                    <label className="mb-2">Crag</label>
                    <input type="text" placeholder="Crag" value={newRoute.crag} onChange={(e) => setNewRoute({...newRoute, crag: e.target.value})} className="border p-2 mb-4 w-full"/>
                    <label className="mb-2">Route Setters</label>
                    <input type="text" placeholder="Setters" value={newRoute.setters} onChange={(e) => setNewRoute({...newRoute, setters: e.target.value})} className="border p-2 mb-4 w-full"/>
                    <button type="submit" className="StandardButton" >Add Route</button>
                    <button type="button" className="StandardButton mt-2" onClick={() => setIsVisible(false)}>Close</button>
                </form>
            </div>
            <div className="fixed inset-0 bg-black opacity-50 z-0"></div>
        </div>
        )}
        </>
    );
}