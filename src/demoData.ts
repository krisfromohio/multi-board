export type SourceSystem = 'JIRA' | 'SERVICENOW' | 'NOVA';
export type BoardColumnId = 'BACKLOG' | 'TODO' | 'READY' | 'DONE';

export interface DemoWorkItem {
  key: string;
  sourceSystem: SourceSystem;
  sourceId: string;
  name: string;
  sourceAssignee: string;
  teamAssignee: string | null;
  storyPoints: number | null;
  sprint: string | null;
  boardColumn: BoardColumnId | null;
  description: string;
}

export const columns: Array<{ id: BoardColumnId; name: string }> = [
  { id: 'BACKLOG', name: 'Backlog' },
  { id: 'TODO', name: 'To Do' },
  { id: 'READY', name: 'Ready' },
  { id: 'DONE', name: 'Done' },
];

export const demoItems: DemoWorkItem[] = [
  {
    key: 'JIRA:APP-2481',
    sourceSystem: 'JIRA',
    sourceId: 'APP-2481',
    name: 'Improve medication reconciliation workflow',
    sourceAssignee: 'Jordan Lee',
    teamAssignee: 'Maya',
    storyPoints: 5,
    sprint: 'Sprint 19',
    boardColumn: 'READY',
    description: 'Reduce unnecessary navigation during medication reconciliation.',
  },
  {
    key: 'SERVICENOW:INC0018472',
    sourceSystem: 'SERVICENOW',
    sourceId: 'INC0018472',
    name: 'Resolve intermittent interface queue failures',
    sourceAssignee: 'Operations Queue',
    teamAssignee: 'Noah',
    storyPoints: 3,
    sprint: 'Sprint 19',
    boardColumn: 'TODO',
    description: 'Investigate and remediate recurring integration queue failures.',
  },
  {
    key: 'NOVA:NOVA-731',
    sourceSystem: 'NOVA',
    sourceId: 'NOVA-731',
    name: 'Validate inpatient discharge configuration',
    sourceAssignee: 'Priya Shah',
    teamAssignee: 'Maya',
    storyPoints: 8,
    sprint: 'Sprint 19',
    boardColumn: 'BACKLOG',
    description: 'Validate discharge configuration against current operational workflow.',
  },
  {
    key: 'JIRA:DATA-912',
    sourceSystem: 'JIRA',
    sourceId: 'DATA-912',
    name: 'Correct nightly census feed mapping',
    sourceAssignee: 'Sam Wilson',
    teamAssignee: null,
    storyPoints: 2,
    sprint: 'Sprint 19',
    boardColumn: 'DONE',
    description: 'Correct facility mapping for the nightly census feed.',
  },
  {
    key: 'SERVICENOW:REQ0043921',
    sourceSystem: 'SERVICENOW',
    sourceId: 'REQ0043921',
    name: 'Provision test environment integration account',
    sourceAssignee: 'Platform Services',
    teamAssignee: null,
    storyPoints: null,
    sprint: null,
    boardColumn: null,
    description: 'Provision a synthetic test-only integration account.',
  },
  {
    key: 'NOVA:NOVA-744',
    sourceSystem: 'NOVA',
    sourceId: 'NOVA-744',
    name: 'Review ambulatory scheduling rule changes',
    sourceAssignee: 'Avery Chen',
    teamAssignee: 'Elena',
    storyPoints: 5,
    sprint: null,
    boardColumn: null,
    description: 'Review requested scheduling rule changes before refinement.',
  },
];

export const teamMembers = ['All', 'Maya', 'Noah', 'Elena', 'Unassigned'];
