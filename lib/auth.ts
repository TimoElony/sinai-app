import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabaseClient() {
    return createClient(
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_ANON_KEY || ''
    );
}

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email: string;
    };
}

export async function verifySupabaseToken(request: NextRequest): Promise<{ authorized: boolean; user?: { id: string; email: string }; error?: string }> {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        return { authorized: false, error: 'No token provided' };
    }

    try {
        const supabase = getSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        
        if (!user) {
            return { authorized: false, error: 'User not found' };
        }
        
        return { 
            authorized: true, 
            user: { 
                id: user.id, 
                email: user.email || '' 
            } 
        };
    } catch {
        return { authorized: false, error: 'Invalid token' };
    }
}

export function unauthorizedResponse(error: string = 'Unauthorized') {
    return NextResponse.json(
        { error: 'Unauthorized', message: error },
        { status: 401 }
    );
}
