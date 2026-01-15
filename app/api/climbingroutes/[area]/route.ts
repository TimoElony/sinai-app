import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get all routes for an area (across all crags)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ area: string }> }
) {
    try {
        const { area } = await params;
        
        const allRoutes = await pool.query(
            "SELECT id, name, grade_best_guess, fa_grade, length, bolts, pitches, approach, plain_description, descent, setters, fa_day, fa_month, fa_year, climbing_area, climbing_sector, wall_topo_ids, detail_topo_ids, wall_topo_numbers FROM climbing_routes WHERE climbing_area = $1 ORDER BY updated_at DESC", 
            [area]
        );
        
        // Check if user is authenticated (has Authorization header)
        const authHeader = request.headers.get('authorization');
        const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');
        
        // Cache only for non-authenticated users
        if (isAuthenticated) {
            return NextResponse.json(allRoutes.rows);
        }
        
        return NextResponse.json(allRoutes.rows, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch climbing routes' },
            { status: 500 }
        );
    }
}
