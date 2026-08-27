import { createRoot } from 'react-dom/client'
import { setAssetPath } from '@trimble-oss/moduswebcomponents/components'
import { ModusWcThemeProvider } from '@trimble-oss/moduswebcomponents-react'
import './index.css'
import GithubDashboardPage from './pages/GithubDashboardPage.tsx'

setAssetPath(`${window.location.origin}/`)

createRoot(document.getElementById('root')!).render(
  <ModusWcThemeProvider>
    <GithubDashboardPage />
  </ModusWcThemeProvider>,
)
