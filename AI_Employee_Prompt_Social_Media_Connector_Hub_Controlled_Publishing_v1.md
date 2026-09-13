# PROMPT MESTRE — SOCIAL MEDIA CONNECTOR HUB & CONTROLLED PUBLISHING
## Integração Segura dos AI Employees com Redes Sociais de Empresas Clientes

**Sigla:** SMCH-CP  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform / Digital Workforce Operating System  
**Área principal:** A08 · Marketing  
**Integração com:** Connection Center, Employee Instances, Permission Engine, Policy Engine, Risk Engine, Approval Gateway, Delivery Router, Audit, Offboarding  
**Objectivo:** permitir que AI Employees de Marketing se liguem de forma segura, controlada e auditável às redes sociais autorizadas de uma empresa cliente, utilizando APIs oficiais, OAuth, Connection Profiles, scopes mínimos, aprovação humana e execução exacta do conteúdo aprovado.

---

# 0. PRINCÍPIO CENTRAL

Nunca ligar AI Employees directamente por:

```text
username + password
```

Nunca guardar:

```text
social media password
```

em:

```text
prompt
memory
RolePack
plain-text database
task context
```

Usar:

```text
EMPRESA
↓
CONNECTION CENTER
↓
SOCIAL MEDIA PROVIDER
↓
OFFICIAL OAUTH / API AUTHORIZATION
↓
CONNECTION PROFILE
↓
SECRET VAULT
↓
EMPLOYEE CONNECTION BINDING
↓
PERMISSIONS
↓
POLICY + RISK + APPROVAL
↓
TOOL EXECUTOR
↓
SOCIAL MEDIA API
```

---

# 1. VERDADES OBRIGATÓRIAS

```text
CONNECTED
!=
FULL ACCESS
```

```text
CAN READ
!=
CAN PUBLISH
```

```text
CAN PUBLISH
!=
CAN DELETE
```

```text
CAN MANAGE CONTENT
!=
CAN MANAGE AD BUDGET
```

```text
EMPLOYEE HAS TOOL ACCESS
!=
EMPLOYEE HAS BUSINESS AUTHORITY
```

```text
CONTENT APPROVED
!=
MODEL MAY REGENERATE BEFORE PUBLISH
```

---

# 2. PRINCÍPIO DE EXECUÇÃO

Preservar:

```text
A generated
↓
A frozen
↓
Human approves A
↓
Connector publishes exactly A
```

Nunca:

```text
Approve A
↓
LLM reruns
↓
Publish B
```

---

# 3. SOCIAL MEDIA CONNECTOR HUB

Criar:

`SocialMediaConnectorHub`

Arquitectura:

```text
SocialMediaConnectorHub
├── Meta Connector
│   ├── Facebook
│   └── Instagram
├── LinkedIn Connector
├── TikTok Connector
├── YouTube Connector
├── X Connector
└── Future Providers
```

---

# 4. PRINCÍPIO DE ADAPTER

Cada provider deve implementar:

`SocialMediaProviderAdapter`

Interface conceptual:

```text
authenticate()
refresh_token()
revoke()
discover_accounts()
discover_capabilities()
read_posts()
read_comments()
read_metrics()
create_draft()
publish_post()
schedule_post()
delete_post()
read_ad_accounts()
read_campaigns()
prepare_campaign()
execute_campaign_change()
health_check()
```

Nem todos os providers suportam todas as operações.

---

# 5. CAPABILITY DISCOVERY

Criar:

`SocialCapabilityDiscovery`

Ao ligar uma conta, detectar:

```text
provider
account_type
business/professional/personal
page/channel/profile
available API capabilities
granted scopes
unsupported capabilities
approval requirements
```

---

# 6. CAPABILITY STATES

```text
SUPPORTED
SUPPORTED_WITH_LIMITS
REQUIRES_BUSINESS_ACCOUNT
REQUIRES_ADDITIONAL_AUTHORIZATION
REQUIRES_PROVIDER_REVIEW
UNSUPPORTED
TEMPORARILY_UNAVAILABLE
```

---

# 7. NO CAPABILITY ASSUMPTION

Nunca assumir que:

```text
Instagram connected
→ all Instagram actions supported
```

A capacidade real depende de:

```text
provider
account type
API product
granted scopes
provider policies
region
application approval
```

---

# 8. PROVIDERS — INITIAL TARGETS

Prioridade inicial:

```text
P1 Meta
   Facebook Pages
   Instagram Professional

P2 LinkedIn
   Organization Pages

P3 YouTube
   Channels

P4 TikTok
   Business / supported creator accounts

P5 X
   supported API accounts
```

---

# 9. ACCOUNT TYPES

Suportar distinção:

```text
BUSINESS_ACCOUNT
PROFESSIONAL_ACCOUNT
ORGANIZATION_PAGE
CREATOR_ACCOUNT
PERSONAL_ACCOUNT
CHANNEL
AD_ACCOUNT
```

---

# 10. PERSONAL ACCOUNT POLICY

Para contas pessoais:

```text
do not request password
do not bypass provider restrictions
do not automate unsupported actions
```

Mostrar claramente:

```text
SUPPORTED
UNSUPPORTED
REQUIRES PROFESSIONAL ACCOUNT
```

---

# 11. ECRÃ — SOCIAL CONNECTION CENTER

Navegação:

```text
Organization
→ Connections
→ Social Media
```

Mostrar cards:

```text
Meta
LinkedIn
TikTok
YouTube
X
```

---

# 12. PROVIDER CARD

Mostrar:

```text
Provider
Connection Status
Authorized Accounts
Granted Scopes
Token Health
Last Sync
Employees Using Connection
Capabilities
Warnings
```

---

# 13. BOTÕES — PROVIDER CARD

```text
[ Ligar Conta ]
[ Reautenticar ]
[ Ver Contas ]
[ Ver Permissões ]
[ Testar Conexão ]
[ Ver Employees ]
[ Revogar ]
[ Ver Auditoria ]
```

---

# 14. OAUTH FLOW

Exemplo:

```text
DWOS
↓
User clicks "Ligar Meta"
↓
Redirect to official Meta OAuth
↓
User authenticates with provider
↓
User selects authorized Page/Account
↓
User grants scopes
↓
Provider returns authorization code
↓
Backend exchanges code for token
↓
Token stored in Secret Vault
↓
Connection Profile created
↓
Capability Discovery runs
```

---

# 15. OAUTH SECURITY

Obrigatório:

```text
state parameter
PKCE where supported
redirect URI validation
CSRF protection
short-lived auth code
server-side token exchange
secret vault storage
tenant binding
```

---

# 16. TOKEN STORAGE

Guardar no Connection Profile apenas:

```text
credential_reference
```

Token real:

```text
Secret Vault
```

---

# 17. TOKEN LIFECYCLE

Suportar:

```text
ACTIVE
REFRESH_DUE
REFRESHING
EXPIRED
REVOKED
INVALID
```

---

# 18. TOKEN REFRESH

Refresh:

```text
server-side
audited
rate-limited
provider-specific
```

---

# 19. TOKEN FAILURE

Se refresh falhar:

```text
Connection → DEGRADED / EXPIRED
Affected Employees → DEGRADED or BLOCKED
```

---

# 20. ENTITY — SOCIAL CONNECTION PROFILE

Campos:

```text
social_connection_profile_id
organization_id
tenant_id
provider
provider_account_id
provider_account_type
display_name
credential_reference
granted_scopes
capabilities
mode
status
health
last_authenticated_at
last_refreshed_at
expires_at
created_at
updated_at
```

---

# 21. CONNECTION MODES

```text
READ_ONLY
READ_AND_PREPARE
PUBLISH_WITH_APPROVAL
LIMITED_AUTONOMOUS_PUBLISHING
ADS_READ_ONLY
ADS_PREPARE
ADS_EXECUTE_WITH_APPROVAL
```

---

# 22. SAFE DEFAULT

Initial:

```text
READ_ONLY
```

---

# 23. EMPLOYEE BINDING

Criar:

`EmployeeSocialConnectionBinding`

Campos:

```text
binding_id
employee_instance_id
social_connection_profile_id
allowed_capabilities
scope_constraints
approval_policy_id
status
created_at
```

---

# 24. CONNECTION BELONGS TO ORGANIZATION

Modelo correcto:

```text
ORGANIZATION
↓
SOCIAL CONNECTION PROFILE
↓
EMPLOYEE BINDINGS
```

Não:

```text
EMPLOYEE OWNS SOCIAL ACCOUNT
```

---

# 25. MULTIPLE EMPLOYEES / ONE CONNECTION

Exemplo:

```text
Meta Connection — ABC, Lda.

#027 Social Media
READ + PREPARE

#029 Campaign Manager
READ

#031 Advertising
ADS_READ_ONLY

#033 Brand Monitoring
READ

#036 Influencer Relations
READ LIMITED
```

---

# 26. EMPLOYEE OFFBOARDING

Se #027 for desactivado:

```text
remove #027 binding
```

Não revogar Connection Profile se outros Employees ainda usam.

---

# 27. ORGANIZATION OFFBOARDING

Se empresa terminar contrato:

```text
unbind all Employees
↓
revoke provider authorization
↓
destroy token
↓
mark connection REVOKED
↓
audit
```

---

# 28. A08 EMPLOYEE MAPPING

Inicialmente mapear:

```text
#026 Content
→ prepares source content
→ no direct publish by default

#027 Social Media
→ organic social content + metrics

#029 Campaign Manager
→ campaign coordination

#031 Advertising
→ paid media

#033 Brand Monitoring
→ mentions / sentiment / alerts

#036 Influencer Relations
→ creator/influencer coordination

#035 Product Marketing
→ messaging source

#037 Local Marketing
→ local campaign input

#038 Localization
→ market/language adaptation
```

---

# 29. #027 SOCIAL MEDIA — DEFAULT CAPABILITIES

```text
READ_POSTS
READ_COMMENTS
READ_METRICS
PREPARE_POST
PREPARE_RESPONSE
PREPARE_SCHEDULE
```

Initially deny:

```text
PUBLISH_POST
DELETE_POST
CHANGE_PROFILE
CHANGE_ACCOUNT_SETTINGS
CHANGE_AD_BUDGET
```

---

# 30. #029 CAMPAIGN MANAGER — DEFAULT

Allow:

```text
READ_CAMPAIGN_DATA
PREPARE_CAMPAIGN_PLAN
PREPARE_SCHEDULE
ANALYZE_PERFORMANCE
```

Deny initially:

```text
LAUNCH_CAMPAIGN
CHANGE_BUDGET
PAUSE_CAMPAIGN
DELETE_CAMPAIGN
```

---

# 31. #031 ADVERTISING — DEFAULT

Allow:

```text
READ_AD_ACCOUNTS
READ_CAMPAIGNS
READ_AD_METRICS
PREPARE_AD_CAMPAIGN
PREPARE_BUDGET_RECOMMENDATION
```

Deny:

```text
SPEND_MONEY
CHANGE_BUDGET
LAUNCH_ADS
ADD_PAYMENT_METHOD
```

until separately certified.

---

# 32. #033 BRAND MONITORING — DEFAULT

Allow:

```text
READ_PUBLIC_MENTIONS
READ_COMMENTS
READ_PUBLIC_METRICS
CLASSIFY_BRAND_SIGNAL
ALERT
```

Deny:

```text
POST
DELETE
BLOCK_USER
REPORT_USER
```

unless explicitly authorized.

---

# 33. #036 INFLUENCER RELATIONS — DEFAULT

Allow:

```text
READ_AUTHORIZED_PUBLIC_PROFILE_DATA
PREPARE_OUTREACH
TRACK_CAMPAIGN_STATUS
PREPARE_BRIEF
```

Deny initially:

```text
SEND_DM
SIGN_CONTRACT
COMMIT_BUDGET
PAY_INFLUENCER
```

---

# 34. ORGANIC CONTENT WORKFLOW — READ ONLY

```text
Social Account
↓
Connector
↓
Metrics
↓
#027 Social Media
↓
Analysis
↓
Human Review
```

---

# 35. ORGANIC CONTENT WORKFLOW — PREPARE

```text
User Request
↓
#026 Content / #027 Social Media
↓
Draft
↓
Platform-specific adaptations
↓
Preview
↓
Human Review
```

---

# 36. ORGANIC CONTENT WORKFLOW — PUBLISH WITH APPROVAL

```text
Draft
↓
Freeze Content Snapshot
↓
Human Approval
↓
Revalidate Connection
↓
Revalidate Permission
↓
Revalidate Policy
↓
Publish Exact Snapshot
↓
Delivery Receipt
↓
Audit
```

---

# 37. CONTENT SNAPSHOT

Criar:

`SocialContentSnapshot`

Campos:

```text
snapshot_id
task_id
employee_instance_id
provider
account_id
text
media_refs
link
hashtags
mentions
scheduled_at
content_hash
version
created_at
```

---

# 38. APPROVAL SNAPSHOT RULE

Approval points to:

```text
content_hash
```

Execution must use same:

```text
content_hash
```

---

# 39. POST EXECUTION INTENT

LLM emits:

```text
SocialToolCallIntent
```

Example:

```json
{
  "action": "publish_post",
  "connection_profile_id": "conn_meta_abc",
  "account_id": "page_123",
  "content_snapshot_id": "snap_456"
}
```

---

# 40. TOOL CALL REVALIDATION

Before publish:

```text
Employee active?
Connection healthy?
Account authorized?
Capability supported?
Permission allowed?
Content approved?
Approval still valid?
Risk policy passed?
Schedule valid?
Rate limit available?
```

---

# 41. SOCIAL TOOL EXECUTOR

Only:

`SocialMediaToolExecutor`

may call provider API.

Never:

```text
LLM directly → provider API
```

---

# 42. DELIVERY RECEIPT

Create:

`SocialDeliveryReceipt`

Fields:

```text
delivery_id
provider
account_id
provider_post_id
content_snapshot_id
content_hash
published_at
published_by_employee_instance
approved_by
status
provider_response_ref
```

---

# 43. DELIVERY STATES

```text
PENDING
PUBLISHING
PUBLISHED
FAILED
PARTIAL
RETRYING
CANCELLED
```

---

# 44. MULTI-PLATFORM PUBLISHING

Workflow:

```text
Base Content
↓
Platform Adaptation
├── Facebook
├── Instagram
├── LinkedIn
├── TikTok
└── YouTube
↓
Separate Previews
↓
Separate/Grouped Approval
↓
Separate Connector Calls
↓
Separate Delivery Receipts
```

---

# 45. NO SINGLE BLIND PUBLISH

Each platform version must be visible before approval.

---

# 46. PLATFORM ADAPTATION

Can vary:

```text
text length
hashtags
aspect ratio
video format
link support
mentions
CTA
thumbnail
caption
```

---

# 47. MEDIA ASSETS

Create:

`SocialMediaAsset`

Fields:

```text
asset_id
organization_id
type
file_ref
mime_type
dimensions
duration
rights_status
approval_status
hash
```

---

# 48. RIGHTS CHECK

Before publish:

```text
asset rights status
```

must be:

```text
APPROVED
```

or permitted by policy.

---

# 49. ASSET RIGHTS STATES

```text
UNKNOWN
CLIENT_OWNED
LICENSED
APPROVED
RESTRICTED
BLOCKED
```

---

# 50. NO UNSAFE MEDIA USE

Do not publish asset with:

```text
BLOCKED
```

rights state.

---

# 51. COMMENT INGESTION

Support where API permits:

```text
New Comment
↓
Provider Event / Poll
↓
Unified Command & Event Gateway
↓
Normalize
↓
Route
```

---

# 52. COMMENT ROUTING

Possible routing:

```text
Marketing question → #027
Customer support → #039+
Complaint → Customer Service
Legal issue → Legal
Refund → Human / Customer Service
Threat → Safety / Human
Sensitive personal data → Restricted Flow
```

---

# 53. COMMENT RESPONSE MODES

```text
READ_ONLY
DRAFT_RESPONSE
PUBLISH_WITH_APPROVAL
LIMITED_AUTO_RESPONSE
```

---

# 54. AUTO-RESPONSE LIMITS

Only low-risk classes may qualify.

Examples:

```text
opening hours
public product link
public store address
basic FAQ
```

---

# 55. NO AUTO-RESPONSE CLASSES

Default:

```text
legal complaint
refund dispute
harassment escalation
threat
financial complaint
health claim
employment matter
personal data request
media inquiry
crisis
```

---

# 56. DIRECT MESSAGES

Treat DMs separately from public comments.

---

# 57. DM POLICY

Initial:

```text
READ_ONLY or DRAFT_ONLY
```

No autonomous outbound DMs by default.

---

# 58. DM PRIVACY

Direct messages may contain:

```text
PII
sensitive information
order details
complaints
```

Apply stronger data policy.

---

# 59. SOCIAL EVENT TYPES

Create:

```text
EV.social.comment.created
EV.social.message.received
EV.social.mention.detected
EV.social.post.published
EV.social.post.failed
EV.social.token.expiring
EV.social.connection.degraded
EV.social.campaign.threshold_reached
```

---

# 60. PROVIDER WEBHOOKS

Where supported:

```text
provider webhook
↓
verify signature
↓
tenant/account resolution
↓
event normalization
↓
event bus
```

---

# 61. WEBHOOK SECURITY

Require:

```text
signature verification
replay protection
timestamp checks
tenant mapping
deduplication
```

---

# 62. POLLING FALLBACK

If webhook unavailable:

```text
controlled polling
```

with:

```text
provider rate limits
backoff
deduplication
```

---

# 63. RATE LIMIT ENGINE

Create:

`SocialProviderRateLimitManager`

Track:

```text
provider
account
endpoint
remaining quota
reset time
retry after
```

---

# 64. RATE LIMIT STATES

```text
HEALTHY
NEAR_LIMIT
THROTTLED
BLOCKED
```

---

# 65. RATE LIMIT BEHAVIOR

On limit:

```text
queue
backoff
retry
notify if delayed
```

No uncontrolled retry storm.

---

# 66. PROVIDER HEALTH

Create:

`SocialProviderHealth`

Fields:

```text
provider
connection
auth health
API health
webhook health
rate limit health
last success
last failure
```

---

# 67. CONNECTION HEALTH STATES

```text
HEALTHY
ATTENTION
DEGRADED
EXPIRED
REVOKED
BLOCKED
```

---

# 68. READ ANALYTICS

Support provider-permitted metrics.

Canonical model:

```text
post_id
published_at
impressions
reach
engagements
comments
shares
saves
clicks
video_views
followers_delta
```

Fields are optional by provider.

---

# 69. ANALYTICS NORMALIZATION

Create:

`SocialMetricsNormalizer`

Map provider-specific metrics to canonical fields.

---

# 70. NO FALSE COMPARISON

If metrics differ semantically across providers:

```text
do not pretend they are identical
```

Store:

```text
canonical_metric
provider_metric
definition
```

---

# 71. ANALYTICS SUITE

Social data may feed:

```text
Marketing Dashboard
Campaign Dashboard
Content Performance
Brand Monitoring
Customer Insights
```

---

# 72. PUBLIC RESEARCH

Public social research must follow:

```text
official APIs
authorized search
publicly accessible sources
platform terms
privacy policy
```

No prohibited scraping/bypass.

---

# 73. BRAND MONITORING

Support:

```text
owned account comments
authorized mentions
public brand mentions where provider/API supports
```

---

# 74. SENTIMENT

Sentiment is:

```text
analytical signal
```

not objective fact.

Show confidence.

---

# 75. CRISIS DETECTION

Signals may trigger:

```text
HIGH_NEGATIVE_VOLUME
EXECUTIVE_MENTION
SAFETY_COMPLAINT
LEGAL_ALLEGATION
MEDIA_ESCALATION
```

---

# 76. CRISIS FLOW

```text
Signal
↓
Brand Monitoring
↓
Risk classification
↓
Human escalation
```

Not autonomous public response by default.

---

# 77. PAID ADVERTISING SUBSYSTEM

Create:

`SocialAdsControlPlane`

Separate from organic publishing.

---

# 78. ADS PRINCIPLE

```text
CONTENT PERMISSION
!=
MONEY-SPEND PERMISSION
```

---

# 79. ADS READ-ONLY MODE

Allow:

```text
read campaigns
read ad sets
read creatives
read spend
read performance
```

---

# 80. ADS PREPARE MODE

Allow:

```text
prepare campaign
prepare audience
prepare creative
prepare budget proposal
prepare schedule
```

---

# 81. ADS EXECUTE MODE

Requires:

```text
separate certification
separate permission
budget policy
approval
exact execution
```

---

# 82. ADS BUDGET POLICY

Create:

`SocialAdsBudgetPolicy`

Fields:

```text
organization_id
ad_account_id
daily_limit
campaign_limit
monthly_limit
approval_threshold
currency
allowed_objectives
allowed_regions
```

---

# 83. ADS HARD LIMIT

Connector must enforce budget limit server-side.

Never trust model alone.

---

# 84. ADS APPROVAL SNAPSHOT

Approval freezes:

```text
campaign objective
audience
creative
budget
dates
placements
bid strategy if applicable
```

---

# 85. ADS EXECUTION

Execute exactly approved configuration.

---

# 86. ADS CHANGE MANAGEMENT

Budget change:

```text
new request
↓
new approval if threshold crossed
```

---

# 87. ADS DENIED ACTIONS — DEFAULT

```text
ADD_PAYMENT_METHOD
REMOVE_PAYMENT_METHOD
UNLIMITED_BUDGET
CHANGE_BILLING_OWNER
```

---

# 88. AD ACCOUNT SCOPING

An Employee may access:

```text
Ad Account A
```

but not:

```text
Ad Account B
```

unless explicitly granted.

---

# 89. CAMPAIGN KILL SWITCH

Support:

```text
PAUSE CAMPAIGN
```

only with appropriate permission.

Emergency human control always available.

---

# 90. SOCIAL CONTENT POLICY ENGINE

Create:

`SocialContentPolicyEngine`

Can enforce:

```text
brand terms
forbidden claims
regulated claims
disclosures
prohibited topics
language rules
approval rules
link allowlist
mention rules
```

---

# 91. BRAND POLICY PACK

Organization-specific:

```text
tone
brand names
product names
approved claims
restricted claims
hashtags
logos
CTA rules
visual identity
```

---

# 92. PRODUCT CLAIM CHECK

Before publishing product claim:

```text
claim source exists?
approved?
current?
```

---

# 93. NO INVENTED CLAIMS

Employee must not invent:

```text
price
discount
availability
guarantee
certification
product benefit
legal claim
```

---

# 94. PRICE FRESHNESS

Price-sensitive content checks:

```text
current price source
effective date
campaign period
```

---

# 95. PROMOTION VALIDITY

Promotional content requires:

```text
start date
end date
terms
stock/availability policy if applicable
```

---

# 96. LOCALIZATION

#038 Localization may adapt:

```text
language
regional terminology
currency display
date format
local CTA
```

but cannot change approved commercial meaning without review.

---

# 97. LOCAL MARKETING

#037 Local Marketing may scope:

```text
branch
city
store
event
local audience
```

---

# 98. SOCIAL ACCOUNT SCOPE

Connection Profile may allow:

```text
one Page
one Channel
one Profile
one Ad Account
multiple explicitly selected resources
```

---

# 99. RESOURCE ALLOWLIST

Store explicit provider resource IDs.

---

# 100. NO GLOBAL PROVIDER ACCESS

OAuth access does not imply use of all accounts available to the user.

Only selected resources become DWOS Connection resources.

---

# 101. CONNECTION SETUP WIZARD

Steps:

```text
1 Choose Provider
2 Authenticate
3 Select Account/Page/Channel
4 Discover Capabilities
5 Select Scopes
6 Set Mode
7 Test Connection
8 Bind Employees
9 Set Approval Policy
10 Activate
```

---

# 102. STEP 1 — PROVIDER

Display supported integrations.

---

# 103. STEP 2 — AUTHENTICATE

Redirect to official provider.

---

# 104. STEP 3 — SELECT RESOURCES

Show resources returned by provider.

User explicitly selects.

---

# 105. STEP 4 — CAPABILITIES

Show:

```text
Read Posts        SUPPORTED
Read Metrics      SUPPORTED
Publish Post      SUPPORTED
Read DMs          REQUIRES_EXTRA_SCOPE
Ads               SUPPORTED_WITH_LIMITS
```

---

# 106. STEP 5 — SCOPES

Prefer minimum required scopes.

---

# 107. STEP 6 — MODE

Default:

```text
READ_ONLY
```

---

# 108. STEP 7 — CONNECTION TEST

Test:

```text
auth
resource access
read
write denial
scope
revocation
audit
tenant isolation
rate limit response
```

---

# 109. STEP 8 — BIND EMPLOYEES

Choose:

```text
#027
#029
#031
#033
#036
```

or others permitted by product design.

---

# 110. STEP 9 — APPROVAL POLICY

Set:

```text
all posts require approval
comments require approval
DMs draft only
ads require dual approval
```

---

# 111. STEP 10 — ACTIVATE CONNECTION

Activation gate:

```text
OAuth valid
resource selected
capabilities discovered
scopes valid
token in vault
tenant bound
policy configured
audit enabled
```

---

# 112. SOCIAL CONNECTION STATES

```text
NOT_CONFIGURED
AUTHENTICATING
CONNECTED
CONNECTED_READ_ONLY
READY_FOR_BINDING
ACTIVE
DEGRADED
EXPIRED
REVOKED
BLOCKED
```

---

# 113. EMPLOYEE SOCIAL BINDING STATES

```text
DRAFT
READY
ACTIVE
PAUSED
REVOKED
```

---

# 114. POST STATES

```text
DRAFT
READY_FOR_REVIEW
REVISION_REQUIRED
APPROVED
SCHEDULED
PUBLISHING
PUBLISHED
FAILED
CANCELLED
```

---

# 115. COMMENT RESPONSE STATES

```text
RECEIVED
CLASSIFIED
DRAFTED
REVIEW_REQUIRED
APPROVED
PUBLISHED
ESCALATED
CLOSED
```

---

# 116. AD CAMPAIGN STATES

```text
DRAFT
REVIEW
APPROVED
READY_TO_LAUNCH
LAUNCHING
ACTIVE
PAUSED
COMPLETED
FAILED
```

---

# 117. ECRÃ — SOCIAL ACCOUNT DETAIL

Show:

```text
Provider
Account
Type
Capabilities
Scopes
Mode
Token Health
Employees
Approval Policy
Recent Posts
Recent Errors
Audit
```

---

# 118. ECRÃ — SOCIAL PUBLISHING CENTER

Show:

```text
Drafts
Waiting Approval
Scheduled
Published
Failed
```

---

# 119. ECRÃ — SOCIAL REVIEW

Show side-by-side:

```text
Facebook Preview
Instagram Preview
LinkedIn Preview
TikTok Preview
```

Buttons:

```text
[ Approve All ]
[ Approve Selected ]
[ Request Revision ]
[ Reject ]
```

---

# 120. ECRÃ — SOCIAL INBOX

If supported:

```text
Comments
Mentions
Messages
Escalations
```

Filters:

```text
Provider
Account
Risk
Status
Assigned Employee
```

---

# 121. ECRÃ — ADS CONTROL

Show:

```text
Campaigns
Spend
Budget
Performance
Approval Status
Employee Suggestions
```

---

# 122. SOCIAL AUDIT TRAIL

Record:

```text
connection created
OAuth authorized
scope granted
scope changed
Employee bound
content drafted
content frozen
approval granted
publish attempted
publish result
comment ingested
response drafted
response published
ad change proposed
ad change approved
ad change executed
token refreshed
connection revoked
```

---

# 123. AUDIT ACTOR TYPES

```text
HUMAN
AI_EMPLOYEE
SYSTEM
PROVIDER
```

---

# 124. AUDIT FIELDS

```text
actor
organization
employee_instance
provider
account
action
input_ref
content_hash
approval_ref
result
timestamp
```

---

# 125. SOCIAL DATA RETENTION

Use configurable policy for:

```text
posts
metrics
comments
messages
mentions
ad metrics
provider logs
tokens metadata
```

---

# 126. PII HANDLING

DMs/comments may contain PII.

Apply:

```text
tenant isolation
least privilege
retention
redaction where appropriate
restricted access
```

---

# 127. DATA MINIMIZATION

Do not ingest fields not needed for task.

---

# 128. PROVIDER TERMS

Connector implementation must follow current provider terms and API policies.

---

# 129. PROVIDER POLICY CHANGE

Create:

`SocialProviderPolicyVersion`

Track:

```text
provider
API version
policy version
effective date
capability impact
```

---

# 130. API VERSIONING

Each adapter records:

```text
provider_api_version
```

---

# 131. API DEPRECATION

If provider deprecates endpoint:

```text
capability → DEPRECATED
connection health → ATTENTION
migration required
```

---

# 132. CONNECTION CERTIFICATION

A connector can be:

```text
IMPLEMENTED
AUTHENTICATED
TESTED
CERTIFIED_FOR_READ
CERTIFIED_FOR_PUBLISH
CERTIFIED_FOR_ADS
```

Separate scopes.

---

# 133. NO CERTIFICATION LEAP

```text
CERTIFIED_FOR_READ
!=
CERTIFIED_FOR_PUBLISH
```

---

# 134. TEST SUITE — OAUTH

Test:

```text
valid auth
cancelled auth
invalid state
expired code
wrong redirect
scope denied
token refresh
token revoke
```

---

# 135. TEST SUITE — TENANT ISOLATION

Company A cannot:

```text
read/publish to Company B account
```

Expected:

```text
DENIED
AUDITED
```

---

# 136. TEST SUITE — RESOURCE SCOPE

Connection authorized for Page A.

Attempt Page B.

Expected:

```text
DENIED
```

---

# 137. TEST SUITE — READ ONLY

Read-only connection.

Attempt publish.

Expected:

```text
DENIED
```

---

# 138. TEST SUITE — APPROVAL

Attempt publish without approval.

Expected:

```text
WAITING_APPROVAL / DENIED
```

---

# 139. TEST SUITE — CONTENT HASH

Approve Snapshot A.

Change content to B.

Attempt publish.

Expected:

```text
APPROVAL_INVALIDATED
```

---

# 140. TEST SUITE — RATE LIMIT

Provider returns rate limit.

Expected:

```text
THROTTLED
backoff
no retry storm
```

---

# 141. TEST SUITE — TOKEN EXPIRY

Expected:

```text
DEGRADED
refresh
or
re-auth required
```

---

# 142. TEST SUITE — PROVIDER OUTAGE

Expected:

```text
DEGRADED
queued if safe
user informed
```

---

# 143. TEST SUITE — WEBHOOK SPOOF

Invalid signature.

Expected:

```text
REJECTED
```

---

# 144. TEST SUITE — DUPLICATE WEBHOOK

Expected:

```text
deduplicated
```

---

# 145. TEST SUITE — COMMENT ESCALATION

Legal complaint.

Expected:

```text
no auto-response
human escalation
```

---

# 146. TEST SUITE — DM PRIVACY

Employee without DM permission.

Expected:

```text
DENIED
```

---

# 147. TEST SUITE — ADS BUDGET

Attempt budget above limit.

Expected:

```text
DENIED
```

---

# 148. TEST SUITE — ADS APPROVAL

Campaign changed after approval.

Expected:

```text
APPROVAL_INVALIDATED
```

---

# 149. TEST SUITE — OFFBOARDING EMPLOYEE

Deactivate #027.

Expected:

```text
#027 binding revoked
organization connection remains if shared
```

---

# 150. TEST SUITE — OFFBOARDING ORGANIZATION

Expected:

```text
all social bindings removed
provider authorization revoked where supported
tokens destroyed
audit preserved
```

---

# 151. ACCEPTANCE CRITERIA — CONNECTION

PASS when:

```text
OAuth official flow
token in vault
resource explicitly selected
capabilities discovered
scopes minimized
tenant bound
audit enabled
```

---

# 152. ACCEPTANCE CRITERIA — EMPLOYEE BINDING

PASS when:

```text
Employee active
connection active
capabilities allowed
permissions explicit
approval policy set
scope correct
```

---

# 153. ACCEPTANCE CRITERIA — PUBLISH

PASS when:

```text
content snapshot frozen
approval exists
hash matches
permissions revalidated
connection healthy
provider accepts post
delivery receipt created
audit created
```

---

# 154. ACCEPTANCE CRITERIA — COMMENTS

PASS when:

```text
event authenticated
comment normalized
risk classified
route correct
response policy respected
```

---

# 155. ACCEPTANCE CRITERIA — ADS

PASS when:

```text
ad account scoped
budget policy loaded
approval snapshot frozen
spend limits enforced server-side
execution audited
```

---

# 156. HARD NO-GO

Do not release if:

```text
passwords required
tokens stored in prompts
LLM can call provider API directly
publish bypasses approval
approved content can mutate before publish
cross-tenant publishing possible
account scope not enforced
budget limits only exist in prompt
offboarding fails to revoke tokens
provider webhook signatures not verified
```

---

# 157. SOCIAL MEDIA WORK REQUEST EXAMPLE

User:

```text
“Prepare uma publicação para lançar o Produto X
no Facebook, Instagram e LinkedIn.
Não publique sem minha aprovação.”
```

---

# 158. RESOLUTION

```text
Work Request
↓
A08 Marketing
↓
#026 Content + #027 Social Media
↓
Brand Policy Pack
↓
Platform Adaptation
↓
3 Content Snapshots
↓
Preview
↓
Human Approval
↓
Connector Hub
↓
3 Provider Calls
↓
3 Delivery Receipts
```

---

# 159. SOCIAL ANALYTICS REQUEST EXAMPLE

User:

```text
“Analise os últimos 30 dias do Facebook e Instagram
e indique os conteúdos com melhor desempenho.”
```

Flow:

```text
Read-only connection
↓
Metrics
↓
Normalizer
↓
#027 / #034
↓
Analysis
↓
Report
```

---

# 160. BRAND MONITORING EXAMPLE

User:

```text
“Mostre menções críticas à nossa marca.”
```

Flow:

```text
authorized/public signals
↓
#033
↓
classification
↓
confidence
↓
escalation if material
```

---

# 161. ADS EXAMPLE

User:

```text
“Prepare uma campanha de 7 dias
com orçamento máximo de 300.000 AOA.
Não lance sem aprovação.”
```

Flow:

```text
#031 prepares
↓
Budget Policy
↓
Campaign Snapshot
↓
Human Approval
↓
Execute exact approved config
```

---

# 162. MULTI-BRAND ORGANIZATION

Support:

```text
Organization
├── Brand A Social Accounts
├── Brand B Social Accounts
└── Brand C Social Accounts
```

Employee binding can be brand-scoped.

---

# 163. MULTI-SITE LOCAL MARKETING

Support:

```text
Organization
├── Luanda
├── Benguela
└── Huambo
```

#037 may publish only to local resource scope if authorized.

---

# 164. CONTENT CALENDAR

Create:

`SocialContentCalendar`

Fields:

```text
campaign
provider
account
content_snapshot
planned_at
approval_status
publish_status
```

---

# 165. SCHEDULING

Scheduling must use:

```text
provider-native scheduling
```

where appropriate, or platform scheduler with revalidation at execution time.

---

# 166. SCHEDULE REVALIDATION

At publish time:

```text
connection valid?
approval valid?
content unchanged?
campaign still active?
promotion still valid?
```

---

# 167. SCHEDULE CANCELLATION

User can:

```text
Cancel Scheduled Post
```

before execution.

---

# 168. SCHEDULED CONTENT EXPIRY

If promotion expired:

```text
BLOCK PUBLISH
```

---

# 169. CONTENT VERSIONING

Every revision creates new:

```text
content_snapshot_version
```

Old approval does not automatically approve new version.

---

# 170. HUMAN CONTROL

Always provide:

```text
Pause Social Automation
Pause Employee
Revoke Connection
Cancel Scheduled Post
Take Over
```

---

# 171. ORGANIZATION SOCIAL KILL SWITCH

Create:

```text
STOP ALL SOCIAL PUBLISHING
```

Result:

```text
social publishing actions blocked
read-only analytics may continue if policy allows
```

---

# 172. SEPARATE READ VS WRITE KILL SWITCH

Support:

```text
PAUSE_WRITE
```

without disabling read analytics.

---

# 173. INCIDENT TYPES

Create:

`SocialMediaIncident`

Types:

```text
UNAUTHORIZED_PUBLISH_ATTEMPT
WRONG_ACCOUNT_TARGET
TOKEN_EXPOSURE
PROVIDER_REVOCATION
PUBLISH_FAILURE
CONTENT_POLICY_VIOLATION
AD_BUDGET_VIOLATION
WEBHOOK_SECURITY_FAILURE
CROSS_TENANT_ATTEMPT
```

---

# 174. INCIDENT ACTIONS

```text
pause binding
pause connection
revoke token
pause Employee
stop social publishing
open investigation
```

---

# 175. SOCIAL METRICS DASHBOARD

Per organization show:

```text
Connected Accounts
Connection Health
Posts Published
Posts Waiting Approval
Failed Publishes
Comments Pending
Ad Spend
Rate Limit Health
Active Employees
```

---

# 176. EMPLOYEE DETAIL — SOCIAL TAB

Show:

```text
Connections
Accounts
Capabilities
Permissions
Approval Policy
Recent Posts
Recent Comments
Ad Access
Incidents
Audit
```

---

# 177. CONNECTION DETAIL — EMPLOYEES TAB

Show:

```text
Employee
Role
Capabilities
Mode
Approval Policy
Status
```

---

# 178. API — PROVIDERS

```text
GET /social/providers
GET /social/providers/{provider}/capabilities
```

---

# 179. API — CONNECT

```text
POST /organizations/{orgId}/social-connections/{provider}/authorize
GET  /social/oauth/callback/{provider}
```

---

# 180. API — CONNECTIONS

```text
GET  /organizations/{orgId}/social-connections
GET  /social-connections/{id}
POST /social-connections/{id}/test
POST /social-connections/{id}/refresh
POST /social-connections/{id}/revoke
```

---

# 181. API — ACCOUNTS

```text
GET /social-connections/{id}/resources
POST /social-connections/{id}/resources/select
```

---

# 182. API — EMPLOYEE BINDINGS

```text
POST /employee-instances/{employeeId}/social-bindings
GET  /employee-instances/{employeeId}/social-bindings
DELETE /employee-instances/{employeeId}/social-bindings/{bindingId}
```

---

# 183. API — DRAFTS

```text
POST /social/content/drafts
GET  /social/content/drafts/{id}
POST /social/content/drafts/{id}/freeze
```

---

# 184. API — APPROVAL

```text
POST /social/content-snapshots/{id}/approve
POST /social/content-snapshots/{id}/reject
POST /social/content-snapshots/{id}/request-revision
```

---

# 185. API — PUBLISH

```text
POST /social/content-snapshots/{id}/publish
POST /social/content-snapshots/{id}/schedule
POST /social/content-snapshots/{id}/cancel
```

---

# 186. API — DELIVERY RECEIPTS

```text
GET /social/deliveries/{id}
GET /organizations/{orgId}/social/deliveries
```

---

# 187. API — COMMENTS

```text
GET  /social/inbox/comments
POST /social/inbox/comments/{id}/draft-response
POST /social/inbox/comments/{id}/approve-response
POST /social/inbox/comments/{id}/publish-response
```

---

# 188. API — ADS

```text
GET  /social/ads/accounts
GET  /social/ads/campaigns
POST /social/ads/campaigns/prepare
POST /social/ads/campaigns/{id}/approve
POST /social/ads/campaigns/{id}/execute
POST /social/ads/campaigns/{id}/pause
```

---

# 189. DATABASE TABLES — CONNECTIONS

Create/reuse:

```text
social_connection_profiles
social_connection_resources
social_provider_capabilities
social_connection_scopes
employee_social_connection_bindings
social_connection_health
social_token_events
```

---

# 190. DATABASE TABLES — CONTENT

```text
social_content_drafts
social_content_snapshots
social_media_assets
social_approvals
social_delivery_receipts
social_content_calendar
```

---

# 191. DATABASE TABLES — INBOX

```text
social_comments
social_messages
social_mentions
social_response_drafts
social_escalations
```

---

# 192. DATABASE TABLES — ADS

```text
social_ad_accounts
social_campaign_snapshots
social_ads_budget_policies
social_ads_approvals
social_ads_execution_receipts
```

---

# 193. DATABASE TABLES — PROVIDER

```text
social_provider_api_versions
social_provider_policy_versions
social_rate_limit_states
social_webhook_events
social_webhook_deduplication
```

---

# 194. DATABASE TABLES — AUDIT/INCIDENT

```text
social_audit_events
social_media_incidents
```

---

# 195. EVENTS — CONNECTION

```text
EV.social.connection.created
EV.social.connection.authorized
EV.social.connection.degraded
EV.social.connection.expired
EV.social.connection.revoked
EV.social.token.refreshed
```

---

# 196. EVENTS — CONTENT

```text
EV.social.content.drafted
EV.social.content.frozen
EV.social.content.approved
EV.social.content.scheduled
EV.social.content.published
EV.social.content.failed
```

---

# 197. EVENTS — ENGAGEMENT

```text
EV.social.comment.received
EV.social.message.received
EV.social.mention.detected
EV.social.response.escalated
```

---

# 198. EVENTS — ADS

```text
EV.social.ads.campaign.prepared
EV.social.ads.campaign.approved
EV.social.ads.campaign.launched
EV.social.ads.campaign.paused
EV.social.ads.budget.threshold
```

---

# 199. OBSERVABILITY

Track:

```text
API latency
provider errors
publish success rate
token refresh success
webhook latency
rate limit usage
approval latency
delivery latency
ad execution errors
```

---

# 200. COST METERING

Track provider/API and AI costs separately.

---

# 201. SOCIAL READINESS

Create:

`SocialConnectionReadiness`

Checks:

```text
provider authorized
resource selected
scopes valid
capabilities known
token healthy
Employee binding active
permissions valid
approval policy valid
content policy loaded
audit enabled
```

---

# 202. READINESS STATES

```text
READY
READY_WITH_WARNINGS
NEEDS_AUTH
NEEDS_SCOPE
NEEDS_RESOURCE_SELECTION
NEEDS_APPROVAL_POLICY
TOKEN_EXPIRED
PROVIDER_BLOCKED
BLOCKED
```

---

# 203. PUBLISHING READINESS

Before every publish run:

```text
re-evaluate
```

Never rely only on old readiness.

---

# 204. OFFBOARDING INTEGRATION

Integrate with Enterprise Offboarding.

Employee-level:

```text
unbind Employee
```

Area-level:

```text
unbind Marketing Employees
```

Organization-level:

```text
revoke provider authorization
destroy tokens
disable webhooks
purge/retain data by policy
```

---

# 205. RECONNECTION

If provider connection reauthorized:

```text
new token
new capability discovery
new readiness
```

---

# 206. ROLEPACK SAFETY

RolePack defines maximum social capabilities.

Organization instance may reduce, never expand beyond certified maximum.

---

# 207. CERTIFICATION MATRIX

Certify independently:

```text
READ_SOCIAL
READ_ANALYTICS
PREPARE_CONTENT
PUBLISH_ORGANIC
RESPOND_COMMENTS
READ_DMS
RESPOND_DMS
READ_ADS
PREPARE_ADS
EXECUTE_ADS
```

---

# 208. EMPLOYEE CERTIFICATION EXAMPLE — #027

Initial:

```text
READ_SOCIAL          CERTIFIED
READ_ANALYTICS       CERTIFIED
PREPARE_CONTENT      CERTIFIED
PUBLISH_ORGANIC      SHADOW / PENDING
RESPOND_COMMENTS     DRAFT_ONLY
RESPOND_DMS          NOT_CERTIFIED
```

---

# 209. EMPLOYEE CERTIFICATION EXAMPLE — #031

Initial:

```text
READ_ADS             CERTIFIED
PREPARE_ADS          CERTIFIED
EXECUTE_ADS          NOT_CERTIFIED
```

---

# 210. PILOT ORDER

Recommended:

```text
Phase 1 — Read-only Meta
Phase 2 — Read-only LinkedIn
Phase 3 — Content Drafting
Phase 4 — Approved Publishing
Phase 5 — Comments Drafting
Phase 6 — Multi-platform Publishing
Phase 7 — Ads Read-only
Phase 8 — Ads Prepare
Phase 9 — Ads Execute with Approval
```

---

# 211. FIRST PILOT — META

Use test organization.

Connect:

```text
Facebook Page
Instagram Professional Account
```

Mode:

```text
READ_ONLY
```

Employee:

```text
#027 Social Media
```

---

# 212. PILOT TEST 1

Request:

```text
“Analise os últimos 30 dias
e indique os cinco conteúdos com melhor desempenho.”
```

No write action.

---

# 213. PILOT TEST 2

Request:

```text
“Prepare três publicações para o Produto X.
Não publique.”
```

---

# 214. PILOT TEST 3

Enable:

```text
PUBLISH_WITH_APPROVAL
```

Publish one approved test post to controlled test page.

---

# 215. PILOT TEST 4

Validate:

```text
wrong account prevention
```

---

# 216. PILOT TEST 5

Revoke token and verify:

```text
Employee cannot publish
```

---

# 217. PILOT TEST 6

Deactivate #027 and verify:

```text
binding removed
Meta connection remains if shared
```

---

# 218. PILOT TEST 7

Organization offboarding:

```text
all bindings removed
Meta token revoked/destroyed
```

---

# 219. RELEASE GATES

```text
G1 OAuth Security
G2 Tenant Isolation
G3 Resource Scope
G4 Read-only
G5 Employee Binding
G6 Approval Snapshot
G7 Exact Publish
G8 Delivery Receipt
G9 Rate Limits
G10 Webhook Security
G11 Token Revocation
G12 Employee Offboarding
G13 Organization Offboarding
G14 Ads Budget Controls
```

---

# 220. FINAL NO-GO GATES

Block production if:

```text
provider password collected
token visible to Employee
cross-tenant social access possible
wrong account publish possible
approval hash not enforced
content can mutate after approval
ads budget controlled only by prompt
social DMs exposed without permission
webhooks unauthenticated
revoked Employee can still publish
offboarded organization retains active provider token
```

---

# 221. FINAL ARCHITECTURE

```text
ORGANIZATION
↓
SOCIAL MEDIA CONNECTION PROFILE
↓
PROVIDER RESOURCE
↓
EMPLOYEE BINDING
↓
CAPABILITIES
↓
PERMISSIONS
↓
CONTENT / CAMPAIGN SNAPSHOT
↓
POLICY
↓
RISK
↓
APPROVAL
↓
SOCIAL TOOL EXECUTOR
↓
PROVIDER API
↓
DELIVERY RECEIPT
↓
AUDIT
```

---

# 222. FINAL CLIENT EXPERIENCE

Client should be able to:

```text
1. Open Company
2. Open Connections
3. Choose Social Network
4. Authenticate with provider
5. Select Page/Profile/Channel
6. Approve scopes
7. Bind Employee
8. Set permissions
9. Set approval rule
10. Test
11. Activate
12. Request work
```

---

# 223. FINAL PRINCIPLE

```text
THE SOCIAL ACCOUNT BELONGS TO THE ORGANIZATION.
THE CONNECTION PROFILE REPRESENTS AUTHORIZED ACCESS.
THE EMPLOYEE RECEIVES ONLY A SCOPED BINDING.
THE MODEL NEVER OWNS THE CREDENTIAL.
THE POLICY ENGINE DECIDES WHAT MAY HAPPEN.
THE APPROVAL GATE CONTROLS MATERIAL ACTIONS.
THE CONNECTOR EXECUTES EXACTLY WHAT WAS AUTHORIZED.
```

Este é o Social Media Connector Hub a implementar.
