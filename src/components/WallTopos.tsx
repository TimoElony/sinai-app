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
                const url = `https://pub-5949e21c7d4c4f3e91058712f265f987.r2.dev/${topo.extracted_filename}?width=400&quality=75&f=webp`;
            return (
                <div key={topo.name} className="flex flex-col max-w-vw">
                    <h2 >{url}</h2>
                    <img src={url}/>
                </div>
            )})}
        </>
    );
}