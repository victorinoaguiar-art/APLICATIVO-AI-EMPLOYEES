/**
 * DWACOS v1.0 — Digital Workforce Area Commerce & Operations System
 * Types and Contracts for 48 Commercial Areas Operational Ecosystem
 */

import { CommercialAreaCodeV2 } from '../abwsem/abwsemv2types.js';

export type SolutionPackStatus = 'DRAFT' | 'VALIDATED' | 'COMMERCIAL_READY' | 'ACTIVE' | 'SUSPENDED' | 'DEPRECATED';

export interface AreaSolutionPack {
  solution_pack_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  name: string;
  description: string;
  business_problem: string;
  target_outcomes: string[];
  included_rolepack_ids: number[];
  included_capabilities: string[];
  included_task_packs: string[];
  recommended_specializations: string[];
  required_inputs: string[];
  recommended_inputs: string[];
  required_connectors: string[];
  optional_connectors: string[];
  default_autonomy: 'FULL_AUTONOMY' | 'HUMAN_APPROVAL_REQUIRED' | 'STRICT_SUPERVISION';
  default_supervision: string;
  risk_profile: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  pricing_reference_kwz: number;
  status: SolutionPackStatus;
  version: string;
}

export interface CommercialOutcome {
  outcome_id: string;
  name: string;
  description: string;
  commercial_area_code: CommercialAreaCodeV2;
  solution_pack_ids: string[];
  primary_rolepack_id: number;
  primary_rolepack_title: string;
  required_inputs: string[];
  recommended_inputs: string[];
  expected_deliverables: string[];
  success_metrics: string[];
  commercial_tags: string[];
  status: 'ACTIVE' | 'BETA' | 'DEPRECATED';
}

export type AreaReadinessDimension =
  | 'DATA'
  | 'CONNECTORS'
  | 'ORGANIZATION_PACK'
  | 'PERMISSIONS'
  | 'KNOWLEDGE'
  | 'PROCESS_DEFINITION'
  | 'HUMAN_SUPERVISION'
  | 'SECURITY'
  | 'COMPLIANCE'
  | 'INPUT_READINESS';

export type AreaReadinessStatus =
  | 'READY'
  | 'READY_WITH_SETUP'
  | 'NEEDS_INTEGRATION'
  | 'NEEDS_DATA'
  | 'NEEDS_CONFIGURATION'
  | 'NEEDS_HUMAN_SUPERVISOR'
  | 'BLOCKED';

export interface AreaReadinessCheck {
  dimension: AreaReadinessDimension;
  name: string;
  is_satisfied: boolean;
  is_blocking: boolean;
  description: string;
  remediation_action: string;
}

export interface AreaReadinessAssessment {
  assessment_id: string;
  organization_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  overall_status: AreaReadinessStatus;
  readiness_score: number; // 0 - 100
  checks: AreaReadinessCheck[];
  blocking_issues_count: number;
  recommendation: string;
  assessed_at: string;
}

export type AreaDependencyType =
  | 'SUPPLIES_DATA_TO'
  | 'RECEIVES_DATA_FROM'
  | 'TRIGGERS'
  | 'DEPENDS_ON'
  | 'RECOMMENDS'
  | 'SHARES_CAPABILITY_WITH'
  | 'SHARES_CONNECTOR_WITH';

export interface AreaDependencyEdge {
  edge_id: string;
  source_area_code: CommercialAreaCodeV2;
  target_area_code: CommercialAreaCodeV2;
  dependency_type: AreaDependencyType;
  description: string;
  data_payload_example: string;
  is_mandatory: boolean;
}

export interface AreaManagerConfig {
  manager_rolepack_id: number;
  area_code: CommercialAreaCodeV2;
  manager_title: string;
  responsibilities: string[];
  allowed_routing_roles: number[];
  disallowed_actions: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export type AreaHealthState = 'HEALTHY' | 'ATTENTION' | 'DEGRADED' | 'BLOCKED' | 'SUSPENDED';

export interface AreaHealthSnapshot {
  snapshot_id: string;
  organization_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  active_employees_count: number;
  available_employees_count: number;
  completed_tasks_count: number;
  in_progress_tasks_count: number;
  pending_approvals_count: number;
  waiting_data_count: number;
  material_error_rate: number; // %
  umer_rate: number; // %
  connector_health_score: number; // 0 - 100
  monthly_cost_kwz: number;
  measured_value_kwz: number;
  health_state: AreaHealthState;
  snapshot_at: string;
}

export type AreaMaturityLevel =
  | 'LEVEL_0_NOT_CONFIGURED'
  | 'LEVEL_1_ASSIST'
  | 'LEVEL_2_OPERATE'
  | 'LEVEL_3_OPTIMIZE'
  | 'LEVEL_4_ORCHESTRATE';

export interface AreaValueEvent {
  event_id: string;
  organization_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  rolepack_id: number;
  value_type: 'time_saved' | 'cost_reduced' | 'revenue_supported' | 'error_avoided' | 'cash_recovered';
  amount_kwz: number;
  hours_saved?: number;
  description: string;
  evidence_hash: string;
  recorded_at: string;
}

export interface DWACOSGlobalSummary {
  total_solution_packs: number;
  total_commercial_outcomes: number;
  total_dependency_edges: number;
  areas_with_solution_packs_count: number;
  avg_readiness_score: number;
  active_area_managers_count: number;
  total_value_generated_kwz: number;
  entry_modes_active: {
    by_area: boolean;
    by_problem: boolean;
    by_outcome: boolean;
  };
}
