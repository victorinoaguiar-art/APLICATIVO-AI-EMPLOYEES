import { createContext, useContext } from 'react';

export const AREA_TO_TAB_MAP: Record<string, string> = {
  'APP-01': 'dashboard',
  'APP-02': 'shell',
  'ORG-01': 'companies',
  'ORG-02': 'company_detail',
  'ORG-03': 'company_provisioning',
  'WF-01': 'workforce_command',
  'WF-02': 'marketplace',
  'WF-03': 'employee_detail',
  'WF-04': 'role_packs',
  'TASK-01': 'work_center',
  'TASK-02': 'task_detail',
  'TASK-03': 'runtime_router',
  'TASK-04': 'evidence_gate',
  'TASK-05': 'remote_commands',
  'TASK-06': 'approvals_center',
  'KNO-01': 'knowledge_center',
  'KNO-02': 'add_knowledge_wizard',
  'KNO-03': 'source_explorer',
  'KNO-04': 'knowledge_necessity',
  'KNO-05': 'mnca_500',
  'KNO-06': 'passports_eligibility',
  'KNO-07': 'regulatory_watch',
  'KNO-08': 'client_policies',
  'QUAL-01': 'training_center',
  'QUAL-02': 'reliability_measurement',
  'QUAL-03': 'client_acceptance',
  'QUAL-04': 'master_certification',
  'QUAL-05': 'otctec_lab',
  'QUAL-06': 'enterprise_pilot',
  'DOC-01': 'document_studio',
  'DOC-02': 'brand_stationery',
  'COM-01': 'omnichannel',
  'COM-02': 'whatsapp_operations',
  'COM-03': 'email_intelligence',
  'COM-04': 'social_media',
  'COM-05': 'daily_briefing',
  'COMMERCE-01': 'plans_subscriptions',
  'COMMERCE-02': 'billing_payments',
  'COMMERCE-03': 'discovery_expansion',
  'INT-01': 'integrations',
  'INT-02': 'security_permissions',
  'INT-03': 'audit_evidence',
  'INT-04': 'settings_scheduler',
  'INT-05': 'master_prompt_registry'
};

export interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeTopModal: string | null;
  setActiveTopModal: (modal: string | null) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  navigateToArea: (codeOrTab: string) => void;
}

export const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  return useContext(NavigationContext);
};
