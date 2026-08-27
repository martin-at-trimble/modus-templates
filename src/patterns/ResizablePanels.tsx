import {
  Children,
  Fragment,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ModusWcHandle } from '@trimble-oss/moduswebcomponents-react';
import './ResizablePanels.css';

/** Horizontal min size. `modus-wc-handle` reads this from computed `min-width`. */
export const RESIZABLE_PANEL_MIN_WIDTH_PX = 50;
/** Vertical min size. `modus-wc-handle` reads this from computed `min-height`. */
export const RESIZABLE_PANEL_MIN_HEIGHT_PX = 50;
const MAX_PANELS = 4;
/** Compact handle density — matches `--modus-wc-spacing-sm` (8px). */
const HANDLE_GUTTER_PX = 8;
const KEY_STEP_PX = 5;
const KEY_STEP_SHIFT_PX = 15;

export type ResizablePanelsDirection = 'horizontal' | 'vertical';

export type ResizablePanelsProps = {
  /** Row of panels vs a stacked column. When the container cannot fit every panel at min size, the layout stacks and hides handles. */
  direction?: ResizablePanelsDirection;
  /** One to four panel roots. Extra children are ignored. A child with `hidden` stays mounted but is omitted from the split. */
  children: ReactNode;
  className?: string;
};

type DragSession = {
  handleIndex: number;
  startPos: number;
  startSizes: number[];
  mins: number[];
  panes: HTMLElement[];
};

function isHiddenChild(child: ReactNode): boolean {
  return isValidElement<{ hidden?: boolean }>(child) && Boolean(child.props.hidden);
}

function cssId(prefix: string, suffix: string): string {
  return `${prefix}-${suffix}`;
}

function neededSize(direction: ResizablePanelsDirection, count: number): number {
  if (count <= 1) return 0;
  const min =
    direction === 'horizontal' ? RESIZABLE_PANEL_MIN_WIDTH_PX : RESIZABLE_PANEL_MIN_HEIGHT_PX;
  return count * min + (count - 1) * HANDLE_GUTTER_PX;
}

function measurePane(el: HTMLElement, direction: ResizablePanelsDirection): number {
  return direction === 'horizontal' ? el.getBoundingClientRect().width : el.getBoundingClientRect().height;
}

function minForPane(el: HTMLElement, direction: ResizablePanelsDirection): number {
  const raw =
    direction === 'horizontal' ? getComputedStyle(el).minWidth : getComputedStyle(el).minHeight;
  const parsed = Number.parseFloat(raw);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return direction === 'horizontal' ? RESIZABLE_PANEL_MIN_WIDTH_PX : RESIZABLE_PANEL_MIN_HEIGHT_PX;
}

function visiblePanes(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(':scope > .modus-resizable-panels__pane')].filter(
    (el) => !el.hasAttribute('hidden'),
  );
}

function applySizes(
  panes: HTMLElement[],
  sizes: number[],
  direction: ResizablePanelsDirection,
): void {
  panes.forEach((el, index) => {
    const size = `${sizes[index]}px`;
    el.style.flexGrow = '0';
    el.style.flexShrink = '0';
    // Explicit inline flex-basis always wins the cascade over any stylesheet rule
    // (regardless of specificity), so a page's own CSS can safely set `flex-basis`
    // for its default/undragged split without fighting this applied size.
    el.style.flexBasis = size;
    if (direction === 'horizontal') {
      el.style.width = size;
      el.style.height = '';
    } else {
      el.style.height = size;
      el.style.width = '';
    }
  });
}

function clearInlineSizes(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.modus-resizable-panels__pane').forEach((el) => {
    el.style.width = '';
    el.style.height = '';
    el.style.flexGrow = '';
    el.style.flexShrink = '';
    el.style.flexBasis = '';
  });
}

/** Grow the pane on one side of a handle; take leftover from farther panes when a neighbor is at min. */
function cascadeSizes(
  startSizes: number[],
  mins: number[],
  handleIndex: number,
  delta: number,
): number[] {
  const sizes = startSizes.slice();
  if (delta === 0 || sizes.length < 2) return sizes;

  const growIndex = delta > 0 ? handleIndex : handleIndex + 1;
  let remaining = Math.abs(delta);
  const shrinkStart = delta > 0 ? handleIndex + 1 : handleIndex;
  const shrinkStep = delta > 0 ? 1 : -1;

  for (let index = shrinkStart; index >= 0 && index < sizes.length; index += shrinkStep) {
    const available = Math.max(0, sizes[index] - mins[index]);
    const take = Math.min(available, remaining);
    sizes[index] -= take;
    remaining -= take;
    if (remaining <= 0) break;
  }

  sizes[growIndex] += Math.abs(delta) - remaining;
  return sizes;
}

/**
 * 1–4 adjacent panels with Modus `modus-wc-handle` gutters.
 * Dragging a handle grows one side and shrinks the other, cascading past neighbors already at min size.
 */
export function ResizablePanels({
  direction = 'horizontal',
  children,
  className,
}: ResizablePanelsProps) {
  const rawId = useId().replace(/:/g, '');
  const uid = `rp-${rawId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const [stacked, setStacked] = useState(false);

  const items = Children.toArray(children).slice(0, MAX_PANELS);
  const visibleIndexes: number[] = [];
  const hiddenIndexes: number[] = [];
  items.forEach((child, index) => {
    if (isHiddenChild(child)) hiddenIndexes.push(index);
    else visibleIndexes.push(index);
  });
  const visibleCount = visibleIndexes.length;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      if (visibleCount <= 1) {
        setStacked(false);
        return;
      }
      const size = direction === 'horizontal' ? root.clientWidth : root.clientHeight;
      setStacked(size < neededSize(direction, visibleCount));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [direction, visibleCount]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    clearInlineSizes(root);
  }, [direction, stacked, visibleCount]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || stacked) return;

    const eventOptions: AddEventListenerOptions = { passive: false };

    const beginFromHandle = (handleIndex: number, pos: number) => {
      const panes = visiblePanes(root);
      if (handleIndex < 0 || handleIndex >= panes.length - 1) return;
      dragRef.current = {
        handleIndex,
        startPos: pos,
        startSizes: panes.map((el) => measurePane(el, direction)),
        mins: panes.map((el) => minForPane(el, direction)),
        panes,
      };
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    };

    const applyDelta = (delta: number) => {
      const session = dragRef.current;
      if (!session) return;
      applySizes(
        session.panes,
        cascadeSizes(session.startSizes, session.mins, session.handleIndex, delta),
        direction,
      );
    };

    const endDrag = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // With nested ResizablePanels, a gutter's pointer/keyboard events bubble past its own
    // root up through every ancestor instance's root too — `root.contains(gutter)` alone
    // can't tell "my gutter" from "a nested instance's gutter". Only the instance whose
    // root is the gutter's *nearest* `.modus-resizable-panels` ancestor should react.
    const ownsGutter = (gutter: Element): boolean => gutter.closest('.modus-resizable-panels') === root;

    const onPointerDown = (event: PointerEvent) => {
      const gutter = (event.target as HTMLElement | null)?.closest('[data-handle-index]');
      if (!gutter || !root.contains(gutter) || !ownsGutter(gutter)) return;
      const handleIndex = Number(gutter.getAttribute('data-handle-index'));
      if (!Number.isFinite(handleIndex)) return;
      beginFromHandle(handleIndex, direction === 'horizontal' ? event.clientX : event.clientY);
      (gutter as HTMLElement).setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      event.preventDefault();
      const pos = direction === 'horizontal' ? event.clientX : event.clientY;
      applyDelta(pos - dragRef.current.startPos);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const gutter = (event.target as HTMLElement | null)?.closest('[data-handle-index]');
      if (!gutter || !root.contains(gutter) || !ownsGutter(gutter)) return;
      const handleIndex = Number(gutter.getAttribute('data-handle-index'));
      if (!Number.isFinite(handleIndex)) return;
      const horizontal = direction === 'horizontal';
      const forward = horizontal ? 'ArrowRight' : 'ArrowDown';
      const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
      if (event.key !== forward && event.key !== back) return;
      event.preventDefault();
      beginFromHandle(handleIndex, 0);
      const step = event.shiftKey ? KEY_STEP_SHIFT_PX : KEY_STEP_PX;
      applyDelta(event.key === forward ? step : -step);
      const session = dragRef.current;
      if (session) {
        session.startSizes = session.panes.map((el) => measurePane(el, direction));
      }
      endDrag();
    };

    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointermove', onPointerMove, eventOptions);
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
    root.addEventListener('keydown', onKeyDown);

    return () => {
      endDrag();
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove, eventOptions);
      root.removeEventListener('pointerup', endDrag);
      root.removeEventListener('pointercancel', endDrag);
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [direction, stacked, visibleCount]);

  const paneId = (index: number) => cssId(uid, `pane-${index}`);

  const renderPane = (index: number) => {
    const child = items[index];
    const hidden = isHiddenChild(child);
    const isStart = visibleIndexes[0] === index;
    const isEnd = visibleIndexes[visibleIndexes.length - 1] === index;
    const paneClass = [
      'modus-resizable-panels__pane',
      isStart ? 'modus-resizable-panels__pane--start' : '',  // First visible pane — consumers can style (e.g., fixed width)
      isEnd ? 'modus-resizable-panels__pane--end' : '',      // Last visible pane — consumers can style
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={paneId(index)}
        id={paneId(index)}
        hidden={hidden}
        className={paneClass}
      >
        {child}
      </div>
    );
  };

  const renderHandle = (handleIndex: number, leftIndex: number, rightIndex: number) => (
    <div
      key={cssId(uid, `handle-${leftIndex}-${rightIndex}-${direction}`)}
      className="modus-resizable-panels__gutter"
      data-handle-index={handleIndex}
    >
      <ModusWcHandle
        type="bar"
        density="compact"
        size="default"
        defaultSplit={0}
        orientation={direction}
        aria-label={`Resize panel ${leftIndex + 1} and panel ${rightIndex + 1}`}
      />
    </div>
  );

  const renderSplit = (indexes: number[]): ReactNode => {
    if (indexes.length === 0) return null;
    return indexes.map((paneIndex, handleIndex) => (
      <Fragment key={paneId(paneIndex)}>
        {renderPane(paneIndex)}
        {handleIndex < indexes.length - 1
          ? renderHandle(handleIndex, paneIndex, indexes[handleIndex + 1])
          : null}
      </Fragment>
    ));
  };

  const rootClass = ['modus-resizable-panels', className].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      className={rootClass}
      data-direction={direction}
      data-count={visibleCount}
      data-stacked={stacked ? 'true' : undefined}
      role="group"
      aria-label="Resizable panels"
    >
      {stacked ? visibleIndexes.map(renderPane) : renderSplit(visibleIndexes)}
      {hiddenIndexes.map(renderPane)}
    </div>
  );
}
