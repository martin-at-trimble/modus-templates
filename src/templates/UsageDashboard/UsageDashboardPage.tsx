import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcNavbar,
  ModusWcProgress,
  ModusWcSelect,
  ModusWcSideNavigation,
  ModusWcTable,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ITableColumn } from '@trimble-oss/moduswebcomponents';

import { readInputString } from '../../lib/modusFormEvents';
import {
  CHART_DATA,
  CHART_SERIES,
  GROUP_BY_OPTIONS,
  METRIC_OPTIONS,
  MONTHLY_BUDGET,
  MONTHLY_RESET_LABEL,
  MONTHLY_SPENT,
  PERIOD_OPTIONS,
  SUMMARY_STATS,
  USAGE_LOG_ROWS,
  type GroupByOption,
  type MetricOption,
  type UsagePeriod,
} from './usageDashboardData';
import './UsageDashboardPage.css';

const APP_SHELL_CLASS = 'app-shell';
const MAIN_CONTENT_ID = 'main-content';
const PUSH_LAYOUT_MIN_PX = 1024;
const XL_MIN_PX = 1280;
const NAVBAR_WIDE_MIN_PX = 768;
const SIDE_NAV_MAX_WIDTH = '256px';
const SIDE_NAV_MIN_WIDTH = '4rem';

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--modus-wc-color-base-100)',
    border: '1px solid var(--modus-wc-color-base-200)',
    borderRadius: 'var(--radius-button, 8px)',
    color: 'var(--modus-wc-color-base-content)',
    padding: '8px 12px',
  },
  cursor: { fill: 'var(--modus-wc-color-base-200)' },
  itemStyle: { color: 'var(--modus-wc-color-base-content)' },
  labelStyle: { color: 'var(--modus-wc-color-base-content)' },
};

function subscribeMedia(query: string, onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function useMediaQuery(query: string, serverSnapshot = false) {
  return useSyncExternalStore(
    (onStoreChange) => subscribeMedia(query, onStoreChange),
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  );
}

function createIncludedBadge(label: string) {
  const badge = document.createElement('modus-wc-badge');
  badge.setAttribute('color', 'success');
  badge.setAttribute('size', 'sm');
  badge.setAttribute('variant', 'filled');
  badge.textContent = label;
  return badge;
}

function createCostCell(cost: string, note: string) {
  const wrapper = document.createElement('div');
  wrapper.className = 'usage-dashboard-cost-cell';
  const amount = document.createElement('span');
  amount.textContent = cost;
  wrapper.append(amount, createIncludedBadge(note));
  return wrapper;
}

const TABLE_COLUMNS: ITableColumn[] = [
  { accessor: 'date', header: 'Date (UTC)', id: 'date' },
  { accessor: 'user', header: 'User', id: 'user' },
  {
    accessor: 'type',
    cellRenderer: (value: unknown) => createIncludedBadge(String(value)),
    header: 'Type',
    id: 'type',
  },
  { accessor: 'model', header: 'Model', id: 'model' },
  { accessor: 'tokens', header: 'Tokens', id: 'tokens' },
  {
    accessor: 'cost',
    cellRenderer: (_value: unknown, row: unknown) =>
      createCostCell(
        String((row as Record<string, unknown>).cost),
        String((row as Record<string, unknown>).costNote),
      ),
    header: 'Cost',
    id: 'cost',
  },
];

export default function UsageDashboardPage() {
  const isPushDesktop = useMediaQuery(`(min-width: ${PUSH_LAYOUT_MIN_PX}px)`);
  const isXl = useMediaQuery(`(min-width: ${XL_MIN_PX}px)`);
  const isWideNavbar = useMediaQuery(`(min-width: ${NAVBAR_WIDE_MIN_PX}px)`);

  const [groupBy, setGroupBy] = useState<GroupByOption>('model');
  const [metric, setMetric] = useState<MetricOption>('spend');
  const [period, setPeriod] = useState<UsagePeriod>('7d');
  const [selectedNav, setSelectedNav] = useState('dashboard');
  const [sideNavExpanded, setSideNavExpanded] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(min-width: ${XL_MIN_PX}px)`).matches,
  );
  const [tableReady, setTableReady] = useState(false);

  const mainRef = useRef<HTMLElement | null>(null);
  const railWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = 'Usage Dashboard';
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setTableReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    setSideNavExpanded(isXl);
  }, [isXl]);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return undefined;

    if (!isPushDesktop) {
      main.style.marginLeft = '';
      return undefined;
    }

    main.style.marginLeft = sideNavExpanded ? SIDE_NAV_MAX_WIDTH : SIDE_NAV_MIN_WIDTH;

    const outerFrame = requestAnimationFrame(() => {
      const innerFrame = requestAnimationFrame(() => {
        if (!mainRef.current) return;
        mainRef.current.style.marginLeft = sideNavExpanded ? SIDE_NAV_MAX_WIDTH : SIDE_NAV_MIN_WIDTH;
      });
      return () => cancelAnimationFrame(innerFrame);
    });

    return () => cancelAnimationFrame(outerFrame);
  }, [isPushDesktop, sideNavExpanded]);

  useLayoutEffect(() => {
    const wrapper = railWrapperRef.current;
    const main = mainRef.current;
    if (!wrapper) return undefined;

    const overlayCollapsed = !isPushDesktop && !sideNavExpanded;
    if (overlayCollapsed) {
      wrapper.setAttribute('inert', '');
      if (wrapper.contains(document.activeElement) && main) {
        main.focus();
      }
    } else {
      wrapper.removeAttribute('inert');
    }

    return undefined;
  }, [isPushDesktop, sideNavExpanded]);

  useLayoutEffect(() => {
    const navbar = document.querySelector('.usage-dashboard-navbar') as
      | (HTMLElement & { mainMenuOpen: boolean })
      | null;
    if (!navbar) return undefined;

    navbar.mainMenuOpen = isPushDesktop ? false : sideNavExpanded;

    return undefined;
  }, [isPushDesktop, sideNavExpanded]);

  const monthlyProgress = Math.round((MONTHLY_SPENT / MONTHLY_BUDGET) * 100);
  const sideNavMode = isPushDesktop ? 'push' : 'overlay';

  const handleMainMenuOpenChange = (event: CustomEvent<boolean>) => {
    if (isPushDesktop) {
      setSideNavExpanded((prev) => !prev);
      return;
    }
    setSideNavExpanded(Boolean(event.detail));
  };

  const handleExportCsv = () => {
    const header = ['Date (UTC)', 'User', 'Type', 'Model', 'Tokens', 'Cost'];
    const lines = USAGE_LOG_ROWS.map((row) =>
      [row.date, row.user, row.type, row.model, row.tokens, `${row.cost} ${row.costNote}`].join(','),
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usage-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`usage-dashboard-page ${APP_SHELL_CLASS}`}>
      {/* ===== App shell: navbar ===== */}
      <ModusWcNavbar
        className="usage-dashboard-navbar"
        condensed={!isWideNavbar}
        customClass="usage-dashboard-navbar-host"
        mainMenuOpen={isPushDesktop ? false : sideNavExpanded}
        visibility={{
          ai: false,
          apps: isWideNavbar,
          help: isWideNavbar,
          logo: true,
          mainMenu: true,
          notifications: isWideNavbar,
          search: isWideNavbar,
          searchInput: false,
          user: true,
        }}
        onAppsClick={() => undefined}
        onHelpClick={() => undefined}
        onMainMenuOpenChange={handleMainMenuOpenChange}
        onNotificationsClick={() => undefined}
        onSearchClick={() => undefined}
        onUserMenuOpenChange={() => undefined}
      >
        
      </ModusWcNavbar>

      <div className="usage-dashboard-body-row">
        {/* ===== App shell: side navigation ===== */}
        <div
          className={[
            'usage-dashboard-rail-wrapper',
            isPushDesktop ? 'usage-dashboard-rail-wrapper--push' : 'usage-dashboard-rail-wrapper--overlay',
            sideNavExpanded ? 'usage-dashboard-rail-wrapper--expanded' : 'usage-dashboard-rail-wrapper--collapsed',
          ].join(' ')}
          ref={railWrapperRef}
        >
          <ModusWcSideNavigation
            key={sideNavMode}
            collapseOnClickOutside={!isPushDesktop}
            expanded={sideNavExpanded}
            maxWidth={SIDE_NAV_MAX_WIDTH}
            mode={sideNavMode}
            targetContent={`#${MAIN_CONTENT_ID}`}
            onExpandedChange={(event: CustomEvent<boolean>) => {
              setSideNavExpanded(Boolean(event.detail));
            }}
          >
            <ModusWcMenu size="md">
              <ModusWcMenuItem
                label="Home"
                selected={selectedNav === 'home'}
                value="home"
                onItemSelect={() => setSelectedNav('home')}
              >
                <ModusWcIcon decorative name="home" slot="start-icon" />
              </ModusWcMenuItem>
              <ModusWcMenuItem
                label="Dashboard"
                selected={selectedNav === 'dashboard'}
                value="dashboard"
                onItemSelect={() => setSelectedNav('dashboard')}
              >
                <ModusWcIcon decorative name="dashboard" slot="start-icon" />
              </ModusWcMenuItem>
              <ModusWcMenuItem
                label="Settings"
                selected={selectedNav === 'settings'}
                value="settings"
                onItemSelect={() => setSelectedNav('settings')}
              >
                <ModusWcIcon decorative name="settings" slot="start-icon" />
              </ModusWcMenuItem>
            </ModusWcMenu>
          </ModusWcSideNavigation>
        </div>

        {/* ===== Main content ===== */}
        <main
          className="usage-dashboard-main"
          id={MAIN_CONTENT_ID}
          ref={mainRef}
          tabIndex={-1}
        >
          <div className="usage-dashboard-main-inner">
            <ModusWcTypography
              customClass="usage-dashboard-page-title"
              hierarchy="h1"
              label="Usage Dashboard"
              size="2xl"
              weight="semibold"
            />

            {/* Monthly usage */}
            <ModusWcCard bordered padding="compact">
              <ModusWcTypography
                hierarchy="h2"
                label="Your monthly usage"
                size="md"
                slot="title"
                weight="semibold"
              />
              <div className="usage-dashboard-monthly">
                <div className="usage-dashboard-monthly-header">
                  <ModusWcTypography
                    hierarchy="p"
                    label={`$${MONTHLY_SPENT.toFixed(2)} / $${MONTHLY_BUDGET}`}
                    size="lg"
                    weight="semibold"
                  />
                </div>
                <ModusWcProgress label="" value={monthlyProgress} />
                <ModusWcTypography
                  customClass="usage-dashboard-muted"
                  hierarchy="p"
                  label={MONTHLY_RESET_LABEL}
                  size="sm"
                />
              </div>
            </ModusWcCard>

            {/* Filters */}
            <section aria-label="Usage filters" className="usage-dashboard-filters">
              <ModusWcButton color="tertiary" size="sm" variant="outlined">
                <ModusWcIcon decorative name="calendar" size="xs" />
                Aug 22 – Aug 28
              </ModusWcButton>
              <div className="usage-dashboard-period-group" role="group" aria-label="Time range">
                {PERIOD_OPTIONS.map((option) => {
                  const active = period === option.id;
                  return (
                    <ModusWcButton
                      color={active ? 'primary' : 'tertiary'}
                      key={option.id}
                      size="sm"
                      variant={active ? 'filled' : 'outlined'}
                      onButtonClick={() => setPeriod(option.id)}
                    >
                      {option.label}
                    </ModusWcButton>
                  );
                })}
              </div>
            </section>

            {/* Summary cards */}
            <ModusWcCard bordered padding="compact">
              <div className="usage-dashboard-summary-grid">
                <ModusWcCard bordered={false} padding="compact">
                  <ModusWcTypography
                    customClass="usage-dashboard-muted"
                    hierarchy="p"
                    label="Total usage"
                    size="sm"
                  />
                  <ModusWcTypography hierarchy="p" label={SUMMARY_STATS.total} size="xl" weight="semibold" />
                </ModusWcCard>
                <ModusWcCard bordered={false} padding="compact">
                  <ModusWcTypography
                    customClass="usage-dashboard-muted"
                    hierarchy="p"
                    label="Included"
                    size="sm"
                  />
                  <ModusWcTypography hierarchy="p" label={SUMMARY_STATS.included} size="xl" weight="semibold" />
                </ModusWcCard>
                <ModusWcCard bordered={false} padding="compact">
                  <ModusWcTypography
                    customClass="usage-dashboard-muted"
                    hierarchy="p"
                    label="On-demand"
                    size="sm"
                  />
                  <ModusWcTypography hierarchy="p" label={SUMMARY_STATS.onDemand} size="xl" weight="semibold" />
                </ModusWcCard>
              </div>
            </ModusWcCard>

            {/* Usage chart */}
            <ModusWcCard bordered padding="compact">
              <div className="usage-dashboard-chart-title mb-4" slot="title">
                <div className="usage-dashboard-chart-heading">
                  <ModusWcTypography hierarchy="h2" label="Your usage" size="md" weight="semibold" />
                  <ModusWcTypography
                    customClass="usage-dashboard-muted"
                    hierarchy="p"
                    label="Your usage per day across this billing period."
                    size="sm"
                  />
                </div>
                <div className="usage-dashboard-chart-controls">
                  <ModusWcSelect
                    label="Group by"
                    options={[...GROUP_BY_OPTIONS]}
                    size="sm"
                    value={groupBy}
                    onInputChange={(event: CustomEvent) => setGroupBy(readInputString(event) as GroupByOption)}
                  />
                  <ModusWcSelect
                    label="Metric"
                    options={[...METRIC_OPTIONS]}
                    size="sm"
                    value={metric}
                    onInputChange={(event: CustomEvent) => setMetric(readInputString(event) as MetricOption)}
                  />
                </div>
              </div>

              <div className="usage-dashboard-chart-wrap">
                <ResponsiveContainer
                  debounce={0}
                  height="100%"
                  initialDimension={{ height: 280, width: 720 }}
                  minHeight={280}
                  minWidth={0}
                  width="100%"
                >
                  <AreaChart data={CHART_DATA}>
                    <CartesianGrid stroke="var(--modus-wc-color-base-200)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      stroke="var(--modus-wc-color-base-content-low-contrast)"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="var(--modus-wc-color-base-content-low-contrast)"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value: number) => `$${value}`}
                    />
                    <Tooltip
                      {...CHART_TOOLTIP_STYLE}
                      formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Cumulative spend']}
                    />
                    <Legend />
                    <Area
                      dataKey="grok"
                      fill="var(--modus-wc-color-primary)"
                      fillOpacity={0.2}
                      name={CHART_SERIES[0].label}
                      stroke="var(--modus-wc-color-primary)"
                      type="monotone"
                    />
                    <Area
                      dataKey="composerFast"
                      fill="var(--modus-wc-color-success)"
                      fillOpacity={0.18}
                      name={CHART_SERIES[1].label}
                      stroke="var(--modus-wc-color-success)"
                      type="monotone"
                    />
                    <Area
                      dataKey="composer"
                      fill="var(--modus-wc-color-warning)"
                      fillOpacity={0.16}
                      name={CHART_SERIES[2].label}
                      stroke="var(--modus-wc-color-warning)"
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ModusWcCard>

            {/* Usage log table */}
            <ModusWcCard bordered padding="compact">
              <div className="usage-dashboard-table-title mb-4" slot="title">
                <ModusWcTypography hierarchy="h2" label="Usage log" size="md" weight="semibold" />
                <ModusWcButton color="primary" size="sm" variant="filled" onButtonClick={handleExportCsv}>
                  <ModusWcIcon decorative name="export" size="xs" />
                  Export CSV
                </ModusWcButton>
              </div>
              <div className="usage-dashboard-table-wrap min-w-0">
                {tableReady && (
                  <ModusWcTable columns={TABLE_COLUMNS} data={USAGE_LOG_ROWS} density="comfortable" zebra />
                )}
              </div>
            </ModusWcCard>
          </div>
        </main>
      </div>
    </div>
  );
}
