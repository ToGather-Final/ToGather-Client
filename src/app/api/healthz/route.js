import { NextResponse } from 'next/server';

export async function GET() {
    console.log('Health check requested');

    try {
        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Health check failed:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
