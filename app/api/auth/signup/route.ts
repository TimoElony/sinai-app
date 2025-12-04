import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
    return createClient(
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_ANON_KEY || ''
    );
}

// User signup
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        return NextResponse.json({
            message: 'User created successfully',
            user: data.user,
            session: data.session
        }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Signup failed' },
            { status: 400 }
        );
    }
}
