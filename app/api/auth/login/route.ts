import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
    return createClient(
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_ANON_KEY || ''
    );
}

// User login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return NextResponse.json({
            message: 'Login successful',
            token: data.session?.access_token,
            user: data.user
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    }
}
