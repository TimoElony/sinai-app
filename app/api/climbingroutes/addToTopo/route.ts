import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySupabaseToken, unauthorizedResponse } from '@/lib/auth';

// Add route to topo
export async function POST(request: NextRequest) {
    const authResult = await verifySupabaseToken(request);
    
    if (!authResult.authorized || !authResult.user) {
        return unauthorizedResponse(authResult.error);
    }

    try {
        const { id, wall_topo_ids, wall_topo_numbers } = await request.json();
        
        if (wall_topo_ids.length !== wall_topo_numbers.length) {
            return NextResponse.json(
                { error: "Array length mismatch" },
                { status: 400 }
            );
        }
        
        const updatedRoute = await pool.query(
            "UPDATE climbing_routes SET wall_topo_ids = $1, wall_topo_numbers = $2 WHERE id = $3;",
            [wall_topo_ids, wall_topo_numbers, id]
        );
        
        await pool.query(
            "INSERT INTO change_logs (user_id, action, route_id) VALUES ($1, $2, $3)",
            [authResult.user.email, 'Added route to topo', id]
        );
        
        return NextResponse.json(updatedRoute.rows);
    } catch (error) {
        console.error('error adding route to topo', error);
        return NextResponse.json(
            { error: 'Failed to add route to topo' },
            { status: 500 }
        );
    }
}
