import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySupabaseToken, unauthorizedResponse } from '@/lib/auth';

// Get wall topos for an area and crag
export async function GET(
    request: Request,
    { params }: { params: Promise<{ area: string; crag: string }> }
) {
    try {
        const { area, crag } = await params;
        let relevantTopos;
        
        if (area === crag) {
            relevantTopos = await pool.query(
                "SELECT id, name, description, details, extracted_filename, climbing_routes_ids, climbing_area_name, climbing_sector, line_segments FROM wall_topos WHERE climbing_area_name = $1 ORDER BY updated_at DESC", 
                [area]
            );
        } else {
            relevantTopos = await pool.query(
                "SELECT id, name, description, details, extracted_filename, climbing_routes_ids, climbing_area_name, climbing_sector, line_segments FROM wall_topos WHERE climbing_area_name = $1 AND climbing_sector = $2 ORDER BY updated_at DESC",
                [area, crag]
            );
        }
        
        // Check if user is authenticated (has Authorization header)
        const authHeader = request.headers.get('authorization');
        const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');
        
        // Cache only for non-authenticated users
        if (isAuthenticated) {
            return NextResponse.json(relevantTopos.rows);
        }
        
        return NextResponse.json(relevantTopos.rows, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('couldnt query on get walltopos', error);
        return NextResponse.json(
            { error: 'Failed to fetch wall topos' },
            { status: 500 }
        );
    }
}

// Create a new wall topo
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ area: string; crag: string }> }
) {
    const authResult = await verifySupabaseToken(request);
    
    if (!authResult.authorized || !authResult.user) {
        return unauthorizedResponse(authResult.error);
    }

    try {
        const { area, crag } = await params;
        const { title, description, name, longitude, latitude } = await request.json();
        
        const newTopo = await pool.query(
            "INSERT INTO wall_topos (description, details, extracted_filename, climbing_area_name, climbing_sector, longitude, latitude) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [title, description, name, area, crag, longitude, latitude]
        );
        
        await pool.query(
            "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
            [authResult.user.email, 'Created new topo' + title]
        );
        
        return NextResponse.json(newTopo.rows);
    } catch (error) {
        console.error("error while posting new topo", error);
        return NextResponse.json(
            { error: 'Failed to create topo' },
            { status: 500 }
        );
    }
}
