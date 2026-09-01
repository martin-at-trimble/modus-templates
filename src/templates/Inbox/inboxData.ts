export type InboxFolderId =
  | 'inbox'
  | 'starred'
  | 'snoozed'
  | 'sent'
  | 'drafts'
  | 'categories'
  | 'more';

export type InboxAppId = 'mail' | 'chat' | 'meet';

export type InboxMessage = {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  unread: boolean;
  hasCalendarInvite?: boolean;
};

export type InboxFolder = {
  id: InboxFolderId;
  label: string;
  icon: string;
  count?: number;
};

export type InboxLabel = {
  id: string;
  label: string;
};

export const INBOX_FOLDERS: InboxFolder[] = [
  { id: 'inbox', label: 'Inbox', icon: 'email', count: 1 },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'snoozed', label: 'Snoozed', icon: 'clock' },
  { id: 'sent', label: 'Sent', icon: 'form_send' },
  { id: 'drafts', label: 'Drafts', icon: 'folder_closed' },
  { id: 'categories', label: 'Categories', icon: 'filter_list' },
  { id: 'more', label: 'More', icon: 'more_horizontal' },
];

export const INBOX_LABELS: InboxLabel[] = [
  { id: 'imap-drafts', label: '[Imap]/Drafts' },
  { id: 'notes', label: 'Notes' },
];

export const INBOX_MESSAGES: InboxMessage[] = [
  {
    id: 'msg-1',
    sender: 'Sebastien Vielliard',
    subject: 'Trimble Voice — weekly recap',
    snippet: 'Highlights from last week across product and field teams…',
    receivedAt: '6:50 AM',
    unread: true,
  },
  {
    id: 'msg-2',
    sender: 'Doug Ollivier',
    subject: 'Google Workspace new hire onboarding',
    snippet: 'Your onboarding checklist for week one is ready to review.',
    receivedAt: '6:12 AM',
    unread: true,
  },
  {
    id: 'msg-3',
    sender: 'Jennifer Ross',
    subject: 'Invitation: Q3 planning sync',
    snippet: 'Jennifer Ross has invited you to a meeting on Thursday at 10:00 AM.',
    receivedAt: 'Yesterday',
    unread: false,
    hasCalendarInvite: true,
  },
  {
    id: 'msg-4',
    sender: 'Cursor Team',
    subject: 'Ship code from your phone',
    snippet: 'Run agents, review diffs, and merge from mobile with the latest release.',
    receivedAt: 'Aug 31',
    unread: false,
  },
  {
    id: 'msg-5',
    sender: 'Rob Painter',
    subject: 'CEO update — August',
    snippet: 'A note on priorities for the remainder of the quarter.',
    receivedAt: 'Aug 31',
    unread: false,
  },
  {
    id: 'msg-6',
    sender: 'AskPayroll',
    subject: 'Trimble payroll — direct deposit confirmed',
    snippet: 'Your direct deposit settings were updated successfully.',
    receivedAt: 'Aug 30',
    unread: false,
  },
  {
    id: 'msg-7',
    sender: 'Trimble Talent Team',
    subject: 'Trimble week 3 — learning resources',
    snippet: 'Recommended courses and office hours for new hires.',
    receivedAt: 'Aug 30',
    unread: false,
  },
  {
    id: 'msg-8',
    sender: 'Google Ads',
    subject: 'Your campaign performance summary',
    snippet: 'Clicks and impressions increased compared to the prior period.',
    receivedAt: 'Aug 29',
    unread: false,
  },
  {
    id: 'msg-9',
    sender: 'GitHub',
    subject: 'Your free Copilot access is ready',
    snippet: 'Enable Copilot on your Trimble organization repositories.',
    receivedAt: 'Aug 29',
    unread: false,
  },
  {
    id: 'msg-10',
    sender: 'Jared Bloch',
    subject: 'Design review — Modus inbox patterns',
    snippet: 'Sharing notes from the desktop mail layout review.',
    receivedAt: 'Aug 28',
    unread: false,
  },
  {
    id: 'msg-11',
    sender: 'IT Service Desk',
    subject: 'VPN certificate renewal',
    snippet: 'Your device certificate expires in 14 days. Renew before travel.',
    receivedAt: 'Aug 28',
    unread: false,
  },
  {
    id: 'msg-12',
    sender: 'Facilities',
    subject: 'Westminster office — desk booking',
    snippet: 'Reserved desks for the week of September 8 are now open.',
    receivedAt: 'Aug 27',
    unread: false,
  },
];

export const INBOX_PAGE_SIZE = 50;
export const INBOX_TOTAL_COUNT = 95;
