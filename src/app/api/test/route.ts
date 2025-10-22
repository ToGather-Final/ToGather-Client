export async function GET() {
    return new Response(JSON.stringify({ 
        message: "App Router API is working!",
        timestamp: new Date().toISOString()
    }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}
