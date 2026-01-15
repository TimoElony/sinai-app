import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Categorize grade into difficulty buckets
function categorizeGrade(grade: string): string {
    if (!grade) return 'unknown';
    
    const gradeUpper = grade.toUpperCase().trim();
    
    // Easy: 5c+ and below
    const easyGrades = ['3', '4', '4+', '5A', '5B', '5C', '5C+'];
    if (easyGrades.some(g => gradeUpper.startsWith(g))) {
        return 'easy';
    }
    
    // Medium: 6a to 6c+
    const mediumGrades = ['6A', '6A+', '6B', '6B+', '6C', '6C+'];
    if (mediumGrades.some(g => gradeUpper.startsWith(g))) {
        return 'medium';
    }
    
    // Hard: 7a and above
    if (gradeUpper.match(/^[7-9][A-D]/)) {
        return 'hard';
    }
    
    return 'unknown';
}

// Get grade distribution statistics for all crags
export async function GET() {
    console.log('Crag stats API called');
    try {
        console.log('Querying database for crag stats...');
        const result = await pool.query(
            `SELECT 
                climbing_area, 
                climbing_sector, 
                grade_best_guess,
                COUNT(*) as count
            FROM climbing_routes 
            WHERE climbing_sector IS NOT NULL 
            GROUP BY climbing_area, climbing_sector, grade_best_guess
            ORDER BY climbing_area, climbing_sector`
        );
        
        console.log(`Query returned ${result.rows.length} rows`);
        
        // Process results into crag statistics
        const cragStats: Record<string, Record<string, { easy: number, medium: number, hard: number, total: number }>> = {};
        
        result.rows.forEach((row: { climbing_area: string; climbing_sector: string; grade_best_guess: string; count: string }) => {
            const area = row.climbing_area;
            const crag = row.climbing_sector;
            const category = categorizeGrade(row.grade_best_guess);
            const count = parseInt(row.count);
            
            if (!cragStats[area]) {
                cragStats[area] = {};
            }
            
            if (!cragStats[area][crag]) {
                cragStats[area][crag] = { easy: 0, medium: 0, hard: 0, total: 0 };
            }
            
            if (category === 'easy') {
                cragStats[area][crag].easy += count;
            } else if (category === 'medium') {
                cragStats[area][crag].medium += count;
            } else if (category === 'hard') {
                cragStats[area][crag].hard += count;
            }
            
            cragStats[area][crag].total += count;
        });
        
        console.log('Processed stats for areas:', Object.keys(cragStats));
        console.log('Sample crag stats:', JSON.stringify(cragStats).substring(0, 200));
        
        return NextResponse.json(cragStats, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Error fetching crag statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch crag statistics' },
            { status: 500 }
        );
    }
}
