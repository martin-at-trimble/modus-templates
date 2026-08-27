export type LibraryKind = 'playlist' | 'artist' | 'album' | 'podcast';

export type LibraryArt =
  | 'liked'
  | 'episodes'
  | 'mix'
  | 'artist'
  | 'album'
  | 'radar'
  | 'weekly'
  | 'user';

export type LibraryItem = {
  id: string;
  title: string;
  kind: LibraryKind;
  meta: string;
  art: LibraryArt;
  pinned?: boolean;
  /** ISO-ish stamp used only for Recents / Recently added sorts. */
  updated: string;
};

export type Track = {
  id: string;
  playlistId: string;
  title: string;
  artist: string;
  album: string;
  added: string;
  duration: string;
  durationSeconds: number;
  explicit?: boolean;
  saved?: boolean;
  art: LibraryArt;
};

export type RelatedVideo = {
  id: string;
  title: string;
  href: string;
  art: LibraryArt;
};

export const MUSIC_USER = {
  name: 'Martin Espericueta',
  initials: 'ME',
};

export const LIBRARY_FILTERS: { id: LibraryKind; label: string }[] = [
  { id: 'playlist', label: 'Playlists' },
  { id: 'artist', label: 'Artists' },
  { id: 'album', label: 'Albums' },
  { id: 'podcast', label: 'Podcasts' },
];

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'liked',
    title: 'Liked Songs',
    kind: 'playlist',
    meta: 'Playlist • 12 songs',
    art: 'liked',
    pinned: true,
    updated: '2026-08-25',
  },
  {
    id: 'episodes',
    title: 'Your Episodes',
    kind: 'podcast',
    meta: 'Saved and downloaded episodes',
    art: 'episodes',
    pinned: true,
    updated: '2026-08-24',
  },
  {
    id: 'tame-impala',
    title: 'This is Tame Impala',
    kind: 'playlist',
    meta: 'Playlist • 48 songs',
    art: 'mix',
    updated: '2026-08-20',
  },
  {
    id: 'martin-mix',
    title: 'Martin Espericueta',
    kind: 'playlist',
    meta: 'Playlist • 36 songs',
    art: 'user',
    updated: '2026-08-18',
  },
  {
    id: 'the-neighbourhood',
    title: 'The Neighbourhood',
    kind: 'artist',
    meta: 'Artist',
    art: 'artist',
    updated: '2026-08-12',
  },
  {
    id: 'daily-1',
    title: 'Daily Mix 1',
    kind: 'playlist',
    meta: 'Playlist • Made for you',
    art: 'mix',
    updated: '2026-08-25',
  },
  {
    id: 'daily-2',
    title: 'Daily Mix 2',
    kind: 'playlist',
    meta: 'Playlist • Made for you',
    art: 'weekly',
    updated: '2026-08-25',
  },
  {
    id: 'daily-3',
    title: 'Daily Mix 3',
    kind: 'playlist',
    meta: 'Playlist • Made for you',
    art: 'radar',
    updated: '2026-08-25',
  },
  {
    id: 'discover',
    title: 'Discover Weekly',
    kind: 'playlist',
    meta: 'Playlist • Made for you',
    art: 'weekly',
    updated: '2026-08-22',
  },
  {
    id: 'radar',
    title: 'Release Radar',
    kind: 'playlist',
    meta: 'Playlist • New releases',
    art: 'radar',
    updated: '2026-08-21',
  },
  {
    id: 'favourite-worst',
    title: 'Favourite Worst Nightmare',
    kind: 'album',
    meta: 'Album • Arctic Monkeys',
    art: 'album',
    updated: '2026-08-10',
  },
];

export const TRACKS: Track[] = [
  {
    id: 'johnny-glamour',
    playlistId: 'liked',
    title: 'Johnny Glamour',
    artist: 'rusowsky, Las Ketchup',
    album: 'Johnny Glamour',
    added: '2 days ago',
    duration: '2:21',
    durationSeconds: 141,
    saved: true,
    art: 'mix',
  },
  {
    id: 'solo-se',
    playlistId: 'liked',
    title: 'Solo se que me veo bien',
    artist: 'rusowsky',
    album: 'Solo se que me veo bien',
    added: '2 days ago',
    duration: '2:08',
    durationSeconds: 128,
    explicit: true,
    saved: true,
    art: 'mix',
  },
  {
    id: '505',
    playlistId: 'liked',
    title: '505',
    artist: 'Arctic Monkeys',
    album: 'Favourite Worst Nightmare',
    added: '5 days ago',
    duration: '4:13',
    durationSeconds: 253,
    saved: true,
    art: 'album',
  },
  {
    id: 'r-u-mine',
    playlistId: 'liked',
    title: 'R U Mine?',
    artist: 'Arctic Monkeys',
    album: 'AM',
    added: '5 days ago',
    duration: '3:21',
    durationSeconds: 201,
    saved: true,
    art: 'album',
  },
  {
    id: 'why-d-you',
    playlistId: 'liked',
    title: "Why'd you only call me when you're high?",
    artist: 'Arctic Monkeys',
    album: 'AM',
    added: '5 days ago',
    duration: '2:41',
    durationSeconds: 161,
    explicit: true,
    saved: true,
    art: 'album',
  },
  {
    id: 'do-i-wanna-know',
    playlistId: 'liked',
    title: 'Do I wanna know?',
    artist: 'Arctic Monkeys',
    album: 'AM',
    added: '1 week ago',
    duration: '4:32',
    durationSeconds: 272,
    saved: true,
    art: 'album',
  },
  {
    id: 'fluorescent',
    playlistId: 'liked',
    title: 'Fluorescent adolescent',
    artist: 'Arctic Monkeys',
    album: 'Favourite Worst Nightmare',
    added: '1 week ago',
    duration: '3:03',
    durationSeconds: 183,
    saved: true,
    art: 'album',
  },
  {
    id: 'i-wanna-be-yours',
    playlistId: 'liked',
    title: 'I wanna be yours',
    artist: 'Arctic Monkeys',
    album: 'AM',
    added: '2 weeks ago',
    duration: '3:04',
    durationSeconds: 184,
    saved: true,
    art: 'album',
  },
  {
    id: 'sweater-weather',
    playlistId: 'liked',
    title: 'Sweater weather',
    artist: 'The Neighbourhood',
    album: 'I Love You.',
    added: '3 weeks ago',
    duration: '4:00',
    durationSeconds: 240,
    saved: true,
    art: 'artist',
  },
  {
    id: 'let-it-happen',
    playlistId: 'liked',
    title: 'Let it happen',
    artist: 'Tame Impala',
    album: 'Currents',
    added: '3 weeks ago',
    duration: '7:46',
    durationSeconds: 466,
    saved: true,
    art: 'mix',
  },
  {
    id: 'the-less-i-know',
    playlistId: 'liked',
    title: 'The less I know the better',
    artist: 'Tame Impala',
    album: 'Currents',
    added: '1 month ago',
    duration: '3:36',
    durationSeconds: 216,
    explicit: true,
    saved: true,
    art: 'mix',
  },
  {
    id: 'borderline',
    playlistId: 'liked',
    title: 'Borderline',
    artist: 'Tame Impala',
    album: 'The Slow Rush',
    added: '1 month ago',
    duration: '3:57',
    durationSeconds: 237,
    saved: true,
    art: 'weekly',
  },
  {
    id: 'elephant',
    playlistId: 'tame-impala',
    title: 'Elephant',
    artist: 'Tame Impala',
    album: 'Lonerism',
    added: '2 months ago',
    duration: '3:31',
    durationSeconds: 211,
    saved: true,
    art: 'mix',
  },
  {
    id: 'feels-like-we-only-go-backwards',
    playlistId: 'tame-impala',
    title: 'Feels like we only go backwards',
    artist: 'Tame Impala',
    album: 'Lonerism',
    added: '2 months ago',
    duration: '3:12',
    durationSeconds: 192,
    saved: false,
    art: 'mix',
  },
  {
    id: 'brianstorm',
    playlistId: 'favourite-worst',
    title: 'Brianstorm',
    artist: 'Arctic Monkeys',
    album: 'Favourite Worst Nightmare',
    added: '5 days ago',
    duration: '2:52',
    durationSeconds: 172,
    saved: true,
    art: 'album',
  },
  {
    id: 'teddy-picker',
    playlistId: 'favourite-worst',
    title: 'Teddy picker',
    artist: 'Arctic Monkeys',
    album: 'Favourite Worst Nightmare',
    added: '5 days ago',
    duration: '2:43',
    durationSeconds: 163,
    saved: false,
    art: 'album',
  },
];

export const RELATED_VIDEOS: RelatedVideo[] = [
  {
    id: 'vid-johnny',
    title: 'rusowsky — Johnny Glamour',
    href: '#video-johnny-glamour',
    art: 'mix',
  },
  {
    id: 'vid-ketchup',
    title: 'Las Ketchup — The ketchup song',
    href: '#video-ketchup-song',
    art: 'radar',
  },
];

export const DEFAULT_TRACK_ID = 'johnny-glamour';
export const DEFAULT_PROGRESS_SECONDS = 99;
export const DEFAULT_VOLUME = 72;
