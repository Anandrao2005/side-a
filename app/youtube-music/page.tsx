'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Music2, Plus, Trash2 } from 'lucide-react';
type SavedPlaylist = { id: string; name: string; url: string; playlistId: string };
const STORAGE_KEY = 'side-a-youtube-music-playlists-v1';
function parsePlaylist(raw: string): { playlistId: string; url: string } | null {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!['music.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) return null;
    const playlistId = url.searchParams.get('list');
    if (!playlistId || !/^[a-zA-Z0-9_-]{10,}$/.test(playlistId)) return null;
    return { playlistId, url: `https://music.youtube.com/playlist?list=${encodeURIComponent(playlistId)}` };
  } catch { return null; }
}
export default function YouTubeMusicPage() {
  const [items, setItems] = useState<SavedPlaylist[]>([]), [name, setName] = useState(''), [url, setUrl] = useState(''), [error, setError] = useState(''), [active, setActive] = useState<SavedPlaylist | null>(null);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SavedPlaylist[]; setItems(saved); if (saved[0]) setActive(saved[0]); } catch { setItems([]); } }, []);
  function save(next: SavedPlaylist[]) { setItems(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  function add(e: React.FormEvent) {
    e.preventDefault(); const parsed = parsePlaylist(url);
    if (!parsed) { setError('Valid YouTube Music playlist URL paste karo. Playlist public ya unlisted honi chahiye.'); return; }
    if (items.some(item => item.playlistId === parsed.playlistId)) { setError('Ye playlist pehle se add hai.'); return; }
    const item = { id: crypto.randomUUID(), name: name.trim() || `YouTube Music playlist ${items.length + 1}`, ...parsed };
    save([item, ...items]); setActive(item); setName(''); setUrl(''); setError('');
  }
  function remove(item: SavedPlaylist) { const next = items.filter(x => x.id !== item.id); save(next); if (active?.id === item.id) setActive(next[0] || null); }
  return <div className="app-shell" style={{ minHeight: '100vh', display: 'block', padding: 'clamp(20px, 5vw, 64px)' }}><div style={{ maxWidth: 1080, margin: '0 auto' }}>
    <Link href="/" className="text-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}><ArrowLeft size={17}/> Back to Side A</Link>
    <div className="page-intro" style={{ marginBottom: 28 }}><div><p className="eyebrow">YOUR MUSIC, YOUR WAY</p><h1>YouTube Music<span>.</span></h1><p>Add playlist links and play them here using YouTube's official embedded player.</p></div><div className="edition"><Music2 size={30}/><strong>PLAYLISTS</strong></div></div>
    <form onSubmit={add} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, padding: 20, borderRadius: 18, background: '#f4efe6', marginBottom: 28 }}>
      <label style={{ display: 'grid', gap: 8 }}>Playlist name <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My favourites" maxLength={80} style={{ minHeight: 44, padding: '10px 12px', borderRadius: 10, border: '1px solid #d8cdbd', background: '#fff' }}/></label>
      <label style={{ display: 'grid', gap: 8 }}>YouTube Music playlist URL <input required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://music.youtube.com/playlist?list=..." style={{ minHeight: 44, padding: '10px 12px', borderRadius: 10, border: '1px solid #d8cdbd', background: '#fff' }}/></label>
      <button className="primary" type="submit" style={{ alignSelf: 'end', minHeight: 44, justifyContent: 'center' }}><Plus size={17}/> Add playlist</button>
      {error && <p role="alert" style={{ gridColumn: '1 / -1', margin: 0, color: '#9b3d27' }}>{error}</p>}
    </form>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24, alignItems: 'start' }}>
      <section style={{ minWidth: 0 }}><div className="section-heading"><div><h2>Your playlists</h2><p>{items.length} saved in this browser</p></div></div>
        {items.length === 0 ? <div className="empty"><Music2 size={38}/><h3>Paste a playlist link to get started</h3><p>Open YouTube Music, copy your playlist URL and add it above.</p></div> : <div style={{ display: 'grid', gap: 10 }}>{items.map(item => <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 14, borderRadius: 14, border: active?.id === item.id ? '1px solid #b66d4b' : '1px solid #e2d9cb', background: '#fff' }}><button onClick={() => setActive(item)} style={{ flex: 1, textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}><strong>{item.name}</strong><div style={{ color: '#716b62', fontSize: 12, marginTop: 5 }}>YouTube Music playlist</div></button><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.name} on YouTube Music`}><ExternalLink size={17}/></a><button className="icon" onClick={() => remove(item)} aria-label={`Remove ${item.name}`}><Trash2 size={17}/></button></div>)}</div>}
      </section>
      <section style={{ minWidth: 0 }}><div className="section-heading"><div><h2>Now playing</h2><p>{active?.name || 'Select a playlist to start'}</p></div></div>
        {active ? <><div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 16, background: '#161616' }}><iframe key={active.playlistId} title={active.name} src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(active.playlistId)}&playsinline=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}/></div><p style={{ color: '#716b62', fontSize: 13, lineHeight: 1.6 }}>Playback YouTube ke player mein hota hai. Private playlists, disabled embedding, or regional restrictions may stop playback. If that happens, <a href={active.url} target="_blank" rel="noreferrer">YouTube Music mein kholo</a>.</p></> : <div className="empty"><Music2 size={38}/><h3>Choose a playlist</h3><p>Added playlist ko select karo; player yahan load hoga.</p></div>}
      </section>
    </div><p style={{ marginTop: 32, color: '#716b62', fontSize: 12 }}>Saved links are stored in this browser only. This app does not sign into or scrape your YouTube Music account.</p>
  </div></div>;
}
