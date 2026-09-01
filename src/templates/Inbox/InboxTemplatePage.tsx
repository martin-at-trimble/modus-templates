import { useEffect, useMemo, useState } from 'react';
import {
  ModusWcAvatar,
  ModusWcBadge,
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcDropdownMenu,
  ModusWcIcon,
  ModusWcLogo,
  ModusWcMenuItem,
  ModusWcModal,
  ModusWcNavbar,
  ModusWcTextInput,
  ModusWcTextarea,
  ModusWcTooltip,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import { readInputChecked, readInputString } from '../../lib/modusFormEvents';
import { useMediaQuery } from '../../lib/useMediaQuery';
import {
  INBOX_FOLDERS,
  INBOX_LABELS,
  INBOX_MESSAGES,
  INBOX_PAGE_SIZE,
  INBOX_TOTAL_COUNT,
  type InboxAppId,
  type InboxFolderId,
  type InboxMessage,
} from './inboxData';
import './InboxTemplatePage.css';

const COMPOSE_MODAL_ID = 'inbox-compose-modal';
const NAVBAR_WIDE_MIN_PX = 768;
const SEARCH_INPUT_ID = 'inbox-search-input';

const APP_RAIL: { id: InboxAppId; label: string; icon: string; badge?: number }[] = [
  { id: 'mail', label: 'Mail', icon: 'email', badge: 1 },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'meet', label: 'Meet', icon: 'video' },
];

const UTILITY_RAIL: { id: string; label: string; icon: string }[] = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'keep', label: 'Keep', icon: 'document' },
  { id: 'tasks', label: 'Tasks', icon: 'check_circle' },
  { id: 'contacts', label: 'Contacts', icon: 'contacts' },
];

function dialogById(id: string) {
  return document.getElementById(id) as HTMLDialogElement | null;
}

function closeMenuFromEvent(event: CustomEvent) {
  const trigger = (event.target as HTMLElement | null)?.closest('modus-wc-dropdown-menu');
  if (trigger) {
    (trigger as HTMLElement & { menuVisible: boolean }).menuVisible = false;
  }
}

export default function InboxTemplatePage() {
  const isWideNavbar = useMediaQuery(`(min-width: ${NAVBAR_WIDE_MIN_PX}px)`);
  const [activeApp, setActiveApp] = useState<InboxAppId>('mail');
  const [activeFolder, setActiveFolder] = useState<InboxFolderId>('inbox');
  const [activeLabelId, setActiveLabelId] = useState<string | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [composeBody, setComposeBody] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeTo, setComposeTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [starredIds, setStarredIds] = useState<ReadonlySet<string>>(
    () => new Set(['msg-4', 'msg-9']),
  );

  useEffect(() => {
    document.title = 'Inbox template';
  }, []);

  const filteredMessages = useMemo(() => {
    let rows = INBOX_MESSAGES;

    if (activeFolder === 'starred') {
      rows = rows.filter((message) => starredIds.has(message.id));
    }

    if (activeLabelId) {
      const label = INBOX_LABELS.find((entry) => entry.id === activeLabelId);
      if (label) {
        rows = rows.filter((message) =>
          message.subject.toLowerCase().includes(label.label.toLowerCase().slice(0, 4)),
        );
      }
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      rows = rows.filter(
        (message) =>
          message.sender.toLowerCase().includes(query) ||
          message.subject.toLowerCase().includes(query) ||
          message.snippet.toLowerCase().includes(query),
      );
    }

    return rows;
  }, [activeFolder, activeLabelId, searchQuery, starredIds]);

  const totalPages = Math.max(1, Math.ceil(INBOX_TOTAL_COUNT / INBOX_PAGE_SIZE));
  const rangeStart = (currentPage - 1) * INBOX_PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * INBOX_PAGE_SIZE, INBOX_TOTAL_COUNT);

  const allVisibleSelected =
    filteredMessages.length > 0 && filteredMessages.every((message) => selectedIds.has(message.id));
  const someVisibleSelected =
    filteredMessages.some((message) => selectedIds.has(message.id)) && !allVisibleSelected;

  const openCompose = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    dialogById(COMPOSE_MODAL_ID)?.showModal();
  };

  const closeCompose = () => {
    dialogById(COMPOSE_MODAL_ID)?.close();
  };

  const sendCompose = () => {
    closeCompose();
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredMessages.map((message) => message.id)));
  };

  const toggleRowSelected = (messageId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(messageId);
      } else {
        next.delete(messageId);
      }
      return next;
    });
  };

  const toggleStarred = (messageId: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const selectFolder = (folderId: InboxFolderId) => {
    setActiveFolder(folderId);
    setActiveLabelId(null);
    if (folderId === 'categories') {
      setCategoriesExpanded((prev) => !prev);
    }
  };

  const refreshList = () => {
    setSelectedIds(new Set());
    setCurrentPage(1);
  };

  return (
    <div className="inbox-page">
      {/* Header: menu, brand, search, utilities, Trimble + account */}
      <ModusWcNavbar
        className="inbox-navbar"
        condensed={!isWideNavbar}
        visibility={{
          ai: false,
          apps: false,
          help: false,
          logo: false,
          mainMenu: false,
          notifications: false,
          search: false,
          searchInput: false,
          user: false,
        }}
      >
        <div className="inbox-navbar-start" slot="start">
          <ModusWcButton
            aria-label="Main menu"
            color="tertiary"
            shape="square"
            size="md"
            variant="borderless"
          >
            <ModusWcIcon decorative name="menu" />
          </ModusWcButton>
          <div className="inbox-navbar-brand">
            <ModusWcIcon decorative name="email" size="sm" />
            <ModusWcTypography
              customClass="inbox-inline-text inbox-navbar-brand-text"
              hierarchy="p"
              label="Mail"
              size="md"
              weight="semibold"
            />
          </div>
        </div>

        <div className="inbox-navbar-search" slot="center">
          <ModusWcTextInput
            aria-label="Search mail"
            customClass="inbox-search-input"
            id={SEARCH_INPUT_ID}
            includeSearch
            onInputChange={(event: CustomEvent) => setSearchQuery(readInputString(event))}
            placeholder="Search mail"
            size="sm"
            value={searchQuery}
          />
          <div className="inbox-navbar-search-actions">
            <ModusWcButton
              aria-label="Search options"
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
            >
              <ModusWcIcon decorative name="filter_list" size="xs" />
            </ModusWcButton>
          </div>
        </div>

        <div className="inbox-navbar-end" slot="end">
          <div className="inbox-navbar-end-utilities">
            <span aria-hidden="true" className="inbox-status-dot" title="Active" />
            <ModusWcTooltip content="Calendar" position="bottom">
              <ModusWcButton
                aria-label="Calendar"
                color="tertiary"
                shape="square"
                size="md"
                variant="borderless"
              >
                <ModusWcIcon decorative name="calendar" size="sm" />
              </ModusWcButton>
            </ModusWcTooltip>
            <ModusWcTooltip content="Help" position="bottom">
              <ModusWcButton
                aria-label="Help"
                color="tertiary"
                shape="square"
                size="md"
                variant="borderless"
              >
                <ModusWcIcon decorative name="help" size="sm" />
              </ModusWcButton>
            </ModusWcTooltip>
            <ModusWcTooltip content="Settings" position="bottom">
              <ModusWcButton
                aria-label="Settings"
                color="tertiary"
                shape="square"
                size="md"
                variant="borderless"
              >
                <ModusWcIcon decorative name="settings" size="sm" />
              </ModusWcButton>
            </ModusWcTooltip>
            <ModusWcTooltip content="Apps" position="bottom">
              <ModusWcButton
                aria-label="Apps"
                color="tertiary"
                shape="square"
                size="md"
                variant="borderless"
              >
                <ModusWcIcon decorative name="apps" size="sm" />
              </ModusWcButton>
            </ModusWcTooltip>
            <ModusWcTooltip content="AI assistant" position="bottom">
              <ModusWcButton
                aria-label="AI assistant"
                color="tertiary"
                shape="square"
                size="md"
                variant="borderless"
              >
                <ModusWcIcon decorative name="stars" size="sm" />
              </ModusWcButton>
            </ModusWcTooltip>
          </div>
          <div className="inbox-user-cluster">
            <ModusWcLogo alt="Trimble" customClass="inbox-trimble-logo" name="trimble" />
            <ModusWcAvatar initials="MR" shape="circle" size="sm" />
          </div>
        </div>
      </ModusWcNavbar>

      <div className="inbox-body">
        {/* Far-left app rail: Mail, Chat, Meet */}
        <nav aria-label="Google Workspace apps" className="inbox-app-rail">
          {APP_RAIL.map((app) => {
            const isActive = activeApp === app.id;
            return (
              <div className="inbox-app-rail-item" key={app.id}>
                <ModusWcTooltip content={app.label} position="right">
                  <ModusWcButton
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={app.label}
                    color={isActive ? 'primary' : 'tertiary'}
                    onButtonClick={() => setActiveApp(app.id)}
                    shape="square"
                    size="sm"
                    variant={isActive ? 'filled' : 'borderless'}
                  >
                    <ModusWcIcon decorative name={app.icon} size="xs" />
                  </ModusWcButton>
                </ModusWcTooltip>
                {app.badge && (
                  <ModusWcBadge
                    color="danger"
                    customClass="inbox-app-rail-badge"
                    size="sm"
                    variant="filled"
                  >
                    {String(app.badge)}
                  </ModusWcBadge>
                )}
              </div>
            );
          })}
        </nav>

        {/* Folder sidebar: Compose, folders, labels */}
        <nav aria-label="Mail folders" className="inbox-folder-nav">
          <div className="inbox-compose-wrap">
            <ModusWcButton
              color="primary"
              onButtonClick={openCompose}
              size="sm"
              variant="filled"
            >
              <ModusWcIcon decorative name="pencil" size="xs" />
              Compose
            </ModusWcButton>
          </div>

          <ul className="inbox-folder-list">
            {INBOX_FOLDERS.map((folder) => {
              const isActive = activeFolder === folder.id && !activeLabelId;
              return (
                <li key={folder.id}>
                  <ModusWcButton
                    color="tertiary"
                    currentAria={isActive ? 'page' : undefined}
                    customClass={
                      isActive
                        ? 'inbox-folder-button inbox-folder-button--active'
                        : 'inbox-folder-button'
                    }
                    fullWidth
                    onButtonClick={() => selectFolder(folder.id)}
                    size="sm"
                    variant="borderless"
                  >
                    <ModusWcIcon decorative name={folder.icon} size="sm" />
                    <ModusWcTypography
                      customClass="inbox-folder-button-label inbox-inline-text"
                      hierarchy="p"
                      label={folder.label}
                      size="sm"
                      {...(isActive ? { weight: 'semibold' as const } : {})}
                    />
                    {folder.count && (
                      <ModusWcTypography
                        customClass="inbox-inline-text"
                        hierarchy="p"
                        label={String(folder.count)}
                        size="sm"
                      />
                    )}
                    {folder.id === 'categories' && (
                      <ModusWcIcon
                        decorative
                        name={categoriesExpanded ? 'chevron_double_down' : 'chevron_right'}
                        size="xs"
                      />
                    )}
                  </ModusWcButton>
                </li>
              );
            })}
          </ul>

          <div className="inbox-labels-header">
            <ModusWcTypography hierarchy="p" label="Labels" size="sm" weight="semibold" />
            <ModusWcButton
              aria-label="Create label"
              color="tertiary"
              shape="square"
              size="xs"
              variant="borderless"
            >
              <ModusWcIcon decorative name="add" size="xs" />
            </ModusWcButton>
          </div>

          <ul className="inbox-label-list">
            {INBOX_LABELS.map((label) => {
              const isActive = activeLabelId === label.id;
              return (
                <li key={label.id}>
                  <ModusWcButton
                    color="tertiary"
                    currentAria={isActive ? 'page' : undefined}
                    customClass={
                      isActive ? 'inbox-label-button inbox-label-button--active' : 'inbox-label-button'
                    }
                    fullWidth
                    onButtonClick={() => {
                      setActiveLabelId(label.id);
                      setActiveFolder('inbox');
                    }}
                    size="sm"
                    variant="borderless"
                  >
                    <ModusWcIcon decorative name="folder_closed" size="sm" />
                    <ModusWcTypography
                      customClass="inbox-folder-button-label inbox-inline-text"
                      hierarchy="p"
                      label={label.label}
                      size="sm"
                      {...(isActive ? { weight: 'semibold' as const } : {})}
                    />
                  </ModusWcButton>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main inbox list */}
        <main className="inbox-main">
          <ModusWcTypography
            customClass="inbox-sr-only"
            hierarchy="h1"
            label="Inbox template"
            size="xl"
          />

          <div aria-label="Message list actions" className="inbox-toolbar" role="toolbar">
            <div className="inbox-toolbar-start">
              <ModusWcCheckbox
                aria-label="Select all messages"
                indeterminate={someVisibleSelected}
                onInputChange={(event: CustomEvent) =>
                  toggleSelectAll(readInputChecked(event))
                }
                size="sm"
                value={allVisibleSelected}
              />
              <ModusWcTooltip content="Refresh" position="bottom">
                <ModusWcButton
                  aria-label="Refresh"
                  color="tertiary"
                  onButtonClick={refreshList}
                  shape="square"
                  size="sm"
                  variant="borderless"
                >
                  <ModusWcIcon decorative name="refresh" size="xs" />
                </ModusWcButton>
              </ModusWcTooltip>
              <ModusWcDropdownMenu
                aria-label="More actions"
                buttonColor="tertiary"
                buttonShape="square"
                buttonSize="sm"
                buttonVariant="borderless"
              >
                <ModusWcIcon decorative name="more_vertical" size="xs" slot="button" />
                <ModusWcMenuItem
                  label="Mark as read"
                  slot="menu"
                  value="read"
                  onItemSelect={closeMenuFromEvent}
                />
                <ModusWcMenuItem
                  label="Archive"
                  slot="menu"
                  value="archive"
                  onItemSelect={closeMenuFromEvent}
                />
                <ModusWcMenuItem
                  label="Delete"
                  slot="menu"
                  value="delete"
                  onItemSelect={closeMenuFromEvent}
                />
              </ModusWcDropdownMenu>
            </div>

            <div className="inbox-toolbar-end">
              <ModusWcTypography
                customClass="inbox-range-text inbox-inline-text"
                hierarchy="p"
                label={`${rangeStart}-${rangeEnd} of ${INBOX_TOTAL_COUNT}`}
                size="sm"
              />
              <ModusWcButton
                aria-label="Previous page"
                color="tertiary"
                disabled={currentPage <= 1}
                onButtonClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                shape="square"
                size="sm"
                variant="borderless"
              >
                <ModusWcIcon decorative name="chevron_left" size="xs" />
              </ModusWcButton>
              <ModusWcButton
                aria-label="Next page"
                color="tertiary"
                disabled={currentPage >= totalPages}
                onButtonClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                shape="square"
                size="sm"
                variant="borderless"
              >
                <ModusWcIcon decorative name="chevron_right" size="xs" />
              </ModusWcButton>
            </div>
          </div>

          <ul aria-label="Messages" className="inbox-message-list">
            {filteredMessages.map((message: InboxMessage) => {
              const isSelected = selectedIds.has(message.id);
              const isStarred = starredIds.has(message.id);
              return (
                <li key={message.id}>
                  <div
                    className={
                      message.unread
                        ? 'inbox-message-row inbox-message-row--unread'
                        : 'inbox-message-row'
                    }
                  >
                    <ModusWcCheckbox
                      aria-label={`Select message from ${message.sender}`}
                      onInputChange={(event: CustomEvent) =>
                        toggleRowSelected(message.id, readInputChecked(event))
                      }
                      size="sm"
                      value={isSelected}
                    />
                    <ModusWcButton
                      aria-label={isStarred ? 'Remove star' : 'Add star'}
                      color="tertiary"
                      onButtonClick={() => toggleStarred(message.id)}
                      shape="square"
                      size="sm"
                      variant="borderless"
                    >
                      <ModusWcIcon
                        decorative
                        name={isStarred ? 'star' : 'star_outlined'}
                        size="xs"
                        variant={isStarred ? 'solid' : 'outlined'}
                      />
                    </ModusWcButton>
                    <ModusWcButton
                      buttonAriaLabel={`Open message from ${message.sender}: ${message.subject}`}
                      className="inbox-message-open-host"
                      color="tertiary"
                      customClass="inbox-message-open"
                      fullWidth
                      size="sm"
                      variant="borderless"
                    >
                      <ModusWcTypography
                        customClass="inbox-message-sender inbox-inline-text"
                        hierarchy="p"
                        label={message.sender}
                        size="sm"
                      />
                      <div className="inbox-message-subject-wrap">
                        <ModusWcTypography
                          customClass="inbox-message-subject inbox-inline-text"
                          hierarchy="p"
                          label={message.subject}
                          size="sm"
                        />
                        {message.hasCalendarInvite && (
                          <span aria-label="Calendar invitation" className="inbox-message-calendar">
                            <ModusWcIcon decorative name="calendar" size="xs" />
                          </span>
                        )}
                        <ModusWcTypography
                          customClass="inbox-message-snippet inbox-inline-text"
                          hierarchy="p"
                          label={message.snippet}
                          size="sm"
                        />
                      </div>
                      <ModusWcTypography
                        customClass="inbox-message-date inbox-inline-text"
                        hierarchy="p"
                        label={message.receivedAt}
                        size="sm"
                      />
                    </ModusWcButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </main>

        {/* Right utility rail */}
        <aside aria-label="Add-ons" className="inbox-utility-rail">
          {UTILITY_RAIL.map((item) => (
            <ModusWcTooltip content={item.label} key={item.id} position="left">
              <ModusWcButton
                aria-label={item.label}
                color="tertiary"
                shape="square"
                size="sm"
                variant="borderless"
              >
                <ModusWcIcon decorative name={item.icon} size="xs" />
              </ModusWcButton>
            </ModusWcTooltip>
          ))}
          <span aria-hidden="true" className="inbox-utility-divider" />
          <ModusWcTooltip content="Trimble add-on" position="left">
            <ModusWcButton
              aria-label="Trimble add-on"
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
            >
              <ModusWcLogo alt="" customClass="inbox-addon-logo" emblem name="trimble" />
            </ModusWcButton>
          </ModusWcTooltip>
          <ModusWcTooltip content="Get add-ons" position="left">
            <ModusWcButton
              aria-label="Get add-ons"
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
            >
              <ModusWcIcon decorative name="add" size="xs" />
            </ModusWcButton>
          </ModusWcTooltip>
        </aside>
      </div>

      {/* Compose modal */}
      <ModusWcModal
        aria-label="Compose message"
        backdrop="default"
        modalId={COMPOSE_MODAL_ID}
        position="center"
        showClose
      >
        <span slot="header">New message</span>
        <div className="inbox-compose-fields" slot="content">
          <ModusWcTextInput
            label="To"
            onInputChange={(event: CustomEvent) => setComposeTo(readInputString(event))}
            placeholder="Recipients"
            size="sm"
            value={composeTo}
          />
          <ModusWcTextInput
            label="Subject"
            onInputChange={(event: CustomEvent) => setComposeSubject(readInputString(event))}
            placeholder="Subject"
            size="sm"
            value={composeSubject}
          />
          <ModusWcTextarea
            label="Message"
            onInputChange={(event: CustomEvent) => setComposeBody(readInputString(event))}
            placeholder="Write your message"
            size="sm"
            value={composeBody}
          />
        </div>
        <div className="inbox-modal-footer" slot="footer">
          <ModusWcButton
            color="tertiary"
            onButtonClick={closeCompose}
            size="sm"
            variant="outlined"
          >
            Discard
          </ModusWcButton>
          <ModusWcButton
            color="primary"
            onButtonClick={sendCompose}
            size="sm"
            variant="filled"
          >
            <ModusWcIcon decorative name="form_send" size="xs" />
            Send
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </div>
  );
}
