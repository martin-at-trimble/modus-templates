import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ModusWcLink } from '@trimble-oss/moduswebcomponents-react';

import {
  CodeEditorTemplatePage,
  GithubDashboardTemplatePage,
  InboxTemplatePage,
  MusicStreamingTemplatePage,
  PortalTemplatePage,
  ResizablePanelsPlaygroundTemplatePage,
  UsageDashboardTemplatePage,
} from './templates';

const TEMPLATE_LINKS = [
  { to: '/portal', label: 'Portal' },
  { to: '/github-dashboard', label: 'GitHub dashboard' },
  { to: '/resizable-panels', label: 'Resizable panels' },
  { to: '/code-editor', label: 'Code editor' },
  { to: '/music-streaming', label: 'Music streaming' },
  { to: '/usage-dashboard', label: 'Usage dashboard' },
  { to: '/inbox', label: 'Inbox' },
] as const;

function TemplateSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav aria-label="Templates" className="template-switcher px-4 sm:px-6">
      {TEMPLATE_LINKS.map(({ to, label }) => {
        const isActive = location.pathname === to;
        return (
          <ModusWcLink
            key={to}
            aria-current={isActive ? 'page' : undefined}
            color="inherit"
            customClass={
              isActive
                ? 'template-switcher-link template-switcher-link--active'
                : 'template-switcher-link'
            }
            href={to}
            underline="none"
            onClick={(event) => {
              event.preventDefault();
              navigate(to);
            }}
          >
            {label}
          </ModusWcLink>
        );
      })}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-templates">
        <TemplateSwitcher />
        <Routes>
          <Route element={<GithubDashboardTemplatePage />} path="/github-dashboard" />
          <Route element={<ResizablePanelsPlaygroundTemplatePage />} path="/resizable-panels" />
          <Route element={<CodeEditorTemplatePage />} path="/code-editor" />
          <Route element={<MusicStreamingTemplatePage />} path="/music-streaming" />
          <Route element={<PortalTemplatePage />} path="/portal" />
          <Route element={<UsageDashboardTemplatePage />} path="/usage-dashboard" />
          <Route element={<InboxTemplatePage />} path="/inbox" />
          <Route element={<Navigate replace to="/portal" />} path="/" />
          <Route element={<Navigate replace to="/portal" />} path="*" />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
