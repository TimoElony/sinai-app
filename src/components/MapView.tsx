import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import { ClimbingArea, TopoPoints } from '@/src/types/types';
import * as turf from '@turf/turf';

export default function MapView ({ topoPoints, onValueChange, onAreaChange, onCragChange, areas, highlightedTopoId, selectedArea }: { topoPoints: TopoPoints[]; onValueChange: (value: string) => void; onAreaChange: (selectedValue: string) => void; onCragChange?: (selectedValue: string, areaName?: string) => void; areas: ClimbingArea[]; highlightedTopoId?: string; selectedArea?: string }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
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
            style: 'mapbox://styles/mapbox/satellite-v9',
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

                    // Add label for area name
                    if (areaHull) {
                        mapInstanceRef.current?.addSource(`area-label-${area.name}`, {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {
                                    name: area.name
                                },
                                geometry: areaHull.geometry
                            }
                        });

                        mapInstanceRef.current?.addLayer({
                            id: `area-label-${area.name}`,
                            type: 'symbol',
                            source: `area-label-${area.name}`,
                            layout: {
                                'text-field': ['get', 'name'],
                                'text-size': 14,
                                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                                'text-anchor': 'center',
                                'text-allow-overlap': false,
                                'text-ignore-placement': false
                            },
                            paint: {
                                'text-color': '#000000',
                                'text-halo-color': '#ffffff',
                                'text-halo-width': 3
                            },
                            maxzoom: 12,
                        });
                    }

                    mapInstanceRef.current?.addLayer({
                    id: `area-topos${area.name}`,
                    type: 'circle',
                    source: `area-collection${area.name}`,
                    paint: {
                        'circle-radius': 8,
                        'circle-color': area.color,
                        'circle-opacity': 0.6,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                    },
                    minzoom: 12,
                });

                // Add labels for topos
                mapInstanceRef.current?.addLayer({
                    id: `area-topo-labels${area.name}`,
                    type: 'symbol',
                    source: `area-collection${area.name}`,
                    layout: {
                        'text-field': ['get', 'name'],
                        'text-size': 11,
                        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                        'text-anchor': 'top',
                        'text-offset': [0, 1.2],
                        'text-allow-overlap': false,
                    },
                    paint: {
                        'text-color': '#000000',
                        'text-halo-color': '#ffffff',
                        'text-halo-width': 1.5
                    },
                    minzoom: 12,
                });

                mapInstanceRef.current?.on('click', `area-polygon${area.name}`, (e) => {
                    // Close any existing popup
                    if (currentPopupRef.current) {
                        currentPopupRef.current.remove();
                    }

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
                                <div style="font-family: sans-serif;">
                                    <p style="margin-bottom: 8px;"><strong>${area.name}</strong></p>
                                    <p style="margin-bottom: 8px; color: #666;">${description} • ${area.route_count} Routes</p>
                                    <button id="navigate-button" style="width: 100%; margin-top: 8px; background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">View Routes</button>
                                </div>
                            `)
                            .setMaxWidth('300px')
                            .setOffset(10)
                            .addTo(mapInstanceRef.current!);

                        currentPopupRef.current = popup;

                        // Add event listener to the button inside the popup
                        popup?.getElement()?.querySelector('#navigate-button')?.addEventListener('click',() => {
                            console.log('Button clicked', climbingAreaName);
                            onAreaChange(climbingAreaName || 'none');
                            onValueChange('routes');
                        });
                    }
                });

                mapInstanceRef.current?.on('click', `area-topos${area.name}`, (e) => {
                    // Close any existing popup
                    if (currentPopupRef.current) {
                        currentPopupRef.current.remove();
                    }

                    const geometry = e.features?.[0].geometry;
                    let coordinates: [number, number] | undefined;
                    if (geometry?.type === 'Point') {
                        coordinates = geometry.coordinates as [number, number];
                    }
                    const description = e.features?.[0].properties?.name;
                    const climbingAreaName = area.name;

                    // Find the topo point to get the crag information
                    const topoPoint = topoPoints.find(tp => 
                        tp.description === description && 
                        tp.climbing_area_name === climbingAreaName &&
                        coordinates && 
                        Math.abs(Number(tp.longitude) - coordinates[0]) < 0.0001 &&
                        Math.abs(Number(tp.latitude) - coordinates[1]) < 0.0001
                    );

                    if (coordinates) {
                        const lat = coordinates[1].toFixed(6);
                        const lon = coordinates[0].toFixed(6);
                        const cragName = topoPoint?.climbing_sector || 'Unknown';

                        const popup = new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <div style="font-family: sans-serif;">
                                    <p style="margin-bottom: 8px;"><strong>Topo: ${description}</strong></p>
                                    <p style="margin-bottom: 4px; color: #666; font-size: 13px;">Area: ${climbingAreaName}</p>
                                    <p style="margin-bottom: 8px; color: #666; font-size: 13px;">Crag: ${cragName}</p>
                                    <p style="margin-bottom: 8px; color: #888; font-size: 12px;">Lat: ${lat}, Lon: ${lon}</p>
                                    <button id="navigate-to-area-button" style="width: 100%; margin-top: 4px; background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">View Area Routes</button>
                                    <button id="navigate-to-crag-button" style="width: 100%; margin-top: 4px; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">View Crag Routes</button>
                                </div>
                            `)
                            .setMaxWidth('300px')
                            .setOffset(10)
                            .addTo(mapInstanceRef.current!);

                        currentPopupRef.current = popup;

                        // Add event listener to the area button
                        popup?.getElement()?.querySelector('#navigate-to-area-button')?.addEventListener('click',() => {
                            console.log('Navigate to area clicked', climbingAreaName);
                            onAreaChange(climbingAreaName || 'none');
                            onValueChange('routes');
                        });

                        // Add event listener to the crag button
                        popup?.getElement()?.querySelector('#navigate-to-crag-button')?.addEventListener('click',() => {
                            console.log('Navigate to crag clicked', climbingAreaName, cragName);
                            onAreaChange(climbingAreaName || 'none');
                            if (onCragChange) {
                                // Pass both area name and crag name to ensure area is set
                                onCragChange(cragName, climbingAreaName);
                            }
                            onValueChange('routes');
                        });
                    }
                });
                });

                // Add click handler on map to close popup when clicking on empty space
                // This is registered once, outside the areas loop
                mapInstanceRef.current.on('click', (e) => {
                    // Check if the click was on any feature layer
                    const features = mapInstanceRef.current?.queryRenderedFeatures(e.point);
                    const isFeatureClick = features?.some(f => 
                        (f.source && typeof f.source === 'string' && 
                         (f.source.startsWith('area-polygon') || f.source.startsWith('area-collection')))
                    );
                    
                    // If clicking on empty space (no feature), close the popup
                    if (!isFeatureClick && currentPopupRef.current) {
                        currentPopupRef.current.remove();
                        currentPopupRef.current = null;
                    }
                });

    
                

                

                



            });
            
        }

        

        return () => {
            currentPopupRef.current?.remove();
            mapInstanceRef.current?.remove();
        };
    }, []);

    // Effect to handle highlighting a specific topo
    useEffect(() => {
        if (!highlightedTopoId || !mapInstanceRef.current) return;
        
        console.log('Highlighting topo:', highlightedTopoId);
        
        const map = mapInstanceRef.current;
        
        // Wait for map to be fully loaded
        const addHighlight = () => {
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
            if (map.getLayer('highlighted-topo')) {
                map.removeLayer('highlighted-topo');
            }
            if (map.getSource('highlighted-topo')) {
                map.removeSource('highlighted-topo');
            }

            // Add source for highlighted topo
            map.addSource('highlighted-topo', {
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
            map.addLayer({
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
            map.flyTo({
                center: [lng, lat],
                zoom: 14,
                essential: true
            });

            // Close any existing popup before showing the highlighted topo popup
            if (currentPopupRef.current) {
                currentPopupRef.current.remove();
            }

            // Show popup on the highlighted point
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setLngLat([lng, lat])
                .setHTML(`<strong>${highlightedTopo.description}</strong><br>${highlightedTopo.climbing_area_name}`)
                .addTo(map);

            currentPopupRef.current = popup;
        };

        // Check if map style is loaded, if not wait for it
        if (map.isStyleLoaded()) {
            addHighlight();
        } else {
            map.once('styledata', addHighlight);
        }

    }, [highlightedTopoId, topoPoints]);

    

    return(
        <>
            <div ref={mapContainerRef} className="fixed inset-0 h-[80dvh] bg-gray-400"></div>
        </>
    );
}