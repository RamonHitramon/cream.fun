export const runtime = 'nodejs'; // на Vercel нужен node runtime для fetch/логов

export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
