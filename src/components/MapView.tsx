import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';


export default function MapView () {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    console.log(mapboxToken);

    useEffect(() => {
        mapboxgl.accessToken = mapboxToken;
        if (!mapContainerRef.current) {
            return;
        }
        mapInstanceRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [34, 28.5],
            zoom: 8,
        });

        return () => {
            mapInstanceRef.current?.remove();
        };
    }, []);

    return(
        <>
            <div ref={mapContainerRef} className="fixed inset-0 h-[100dvh] bg-gray-400"></div>
        </>
    );
}