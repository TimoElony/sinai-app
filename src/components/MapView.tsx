import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import { ClimbingArea, TopoPoints } from '@/src/types/types';
import * as turf from '@turf/turf';

export default function MapView ({ topoPoints, onValueChange, onAreaChange, areas, highlightedTopoId }: { topoPoints: TopoPoints[]; onValueChange: (value: string) => void; onAreaChange: (selectedValue: string) => void ; areas: ClimbingArea[]; highlightedTopoId?: string }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const highlightMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
        console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is not set. Map functionality will be disabled.');
    }

    useEffect(() => {
        if (!mapboxToken) {
            return;
        }
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
                    if (areaCollection.features.length < 3) {
                        const x = areaCollection.features[0]?.geometry.coordinates[0];
                        const y = areaCollection.features[0]?.geometry.coordinates[1];
                        areaCollection.features.push(turf.point([x + 0.0001, y]));
                        areaCollection.features.push(turf.point([x + 0.0001, y + 0.0001]));
                        areaCollection.features.push(turf.point([x, y + 0.0001]));
                    }
                    const convexHull = turf.convex(areaCollection);
                    const areaHull = convexHull 
                        ? turf.buffer(convexHull, 4, { units: 'kilometers' }) 
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
                    minzoom: 12,
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
                                    <p><strong>${area.name}</strong>: ${description}, ${area.route_count} Routes</p>
                                    <button id="navigate-button" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Routes in this area</button>
                                </div>
                            `)
                            .setMaxWidth('300px')
                            .setOffset(10)
                            .addTo(mapInstanceRef.current!);

                        // Add event listener to the button inside the popup
                        popup?.getElement()?.querySelector('#navigate-button')?.addEventListener('click',() => {
                            console.log('Button clicked', climbingAreaName);
                            onAreaChange(climbingAreaName || 'none');
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
                            onAreaChange(climbingAreaName || 'none');
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

    // Effect to handle highlighting a specific topo
    useEffect(() => {
        if (!highlightedTopoId || !mapInstanceRef.current) return;
        
        const highlightedTopo = topoPoints.find(tp => tp.id === highlightedTopoId);
        if (!highlightedTopo) return;

        // Remove existing highlight marker
        if (highlightMarkerRef.current) {
            highlightMarkerRef.current.remove();
        }

        // Create a pulsing marker element
        const el = document.createElement('div');
        el.className = 'highlighted-marker';
        el.style.cssText = `
            width: 30px;
            height: 30px;
            background-color: #ff0000;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(255,0,0,0.5);
            animation: pulse 2s infinite;
        `;

        // Add animation keyframes if not already added
        if (!document.getElementById('pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Create and add the marker
        highlightMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([highlightedTopo.longitude, highlightedTopo.latitude])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<strong>${highlightedTopo.description}</strong><br>${highlightedTopo.climbing_area_name}`)
            )
            .addTo(mapInstanceRef.current);

        // Fly to the highlighted location
        mapInstanceRef.current.flyTo({
            center: [highlightedTopo.longitude, highlightedTopo.latitude],
            zoom: 14,
            essential: true
        });

        // Open the popup
        highlightMarkerRef.current.togglePopup();

    }, [highlightedTopoId, topoPoints]);

    

    return(
        <>
            <div ref={mapContainerRef} className="fixed inset-0 h-[80dvh] bg-gray-400"></div>
        </>
    );
}