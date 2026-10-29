'use client';
import { useState, useEffect, useRef } from 'react';
import { Home, Search, Library, Heart, Clock, Plus, ArrowUpRight, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, ListMusic, Disc3, ChevronRight, X, Check, MoreHorizontal, Trash2, Pencil, Music2, LogOut, Headphones, Menu } from 'lucide-react';
import { tracks, mixes, Track } from './catalog';
type Playlist = {
    id: string;
    name: string;
    description: string;
    tracks: string[];
};
type LibraryData = {
    user: {
        name: string;
        email: string;
    } | null;
    playlists: Playlist[];
    likes: string[];
    history: string[];
};
const blank: LibraryData = { user: null, playlists: [], likes: [], history: [] };
const format = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function Artwork({ track, large = false }: {
    track: Track;
    large?: boolean;
}) { return <div className={`artwork art-${track.art} ${large ? 'large' : ''}`} style={{ backgroundColor: track.color }}><div className="art-shape"/><span className="art-top">SIDE A RECORDINGS</span><span className="art-title">{track.album}</span><span className="art-bottom">{track.artist} <Disc3 size={13}/></span></div>; }
export default function App() {
    const [view, setView] = useState('home'), [query, setQuery] = useState(''), [genre, setGenre] = useState('All'), [lib, setLib] = useState<LibraryData>(blank), [ready, setReady] = useState(false), [error, setError] = useState(''), [toast, setToast] = useState(''), [current, setCurrent] = useState<Track>(tracks[0]), [playing, setPlaying] = useState(false), [queue, setQueue] = useState<string[]>(tracks.map(t => t.id)), [elapsed, setElapsed] = useState(0), [volume, setVolume] = useState(.65), [shuffle, setShuffle] = useState(false), [repeat, setRepeat] = useState(false), [queueOpen, setQueueOpen] = useState(false), [mobile, setMobile] = useState(false), [modal, setModal] = useState<'create' | 'edit' | 'add' | 'account' | null>(null), [name, setName] = useState(''), [description, setDescription] = useState(''), [target, setTarget] = useState<Track | null>(null), [busy, setBusy] = useState(false), [menu, setMenu] = useState<string | null>(null), [results, setResults] = useState<Track[]>(tracks);
    const searchInput = useRef<HTMLInputElement>(null), audio = useRef<HTMLAudioElement>(null), autoPlay = useRef(false), toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    function notify(message: string) { setToast(message); if (toastTimer.current)
        clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3500); }
    async function load() {
        try {
            const saved = window.localStorage.getItem('side-a-library-v1');
            setLib(saved ? { ...blank, ...JSON.parse(saved) } as LibraryData : blank);
            setError('');
        } catch {
            setLib(blank);
            setError('Your browser storage could not be read.');
        } finally { setReady(true); }
    }
    useEffect(() => { function route() { try {
        setView(decodeURIComponent(window.location.hash.slice(1)) || 'home');
    }
    catch {
        setView('home');
    } } route(); window.addEventListener('hashchange', route); return () => window.removeEventListener('hashchange', route); }, []);
    useEffect(() => { if (!modal)
        return; const previous = document.activeElement as HTMLElement; const dialog = document.querySelector('.modal') as HTMLElement; const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,textarea')); focusable()[1]?.focus(); function trap(e: KeyboardEvent) { if (e.key !== 'Tab')
        return; const els = focusable(), first = els[0], last = els[els.length - 1]; if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
    } } document.addEventListener('keydown', trap); return () => { document.removeEventListener('keydown', trap); previous?.focus(); }; }, [modal]);
    useEffect(() => { function keys(e: KeyboardEvent) { const el = e.target as HTMLElement; if (e.key === 'Escape') {
        setModal(null);
        setMenu(null);
        setQueueOpen(false);
    } if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(el.tagName)) {
        e.preventDefault();
        searchInput.current?.focus();
        go('search');
    } } document.addEventListener('keydown', keys); return () => document.removeEventListener('keydown', keys); }, []);
    useEffect(() => { load(); return () => { if (toastTimer.current)
        clearTimeout(toastTimer.current); }; }, []);
    useEffect(() => { const controller = new AbortController(); const timer = setTimeout(async () => { try {
        const r = await fetch('/api/catalog?q=' + encodeURIComponent(query), { signal: controller.signal });
        if (!r.ok)
            throw Error();
        setResults(((await r.json()) as {
            tracks: Track[];
        }).tracks);
    }
    catch (e) {
        if ((e as Error).name !== 'AbortError')
            notify('Search is unavailable. Please try again.');
    } }, 180); return () => { clearTimeout(timer); controller.abort(); }; }, [query]);
    useEffect(() => { if (audio.current)
        audio.current.volume = volume; }, [volume]);
    useEffect(() => { if (autoPlay.current && audio.current) {
        audio.current.play().catch(() => { setPlaying(false); notify('Tap play to start listening.'); });
    } }, [current.id]);
    async function mutate(data: object) {
        setBusy(true);
        try {
            const action = data as { action: string; id?: string; name?: string; description?: string; trackId?: string; liked?: boolean };
            const next: LibraryData = { ...lib, playlists: lib.playlists.map(p => ({ ...p, tracks: [...p.tracks] })), likes: [...lib.likes], history: [...lib.history] };
            let id: string | undefined;
            switch (action.action) {
                case 'like': next.likes = action.liked ? Array.from(new Set([...next.likes, action.trackId!])) : next.likes.filter(x => x !== action.trackId); break;
                case 'history': next.history = [action.trackId!, ...next.history.filter(x => x !== action.trackId)].slice(0, 50); break;
                case 'create': id = crypto.randomUUID(); next.playlists.unshift({ id, name: action.name!.trim(), description: action.description || '', tracks: [] }); break;
                case 'rename': next.playlists = next.playlists.map(p => p.id === action.id ? { ...p, name: action.name!.trim(), description: action.description || '' } : p); break;
                case 'delete': next.playlists = next.playlists.filter(p => p.id !== action.id); break;
                case 'add': next.playlists = next.playlists.map(p => p.id === action.id && !p.tracks.includes(action.trackId!) ? { ...p, tracks: [...p.tracks, action.trackId!] } : p); break;
                case 'remove': next.playlists = next.playlists.map(p => p.id === action.id ? { ...p, tracks: p.tracks.filter(x => x !== action.trackId) } : p); break;
                default: throw Error('Unsupported action.');
            }
            window.localStorage.setItem('side-a-library-v1', JSON.stringify(next));
            setLib(next);
            return { ok: true, id };
        } catch (e) {
            notify((e as Error).message || 'Could not save.'); return null;
        } finally { setBusy(false); }
    }
    function go(next: string) { setView(next); if (window.location.hash !== '#' + encodeURIComponent(next))
        window.location.hash = encodeURIComponent(next); setMobile(false); setMenu(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    function play(t: Track, ids?: string[]) { if (ids)
        setQueue(ids); autoPlay.current = true; if (current.id === t.id) {
        audio.current?.play().catch(() => notify('Playback could not start.'));
    }
    else {
        setElapsed(0);
        setCurrent(t);
    } void mutate({ action: 'history', trackId: t.id }); }
    function toggle() { if (playing)
        audio.current?.pause();
    else
        play(current); }
    function next(direction = 1) { if (!queue.length) return; const index = queue.indexOf(current.id); const at = shuffle ? Math.floor(Math.random() * queue.length) : (index + direction + queue.length) % queue.length; const t = tracks.find(t => t.id === queue[at]); if (t)
        play(t); }
    async function like(t: Track) { await mutate({ action: 'like', trackId: t.id, liked: !lib.likes.includes(t.id) }); }
    const selected = lib.playlists.find(p => p.id === view), mix = mixes.find(m => m.id === view), artist = view.startsWith('artist:') ? view.slice(7) : null, album = view.startsWith('album:') ? view.slice(6) : null;
    let shown = view === 'liked' ? tracks.filter(t => lib.likes.includes(t.id)) : view === 'history' ? lib.history.map(id => tracks.find(t => t.id === id)!).filter(Boolean) : selected ? selected.tracks.map(id => tracks.find(t => t.id === id)!).filter(Boolean) : mix ? mix.ids.map(id => tracks.find(t => t.id === id)!) : artist ? tracks.filter(t => t.artist === artist) : album ? tracks.filter(t => t.album === album) : results;
    if (genre !== 'All' && (view === 'search' || view === 'home'))
        shown = shown.filter(t => t.genre === genre);
    const title = selected?.name || mix?.title || artist || album || ({ liked: 'Liked songs', history: 'Recently played', search: query ? `Results for “${query}”` : 'Find your next favourite', library: 'Your collection' } as Record<string, string>)[view] || 'Explore the catalog';
    function rows(list: Track[]) { return <div className="track-list"><div className="track-heading"><span>#</span><span>TRACK / ARTIST</span><span>ALBUM</span><span><Clock size={14}/></span><span /></div>{list.map((t, i) => <div className={`track-row ${current.id === t.id && playing ? 'is-playing' : ''}`} key={t.id}><button className="index icon" aria-label={`Play ${t.title}`} onClick={() => play(t, list.map(t => t.id))}>{current.id === t.id && playing ? <span className="equalizer">ııı</span> : <><span>{String(i + 1).padStart(2, '0')}</span><Play size={15}/></>}</button><div className="track-main"><button className="small-art" onClick={() => play(t, list.map(t => t.id))} aria-label={`Play ${t.title}`}><Artwork track={t}/></button><div><button className="track-name" onClick={() => play(t, list.map(t => t.id))}>{t.title}</button><button className="muted artist" onClick={() => go('artist:' + t.artist)}>{t.artist}</button></div></div><button className="album-name" onClick={() => go('album:' + t.album)}>{t.album}</button><span className="duration">{format(t.duration)}</span><div className="row-actions"><button className={`icon ${lib.likes.includes(t.id) ? 'orange' : ''}`} disabled={busy} onClick={() => like(t)} aria-label={`${lib.likes.includes(t.id) ? 'Unlike' : 'Like'} ${t.title}`}><Heart size={17} fill={lib.likes.includes(t.id) ? 'currentColor' : 'none'}/></button><div className="menu-wrap"><button className="icon" onClick={() => setMenu(menu === t.id ? null : t.id)} aria-label={`Options for ${t.title}`}><MoreHorizontal size={19}/></button>{menu === t.id && <div className="dropdown"><button onClick={() => { setQueue(q => q.includes(t.id) ? q : [...q, t.id]); setMenu(null); notify(queue.includes(t.id) ? 'This track is already in your queue' : 'Added to queue'); }}><ListMusic size={15}/>Add to queue</button><button onClick={() => { setTarget(t); setModal('add'); setMenu(null); }}><Plus size={15}/>Add to playlist</button>{selected && <button onClick={async () => { await mutate({ action: 'remove', id: selected.id, trackId: t.id }); setMenu(null); }}><X size={15}/>Remove from playlist</button>}</div>}</div></div></div>)}{!list.length && <div className="empty"><Music2 /><h3>{query ? 'Nothing found yet' : 'A little space for your music'}</h3><p>{query ? 'Try a different track, artist or genre.' : 'Explore the catalog and start adding your favourites.'}</p><button className="primary" onClick={() => { setQuery(''); setGenre('All'); go('search'); }}>Explore music <ArrowUpRight size={16}/></button></div>}</div>; }
    return <div className="app-shell"><audio ref={audio} src={'/api/audio/' + current.id} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={() => setElapsed(audio.current?.currentTime || 0)} onEnded={() => { if (repeat) {
        if (audio.current)
            audio.current.currentTime = 0;
        play(current);
    }
    else
        next(); }} onError={() => { setPlaying(false); notify('This track could not load. Try playing it again.'); }}/>
    {mobile && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobile(false)}/>}
    <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}><button className="brand" onClick={() => go('home')}><span className="brand-icon"><Disc3 size={27}/></span>side a<span className="brand-dot">®</span></button><p className="eyebrow nav-label">YOUR DAILY ROTATION</p><nav>{[[Home, 'home', 'Discover'], [Search, 'search', 'Search'], [Library, 'library', 'Your library']].map(([Icon, id, label]: any) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => go(id)}><Icon size={20}/>{label}{view === id && <span className="nav-dot"/>}</button>)}</nav><a className="nav-item" href="/youtube-music" style={{ textDecoration: 'none' }}><Music2 size={20}/>YouTube Music</a><div className="side-divider"/><nav><button className={`nav-item ${view === 'liked' ? 'active' : ''}`} onClick={() => go('liked')}><Heart size={20}/>Liked songs <span className="count">{lib.likes.length}</span></button><button className={`nav-item ${view === 'history' ? 'active' : ''}`} onClick={() => go('history')}><Clock size={20}/>Recently played</button></nav><div className="playlist-label"><p className="eyebrow">YOUR PLAYLISTS</p><button className="icon" aria-label="Create playlist" onClick={() => { setName(''); setDescription(''); setTarget(null); setModal('create'); }}><Plus size={18}/></button></div>{lib.playlists.length ? lib.playlists.map(p => <button key={p.id} className={`playlist-nav ${view === p.id ? 'active' : ''}`} onClick={() => go(p.id)}><span className="playlist-icon"><Music2 size={16}/></span><span>{p.name}<small>{p.tracks.length} tracks · Yours</small></span></button>) : <div className="playlist-empty"><p>Good music belongs together.</p><button onClick={() => { setName(''); setDescription(''); setTarget(null); setModal('create'); }}>Make your first playlist <Plus size={14}/></button></div>}<div className="sidebar-bottom"><div className="listening-note"><Headphones size={23}/><h4>Less noise.<br />More good music.</h4><p>Your own little listening space.</p></div><button className="profile" onClick={() => setModal('account')}><span className="avatar">{lib.user?.name?.[0]?.toUpperCase() || 'S'}</span><span>{lib.user ? lib.user.name.split('@')[0] : 'Your listening space'}<small>{lib.user ? 'Personal account' : 'Saved in this browser'}</small></span><ChevronRight size={16}/></button></div></aside>
    <div className="main-shell"><header className="topbar"><div className="top-left"><button className="icon mobile-menu" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu size={22}/></button><span className="top-caption">A LITTLE MORE LISTENING.</span></div><label className="search-box"><Search size={17}/><input ref={searchInput} aria-label="Search music" placeholder="Songs, artists, a feeling..." value={query} onChange={e => { setQuery(e.target.value); setGenre('All'); go('search'); }} onFocus={() => { if (query)
        go('search'); }}/><kbd>/</kbd></label><button className="icon mobile-queue" onClick={() => setQueueOpen(!queueOpen)} aria-label="Open mobile queue"><ListMusic size={20}/></button><button className="top-account" onClick={() => setModal('account')}><span className="online-dot"/>Your music, your pace <span className="avatar small">{lib.user?.name?.[0]?.toUpperCase() || 'S'}</span></button></header>
    <main>{error && <div className="notice">{error} <button onClick={load}>Retry</button></div>}
        {view === 'home' ? <><div className="page-intro"><div><p className="eyebrow">MAKE YOURSELF AT HOME</p><h1>Good music. Better days<span>.</span></h1><p>A fresh selection for whatever today feels like.</p></div><div className="edition"><span>SIDE A SELECTS</span><strong>VOL. 001</strong></div></div><section className="hero"><div className="hero-copy"><span className="hero-tag"><span />THE WEEKEND EDIT</span><h2>Take the<br />scenic route.</h2><p>Warm sounds, wandering minds.<br />A soundtrack for slowing things down.</p><div className="hero-actions"><button className="dark-button" onClick={() => play(tracks[0], mixes[0].ids)}><Play size={16} fill="currentColor"/>Press play</button><button className="text-button" onClick={() => go('slow')}>Explore the mix <ArrowUpRight size={16}/></button></div><span className="hero-footnote">CURATED WITH CARE &nbsp;·&nbsp; 4 TRACKS</span></div><div className="hero-art" aria-hidden="true"><div className="sun"/><div className="landscape back"/><div className="landscape front"/><div className="record"><div className="record-label"><span>side a</span><i /><small>SLOW MORNINGS<br />33⅓ RPM · STEREO</small></div></div><div className="record-sleeve"><span>THE ART OF<br />DOING LESS.</span><div className="sleeve-circle"/><small>AN EVERYDAY SOUNDTRACK<br />SIDE A RECORDINGS — 001</small></div><span className="art-stamp">TURN IT UP.<br />SLOW IT DOWN.</span></div></section>
        <div className="section-heading"><div><h2>A mood for every moment</h2><p>Find a little of yourself in the mix.</p></div><button className="text-button" onClick={() => go('search')}>Explore all <ArrowUpRight size={16}/></button></div><div className="mix-grid">{mixes.map((m, i) => <button className={`mix-card mix-${i}`} key={m.id} onClick={() => go(m.id)} style={{ background: m.color }}><span className="mix-label">{m.label}</span><h3>{m.title}</h3><div className="mix-decoration"><span /><span /><span /></div><div className="mix-bottom"><span>{m.subtitle}</span><span className="mix-play"><ArrowUpRight size={19}/></span></div></button>)}</div>
        <div className="section-heading"><div><h2>On repeat, for a reason</h2><p>Fresh finds worth another listen.</p></div><button className="text-button" onClick={() => go('search')}>View all tracks <ChevronRight size={16}/></button></div>{rows(tracks.slice(0, 5))}<div className="section-heading"><div><h2>Meet your next favourite</h2><p>Small catalog. Plenty to discover.</p></div></div><div className="album-grid">{[tracks[0], tracks[1], tracks[2], tracks[3], tracks[4], tracks[10]].map(t => <button key={t.id} className="album-card" onClick={() => go('album:' + t.album)}><Artwork track={t} large/><h3>{t.album}</h3><p>{t.artist}</p></button>)}</div></> : <><button className="back-button" onClick={() => { setGenre('All'); go('home'); }}><ArrowLeft size={16}/>Back to discover</button><div className="collection-intro"><div className="collection-icon" style={{ background: mix?.color || '#eee6d8' }}>{view === 'liked' ? <Heart size={45}/> : view === 'history' ? <Clock size={45}/> : view === 'search' ? <Search size={45}/> : <Disc3 size={52}/>}</div><div><p className="eyebrow">{selected ? 'YOUR PLAYLIST' : artist ? 'ARTIST' : album ? 'ALBUM' : mix ? 'SIDE A SELECTS' : 'YOUR LISTENING SPACE'}</p><h1>{title}</h1><p>{selected?.description || mix?.subtitle || (view === 'library' ? `${lib.playlists.length} playlists. One place for your favourites.` : `${shown.length} tracks · Original instrumental demos`)}</p></div>{selected && <div className="collection-tools"><button className="icon" aria-label="Edit playlist" onClick={() => { setName(selected.name); setDescription(selected.description); setModal('edit'); }}><Pencil size={19}/></button><button className="icon" aria-label="Delete playlist" onClick={async () => { if (confirm(`Delete “${selected.name}”? This cannot be undone.`)) {
            if (await mutate({ action: 'delete', id: selected.id }))
                go('library');
        } }}><Trash2 size={19}/></button></div>}</div>
        {view === 'library' ? <><button className="primary" onClick={() => { setName(''); setDescription(''); setTarget(null); setModal('create'); }}><Plus size={17}/>Create playlist</button><div className="library-grid">{lib.playlists.map(p => <button key={p.id} className="library-card" onClick={() => go(p.id)}><span><Music2 size={38}/></span><h3>{p.name}</h3><p>{p.tracks.length} tracks</p></button>)}</div>{!lib.playlists.length && <div className="empty"><Library size={38}/><h3>Your collection starts with one playlist.</h3><p>Save a few favourites. Make it yours.</p></div>}</> : <><div className="collection-actions"><button className="primary" disabled={!shown.length} onClick={() => play(shown[0], shown.map(t => t.id))}><Play size={16} fill="currentColor"/>Play all</button><button className={`pill ${shuffle ? 'selected' : ''}`} onClick={() => setShuffle(!shuffle)}><Shuffle size={16}/>Shuffle {shuffle ? 'on' : 'off'}</button>{selected && <button className="text-button" onClick={() => go('search')}><Plus size={16}/>Find tracks to add</button>}</div>{view === 'search' && <div className="genre-tabs">{['All', 'Chill', 'Indie', 'Jazz', 'Ambient', 'Electronic'].map(g => <button className={genre === g ? 'selected' : ''} onClick={() => setGenre(g)} key={g}>{g}</button>)}</div>}{rows(shown)}</>}</>}
    <footer className="page-footer"><span><Disc3 size={17}/>side a — Made for the love of listening.</span><button onClick={() => setModal('account')}>About this space <ArrowUpRight size={13}/></button></footer></main></div>
    <footer className="player"><div className="now-playing"><button className="player-art" aria-label="View current album" onClick={() => go('album:' + current.album)}><Artwork track={current}/></button><div><button className="track-name" onClick={() => go('album:' + current.album)}>{current.title}</button><button className="artist muted" onClick={() => go('artist:' + current.artist)}>{current.artist}</button></div><button className={`icon like-player ${lib.likes.includes(current.id) ? 'orange' : ''}`} onClick={() => like(current)} aria-label="Like current track"><Heart size={18} fill={lib.likes.includes(current.id) ? 'currentColor' : 'none'}/></button></div><div className="playback"><div className="playback-buttons"><button className={`icon ${shuffle ? 'orange' : ''}`} onClick={() => setShuffle(!shuffle)} aria-label="Toggle shuffle" aria-pressed={shuffle}><Shuffle size={17}/></button><button className="icon" onClick={() => next(-1)} aria-label="Previous track"><SkipBack size={19} fill="currentColor"/></button><button className="play-main" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}</button><button className="icon" onClick={() => next()} aria-label="Next track"><SkipForward size={19} fill="currentColor"/></button><button className={`icon ${repeat ? 'orange' : ''}`} onClick={() => setRepeat(!repeat)} aria-label="Repeat current track" aria-pressed={repeat}><Repeat size={17}/></button></div><div className="progress"><span>{format(elapsed)}</span><input aria-label="Seek" type="range" min="0" max={current.duration} step=".1" value={elapsed} onChange={e => { const n = Number(e.target.value); if (audio.current)
        audio.current.currentTime = n; setElapsed(n); }} style={{ '--progress': `${elapsed / current.duration * 100}%` } as React.CSSProperties}/><span>{format(current.duration)}</span></div></div><div className="player-extras"><button className={`icon ${queueOpen ? 'orange' : ''}`} onClick={() => setQueueOpen(!queueOpen)} aria-label="Open queue"><ListMusic size={20}/></button><span className="player-divider"/><button className="icon" onClick={() => setVolume(volume ? 0 : .65)} aria-label={volume ? 'Mute' : 'Unmute'}>{volume ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button><input type="range" min="0" max="1" step=".01" value={volume} aria-label="Volume" onChange={e => setVolume(Number(e.target.value))}/><span className="quality">STEREO</span></div></footer>
    {queueOpen && <aside className="queue-panel"><div className="section-heading"><div><p className="eyebrow">KEEP THE GOOD GOING</p><h2>Your queue</h2></div><button className="icon" onClick={() => setQueueOpen(false)} aria-label="Close queue"><X /></button></div><p className="muted">{queue.length} tracks in this rotation</p>{queue.map((id, i) => { const t = tracks.find(t => t.id === id)!; return <div className="queue-row" key={id + i}><button onClick={() => play(t)}><Artwork track={t}/><span>{t.title}<small>{t.artist}</small></span></button><button className="icon" aria-label={`Remove ${t.title} from queue`} onClick={() => setQueue(q => q.filter((_, j) => i !== j))}><X size={16}/></button></div>; })}</aside>}
    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><section className="modal" role="dialog" aria-modal="true" aria-label={modal === 'account' ? 'Your account' : modal === 'add' ? 'Add to playlist' : 'Playlist editor'} onClick={e => e.stopPropagation()}><button className="modal-close icon" onClick={() => setModal(null)} aria-label="Close dialog"><X /></button>{modal === 'account' ? <><span className="brand-icon"><Disc3 size={30}/></span><h2>Your little listening space.</h2><p>Side A is an independent music app, rebuilt from JL978’s Spotify clone. Your playlists, favourites and listening history are saved locally in this browser.</p><div className="about-note"><strong>About the music</strong><p>All 12 tracks are original, synthesized 48-second instrumental demos with fictional artist names. This catalog does not stream Spotify or commercial recordings.</p></div><p className="form-note">No account needed. Data stays in this browser on this device.</p><a className="primary" href="/youtube-music">Add YouTube Music playlists <ArrowUpRight size={16}/></a></> : modal === 'add' ? <><p className="eyebrow">MAKE IT PART OF YOUR ROTATION</p><h2>Add to a playlist</h2><p>{target?.title} · {target?.artist}</p>{lib.playlists.map(p => <button className="playlist-option" disabled={busy || p.tracks.includes(target!.id)} key={p.id} onClick={async () => { if (await mutate({ action: 'add', id: p.id, trackId: target!.id })) {
        setModal(null);
        notify('Added to ' + p.name);
    } }}><Music2 size={19}/>{p.name}{p.tracks.includes(target!.id) ? <Check size={18}/> : <Plus size={18}/>}</button>)}<button className="primary" onClick={() => { setName(''); setDescription(''); setModal('create'); }}><Plus size={16}/>Create a new playlist</button></> : <form onSubmit={async (e) => { e.preventDefault(); const body = await mutate({ action: modal === 'edit' ? 'rename' : 'create', ...(modal === 'edit' ? { id: selected!.id } : {}), name, description }); if (body) {
        if (target && modal === 'create')
            await mutate({ action: 'add', id: body.id, trackId: target.id });
        setModal(null);
        setTarget(null);
        go(body.id || selected!.id);
        notify('Playlist saved');
    } }}><p className="eyebrow">A SOUNDTRACK, ALL YOUR OWN</p><h2>{modal === 'edit' ? 'Edit your playlist' : 'Make a new playlist'}</h2><label>Playlist name<input autoFocus required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My slow Sunday"/></label><label>Description <span className="muted">(optional)</span><textarea maxLength={300} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this playlist feel like?"/></label><button className="primary" disabled={busy || !name.trim()}>{busy ? 'Saving...' : 'Save playlist'}<Check size={16}/></button>{ready && <p className="form-note">Saved in this browser. Use the same browser and device to see these playlists.</p>}</form>}</section></div>}
    {toast && <div className="toast" role="status">{toast}<button className="icon" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16}/></button></div>}
    </div>;
}
