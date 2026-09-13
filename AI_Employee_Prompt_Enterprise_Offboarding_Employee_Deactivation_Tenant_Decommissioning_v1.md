# PROMPT MESTRE — ENTERPRISE OFFBOARDING, EMPLOYEE DEACTIVATION & TENANT DECOMMISSIONING
## Desvinculação Empresarial, Desactivação de AI Employees, Revogação de Acessos, Retenção, Purge e Encerramento Controlado

**Sigla:** EODTD  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform / Digital Workforce Operating System  
**Compatibilidade:** Company Provisioning, Employee Association & Activation; DWOS; DWACOS; OTCTEC; Organization Pack; IRECE; ORDKS; Runtime Orchestrator; Audit; Billing; Connection Vault; Data Retention  
**Objectivo:** implementar um processo de offboarding tão rigoroso quanto o onboarding, garantindo que o fim de um contrato, de uma Área, de um Employee, de uma unidade organizacional ou de uma ligação externa remove capacidade operacional de forma controlada, revoga acessos, trata trabalho pendente, preserva o que deve ser preservado, elimina o que deve ser eliminado e produz evidência auditável de todo o processo.

---

# 0. PRINCÍPIO CENTRAL

O offboarding não é:

```text
DELETE COMPANY
```

O offboarding é:

```text
REMOVE OPERATIONAL CAPABILITY
+
REVOKE ACCESS
+
RESOLVE OPEN WORK
+
PRESERVE REQUIRED EVIDENCE
+
EXPORT CLIENT DATA
+
APPLY RETENTION
+
PURGE ELIGIBLE DATA
+
DECOMMISSION TENANT
```

---

# 1. PRINCÍPIO DE CICLO DE VIDA

Se onboarding responde:

```text
WHO MAY START WORKING?
```

offboarding deve responder:

```text
WHO MUST STOP WORKING?
WHAT ACCESS MUST BE REVOKED?
WHAT WORK MUST BE CLOSED?
WHAT DATA MUST BE RETURNED?
WHAT MUST BE PRESERVED?
FOR HOW LONG?
WHAT MUST BE DELETED?
WHEN?
WITH WHAT EVIDENCE?
```

---

# 2. VERDADES OBRIGATÓRIAS

Nunca confundir:

```text
CONTRACT ENDED
!=
DELETE EVERYTHING IMMEDIATELY
```

```text
EMPLOYEE DEACTIVATED
!=
EMPLOYEE HISTORY DELETED
```

```text
AREA CANCELLED
!=
ORGANIZATION CLOSED
```

```text
CONNECTION REVOKED
!=
CONNECTION PROFILE DELETED FOR EVERYONE
```

```text
RETENTION ENDED
!=
PURGE ALLOWED
```

```text
BILLING CLOSED
!=
DATA PURGED
```

```text
TENANT LOCKED
!=
TENANT DECOMMISSIONED
```

---

# 3. OFFBOARDING SCOPES

Suportar pelo menos:

```text
EMPLOYEE_OFFBOARDING
AREA_OFFBOARDING
UNIT_OFFBOARDING
SITE_OFFBOARDING
CONNECTION_OFFBOARDING
ORGANIZATION_OFFBOARDING
TENANT_DECOMMISSIONING
```

---

# 4. PARTIAL VS FULL OFFBOARDING

Partial:

```text
1 Employee
1 Area
1 Unit
1 Site
1 Connection
1 Project Scope
```

Full:

```text
Entire Organization
+
All Areas
+
All Employee Instances
+
All Connections
+
Tenant
```

---

# 5. ENTITY — OFFBOARDING CASE

Criar:

`OffboardingCase`

Campos:

```text
offboarding_case_id
organization_id
tenant_id
scope_type
scope_id
reason_code
reason_text
requested_by
requested_at
effective_service_stop_at
read_only_until
retention_end_at
status
legal_hold_status
billing_close_status
export_status
risk_level
approval_policy_id
created_at
updated_at
```

---

# 6. OFFBOARDING CASE STATES

```text
DRAFT
REQUESTED
UNDER_REVIEW
APPROVED
SCHEDULED
GRACE_PERIOD
OFFBOARDING_IN_PROGRESS
READ_ONLY_RETENTION
PURGE_ELIGIBLE
PURGE_BLOCKED
PURGING
DECOMMISSIONING
COMPLETED
CANCELLED
FAILED
```

---

# 7. EMPLOYEE OFFBOARDING STATES

```text
ACTIVE
OFFBOARDING_REQUESTED
STOPPING_NEW_WORK
DRAINING
PAUSED
DEACTIVATING
DEACTIVATED
ARCHIVED
```

---

# 8. AREA OFFBOARDING STATES

```text
SUBSCRIBED
CANCELLATION_REQUESTED
CANCELLATION_SCHEDULED
GRACE_PERIOD
DRAINING
ENTITLEMENTS_REVOKING
CANCELLED
ARCHIVED
```

---

# 9. TENANT OFFBOARDING STATES

```text
ACTIVE
CANCELLATION_SCHEDULED
OFFBOARDING
READ_ONLY_RETENTION
ARCHIVED
DECOMMISSIONING
DECOMMISSIONED
```

---

# 10. THREE IMPORTANT DATES

Sempre distinguir:

```text
contract_end_date
service_stop_date
data_retention_end_date
```

Podem ser diferentes.

---

# 11. OPTIONAL DATE

Suportar também:

```text
export_access_end_date
```

---

# 12. EXAMPLE

```text
Contract End:
31/12/2026

Service Stop:
31/12/2026 23:59

Read-Only Export Access:
until 15/01/2027

Retention End:
per applicable policy
```

---

# 13. GRACE PERIOD

Support:

```text
ACTIVE
↓
CANCELLATION_SCHEDULED
↓
GRACE_PERIOD
↓
OFFBOARDING
```

During grace:

```text
new purchases              NO
new Employee activations   NO
autonomy increases         NO
new write connectors       NO
historical access          YES
data export                YES
existing work              BY POLICY
```

---

# 14. ECRÃ 1 — OFFBOARDING CENTER

Criar:

`Offboarding Center`

Mostrar:

```text
Organization
Scope
Reason
Requested By
Contract End
Service Stop
Retention End
Current Status
Employees Affected
Areas Affected
Connections Affected
Open Tasks
Pending Approvals
Exports
Legal Hold
Billing
Purge
```

---

# 15. BOTÕES — OFFBOARDING CENTER

```text
[ Novo Offboarding ]
[ Rever Impacto ]
[ Aprovar ]
[ Agendar ]
[ Iniciar ]
[ Pausar ]
[ Cancelar ]
[ Exportar Dados ]
[ Revogar Acessos ]
[ Executar Purge ]
[ Gerar Certificado ]
```

---

# 16. ECRÃ 2 — START OFFBOARDING WIZARD

Passos:

```text
1 Scope
2 Reason
3 Effective Dates
4 Open Work
5 Employees
6 Areas
7 Connections
8 Data Export
9 Retention
10 Legal Hold
11 Billing
12 Final Review
13 Approval
```

---

# 17. STEP 1 — SCOPE

Permitir:

```text
One Employee
One Area
One Unit
One Site
One Connection
Entire Organization
```

---

# 18. STEP 2 — REASON

Reason codes:

```text
CONTRACT_END
CLIENT_REQUEST
AREA_CANCELLATION
EMPLOYEE_NO_LONGER_NEEDED
SITE_CLOSURE
UNIT_CLOSURE
SECURITY_EVENT
NON_PAYMENT
RESTRUCTURING
MIGRATION
OTHER
```

---

# 19. STEP 3 — EFFECTIVE DATES

Fields:

```text
contract_end_date
service_stop_date
read_only_until
retention_end_at
```

Validation:

```text
service_stop_date >= now
retention_end_at >= service_stop_date
```

unless legal emergency requires immediate stop.

---

# 20. STEP 4 — OPEN WORK

System must inspect:

```text
running tasks
queued tasks
scheduled tasks
pending approvals
pending deliveries
pending side effects
cross-area workflows
cross-employee dependencies
```

---

# 21. OPEN WORK RESOLUTION OPTIONS

```text
FINISH_THEN_DEACTIVATE
CANCEL_AND_DEACTIVATE
TRANSFER_AND_DEACTIVATE
PAUSE_FOR_REVIEW
```

---

# 22. ECRÃ — OPEN WORK IMPACT

Mostrar:

```text
Running Tasks: 3
Queued Tasks: 8
Pending Approvals: 2
Scheduled Jobs: 4
Cross-Area Dependencies: 1
```

Botões:

```text
[ Concluir ]
[ Cancelar ]
[ Transferir ]
[ Rever Individualmente ]
```

---

# 23. TRANSFER WORK

When transfer selected:

```text
source Employee
↓
eligible replacement
↓
permission check
↓
scope check
↓
readiness check
↓
handoff
```

---

# 24. NO BLIND TRANSFER

Nunca transferir para Employee que não tenha:

```text
entitlement
skills
permissions
scope
readiness
capacity
```

---

# 25. STEP 5 — EMPLOYEES

List affected Employee Instances.

For each:

```text
Employee
Status
Area
Current Tasks
Schedules
Connections
Supervisor
Risk
Recommended Offboarding Action
```

---

# 26. EMPLOYEE OFFBOARDING FLOW

```text
ACTIVE
↓
OFFBOARDING_REQUESTED
↓
STOP_NEW_WORK
↓
RESOLVE_IN_FLIGHT
↓
REVOKE_RUNTIME
↓
UNBIND CONNECTIONS
↓
CLOSE SCHEDULES
↓
PRESERVE AUDIT
↓
DEACTIVATED
```

---

# 27. EMPLOYEE OFFBOARDING RULE

After deactivation preserve:

```text
employee_instance_id
rolepack_id
organization_id
historical config
task history
outputs
approvals
audit
incidents
certification history
```

subject to retention policy.

---

# 28. STEP 6 — AREAS

For Area cancellation, inspect:

```text
active Employees
solution packs
cross-area workflows
shared data dependencies
shared connectors
scheduled work
```

---

# 29. AREA DEPENDENCY CHECK

Create:

`AreaOffboardingDependencyCheck`

Edge types:

```text
SUPPLIES_DATA_TO
RECEIVES_DATA_FROM
TRIGGERS
DEPENDS_ON
SHARES_CONNECTOR_WITH
SHARES_PROCESS_WITH
```

---

# 30. AREA CANCELLATION FLOW

```text
SUBSCRIBED
↓
CANCELLATION_REQUESTED
↓
DEPENDENCY_CHECK
↓
GRACE_PERIOD
↓
STOP_NEW_WORK
↓
DRAIN WORK
↓
DEACTIVATE AREA EMPLOYEES
↓
REVOKE AREA ENTITLEMENTS
↓
CANCEL AREA SUBSCRIPTION
```

---

# 31. NO FORCED FULL OFFBOARDING

Cancelling Marketing must not automatically cancel Sales, Finance or other Areas.

---

# 32. STEP 7 — CONNECTIONS

Identify:

```text
Employee-specific bindings
Area-specific bindings
Organization-wide profiles
Shared connector profiles
Third-party authorizations
```

---

# 33. CONNECTION REVOCATION RULE

Distinguish:

```text
UNBIND EMPLOYEE
```

from:

```text
REVOKE ORGANIZATION CONNECTION
```

---

# 34. EMPLOYEE DEACTIVATION + SHARED CONNECTION

If other Employees still use connection:

```text
remove only Employee binding
```

Do not revoke entire connection.

---

# 35. FULL ORGANIZATION OFFBOARDING + CONNECTION

Do:

```text
stop connector use
↓
revoke third-party authorization where supported
↓
delete/disable stored secret
↓
mark REVOKED
↓
audit
```

---

# 36. CONNECTOR REVOCATION STATES

```text
ACTIVE
REVOCATION_SCHEDULED
REVOKING
REVOKED
FAILED_REVOCATION
```

---

# 37. CREDENTIAL DESTRUCTION

Destroy:

```text
API keys
OAuth refresh tokens
service credentials
database credentials
private connector secrets
```

Store only:

```text
secret_ref
destroyed_at
destroyed_by
```

Never secret value.

---

# 38. STEP 8 — DATA EXPORT

Offer client export before purge.

---

# 39. EXPORTABLE DATA CATEGORIES

According to contract/policy:

```text
documents
reports
spreadsheets
approved outputs
task history
configuration
audit reports
delivery receipts
organization settings
connection metadata without secrets
```

---

# 40. NON-EXPORTABLE INTERNAL DATA

Potentially exclude:

```text
system prompts
private chain-of-thought
platform source code
platform secrets
shared infrastructure data
other tenants' data
internal detection rules where proprietary
```

---

# 41. ENTITY — OFFBOARDING EXPORT PACKAGE

Fields:

```text
export_package_id
offboarding_case_id
organization_id
included_categories
excluded_categories
generated_at
hash
delivery_method
delivery_status
download_expiry
```

---

# 42. EXPORT STATES

```text
NOT_REQUESTED
REQUESTED
GENERATING
READY
DELIVERED
EXPIRED
FAILED
```

---

# 43. EXPORT INTEGRITY

Generate:

```text
manifest
hashes
timestamps
category list
```

---

# 44. STEP 9 — DATA RETENTION

Create/reuse:

`DataRetentionPolicy`

Fields:

```text
policy_id
data_category
retention_period
retention_basis
effective_from
legal_hold_allowed
purge_method
backup_treatment
```

---

# 45. RETENTION CATEGORIES

At minimum:

```text
TASK_DATA
DOCUMENTS
APPROVED_OUTPUTS
AUDIT
BILLING
SECURITY_LOGS
OPERATIONAL_MEMORY
CONNECTOR_LOGS
EMPLOYEE_INSTANCE_CONFIG
CERTIFICATION_HISTORY
INCIDENTS
```

---

# 46. RETENTION PRINCIPLE

Retention must be:

```text
CONFIGURABLE
VERSIONED
EFFECTIVE-DATED
```

Do not hardcode universal periods.

---

# 47. STEP 10 — LEGAL HOLD

Create:

`LegalHold`

Fields:

```text
legal_hold_id
organization_id
scope_type
scope_id
reason
authority
start_at
end_at
status
created_by
```

---

# 48. LEGAL HOLD STATES

```text
ACTIVE
REVIEW_DUE
RELEASED
EXPIRED
```

---

# 49. LEGAL HOLD RULE

If:

```text
retention ended
```

but:

```text
legal_hold == ACTIVE
```

then:

```text
PURGE_BLOCKED
```

---

# 50. LEGAL HOLD REASONS

Examples:

```text
litigation
regulatory investigation
audit
legal preservation request
security investigation
contract dispute
```

---

# 51. STEP 11 — BILLING CLOSE

Check:

```text
open invoices
unbilled usage
credits
prepayments
minimum commitments
refunds
final usage window
```

---

# 52. BILLING CLOSE FLOW

```text
freeze new billable provisioning
↓
calculate final usage
↓
issue final invoice/credit
↓
close recurring billing
↓
mark BILLING_CLOSED
```

---

# 53. BILLING SAFETY PRINCIPLE

```text
OUTSTANDING PAYMENT
!=
AUTOMATIC RIGHT TO RETAIN OR DELETE DATA
```

Data treatment follows contract and applicable law/policy.

---

# 54. STEP 12 — FINAL IMPACT REVIEW

Show:

```text
Areas to end
Employees to deactivate
Open tasks
Connections to revoke
Schedules to stop
Webhooks to disable
Exports to produce
Retention policies
Legal holds
Billing status
Effective dates
```

---

# 55. STEP 13 — APPROVAL

Require approval based on scope/risk.

Examples:

```text
EMPLOYEE_OFFBOARDING → Area Owner
AREA_OFFBOARDING → Org Admin + Area Owner
ORGANIZATION_OFFBOARDING → Org Admin + Authorized Contract Owner
EMERGENCY SECURITY OFFBOARDING → Security authorized role
```

---

# 56. DUAL APPROVAL

For full organization offboarding, recommended:

```text
REQUESTER
!=
FINAL APPROVER
```

---

# 57. ECRÃ — FINAL CONFIRMATION

Example:

```text
ENCERRAMENTO — ABC, LDA.

Areas affected:             8
Active Employees:          42
Open Tasks:                 7
Pending Approvals:          3
Connections to revoke:      6
Schedules to stop:         11
Exports requested:        YES
Legal Hold:                NO

Service Stop:
31/12/2026

Read-Only Until:
15/01/2027

Retention:
According to active policies

[ Cancelar ]
[ Agendar Encerramento ]
```

---

# 58. OFFBOARDING ORCHESTRATOR

Create:

`OffboardingOrchestrator`

Responsibilities:

```text
scope resolution
dependency analysis
task draining
Employee deactivation
entitlement revocation
connection revocation
schedule shutdown
export coordination
retention scheduling
billing close coordination
tenant state changes
purge orchestration
certificate generation
```

---

# 59. ORCHESTRATION ORDER — FULL ORGANIZATION

```text
1 Freeze new provisioning
2 Freeze new Area subscriptions
3 Freeze new Employee activations
4 Stop new work intake
5 Resolve in-flight work
6 Produce client exports
7 Pause Employees
8 Deactivate Employee Instances
9 Revoke Area entitlements
10 Cancel Area subscriptions
11 Stop schedules
12 Disable webhooks
13 Disable event subscriptions
14 Revoke connector bindings
15 Revoke organization connections
16 Destroy secrets
17 Freeze Organization Pack
18 Lock tenant
19 Close billing
20 Enter read-only retention
21 Wait for retention expiry
22 Check legal holds
23 Purge eligible data
24 Verify purge
25 Decommission tenant
26 Generate final certificate
```

---

# 60. FREEZE NEW PROVISIONING

On offboarding start:

```text
new Employee Instance creation = BLOCKED
new Area subscription = BLOCKED
autonomy increases = BLOCKED
new write connector = BLOCKED
```

---

# 61. STOP NEW WORK

At service stop:

```text
new Work Requests = BLOCKED
new scheduled runs = BLOCKED
new event-triggered tasks = BLOCKED
```

unless offboarding policy allows specific closure tasks.

---

# 62. DRAIN MODE

Create:

```text
DRAINING
```

During draining:

```text
no new work
current work may finish
reviews may complete
deliveries may finish
```

---

# 63. IMMEDIATE STOP MODE

For emergency/security:

```text
IMMEDIATE_STOP
```

Actions:

```text
pause Employees
cancel active tool executions where safe
revoke runtime tokens
disable connectors
block work intake
```

---

# 64. GLOBAL ORGANIZATION KILL SWITCH

Create:

```text
STOP ALL EMPLOYEES FOR ORGANIZATION
→ PAUSED_ORGANIZATION
```

Independent of contract timeline.

---

# 65. SCHEDULE OFFBOARDING

Create:

`OffboardingSchedule`

Fields:

```text
offboarding_case_id
freeze_at
stop_new_work_at
deactivate_employees_at
revoke_connections_at
read_only_until
retention_end_at
purge_after
```

---

# 66. SCHEDULED EXECUTION SAFETY

Each scheduled step must revalidate:

```text
case still active
approval valid
legal hold state
dependencies
tenant state
```

---

# 67. OFFBOARDING IDEMPOTENCY

All actions must be idempotent.

Example:

```text
revoke connector twice
→ no duplicate destructive effect
```

---

# 68. RETRIES

Use controlled retries for:

```text
third-party revocation
export generation
schedule cancellation
secret deletion
```

---

# 69. NO SILENT FAILURE

Any failed offboarding action creates:

```text
OFFBOARDING_INCIDENT
```

---

# 70. ENTITY — OFFBOARDING ACTION

Fields:

```text
offboarding_action_id
offboarding_case_id
action_type
target_type
target_id
status
attempt_count
started_at
completed_at
error_code
error_detail
```

---

# 71. ACTION STATES

```text
PENDING
RUNNING
SUCCEEDED
FAILED
RETRYING
BLOCKED
SKIPPED
```

---

# 72. OFFBOARDING ACTION TYPES

```text
STOP_NEW_WORK
PAUSE_EMPLOYEE
DEACTIVATE_EMPLOYEE
REVOKE_ENTITLEMENT
CANCEL_AREA
UNBIND_CONNECTION
REVOKE_CONNECTION
DESTROY_SECRET
CANCEL_SCHEDULE
DISABLE_WEBHOOK
DISABLE_EVENT_SUBSCRIPTION
FREEZE_ORG_PACK
LOCK_TENANT
GENERATE_EXPORT
CLOSE_BILLING
START_RETENTION
PURGE_DATA
DECOMMISSION_TENANT
GENERATE_CERTIFICATE
```

---

# 73. ORGANIZATION PACK OFFBOARDING

Lifecycle:

```text
VALID
↓
FROZEN
↓
ARCHIVED
↓
PURGED
```

according to retention.

---

# 74. ORGANIZATIONAL MEMORY OFFBOARDING

Separate:

```text
PLATFORM KNOWLEDGE
```

from:

```text
ORGANIZATION MEMORY
```

Platform knowledge may remain.

Organization-specific memory must be:

```text
frozen
retained
purged
```

according to policy.

---

# 75. NO CROSS-CUSTOMER MEMORY REUSE

Never transfer:

```text
customer history
supplier history
internal decisions
internal policies
exceptions
operational memory
```

to another organization.

---

# 76. MEMORY EXPORT

If contract allows, client may export approved organization memory.

---

# 77. MEMORY PURGE

Purge includes:

```text
vector indexes
semantic caches
embeddings linked to tenant
derived memory nodes
temporary retrieval caches
```

where applicable.

---

# 78. CACHE INVALIDATION

On service stop:

```text
invalidate tenant-scoped runtime caches
```

---

# 79. MODEL CONTEXT

Ensure no organization context remains in reusable session state after offboarding.

---

# 80. SESSION REVOCATION

Revoke:

```text
active sessions
service sessions
automation tokens
runtime credentials
```

as applicable.

---

# 81. WEBHOOKS

Disable:

```text
inbound webhooks
outbound webhooks
event callbacks
```

---

# 82. EVENT SUBSCRIPTIONS

Disable tenant-specific:

```text
message bus subscriptions
scheduled listeners
external event listeners
```

---

# 83. AUTOMATIONS

Stop:

```text
scheduled tasks
recurring reports
monitoring jobs
condition watches
background sync jobs
```

---

# 84. SHARED AUTOMATIONS

If shared engine serves many tenants:

```text
remove tenant binding only
```

Do not stop shared platform service.

---

# 85. CONNECTION REVOCATION DETAIL — OAUTH

Flow:

```text
stop use
↓
revoke refresh token/provider consent if supported
↓
delete secret
↓
mark revoked
↓
audit
```

---

# 86. CONNECTION REVOCATION DETAIL — API KEY

```text
revoke or rotate at provider
↓
delete stored key
↓
audit
```

---

# 87. CONNECTION REVOCATION DETAIL — DATABASE

```text
disable service account
↓
revoke credential
↓
remove firewall/network authorization if dedicated
↓
delete secret
```

---

# 88. CONNECTION REVOCATION DETAIL — BANK

```text
terminate consent if supported
↓
remove token
↓
mark read access revoked
↓
audit
```

---

# 89. CONNECTION REVOCATION DETAIL — PRIMAVERA / ERP

```text
disable integration user or token if dedicated
↓
remove local connector binding
↓
delete stored secret
```

---

# 90. SECRET DESTRUCTION CERTIFICATE

Optional record:

```text
secret_ref
system
destroyed_at
destroyed_by
verification_status
```

No secret content.

---

# 91. DATA PURGE ENGINE

Create:

`TenantDataPurgeEngine`

---

# 92. PURGE ELIGIBILITY

Before purge:

```text
retention expired?
legal hold inactive?
contract permits?
security investigation closed?
export completed or waived?
billing/data dispute resolved?
```

---

# 93. PURGE STATES

```text
NOT_ELIGIBLE
ELIGIBLE
BLOCKED
SCHEDULED
RUNNING
VERIFICATION
COMPLETED
FAILED
```

---

# 94. PURGE CATEGORIES

Support per category:

```text
documents
tasks
outputs
memory
connector metadata
logs
config
cached artifacts
temporary files
indexes
embeddings
```

---

# 95. AUDIT RETENTION EXCEPTION

Audit may have separate retention requirements.

Do not force same purge date as operational data.

---

# 96. BILLING RETENTION EXCEPTION

Billing records may also have separate retention policy.

---

# 97. SECURITY LOG RETENTION EXCEPTION

Security logs may use separate policy.

---

# 98. PURGE METHOD

Examples:

```text
logical delete
secure delete
crypto-shred
storage lifecycle expiry
index deletion
object deletion
```

by storage type.

---

# 99. PURGE VERIFICATION

After purge:

```text
query primary stores
query indexes
query object storage
query caches
query search indexes
query vector stores
verify secrets absent
```

---

# 100. DATA DELETION CERTIFICATE

Create:

`DataDeletionCertificate`

Fields:

```text
certificate_id
organization_id
offboarding_case_id
categories_deleted
categories_retained
retention_basis
legal_hold_exceptions
purge_completed_at
verification_status
authorized_by
audit_reference
```

---

# 101. BACKUP TREATMENT

Backups need explicit policy.

Fields:

```text
backup_retention
backup_expiry
restore_treatment
deletion_tombstone_required
```

---

# 102. DELETION TOMBSTONE

Create:

`DeletionTombstone`

Purpose:

```text
prevent deleted tenant data from silently returning after backup restore
```

---

# 103. RESTORE SAFETY

On backup restore:

```text
load active deletion tombstones
↓
re-delete or suppress decommissioned tenant data
```

---

# 104. TENANT LOCK

After operational offboarding:

```text
TENANT
→ READ_ONLY_RETENTION
```

Allowed:

```text
authorized export
audit access
retention administration
legal hold administration
```

Not allowed:

```text
new tasks
new Employees
new Areas
new writes
new connectors
```

---

# 105. TENANT DECOMMISSIONING

Before:

```text
all runtime tokens revoked
all connections revoked
all Employees deactivated
all subscriptions closed
retention complete or archival transferred
purge complete where required
```

---

# 106. TENANT DECOMMISSIONING FLOW

```text
READ_ONLY_RETENTION
↓
PURGE/ARCHIVE COMPLETE
↓
DECOMMISSIONING
↓
remove tenant runtime config
↓
remove tenant routing
↓
remove active IAM bindings
↓
remove active secrets
↓
remove active event subscriptions
↓
DECOMMISSIONED
```

---

# 107. DECOMMISSIONED TENANT

Must not be routable for normal application traffic.

---

# 108. FINAL OFFBOARDING CERTIFICATE

Create:

`OffboardingCertificate`

Fields:

```text
certificate_id
organization_id
offboarding_case_id
service_stop_at
areas_cancelled
employees_deactivated
connections_revoked
secrets_destroyed
exports_delivered
retention_status
purge_status
legal_hold_summary
billing_status
tenant_status
completed_at
authorized_by
audit_reference
```

---

# 109. OFFBOARDING PACKAGE

Generate final package:

```text
Offboarding Summary
Employee Deactivation Report
Area Cancellation Report
Connection Revocation Report
Secret Destruction Summary
Export Manifest
Retention Summary
Legal Hold Summary
Billing Close Summary
Data Deletion Certificate
Final Offboarding Certificate
```

---

# 110. ECRÃ — OFFBOARDING AUDIT TIMELINE

Show chronological events:

```text
Requested
Approved
Scheduled
New Work Frozen
Employees Paused
Employees Deactivated
Entitlements Revoked
Connections Revoked
Exports Delivered
Billing Closed
Retention Started
Purge Completed
Tenant Decommissioned
Certificate Issued
```

---

# 111. HUMAN OVERRIDE

Support:

```text
PAUSE OFFBOARDING
RESUME OFFBOARDING
CANCEL BEFORE IRREVERSIBLE STEP
```

---

# 112. IRREVERSIBLE STEPS

Mark clearly:

```text
SECRET DESTRUCTION
DATA PURGE
TENANT DECOMMISSIONING
```

Require stronger confirmation.

---

# 113. BREAK-GLASS OFFBOARDING

For security emergency:

```text
EMERGENCY OFFBOARDING
```

Actions:

```text
immediate organization pause
revoke runtime tokens
disable connector use
stop schedules
block new work
open incident
```

Further data actions still follow policy.

---

# 114. SECURITY INCIDENT IN OFFBOARDING

Do not delete evidence needed for incident investigation.

May create legal/security hold.

---

# 115. OFFBOARDING APPROVAL MATRIX

Examples:

```text
Employee Offboarding:
Area Owner or Org Admin

Area Cancellation:
Org Admin + Commercial Authorization

Full Organization Offboarding:
Org Admin + Contract Owner + optional Security Review

Emergency Offboarding:
Security Authorized Role
```

---

# 116. RBAC + ABAC

All offboarding actions must respect:

```text
role
tenant
organization
scope
risk
contract
environment
```

---

# 117. NO CROSS-TENANT OFFBOARDING

An admin of Organization A cannot offboard Organization B.

---

# 118. OFFBOARDING OF ONE SITE

Example:

```text
Organization:
ABC

Sites:
Luanda
Benguela
Huambo
```

If Benguela closes:

```text
Benguela Employee Instances
→ OFFBOARDING

Luanda
→ ACTIVE

Huambo
→ ACTIVE
```

---

# 119. UNIT OFFBOARDING DEPENDENCY CHECK

Check:

```text
shared Employees
shared connectors
shared workflows
shared data
cross-site approvals
```

---

# 120. CONNECTION-ONLY OFFBOARDING

Support:

```text
remove bank connection
```

without ending organization.

Flow:

```text
dependency check
↓
affected Employees
↓
replacement/fallback
↓
unbind
↓
revoke
↓
readiness recalculation
```

---

# 121. AUTO-DEGRADE AFTER CONNECTION REMOVAL

Affected Employees may become:

```text
DEGRADED
BLOCKED
PAUSED
```

depending on requirements.

---

# 122. EMPLOYEE-ONLY OFFBOARDING

Keep entitlement if Area remains subscribed.

Possible end state:

```text
Employee Instance = DEACTIVATED
RolePack Entitlement = AVAILABLE
```

Meaning client may create/reactivate later after readiness.

---

# 123. AREA OFFBOARDING + EMPLOYEE ENTITLEMENTS

When Area cancelled:

```text
Area Entitlements
→ REVOKED / EXPIRED
```

Employees must not remain ACTIVE.

---

# 124. ORGANIZATION OFFBOARDING + ALL ENTITLEMENTS

Full organization offboarding:

```text
all active entitlements
→ REVOKED
```

---

# 125. RECONTRACTING / REONBOARDING

If client returns:

```text
NEW CONTRACT
```

Do not blindly restore old configuration.

---

# 126. REONBOARDING CHECK

Revalidate:

```text
RolePack versions
certification
connectors
credentials
Organization Pack
permissions
knowledge
policies
data availability
risk
autonomy
```

---

# 127. REACTIVATION FLOW

```text
NEW CONTRACT
↓
NEW ENTITLEMENT
↓
CONFIG REVIEW
↓
NEW READINESS
↓
NEW ACTIVATION GATE
↓
ACTIVE
```

---

# 128. ARCHIVED HISTORY

Historical audit can remain linked if retention permits.

---

# 129. BILLING AFTER RECONTRACT

Treat as new commercial entitlement unless contract says otherwise.

---

# 130. API — CREATE OFFBOARDING CASE

```text
POST /organizations/{orgId}/offboarding-cases
```

Example:

```json
{
  "scope_type": "ORGANIZATION",
  "reason_code": "CONTRACT_END",
  "service_stop_at": "2026-12-31T23:59:59+01:00",
  "read_only_until": "2027-01-15T23:59:59+01:00"
}
```

---

# 131. API — IMPACT ANALYSIS

```text
POST /offboarding-cases/{id}/analyze-impact
GET  /offboarding-cases/{id}/impact
```

---

# 132. API — APPROVE

```text
POST /offboarding-cases/{id}/approve
```

---

# 133. API — SCHEDULE

```text
POST /offboarding-cases/{id}/schedule
```

---

# 134. API — START

```text
POST /offboarding-cases/{id}/start
```

---

# 135. API — PAUSE / RESUME / CANCEL

```text
POST /offboarding-cases/{id}/pause
POST /offboarding-cases/{id}/resume
POST /offboarding-cases/{id}/cancel
```

---

# 136. API — EMPLOYEE DEACTIVATION

```text
POST /employee-instances/{id}/offboard
POST /employee-instances/{id}/deactivate
```

---

# 137. API — AREA CANCELLATION

```text
POST /organizations/{orgId}/areas/{areaId}/cancel
```

---

# 138. API — CONNECTION REVOCATION

```text
POST /connections/{id}/revoke
POST /employee-instances/{employeeId}/connections/{connectionId}/unbind
```

---

# 139. API — EXPORT

```text
POST /offboarding-cases/{id}/exports
GET  /offboarding-cases/{id}/exports
```

---

# 140. API — RETENTION

```text
GET  /organizations/{orgId}/retention
POST /organizations/{orgId}/retention/evaluate
```

---

# 141. API — LEGAL HOLD

```text
POST /organizations/{orgId}/legal-holds
GET  /organizations/{orgId}/legal-holds
POST /legal-holds/{id}/release
```

---

# 142. API — PURGE

```text
POST /offboarding-cases/{id}/purge/evaluate
POST /offboarding-cases/{id}/purge/start
GET  /offboarding-cases/{id}/purge/status
```

---

# 143. API — TENANT DECOMMISSION

```text
POST /tenants/{tenantId}/decommission
```

---

# 144. API — CERTIFICATES

```text
GET /offboarding-cases/{id}/certificate
GET /offboarding-cases/{id}/deletion-certificate
```

---

# 145. DATABASE TABLES — OFFBOARDING

Create:

```text
offboarding_cases
offboarding_case_versions
offboarding_schedules
offboarding_actions
offboarding_dependencies
offboarding_employee_targets
offboarding_area_targets
offboarding_connection_targets
offboarding_export_packages
offboarding_export_items
offboarding_incidents
offboarding_certificates
```

---

# 146. DATABASE TABLES — RETENTION

Create/reuse:

```text
data_retention_policies
data_retention_policy_versions
retention_assignments
legal_holds
legal_hold_scopes
purge_jobs
purge_job_items
data_deletion_certificates
deletion_tombstones
```

---

# 147. DATABASE TABLES — CONNECTION DEPROVISIONING

```text
connection_revocation_events
secret_destruction_events
credential_revocation_events
```

---

# 148. DATABASE TABLES — BILLING CLOSE

```text
billing_close_events
final_usage_snapshots
final_invoice_references
```

---

# 149. EVENTS

Emit:

```text
EV.offboarding.requested
EV.offboarding.approved
EV.offboarding.scheduled
EV.offboarding.started
EV.organization.new_work_frozen
EV.employee.offboarding.started
EV.employee.deactivated
EV.area.cancellation.started
EV.area.cancelled
EV.entitlement.revoked
EV.connection.unbound
EV.connection.revoked
EV.secret.destroyed
EV.schedule.cancelled
EV.webhook.disabled
EV.export.ready
EV.export.delivered
EV.billing.closed
EV.retention.started
EV.legal_hold.created
EV.purge.eligible
EV.purge.started
EV.purge.completed
EV.tenant.decommissioning
EV.tenant.decommissioned
EV.offboarding.completed
```

---

# 150. AUDIT REQUIREMENTS

Append-only audit for:

```text
request
approval
date changes
scope changes
task handling
Employee deactivation
entitlement revocation
connection revocation
secret destruction
export generation
legal hold
purge
tenant decommission
certificate issuance
```

---

# 151. AUDIT FIELDS

```text
actor
action
target
organization
tenant
timestamp
reason
before_state
after_state
evidence_ref
```

---

# 152. OFFBOARDING CONFIG FINGERPRINT

At start capture:

```text
active Areas
active Employees
active entitlements
connections
permissions
schedules
webhooks
Organization Pack version
billing state
retention policies
legal holds
```

---

# 153. FINAL STATE FINGERPRINT

At completion capture:

```text
remaining active Employees = 0 for full offboarding
remaining active entitlements = 0
remaining active connections = 0
remaining runtime tokens = 0
tenant state = DECOMMISSIONED
```

subject to scope.

---

# 154. TEST SUITE — EMPLOYEE OFFBOARDING

Tests:

```text
stop new work
drain current work
cancel current work
transfer current work
revoke runtime
unbind connection
preserve audit
deactivate
```

---

# 155. TEST SUITE — AREA OFFBOARDING

```text
dependency analysis
Employee deactivation
entitlement revocation
other Areas unaffected
cross-area workflow warning
```

---

# 156. TEST SUITE — ORGANIZATION OFFBOARDING

```text
all provisioning frozen
all new work blocked
all Employees deactivated
all entitlements revoked
connections revoked
secrets destroyed
schedules stopped
tenant locked
retention started
```

---

# 157. TEST SUITE — TENANT ISOLATION

Offboarding Company A must not affect Company B.

---

# 158. TEST SUITE — SHARED CONNECTION

Employee A uses shared connection.

Deactivate A.

Expected:

```text
A unbound
connection remains for B
```

---

# 159. TEST SUITE — SHARED PLATFORM SERVICE

Tenant offboarding must not shut down shared platform infrastructure.

---

# 160. TEST SUITE — LEGAL HOLD

Retention expired + Legal Hold active.

Expected:

```text
PURGE_BLOCKED
```

---

# 161. TEST SUITE — PURGE

No legal hold + retention expired.

Expected:

```text
purge only eligible categories
```

---

# 162. TEST SUITE — BACKUP RESTORE

Restore backup containing decommissioned tenant.

Expected:

```text
deletion tombstone reapplied
tenant data suppressed/deleted
```

---

# 163. TEST SUITE — EXPORT

Export package:

```text
complete
hash-valid
tenant-scoped
no secrets
no other tenant data
```

---

# 164. TEST SUITE — RECONTRACT

Old client returns.

Expected:

```text
new readiness
no blind activation
```

---

# 165. TEST SUITE — EMERGENCY STOP

Expected:

```text
new work stopped immediately
runtime tokens revoked
incident opened
```

---

# 166. TEST SUITE — IDEMPOTENCY

Repeat offboarding action.

Expected:

```text
safe repeated result
no duplicate destructive operation
```

---

# 167. ACCEPTANCE CRITERIA — EMPLOYEE OFFBOARDING

PASS when:

```text
new work blocked
in-flight handled
runtime disabled
connections unbound
schedules stopped
audit preserved
status DEACTIVATED
```

---

# 168. ACCEPTANCE CRITERIA — AREA OFFBOARDING

PASS when:

```text
dependencies analyzed
area Employees stopped
area entitlements revoked
area subscription cancelled
unrelated Areas remain active
```

---

# 169. ACCEPTANCE CRITERIA — ORGANIZATION OFFBOARDING

PASS when:

```text
all operational work stopped
all Employees deactivated
all entitlements revoked
all tenant-specific connections revoked
secrets destroyed
exports handled
billing closed
tenant locked
retention active
```

---

# 170. ACCEPTANCE CRITERIA — PURGE

PASS when:

```text
eligibility checked
legal holds checked
eligible categories deleted
verification completed
certificate issued
```

---

# 171. ACCEPTANCE CRITERIA — TENANT DECOMMISSION

PASS when:

```text
tenant unroutable
no active runtime
no active secrets
no active connector authorizations
no active event subscriptions
no active schedules
state DECOMMISSIONED
```

---

# 172. HARD NO-GO — EMPLOYEE OFFBOARDING

Do not complete if:

```text
active side effect unresolved
runtime token still active
critical scheduled job remains
required audit missing
```

---

# 173. HARD NO-GO — ORGANIZATION OFFBOARDING

Do not mark completed if:

```text
active Employee remains
active entitlement remains
active tenant credential remains
connection revocation failed without accepted exception
billing close unresolved where required
```

---

# 174. HARD NO-GO — PURGE

Never purge if:

```text
legal hold active
retention not expired
authorized export still pending where policy requires
security investigation requires preservation
```

---

# 175. OFFBOARDING INCIDENTS

Create:

`OffboardingIncident`

Types:

```text
REVOCATION_FAILURE
SECRET_DELETION_FAILURE
TASK_DRAIN_FAILURE
EXPORT_FAILURE
PURGE_FAILURE
LEGAL_HOLD_CONFLICT
BILLING_CLOSE_FAILURE
TENANT_DECOMMISSION_FAILURE
```

---

# 176. INCIDENT SEVERITY

```text
SEV0
SEV1
SEV2
SEV3
```

---

# 177. INCIDENT ACTIONS

```text
retry
manual intervention
security escalation
legal escalation
pause offboarding
accept controlled exception
```

---

# 178. CONTROLLED EXCEPTION

If exception accepted:

```text
who approved
why
scope
expiry
compensating control
```

must be recorded.

---

# 179. OFFBOARDING DASHBOARD

Show:

```text
Cases Open
Cases Scheduled
Cases in Grace
Cases in Progress
Retention Cases
Purge Eligible
Purge Blocked
Completed
Failed Actions
```

---

# 180. ORGANIZATION DETAIL — OFFBOARDING TAB

Add:

```text
Contract Status
Service Stop
Offboarding Case
Employees to Deactivate
Areas to Cancel
Connections to Revoke
Exports
Retention
Legal Hold
Billing
Purge
Certificates
```

---

# 181. EMPLOYEE DETAIL — OFFBOARDING TAB

Show:

```text
Offboarding Status
Open Work
Transfer Target
Connection Bindings
Runtime State
Schedules
History Retention
```

---

# 182. CONNECTION DETAIL — OFFBOARDING TAB

Show:

```text
Users
Employees
Areas
Scopes
Revocation Impact
Revocation Status
Secret Destruction Status
```

---

# 183. RETENTION CONSOLE

Show:

```text
Data Category
Policy
Retention End
Legal Hold
Purge Eligibility
Purge Status
```

---

# 184. CLIENT SELF-SERVICE OFFBOARDING

If allowed:

```text
client may request cancellation
```

but destructive actions still require server-side policy and approvals.

---

# 185. NO ONE-CLICK DELETE

Never expose:

```text
Delete Company
```

as direct destructive action for active tenant.

Use:

```text
Start Offboarding
```

---

# 186. UX LANGUAGE

Prefer:

```text
Encerrar Serviço
Desactivar Employee
Cancelar Área
Revogar Ligação
Agendar Eliminação
```

over ambiguous:

```text
Delete
Remove
```

---

# 187. REASON EXPLANATION

Before irreversible steps show:

```text
what will stop
what will remain
what will be exported
what will be retained
what will be deleted
when
```

---

# 188. CUSTOMER NOTIFICATIONS

Configurable notifications:

```text
offboarding requested
service stop scheduled
export ready
read-only period ending
purge scheduled
offboarding completed
```

---

# 189. NOTIFICATION SAFETY

No secrets or sensitive details in email notification body unless policy allows.

---

# 190. INTERNAL NOTIFICATIONS

Notify:

```text
Org Admin
Area Owners
Supervisors
Security
Billing
Compliance
```

according to scope.

---

# 191. OFFBOARDING SLA

Track:

```text
time to stop work
time to revoke access
time to export
time to close billing
time to purge after eligibility
```

---

# 192. OFFBOARDING METRICS

Measure:

```text
cases completed
average duration
failed revocations
manual interventions
purge delays
legal hold cases
export failures
recontract rate
```

---

# 193. NO SUCCESS BY SPEED ALONE

Fast offboarding is not good if evidence or revocation is incomplete.

---

# 194. COMPLIANCE EVIDENCE

Maintain:

```text
who requested
who approved
what was stopped
what was revoked
what was retained
what was purged
why
when
```

---

# 195. OFFBOARDING VERSIONING

Any change to process/policy must be versioned.

---

# 196. POLICY PRECEDENCE

Use:

```text
Safety
Law/Regulatory Requirement
Contract
Organization Policy
Platform Policy
Default Retention Policy
```

subject to validated jurisdiction logic.

---

# 197. NO HARDCODED LAW

Retention/legal obligations must come from verified versioned policy packs, not static assumptions.

---

# 198. DATA RESIDENCY

Decommissioning must consider:

```text
primary storage
replicas
indexes
caches
backups
regional copies
```

---

# 199. SEARCH INDEX CLEANUP

Remove tenant documents from:

```text
full-text search
semantic search
vector search
```

when purge applies.

---

# 200. TEMP FILE CLEANUP

Delete tenant temporary artifacts:

```text
rendering temp files
upload temp files
conversion files
staging files
```

according to policy.

---

# 201. OBJECT STORAGE CLEANUP

Delete or lifecycle expire tenant objects.

---

# 202. DATABASE CLEANUP

Respect referential integrity and audit retention.

---

# 203. ANALYTICS CLEANUP

Remove tenant-identifiable data where required.

Aggregated anonymized metrics may be governed separately.

---

# 204. TELEMETRY CLEANUP

Apply telemetry retention policy.

---

# 205. BILLING DATA CLEANUP

Follow billing retention policy.

---

# 206. SECURITY LOG CLEANUP

Follow security retention policy.

---

# 207. API CONSUMER ACCESS

Revoke organization API clients.

---

# 208. SERVICE ACCOUNTS

Disable organization-specific service accounts.

---

# 209. SSO / SCIM

If configured:

```text
disable tenant SSO mapping
disable SCIM provisioning
remove tenant-specific identity mappings
```

at appropriate stage.

---

# 210. USER ACCESS

At service stop:

```text
normal users → disabled
offboarding/export admins → restricted read-only access
```

according to policy.

---

# 211. READ-ONLY ACCESS ROLE

Create:

```text
OFFBOARDING_READ_ONLY_ADMIN
```

Capabilities:

```text
view history
download approved export
view certificates
view retention status
```

No operational execution.

---

# 212. OFFBOARDING OF USERS

Revoke:

```text
sessions
tokens
MFA recovery links
API sessions
```

as applicable.

---

# 213. ACTIVE APPROVALS

Pending approvals must be:

```text
complete
cancel
transfer
```

before deactivation.

---

# 214. PENDING DELIVERIES

Pending deliveries:

```text
deliver
cancel
archive
```

according to closure decision.

---

# 215. EXTERNAL SIDE EFFECTS

If external operation already executed:

```text
do not pretend rollback happened
```

Record actual state and compensating action if available.

---

# 216. ROLLBACK LIMITATION

Distinguish:

```text
REVERSIBLE
COMPENSATABLE
IRREVERSIBLE
```

---

# 217. COMPENSATING ACTION

Example:

```text
email already sent
```

Cannot unsend reliably.

May:

```text
send correction
record incident
```

---

# 218. FINANCIAL SIDE EFFECT

If payment already sent:

```text
do not duplicate or auto-reverse without authorization
```

---

# 219. DATA DELIVERY AFTER CONTRACT END

Only within:

```text
read-only/export window
```

if contract/policy allows.

---

# 220. NO NEW WORK AFTER SERVICE STOP

Hard rule.

---

# 221. OFFBOARDING OF AREA MANAGER

Area Manager must be deactivated only after subordinate task routing is stopped.

---

# 222. OFFBOARDING OF DYNAMIC TEAMS

Dissolve temporary AI teams after current tasks resolved.

---

# 223. INTERNAL DIGITAL LABOR MARKETPLACE

Cancel pending labor requests involving offboarded scope.

---

# 224. PROCESS DIGITAL TWIN

Mark processes:

```text
NO_LONGER_COVERED
```

where Employee/Area removed.

---

# 225. COVERAGE BLUEPRINT

Recalculate after partial offboarding.

---

# 226. CAPACITY ENGINE

Recalculate capacity after Employee/Area removal.

---

# 227. DEPENDENCY RECOMMENDATIONS

Show potential operational gaps created by offboarding.

---

# 228. EXAMPLE — EMPLOYEE OFFBOARDING

Company ABC keeps Finance but stops #64.

```text
#64 ACTIVE
↓
OFFBOARDING_REQUESTED
↓
STOP_NEW_WORK
↓
2 tasks drained
↓
runtime revoked
↓
bank binding removed
↓
schedules cancelled
↓
DEACTIVATED
```

Finance Area remains:

```text
SUBSCRIBED
```

Entitlement may remain:

```text
AVAILABLE
```

---

# 229. EXAMPLE — AREA OFFBOARDING

ABC cancels Marketing.

```text
Marketing SUBSCRIBED
↓
CANCELLATION_SCHEDULED
↓
DEPENDENCY CHECK
↓
GRACE PERIOD
↓
Marketing Employees deactivated
↓
Marketing Entitlements revoked
↓
Marketing CANCELLED
```

Sales remains active.

---

# 230. EXAMPLE — FULL ORGANIZATION OFFBOARDING

```text
ABC, Lda.
CONTRACT_END
↓
OFFBOARDING SCHEDULED
↓
NEW WORK FROZEN
↓
ALL EMPLOYEES DRAINED
↓
ALL EMPLOYEES DEACTIVATED
↓
ALL ENTITLEMENTS REVOKED
↓
ALL CONNECTIONS REVOKED
↓
SECRETS DESTROYED
↓
EXPORT DELIVERED
↓
BILLING CLOSED
↓
TENANT READ_ONLY_RETENTION
↓
RETENTION EXPIRES
↓
LEGAL HOLD CHECK
↓
PURGE
↓
TENANT DECOMMISSIONED
↓
CERTIFICATE ISSUED
```

---

# 231. FINAL OFFBOARDING CHECKLIST — EMPLOYEE

```text
[ ] New work stopped
[ ] Open work resolved
[ ] Schedules stopped
[ ] Runtime token revoked
[ ] Connections unbound
[ ] Permissions inactive
[ ] Audit preserved
[ ] Status DEACTIVATED
```

---

# 232. FINAL OFFBOARDING CHECKLIST — AREA

```text
[ ] Dependencies reviewed
[ ] Area Employees deactivated
[ ] Cross-area impacts handled
[ ] Entitlements revoked
[ ] Area subscription cancelled
[ ] Other Areas unaffected
```

---

# 233. FINAL OFFBOARDING CHECKLIST — ORGANIZATION

```text
[ ] New provisioning frozen
[ ] New work blocked
[ ] All Employees deactivated
[ ] All entitlements revoked
[ ] All schedules stopped
[ ] All webhooks disabled
[ ] All event subscriptions disabled
[ ] Connections revoked
[ ] Secrets destroyed
[ ] Export handled
[ ] Billing closed
[ ] Organization Pack frozen
[ ] Tenant locked
[ ] Retention started
[ ] Legal holds checked
```

---

# 234. FINAL PURGE CHECKLIST

```text
[ ] Retention expired
[ ] Legal hold inactive
[ ] Security preservation not required
[ ] Export requirement satisfied
[ ] Primary data deleted
[ ] Search indexes cleaned
[ ] Vector stores cleaned
[ ] Caches cleaned
[ ] Temp files cleaned
[ ] Secrets absent
[ ] Backup tombstone created
[ ] Verification PASS
[ ] Deletion certificate issued
```

---

# 235. FINAL DECOMMISSION CHECKLIST

```text
[ ] Tenant unroutable
[ ] No active Employees
[ ] No active entitlements
[ ] No active connections
[ ] No active secrets
[ ] No active runtime tokens
[ ] No active schedules
[ ] No active webhooks
[ ] No active event subscriptions
[ ] IAM mappings removed/disabled
[ ] Tenant status DECOMMISSIONED
[ ] Final certificate issued
```

---

# 236. IMPLEMENTATION ORDER

Build:

```text
1 OffboardingCase
2 Offboarding Wizard
3 Impact Analyzer
4 Open Work Resolver
5 Employee Offboarding
6 Area Offboarding
7 Connection Revocation
8 Export Package
9 Retention Engine
10 Legal Hold
11 Billing Close
12 Offboarding Orchestrator
13 Tenant Lock
14 Purge Engine
15 Backup Tombstones
16 Tenant Decommission
17 Certificates
18 Audit Timeline
19 Dashboard
20 Emergency Offboarding
```

---

# 237. RELEASE NO-GO

Do not release offboarding if:

```text
Employee can remain ACTIVE after full org offboarding
connection can remain usable after revoke
secret destruction not auditable
legal hold can be bypassed
purge can run before retention expiry
cross-tenant deletion possible
backup restore can resurrect deleted tenant data
```

---

# 238. FINAL ACCEPTANCE GATE

```text
EMPLOYEE OFFBOARDING                 PASS
AREA OFFBOARDING                     PASS
UNIT/SITE OFFBOARDING                PASS
CONNECTION OFFBOARDING               PASS
ORGANIZATION OFFBOARDING             PASS
OPEN WORK RESOLUTION                 PASS
DEPENDENCY ANALYSIS                  PASS
RUNTIME REVOCATION                   PASS
ENTITLEMENT REVOCATION               PASS
SCHEDULE SHUTDOWN                    PASS
WEBHOOK SHUTDOWN                     PASS
EVENT SUBSCRIPTION SHUTDOWN          PASS
EXPORT PACKAGE                       PASS
SECRET DESTRUCTION                   PASS
BILLING CLOSE                        PASS
RETENTION ENGINE                     PASS
LEGAL HOLD                           PASS
PURGE ELIGIBILITY                    PASS
PURGE VERIFICATION                   PASS
BACKUP TOMBSTONE                     PASS
TENANT LOCK                          PASS
TENANT DECOMMISSION                  PASS
FINAL CERTIFICATE                    PASS
AUDIT                                PASS
TENANT ISOLATION                     PASS
```

---

# 239. FINAL TRUTH PRINCIPLES

Never claim:

```text
CONTRACT ENDED
=
DATA DELETED
```

Never claim:

```text
EMPLOYEE DEACTIVATED
=
HISTORY DELETED
```

Never claim:

```text
RETENTION EXPIRED
=
PURGE ALLOWED
```

Never claim:

```text
PURGE EXECUTED
=
PURGE VERIFIED
```

Never claim:

```text
CONNECTION RECORD DELETED
=
THIRD-PARTY ACCESS REVOKED
```

Never claim:

```text
TENANT LOCKED
=
TENANT DECOMMISSIONED
```

---

# 240. FINAL OFFBOARDING FLOW

```text
CONTRACT / SCOPE END
↓
CREATE OFFBOARDING CASE
↓
ANALYZE IMPACT
↓
APPROVE
↓
SCHEDULE
↓
FREEZE NEW PROVISIONING
↓
STOP NEW WORK
↓
RESOLVE IN-FLIGHT WORK
↓
EXPORT CLIENT DATA
↓
PAUSE EMPLOYEES
↓
DEACTIVATE EMPLOYEE INSTANCES
↓
REVOKE AREA ENTITLEMENTS
↓
CANCEL AREA SUBSCRIPTIONS
↓
STOP SCHEDULES
↓
DISABLE WEBHOOKS
↓
DISABLE EVENT SUBSCRIPTIONS
↓
UNBIND CONNECTIONS
↓
REVOKE CONNECTIONS
↓
DESTROY SECRETS
↓
FREEZE ORGANIZATION PACK
↓
LOCK TENANT
↓
CLOSE BILLING
↓
READ-ONLY RETENTION
↓
CHECK LEGAL HOLDS
↓
PURGE ELIGIBLE DATA
↓
VERIFY PURGE
↓
DECOMMISSION TENANT
↓
ISSUE FINAL OFFBOARDING CERTIFICATE
```

---

# 241. FINAL PRINCIPLE

```text
ONBOARDING DEFINES WHO MAY START WORKING.

OFFBOARDING DEFINES WHO MUST STOP WORKING,
WHAT ACCESS MUST DISAPPEAR,
WHAT EVIDENCE MUST REMAIN,
HOW LONG IT MUST REMAIN,
AND WHEN IT MAY BE DELETED.
```

Este é o sistema de offboarding a implementar.
