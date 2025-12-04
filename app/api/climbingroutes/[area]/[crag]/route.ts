import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get all routes for an area and crag
export async function GET(
    request: Request,
    { params }: { params: Promise<{ area: string; crag: string }> }
) {
    try {
        const { area, crag } = await params;
        let allRoutes;
        
        if (crag === area) {
            allRoutes = await pool.query(
                "SELECT id, name, grade_best_guess, fa_grade, length, bolts, pitches, approach, plain_description, descent, setters, fa_day, fa_month, fa_year, climbing_area, climbing_sector, wall_topo_ids, detail_topo_ids, wall_topo_numbers FROM climbing_routes WHERE climbing_area = $1 ORDER BY updated_at DESC", 
                [area]
            );
        } else {
            allRoutes = await pool.query(
                "SELECT id, name, grade_best_guess, fa_grade, length, bolts, pitches, approach, plain_description, descent, setters, fa_day, fa_month, fa_year, climbing_area, climbing_sector, wall_topo_ids, detail_topo_ids, wall_topo_numbers FROM climbing_routes WHERE climbing_area = $1 AND climbing_sector = $2 ORDER BY updated_at DESC", 
                [area, crag]
            );
        }
        
        return NextResponse.json(allRoutes.rows, {
            headers: {
                'Cache-Control': 'public, max-age=300',
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
