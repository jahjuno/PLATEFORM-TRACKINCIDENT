export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type Status = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Incident {
  id: string;
  title: string;
  description: string;
  platform: string;
  status: Status;
  priority: Priority;
  responsible_team: string;
  created_at: string;
  resolved_at?: string | null;
  rca_document?: string | null;
  user_id?: string | null;
  impacted_business: string;
  root_cause: string;
  solution_provided: string;
  incident_start_time: string;
  incident_end_time?: string;
  incident_duration?: string;
  intervening_person: string;
  intervening_team: string;
}