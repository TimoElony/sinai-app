import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseToken, unauthorizedResponse } from '@/lib/auth';

// Verify authentication
export async function POST(request: NextRequest) {
    const authResult = await verifySupabaseToken(request);
    
    if (!authResult.authorized || !authResult.user) {
        return unauthorizedResponse(authResult.error);
    }

    try {
        return NextResponse.json({ 
            ok: true,
            userId: authResult.user.id
        });
    } catch (error) {
        console.error("validation endpoint error", error);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
