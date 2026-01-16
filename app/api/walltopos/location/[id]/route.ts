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
        const { longitude, latitude, exposition, width } = await request.json();

        if (longitude === undefined || latitude === undefined) {
            return NextResponse.json(
                { error: 'longitude and latitude are required' },
                { status: 400 }
            );
        }

        // Update the topo location, exposition, and width
        const result = await pool.query(
            'UPDATE wall_topos SET longitude = $1, latitude = $2, exposition = $3, width = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [longitude, latitude, exposition ?? null, width ?? null, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Topo not found' },
                { status: 404 }
            );
        }

        // Log the change
        const logExposition = exposition ? `, Exposition: ${exposition}` : '';
        const logWidth = width !== undefined ? `, Width: ${width}` : '';
        await pool.query(
            "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
            [authResult.user.email, `Updated topo location: ${result.rows[0].description} to Lat: ${latitude}, Lon: ${longitude}${logExposition}${logWidth}`]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error updating topo location:', error);

        // Gracefully handle connection errors so the client can retry
        if (error?.message?.includes('Connection terminated')) {
            return NextResponse.json(
                { error: 'Database connection was interrupted. Please retry.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update topo location' },
            { status: 500 }
        );
    }
}
