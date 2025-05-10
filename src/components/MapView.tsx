import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import { TopoPoints } from '@/types/types';

export default function MapView ({ topoPoints, onValueChange, changeHandler }: { topoPoints: TopoPoints[]; onValueChange: (value: string) => void; changeHandler: (selectedValue: string) => void }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

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

        if (mapInstanceRef.current != null) {
            mapInstanceRef.current.on('load', () => {
                if (mapInstanceRef.current == null) {
                    return;
                }
                
                mapInstanceRef.current.addSource('topo-points', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: topoPoints.map((point) => ({
                            type: 'Feature',
                            properties: {
                                description: point.description,
                                climbing_area_name: point.climbing_area_name,
                                climbing_sector: point.climbing_sector,
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: [point.longitude, point.latitude],
                            },
                        })),
                    },
                });

                mapInstanceRef.current.addLayer({
                    id: 'topo-points',
                    type: 'circle',
                    source: 'topo-points',
                    paint: {
                        'circle-radius': 6,
                        'circle-color': '#FF0000',
                        'circle-opacity': 0.8,
                    },
                });

                mapInstanceRef.current.on('click', 'topo-points', (e) => {
                    const geometry = e.features?.[0].geometry;
                    let coordinates: [number, number] | undefined;
                    if (geometry?.type === 'Point') {
                        coordinates = geometry.coordinates as [number, number];
                    }
                    const description = e.features?.[0]?.properties?.description;

                    if (coordinates) {
                        const popup = new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <div class="bg-white text-black p-2 rounded">
                                    <p>${description}</p>
                                    <button id="navigate-button" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Routes in this area</button>
                                </div>
                            `)
                            .setMaxWidth('300px')
                            .setOffset(10)
                            .addTo(mapInstanceRef.current!);

                        // Add event listener to the button inside the popup
                        popup?.getElement()?.querySelector('#navigate-button')?.addEventListener('click', () => {
                            changeHandler(e.features?.[0]?.properties?.climbing_area_name || 'none');
                            onValueChange('routes');
                        });
                    }
                });



            });
            
        }

        

        return () => {
            mapInstanceRef.current?.remove();
        };
    }, []);

    

    return(
        <>
            <div ref={mapContainerRef} className="fixed inset-0 h-[80dvh] bg-gray-400"></div>
        </>
    );
}