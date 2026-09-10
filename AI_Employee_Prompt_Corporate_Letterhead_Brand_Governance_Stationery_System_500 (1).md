# PROMPT MESTRE COMPLEMENTAR — CORPORATE LETTERHEAD, BRAND GOVERNANCE & STATIONERY SYSTEM
## Papel Timbrado, Logotipos, Cabeçalhos, Rodapés, Assinaturas, Carimbos, Templates Institucionais e Impressão para os 500 AI Employees

**Sigla:** CLBGS  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program  
**Integrações:** Document Generation Service, CAQRS, EREMS, ORDKS, Organization Pack, Work Contracts, Approval Engine, Delivery Router, Audit, Security, Tenant Isolation  
**Objectivo:** permitir que todos os AI Employees que produzam documentos emitam resultados com identidade institucional correcta, incluindo papel timbrado digital ou físico pré-impresso, logotipo, cabeçalho, rodapé, dados legais, assinatura, carimbo, selo, marca d'água, paginação, margens, formatos editáveis e PDF final.

---

# 0. INSTRUÇÃO PRINCIPAL À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Arquitecto de Document Systems;
- Especialista em Design Institucional;
- Especialista em Branding Corporativo;
- Especialista em Gestão Documental;
- Especialista em Impressão e Layout;
- Engenheiro Backend;
- Engenheiro Frontend;
- Especialista em DOCX;
- Especialista em PDF;
- Especialista em XLSX;
- Especialista em PPTX;
- Especialista em Segurança;
- Especialista em Auditoria;
- Especialista em Assinatura Electrónica;
- Especialista em Multi-Tenant SaaS;
- Especialista em Compliance e Governança.

Implemente o:

# **CORPORATE LETTERHEAD, BRAND GOVERNANCE & STATIONERY SYSTEM — CLBGS**

para todos os 500 AI Employees.

---

# 1. PRINCÍPIO FUNDAMENTAL

Um documento empresarial não deve ser apenas:

```text
conteúdo correcto
```

Deve ser:

```text
conteúdo correcto
+
organização correcta
+
identidade visual correcta
+
template correcto
+
papel/timbre correcto
+
margens correctas
+
assinatura autorizada
+
versão correcta
+
formato correcto
+
aprovação correcta
+
entrega correcta
```

---

# 2. OBJECTIVO FUNCIONAL

O sistema deve responder:

```text
Qual empresa está a emitir?
Qual logotipo é oficial?
Qual papel timbrado deve ser usado?
É papel timbrado digital ou físico pré-impresso?
Qual cabeçalho?
Qual rodapé?
Que margens devem ser respeitadas?
Qual template?
Que dados legais devem aparecer?
Quem pode assinar?
Que assinatura pode ser usada?
Pode usar carimbo?
Pode usar selo?
A marca está aprovada?
Qual versão está activa?
Qual formato deve ser entregue?
O documento exige pré-visualização de impressão?
```

---

# 3. MODOS DE PAPEL TIMBRADO

Implementar:

```text
DIGITAL_LETTERHEAD
PREPRINTED_STATIONERY
PLAIN_PAPER
HYBRID
```

---

# 4. DIGITAL_LETTERHEAD

Neste modo, o próprio documento renderizado contém:

```text
logo
company name
NIF
address
contacts
header
footer
brand elements
```

---

# 5. PREPRINTED_STATIONERY

Neste modo, a folha física já contém elementos institucionais.

O sistema deve:

```text
render_logo = false
render_header_identity = false
render_footer_identity = false
```

e reservar espaço físico para:

```text
top reserved area
bottom reserved area
left/right safe areas
```

---

# 6. HYBRID

Permitir casos em que:

```text
logo = preprinted
footer = digital
```

ou outras combinações autorizadas.

---

# 7. ORGANIZATION BRAND PACK

Criar:

`OrganizationBrandPack`

Exemplo:

```yaml
organization_brand_pack:
  organization_id: org_001
  version: 3
  status: APPROVED

  legal_identity:
    legal_name: "EMPRESA, LDA"
    nif: "..."
    address: "..."
    phone: "..."
    email: "..."

  logos:
    primary: asset_logo_primary
    secondary: asset_logo_secondary
    monochrome: asset_logo_bw

  stationery:
    default_letterhead: template_letterhead_v3
    default_paper_size: A4

  typography:
    body_font: approved_font
    heading_font: approved_font

  colors:
    use_approved_palette_only: true

  signatures:
    governed: true

  seals:
    governed: true
```

---

# 8. BRAND ASSET REGISTRY

Criar registo versionado de:

```text
logo
secondary logo
monochrome logo
symbol
watermark
signature
seal
stamp
footer image
header image
background
QR identity mark
```

---

# 9. BRAND ASSET STATES

```text
DRAFT
UNDER_REVIEW
APPROVED
ACTIVE
SUPERSEDED
DEPRECATED
REVOKED
QUARANTINED
```

---

# 10. ONLY APPROVED ASSETS IN PRODUCTION

Regra:

```text
IF asset.status != APPROVED/ACTIVE
THEN production_document_use = BLOCK
```

---

# 11. LOGO GOVERNANCE

Nenhum Employee pode:

```text
invent logo
redesign logo
replace logo
change logo color
stretch logo
alter proportions
```

sem autorização explícita de branding.

---

# 12. LOGO FIT RULES

Preservar:

```text
aspect ratio
safe area
minimum size
approved background
approved variation
```

---

# 13. TENANT ISOLATION

Regra obrigatória:

```text
organization_id(document)
==
organization_id(template)
==
organization_id(logo)
==
organization_id(brand_pack)
```

Caso contrário:

```text
CROSS_TENANT_BRAND_USE
→ BLOCK
```

---

# 14. TEMPLATE REGISTRY

Criar:

`OrganizationTemplateRegistry`

Tipos:

```text
LETTER
CONTRACT
REPORT
PROPOSAL
INVOICE_SUPPORT
BANK_LETTER
TAX_LETTER
HR_DOCUMENT
GOVERNMENT_REQUEST
PROCUREMENT
PRESENTATION
SPREADSHEET
FORM
CERTIFICATE_SUPPORT
MEMO
NOTICE
```

---

# 15. TEMPLATE STATES

```text
DRAFT
UNDER_REVIEW
APPROVED
ACTIVE
SUPERSEDED
DEPRECATED
REVOKED
```

---

# 16. TEMPLATE VERSIONING

Nunca sobrescrever silenciosamente.

```text
letterhead v1
letterhead v2
letterhead v3
```

---

# 17. TEMPLATE EFFECTIVE DATES

Guardar:

```text
effective_from
effective_until
```

---

# 18. TEMPLATE SELECTION ENGINE

Seleccionar por:

```text
organization
document_type
department
purpose
recipient
jurisdiction
language
delivery_channel
risk
```

---

# 19. EXAMPLE TEMPLATE ROUTING

```text
Tax letter
→ TAX.LETTERHEAD

Bank request
→ BANK.LETTERHEAD

Contract
→ LEGAL.CONTRACT

Management report
→ MANAGEMENT.REPORT

Proposal
→ SALES.PROPOSAL
```

---

# 20. DEFAULT TEMPLATE FALLBACK

Se não existir template específico:

```text
use approved organization default
```

Se não existir default:

```text
TEMPLATE_MISSING
→ ask/configure
```

---

# 21. NO SILENT GENERIC BRANDING

Não usar generic template se o pedido exige papel timbrado oficial.

---

# 22. PAGE SIZE

Suportar:

```text
A4
Letter
Legal
Custom
```

---

# 23. MARGIN MODEL

Configurar:

```text
top_mm
bottom_mm
left_mm
right_mm
```

---

# 24. RESERVED AREAS

Definir:

```text
header_reserved_area
footer_reserved_area
signature_reserved_area
stamp_reserved_area
binding_reserved_area
```

---

# 25. HEADER RULES

Configurar:

```text
first_page_header
subsequent_page_header
header_height
logo_position
legal_identity_position
contact_position
```

---

# 26. FOOTER RULES

Configurar:

```text
footer_all_pages
footer_height
page_number
legal_text
address
website
contacts
confidentiality
```

---

# 27. FIRST PAGE VS NEXT PAGES

Suportar:

```text
FIRST_PAGE = FULL_HEADER
NEXT_PAGES = COMPACT_HEADER
```

---

# 28. PAGINATION

Suportar:

```text
page X of Y
X
none
```

---

# 29. WATERMARK

Permitir:

```text
DRAFT
CONFIDENTIAL
COPY
ORIGINAL
CANCELLED
```

conforme policy.

---

# 30. WATERMARK GOVERNANCE

Marca d'água não pode ser adicionada/removida se for policy-controlled sem autorização.

---

# 31. LEGAL IDENTITY FIELDS

Permitir:

```text
legal name
commercial name
NIF
registered address
contact
email
website
registration number
license reference
```

---

# 32. DYNAMIC LEGAL FIELDS

Campos legais devem vir do Organization Pack, não do texto livre do LLM.

---

# 33. MASTER DATA AUTHORITY

Regra:

```text
Organization Master Data
>
free-form generated identity text
```

---

# 34. DIGITAL SIGNATURE VS VISUAL SIGNATURE

Distinguir:

```text
visual signature image
electronic signature
digital cryptographic signature
```

---

# 35. VISUAL SIGNATURE CONTROL

Imagem de assinatura só pode ser usada se:

```text
signatory authorized
document type allowed
user permitted
approval satisfied
```

---

# 36. SIGNATURE NEVER GENERATED

Proibir:

```text
generate fake signature
imitate person's handwriting
```

---

# 37. SIGNATURE REGISTRY

Guardar:

```text
signatory_id
organization_id
role
signature_asset
allowed_document_types
valid_from
valid_until
status
```

---

# 38. SIGNATURE STATES

```text
ACTIVE
SUSPENDED
EXPIRED
REVOKED
```

---

# 39. SIGNATURE APPROVAL

Documento deve chegar a:

```text
READY_FOR_SIGNATURE
```

antes de assinatura.

---

# 40. SIGNATURE WORKFLOW

```text
Document Prepared
↓
Validated
↓
Approval
↓
Ready for Signature
↓
Authorized Signatory
↓
Signed
↓
Final
```

---

# 41. SEAL/STAMP GOVERNANCE

Carimbo/selo deve ter:

```text
asset
organization
authorized users
allowed document types
status
audit
```

---

# 42. SEAL NEVER AUTO-APPLIED WITHOUT POLICY

Regra:

```text
seal usage requires explicit policy
```

---

# 43. ELECTRONIC SIGNATURE INTEGRATION

Preparar integração com provedores de assinatura electrónica.

Estados:

```text
SIGNATURE_REQUESTED
SIGNATURE_PENDING
SIGNED
DECLINED
EXPIRED
```

---

# 44. SIGNED DOCUMENT IMMUTABILITY

Após assinatura:

```text
content hash frozen
```

Alteração exige nova versão e nova assinatura.

---

# 45. PREPRINTED STATIONERY PROFILE

Criar:

```yaml
preprinted_stationery:
  stationery_id: preprint_001
  paper_size: A4

  reserved:
    top_mm: 45
    bottom_mm: 22
    left_mm: 20
    right_mm: 20

  contains:
    logo: true
    company_identity: true
    footer: true

  render:
    logo: false
    identity: false
    footer: false
```

---

# 46. PRINT CALIBRATION

Permitir ajuste por impressora:

```text
x_offset_mm
y_offset_mm
scale
```

---

# 47. PRINTER PROFILE

Criar:

```text
printer_id
organization_id
paper_tray
stationery_type
offsets
duplex
color_mode
```

---

# 48. PRINT PREVIEW

Obrigatório para PREPRINTED_STATIONERY.

Mostrar:

```text
digital content
+
stationery overlay
```

---

# 49. PRINT SAFE AREA

Detectar overflow:

```text
text overlaps logo
text overlaps header
text overlaps footer
signature outside area
```

---

# 50. PRINT VALIDATION

Se overlap:

```text
PRINT_LAYOUT_FAIL
```

---

# 51. DIGITAL LETTERHEAD PREVIEW

Mostrar exactamente o PDF final antes de aprovação.

---

# 52. DOCX OUTPUT

DOCX deve:

```text
remain editable
preserve header/footer
preserve page setup
preserve styles
```

---

# 53. PROTECTED BRAND ELEMENTS

Quando tecnicamente possível:

```text
protect institutional elements
while keeping body editable
```

---

# 54. PDF OUTPUT

PDF deve:

```text
preserve exact layout
embed necessary font information
respect page size
respect margins
preserve images
```

---

# 55. XLSX BRANDING

Folhas de cálculo podem ter:

```text
logo
company identity
header/footer
print area
page setup
```

---

# 56. PPTX BRANDING

Apresentações devem usar:

```text
approved master
logo placement
approved typography
approved theme
```

---

# 57. TEMPLATE IMPORT

Permitir importar:

```text
DOCX
PDF
PPTX
XLSX
PNG
JPG
SVG
```

---

# 58. TEMPLATE ANALYSIS

Ao importar:

```text
detect header
detect footer
detect logo
detect fixed areas
detect variable fields
detect margins
detect page size
```

---

# 59. TEMPLATE CANDIDATE

Importação cria:

```text
TEMPLATE_CANDIDATE
```

não template activo automático.

---

# 60. TEMPLATE REVIEW

Fluxo:

```text
Upload
↓
Analyze
↓
Candidate
↓
Human Review
↓
Approve
↓
Activate
```

---

# 61. FIELD MAPPING

Mapear placeholders:

```text
{{organization.name}}
{{organization.nif}}
{{organization.address}}
{{recipient.name}}
{{document.date}}
{{document.subject}}
{{signatory.name}}
```

---

# 62. DYNAMIC FIELD VALIDATION

Campos obrigatórios vazios:

```text
TEMPLATE_REQUIRED_FIELD_MISSING
```

---

# 63. BRANDING POLICY

Criar:

`BrandingPolicy`

---

# 64. BRANDING POLICY EXAMPLE

```yaml
branding_policy:
  organization_id: org_001
  default_logo: asset_001
  official_letterhead: template_003
  allow_monochrome_logo: true
  allow_custom_colors: false
  signature_requires_approval: true
  seal_requires_approval: true
```

---

# 65. PERMISSIONS

Criar capacidades:

```text
brand.view
brand.edit
brand.approve
template.view
template.edit
template.approve
signature.use
signature.admin
seal.use
seal.admin
print_stationery.configure
```

---

# 66. ROLES

Exemplo:

```text
Brand Viewer
Brand Editor
Brand Approver
Document Creator
Authorized Signatory
Stationery Admin
```

---

# 67. LEAST PRIVILEGE

Employee só usa activos necessários para a tarefa.

---

# 68. ORGANIZATION BINDING

Todo Employee activo numa organização recebe:

```text
brand_pack_binding
template_binding
stationery_binding
```

---

# 69. EMPLOYEE WORK CONTRACT EXTENSION

Adicionar:

```text
branding_requirements
template_requirements
signature_requirements
stationery_mode
```

---

# 70. OUTPUT CONTRACT EXTENSION

Adicionar:

```text
required_brand_pack
required_template
required_formats
print_mode
signature_state
```

---

# 71. DOCUMENT REQUEST EXTENSION

Exemplo:

```yaml
document_request:
  type: TAX_LETTER
  organization_id: org_001
  letterhead: REQUIRED
  stationery_mode: DIGITAL_LETTERHEAD
  output_formats:
    - DOCX
    - PDF
```

---

# 72. DOCUMENT GENERATION FLOW

```text
AI Employee
↓
Structured Work Product
↓
Document Request
↓
Template Resolver
↓
Brand Pack Resolver
↓
Stationery Resolver
↓
Content Composer
↓
Layout Engine
↓
Branding Engine
↓
Signature/Seal Policy
↓
Document Validator
↓
DOCX/PDF/XLSX/PPTX
↓
Print Preview
↓
Approval
↓
Delivery
```

---

# 73. NO BRAND RESOLUTION BY LLM

LLM não decide livremente qual logotipo usar.

Brand Resolver é determinístico/policy-based.

---

# 74. DOCUMENT VALIDATOR

Verificar:

```text
organization match
logo match
template version
legal identity
margins
page size
header
footer
signature authorization
seal authorization
format
```

---

# 75. BRAND VALIDATION STATUS

```text
BRAND_VALID
BRAND_INVALID
BRAND_ASSET_MISSING
TEMPLATE_MISSING
TEMPLATE_SUPERSEDED
```

---

# 76. BRAND MISMATCH

Se errado:

```text
BRANDING_MISMATCH
```

---

# 77. TEMPLATE MISMATCH

Se errado:

```text
TEMPLATE_MISMATCH
```

---

# 78. CAQRS INTEGRATION

Cliente reporta:

```text
“Não usou o timbre correcto.”
```

→ CAQRS classifica:

```text
TEMPLATE_MISMATCH
or
BRANDING_MISMATCH
```

---

# 79. EREMS INTEGRATION

Se template correcto estava configurado e Employee/sistema usou outro:

```text
confirmed operational error
```

alimentar EREMS.

---

# 80. CONFIGURATION GAP

Se cliente nunca forneceu timbre:

```text
ORGANIZATION_CONFIGURATION_GAP
```

não penalizar Employee.

---

# 81. ORDKS INTEGRATION

Brand Pack faz parte de Organization Knowledge/Configuration, não general model knowledge.

---

# 82. VERSION-AWARE RENDERING

Guardar:

```text
brand_pack_version
template_version
logo_version
signature_version
```

---

# 83. APPROVAL SNAPSHOT

Aprovação deve congelar:

```text
content
template
brand pack
signature choice
```

---

# 84. SNAPSHOT MISMATCH

Se qualquer elemento mudar após aprovação:

```text
DOCUMENT_APPROVAL_SNAPSHOT_MISMATCH
```

---

# 85. MULTI-BRAND ORGANIZATIONS

Suportar:

```text
parent company
subsidiary
brand
branch
business unit
```

---

# 86. MULTI-BRAND RESOLUTION

Escolher pelo emitting legal entity.

---

# 87. BRANCH LETTERHEAD

Permitir:

```text
branch-specific address
branch-specific phone
same legal identity
```

---

# 88. COUNTRY/JURISDICTION VARIANTS

Permitir template por país.

---

# 89. LANGUAGE VARIANTS

Permitir:

```text
pt-AO
pt-PT
en
fr
```

---

# 90. OFFICIAL DATA SOURCE

NIF/endereço/legal name devem vir de master data aprovada.

---

# 91. CHANGE REQUEST FOR LEGAL IDENTITY

Alterar NIF ou nome legal deve exigir permissão elevada.

---

# 92. BRAND CHANGE WORKFLOW

```text
request
↓
review
↓
approve
↓
effective date
↓
activate
↓
supersede old version
```

---

# 93. OLD DOCUMENT REPRODUCIBILITY

Documento histórico deve continuar reproduzível com branding da época.

---

# 94. BRAND AUDIT

Guardar:

```text
who uploaded
who edited
who approved
who activated
where used
```

---

# 95. SIGNATURE AUDIT

Guardar:

```text
who requested
who authorized
what document
what version
when
```

---

# 96. SEAL AUDIT

Guardar idem.

---

# 97. SECURITY TESTS

Testar:

```text
cross-tenant logo
cross-tenant signature
cross-tenant template
fake signatory
revoked signature
tampered template
malicious SVG
malicious DOCX
external link injection
macro abuse
path traversal
asset replacement race
approval bypass
```

---

# 98. MALICIOUS FILE DEFENSE

Uploads devem passar por:

```text
quarantine
validation
sanitization
content inspection
```

---

# 99. MACRO POLICY

Nunca executar macros de templates importados.

---

# 100. EXTERNAL LINKS

Controlar imagens remotas e links externos.

---

# 101. ASSET STORAGE

Guardar activos em storage versionado e imutável por hash.

---

# 102. ASSET HASH

Cada asset:

```text
sha256
```

---

# 103. DUPLICATE ASSET DETECTION

Detectar uploads duplicados.

---

# 104. IMAGE QUALITY

Validar:

```text
resolution
transparency
dimensions
file integrity
```

---

# 105. VECTOR LOGO

Preferir SVG/PDF vector quando seguro e suportado.

---

# 106. RASTER FALLBACK

PNG de alta resolução quando necessário.

---

# 107. COLOR MANAGEMENT

Preservar perfis e evitar alterações arbitrárias.

---

# 108. BLACK-AND-WHITE PRINT

Suportar versão monocromática aprovada.

---

# 109. PRINT COLOR MODE

```text
COLOR
GRAYSCALE
MONOCHROME
```

---

# 110. DOCUMENT TYPE RULES

Cada document type pode definir:

```text
letterhead required
signature required
seal allowed
footer required
page numbering
```

---

# 111. EXAMPLE — TAX LETTER

```text
letterhead = REQUIRED
signature = REQUIRED
seal = ORGANIZATION_POLICY
output = DOCX + PDF
```

---

# 112. EXAMPLE — INTERNAL MEMO

```text
letterhead = OPTIONAL
signature = OPTIONAL
output = DOCX/PDF
```

---

# 113. EXAMPLE — CONTRACT

```text
letterhead = TEMPLATE_DEFINED
signature = REQUIRED
page numbering = REQUIRED
approval = REQUIRED
```

---

# 114. PRINT MODE SELECTION

User pode escolher:

```text
Digital Letterhead
Preprinted Paper
Plain Paper
```

se tiver permissão.

---

# 115. DEFAULT PRINT MODE

Organization Pack define default.

---

# 116. PREVIEW MODES

Criar:

```text
Digital Preview
Print Preview
Preprinted Overlay Preview
```

---

# 117. SIDE-BY-SIDE PREVIEW

Opcional:

```text
editable DOCX view
vs
final PDF view
```

---

# 118. VISUAL QA

Automatizar verificações:

```text
overflow
cropping
logo distortion
widow/orphan issues
footer collision
signature collision
blank page
```

---

# 119. DOCUMENT DIFF

Mudança de template deve aparecer no diff de versão.

---

# 120. CLIENT ACCEPTANCE

Cliente pode rejeitar por:

```text
wrong letterhead
wrong logo
wrong branch
wrong signatory
wrong margins
wrong layout
```

---

# 121. FEEDBACK TAXONOMY EXTENSION

Adicionar ao CAQRS:

```text
LETTERHEAD_MISMATCH
LOGO_MISMATCH
SIGNATURE_MISMATCH
SEAL_MISMATCH
STATIONERY_MODE_MISMATCH
PRINT_ALIGNMENT_ISSUE
```

---

# 122. PREVENTABLE REVISION

Se Brand Pack estava correcto e não foi aplicado:

```text
PREVENTABLE
```

---

# 123. NON-PREVENTABLE REVISION

Se cliente mudou logotipo após entrega:

```text
DATA_CHANGED / BRAND_CHANGED
```

---

# 124. RELIABILITY METRICS

Medir:

```text
brand_accuracy_rate
template_accuracy_rate
signature_authorization_accuracy
print_layout_success_rate
```

---

# 125. DOCUMENT EMPLOYEE METRICS

Para #261–#286 adicionar:

```text
branding correctness
template correctness
render fidelity
editability
```

---

# 126. 500/500 COVERAGE

Todos os 500 Employees que possam gerar documento devem respeitar CLBGS.

---

# 127. CAPABILITY FLAG

Adicionar:

```text
produces_documents: true/false
```

---

# 128. DOCUMENT PRODUCER POLICY

Se `produces_documents = true`:

```text
CLBGS mandatory
```

---

# 129. DOCUMENT CREATOR GENERALIST

#261 deve saber orquestrar esta camada.

---

# 130. SPECIALIST DOCUMENT EMPLOYEES

#262–#286 devem respeitar a mesma governação.

---

# 131. CROSS-DEPARTMENT DOCUMENTS

Accounting, Tax, HR, Legal, Banking, Public Admin, Procurement, etc. usam CLBGS.

---

# 132. HUMAN CONTROL CENTER

Mostrar:

```text
template
brand
signatory
stationery mode
approval status
```

antes de emissão material.

---

# 133. COMMAND EXAMPLE

Pedido:

```text
“Faça uma carta à AGT em papel timbrado.”
```

Flow:

```text
#268 Tax Document Employee
↓
Organization Resolver
↓
Tax Letter Template
↓
Brand Pack
↓
Letterhead
↓
Validator
↓
DOCX + PDF
```

---

# 134. COMMAND EXAMPLE — PREPRINTED

Pedido:

```text
“Prepare para imprimir na folha timbrada física.”
```

Flow:

```text
PREPRINTED_STATIONERY
↓
reserved areas
↓
body only
↓
overlay preview
↓
print
```

---

# 135. COMMAND EXAMPLE — BANK

```text
“Carta para o banco com o logotipo da empresa.”
```

Resolver automaticamente entidade legal correcta.

---

# 136. DATA MODEL

Criar:

```text
organization_brand_packs
brand_pack_versions
brand_assets
brand_asset_versions
organization_templates
template_versions
template_placeholders
stationery_profiles
printer_profiles
signature_profiles
seal_profiles
branding_policies
document_brand_bindings
document_render_snapshots
print_previews
brand_validation_results
```

---

# 137. APIs

Criar:

```text
GET  /organizations/{id}/brand-pack
POST /organizations/{id}/brand-pack

GET  /organizations/{id}/templates
POST /organizations/{id}/templates
POST /templates/{id}/approve
POST /templates/{id}/activate

GET  /organizations/{id}/stationery
POST /organizations/{id}/stationery

GET  /organizations/{id}/signatures
POST /organizations/{id}/signatures

POST /documents/{id}/render
POST /documents/{id}/print-preview
POST /documents/{id}/validate-branding
```

---

# 138. TEMPLATE COMPILER

Converter template aprovado em representação interna segura.

---

# 139. UNIVERSAL DOCUMENT MODEL INTEGRATION

Branding deve ser camada do Universal Document Model.

---

# 140. RENDER PIPELINE

```text
Universal Document Model
↓
Brand Layer
↓
Template Layer
↓
Layout Layer
↓
Format Renderer
```

---

# 141. CACHE

Pode cachear assets aprovados por hash.

---

# 142. CACHE INVALIDATION

Nova versão de Brand Pack invalida cache relevante.

---

# 143. OBSERVABILITY

Medir:

```text
template resolution latency
render failures
asset missing
validation failures
print failures
```

---

# 144. ALERTS

Alertar:

```text
expired signature
revoked logo
missing active template
print mismatch
```

---

# 145. ORGANIZATION ONBOARDING

Adicionar passo:

```text
Upload Brand Pack
↓
Approve
↓
Configure Templates
↓
Configure Stationery
↓
Configure Signatories
↓
Test Render
↓
Test Print
↓
Organization Ready
```

---

# 146. ORGANIZATION READINESS GATE

Exigir, para organizações que usam papel timbrado:

```text
brand_pack = ACTIVE
default_template = ACTIVE
stationery profile = VALID
test document = PASS
```

---

# 147. TEST DOCUMENT

Gerar documento de prova antes de produção.

---

# 148. PRINT CALIBRATION TEST

Para papel pré-impresso:

```text
test page
↓
measure offsets
↓
calibrate
↓
approve
```

---

# 149. MULTIPLE PRINTERS

Guardar perfis diferentes por impressora.

---

# 150. MOBILE

No mobile, permitir:

```text
preview
approve
sign request
```

---

# 151. WEB

No web, permitir administração completa.

---

# 152. ACCESSIBILITY

Preview deve permitir zoom e leitura clara.

---

# 153. BRAND HISTORY

Mostrar:

```text
active
previous
future scheduled
```

---

# 154. SCHEDULED BRAND CHANGE

Permitir novo logotipo activar em data futura.

---

# 155. DOCUMENT GENERATED BEFORE CHANGE

Mantém versão antiga.

---

# 156. DOCUMENT GENERATED AFTER CHANGE

Usa nova versão.

---

# 157. LEGAL ENTITY SWITCH

Se utilizador muda entidade emissora, re-resolver:

```text
brand
template
NIF
address
signatory
```

---

# 158. MULTI-ENTITY ORGANIZATION

Evitar misturar empresas do mesmo grupo.

---

# 159. BRANCH VS LEGAL ENTITY

Branch não deve substituir entidade legal se documento exigir legal entity.

---

# 160. BRAND POLICY CONFLICT

Se template pede logo antigo mas Brand Pack revogou:

```text
BRAND_POLICY_CONFLICT
```

---

# 161. HUMAN REVIEW

Casos ambíguos:

```text
HUMAN_REVIEW_REQUIRED
```

---

# 162. LOW-CONFIDENCE TEMPLATE DETECTION

Import de PDF/imagem com análise incerta não pode auto-activar.

---

# 163. TEMPLATE OCR/ANALYSIS LIMIT

Usar análise estrutural/visual segura; exigir confirmação humana.

---

# 164. STATIONERY INVENTORY OPTIONAL

Opcionalmente controlar stock de papel timbrado físico.

---

# 165. PRINT JOB AUDIT

Guardar:

```text
document
printer
user
stationery
pages
timestamp
```

quando permitido.

---

# 166. VOID PRINT

Permitir marcar impressão cancelada.

---

# 167. COPY WATERMARK

Cópias podem receber:

```text
COPY
```

conforme policy.

---

# 168. ORIGINAL CONTROL

Opcionalmente controlar original/cópia.

---

# 169. QR VALIDATION

Opcionalmente inserir QR para verificar autenticidade interna.

---

# 170. QR DOES NOT REPLACE SIGNATURE

Não confundir.

---

# 171. DOCUMENT HASH

Final PDF deve poder ter:

```text
sha256
```

---

# 172. DELIVERY ROUTER

Entregar via:

```text
download
email
Drive
SharePoint
DMS
messaging
print
```

---

# 173. DELIVERY RECEIPT

Guardar:

```text
document version
brand version
template version
delivery destination
timestamp
```

---

# 174. ARCHIVE

Arquivar exactamente a versão enviada.

---

# 175. REPRODUCIBILITY

Deve ser possível reconstruir:

```text
which logo
which template
which legal identity
which signatory
which stationery mode
```

---

# 176. CAQRS ACCEPTANCE RECEIPT

Associar branding snapshot à versão aceita.

---

# 177. EREMS ERROR CLASSIFICATION

Erros possíveis:

```text
TEMPLATE_RESOLUTION_ERROR
BRAND_ASSET_ERROR
SIGNATURE_POLICY_ERROR
PRINT_LAYOUT_ERROR
```

---

# 178. ERROR SEVERITY

Pode variar:

```text
wrong logo = operational/material
wrong legal entity = material/critical
unauthorized signature = critical
cross-tenant asset = catastrophic
```

---

# 179. NO-GO TRIGGERS

```text
cross-tenant brand use
unauthorized signature
revoked signature
wrong legal entity
approval bypass
tampered approved template
```

---

# 180. TEST SUITES

Criar:

```text
brand-pack tests
template tests
stationery tests
signature tests
seal tests
render tests
print tests
tenant isolation tests
security tests
regression tests
```

---

# 181. ACCEPTANCE TESTS

Obrigatórios:

1. digital letterhead renders correctly;
2. preprinted mode suppresses duplicate logo/header/footer;
3. first-page vs next-page header works;
4. margins are respected;
5. wrong tenant logo is blocked;
6. unauthorized signature is blocked;
7. revoked signature is blocked;
8. template version is preserved;
9. approved snapshot mismatch is detected;
10. DOCX stays editable;
11. PDF preserves layout;
12. print preview overlay works;
13. calibration offsets work;
14. branding mismatch reaches CAQRS;
15. confirmed branding error reaches EREMS;
16. organization configuration gap does not penalize Employee;
17. multiple legal entities remain isolated;
18. imported template requires review;
19. macros are not executed;
20. historical document is reproducible.

---

# 182. GENERATED FILES

Gerar:

```text
generated/organization_brand_packs.json
generated/template_registry.json
generated/stationery_profiles.json
generated/signature_registry.json
generated/seal_registry.json
generated/branding_policies.json

schemas/organization-brand-pack.schema.json
schemas/brand-asset.schema.json
schemas/document-template.schema.json
schemas/stationery-profile.schema.json
schemas/signature-profile.schema.json
schemas/seal-profile.schema.json
schemas/document-brand-snapshot.schema.json

packages/brand-registry/
packages/template-registry/
packages/template-resolver/
packages/branding-engine/
packages/stationery-engine/
packages/print-preview/
packages/signature-governance/
packages/seal-governance/
packages/brand-validator/

tests/branding/
tests/templates/
tests/stationery/
tests/signatures/
tests/printing/
tests/security/
tests/tenant-isolation/
tests/regression/

docs/BRAND_GOVERNANCE.md
docs/LETTERHEAD_SYSTEM.md
docs/PREPRINTED_STATIONERY.md
docs/SIGNATURE_AND_SEAL_POLICY.md
docs/PRINT_CALIBRATION.md
```

---

# 183. UI — BRAND CENTER

Criar:

```text
Brand Pack
Logos
Templates
Stationery
Signatures
Seals
Printers
Version History
Approvals
```

---

# 184. UI — DOCUMENT BRANDING PANEL

Durante criação:

```text
Organization
Legal Entity
Template
Letterhead Mode
Signatory
Seal
Output Format
```

---

# 185. UI — PRINT PREVIEW

Mostrar papel real virtualmente.

---

# 186. UI — BRAND VALIDATION

Antes de entrega:

```text
Branding PASS / FAIL
```

---

# 187. UI — WARNING

Exemplo:

```text
“This document is configured for preprinted stationery.
Logo will not be rendered digitally.”
```

---

# 188. LOCALIZATION

Interface em português.

---

# 189. AUDIT LOG EVENTS

Emitir:

```text
EV.brand.asset_uploaded
EV.brand.asset_approved
EV.brand.template_activated
EV.brand.signature_used
EV.brand.seal_used
EV.brand.validation_failed
EV.brand.print_preview_generated
EV.brand.document_rendered
```

---

# 190. CHANGE PROPAGATION

Mudança de Brand Pack deve afectar apenas organização aplicável.

---

# 191. NO GLOBAL LEAKAGE

Nunca propagar logo/template de uma organização a outra.

---

# 192. DEFAULTS

Defaults podem ser definidos por:

```text
organization
department
document type
branch
```

---

# 193. SPECIFICITY ORDER

```text
document-specific
branch-specific
department-specific
organization default
```

sempre respeitando policy.

---

# 194. BRAND QUALITY METRICS

Medir:

```text
branding_correctness_rate
template_correctness_rate
print_success_rate
signature_policy_compliance_rate
```

---

# 195. QUALITY DASHBOARD

Mostrar:

```text
Documents Rendered
Branding Failures
Template Mismatches
Print Layout Failures
Unauthorized Signature Attempts
```

---

# 196. RELIABILITY PASSPORT EXTENSION

Adicionar:

```text
brand_compliance
template_compliance
signature_compliance
print_layout_reliability
```

---

# 197. ORGANIZATION QUALITY PROFILE

Medir branding accuracy por organização.

---

# 198. TEST WITH REAL ORGANIZATION TEMPLATE

Antes de ACTIVE, testar com template real.

---

# 199. SHADOW MODE

Comparar documento humano vs documento AI quanto a:

```text
content
branding
layout
signature placement
print readiness
```

---

# 200. HUMAN BENCHMARK

Especialista documental valida aparência e conformidade.

---

# 201. CERTIFICATION GATE

Employee que gera documentos materiais não pode ser certificado se falhar branding obrigatório.

---

# 202. DOCUMENT GENERATION SERVICE DEFINITION OF DONE

Adicionar CLBGS como dependência obrigatória.

---

# 203. FULL DOCUMENT STACK

```text
CONTENT
↓
TEMPLATE
↓
BRAND
↓
STATIONERY
↓
LAYOUT
↓
SIGNATURE/SEAL
↓
VALIDATION
↓
RENDER
↓
PRINT PREVIEW
↓
APPROVAL
↓
DELIVERY
```

---

# 204. PRINCÍPIO DE SEGURANÇA

Identidade visual corporativa é um activo controlado, não um elemento decorativo livre.

---

# 205. PRINCÍPIO DE VERDADE

Nunca afirmar que documento está em “papel timbrado oficial” se asset/template não estiver aprovado.

---

# 206. PRINCÍPIO DE AUTORIZAÇÃO

Nunca aplicar assinatura ou selo apenas porque o utilizador pediu em linguagem natural.

---

# 207. PRINCÍPIO DE REPRODUÇÃO

Todo documento deve ser reproduzível com os mesmos:

```text
content snapshot
brand snapshot
template snapshot
```

---

# 208. PRINCÍPIO DE ISOLAMENTO

```text
Org A branding
NEVER
Org B document
```

---

# 209. BUILD GATE

Executar:

```text
BRAND PACK SYSTEM             PASS
ASSET REGISTRY                PASS
TEMPLATE REGISTRY             PASS
STATIONERY ENGINE             PASS
PRINT PREVIEW                 PASS
SIGNATURE GOVERNANCE          PASS
SEAL GOVERNANCE               PASS
TENANT ISOLATION              PASS
DOCUMENT VALIDATOR            PASS
CAQRS BRIDGE                  PASS
EREMS BRIDGE                  PASS
AUDIT                         PASS
SECURITY                      PASS
```

---

# 210. ORGANIZATION READINESS GATE

Para organização que necessita papel timbrado:

```text
ACTIVE BRAND PACK             PASS
ACTIVE LETTERHEAD             PASS
STATIONERY PROFILE            PASS
SIGNATORY CONFIG              PASS
TEST RENDER                   PASS
TEST PRINT                    PASS
```

---

# 211. DEFINITION OF DONE

CLBGS só está concluído quando:

```text
✓ papel timbrado digital funciona
✓ papel pré-impresso funciona
✓ modo híbrido funciona
✓ Organization Brand Pack existe
✓ logos são versionados
✓ templates são versionados
✓ margens/reserved areas funcionam
✓ primeira página vs restantes funciona
✓ print preview funciona
✓ printer calibration funciona
✓ assinatura é governada
✓ carimbo/selo é governado
✓ cross-tenant use é bloqueado
✓ DOCX editável funciona
✓ PDF final funciona
✓ CAQRS integrado
✓ EREMS integrado
✓ Organization Readiness integrado
✓ audit trail existe
✓ testes passam
```

---

# 212. RESULTADO FINAL ESPERADO

Quando o utilizador pedir:

```text
“Faça este documento em papel timbrado da empresa.”
```

o sistema deve:

```text
1. identificar a entidade legal;
2. carregar o Brand Pack correcto;
3. escolher o template correcto;
4. determinar se o timbre é digital ou pré-impresso;
5. aplicar margens e áreas reservadas;
6. compor o documento;
7. validar o branding;
8. aplicar assinatura/selo apenas se autorizado;
9. gerar DOCX editável e/ou PDF;
10. mostrar print preview;
11. obter aprovação quando necessária;
12. entregar a versão exacta;
13. registar receipt e audit trail.
```

---

# 213. PRINCÍPIO FINAL

O objectivo é transformar:

```text
“colocar um logotipo no Word”
```

em:

```text
GOVERNED CORPORATE DOCUMENT ISSUANCE
```

com:

```text
identidade correcta
branding correcto
template correcto
papel correcto
assinatura autorizada
impressão correcta
versionamento
aprovação
segurança
auditoria
```

para todos os 500 AI Employees que produzam documentos.
