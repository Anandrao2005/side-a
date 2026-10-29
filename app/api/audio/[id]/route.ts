import { tracks } from '../../../catalog';
// Deterministic, original demo compositions. PCM is generated once per request;
// HTTP byte ranges allow seeking without depending on an external music service.
export async function GET(req: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const track = tracks.find(t => t.id === id);
    if (!track)
        return new Response('Not found', { status: 404 });
    const rate = 16000, n = rate * track.duration, size = 44 + n * 2;
    let start = 0, end = size - 1;
    const range = req.headers.get('range');
    if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match || (!match[1] && !match[2]))
            return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
        if (!match[1])
            start = Math.max(0, size - Number(match[2]));
        else {
            start = Number(match[1]);
            if (match[2])
                end = Math.min(end, Number(match[2]));
        }
        if (start > end || start >= size)
            return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    const buffer = new ArrayBuffer(size), view = new DataView(buffer);
    const str = (p: number, s: string) => { for (let j = 0; j < s.length; j++)
        view.setUint8(p + j, s.charCodeAt(j)); };
    str(0, 'RIFF');
    view.setUint32(4, size - 8, true);
    str(8, 'WAVEfmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    str(36, 'data');
    view.setUint32(40, n * 2, true);
    const beat = 60 / track.bpm, chords = [1, 0.7937, 1.1892, 0.8909], notes = [1, 1.25, 1.5, 2, 1.5, 1.25, 1.125, 1.5];
    for (let i = Math.max(0, Math.floor((start - 44) / 2)); i < Math.min(n, Math.ceil((end - 43) / 2)); i++) {
        const t = i / rate, c = chords[Math.floor(t / (beat * 4)) % 4], f = track.root * c, phase = t % beat, melody = f * notes[Math.floor(t / beat) % 8];
        const pad = (Math.sin(t * f * 2 * Math.PI) + .5 * Math.sin(t * f * 2.5 * Math.PI) + .35 * Math.sin(t * f * 3 * Math.PI)) * .1;
        const lead = Math.sin(t * melody * 4 * Math.PI) * Math.exp(-phase * 4) * .14;
        const kick = Math.sin(2 * Math.PI * (48 * phase + 4 * (1 - Math.exp(-phase * 25)))) * Math.exp(-phase * 18) * .14;
        const fade = Math.min(t / 2, (track.duration - t) / 3, 1);
        view.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, (pad + lead + kick) * fade * 32767)), true);
    }
    return new Response(buffer.slice(start, end + 1), { status: range ? 206 : 200, headers: { 'Content-Type': 'audio/wav', 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400', ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}) } });
}
