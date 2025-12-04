import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get all climbing areas
export async function GET() {
    try {
        const currentAreas = await pool.query(
            "SELECT id, name, access, description, access_from_dahab_minutes, route_count, color FROM climbing_areas ORDER BY route_count DESC"
        );
        
        return NextResponse.json(currentAreas.rows, {
            headers: {
                'Cache-Control': 'public, max-age=600',
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch climbing areas' },
            { status: 500 }
        );
    }
}
