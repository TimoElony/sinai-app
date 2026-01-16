import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySupabaseToken, unauthorizedResponse } from '@/lib/auth';

type LineSegment = {
    type: string;
    properties: {
        line_label: number;
        [key: string]: unknown;
    };
    geometry: {
        type: string;
        coordinates: number[][];
    };
};

// Add or update drawn lines
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ lineLabel: string; asNew: string }> }
) {
    const authResult = await verifySupabaseToken(request);
    
    if (!authResult.authorized || !authResult.user) {
        return unauthorizedResponse(authResult.error);
    }

    try {
        const { asNew } = await params;
        const geoJSONLine = await request.json();
        const { topo_id, line_label, deleting } = geoJSONLine.properties;
        
        if (!topo_id || (!deleting && !geoJSONLine?.geometry?.coordinates)) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get the current line segments and topo description for logging
        const oldData = await pool.query(
            "SELECT line_segments, description FROM wall_topos WHERE id = $1",
            [topo_id]
        );
        
        // Current line segments array (or empty array if null)
        const currentSegments: LineSegment[] = oldData.rows[0]?.line_segments || [];
        
        // Handle deletion
        if (deleting) {
            const updatedSegments = currentSegments.filter(
                (segment: LineSegment) => segment.properties?.line_label !== line_label
            );
            
            await pool.query(
                "UPDATE wall_topos SET line_segments = $1 WHERE id = $2",
                [updatedSegments, topo_id]
            );

            // Log the deletion
            const topoDescription = oldData.rows[0]?.description || topo_id;
            await pool.query(
                "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
                [authResult.user.email, `Deleted line segment #${line_label} from topo: ${topoDescription}`]
            );

            return NextResponse.json({ 
                ok: true,
                message: "Successfully deleted line segment"
            });
        }
        
        if (!asNew || asNew === 'false') {
            // Replace existing segment with same label
            const updatedSegments = currentSegments.map((segment: LineSegment) => 
                segment.properties?.line_label === line_label ? geoJSONLine : segment
            );
            
            // If no matching segment was found, add the new one
            if (!currentSegments.some((segment: LineSegment) => segment.properties?.line_label === line_label)) {
                updatedSegments.push(geoJSONLine);
            }

            await pool.query(
                "UPDATE wall_topos SET line_segments = $1 WHERE id = $2",
                [updatedSegments, topo_id]
            );

            // Log the update
            const topoDescription = oldData.rows[0]?.description || topo_id;
            await pool.query(
                "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
                [authResult.user.email, `Updated line segment #${line_label} on topo: ${topoDescription}`]
            );

            return NextResponse.json({ 
                ok: true,
                message: "Successfully updated line segments"
            });
        } else {
            // Check for conflicting labels
            const hasConflict = currentSegments.some(
                (segment: LineSegment) => segment.properties?.line_label === line_label
            );
            
            if (hasConflict) {
                throw new Error(`Conflicting label: ${line_label}`);
            }
            
            // Add new segment
            await pool.query(
                "UPDATE wall_topos SET line_segments = array_append(COALESCE(line_segments, '{}'::jsonb[]), $1::jsonb) WHERE id = $2",
                [geoJSONLine, topo_id]
            );
            
            // Log the addition
            const topoDescription = oldData.rows[0]?.description || topo_id;
            await pool.query(
                "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
                [authResult.user.email, `Added new line segment #${line_label} to topo: ${topoDescription}`]
            );
            
            return NextResponse.json({ 
                ok: true,
                message: "Successfully added new line segment"
            });
        }
    } catch (error) {
        console.error("Error submitting or editing line segment:", error);
        return NextResponse.json({ 
            error: "Internal server error",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
