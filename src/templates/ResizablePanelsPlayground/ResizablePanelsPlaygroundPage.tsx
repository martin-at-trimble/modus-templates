import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ModusWcAlert,
  ModusWcBadge,
  ModusWcButton,
  ModusWcButtonGroup,
  ModusWcCard,
  ModusWcIcon,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import {
  RESIZABLE_PANEL_MIN_HEIGHT_PX,
  RESIZABLE_PANEL_MIN_WIDTH_PX,
  ResizablePanels,
  type ResizablePanelsDirection,
} from '../../lib/ResizablePanels';
import './ResizablePanelsPlaygroundPage.css';

const HANDLE_GUTTER_PX = 8;
const PANEL_COUNT_OPTIONS = [1, 2, 3, 4] as const;
const DEMO_PANELS = [
  {
    id: 'library',
    title: 'Library',
    icon: 'folder_closed',
    body: 'Drag the gutter on the right (or below, when vertical) to grow this panel.',
  },
  {
    id: 'workspace',
    title: 'Workspace',
    icon: 'dashboard',
    body: 'This panel absorbs leftover space. It cannot shrink below the minimum.',
  },
  {
    id: 'inspector',
    title: 'Inspector',
    icon: 'window_side_panel',
    body: 'A third panel. Hide it with the panel count control to try a two-pane split.',
  },
  {
    id: 'queue',
    title: 'Queue',
    icon: 'apps',
    body: 'A fourth panel. Four columns stack once the canvas is narrower than the minimum.',
  },
] as const;

type PanelCount = (typeof PANEL_COUNT_OPTIONS)[number];

function neededCanvasPx(direction: ResizablePanelsDirection, count: PanelCount): number {
  if (count <= 1) return 0;
  const min =
    direction === 'horizontal' ? RESIZABLE_PANEL_MIN_WIDTH_PX : RESIZABLE_PANEL_MIN_HEIGHT_PX;
  return count * min + (count - 1) * HANDLE_GUTTER_PX;
}

function readPaneSizes(root: HTMLElement, direction: ResizablePanelsDirection): number[] {
  return [...root.querySelectorAll<HTMLElement>('.modus-resizable-panels__pane')]
    .filter((el) => !el.hasAttribute('hidden'))
    .map((el) =>
      direction === 'horizontal' ? Math.round(el.getBoundingClientRect().width) : Math.round(el.getBoundingClientRect().height),
    );
}

export default function ResizablePanelsPlaygroundPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<PanelCount>(3);
  const [direction, setDirection] = useState<ResizablePanelsDirection>('horizontal');
  const [resetToken, setResetToken] = useState(0);
  const [stacked, setStacked] = useState(false);
  const [paneSizes, setPaneSizes] = useState<number[]>([]);

  useEffect(() => {
    document.title = 'Resizable panels';
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.querySelector<HTMLElement>('.modus-resizable-panels');
    if (!canvas || !root) return;

    const update = () => {
      setStacked(root.getAttribute('data-stacked') === 'true');
      setPaneSizes(readPaneSizes(root, direction));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    root.querySelectorAll('.modus-resizable-panels__pane').forEach((pane) => observer.observe(pane));
    return () => observer.disconnect();
  }, [count, direction, resetToken]);

  const threshold = neededCanvasPx(direction, count);
  const sizeUnit = direction === 'horizontal' ? 'wide' : 'tall';
  const minLabel =
    direction === 'horizontal'
      ? `${RESIZABLE_PANEL_MIN_WIDTH_PX}px min-width`
      : `${RESIZABLE_PANEL_MIN_HEIGHT_PX}px min-height`;

  return (
    <div className="resizable-playground flex min-h-0 min-w-0 flex-1 flex-col bg-(--modus-wc-color-base-page)">
      <ModusWcTypography
        hierarchy="h1"
        size="md"
        weight="semibold"
        label="Resizable panels"
        customClass="resizable-playground-sr-only"
      />

      {/* Intro + controls */}
      <header className="resizable-playground-header px-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <ModusWcIcon name="window_resize" decorative />
            <ModusWcTypography
              hierarchy="h2"
              size="lg"
              weight="semibold"
              label="Resizable panels"
            />
            <ModusWcBadge size="sm" variant="filled" color="default">
              Playground
            </ModusWcBadge>
            <ModusWcBadge
              size="sm"
              variant={stacked ? 'filled' : 'outlined'}
              color="default"
            >
              {stacked ? 'Stacked' : 'Split'}
            </ModusWcBadge>
          </div>
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            label="Drag the Modus handles between cards. Change count and direction, then resize the window."
            customClass="resizable-playground-muted"
          />
        </div>

        <div className="resizable-playground-controls">
          <div className="resizable-playground-control">
            <ModusWcTypography hierarchy="p" size="sm" weight="semibold" label="Panels" />
            <ModusWcButtonGroup
              selectionType="single"
              variant="outlined"
              color="tertiary"
              aria-label="Panel count"
            >
              {PANEL_COUNT_OPTIONS.map((value) => (
                <ModusWcButton
                  key={value}
                  size="sm"
                  pressed={count === value}
                  onButtonClick={() => setCount(value)}
                >
                  {value}
                </ModusWcButton>
              ))}
            </ModusWcButtonGroup>
          </div>

          <div className="resizable-playground-control">
            <ModusWcTypography hierarchy="p" size="sm" weight="semibold" label="Direction" />
            <ModusWcButtonGroup
              selectionType="single"
              variant="outlined"
              color="tertiary"
              aria-label="Panel direction"
            >
              <ModusWcButton
                size="sm"
                pressed={direction === 'horizontal'}
                onButtonClick={() => setDirection('horizontal')}
              >
                <ModusWcIcon name="drag_horizontal" size="xs" decorative />
                Horizontal
              </ModusWcButton>
              <ModusWcButton
                size="sm"
                pressed={direction === 'vertical'}
                onButtonClick={() => setDirection('vertical')}
              >
                <ModusWcIcon name="drag_vertical" size="xs" decorative />
                Vertical
              </ModusWcButton>
            </ModusWcButtonGroup>
          </div>

          <div className="resizable-playground-control">
            <ModusWcTypography hierarchy="p" size="sm" weight="semibold" label="Sizes" />
            <ModusWcButton
              variant="outlined"
              color="tertiary"
              size="sm"
              onButtonClick={() => setResetToken((token) => token + 1)}
            >
              <ModusWcIcon name="refresh" size="xs" decorative />
              Reset sizes
            </ModusWcButton>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6">
        <ModusWcAlert
          variant="info"
          role="status"
          alertTitle="How to try it"
          alertDescription={
            count === 1
              ? `A single panel fills the canvas. Add more panels to drag handles. Each panel stays at least ${minLabel}.`
              : `Each panel stays at least ${minLabel}. With ${count} panels in ${direction} direction, the layout stacks when the canvas is under ${threshold}px ${direction === 'horizontal' ? 'wide' : 'tall'}. Focus a handle and use arrow keys (Shift for larger steps).`
          }
        />
      </div>

      {paneSizes.length > 0 ? (
        <div className="resizable-playground-readout px-4 sm:px-6" aria-live="polite">
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            label={`Live ${sizeUnit}: ${paneSizes.map((size, index) => `P${index + 1} ${size}px`).join(' · ')}`}
            customClass="resizable-playground-muted"
          />
        </div>
      ) : null}

      {/* Canvas: the pattern under test */}
      <div ref={canvasRef} className="resizable-playground-canvas px-4 sm:px-6">
        <ResizablePanels
          key={`${direction}-${resetToken}`}
          direction={direction}
          className="resizable-playground-panels"
        >
          {DEMO_PANELS.map((panel, index) => (
            <div
              key={panel.id}
              hidden={index >= count}
              className="resizable-playground-pane"
            >
              <ModusWcCard
                bordered={true}
                padding="compact"
                className="h-full min-h-0 w-full"
                customClass="resizable-playground-card"
              >
                <div
                  slot="title"
                  className="mb-4 flex w-full min-w-0 items-center justify-start gap-2"
                >
                  <ModusWcIcon name={panel.icon} decorative />
                  <ModusWcTypography
                    hierarchy="h3"
                    size="md"
                    weight="semibold"
                    label={panel.title}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <ModusWcTypography hierarchy="p" size="sm" label={panel.body} />
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    label={minLabel}
                    customClass="resizable-playground-muted"
                  />
                </div>
              </ModusWcCard>
            </div>
          ))}
        </ResizablePanels>
      </div>
    </div>
  );
}
