import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ModusWcLink } from '@trimble-oss/moduswebcomponents-react';

import GithubDashboardPage from './templates/GithubDashboard/GithubDashboardPage';

const TEMPLATE_LINKS = [
  { to: '/github-dashboard', label: 'GitHub dashboard' },
] as const;

function TemplateSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="template-switcher px-4 sm:px-6" aria-label="Templates">
      {TEMPLATE_LINKS.map(({ to, label }) => {
        const isActive = location.pathname === to;
        return (
          <ModusWcLink
            key={to}
            href={to}
            color="inherit"
            underline="none"
            customClass={
              isActive
                ? 'template-switcher-link template-switcher-link--active'
                : 'template-switcher-link'
            }
            aria-current={isActive ? 'page' : undefined}
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
          <Route path="/github-dashboard" element={<GithubDashboardPage />} />
          <Route path="/" element={<Navigate to="/github-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/github-dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
