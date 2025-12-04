import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySupabaseToken, unauthorizedResponse } from '@/lib/auth';

// Add one climbing route
export async function POST(request: NextRequest) {
    const authResult = await verifySupabaseToken(request);
    
    if (!authResult.authorized || !authResult.user) {
        return unauthorizedResponse(authResult.error);
    }

    try {
        const { name, grade, bolts, length, info, area, crag, setters } = await request.json();
        
        const newRoute = await pool.query(
            "INSERT INTO climbing_routes (name, fa_grade, bolts, length, plain_description, climbing_area, climbing_sector, setters, grade_best_guess) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING name, id",
            [name, grade, bolts, length, info, area, crag, setters, grade]
        );
        
        await pool.query(
            "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
            [authResult.user.email, 'Created new route' + name]
        );
        
        return NextResponse.json(newRoute.rows);
    } catch (error) {
        console.error('error adding new route', error);
        return NextResponse.json(
            { error: 'Failed to create route' },
            { status: 500 }
        );
    }
}
