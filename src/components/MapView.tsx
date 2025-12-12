import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import { ClimbingArea, TopoPoints } from '@/src/types/types';
import * as turf from '@turf/turf';

export default function MapView ({ topoPoints, onValueChange, onAreaChange, areas, highlightedTopoId }: { topoPoints: TopoPoints[]; onValueChange: (value: string) => void; onAreaChange: (selectedValue: string) => void ; areas: ClimbingArea[]; highlightedTopoId?: string }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
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
                        features: topoPoints
                            .filter(point => point.longitude != null && point.latitude != null && 
                                           !isNaN(Number(point.longitude)) && !isNaN(Number(point.latitude)))
                            .map((point) => ({
                                type: 'Feature',
                                properties: {
                                    description: point.description,
                                    climbing_area_name: point.climbing_area_name,
                                    climbing_sector: point.climbing_sector,
                                },
                                geometry: {
                                    type: 'Point',
                                    coordinates: [Number(point.longitude), Number(point.latitude)],
                                },
                            })),
                    },
                });
                
                areas.map((area)=>{
                    const areaPoints = topoPoints.filter((point)=>
                        point.climbing_area_name === area.name && 
                        point.longitude != null && 
                        point.latitude != null &&
                        !isNaN(Number(point.longitude)) && 
                        !isNaN(Number(point.latitude))
                    );
                    const areaCollection = turf.featureCollection(areaPoints.map((point)=>
                        turf.point([Number(point.longitude), Number(point.latitude)], { name: point.description })
                    ));
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
        
        console.log('Highlighting topo:', highlightedTopoId);
        console.log('Available topoPoints:', topoPoints);
        
        const highlightedTopo = topoPoints.find(tp => tp.id === highlightedTopoId);
        console.log('Found topo:', highlightedTopo);
        
        if (!highlightedTopo) {
            console.error('Could not find topo with id:', highlightedTopoId);
            return;
        }

        console.log('Coordinates:', highlightedTopo.longitude, highlightedTopo.latitude);

        // Ensure coordinates are numbers
        const lng = parseFloat(String(highlightedTopo.longitude));
        const lat = parseFloat(String(highlightedTopo.latitude));
        
        if (isNaN(lng) || isNaN(lat)) {
            console.error('Invalid coordinates:', { lng, lat, original: highlightedTopo });
            return;
        }
        
        console.log('Parsed coordinates:', lng, lat);

        // Remove existing highlight layer if it exists
        if (mapInstanceRef.current.getLayer('highlighted-topo')) {
            mapInstanceRef.current.removeLayer('highlighted-topo');
        }
        if (mapInstanceRef.current.getSource('highlighted-topo')) {
            mapInstanceRef.current.removeSource('highlighted-topo');
        }

        // Add source for highlighted topo
        mapInstanceRef.current.addSource('highlighted-topo', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {
                    description: highlightedTopo.description,
                    climbing_area_name: highlightedTopo.climbing_area_name,
                },
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
            },
        });

        // Add pulsing circle layer for highlighted topo
        mapInstanceRef.current.addLayer({
            id: 'highlighted-topo',
            type: 'circle',
            source: 'highlighted-topo',
            paint: {
                'circle-radius': 20,
                'circle-color': '#ff0000',
                'circle-opacity': 0.8,
                'circle-stroke-width': 3,
                'circle-stroke-color': '#ffffff',
            },
        });

        // Fly to the highlighted location
        mapInstanceRef.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            essential: true
        });

        // Show popup on the highlighted point
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setLngLat([lng, lat])
            .setHTML(`<strong>${highlightedTopo.description}</strong><br>${highlightedTopo.climbing_area_name}`)
            .addTo(mapInstanceRef.current);

        // Cleanup function to remove highlight when component unmounts or topoId changes
        return () => {
            popup.remove();
        };

    }, [highlightedTopoId, topoPoints]);

    

    return(
        <>
            <div ref={mapContainerRef} className="fixed inset-0 h-[80dvh] bg-gray-400"></div>
        </>
    );
}