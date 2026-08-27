import { useEffect, useState } from 'react';
import {
  ModusWcButton,
  ModusWcCard,
  ModusWcDropdownMenu,
  ModusWcIcon,
  ModusWcLink,
  ModusWcLogo,
  ModusWcMenuItem,
  ModusWcModal,
  ModusWcSwitch,
  ModusWcTextInput,
  ModusWcThemeSwitcher,
  ModusWcTooltip,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import { PORTAL_FILES, PORTAL_MEETINGS, PORTAL_SHORTCUTS, type PortalShortcut } from './portal';
import { readInputChecked, readInputString } from '../../lib/modusFormEvents';
import './PortalTemplatePage.css';

const CUSTOMIZE_MODAL_ID = 'portal-customize-modal';
const ADD_SHORTCUT_MODAL_ID = 'portal-add-shortcut-modal';
const SEARCH_INPUT_ID = 'portal-ask-trimble';
const USER = {
  name: 'Alex Rivera',
};
const APP_MENU_ITEMS = [
  { label: 'Mail', value: 'mail' },
  { label: 'Images', value: 'images' },
  { label: 'Connect', value: 'connect' },
] as const;


/** Close a Modus dropdown after a menu item is selected. */
function closeMenuFromEvent(event: CustomEvent) {
  const trigger = (event.target as HTMLElement | null)?.closest('modus-wc-dropdown-menu');
  if (trigger) {
    (trigger as HTMLElement & { menuVisible: boolean }).menuVisible = false;
  }
}

function dialogById(id: string) {
  return document.getElementById(id) as HTMLDialogElement | null;
}

export default function PortalTemplatePage() {
  const [query, setQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [shortcuts, setShortcuts] = useState(PORTAL_SHORTCUTS);
  const [draftShortcutName, setDraftShortcutName] = useState('');
  const [draftShortcutUrl, setDraftShortcutUrl] = useState('');
  const [showRecentFiles, setShowRecentFiles] = useState(true);
  const [draftShowRecentFiles, setDraftShowRecentFiles] = useState(true);
  const [showCalendar, setShowCalendar] = useState(true);
  const [draftShowCalendar, setDraftShowCalendar] = useState(true);

  useEffect(() => {
    document.title = 'Portal';
  }, []);

  const openCustomize = () => {
    setDraftShowRecentFiles(showRecentFiles);
    setDraftShowCalendar(showCalendar);
    dialogById(CUSTOMIZE_MODAL_ID)?.showModal();
  };

  const closeCustomize = () => {
    dialogById(CUSTOMIZE_MODAL_ID)?.close();
  };

  const openAddShortcut = () => {
    setDraftShortcutName('');
    setDraftShortcutUrl('');
    dialogById(ADD_SHORTCUT_MODAL_ID)?.showModal();
  };

  const closeAddShortcut = () => {
    dialogById(ADD_SHORTCUT_MODAL_ID)?.close();
  };

  const saveAddShortcut = () => {
    const label = draftShortcutName.trim();
    if (!label) return;
    const next: PortalShortcut = {
      id: `shortcut-${crypto.randomUUID()}`,
      label,
      icon: 'web',
      href: draftShortcutUrl.trim() || undefined,
    };
    setShortcuts((prev) => [...prev, next]);
    closeAddShortcut();
  };

  const saveCustomize = () => {
    setShowRecentFiles(draftShowRecentFiles);
    setShowCalendar(draftShowCalendar);
    closeCustomize();
  };

  return (
    <div className="portal-page flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-(--modus-wc-color-base-page)">
      {/* Header: search jump, notifications, apps, account + theme */}
      <header className="flex w-full shrink-0 items-center justify-end px-4 py-3 sm:px-6">
        <div className="portal-header-actions">
          <ModusWcButton
            variant="filled"
            color="tertiary"
            shape="square"
            size="sm"
            aria-label="Search"
            customClass="portal-header-action"
            onButtonClick={() => {
              requestAnimationFrame(() => {
                document.getElementById(SEARCH_INPUT_ID)?.focus();
              });
            }}
          >
            <ModusWcIcon name="search" size="sm" decorative />
          </ModusWcButton>
          <ModusWcDropdownMenu
            buttonAriaLabel="Notifications"
            buttonColor="tertiary"
            buttonShape="square"
            buttonSize="sm"
            buttonVariant="filled"
            customClass="portal-header-action"
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
            buttonAriaLabel="Apps"
            buttonColor="tertiary"
            buttonShape="square"
            buttonSize="sm"
            buttonVariant="filled"
            customClass="portal-header-action"
            menuPlacement="bottom-end"
            menuStrategy="fixed"
          >
            <div slot="button" className="flex items-center">
              <ModusWcIcon name="apps" size="sm" decorative />
            </div>
            <div slot="menu">
              {APP_MENU_ITEMS.map((item) => (
                <ModusWcMenuItem
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  onItemSelect={closeMenuFromEvent}
                />
              ))}
            </div>
          </ModusWcDropdownMenu>
          <ModusWcDropdownMenu
            buttonAriaLabel={USER.name}
            buttonColor="tertiary"
            buttonShape="circle"
            buttonSize="sm"
            buttonVariant="filled"
            customClass="portal-header-action"
            menuPlacement="bottom-end"
            menuStrategy="fixed"
          >
            <div slot="button" className="flex items-center">
              <ModusWcIcon name="person" size="sm" variant="solid" decorative />
            </div>
            <div slot="menu">
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <ModusWcTypography hierarchy="p" size="sm" label="Theme" />
                <ModusWcThemeSwitcher />
              </div>
              <ModusWcMenuItem
                label="Sign out"
                value="sign-out"
                onItemSelect={closeMenuFromEvent}
              />
            </div>
          </ModusWcDropdownMenu>
        </div>
      </header>

      <main className="flex min-h-0 w-full flex-1 flex-col items-center px-4 pb-24 sm:px-6">
        <ModusWcTypography
          hierarchy="h1"
          size="md"
          weight="semibold"
          label="Portal"
          customClass="portal-sr-only"
        />

        <div className="flex w-full flex-col items-center gap-8 py-6">
          {/* Hero mark — page title stays on the visually hidden h1 above */}
          <ModusWcLogo name="trimble" alt="Trimble" customClass="portal-logo" />

          {/* Ask Trimble search pill */}
          <div className="portal-search w-full max-w-3xl">
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              shape="circle"
              size="sm"
              aria-label="Add"
            >
              <ModusWcIcon name="add" size="sm" decorative />
            </ModusWcButton>
            <ModusWcTextInput
              type="search"
              size="lg"
              bordered={false}
              inputId={SEARCH_INPUT_ID}
              placeholder="Ask Trimble"
              aria-label="Ask Trimble"
              value={query}
              customClass="portal-search-input"
              onInputChange={(event: CustomEvent<InputEvent>) => setQuery(readInputString(event))}
            />
            <div className="portal-search-actions">
              <ModusWcTooltip
                content="Voice search"
                customClass="portal-search-tooltip"
                position="bottom"
              >
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  aria-label="Voice search"
                >
                  <ModusWcIcon name="mic" size="sm" decorative />
                </ModusWcButton>
              </ModusWcTooltip>
              <ModusWcTooltip
                content="Search by image"
                customClass="portal-search-tooltip"
                position="bottom"
              >
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  aria-label="Search by image"
                >
                  <ModusWcIcon name="camera" size="sm" decorative />
                </ModusWcButton>
              </ModusWcTooltip>
              <ModusWcButton variant="outlined" color="tertiary" shape="ellipse" size="sm">
                <ModusWcIcon name="stars" size="sm" decorative />
                AI Mode
              </ModusWcButton>
            </div>
          </div>

          {/* Shortcuts: extras stay mounted and use hidden (do not remount) */}
          <nav aria-label="Shortcuts" className="flex flex-wrap items-start justify-center gap-6">
            {shortcuts.map((shortcut) => {
              const extraHidden = Boolean(shortcut.extra) && !showMore;
              return (
                <div
                  key={shortcut.id}
                  hidden={extraHidden}
                  className="flex flex-col items-center gap-2"
                >
                  <ModusWcButton
                    variant="borderless"
                    color="tertiary"
                    shape="circle"
                    size="lg"
                    aria-label={shortcut.label}
                    customClass="portal-shortcut"
                    onButtonClick={() => {
                      if (shortcut.href) {
                        window.open(shortcut.href, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    {shortcut.emblem ? (
                      <ModusWcLogo name="trimble" emblem alt="" customClass="portal-shortcut-emblem" />
                    ) : (
                      <ModusWcIcon name={shortcut.icon ?? 'apps'} size="md" decorative />
                    )}
                  </ModusWcButton>
                  <ModusWcTypography hierarchy="p" size="sm" label={shortcut.label} />
                </div>
              );
            })}
            <div hidden={!showMore} className="flex flex-col items-center gap-2">
              <ModusWcButton
                variant="borderless"
                color="tertiary"
                shape="circle"
                size="lg"
                aria-label="Add shortcut"
                customClass="portal-shortcut"
                onButtonClick={openAddShortcut}
              >
                <ModusWcIcon name="add" size="md" decorative />
              </ModusWcButton>
              <ModusWcTypography hierarchy="p" size="sm" label="Add shortcut" />
            </div>
            <div
              className={
                showMore
                  ? 'flex w-full flex-col items-center gap-2'
                  : 'flex flex-col items-center gap-2'
              }
            >
              <ModusWcButton
                variant="borderless"
                color="tertiary"
                shape="circle"
                size="lg"
                aria-label={showMore ? 'Show fewer shortcuts' : 'Show more shortcuts'}
                customClass="portal-shortcut"
                onButtonClick={() => setShowMore((prev) => !prev)}
              >
                <ModusWcIcon
                  name={showMore ? 'expand_less_circle' : 'expand_more_circle'}
                  size="md"
                  decorative
                />
              </ModusWcButton>
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                label={showMore ? 'Show less' : 'Show more'}
              />
            </div>
          </nav>

          <div className="flex gap-3 w-full max-w-4xl items-center flex-col md:flex-row md:items-start md:justify-between">
            {/* Calendar */}
            <div hidden={!showCalendar} className="w-full">
              <ModusWcCard bordered={true} padding="compact" customClass="w-full">
                <div
                  slot="title"
                  className="portal-files-title mb-2 flex w-full min-w-0 items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <ModusWcIcon name="calendar" decorative />
                    <ModusWcTypography
                      hierarchy="h2"
                      size="md"
                      weight="semibold"
                      label="Calendar"
                    />
                  </div>
                  <div className="shrink-0">
                    <ModusWcDropdownMenu
                      buttonAriaLabel="Calendar actions"
                      buttonColor="tertiary"
                      buttonShape="square"
                      buttonSize="xs"
                      buttonVariant="borderless"
                      menuPlacement="bottom-end"
                    >
                      <div slot="button" className="flex items-center">
                        <ModusWcIcon name="more_vertical" size="xs" decorative />
                      </div>
                      <div slot="menu">
                        <ModusWcMenuItem
                          label="Open"
                          value="open"
                          onItemSelect={closeMenuFromEvent}
                        />
                        <ModusWcMenuItem
                          label="Hide widget"
                          value="hide"
                          onItemSelect={(event) => {
                            closeMenuFromEvent(event);
                            setShowCalendar(false);
                          }}
                        />
                      </div>
                    </ModusWcDropdownMenu>
                  </div>
                </div>
                <ModusWcCard bordered={false} padding="compact">
                  <ul className="portal-file-list">
                    {PORTAL_MEETINGS.map((meeting) => (
                      <li key={meeting.id}>
                        <ModusWcLink
                          customClass="portal-file-row"
                          color="inherit"
                          underline="none"
                          href={meeting.href}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`portal-file-icon portal-file-icon--audio`}>
                              <ModusWcIcon name="phone" size="sm" decorative />
                            </span>
                            <div className="min-w-0 flex-1">
                              <ModusWcTypography
                                hierarchy="p"
                                size="md"
                                weight="semibold"
                                label={meeting.title}
                              />
                              <ModusWcTypography
                                hierarchy="p"
                                size="sm"
                                label={`${meeting.time} • ${meeting.location}`}
                                customClass="portal-file-meta"
                              />
                            </div>
                          </div>
                        </ModusWcLink>
                      </li>
                    ))}
                  </ul>
                </ModusWcCard>
              </ModusWcCard>
            </div>

            {/* Recent files: parent card + unbordered child card wrapping the ul */}
            <div hidden={!showRecentFiles} className="w-full">
              <ModusWcCard bordered={true} padding="compact" customClass="w-full">
                <div
                  slot="title"
                  className="portal-files-title mb-2 flex w-full min-w-0 items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <ModusWcIcon name="folder_closed" decorative />
                    <ModusWcTypography
                      hierarchy="h2"
                      size="md"
                      weight="semibold"
                      label="Recent files"
                    />
                  </div>
                  <div className="shrink-0">
                    <ModusWcDropdownMenu
                      buttonAriaLabel="Recent files actions"
                      buttonColor="tertiary"
                      buttonShape="square"
                      buttonSize="xs"
                      buttonVariant="borderless"
                      menuPlacement="bottom-end"
                    >
                      <div slot="button" className="flex items-center">
                        <ModusWcIcon name="more_vertical" size="xs" decorative />
                      </div>
                      <div slot="menu">
                        <ModusWcMenuItem
                          label="Open"
                          value="open"
                          onItemSelect={closeMenuFromEvent}
                        />
                        <ModusWcMenuItem
                          label="Hide widget"
                          value="hide"
                          onItemSelect={(event) => {
                            closeMenuFromEvent(event);
                            setShowRecentFiles(false);
                          }}
                        />
                      </div>
                    </ModusWcDropdownMenu>
                  </div>
                </div>
                <ModusWcCard bordered={false} padding="compact">
                  <ul className="portal-file-list">
                    {PORTAL_FILES.map((file) => (
                      <li key={file.id}>
                        <ModusWcLink
                          customClass="portal-file-row"
                          color="inherit"
                          underline="none"
                          href={file.href}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`portal-file-icon portal-file-icon--${file.kind}`}>
                              <ModusWcIcon name={file.icon} size="sm" decorative />
                            </span>
                            <div className="min-w-0 flex-1">
                              <ModusWcTypography
                                hierarchy="p"
                                size="md"
                                weight="semibold"
                                label={file.title}
                              />
                              <ModusWcTypography
                                hierarchy="p"
                                size="sm"
                                label={file.meta}
                                customClass="portal-file-meta"
                              />
                            </div>
                          </div>
                        </ModusWcLink>
                      </li>
                    ))}
                  </ul>
                </ModusWcCard>
              </ModusWcCard>
            </div>
          </div>
        </div>
      </main>

      {/* Customize FAB — opens the widgets modal */}
      <div className="portal-customize">
        <ModusWcButton
          variant="outlined"
          color="tertiary"
          shape="ellipse"
          size="sm"
          onButtonClick={openCustomize}
        >
          <ModusWcIcon name="pencil" size="xs" decorative />
          Customize page
        </ModusWcButton>
      </div>

      {/* Customize: draft switch, then commit on Save */}
      <ModusWcModal
        modalId={CUSTOMIZE_MODAL_ID}
        backdrop="default"
        position="center"
        showClose
        aria-label="Customize page"
      >
        <span slot="header">Customize page</span>
        <div slot="content" className="flex flex-col gap-3">
          <ModusWcTypography
            hierarchy="p"
            size="md"
            label="Choose which widgets appear on your portal."
          />
          <div className="flex flex-col gap-2">
            <ModusWcSwitch
              label="Show recent files"
              name="show-recent-files"
              size="sm"
              value={draftShowRecentFiles}
              onInputChange={(event: CustomEvent<InputEvent>) =>
                setDraftShowRecentFiles(readInputChecked(event))
              }
            />
            <ModusWcSwitch
              label="Show calendar"
              name="show-calendar"
              size="sm"
              value={draftShowCalendar}
              onInputChange={(event: CustomEvent<InputEvent>) =>
                setDraftShowCalendar(readInputChecked(event)) 
              }
            />
          </div>
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            variant="outlined"
            color="tertiary"
            size="sm"
            onButtonClick={closeCustomize}
          >
            Cancel
          </ModusWcButton>
          <ModusWcButton variant="filled" color="primary" size="sm" onButtonClick={saveCustomize}>
            <ModusWcIcon name="check" size="xs" decorative />
            Save
          </ModusWcButton>
        </div>
      </ModusWcModal>

      {/* Add shortcut: name required, URL optional */}
      <ModusWcModal
        modalId={ADD_SHORTCUT_MODAL_ID}
        backdrop="default"
        position="center"
        showClose
        aria-label="Add shortcut"
      >
        <span slot="header">Add shortcut</span>
        <div slot="content" className="flex flex-col gap-3">
          <ModusWcTextInput
            label="Name"
            name="shortcut-name"
            required
            value={draftShortcutName}
            onInputChange={(event: CustomEvent<InputEvent>) =>
              setDraftShortcutName(readInputString(event))
            }
          />
          <ModusWcTextInput
            label="URL"
            name="shortcut-url"
            type="url"
            value={draftShortcutUrl}
            onInputChange={(event: CustomEvent<InputEvent>) =>
              setDraftShortcutUrl(readInputString(event))
            }
          />
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            variant="outlined"
            color="tertiary"
            size="sm"
            onButtonClick={closeAddShortcut}
          >
            Cancel
          </ModusWcButton>
          <ModusWcButton
            variant="filled"
            color="primary"
            size="sm"
            disabled={!draftShortcutName.trim()}
            onButtonClick={saveAddShortcut}
          >
            <ModusWcIcon name="add" size="xs" decorative />
            Add
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </div>
  );
}
