import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get geographic locations of topos
export async function GET() {
    try {
        const response = await pool.query(`
            SELECT id, description, longitude, latitude, climbing_area_name, climbing_sector 
            FROM wall_topos 
            WHERE longitude IS NOT NULL AND latitude IS NOT NULL
            ORDER BY updated_at DESC
            LIMIT 150
        `);
        
        return NextResponse.json(response.rows);
    } catch (error) {
        console.error('couldnt query locations of walltopos', error);
        return NextResponse.json(
            { error: 'Failed to fetch topos' },
            { status: 500 }
        );
    }
}
