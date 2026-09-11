export type SourceSystem = 'JIRA' | 'SERVICENOW' | 'NOVA';
export type BoardColumnId = 'BACKLOG' | 'TODO' | 'READY' | 'DONE';

export interface DemoWorkItem {
  key: string;
  sourceSystem: SourceSystem;
  sourceId: string;
  displayId?: string;
  parentId?: string | null;
  sourceUrl: string;
  name: string;
  sourceAssignee: string | null;
  sourceState?: string;
  teamAssignee: string | null;
  storyPoints: number | null;
  sprint: string | null;
  boardColumn: BoardColumnId | null;
  description: string;
}

export const columns: Array<{ id: BoardColumnId; name: string; origin: boolean }> = [
  { id: 'BACKLOG', name: 'Backlog', origin: true },
  { id: 'TODO', name: 'To Do', origin: false },
  { id: 'READY', name: 'Ready', origin: false },
  { id: 'DONE', name: 'Done', origin: false },
];

export const demoItems: DemoWorkItem[] = [
  { key: 'JIRA:APP-2481', sourceSystem: 'JIRA', sourceId: 'APP-2481', sourceUrl: 'https://jira.example.invalid/browse/APP-2481', name: 'Improve medication reconciliation workflow', sourceAssignee: 'Jordan Lee', sourceState: 'To Do', teamAssignee: 'Maya', storyPoints: 5, sprint: 'Sprint 19', boardColumn: 'READY', description: 'Reduce unnecessary navigation during medication reconciliation.' },
  { key: 'SERVICENOW:SCTASK0018472', sourceSystem: 'SERVICENOW', sourceId: 'SCTASK0018472', parentId: 'REQ0043921', sourceUrl: 'https://servicenow.example.invalid/sc_task_list.do?sysparm_query=number%3DSCTASK0018472', name: 'Resolve intermittent interface queue failures', sourceAssignee: 'Operations Queue', sourceState: 'Work in Progress', teamAssignee: 'Noah', storyPoints: 3, sprint: 'Sprint 19', boardColumn: 'TODO', description: 'Investigate and remediate recurring integration queue failures.' },
  { key: 'NOVA:731:Testing-1', sourceSystem: 'NOVA', sourceId: '731:Testing-1', displayId: '731', sourceUrl: 'https://nova.example.invalid/731', name: 'Testing #1: Validate inpatient discharge configuration', sourceAssignee: 'Priya Shah', sourceState: 'New', teamAssignee: 'Maya', storyPoints: 8, sprint: 'Sprint 19', boardColumn: 'BACKLOG', description: 'Validate discharge configuration against current operational workflow.' },
  { key: 'JIRA:DATA-912', sourceSystem: 'JIRA', sourceId: 'DATA-912', sourceUrl: 'https://jira.example.invalid/browse/DATA-912', name: 'Correct nightly census feed mapping', sourceAssignee: 'Sam Wilson', sourceState: 'Done', teamAssignee: null, storyPoints: 2, sprint: 'Sprint 19', boardColumn: 'DONE', description: 'Correct facility mapping for the nightly census feed.' },
  { key: 'SERVICENOW:SCTASK0043921', sourceSystem: 'SERVICENOW', sourceId: 'SCTASK0043921', parentId: 'REQ0043919', sourceUrl: 'https://servicenow.example.invalid/sc_task_list.do?sysparm_query=number%3DSCTASK0043921', name: 'Provision test environment integration account', sourceAssignee: 'Platform Services', sourceState: 'Open', teamAssignee: null, storyPoints: null, sprint: null, boardColumn: null, description: 'Provision a synthetic test-only integration account.' },
  { key: 'NOVA:744:Testing-1', sourceSystem: 'NOVA', sourceId: '744:Testing-1', displayId: '744', sourceUrl: 'https://nova.example.invalid/744', name: 'Testing #1: Review ambulatory scheduling rule changes', sourceAssignee: 'Avery Chen', sourceState: 'New', teamAssignee: 'Elena', storyPoints: 5, sprint: null, boardColumn: null, description: 'Review requested scheduling rule changes before refinement.' },
];
