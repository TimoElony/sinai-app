import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySupabaseToken, unauthorizedResponse } from '@/lib/auth';

// Update topo number for a route
export async function PUT(request: NextRequest) {
    const authResult = await verifySupabaseToken(request);
    
    if (!authResult.authorized || !authResult.user) {
        return unauthorizedResponse(authResult.error);
    }

    try {
        const { id, wall_topo_ids, wall_topo_numbers } = await request.json();
        
        const updatedRoute = await pool.query(
            "UPDATE climbing_routes SET wall_topo_ids = $1, wall_topo_numbers = $2 WHERE id = $3;",
            [wall_topo_ids, wall_topo_numbers, id]
        );
        
        await pool.query(
            "INSERT INTO change_logs (user_id, action, route_id) VALUES ($1, $2, $3)",
            [authResult.user.email, 'Updated topo number for one of the topos', id]
        );
        
        return NextResponse.json(updatedRoute.rows);
    } catch (error) {
        console.error('error changing topo numbers', error);
        return NextResponse.json(
            { error: 'Failed to update topo number' },
            { status: 500 }
        );
    }
}
