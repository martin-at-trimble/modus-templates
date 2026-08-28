export interface MenuOption {
  label: string;
  value: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  menuOptions?: MenuOption[];
}

export interface GettingStartedItem {
  id: string;
  title: string;
  description: string;
  ctaLabel?: string;
  defaultOpen: boolean;
}

export const askModeOptions: MenuOption[] = [
  { label: 'Ask', value: 'ask' },
  { label: 'Agent', value: 'agent' },
  { label: 'Plan', value: 'plan' },
];

export const repoScopeOptions: MenuOption[] = [
  { label: 'All repositories', value: 'all' },
  { label: 'modus-templates', value: 'modus-templates' },
];

export const quickActionsRowOne: QuickAction[] = [
  { id: 'debug', label: 'Debug', icon: 'bug' },
  { id: 'agent', label: 'Agent', icon: 'ai_stars' },
  {
    id: 'create-issue',
    label: 'Create issue',
    icon: 'circle_outline',
  },
  {
    id: 'write-code',
    label: 'Write code',
    icon: 'code',
    menuOptions: [
      { label: 'New file', value: 'new-file' },
      { label: 'New branch', value: 'new-branch' },
    ],
  },
  {
    id: 'git',
    label: 'Git',
    icon: 'file_merge',
    menuOptions: [
      { label: 'Clone repository', value: 'clone' },
      { label: 'Create branch', value: 'branch' },
    ],
  },
  {
    id: 'pull-requests',
    label: 'Pull requests',
    icon: 'compare_arrows',
    menuOptions: [
      { label: 'Your pull requests', value: 'yours' },
      { label: 'Review requests', value: 'review' },
    ],
  },
];

export const gettingStartedItems: GettingStartedItem[] = [
  {
    id: 'first-project',
    title: 'Create your first code project',
    description: "It's your own space to experiment, learn, and share code with the world.",
    ctaLabel: 'Create project',
    defaultOpen: true,
  },
  {
    id: 'copilot-chat',
    title: 'Start a Copilot chat',
    description: 'Get instant answers and code suggestions from Copilot as you work.',
    defaultOpen: false,
  },
];
