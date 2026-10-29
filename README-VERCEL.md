# Side A — Vercel version

## Local run (Node.js 22.13+)

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed in the terminal.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import that repository in Vercel.
3. Framework preset: Next.js. Build command: `pnpm build`; install command: `pnpm install --frozen-lockfile`.
4. No environment variables are required for the included demo catalog.

## Important limitations

- This version uses Next.js on Vercel rather than the original Cloudflare/Vinext runtime.
- Personal playlists, likes, history, and saved YouTube Music playlist links use browser localStorage. They are not synced across devices and clearing browser data removes them.
- The original 12 tracks are generated demo instrumentals, not commercial songs.
- Paste a public or unlisted YouTube Music playlist URL on `/youtube-music`. Playback uses YouTube's embedded playlist player; private playlists, embedding restrictions, regional blocks, and YouTube account/age restrictions may prevent some tracks from playing. Use the open-on-YouTube-Music link if embedding fails.
