import { WallTopo } from "@/types/types";
import { useEffect, useState } from "react";

export default function WallTopos ({area, crag}:{area: string ;crag: string}) {
    const [topos, setTopos] = useState<WallTopo[]>([])
    useEffect(() => {
        fetchCragTopos();
    },[crag])

    const fetchCragTopos = async () => {
        try {
            const data = await fetch(`https://sinai-backend.onrender.com/walltopos/${area}/${crag}`);
            const topoData = await data.json();
            setTopos(topoData);
            console.log(topoData);

        } catch (error) {
            console.error('fetching topos failed')
        }
    }

    return (
        <>
            <h1>Topos</h1>
            {topos.map((topo)=> {
                const url = `https://vwpzcvemysspydbtlcxo.supabase.co/storage/v1/object/public/sinaibucket/${topo.extracted_filename}`;
            return (
                <div className="flex flex-col">
                    <h2 key={topo.name}>{url}</h2>
                    <img src={url}/>
                </div>
            )})}
        </>
    );
}