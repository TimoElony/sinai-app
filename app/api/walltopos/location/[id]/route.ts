import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySupabaseToken, unauthorizedResponse } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify authentication
        const authResult = await verifySupabaseToken(request);
        
        if (!authResult.authorized || !authResult.user) {
            return unauthorizedResponse(authResult.error);
        }

        const { id } = await params;
        const { longitude, latitude } = await request.json();

        if (longitude === undefined || latitude === undefined) {
            return NextResponse.json(
                { error: 'longitude and latitude are required' },
                { status: 400 }
            );
        }

        // Update the topo location
        const result = await pool.query(
            'UPDATE wall_topos SET longitude = $1, latitude = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [longitude, latitude, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Topo not found' },
                { status: 404 }
            );
        }

        // Log the change
        await pool.query(
            "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
            [authResult.user.email, `Updated topo location: ${result.rows[0].description} to Lat: ${latitude}, Lon: ${longitude}`]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating topo location:', error);
        return NextResponse.json(
            { error: 'Failed to update topo location' },
            { status: 500 }
        );
    }
}
