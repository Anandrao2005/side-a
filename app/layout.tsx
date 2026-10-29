import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Side A — A little more listening', description: 'An independent music player with personal playlists and YouTube Music playlist embedding.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
