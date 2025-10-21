// app/api/healthz/route.ts (App Router)
export async function GET() { return new Response('ok', { status: 200 }); }
