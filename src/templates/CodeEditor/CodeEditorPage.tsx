import { useEffect, useRef, useState } from 'react';
import {
  ModusWcBadge,
  ModusWcButton,
  ModusWcDropdownMenu,
  ModusWcIcon,
  ModusWcMenuItem,
  ModusWcSelect,
  ModusWcTabs,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ITab } from '@trimble-oss/moduswebcomponents';

import { readInputString } from '../../lib/modusFormEvents';
import { ResizablePanels } from '../../lib/ResizablePanels';
import {
  initialCode,
  initialTestCases,
  languageOptions,
  problem,
  type TestCase,
} from './codeEditorData';
import './CodeEditorPage.css';

const RESULT_TABS: ITab[] = [{ label: 'Testcase' }, { label: 'Test result' }];

const DIFFICULTY_COLOR: Record<typeof problem.difficulty, 'success' | 'warning' | 'danger'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

// Below this width the problem panel stacks above the editor instead of sitting beside it.
const MOBILE_BREAKPOINT_PX = 768;

function useIsNarrowViewport(breakpointPx: number): boolean {
  const query = `(max-width: ${breakpointPx - 1}px)`;
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const onChange = () => setIsNarrow(mediaQueryList.matches);
    onChange();
    mediaQueryList.addEventListener('change', onChange);
    return () => mediaQueryList.removeEventListener('change', onChange);
  }, [query]);

  return isNarrow;
}

// Uncontrolled dropdowns stay open after a selection unless closed manually.
function closeDropdownFromEvent(e: CustomEvent) {
  const trigger = (e.target as HTMLElement | null)?.closest('modus-wc-dropdown-menu') as
    | (HTMLElement & { menuVisible: boolean })
    | null;
  if (trigger) {
    trigger.menuVisible = false;
  }
}

export default function CodeEditorPage() {
  useEffect(() => {
    document.title = 'Code editor';
  }, []);

  const isMobileViewport = useIsNarrowViewport(MOBILE_BREAKPOINT_PX);

  // ----- Editor state -----
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [code, setCode] = useState(initialCode);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = code.split('\n').length;

  const syncGutterScroll = () => {
    if (editorRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  // ----- Test panel state -----
  const [resultTabIndex, setResultTabIndex] = useState(0);
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [activeCaseId, setActiveCaseId] = useState(initialTestCases[0].id);
  const activeCase = testCases.find((testCase) => testCase.id === activeCaseId) ?? testCases[0];

  const addTestCase = () => {
    const nextIndex = testCases.length + 1;
    const nextCase: TestCase = {
      id: `case-${nextIndex}`,
      label: `Case ${nextIndex}`,
      value: activeCase?.value ?? '',
    };
    setTestCases((prev) => [...prev, nextCase]);
    setActiveCaseId(nextCase.id);
  };

  const updateActiveCaseValue = (value: string) => {
    setTestCases((prev) =>
      prev.map((testCase) => (testCase.id === activeCaseId ? { ...testCase, value } : testCase)),
    );
  };

  return (
    <div className="code-editor-page">
      <ModusWcTypography
        hierarchy="h1"
        size="md"
        weight="semibold"
        label={`${problem.number}. ${problem.title}`}
        customClass="code-editor-sr-only"
      />

      {/* ===== Header: problem breadcrumb + run/submit actions ===== */}
      <header className="ce-header">
        <ModusWcTypography
          hierarchy="p"
          size="md"
          weight="semibold"
          customClass="ce-inline-text"
          label={`${problem.number}. ${problem.title}`}
        />
        <div className="ce-header-actions">
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            shape="circle"
            size="md"
            buttonAriaLabel="Run"
          >
            <ModusWcIcon name="play_circle" decorative />
          </ModusWcButton>
          <ModusWcButton variant="filled" color="primary" size="sm">
            <ModusWcIcon name="upload" size="xs" decorative />
            Submit
          </ModusWcButton>
        </div>
      </header>

      {/* ===== Split workspace: problem panel | editor + testcase panel ===== */}
      <div className="ce-workspace">
        <ResizablePanels
          direction={isMobileViewport ? 'vertical' : 'horizontal'}
          className="ce-outer-split"
        >
          {/* ----- Left: problem statement ----- */}
          <section className="ce-problem-panel" aria-label="Problem statement">
            <div className="ce-problem-title-row">
              <ModusWcTypography
                hierarchy="h2"
                size="lg"
                weight="bold"
                customClass="ce-inline-text"
                label={`${problem.number}. ${problem.title}`}
              />
              {problem.solved && (
                <ModusWcBadge size="sm" variant="filled" color="success">
                  Solved
                </ModusWcBadge>
              )}
            </div>

            <ModusWcBadge size="sm" variant="outlined" color={DIFFICULTY_COLOR[problem.difficulty]}>
              {problem.difficulty}
            </ModusWcBadge>

            <div className="ce-problem-body">
              {problem.description.map((paragraph, index) => (
                <ModusWcTypography key={index} hierarchy="p" size="sm" label={paragraph} />
              ))}
            </div>

            {problem.examples.map((example) => (
              <div className="ce-example" key={example.title}>
                <ModusWcTypography
                  hierarchy="p"
                  size="sm"
                  weight="semibold"
                  customClass="ce-inline-text"
                  label={example.title}
                />
                <p className="ce-example-line">
                  <span className="ce-example-label">Input:</span> {example.input}
                </p>
                <p className="ce-example-line">
                  <span className="ce-example-label">Output:</span> {example.output}
                </p>
                <ModusWcTypography
                  hierarchy="p"
                  size="sm"
                  customClass="ce-example-explanation"
                  label={`Explanation: ${example.explanation}`}
                />
              </div>
            ))}

            <div className="ce-constraints">
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                weight="semibold"
                customClass="ce-inline-text"
                label="Constraints:"
              />
              <ul className="ce-constraints-list">
                {problem.constraints.map((constraint) => (
                  <li key={constraint}>
                    <ModusWcTypography
                      hierarchy="p"
                      size="sm"
                      customClass="ce-inline-text"
                      label={constraint}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* ----- Footer: reactions + presence ----- */}
            <div className="ce-problem-footer">
              <div className="ce-problem-footer-actions">
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  buttonAriaLabel="Like"
                >
                  <ModusWcIcon name="thumbs_up" size="xs" decorative />
                </ModusWcButton>
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  buttonAriaLabel="Dislike"
                >
                  <ModusWcIcon name="thumbs_down" size="xs" decorative />
                </ModusWcButton>
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  buttonAriaLabel="Comments"
                >
                  <ModusWcIcon name="comment" size="xs" decorative />
                </ModusWcButton>
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  buttonAriaLabel="Add to favorites"
                >
                  <ModusWcIcon name="star" size="xs" decorative />
                </ModusWcButton>
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  buttonAriaLabel="Share"
                >
                  <ModusWcIcon name="share" size="xs" decorative />
                </ModusWcButton>
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  buttonAriaLabel="Help"
                >
                  <ModusWcIcon name="help" size="xs" decorative />
                </ModusWcButton>
              </div>
              <div className="ce-presence">
                <span className="ce-presence-dot" aria-hidden="true" />
                <ModusWcTypography
                  hierarchy="p"
                  size="sm"
                  customClass="ce-muted-text ce-inline-text"
                  label="3 online"
                />
              </div>
            </div>
          </section>

          {/* ----- Right: editor + testcase panel (vertical split) ----- */}
          <div className="ce-editor-column">
            <ResizablePanels direction="vertical" className="ce-inner-split">
              {/* ----- Editor ----- */}
              <div className="ce-editor-pane">
                <div className="ce-editor-toolbar">
                  <ModusWcSelect
                    aria-label="Language"
                    size="sm"
                    options={languageOptions}
                    value={language}
                    onInputChange={(e) => setLanguage(readInputString(e))}
                    customClass="ce-language-select"
                  />
                  <div className="ce-editor-toolbar-actions">
                    <ModusWcDropdownMenu
                      buttonAriaLabel="Auto-save settings"
                      buttonVariant="borderless"
                      buttonColor="tertiary"
                      buttonSize="sm"
                      menuPlacement="bottom-end"
                    >
                      <div slot="button" className="ce-dropdown-trigger-content">
                        <ModusWcIcon name="lock" size="xs" decorative />
                        Auto
                      </div>
                      <div slot="menu">
                        <ModusWcMenuItem
                          label="Auto save"
                          value="auto"
                          selected
                          onItemSelect={closeDropdownFromEvent}
                        />
                        <ModusWcMenuItem
                          label="Manual save"
                          value="manual"
                          onItemSelect={closeDropdownFromEvent}
                        />
                      </div>
                    </ModusWcDropdownMenu>
                    <ModusWcButton
                      variant="borderless"
                      color="tertiary"
                      shape="square"
                      size="sm"
                      buttonAriaLabel="Layout options"
                    >
                      <ModusWcIcon name="list_bulleted" size="xs" decorative />
                    </ModusWcButton>
                    <ModusWcButton
                      variant="borderless"
                      color="tertiary"
                      shape="square"
                      size="sm"
                      buttonAriaLabel="Add to favorites"
                    >
                      <ModusWcIcon name="star" size="xs" decorative />
                    </ModusWcButton>
                    <ModusWcButton
                      variant="borderless"
                      color="tertiary"
                      shape="square"
                      size="sm"
                      buttonAriaLabel="Format code"
                    >
                      <ModusWcIcon name="code" size="xs" decorative />
                    </ModusWcButton>
                    <ModusWcButton
                      variant="borderless"
                      color="tertiary"
                      shape="square"
                      size="sm"
                      buttonAriaLabel="Submission history"
                    >
                      <ModusWcIcon name="history" size="xs" decorative />
                    </ModusWcButton>
                    <ModusWcButton
                      variant="borderless"
                      color="tertiary"
                      shape="square"
                      size="sm"
                      buttonAriaLabel="Full screen"
                    >
                      <ModusWcIcon name="full_screen" size="xs" decorative />
                    </ModusWcButton>
                  </div>
                </div>

                <div className="ce-editor-surface">
                  <div className="ce-editor-gutter" ref={gutterRef} aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, index) => (
                      <span key={index}>{index + 1}</span>
                    ))}
                  </div>
                  <textarea
                    ref={editorRef}
                    className="ce-editor-textarea"
                    aria-label="Code editor"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    onScroll={syncGutterScroll}
                  />
                </div>
              </div>

              {/* ----- Testcase / test result panel ----- */}
              <div className="ce-testpanel">
                <ModusWcTabs
                  size="sm"
                  tabStyle="none"
                  tabs={RESULT_TABS}
                  activeTabIndex={resultTabIndex}
                  onTabChange={(e) => setResultTabIndex(e.detail.newTab)}
                  aria-label="Testcase and result"
                />

                <div className="ce-testpanel-body" hidden={resultTabIndex !== 0}>
                  <div className="ce-case-row" role="group" aria-label="Test cases">
                    {testCases.map((testCase) => (
                      <ModusWcButton
                        key={testCase.id}
                        variant={testCase.id === activeCaseId ? 'filled' : 'outlined'}
                        color="tertiary"
                        size="sm"
                        onButtonClick={() => setActiveCaseId(testCase.id)}
                      >
                        {testCase.label}
                      </ModusWcButton>
                    ))}
                    <ModusWcButton
                      variant="outlined"
                      color="tertiary"
                      shape="square"
                      size="sm"
                      buttonAriaLabel="Add test case"
                      onButtonClick={addTestCase}
                    >
                      <ModusWcIcon name="add" size="xs" decorative />
                    </ModusWcButton>
                  </div>

                  {activeCase && (
                    <div className="ce-case-field">
                      <ModusWcTypography
                        hierarchy="p"
                        size="sm"
                        customClass="ce-muted-text ce-inline-text ce-mono"
                        label="sides ="
                      />
                      <ModusWcTextInput
                        aria-label="sides value"
                        size="sm"
                        value={activeCase.value}
                        onInputChange={(e) => updateActiveCaseValue(readInputString(e))}
                        customClass="ce-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="ce-testpanel-body ce-testresult-empty" hidden={resultTabIndex !== 1}>
                  <ModusWcIcon name="play_circle" size="lg" decorative />
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    customClass="ce-muted-text"
                    label="Run your code to see the test results here."
                  />
                </div>
              </div>
            </ResizablePanels>
          </div>
        </ResizablePanels>
      </div>
    </div>
  );
}
