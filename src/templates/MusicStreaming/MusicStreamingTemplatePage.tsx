import { useEffect, useState } from 'react';
import type { ISelectOption, ITableColumn } from '@trimble-oss/moduswebcomponents';
import {
  ModusWcAvatar,
  ModusWcButton,
  ModusWcCard,
  ModusWcChip,
  ModusWcDropdownMenu,
  ModusWcIcon,
  ModusWcLink,
  ModusWcMenuItem,
  ModusWcModal,
  ModusWcSelect,
  ModusWcSlider,
  ModusWcTable,
  ModusWcTextInput,
  ModusWcThemeSwitcher,
  ModusWcTooltip,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import {
  DEFAULT_PROGRESS_SECONDS,
  DEFAULT_TRACK_ID,
  DEFAULT_VOLUME,
  LIBRARY_FILTERS,
  LIBRARY_ITEMS,
  MUSIC_USER,
  RELATED_VIDEOS,
  TRACKS,
  type LibraryArt,
  type LibraryItem,
  type LibraryKind,
  type Track,
} from './musicStreaming';
import { readInputString } from '../../lib/modusFormEvents';
import { ResizablePanels, type ResizablePanelsDirection } from '../../patterns/ResizablePanels';
import './MusicStreamingTemplatePage.css';

/** Below `md` (768px), stack library/playlist/now-playing panels vertically instead of a tight side-by-side split. */
const NARROW_LAYOUT_QUERY = '(max-width: 767px)';

function readPanelsDirection(): ResizablePanelsDirection {
  return window.matchMedia(NARROW_LAYOUT_QUERY).matches ? 'vertical' : 'horizontal';
}

const CREATE_PLAYLIST_MODAL_ID = 'musicstreaming-create-playlist-modal';
const ADD_TO_PLAYLIST_MODAL_ID = 'musicstreaming-add-to-playlist-modal';
const HEADER_SEARCH_ID = 'musicstreaming-search';
const LIBRARY_SEARCH_ID = 'musicstreaming-library-search';
const KIND_LABEL: Record<LibraryKind, string> = {
  playlist: 'Playlist',
  artist: 'Artist',
  album: 'Album',
  podcast: 'Podcast',
};
const ART_ICON: Record<LibraryArt, string> = {
  liked: 'heart',
  episodes: 'headset',
  mix: 'mix',
  artist: 'person',
  album: 'image',
  radar: 'star',
  weekly: 'apps',
  user: 'person',
};
const SORT_LABEL: Record<string, string> = {
  recents: 'Recents',
  added: 'Recently added',
  alpha: 'Alphabetical',
};

type RepeatMode = 'off' | 'all' | 'one';

/** Assigned in an effect so table cellRenderer can open the add-to-playlist modal. */
let openAddToPlaylistForTrack = (trackId: string) => {
  void trackId;
};

function closeMenuFromEvent(event: CustomEvent) {
  const trigger = (event.target as HTMLElement | null)?.closest('modus-wc-dropdown-menu');
  if (trigger) {
    (trigger as HTMLElement & { menuVisible: boolean }).menuVisible = false;
  }
}

function dialogById(id: string) {
  return document.getElementById(id) as HTMLDialogElement | null;
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function readInputNumber(event: CustomEvent): number {
  const n = Number(readInputString(event));
  return Number.isFinite(n) ? n : 0;
}

function modusHost(tag: string, props: Record<string, unknown>) {
  const node = document.createElement(tag) as HTMLElement;
  Object.assign(node, props);
  return node;
}

function renderIndexCell(_value: unknown, row: unknown) {
  const data = row as Track & { isPlaying?: boolean; isPaused?: boolean; indexLabel: string };
  if (data.isPlaying) {
    return modusHost('modus-wc-icon', {
      name: data.isPaused ? 'play_circle' : 'pause_circle',
      size: 'sm',
      variant: 'solid',
      decorative: true,
    });
  }
  const label = document.createElement('span');
  label.className = 'musicstreaming-index';
  label.textContent = data.indexLabel;
  return label;
}

function renderTitleCell(_value: unknown, row: unknown) {
  const data = row as Track & { isPlaying?: boolean };
  const wrap = document.createElement('div');
  wrap.className = 'musicstreaming-title-cell';

  const thumb = document.createElement('span');
  thumb.className = `musicstreaming-thumb musicstreaming-thumb--${data.art}`;
  thumb.appendChild(
    modusHost('modus-wc-icon', {
      name: ART_ICON[data.art],
      size: 'sm',
      variant: data.art === 'liked' ? 'solid' : 'outlined',
      decorative: true,
    }),
  );

  const stack = document.createElement('div');
  stack.className = 'musicstreaming-title-stack';
  stack.appendChild(
    modusHost('modus-wc-typography', {
      hierarchy: 'p',
      size: 'sm',
      weight: 'semibold',
      label: data.title,
      customClass: data.isPlaying ? 'musicstreaming-playing-title' : '',
    }),
  );

  const meta = document.createElement('div');
  meta.className = 'musicstreaming-title-meta';
  meta.appendChild(
    modusHost('modus-wc-typography', {
      hierarchy: 'p',
      size: 'xs',
      label: data.artist,
      customClass: 'musicstreaming-muted',
    }),
  );
  if (data.explicit) {
    const badge = modusHost('modus-wc-badge', {
      size: 'sm',
      variant: 'outlined',
      color: 'default',
    });
    badge.textContent = 'E';
    badge.setAttribute('aria-label', 'Explicit');
    meta.appendChild(badge);
  }
  stack.appendChild(meta);
  wrap.appendChild(thumb);
  wrap.appendChild(stack);
  return wrap;
}

function renderDurationCell(_value: unknown, row: unknown) {
  const data = row as Track;
  const wrap = document.createElement('div');
  wrap.className = 'musicstreaming-duration-cell';
  if (data.saved) {
    wrap.appendChild(
      modusHost('modus-wc-icon', {
        name: 'check_circle',
        size: 'sm',
        variant: 'solid',
        decorative: true,
      }),
    );
  }
  const time = document.createElement('span');
  time.textContent = data.duration;
  wrap.appendChild(time);

  const more = modusHost('modus-wc-button', {
    variant: 'borderless',
    color: 'tertiary',
    shape: 'square',
    size: 'xs',
  });
  more.setAttribute('aria-label', `More actions for ${data.title}`);
  more.appendChild(
    modusHost('modus-wc-icon', { name: 'more_vertical', size: 'xs', decorative: true }),
  );
  more.addEventListener('buttonClick', (event) => {
    event.stopPropagation();
    openAddToPlaylistForTrack(data.id);
  });
  wrap.appendChild(more);
  return wrap;
}

function trackColumns(): ITableColumn[] {
  return [
    {
      id: 'index',
      accessor: 'indexLabel',
      header: '#',
      width: '3.5rem',
      sortable: false,
      cellRenderer: renderIndexCell,
    },
    {
      id: 'title',
      accessor: 'title',
      header: 'Title',
      sortable: true,
      cellRenderer: renderTitleCell,
    },
    { id: 'album', accessor: 'album', header: 'Album', sortable: true },
    { id: 'added', accessor: 'added', header: 'Date added', sortable: true, width: '8rem' },
    {
      id: 'duration',
      accessor: 'duration',
      header: 'Duration',
      sortable: false,
      width: '8rem',
      cellRenderer: renderDurationCell,
    },
  ];
}

export default function MusicStreamingTemplatePage() {
  const [query, setQuery] = useState('');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [showLibrarySearch, setShowLibrarySearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ReadonlySet<LibraryKind>>(() => new Set());
  const [sortBy, setSortBy] = useState<'recents' | 'added' | 'alpha'>('recents');
  const [selectedId, setSelectedId] = useState('liked');
  const [extraPlaylists, setExtraPlaylists] = useState<LibraryItem[]>([]);
  const [draftPlaylistName, setDraftPlaylistName] = useState('');
  const [draftAddPlaylist, setDraftAddPlaylist] = useState('liked');
  const [addTrackId, setAddTrackId] = useState(DEFAULT_TRACK_ID);
  const [playingId, setPlayingId] = useState(DEFAULT_TRACK_ID);
  const [isPlaying, setIsPlaying] = useState(true);
  const [shuffle, setShuffle] = useState(true);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [progress, setProgress] = useState(DEFAULT_PROGRESS_SECONDS);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(true);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [panelsDirection, setPanelsDirection] = useState<ResizablePanelsDirection>('horizontal');

  useEffect(() => {
    document.title = 'Music Streaming';
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(NARROW_LAYOUT_QUERY);
    const update = () => setPanelsDirection(readPanelsDirection());
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    openAddToPlaylistForTrack = (trackId: string) => {
      setAddTrackId(trackId);
      setDraftAddPlaylist(selectedId);
      dialogById(ADD_TO_PLAYLIST_MODAL_ID)?.showModal();
    };
  }, [selectedId]);

  const library = [...LIBRARY_ITEMS, ...extraPlaylists];
  const selected = library.find((item) => item.id === selectedId) ?? library[0];
  const playingTrack =
    TRACKS.find((track) => track.id === playingId) ?? TRACKS.find((track) => track.id === DEFAULT_TRACK_ID)!;

  const filteredLibrary = library.filter((item) => {
    if (activeFilters.size > 0 && !activeFilters.has(item.kind)) return false;
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return true;
    return item.title.toLowerCase().includes(q);
  });
  const visibleLibrary = [...filteredLibrary].sort((a, b) => {
    if (sortBy === 'alpha') return a.title.localeCompare(b.title);
    if (sortBy === 'added') return b.updated.localeCompare(a.updated);
    return 0;
  });

  const playlistTracks = TRACKS.filter((track) => track.playlistId === selected.id);
  const playlistSeconds = playlistTracks.reduce((sum, track) => sum + track.durationSeconds, 0);
  const playlistDurationLabel =
    playlistSeconds === 0
      ? '0 min'
      : playlistSeconds >= 3600
        ? `over ${Math.floor(playlistSeconds / 3600)} hr`
        : `${Math.max(1, Math.round(playlistSeconds / 60))} min`;
  const q = query.trim().toLowerCase();
  const visibleTracks = playlistTracks.filter((track) => {
    if (!q) return true;
    return `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(q);
  });
  const tableRows = visibleTracks.map((track, index) => ({
    ...track,
    indexLabel: String(index + 1),
    isPlaying: track.id === playingId,
    isPaused: track.id === playingId && !isPlaying,
  }));

  const playlistOptions: ISelectOption[] = library
    .filter((item) => item.kind === 'playlist')
    .map((item) => ({ label: item.title, value: item.id }));

  const toggleFilter = (id: LibraryKind) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const playTrack = (trackId: string) => {
    setPlayingId(trackId);
    setIsPlaying(true);
    setProgress(0);
  };

  const playSelectedPlaylist = () => {
    const inPlaylist = playlistTracks.some((track) => track.id === playingId);
    if (inPlaylist) {
      setIsPlaying((prev) => !prev);
      return;
    }
    const first = visibleTracks[0] ?? playlistTracks[0];
    if (first) playTrack(first.id);
  };

  const skipBy = (delta: number) => {
    const list = playlistTracks.length ? playlistTracks : TRACKS.filter((t) => t.playlistId === 'liked');
    const index = list.findIndex((track) => track.id === playingId);
    const next = list[(index + delta + list.length) % list.length];
    if (next) playTrack(next.id);
  };

  const cycleRepeat = () => {
    setRepeat((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const openCreatePlaylist = () => {
    setDraftPlaylistName('');
    dialogById(CREATE_PLAYLIST_MODAL_ID)?.showModal();
  };

  const closeCreatePlaylist = () => {
    dialogById(CREATE_PLAYLIST_MODAL_ID)?.close();
  };

  const saveCreatePlaylist = () => {
    const title = draftPlaylistName.trim();
    if (!title) return;
    const id = `playlist-${crypto.randomUUID()}`;
    setExtraPlaylists((prev) => [
      ...prev,
      {
        id,
        title,
        kind: 'playlist',
        meta: 'Playlist • 0 songs',
        art: 'mix',
        updated: '2026-08-25',
      },
    ]);
    setSelectedId(id);
    closeCreatePlaylist();
  };

  const closeAddToPlaylist = () => {
    dialogById(ADD_TO_PLAYLIST_MODAL_ID)?.close();
  };

  const saveAddToPlaylist = () => {
    closeAddToPlaylist();
  };

  const addTrack = TRACKS.find((track) => track.id === addTrackId);

  return (
    <div className="musicstreaming-page flex min-h-0 min-w-0 flex-1 flex-col bg-(--modus-wc-color-base-page)">
      {/* Header: mark, home, search, browse, install, notifications, people, account + theme */}
      <header className="musicstreaming-header px-4 sm:px-6">
        <div className="musicstreaming-header-start">
          <span className="musicstreaming-mark" aria-hidden="true">
            <ModusWcIcon name="headset" size="md" decorative />
          </span>
          <ModusWcTypography
            hierarchy="h1"
            size="md"
            weight="semibold"
            label="Music Streaming"
            customClass="musicstreaming-sr-only"
          />
        </div>
        <div className="musicstreaming-header-center">
          <ModusWcTooltip content="Home" position="bottom">
            <ModusWcButton
              variant="filled"
              color="tertiary"
              shape="circle"
              size="sm"
              aria-label="Home"
              customClass="musicstreaming-header-action"
              onButtonClick={() => {
                setSelectedId('liked');
                setQuery('');
              }}
            >
              <ModusWcIcon name="home" size="xs" variant="solid" decorative />
            </ModusWcButton>
          </ModusWcTooltip>
          <ModusWcTextInput
            type="search"
            size="sm"
            includeSearch
            inputId={HEADER_SEARCH_ID}
            placeholder="What do you want to play?"
            aria-label="What do you want to play?"
            value={query}
            customClass="musicstreaming-header-search"
            onInputChange={(event: CustomEvent<InputEvent>) => setQuery(readInputString(event))}
          />
          <ModusWcTooltip content="Browse" position="bottom">
            <ModusWcButton
              variant="filled"
              color="tertiary"
              shape="circle"
              size="sm"
              aria-label="Browse"
              customClass="musicstreaming-header-action"
              onButtonClick={() => {
                setShowLibrarySearch(true);
                requestAnimationFrame(() => {
                  document.getElementById(LIBRARY_SEARCH_ID)?.focus();
                });
              }}
            >
              <ModusWcIcon name="folder_open" size="xs" decorative />
            </ModusWcButton>
          </ModusWcTooltip>
        </div>
        <div className="musicstreaming-header-end">
          <ModusWcButton variant="outlined" color="tertiary" size="sm" shape="ellipse">
            <ModusWcIcon name="download" size="xs" decorative />
            Install app
          </ModusWcButton>
          <ModusWcDropdownMenu
            buttonAriaLabel="Notifications"
            buttonColor="tertiary"
            buttonShape="circle"
            buttonSize="sm"
            buttonVariant="filled"
            customClass="musicstreaming-header-action"
            menuPlacement="bottom-end"
            menuStrategy="fixed"
          >
            <div slot="button" className="flex items-center">
              <ModusWcIcon name="notifications" size="sm" variant="solid" decorative />
            </div>
            <div slot="menu">
              <ModusWcMenuItem disabled label="No new notifications" value="none" />
            </div>
          </ModusWcDropdownMenu>
          <ModusWcDropdownMenu
            buttonAriaLabel="What's new"
            buttonColor="tertiary"
            buttonShape="circle"
            buttonSize="sm"
            buttonVariant="filled"
            customClass="musicstreaming-header-action"
            menuPlacement="bottom-end"
            menuStrategy="fixed"
          >
            <div slot="button" className="flex items-center">
              <ModusWcIcon name="people_group" size="sm" decorative />
            </div>
            <div slot="menu">
              <ModusWcMenuItem
                label="Friend activity"
                value="friends"
                onItemSelect={closeMenuFromEvent}
              />
              <ModusWcMenuItem
                label="New releases"
                value="releases"
                onItemSelect={closeMenuFromEvent}
              />
            </div>
          </ModusWcDropdownMenu>
          <ModusWcDropdownMenu
            buttonAriaLabel={MUSIC_USER.name}
            buttonColor="tertiary"
            buttonShape="circle"
            buttonSize="sm"
            buttonVariant="filled"
            customClass="musicstreaming-header-action"
            menuPlacement="bottom-end"
            menuStrategy="fixed"
          >
            <div slot="button" className="flex items-center">
              <ModusWcAvatar initials={MUSIC_USER.initials} size="xs" shape="circle" alt="" />
            </div>
            <div slot="menu">
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <ModusWcTypography hierarchy="p" size="sm" label="Theme" />
                <ModusWcThemeSwitcher />
              </div>
              <ModusWcMenuItem
                label="Profile"
                value="profile"
                onItemSelect={closeMenuFromEvent}
              />
              <ModusWcMenuItem
                label="Sign out"
                value="sign-out"
                onItemSelect={closeMenuFromEvent}
              />
            </div>
          </ModusWcDropdownMenu>
        </div>
      </header>

      {/* Workspace: 1–3 cards, Modus handles, stacks when N × 300px does not fit */}
      <ResizablePanels direction={panelsDirection} className="musicstreaming-columns px-4 sm:px-6">
        {/* Library: filters, search, sortable list of playlists / artists / albums / podcasts */}
        <div className="min-h-0 min-w-0">
        <ModusWcCard
          bordered={true}
          padding="compact"
          className="h-full min-h-0 w-full"
          customClass="musicstreaming-panel"
        >
          <div
            slot="title"
            className="mb-2 flex w-full min-w-0 items-center justify-between gap-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <ModusWcIcon name="view_list" decorative />
              <ModusWcTypography
                hierarchy="h2"
                size="md"
                weight="semibold"
                label="Your library"
              />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <ModusWcDropdownMenu
                buttonAriaLabel="Create"
                buttonColor="tertiary"
                buttonShape="square"
                buttonSize="xs"
                buttonVariant="borderless"
                menuPlacement="bottom-end"
                menuStrategy="fixed"
              >
                <div slot="button" className="flex items-center">
                  <ModusWcIcon name="add" size="xs" decorative />
                </div>
                <div slot="menu">
                  <ModusWcMenuItem
                    label="New playlist"
                    value="playlist"
                    onItemSelect={(event) => {
                      closeMenuFromEvent(event);
                      openCreatePlaylist();
                    }}
                  />
                </div>
              </ModusWcDropdownMenu>
              <ModusWcButton
                variant="borderless"
                color="tertiary"
                shape="square"
                size="xs"
                aria-label={showNowPlaying ? 'Expand library' : 'Show now playing'}
                onButtonClick={() => setShowNowPlaying((prev) => !prev)}
              >
                <ModusWcIcon name="expand" size="xs" decorative />
              </ModusWcButton>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div
              role="group"
              aria-label="Filter library"
              className="flex flex-wrap items-center gap-2"
            >
              {LIBRARY_FILTERS.map((filter) => {
                const active = activeFilters.has(filter.id);
                return (
                  <ModusWcChip
                    key={filter.id}
                    label={filter.label}
                    size="sm"
                    active={active}
                    variant={active ? 'filled' : 'outline'}
                    showRemove={active}
                    aria-label={active ? `${filter.label} filter, active` : `${filter.label} filter`}
                    onChipClick={() => toggleFilter(filter.id)}
                    onChipRemove={() => toggleFilter(filter.id)}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2">
              <ModusWcButton
                variant="borderless"
                color="tertiary"
                shape="square"
                size="sm"
                aria-label={showLibrarySearch ? 'Hide library search' : 'Search library'}
                pressed={showLibrarySearch}
                onButtonClick={() => {
                  setShowLibrarySearch((prev) => {
                    const next = !prev;
                    if (next) {
                      requestAnimationFrame(() => {
                        document.getElementById(LIBRARY_SEARCH_ID)?.focus();
                      });
                    } else {
                      setLibraryQuery('');
                    }
                    return next;
                  });
                }}
              >
                <ModusWcIcon name="search" size="xs" decorative />
              </ModusWcButton>
              <ModusWcDropdownMenu
                buttonAriaLabel="Sort library"
                buttonColor="tertiary"
                buttonSize="sm"
                buttonVariant="borderless"
                menuPlacement="bottom-end"
                menuStrategy="fixed"
              >
                <div slot="button" className="flex items-center gap-1">
                  {SORT_LABEL[sortBy]}
                  <ModusWcIcon name="sort" size="xs" decorative />
                </div>
                <div slot="menu">
                  <ModusWcMenuItem
                    label="Recents"
                    value="recents"
                    selected={sortBy === 'recents'}
                    onItemSelect={(event) => {
                      closeMenuFromEvent(event);
                      setSortBy('recents');
                    }}
                  />
                  <ModusWcMenuItem
                    label="Recently added"
                    value="added"
                    selected={sortBy === 'added'}
                    onItemSelect={(event) => {
                      closeMenuFromEvent(event);
                      setSortBy('added');
                    }}
                  />
                  <ModusWcMenuItem
                    label="Alphabetical"
                    value="alpha"
                    selected={sortBy === 'alpha'}
                    onItemSelect={(event) => {
                      closeMenuFromEvent(event);
                      setSortBy('alpha');
                    }}
                  />
                </div>
              </ModusWcDropdownMenu>
            </div>
            <div hidden={!showLibrarySearch} className="musicstreaming-toggle musicstreaming-library-search">
              <ModusWcTextInput
                type="search"
                size="sm"
                includeSearch
                inputId={LIBRARY_SEARCH_ID}
                placeholder="Search in your library"
                aria-label="Search in your library"
                value={libraryQuery}
                onInputChange={(event: CustomEvent<InputEvent>) =>
                  setLibraryQuery(readInputString(event))
                }
              />
            </div>
            <div
              hidden={visibleLibrary.length === 0}
              className="musicstreaming-toggle musicstreaming-library-scroll"
            >
              <ul className="musicstreaming-library-list">
                {visibleLibrary.map((item) => (
                  <li key={item.id}>
                    <ModusWcLink
                      customClass={
                        item.id === selected.id
                          ? 'musicstreaming-library-row musicstreaming-library-row--active'
                          : 'musicstreaming-library-row'
                      }
                      color="inherit"
                      underline="none"
                      href={`#library-${item.id}`}
                      aria-current={item.id === selected.id ? 'page' : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedId(item.id);
                      }}
                    >
                      <span className={`musicstreaming-thumb musicstreaming-thumb--${item.art}`}>
                        <ModusWcIcon
                          name={ART_ICON[item.art]}
                          size="sm"
                          variant={item.art === 'liked' ? 'solid' : 'outlined'}
                          decorative
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <ModusWcTypography
                          hierarchy="p"
                          size="sm"
                          weight="semibold"
                          label={item.title}
                        />
                        <span className="musicstreaming-library-meta">
                          {item.pinned ? (
                            <ModusWcIcon name="pin" size="xs" variant="solid" decorative />
                          ) : null}
                          <ModusWcTypography
                            hierarchy="p"
                            size="xs"
                            label={item.meta}
                            customClass="musicstreaming-muted"
                          />
                        </span>
                      </span>
                    </ModusWcLink>
                  </li>
                ))}
              </ul>
            </div>
            <div hidden={visibleLibrary.length > 0} className="musicstreaming-toggle py-4">
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                label="No items match these filters."
                customClass="musicstreaming-muted"
              />
            </div>
            <div className="musicstreaming-miniplayer">
              <span className={`musicstreaming-thumb musicstreaming-thumb--${playingTrack.art}`}>
                <ModusWcIcon
                  name={ART_ICON[playingTrack.art]}
                  size="sm"
                  decorative
                />
              </span>
              <span className="min-w-0 flex-1">
                <ModusWcTypography
                  hierarchy="p"
                  size="sm"
                  weight="semibold"
                  label={playingTrack.title}
                />
                <ModusWcTypography
                  hierarchy="p"
                  size="xs"
                  label={playingTrack.artist}
                  customClass="musicstreaming-muted"
                />
              </span>
              <ModusWcIcon name="check_circle" size="sm" variant="solid" decorative />
            </div>
          </div>
        </ModusWcCard>
        </div>

        {/* Playlist hero, transport, and track table */}
        <main id="main-content" className="musicstreaming-main min-w-0">
          <ModusWcCard
            bordered={true}
            padding="comfortable"
            className="h-full min-h-0 w-full"
            customClass="musicstreaming-panel"
          >
            <div className="musicstreaming-playlist">
            <section className="musicstreaming-hero" aria-label={selected.title}>
              <span className={`musicstreaming-hero-art musicstreaming-thumb--${selected.art}`}>
                <ModusWcIcon
                  name={ART_ICON[selected.art]}
                  size="lg"
                  variant={selected.art === 'liked' ? 'solid' : 'outlined'}
                  decorative
                />
              </span>
              <div className="musicstreaming-hero-copy">
                <ModusWcTypography
                  hierarchy="p"
                  size="sm"
                  label={KIND_LABEL[selected.kind]}
                  customClass="musicstreaming-muted"
                />
                <ModusWcTypography
                  hierarchy="h2"
                  size="4xl"
                  weight="bold"
                  label={selected.title}
                  customClass="musicstreaming-hero-title"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ModusWcAvatar
                    initials={MUSIC_USER.initials}
                    size="xs"
                    shape="circle"
                    alt=""
                  />
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    label={`${MUSIC_USER.name} • ${playlistTracks.length} songs, ${playlistDurationLabel}`}
                  />
                </div>
              </div>
            </section>

            <div className="musicstreaming-actions">
              <div className="flex flex-wrap items-center gap-2">
                <ModusWcButton
                  variant="filled"
                  color="primary"
                  shape="circle"
                  size="lg"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  onButtonClick={playSelectedPlaylist}
                >
                  <ModusWcIcon
                    name={isPlaying ? 'pause_circle' : 'play_circle'}
                    size="md"
                    variant="solid"
                    decorative
                  />
                </ModusWcButton>
                <ModusWcTooltip content="Shuffle" position="top">
                  <ModusWcButton
                    variant="borderless"
                    color="tertiary"
                    shape="square"
                    size="sm"
                    aria-label="Shuffle"
                    pressed={shuffle}
                    onButtonClick={() => setShuffle((prev) => !prev)}
                  >
                    <ModusWcIcon name="mix" size="xs" decorative />
                  </ModusWcButton>
                </ModusWcTooltip>
                <ModusWcTooltip content="Download" position="top">
                  <ModusWcButton
                    variant="borderless"
                    color="tertiary"
                    shape="square"
                    size="sm"
                    aria-label="Download"
                  >
                    <ModusWcIcon name="download" size="xs" decorative />
                  </ModusWcButton>
                </ModusWcTooltip>
              </div>
              <ModusWcDropdownMenu
                buttonAriaLabel="View options"
                buttonColor="tertiary"
                buttonSize="sm"
                buttonVariant="borderless"
                menuPlacement="bottom-end"
                menuStrategy="fixed"
              >
                <div slot="button" className="flex items-center gap-1">
                  List
                  <ModusWcIcon name="view_list" size="xs" decorative />
                </div>
                <div slot="menu">
                  <ModusWcMenuItem
                    label="List"
                    value="list"
                    selected={density === 'comfortable'}
                    onItemSelect={(event) => {
                      closeMenuFromEvent(event);
                      setDensity('comfortable');
                    }}
                  />
                  <ModusWcMenuItem
                    label="Compact"
                    value="compact"
                    selected={density === 'compact'}
                    onItemSelect={(event) => {
                      closeMenuFromEvent(event);
                      setDensity('compact');
                    }}
                  />
                </div>
              </ModusWcDropdownMenu>
            </div>

            <div className="min-w-0">
              <div hidden={visibleTracks.length === 0} className="musicstreaming-toggle min-w-0">
              <ModusWcTable
                columns={trackColumns()}
                data={tableRows}
                zebra
                hover
                sortable
                density={density}
                selectable="none"
                caption={`${selected.title} tracks`}
                onRowClick={(event: CustomEvent<{ row: Record<string, unknown> }>) => {
                  const id = String(event.detail.row.id ?? '');
                  if (id) playTrack(id);
                }}
              />
              </div>
              <div hidden={visibleTracks.length > 0} className="musicstreaming-toggle py-6">
              <ModusWcTypography
                hierarchy="p"
                size="md"
                label="No tracks in this view. Try another filter or playlist."
                customClass="musicstreaming-muted"
              />
              </div>
            </div>
            </div>
          </ModusWcCard>
        </main>

        {/* Now playing: artwork, metadata, related videos */}
        <div hidden={!showNowPlaying} className="musicstreaming-now min-w-0">
          <ModusWcCard
            bordered={true}
            padding="compact"
            className="h-full min-h-0 w-full"
            customClass="musicstreaming-panel"
          >
            <div
              slot="title"
              className="mb-4 flex w-full min-w-0 items-center justify-between gap-3"
            >
              <ModusWcTypography
                hierarchy="h2"
                size="md"
                weight="semibold"
                label={selected.title}
              />
              <ModusWcButton
                variant="borderless"
                color="tertiary"
                shape="square"
                size="xs"
                aria-label="Close now playing"
                onButtonClick={() => setShowNowPlaying(false)}
              >
                <ModusWcIcon name="close" size="xs" decorative />
              </ModusWcButton>
            </div>
            <div className="flex flex-col gap-3">
              <div className={`musicstreaming-now-art musicstreaming-thumb--${playingTrack.art}`}>
                <ModusWcIcon
                  name={ART_ICON[playingTrack.art]}
                  size="lg"
                  decorative
                />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <ModusWcTypography
                    hierarchy="h3"
                    size="lg"
                    weight="semibold"
                    label={playingTrack.title}
                  />
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    label={playingTrack.artist}
                    customClass="musicstreaming-muted"
                  />
                </div>
                <ModusWcIcon name="check_circle" size="sm" variant="solid" decorative />
              </div>
              <ModusWcTypography
                hierarchy="h3"
                size="sm"
                weight="semibold"
                label="Related music videos"
              />
              {RELATED_VIDEOS.map((video) => (
                <ModusWcCard key={video.id} bordered={false} padding="compact" layout="horizontal">
                  <ModusWcLink
                    customClass="musicstreaming-video-row"
                    color="inherit"
                    underline="none"
                    href={video.href}
                  >
                    <span className={`musicstreaming-thumb musicstreaming-thumb--${video.art}`}>
                      <ModusWcIcon name="video" size="sm" decorative />
                    </span>
                    <ModusWcTypography hierarchy="p" size="sm" weight="semibold" label={video.title} />
                  </ModusWcLink>
                </ModusWcCard>
              ))}
            </div>
          </ModusWcCard>
        </div>
      </ResizablePanels>

      {/* Playback footer: now playing, transport + slider, volume and view controls */}
      <footer className="musicstreaming-footer px-4 sm:px-6">
        <div className="musicstreaming-now-track">
          <span className={`musicstreaming-thumb musicstreaming-thumb--${playingTrack.art}`}>
            <ModusWcIcon name={ART_ICON[playingTrack.art]} size="sm" decorative />
          </span>
          <span className="min-w-0">
            <ModusWcTypography
              hierarchy="p"
              size="sm"
              weight="semibold"
              label={playingTrack.title}
            />
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              label={playingTrack.artist}
              customClass="musicstreaming-muted"
            />
          </span>
          <ModusWcIcon name="check_circle" size="sm" variant="solid" decorative />
        </div>
        <div className="musicstreaming-transport">
          <div className="flex items-center justify-center gap-1">
            <ModusWcTooltip content="Shuffle" position="top">
              <ModusWcButton
                variant="borderless"
                color="tertiary"
                shape="square"
                size="sm"
                aria-label="Shuffle"
                pressed={shuffle}
                onButtonClick={() => setShuffle((prev) => !prev)}
              >
                <ModusWcIcon name="mix" size="xs" decorative />
              </ModusWcButton>
            </ModusWcTooltip>
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label="Previous"
              onButtonClick={() => skipBy(-1)}
            >
              <ModusWcIcon name="fast_rewind" size="xs" decorative />
            </ModusWcButton>
            <ModusWcButton
              variant="filled"
              color="primary"
              shape="circle"
              size="sm"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onButtonClick={() => setIsPlaying((prev) => !prev)}
            >
              <ModusWcIcon
                name={isPlaying ? 'pause_circle' : 'play_circle'}
                size="xs"
                variant="solid"
                decorative
              />
            </ModusWcButton>
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label="Next"
              onButtonClick={() => skipBy(1)}
            >
              <ModusWcIcon name="fast_forward" size="xs" decorative />
            </ModusWcButton>
            <ModusWcTooltip
              content={repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat'}
              position="top"
            >
              <ModusWcButton
                variant="borderless"
                color="tertiary"
                shape="square"
                size="sm"
                aria-label={
                  repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat'
                }
                pressed={repeat !== 'off'}
                onButtonClick={cycleRepeat}
              >
                <ModusWcIcon name={repeat === 'off' ? 'sync_off' : 'sync'} size="xs" decorative />
              </ModusWcButton>
            </ModusWcTooltip>
          </div>
          <div className="musicstreaming-progress">
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              label={formatTime(progress)}
              customClass="musicstreaming-muted"
            />
            <ModusWcSlider
              inputId="musicstreaming-progress"
              aria-label="Playback position"
              min={0}
              max={playingTrack.durationSeconds}
              step={1}
              size="sm"
              value={progress}
              customClass="musicstreaming-slider"
              onInputChange={(event: CustomEvent<InputEvent>) => setProgress(readInputNumber(event))}
            />
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              label={playingTrack.duration}
              customClass="musicstreaming-muted"
            />
          </div>
        </div>
        <div className="musicstreaming-extras">
          <ModusWcTooltip content="Now playing view" position="top">
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label="Now playing view"
              pressed={showNowPlaying}
              onButtonClick={() => setShowNowPlaying((prev) => !prev)}
            >
              <ModusWcIcon name="window_side_panel" size="xs" decorative />
            </ModusWcButton>
          </ModusWcTooltip>
          <ModusWcTooltip content="Lyrics" position="top">
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label="Lyrics"
            >
              <ModusWcIcon name="mic" size="xs" decorative />
            </ModusWcButton>
          </ModusWcTooltip>
          <ModusWcDropdownMenu
            buttonAriaLabel="Queue"
            buttonColor="tertiary"
            buttonShape="square"
            buttonSize="sm"
            buttonVariant="borderless"
            menuPlacement="top-end"
            menuStrategy="fixed"
          >
            <div slot="button" className="flex items-center">
              <ModusWcIcon name="view_list" size="xs" decorative />
            </div>
            <div slot="menu">
              <ModusWcMenuItem
                hidden={playlistTracks.length > 0}
                disabled
                label="No tracks in this playlist"
                value="empty"
              />
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const track = playlistTracks[index];
                return (
                  <ModusWcMenuItem
                    key={`queue-${index}`}
                    hidden={!track}
                    label={track?.title ?? `Track ${index + 1}`}
                    value={track?.id ?? `queue-${index}`}
                    selected={Boolean(track) && track.id === playingId}
                    onItemSelect={(event) => {
                      closeMenuFromEvent(event);
                      if (track) playTrack(track.id);
                    }}
                  />
                );
              })}
            </div>
          </ModusWcDropdownMenu>
          <ModusWcTooltip content="Connect to a device" position="top">
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label="Connect to a device"
            >
              <ModusWcIcon name="in_field_device" size="xs" decorative />
            </ModusWcButton>
          </ModusWcTooltip>
          <div className="musicstreaming-volume">
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label={muted ? 'Unmute' : 'Mute'}
              onButtonClick={() => setMuted((prev) => !prev)}
            >
              <ModusWcIcon name={muted || volume === 0 ? 'volume_mute' : 'volume_up'} size="xs" decorative />
            </ModusWcButton>
            <ModusWcSlider
              inputId="musicstreaming-volume"
              aria-label="Volume"
              min={0}
              max={100}
              step={1}
              size="sm"
              value={muted ? 0 : volume}
              customClass="musicstreaming-slider musicstreaming-slider--volume"
              onInputChange={(event: CustomEvent<InputEvent>) => {
                const next = readInputNumber(event);
                setVolume(next);
                setMuted(next === 0);
              }}
            />
          </div>
          <ModusWcTooltip content="Miniplayer" position="top">
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label="Miniplayer"
            >
              <ModusWcIcon name="window_dock_undock" size="xs" decorative />
            </ModusWcButton>
          </ModusWcTooltip>
          <ModusWcTooltip content="Full screen" position="top">
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="square"
              size="sm"
              aria-label="Full screen"
              onButtonClick={() => {
                if (document.fullscreenElement) {
                  void document.exitFullscreen();
                } else {
                  void document.documentElement.requestFullscreen();
                }
              }}
            >
              <ModusWcIcon name="expand" size="xs" decorative />
            </ModusWcButton>
          </ModusWcTooltip>
        </div>
      </footer>

      {/* Create playlist: name required */}
      <ModusWcModal
        modalId={CREATE_PLAYLIST_MODAL_ID}
        backdrop="default"
        position="center"
        showClose
        aria-label="Create playlist"
      >
        <span slot="header">Create playlist</span>
        <div slot="content" className="flex flex-col gap-3">
          <ModusWcTextInput
            label="Playlist name"
            name="playlist-name"
            inputId="musicstreaming-playlist-name"
            required
            value={draftPlaylistName}
            onInputChange={(event: CustomEvent<InputEvent>) =>
              setDraftPlaylistName(readInputString(event))
            }
          />
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            variant="outlined"
            color="tertiary"
            size="sm"
            onButtonClick={closeCreatePlaylist}
          >
            Cancel
          </ModusWcButton>
          <ModusWcButton
            variant="filled"
            color="primary"
            size="sm"
            disabled={!draftPlaylistName.trim()}
            onButtonClick={saveCreatePlaylist}
          >
            <ModusWcIcon name="add" size="xs" decorative />
            Add
          </ModusWcButton>
        </div>
      </ModusWcModal>

      {/* Add to playlist: pick an existing playlist */}
      <ModusWcModal
        modalId={ADD_TO_PLAYLIST_MODAL_ID}
        backdrop="default"
        position="center"
        showClose
        aria-label="Add to playlist"
      >
        <span slot="header">Add to playlist</span>
        <div slot="content" className="flex flex-col gap-3">
          <ModusWcTypography
            hierarchy="p"
            size="md"
            label={addTrack ? `Add ${addTrack.title} to a playlist.` : 'Choose a playlist.'}
          />
          <ModusWcSelect
            label="Playlist"
            name="add-playlist"
            inputId="musicstreaming-add-playlist"
            size="sm"
            options={playlistOptions}
            value={draftAddPlaylist}
            onInputChange={(event: CustomEvent<InputEvent>) =>
              setDraftAddPlaylist(readInputString(event))
            }
          />
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            variant="outlined"
            color="tertiary"
            size="sm"
            onButtonClick={closeAddToPlaylist}
          >
            Cancel
          </ModusWcButton>
          <ModusWcButton
            variant="filled"
            color="primary"
            size="sm"
            onButtonClick={saveAddToPlaylist}
          >
            <ModusWcIcon name="add" size="xs" decorative />
            Add
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </div>
  );
}
