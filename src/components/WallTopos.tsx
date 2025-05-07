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
                const maxWidth = 800;
                const breakpoints = [400, 600, 800, 1200]; // Your preferred breakpoints
                const src = "https://pub-5949e21c7d4c4f3e91058712f265f987.r2.dev/"
                // Generate srcset with Cloudflare resizing
                const srcSet = breakpoints
                  .filter(bp => bp <= maxWidth)
                  .map(bp => `${src}${topo.extracted_filename}?width=${bp}&format=webp ${bp}w`)
                  .join(', ');

                const url = `${src}${topo.extracted_filename}?width=${maxWidth}&quality=75&format=webp`;
            return (
                <div key={topo.name} className="flex flex-col max-w-vw">
                    <h2 >{topo.description}</h2>
                    <img
                        src={url}
                        srcSet={srcSet}
                        sizes={`(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`}
                        alt={topo.description}
                        style={{ width: '100%', height: 'auto' }}
                        loading="lazy"
                    />
                    <p>{topo.details}</p>
                </div>
            )})}
        </>
    );
}