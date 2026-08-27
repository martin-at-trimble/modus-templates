import { useEffect, useRef, useState } from 'react';
import {
  ModusWcAvatar,
  ModusWcBadge,
  ModusWcButton,
  ModusWcCard,
  ModusWcDivider,
  ModusWcDropdownMenu,
  ModusWcIcon,
  ModusWcMenuItem,
  ModusWcNavbar,
  ModusWcProgress,
  ModusWcTextInput,
  ModusWcTextarea,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import {
  askModeOptions,
  gettingStartedItems,
  quickActionsRowOne,
  quickActionsRowTwo,
  repoScopeOptions,
} from './githubDashboardData';
import './GithubDashboardPage.css';

// Reads the typed/selected string value out of a Modus `inputChange` event.
function readInputString(e: CustomEvent<InputEvent>): string {
  const target = e.detail?.target as HTMLInputElement | HTMLTextAreaElement | null;
  return target?.value ?? '';
}

// Uncontrolled dropdowns stay open after a selection unless closed manually.
function closeDropdownFromEvent(e: CustomEvent<{ value: string }>) {
  const trigger = (e.target as HTMLElement | null)?.closest('modus-wc-dropdown-menu') as
    | (HTMLElement & { menuVisible: boolean })
    | null;
  if (trigger) {
    trigger.menuVisible = false;
  }
}

export default function GithubDashboardPage() {
  useEffect(() => {
    document.title = 'Github';
  }, []);

  // ----- Composer (prompt box) state -----
  const [promptValue, setPromptValue] = useState('');
  const [askMode, setAskMode] = useState(askModeOptions[0]);
  const [repoScope, setRepoScope] = useState(repoScopeOptions[0]);

  // ----- Getting started accordion state -----
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(gettingStartedItems.map((item) => [item.id, item.defaultOpen])),
  );
  const completedCount = 1;
  const totalCount = gettingStartedItems.length + 2;

  // modus-wc-button only inherits aria-expanded once, at first mount, so it
  // has to be kept in sync on the real (light-DOM) inner <button> by hand.
  const accordionButtonRefs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    for (const item of gettingStartedItems) {
      const innerButton = accordionButtonRefs.current[item.id]?.querySelector('button');
      innerButton?.setAttribute('aria-expanded', String(Boolean(openItems[item.id])));
    }
  }, [openItems]);

  return (
    <div className="gh-page">
      {/* ===== Navbar: hamburger, brand mark, breadcrumb, search, action icons, avatar ===== */}
      <ModusWcNavbar
        className="gh-navbar"
        visibility={{
          logo: false,
          mainMenu: false,
          apps: false,
          search: false,
          searchInput: false,
          notifications: false,
          help: false,
          user: false,
          ai: false,
        }}
      >
        <div slot="start" className="gh-navbar-brand">
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            shape="square"
            size="md"
            buttonAriaLabel="Open menu"
          >
            <ModusWcIcon name="menu" decorative />
          </ModusWcButton>
          <span className="gh-navbar-brand-mark" aria-hidden="true">
            <ModusWcIcon name="code" size="sm" decorative />
          </span>
          <ModusWcTypography
            hierarchy="p"
            size="md"
            weight="semibold"
            customClass="gh-navbar-breadcrumb gh-inline-text"
            label="Dashboard"
          />
        </div>

        <div slot="center" className="gh-navbar-search">
          <ModusWcTextInput
            aria-label="Search"
            size="sm"
            includeSearch
            placeholder="Type / to search"
            value=""
            customClass="gh-navbar-search-input"
          />
        </div>

        <div slot="end" className="gh-navbar-end">
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            shape="square"
            size="md"
            buttonAriaLabel="Copilot"
          >
            <ModusWcIcon name="ai_stars" decorative />
          </ModusWcButton>
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            shape="square"
            size="md"
            buttonAriaLabel="Create new"
          >
            <ModusWcIcon name="add_circle" decorative />
          </ModusWcButton>
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            shape="square"
            size="md"
            buttonAriaLabel="Notifications"
          >
            <ModusWcIcon name="notifications" decorative />
          </ModusWcButton>
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            shape="square"
            size="md"
            buttonAriaLabel="Pull requests"
          >
            <ModusWcIcon name="compare_arrows" decorative />
          </ModusWcButton>
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            shape="square"
            size="md"
            buttonAriaLabel="Inbox"
          >
            <ModusWcIcon name="email" decorative />
          </ModusWcButton>
          <ModusWcDropdownMenu
            buttonAriaLabel="Your account"
            buttonVariant="borderless"
            buttonColor="tertiary"
            buttonSize="md"
            menuPlacement="bottom-end"
          >
            <div slot="button" className="gh-navbar-avatar-trigger">
              <ModusWcAvatar initials="ME" size="xs" shape="circle" alt="" />
            </div>
            <div slot="menu">
              <ModusWcMenuItem
                label="Your profile"
                value="profile"
                onItemSelect={closeDropdownFromEvent}
              />
              <ModusWcMenuItem
                label="Settings"
                value="settings"
                onItemSelect={closeDropdownFromEvent}
              />
              <ModusWcMenuItem
                label="Sign out"
                value="sign-out"
                onItemSelect={closeDropdownFromEvent}
              />
            </div>
          </ModusWcDropdownMenu>
        </div>
      </ModusWcNavbar>

      <div className="gh-body">
        {/* ===== Sidebar: account switcher + "create your first project" ===== */}
        <aside className="gh-sidebar">
          <ModusWcDropdownMenu
            buttonAriaLabel="martin-at-trimble account menu"
            buttonVariant="borderless"
            buttonColor="tertiary"
            buttonSize="sm"
            menuPlacement="bottom-start"
          >
            <div slot="button" className="gh-sidebar-user-trigger">
              <ModusWcAvatar initials="ME" size="xs" shape="circle" alt="" />
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                weight="semibold"
                customClass="gh-inline-text"
                label="martin-at-trimble"
              />
              <ModusWcIcon name="caret_down" size="xs" decorative />
            </div>
            <div slot="menu">
              <ModusWcMenuItem
                label="Switch account"
                value="switch"
                onItemSelect={closeDropdownFromEvent}
              />
              <ModusWcMenuItem
                label="Your organizations"
                value="orgs"
                onItemSelect={closeDropdownFromEvent}
              />
            </div>
          </ModusWcDropdownMenu>

          <div className="gh-sidebar-section">
            <ModusWcTypography hierarchy="h2" size="lg" weight="semibold" label="Create your first project" />
            <ModusWcTypography
              hierarchy="p"
              size="sm"
              customClass="gh-muted-text"
              label="Ready to start building? Create a repository for a new idea or bring over an existing repository to keep contributing to it."
            />
            <div className="gh-sidebar-actions">
              <ModusWcButton variant="filled" color="primary" size="sm">
                <ModusWcIcon name="add" size="xs" decorative />
                Create repository
              </ModusWcButton>
              <ModusWcButton variant="borderless" color="tertiary" size="sm">
                Import repository
              </ModusWcButton>
            </div>
          </div>
        </aside>

        {/* ===== Main column ===== */}
        <main className="gh-main">
          <ModusWcTypography hierarchy="h1" size="3xl" weight="bold" customClass="gh-main-heading" label="Home" />

          {/* ----- Prompt composer ----- */}
          <ModusWcCard bordered padding="compact">
            <div className="gh-composer-body">
              <ModusWcTextarea
                aria-label="Ask anything or type @ to add context"
                bordered={false}
                rows={2}
                placeholder="Ask anything or type @ to add context"
                value={promptValue}
                onInputChange={(e) => setPromptValue(readInputString(e))}
              />
              <div className="gh-composer-toolbar">
                <div className="gh-composer-toolbar-start">
                  <ModusWcDropdownMenu
                    buttonAriaLabel="Ask mode"
                    buttonVariant="outlined"
                    buttonColor="tertiary"
                    buttonSize="sm"
                    menuPlacement="bottom-start"
                  >
                    <div slot="button" className="gh-dropdown-trigger-content">
                      <ModusWcIcon name="chat" size="xs" decorative />
                      {askMode.label}
                      <ModusWcIcon name="caret_down" size="xs" decorative />
                    </div>
                    <div slot="menu">
                      {askModeOptions.map((option) => (
                        <ModusWcMenuItem
                          key={option.value}
                          label={option.label}
                          value={option.value}
                          selected={option.value === askMode.value}
                          onItemSelect={(e) => {
                            setAskMode(option);
                            closeDropdownFromEvent(e);
                          }}
                        />
                      ))}
                    </div>
                  </ModusWcDropdownMenu>

                  <ModusWcDropdownMenu
                    buttonAriaLabel="Repository scope"
                    buttonVariant="outlined"
                    buttonColor="tertiary"
                    buttonSize="sm"
                    menuPlacement="bottom-start"
                  >
                    <div slot="button" className="gh-dropdown-trigger-content">
                      <ModusWcIcon name="server" size="xs" decorative />
                      {repoScope.label}
                      <ModusWcIcon name="caret_down" size="xs" decorative />
                    </div>
                    <div slot="menu">
                      {repoScopeOptions.map((option) => (
                        <ModusWcMenuItem
                          key={option.value}
                          label={option.label}
                          value={option.value}
                          selected={option.value === repoScope.value}
                          onItemSelect={(e) => {
                            setRepoScope(option);
                            closeDropdownFromEvent(e);
                          }}
                        />
                      ))}
                    </div>
                  </ModusWcDropdownMenu>

                  <ModusWcButton
                    variant="outlined"
                    color="tertiary"
                    shape="square"
                    size="sm"
                    buttonAriaLabel="Add context"
                  >
                    <ModusWcIcon name="add_circle" size="xs" decorative />
                  </ModusWcButton>
                </div>

                <ModusWcButton
                  variant="filled"
                  color="primary"
                  shape="square"
                  size="sm"
                  disabled={promptValue.trim().length === 0}
                  buttonAriaLabel="Send"
                >
                  <ModusWcIcon name="paper_plane" size="xs" decorative />
                </ModusWcButton>
              </div>
            </div>
          </ModusWcCard>

          {/* ----- Quick action buttons ----- */}
          <div className="gh-quick-actions">
            {quickActionsRowOne.map((action) =>
              action.menuOptions ? (
                <ModusWcDropdownMenu
                  key={action.id}
                  buttonAriaLabel={action.label}
                  buttonVariant="outlined"
                  buttonColor="tertiary"
                  buttonSize="sm"
                  menuPlacement="bottom-start"
                >
                  <div slot="button" className="gh-dropdown-trigger-content">
                    <ModusWcIcon name={action.icon} size="xs" decorative />
                    {action.label}
                    <ModusWcIcon name="caret_down" size="xs" decorative />
                  </div>
                  <div slot="menu">
                    {action.menuOptions.map((option) => (
                      <ModusWcMenuItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        onItemSelect={closeDropdownFromEvent}
                      />
                    ))}
                  </div>
                </ModusWcDropdownMenu>
              ) : (
                <ModusWcButton key={action.id} variant="outlined" color="tertiary" size="sm">
                  <ModusWcIcon name={action.icon} size="xs" decorative />
                  {action.label}
                </ModusWcButton>
              ),
            )}
          </div>
          <div className="gh-quick-actions gh-quick-actions-secondary">
            {quickActionsRowTwo.map((action) => (
              <ModusWcDropdownMenu
                key={action.id}
                buttonAriaLabel={action.label}
                buttonVariant="outlined"
                buttonColor="tertiary"
                buttonSize="sm"
                menuPlacement="bottom-start"
              >
                <div slot="button" className="gh-dropdown-trigger-content">
                  <ModusWcIcon name={action.icon} size="xs" decorative />
                  {action.label}
                  <ModusWcIcon name="caret_down" size="xs" decorative />
                </div>
                <div slot="menu">
                  {action.menuOptions?.map((option) => (
                    <ModusWcMenuItem
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      onItemSelect={closeDropdownFromEvent}
                    />
                  ))}
                </div>
              </ModusWcDropdownMenu>
            ))}
          </div>

          {/* ----- Playlist / video card ----- */}
          <VideoCard />

          {/* ----- Getting started section ----- */}
          <div className="gh-getting-started-header">
            <ModusWcTypography hierarchy="h2" size="xl" weight="semibold" label="Getting started" />
            <div className="gh-getting-started-meter">
              <ModusWcProgress value={completedCount} max={totalCount} aria-label="Getting started progress" />
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="gh-muted-text gh-inline-text"
                label={`${completedCount}/${totalCount} complete`}
              />
            </div>
            <div className="gh-getting-started-header-actions">
              <ModusWcDropdownMenu
                buttonAriaLabel="Getting started options"
                buttonVariant="borderless"
                buttonColor="tertiary"
                buttonSize="sm"
                menuPlacement="bottom-end"
              >
                <div slot="button" className="gh-dropdown-trigger-content">
                  <ModusWcIcon name="more_horizontal" size="xs" decorative />
                </div>
                <div slot="menu">
                  <ModusWcMenuItem label="Hide this section" value="hide" onItemSelect={closeDropdownFromEvent} />
                  <ModusWcMenuItem label="Mark all as done" value="mark-done" onItemSelect={closeDropdownFromEvent} />
                </div>
              </ModusWcDropdownMenu>
            </div>
          </div>

          <ModusWcCard bordered padding="compact">
            {gettingStartedItems.map((item, index) => {
              const isOpen = openItems[item.id];
              return (
                <div key={item.id}>
                  {index > 0 && <ModusWcDivider orientation="horizontal" />}
                  <ModusWcButton
                    ref={(el) => {
                      accordionButtonRefs.current[item.id] = el as unknown as HTMLElement | null;
                    }}
                    variant="borderless"
                    color="tertiary"
                    fullWidth
                    customClass="gh-accordion-row-header"
                    aria-expanded={isOpen}
                    onButtonClick={() =>
                      setOpenItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                  >
                    <ModusWcIcon
                      name={isOpen ? 'expand_more' : 'chevron_right'}
                      size="sm"
                      decorative
                    />
                    <ModusWcTypography
                      hierarchy="p"
                      size="md"
                      weight="semibold"
                      customClass="gh-accordion-row-title gh-inline-text"
                      label={item.title}
                    />
                  </ModusWcButton>
                  <div className="gh-accordion-row-body" hidden={!isOpen}>
                    <ModusWcTypography hierarchy="p" size="sm" label={item.description} />
                    {item.ctaLabel && (
                      <ModusWcButton variant="filled" color="primary" size="sm">
                        <ModusWcIcon name="add" size="xs" decorative />
                        {item.ctaLabel}
                      </ModusWcButton>
                    )}
                  </div>
                </div>
              );
            })}
          </ModusWcCard>
        </main>
      </div>
    </div>
  );
}

// Decorative playlist thumbnail (no external image) + card content.
function VideoCard() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <ModusWcCard bordered padding="comfortable" customClass="gh-video-card">
      <div className="gh-video-close">
        <ModusWcButton
          variant="borderless"
          color="tertiary"
          shape="square"
          size="sm"
          buttonAriaLabel="Dismiss"
          onButtonClick={() => setDismissed(true)}
        >
          <ModusWcIcon name="close" size="xs" decorative />
        </ModusWcButton>
      </div>
      <div className="gh-video-card-body">
        <div className="gh-video-content">
          <ModusWcBadge variant="outlined" color="tertiary" size="sm">
            Playlist
          </ModusWcBadge>
          <ModusWcTypography hierarchy="h3" size="lg" weight="semibold" label="Github for beginners on YouTube" />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="gh-muted-text"
            label="Designed to help you master the basics of Github, whether you're new to coding or looking to enhance your version control skills."
          />
          <ModusWcButton variant="outlined" color="tertiary" size="sm">
            <ModusWcIcon name="play_circle" size="xs" decorative />
            Start playlist
          </ModusWcButton>
        </div>
        <div className="gh-video-thumb" aria-hidden="true">
          <span className="gh-video-thumb-play">
            <ModusWcIcon name="play_circle" size="lg" decorative />
          </span>
        </div>
      </div>
    </ModusWcCard>
  );
}
