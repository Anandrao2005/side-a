// Vercel deployment: personal library data is stored client-side in browser localStorage.
// This compatibility route intentionally does not claim to persist server-side data.
export function GET() {
  return Response.json({ user: null, playlists: [], likes: [], history: [] }, { headers: { 'Cache-Control': 'no-store' } });
}
export function POST() {
  return Response.json({ error: 'Library writes are handled by the browser in this deployment.' }, { status: 410 });
}
