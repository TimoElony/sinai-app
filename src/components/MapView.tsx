import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { toast } from 'sonner'

import 'mapbox-gl/dist/mapbox-gl.css';
import { ClimbingArea, TopoPoints, CragStats, ClimbingRoute } from '@/src/types/types';
import * as turf from '@turf/turf';

export default function MapView ({ topoPoints, onValueChange, onAreaChange, onCragChange, areas, highlightedTopoId, selectedArea, sessionToken }: { topoPoints: TopoPoints[]; onValueChange: (value: string) => void; onAreaChange: (selectedValue: string) => void; onCragChange?: (selectedValue: string, areaName?: string) => void; areas: ClimbingArea[]; highlightedTopoId?: string; selectedArea?: string; sessionToken?: string }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
    const [cragStats, setCragStats] = useState<Record<string, Record<string, CragStats>>>({});
    const [editingTopoId, setEditingTopoId] = useState<string | undefined>(undefined);
    const [newTopoLocation, setNewTopoLocation] = useState<{lng: number; lat: number} | undefined>(undefined);
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
        console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is not set. Map functionality will be disabled.');
    }

    // Fetch crag statistics
    useEffect(() => {
        const fetchCragStats = async () => {
            try {
                console.log('Fetching crag stats...');
                const response = await fetch('/api/geodata/crag-stats');
                const data = await response.json();
                console.log('Crag stats loaded:', data);
                console.log('Number of areas with stats:', Object.keys(data).length);
                setCragStats(data);
            } catch (error) {
                console.error('Error fetching crag stats:', error);
            }
        };
        fetchCragStats();
    }, []);

    // Generate SVG bar chart as data URI
    const generateBarChart = (stats: CragStats) => {
        const barWidth = 26;  // Increased from 22 (20% bigger)
        const barSpacing = 5;  // Increased from 4
        const chartHeight = 72; // Increased from 60 (20% bigger)
        const labelHeight = 36; // Increased from 30 (20% bigger)
        const totalHeight = chartHeight + labelHeight;
        const maxCount = Math.max(stats.easy, stats.medium, stats.hard, 1);
        
        const easyHeight = (stats.easy / maxCount) * chartHeight;
        const mediumHeight = (stats.medium / maxCount) * chartHeight;
        const hardHeight = (stats.hard / maxCount) * chartHeight;
        
        const totalWidth = barWidth * 3 + barSpacing * 2;
        
        const svg = `
            <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
                <!-- Bars -->
                <rect x="0" y="${chartHeight - easyHeight}" width="${barWidth}" height="${easyHeight}" fill="#22c55e" stroke="#fff" stroke-width="2"/>
                <rect x="${barWidth + barSpacing}" y="${chartHeight - mediumHeight}" width="${barWidth}" height="${mediumHeight}" fill="#eab308" stroke="#fff" stroke-width="2"/>
                <rect x="${(barWidth + barSpacing) * 2}" y="${chartHeight - hardHeight}" width="${barWidth}" height="${hardHeight}" fill="#ef4444" stroke="#fff" stroke-width="2"/>
                
                <!-- Count labels on bars with white stroke -->
                <text x="${barWidth / 2}" y="${chartHeight - easyHeight / 2 + 5}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#000" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">${stats.easy}</text>
                <text x="${barWidth + barSpacing + barWidth / 2}" y="${chartHeight - mediumHeight / 2 + 5}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#000" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">${stats.medium}</text>
                <text x="${(barWidth + barSpacing) * 2 + barWidth / 2}" y="${chartHeight - hardHeight / 2 + 5}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#000" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">${stats.hard}</text>
                
                <!-- Grade labels with white stroke -->
                <text x="${barWidth / 2}" y="${chartHeight + 22}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#000" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">≤5c+</text>
                <text x="${barWidth + barSpacing + barWidth / 2}" y="${chartHeight + 22}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#000" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">6a-6c+</text>
                <text x="${(barWidth + barSpacing) * 2 + barWidth / 2}" y="${chartHeight + 22}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#000" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">≥7a</text>
            </svg>
        `;
        
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };

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

        // Add geolocation control to show user's current location
        if (mapInstanceRef.current) {
            const geolocate = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
                fitBoundsOptions: { maxZoom: 14 },
            });
            mapInstanceRef.current.addControl(geolocate, 'bottom-right');
        }

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

                    // Group topos by crag
                    const cragGroups = new Map<string, TopoPoints[]>();
                    areaPoints.forEach(point => {
                        const cragName = (point.climbing_sector || 'Unknown Crag').trim();
                        if (!cragGroups.has(cragName)) {
                            cragGroups.set(cragName, []);
                        }
                        cragGroups.get(cragName)!.push(point);
                    });

                    // Create convex hulls and labels for each crag
                    Array.from(cragGroups.entries()).forEach(([cragName, cragTopos], idx) => {
                        const cragCollection = turf.featureCollection(cragTopos.map((point)=>
                            turf.point([Number(point.longitude), Number(point.latitude)], { name: point.description })
                        ));
                        
                        if (cragCollection.features.length < 3) {
                            const x = cragCollection.features[0]?.geometry.coordinates[0];
                            const y = cragCollection.features[0]?.geometry.coordinates[1];
                            cragCollection.features.push(turf.point([x + 0.00005, y]));
                            cragCollection.features.push(turf.point([x + 0.00005, y + 0.00005]));
                            cragCollection.features.push(turf.point([x, y + 0.00005]));
                        }

                        const cragConvexHull = turf.convex(cragCollection);
                        const cragHull = cragConvexHull 
                            ? turf.buffer(cragConvexHull, 0.5, { units: 'kilometers' }) 
                            : null;

                        if (cragHull) {
                            const cragSourceId = `crag-polygon-${area.name}-${cragName}`;
                            const cragLayerId = `crag-layer-${area.name}-${cragName}`;
                            const cragLabelId = `crag-label-${area.name}-${cragName}`;

                            // Add source for crag boundary
                            mapInstanceRef.current?.addSource(cragSourceId, {
                                type: 'geojson',
                                data: cragHull
                            });

                            // Add line layer for crag boundary
                            mapInstanceRef.current?.addLayer({
                                id: cragLayerId,
                                type: 'line',
                                source: cragSourceId,
                                layout: {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                paint: {
                                    'line-color': '#ffffff',
                                    'line-width': 2,
                                    'line-dasharray': [4, 4],
                                },
                                minzoom: 11,
                            });

                            // Add label source for crag name - position on boundary
                            // Get the northernmost point on the boundary for label placement
                            const coords = (cragHull.geometry as any).coordinates[0];
                            const northmostPoint = coords.reduce((max: any, point: any) => 
                                point[1] > max[1] ? point : max
                            );
                            const labelPoint = turf.point(northmostPoint);
                            
                            mapInstanceRef.current?.addSource(`${cragLabelId}-source`, {
                                type: 'geojson',
                                data: labelPoint
                            });

                            // Find the northeasternmost topo for chart placement
                            const northeastPoint = cragTopos.reduce((max, point) => {
                                const maxScore = Number(max.longitude) + Number(max.latitude);
                                const currentScore = Number(point.longitude) + Number(point.latitude);
                                return currentScore > maxScore ? point : max;
                            });

                            // Alternate placement to reduce overlap: even -> NE, odd -> NW
                            const lngOffset = idx % 2 === 0 ? 0.002 : -0.002;
                            const chartLng = Number(northeastPoint.longitude) + lngOffset; // east or west ~200m
                            const chartLat = Number(northeastPoint.latitude) + 0.002; // north ~200m
                            const chartPoint = turf.point([chartLng, chartLat], {
                                cragName: cragName,
                                areaName: area.name,
                                climbing_area_name: area.name,
                                climbing_sector: cragName
                            });
                            
                            mapInstanceRef.current?.addSource(`${cragLabelId}-chart-source`, {
                                type: 'geojson',
                                data: chartPoint
                            });

                            // Add label layer for crag name
                            mapInstanceRef.current?.addLayer({
                                id: cragLabelId,
                                type: 'symbol',
                                source: `${cragLabelId}-source`,
                                layout: {
                                    'text-field': cragName,
                                    'text-size': 12,
                                    'text-font': ['Open Sans SemiBold', 'Arial Unicode MS Bold'],
                                    'text-anchor': 'bottom',
                                    'text-offset': [0, -1],
                                    'text-allow-overlap': false,
                                },
                                paint: {
                                    'text-color': '#ffffff',
                                    'text-halo-color': '#333333',
                                    'text-halo-width': 2
                                },
                                minzoom: 11,
                            });
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
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                    },
                    minzoom: 11,
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
                    minzoom: 11,
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

                        const editButton = sessionToken ? `<button id="edit-location-button" style="width: 100%; margin-top: 4px; background-color: #f59e0b; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">Edit Location</button>` : '';

                        const popup = new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <div style="font-family: sans-serif;">
                                    <p style="margin-bottom: 8px;"><strong>Topo: ${description}</strong></p>
                                    <p style="margin-bottom: 4px; color: #666; font-size: 13px;">Area: ${climbingAreaName}</p>
                                    <p style="margin-bottom: 8px; color: #666; font-size: 13px;">Crag: ${cragName}</p>
                                    <p style="margin-bottom: 8px; color: #888; font-size: 12px;">Lat: ${lat}, Lon: ${lon}</p>
                                    <button id="navigate-to-crag-button" style="width: 100%; margin-top: 4px; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">View Crag Routes</button>
                                    ${editButton}
                                </div>
                            `)
                            .setMaxWidth('300px')
                            .setOffset(10)
                            .addTo(mapInstanceRef.current!);

                        currentPopupRef.current = popup;

                        // Add event listener to the crag button
                        Promise.resolve().then(() => {
                            const navBtn = popup?.getElement()?.querySelector('#navigate-to-crag-button');
                            if (navBtn) {
                                navBtn.addEventListener('click', () => {
                                    console.log('Navigate to crag clicked', climbingAreaName, cragName);
                                    onAreaChange(climbingAreaName || 'none');
                                    if (onCragChange) {
                                        onCragChange(cragName, climbingAreaName);
                                    }
                                    onValueChange('routes');
                                });
                            }
                        });

                        // Add event listener to edit location button
                        if (topoPoint) {
                            Promise.resolve().then(() => {
                                const editBtn = popup?.getElement()?.querySelector('#edit-location-button');
                                if (editBtn) {
                                    editBtn.addEventListener('click', () => {
                                        console.log('Edit location clicked for topo:', topoPoint.id);
                                        setEditingTopoId(topoPoint.id);
                                        if (currentPopupRef.current) {
                                            currentPopupRef.current.remove();
                                            currentPopupRef.current = null;
                                        }
                                        // Change cursor to indicate click mode
                                        if (mapInstanceRef.current) {
                                            mapInstanceRef.current.getCanvas().style.cursor = 'crosshair';
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
                });

    
                

                

                



            });
            
        }

        

        return () => {
            currentPopupRef.current?.remove();
            mapInstanceRef.current?.remove();
        };
    }, []);

    // Effect to add bar charts when cragStats are loaded
    useEffect(() => {
        console.log('Bar chart effect triggered. Stats loaded:', Object.keys(cragStats).length > 0);
        console.log('Map exists:', !!mapInstanceRef.current);
        console.log('Areas count:', areas.length);
        
        if (!mapInstanceRef.current || Object.keys(cragStats).length === 0) {
            console.log('Exiting early - no map or no stats');
            return;
        }
        
        const map = mapInstanceRef.current;
        
        const addCharts = () => {
            if (!map.isStyleLoaded()) {
                console.log('Map style not loaded yet, waiting...');
                setTimeout(addCharts, 100);
                return;
            }

            console.log('Adding bar charts to map...');
            let chartsAdded = 0;

            // Add charts for all crags that have stats AND have label sources (meaning they have topos)
            areas.forEach(area => {
                const areaStats = cragStats[area.name];
                if (!areaStats) {
                    console.log(`No stats for area: ${area.name}`);
                    return;
                }

                Object.keys(areaStats).forEach(cragNameRaw => {
                    const cragName = cragNameRaw.trim();
                    const stats = areaStats[cragNameRaw] || areaStats[cragName];
                    if (!stats || (stats.easy === 0 && stats.medium === 0 && stats.hard === 0)) {
                        return;
                    }

                    const chartImageId = `chart-${area.name}-${cragName}`;
                    const cragLabelId = `crag-label-${area.name}-${cragName}`;
                    const chartLayerId = `${cragLabelId}-chart`;
                    const sourceId = `${cragLabelId}-chart-source`;

                    // Skip if already added
                    if (map.hasImage(chartImageId) || map.getLayer(chartLayerId)) {
                        return;
                    }

                    // Require matching chart source; skip if missing to avoid misplacement
                    const source = map.getSource(sourceId);
                    if (!source) {
                        console.warn(`No chart source for ${cragName} in ${area.name}, skipping chart`);
                        return;
                    }

                    const chartDataUri = generateBarChart(stats);
                    const img = new Image();
                    img.onload = () => {
                        if (!map.hasImage(chartImageId)) {
                            map.addImage(chartImageId, img);
                            
                            // Add layer
                            if (!map.getLayer(chartLayerId)) {
                                map.addLayer({
                                    id: chartLayerId,
                                    type: 'symbol',
                                    source: sourceId,
                                    layout: {
                                        'icon-image': chartImageId,
                                        'icon-size': 1,
                                        'icon-anchor': 'center',
                                        'icon-offset': [0, 0],
                                        'icon-allow-overlap': true,
                                    },
                                    minzoom: 13,
                                });
                                chartsAdded++;
                                console.log(`✓ Chart added for ${cragName}`);
                                
                                // Add click handler for popup
                                map.on('click', chartLayerId, async (e) => {
                                    if (currentPopupRef.current) {
                                        currentPopupRef.current.remove();
                                    }
                                    
                                    const coordinates = e.lngLat;
                                    const properties = e.features?.[0]?.properties;
                                    const cragName = properties?.cragName || properties?.climbing_sector || 'Unknown crag';
                                    const areaName = properties?.areaName || properties?.climbing_area_name || 'Unknown area';
                                    
                                    const popup = new mapboxgl.Popup()
                                        .setLngLat(coordinates)
                                        .setHTML(`
                                            <div style="font-family: sans-serif;">
                                                <p style="margin-bottom: 8px;"><strong>${cragName}</strong></p>
                                                <p style="margin-bottom: 6px; color: #666;">${areaName}</p>
                                                <p id="grades-line" style="margin-bottom: 8px; color: #666; font-size: 13px;">Loading grades...</p>
                                                <button id="navigate-button-crag" style="width: 100%; margin-top: 8px; background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">View Routes</button>
                                            </div>
                                        `)
                                        .setMaxWidth('320px')
                                        .setOffset(10)
                                        .addTo(map);
                                    
                                    currentPopupRef.current = popup;
                                    
                                    // Fetch grades and update popup
                                    const loadGrades = async () => {
                                        try {
                                            const res = await fetch(`/api/climbingroutes/${encodeURIComponent(areaName)}/${encodeURIComponent(cragName)}`);
                                            const data: ClimbingRoute[] = await res.json();
                                            const grades = Array.isArray(data)
                                                ? data.map(r => r.grade_best_guess || '—').filter(Boolean).sort()
                                                : [];
                                            const gradeLine = grades.length > 0 ? grades.join(', ') : 'No grades available';
                                            popup.setHTML(`
                                                <div style="font-family: sans-serif;">
                                                    <p style="margin-bottom: 8px;"><strong>${cragName}</strong></p>
                                                    <p style="margin-bottom: 6px; color: #666;">${areaName}</p>
                                                    <p style="margin-bottom: 8px; color: #666; font-size: 13px;">Grades: ${gradeLine}</p>
                                                    <button id="navigate-button-crag" style="width: 100%; margin-top: 8px; background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">View Routes</button>
                                                </div>
                                            `);
                                            const button = document.getElementById('navigate-button-crag');
                                            if (button && onCragChange) {
                                                button.addEventListener('click', () => {
                                                    onValueChange('routes');
                                                    onCragChange(cragName, areaName);
                                                    popup.remove();
                                                });
                                            }
                                        } catch (err) {
                                            popup.setHTML(`
                                                <div style="font-family: sans-serif;">
                                                    <p style="margin-bottom: 8px;"><strong>${cragName}</strong></p>
                                                    <p style="margin-bottom: 6px; color: #666;">${areaName}</p>
                                                    <p style="margin-bottom: 8px; color: #c00; font-size: 13px;">Failed to load grades.</p>
                                                    <button id="navigate-button-crag" style="width: 100%; margin-top: 8px; background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">View Routes</button>
                                                </div>
                                            `);
                                            const button = document.getElementById('navigate-button-crag');
                                            if (button && onCragChange) {
                                                button.addEventListener('click', () => {
                                                    onValueChange('routes');
                                                    onCragChange(cragName, areaName);
                                                    popup.remove();
                                                });
                                            }
                                        }
                                    };

                                    loadGrades();
                                });
                                
                                // Change cursor on hover
                                map.on('mouseenter', chartLayerId, () => {
                                    map.getCanvas().style.cursor = 'pointer';
                                });
                                map.on('mouseleave', chartLayerId, () => {
                                    map.getCanvas().style.cursor = '';
                                });
                            }
                        }
                    };
                    img.onerror = (e) => {
                        console.error(`Failed to load chart image for ${cragName}:`, e);
                    };
                    img.src = chartDataUri;
                });
            });
            
            console.log(`Finished processing. Total charts added: ${chartsAdded}`);
        };
        
        addCharts();
    }, [cragStats, areas]);

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

    // Effect to update map click handler when editingTopoId changes
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;

        const handleMapClick = (e: mapboxgl.MapMouseEvent & { lngLat: mapboxgl.LngLat; }) => {
            // Check if in edit mode
            if (editingTopoId) {
                console.log('In edit mode, clicked at:', e.lngLat);
                const clickedCoordinates = e.lngLat;
                const locationData = { lng: clickedCoordinates.lng, lat: clickedCoordinates.lat };
                
                // Show confirmation popup
                const confirmPopup = new mapboxgl.Popup()
                    .setLngLat(clickedCoordinates)
                    .setHTML(`
                        <div style="font-family: sans-serif;">
                            <p style="margin-bottom: 8px;">New location selected</p>
                            <p style="margin-bottom: 8px; color: #666; font-size: 13px;">Lat: ${clickedCoordinates.lat.toFixed(6)}, Lon: ${clickedCoordinates.lng.toFixed(6)}</p>
                            <button id="confirm-location-button" style="width: 100%; margin-top: 4px; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">Confirm & Update</button>
                            <button id="cancel-location-button" style="width: 100%; margin-top: 4px; background-color: #6b7280; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">Cancel</button>
                        </div>
                    `)
                    .setMaxWidth('300px')
                    .setOffset(10)
                    .addTo(map);

                // Use Promise.resolve to ensure DOM is ready before attaching listeners
                Promise.resolve().then(() => {
                    const confirmBtn = confirmPopup.getElement()?.querySelector('#confirm-location-button');
                    if (confirmBtn) {
                        const clickHandler = async () => {
                            if (locationData && sessionToken) {
                                try {
                                    const url = `/api/walltopos/location/${editingTopoId}`;
                                    const response = await fetch(url, {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${sessionToken}`,
                                        },
                                        body: JSON.stringify({
                                            longitude: locationData.lng,
                                            latitude: locationData.lat,
                                        }),
                                    });

                                    if (response.ok) {
                                        console.log('Topo location updated successfully');
                                        confirmPopup.remove();
                                        setEditingTopoId(undefined);
                                        setNewTopoLocation(undefined);
                                        if (mapInstanceRef.current) {
                                            mapInstanceRef.current.getCanvas().style.cursor = '';
                                        }
                                        toast.success('Location updated successfully! Refresh the page to see the updated topo position.');
                                    } else {
                                        const errorText = await response.text();
                                        console.error('Failed to update topo location:', response.status, errorText);
                                        alert('Failed to update location: ' + errorText);
                                    }
                                } catch (error) {
                                    console.error('Error updating topo location:', error);
                                    alert('Error updating location: ' + String(error));
                                }
                            } else {
                                console.log('Missing data for update:', { locationData, sessionToken });
                            }
                        };
                        confirmBtn.addEventListener('click', clickHandler);
                    }
                });

                Promise.resolve().then(() => {
                    const cancelBtn = confirmPopup.getElement()?.querySelector('#cancel-location-button');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', () => {
                            console.log('Cancel clicked');
                            confirmPopup.remove();
                            setEditingTopoId(undefined);
                            setNewTopoLocation(undefined);
                            if (mapInstanceRef.current) {
                                mapInstanceRef.current.getCanvas().style.cursor = '';
                            }
                        });
                    }
                });

                return;
            }

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
        };

        // Remove old handler and add new one
        map.off('click', handleMapClick);
        map.on('click', handleMapClick);

        return () => {
            map.off('click', handleMapClick);
        };
    }, [editingTopoId, newTopoLocation, sessionToken]);

    return(
        <>
            <div ref={mapContainerRef} className="fixed inset-0 h-[80dvh] bg-gray-400"></div>
        </>
    );
}