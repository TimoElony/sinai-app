import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import { ClimbingArea, TopoPoints } from '@/types/types';
import * as turf from '@turf/turf';
import { map } from 'zod';

export default function MapView ({ topoPoints, onValueChange, changeHandler, areas }: { topoPoints: TopoPoints[]; onValueChange: (value: string) => void; changeHandler: (selectedValue: string) => void ; areas: ClimbingArea[] }) {
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
                
                areas.map((area)=>{
                    const areaPoints = topoPoints.filter((point)=>point.climbing_area_name === area.name);
                    const areaCollection = turf.featureCollection(areaPoints.map((point)=>turf.point([point.longitude, point.latitude], { name: point.description })));
                    
                    const convexHull = turf.convex(areaCollection);
                    const areaHull = convexHull 
                        ? turf.buffer(convexHull, 5, { units: 'kilometers' }) 
                        : turf.buffer(turf.point([0, 0]), 5, { units: 'kilometers' });

                    mapInstanceRef.current?.addSource(`area-collection${area.name}`, {
                    type: 'geojson',
                    data: areaCollection
                    });

                    if (areaHull) {
                        mapInstanceRef.current?.addSource(`area-polygon${area.name}`, {
                            type: 'geojson',
                            data: areaHull
                        });
                    }

                    mapInstanceRef.current?.addLayer({
                        id: `area-polygon${area.name}`,
                        type: 'fill',
                        source: `area-polygon${area.name}`,
                        layout: {},
                        paint: {
                            'fill-color': area.color,
                            'fill-opacity': 0.3
                        },
                        minzoom: 8,
                        maxzoom: 12,
                    });

                    mapInstanceRef.current?.addLayer({
                        id: `area-border${area.name}`,
                        type: 'line',
                        source: `area-polygon${area.name}`,
                        layout: {},
                        paint: {
                            'line-color': area.color,
                            'line-width': 2,
                            'fill-opacity': 0.8,
                        }
                    });

                    mapInstanceRef.current?.addLayer({
                    id: `area-topos${area.name}`,
                    type: 'circle',
                    source: `area-collection${area.name}`,
                    paint: {
                        'circle-radius': 8,
                        'circle-color': area.color,
                        'circle-opacity': 0.6,
                    },
                    minzoom: 10,
                });

                mapInstanceRef.current?.on('click', `area-polygon${area.name}`, (e) => {
                    const geometry = e.features?.[0].geometry;
                    let coordinates: [number, number] | undefined;
                    if (geometry?.type === 'Polygon') {
                        coordinates = geometry.coordinates[0][0] as [number, number];
                    }
                    const description = area.access_from_dahab_minutes;
                    const climbingAreaName = area.name;

                    if (coordinates) {
                        const popup = new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <div>
                                    <p><strong>${area.name}</strong>: ${description}</p>
                                    <button id="navigate-button" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Routes in this area</button>
                                </div>
                            `)
                            .setMaxWidth('300px')
                            .setOffset(10)
                            .addTo(mapInstanceRef.current!);

                        // Add event listener to the button inside the popup
                        popup?.getElement()?.querySelector('#navigate-button')?.addEventListener('click',() => {
                            console.log('Button clicked', climbingAreaName);
                            changeHandler(climbingAreaName || 'none');
                            onValueChange('routes');
                        });
                    }
                });

                mapInstanceRef.current?.on('click', `area-topos${area.name}`, (e) => {
                    const geometry = e.features?.[0].geometry;
                    let coordinates: [number, number] | undefined;
                    if (geometry?.type === 'Point') {
                        coordinates = geometry.coordinates as [number, number];
                    }
                    const description = e.features?.[0].properties?.name;
                    const climbingAreaName = area.name;

                    if (coordinates) {
                        const popup = new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <div>
                                    <p><strong>${area.name}</strong>: Topo: ${description}</p>
                                    <button id="navigate-button" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Routes in this area</button>
                                </div>
                            `)
                            .setMaxWidth('300px')
                            .setOffset(10)
                            .addTo(mapInstanceRef.current!);

                        // Add event listener to the button inside the popup
                        popup?.getElement()?.querySelector('#navigate-button')?.addEventListener('click',() => {
                            console.log('Button clicked', climbingAreaName);
                            changeHandler(climbingAreaName || 'none');
                            onValueChange('routes');
                        });
                    }
                });
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