import { NextResponse } from 'next/server';
import pool from '@/lib/db';

type GradeDistribution = {
    grade_best_guess: string;
    route_count: string | number;
};

function bucketGrades(grade_distribution: GradeDistribution[]) {
    // Matches strings to assign them to these buckets
    const buckets = ['3', '4', '5a', '5b', '5c', '6a', '6b', '6c', '7a', '7b', '7c', '8a', '8b', '8c', '9'];

    const output = buckets.map((bucket) => {
        const count = grade_distribution
            .filter(obj => obj.grade_best_guess?.includes(bucket))
            .reduce((sum, current) => sum + Number(current.route_count), 0);
        return { grade_best_guess: bucket, route_count: count };
    });

    return output;
}

// Get details for a specific area
export async function GET(
    request: Request,
    { params }: { params: Promise<{ area: string }> }
) {
    try {
        const { area } = await params;
        
        const routeDistro = await pool.query(
            "SELECT grade_best_guess, COUNT(*) as route_count FROM climbing_routes WHERE climbing_area = $1 GROUP BY grade_best_guess ORDER BY grade_best_guess", 
            [area]
        );
        
        const crags = await pool.query(
            "SELECT name FROM climbing_crags WHERE climbing_area = $1 ORDER BY updated_at ASC", 
            [area]
        );
        
        const output = {
            grade_distribution: bucketGrades(routeDistro.rows),
            crags: crags.rows
        };
        
        return NextResponse.json(output, {
            headers: {
                'Cache-Control': 'public, max-age=600',
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch area details' },
            { status: 500 }
        );
    }
}
