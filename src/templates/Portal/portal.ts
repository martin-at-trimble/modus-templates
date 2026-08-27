export type PortalFileKind = 'sheet' | 'doc' | 'pdf' | 'slides' | 'audio';

export type PortalFile = {
  id: string;
  title: string;
  meta: string;
  kind: PortalFileKind;
  icon: string;
  /** Replace with the document URL when wiring this template. */
  href: string;
};

export type PortalShortcut = {
  id: string;
  label: string;
  icon?: string;
  emblem?: boolean;
  extra?: boolean;
  href?: string;
};

export type PortalCalendarEvent = {
  id: string;
  title: string;
  time: string;
  location: string;
  href?: string;
};

export const PORTAL_SHORTCUTS: PortalShortcut[] = [
  { id: 'chip', label: 'Chip', icon: 'code' },
  { id: 'trimble', label: 'Trimble', emblem: true },
  { id: 'modus-ai', label: 'Modus AI', icon: 'stars' },
  { id: 'lightning', label: 'Workflows', icon: 'lightning' },
  { id: 'connect', label: 'Connect', icon: 'folder_project' },
  { id: 'reports', label: 'Reports', icon: 'document' },
  { id: 'images', label: 'Images', icon: 'image', extra: true },
  { id: 'settings', label: 'Settings', icon: 'settings', extra: true },
];

export const PORTAL_FILES: PortalFile[] = [
  {
    id: 'backlog',
    title: 'Modus Backlog',
    meta: 'Sunderrajan Thiruvengadathan edited yesterday',
    kind: 'sheet',
    icon: 'file_type_xls',
    href: '#',
  },
  {
    id: 'workshop',
    title: '[TW151] Product Prototyping Workshop',
    meta: 'You opened in the past week',
    kind: 'doc',
    icon: 'file_type_doc',
    href: '#',
  },
  {
    id: 'spec',
    title: 'Portal template specification',
    meta: 'Alex Rivera edited 2 days ago',
    kind: 'pdf',
    icon: 'file_type_pdf',
    href: '#',
  },
  {
    id: 'review',
    title: 'Quarterly operations review',
    meta: 'You opened yesterday',
    kind: 'slides',
    icon: 'file_bar_graph',
    href: '#',
  },
  {
    id: 'standup',
    title: 'Standup recording — Aug 21',
    meta: 'Shared with you this week',
    kind: 'audio',
    icon: 'mic',
    href: '#',
  },
  {
    id: 'field',
    title: 'Field hours workbook',
    meta: 'Jordan Lee edited this week',
    kind: 'sheet',
    icon: 'file_type_xls',
    href: '#',
  },
];

export const PORTAL_MEETINGS: PortalCalendarEvent[] = [
  {
    id: 'backlog',
    title: 'Modus Backlog',
    time: '10:00 AM - 11:00 AM',
    location: 'Conference Room A',
    href: '#',
  },
  {
    id: 'workshop',
    title: '[TW151] Product Prototyping Workshop',
    time: '2:00 PM - 4:00 PM',
    location: 'Training Room B',
    href: '#',
  },
  {
    id: 'spec',
    title: 'Portal template specification',
    time: '9:00 AM - 10:00 AM',
    location: 'Office',
    href: '#',
  },
  {
    id: 'review',
    title: 'Quarterly operations review',
    time: '3:00 PM - 5:00 PM',
    location: 'Conference Room C',
    href: '#',
  },
  {
    id: 'standup',
    title: 'Standup recording — Aug 21',
    time: '9:30 AM - 10:00 AM',
    location: 'Office',
    href: '#',
  },
  {
    id: 'field',
    title: 'Field hours workbook',
    time: '11:00 AM - 12:00 PM',
    location: 'Field Office',
    href: '#',
  },
];