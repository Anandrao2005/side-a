export type Track = {
    id: string;
    title: string;
    artist: string;
    album: string;
    genre: string;
    duration: number;
    color: string;
    art: number;
    bpm: number;
    root: number;
};
export const tracks: Track[] = [
    { id: 'golden', title: 'Golden Hour', artist: 'The Sunday Club', album: 'Soft Focus', genre: 'Chill', duration: 48, color: '#cfa569', art: 0, bpm: 80, root: 220 },
    { id: 'somewhere', title: 'Somewhere, Slowly', artist: 'Milo Fields', album: 'A Place to Land', genre: 'Indie', duration: 48, color: '#89917a', art: 1, bpm: 90, root: 196 },
    { id: 'window', title: 'Window Seat', artist: 'June & Co.', album: 'Passing Places', genre: 'Jazz', duration: 48, color: '#b86a4a', art: 2, bpm: 75, root: 174.61 },
    { id: 'bloom', title: 'In Full Bloom', artist: 'Peach House', album: 'Little Things', genre: 'Indie', duration: 48, color: '#b2a5b9', art: 3, bpm: 100, root: 261.63 },
    { id: 'tides', title: 'Easy Tides', artist: 'Coastline Radio', album: 'Out of Office', genre: 'Ambient', duration: 48, color: '#74948c', art: 4, bpm: 60, root: 164.81 },
    { id: 'sunday', title: 'Sunday Kind of Love', artist: 'The Sunday Club', album: 'Soft Focus', genre: 'Chill', duration: 48, color: '#cfa569', art: 0, bpm: 80, root: 246.94 },
    { id: 'velvet', title: 'Velvet Morning', artist: 'June & Co.', album: 'Passing Places', genre: 'Jazz', duration: 48, color: '#b86a4a', art: 2, bpm: 75, root: 146.83 },
    { id: 'garden', title: 'The Quiet Garden', artist: 'Milo Fields', album: 'A Place to Land', genre: 'Ambient', duration: 48, color: '#89917a', art: 1, bpm: 60, root: 196 },
    { id: 'peach', title: 'Peach Season', artist: 'Peach House', album: 'Little Things', genre: 'Indie', duration: 48, color: '#b2a5b9', art: 3, bpm: 100, root: 220 },
    { id: 'afterglow', title: 'Afterglow', artist: 'Coastline Radio', album: 'Out of Office', genre: 'Chill', duration: 48, color: '#74948c', art: 4, bpm: 80, root: 174.61 },
    { id: 'paper', title: 'Paper Planes', artist: 'Lowlight', album: 'Daydream Department', genre: 'Electronic', duration: 48, color: '#d6a354', art: 5, bpm: 110, root: 130.81 },
    { id: 'night', title: 'One More Night', artist: 'Lowlight', album: 'Daydream Department', genre: 'Electronic', duration: 48, color: '#d6a354', art: 5, bpm: 110, root: 164.81 }
];
export const mixes = [{ id: 'slow', title: 'Slow mornings', subtitle: 'No rush. Just good music.', label: 'THE DAILY SOUNDTRACK', color: '#a5ae8a', art: 1, ids: ['golden', 'somewhere', 'window', 'garden'] }, { id: 'focus', title: 'Find your flow', subtitle: 'A little room to concentrate.', label: 'IN THE ZONE', color: '#cebda4', art: 5, ids: ['paper', 'tides', 'garden', 'night'] }, { id: 'gold', title: 'Golden state', subtitle: 'For the long way home.', label: 'FEEL-GOOD FREQUENCIES', color: '#d7a36b', art: 0, ids: ['bloom', 'peach', 'afterglow', 'sunday'] }, { id: 'late', title: 'After hours', subtitle: 'Let the day fade away.', label: 'STAY A LITTLE LONGER', color: '#ab9aaf', art: 3, ids: ['velvet', 'window', 'night', 'tides'] }];
