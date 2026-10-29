import { tracks, mixes } from '../../catalog';
export function GET(request: Request) { const q = new URL(request.url).searchParams.get('q')?.toLowerCase().slice(0, 100) || ''; return Response.json({ tracks: tracks.filter(t => `${t.title} ${t.artist} ${t.album} ${t.genre}`.toLowerCase().includes(q)), mixes }, { headers: { 'Cache-Control': 'public, max-age=300' } }); }
