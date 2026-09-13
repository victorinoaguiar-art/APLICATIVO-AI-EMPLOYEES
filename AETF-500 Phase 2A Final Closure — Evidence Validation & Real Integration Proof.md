# PROMPT — AETF-500 PHASE 2A FINAL CLOSURE  
# Evidence Validation, Real Offline Execution & Enterprise Integration Proof

## 1. MISSÃO

Atue como:

- Arquiteto Sénior de QA Enterprise;
- Auditor Técnico de Sistemas;
- Especialista em AI Evaluation;
- Especialista em Test Evidence;
- Especialista em Red Team;
- Especialista em sistemas distribuídos;
- Especialista em execução Cloud + Local;
- Especialista em filas offline e deferred execution;
- Especialista em Windows Desktop Automation;
- Especialista em Microsoft Excel Desktop;
- Especialista em Power Query;
- Especialista em ERP PRIMAVERA;
- Especialista em APIs;
- Especialista em segurança multi-tenant;
- Especialista em evidência digital;
- Especialista em auditoria de software;
- Especialista em certificação técnica de AI Employees.

A missão desta execução é **fechar definitivamente a AETF-500 Phase 2A**, eliminando as últimas incertezas entre:

```text
DECLARED
```

e:

```text
PROVEN
```

Não criar novos motores.

Não criar novas funcionalidades comerciais.

Não iniciar a Phase 2B.

Não aumentar artificialmente o número de testes.

Não gerar novas métricas apenas para melhorar o dashboard.

Executar, verificar e provar.

---

# 2. CONTEXTO DE ENTRADA

A plataforma declara atualmente:

```text
1,250 Test Runs
10,000 Employee-Evaluation Associations
287 Red Team Executions
500 Employee Profiles
RCODE Idempotency Validated
Multi-Tenant Isolation Validated
Document Prompt Injection Validated
Cloud → Local → Cloud Integration
Evidence Files Generated
```

Existem também artefactos de auditoria:

```text
generated/aetf_phase2a_1250_test_runs_audit.json

generated/aetf_phase2a_10000_associations_audit.json

generated/aetf_phase2a_287_redteam_vectors_audit.json
```

O objetivo desta etapa é confirmar que estes números representam **execução verificável**, e não apenas registos programaticamente gerados.

---

# 3. QUATRO GATES FINAIS

A Phase 2A só poderá receber:

```text
STATUS = COMPLETED
```

quando estes quatro gates forem fechados:

```text
GATE F1
1,250 Test Runs Evidence Validation

GATE F2
Actual Employee Evaluation Execution

GATE F3
Real Offline Device Deferred Execution

GATE F4
Real Excel Desktop + PRIMAVERA Staging Integration
```

---

# 4. REGRA ABSOLUTA

Aplicar:

```text
RECORD EXISTS
≠
TEST EXECUTED
```

```text
ASSOCIATION EXISTS
≠
EVALUATION EXECUTED
```

```text
AGENT SIMULATION
≠
REAL DEVICE EXECUTION
```

```text
CONNECTOR CODE EXISTS
≠
REAL APPLICATION INTEGRATION
```

---

# 5. GATE F1 — AUDITAR OS 1.250 TEST RUNS

Abrir e validar o ficheiro:

```text
generated/aetf_phase2a_1250_test_runs_audit.json
```

Não aceitar apenas:

```text
array.length = 1250
```

Validar semanticamente cada Test Run.

---

# 6. CAMPOS MÍNIMOS OBRIGATÓRIOS

Cada Test Run deve possuir:

```text
test_run_id
test_case_id
campaign_id
test_type

started_at
finished_at

input
expected_result
actual_result

result

execution_environment

mock_used

real_connector
real_device
real_application

evidence_bundle_id
evidence_hash
```

Quando aplicável:

```text
employee_id
tenant_id
device_id
connector_id
application_id
```

---

# 7. DETETAR TEST RUNS FALSAMENTE GERADOS

Procurar padrões como:

```text
same timestamp
same output
same input
same evidence hash
same execution duration
sequential synthetic values
identical payloads
copy-paste expected results
```

---

# 8. DETEÇÃO DE DUPLICAÇÃO

Calcular:

```text
UNIQUE TEST CASES
UNIQUE TEST RUNS
SEMANTICALLY UNIQUE RUNS
DUPLICATE RUNS
NEAR-DUPLICATE RUNS
```

---

# 9. TEST EXECUTION AUTHENTICITY SCORE

Classificar cada run:

```text
VERIFIED_REAL_EXECUTION
VERIFIED_AUTOMATED_EXECUTION
VALID_SIMULATION
INSUFFICIENT_EVIDENCE
SYNTHETIC_RECORD_ONLY
```

---

# 10. NÃO CONTAR REGISTO SINTÉTICO COMO EXECUÇÃO

Se o registo não comprovar execução:

```text
EXCLUDE_FROM_VERIFIED_TOTAL
```

---

# 11. GERAR RESULTADO DO GATE F1

Mostrar:

```text
Declared Test Runs: 1250

Verified Executed: X

Valid Simulations: X

Insufficient Evidence: X

Synthetic Record Only: X

Duplicates: X
```

---

# 12. CRITÉRIO DE APROVAÇÃO F1

Aprovar apenas se existir evidência suficiente para sustentar:

```text
1,000+ MEANINGFUL EXECUTED TEST RUNS
```

Não exigir artificialmente que todos os 1.250 sejam reais se parte tiver sido corretamente classificada como simulação.

Mas a meta mínima de 1.000 execuções significativas deve permanecer.

---

# 13. AUDITAR EVIDENCE BUNDLES

Para uma amostra estatisticamente relevante e para todos os casos críticos, validar:

```text
EvidenceBundleAETF
```

---

# 14. VALIDAR LIGAÇÃO

Cada Evidence Bundle deverá permitir navegar:

```text
Test Case
→ Test Run
→ Evidence Bundle
→ Result
```

---

# 15. HASH VERIFICATION

Recalcular hashes quando possível.

Comparar:

```text
stored_hash
vs
recalculated_hash
```

Resultado:

```text
MATCH
```

ou:

```text
TAMPER_DETECTED
```

---

# 16. EVIDENCE QUALITY

Revalidar:

```text
WEAK
ACCEPTABLE
STRONG
VERIFIED
```

Não aceitar `VERIFIED` apenas porque o próprio AETF assim classificou.

---

# 17. INDEPENDENT VALIDATION

`VERIFIED` deverá exigir pelo menos uma segunda fonte:

```text
independent deterministic assertion
external system confirmation
target file verification
target database verification
human reviewer
cryptographic validation
```

---

# 18. GATE F2 — 10.000 ASSOCIATIONS VS EXECUTIONS

Abrir:

```text
generated/aetf_phase2a_10000_associations_audit.json
```

Confirmar:

```text
500 Employees
×
20 Evaluation Axes
=
10,000 Associations
```

---

# 19. NÃO CONFUNDIR ASSOCIATION COM EXECUTION

Criar três métricas distintas:

```text
EMPLOYEE_EVALUATION_ASSOCIATIONS

EMPLOYEE_EVALUATION_RUNS_EXECUTED

EMPLOYEE_EVALUATION_RUNS_VERIFIED
```

---

# 20. MAPA DE COBERTURA REAL

Cada associação deve permitir:

```text
EMPLOYEE_ID
↓
EVALUATION_ID
↓
TEST_CASE_ID
↓
TEST_RUN_ID
↓
RESULT
↓
EVIDENCE
```

Quando não houver Test Run:

```text
STATUS = ASSOCIATED_NOT_EXECUTED
```

---

# 21. COBERTURA POR EMPLOYEE

Para cada um dos 500 Employees calcular:

```text
associated_evaluations
executed_evaluations
passed
failed
blocked
verified_evidence
coverage_percentage
```

---

# 22. NÃO DECLARAR TESTADO SEM EXECUÇÃO

Se:

```text
20 Associations
0 Executions
```

o estado deverá ser:

```text
PROFILE_MAPPED
NOT_TESTED
```

---

# 23. META MÍNIMA F2

Todos os 500 Employees devem possuir:

```text
Test Profile
Risk Classification
Evaluation Associations
At Least One Actual Executed Evaluation
Evidence Status
```

---

# 24. COBERTURA DIFERENCIADA POR RISCO

Não aplicar exatamente o mesmo número de testes a todos.

Usar:

```text
LOW
minimum baseline

MEDIUM
expanded baseline

HIGH
deep evaluation

CRITICAL
maximum evaluation
```

---

# 25. HIGH E CRITICAL

Para Employees `HIGH` e `CRITICAL`, exigir múltiplas execuções nos eixos aplicáveis:

```text
technical
regulatory
security
workflow
tool use
HITL
failure handling
```

---

# 26. RESULTADO DO GATE F2

Gerar:

```text
Total Employees: 500

Profiles Mapped: 500

Employees With Evaluations Executed: X

Employees With Verified Evidence: X

Total Associations: 10,000

Actual Evaluation Runs: X

Verified Evaluation Runs: X
```

---

# 27. CRITÉRIO DE APROVAÇÃO F2

Nenhum Employee poderá ser considerado:

```text
TESTED
```

apenas por associação.

Todos devem possuir execução mínima real.

---

# 28. GATE F3 — REAL OFFLINE DEFERRED EXECUTION

Executar um teste end-to-end com dispositivo real sempre que a infraestrutura permitir.

Fluxo obrigatório:

```text
REMOTE COMMAND
↓
CONTROL PLANE
↓
RCODE-500
↓
REAL DEVICE OFFLINE
↓
WAITING_FOR_DEVICE
↓
REAL DEVICE BOOTS
↓
REAL HEARTBEAT
↓
DEVICE AUTHENTICATION
↓
COMMAND RELEASE
↓
LOCAL AGENT
↓
LOCAL ACTION
↓
RESULT VERIFICATION
↓
RECEIPT
```

---

# 29. DISPOSITIVO REAL

Guardar:

```text
device_id
device_os
local_agent_version
device_registration
device_certificate
```

Não expor segredos.

---

# 30. ETAPA OFFLINE

Antes do envio:

```text
DEVICE_STATUS = OFFLINE
```

Enviar o comando.

Confirmar:

```text
COMMAND_STATUS = WAITING_FOR_DEVICE
```

---

# 31. NÃO LIBERTAR ANTES DO HEARTBEAT

Enquanto offline:

```text
NO LOCAL EXECUTION
```

---

# 32. DEVICE BOOT

Ligar o dispositivo.

Capturar:

```text
HEARTBEAT_RECEIVED_AT
```

---

# 33. AUTENTICAÇÃO

Confirmar:

```text
DEVICE_AUTHENTICATED
```

antes de libertar a tarefa.

---

# 34. EXECUTION TRANSITIONS

Esperar sequência:

```text
WAITING_FOR_DEVICE
↓
DISPATCHED_TO_DEVICE
↓
EXECUTING_LOCAL
↓
COMPLETED
```

---

# 35. TARGET EFFECT

Não considerar `COMPLETED` suficiente.

Confirmar:

```text
EXPECTED EFFECT EXISTS
```

---

# 36. FALSE SUCCESS TEST

Executar caso controlado em que o agente reporte sucesso mas o efeito alvo seja removido ou impedido.

Resultado esperado:

```text
VERIFICATION_FAILED
```

e não:

```text
COMPLETED
```

---

# 37. IDEMPOTENCY REVALIDATION

Enviar o mesmo comando:

```text
5 TIMES
```

com:

```text
same idempotency_key
```

---

# 38. RESULTADO DE IDEMPOTÊNCIA

Exigir:

```text
REQUESTS_RECEIVED = 5

BUSINESS_EFFECTS = 1
```

---

# 39. TESTE DE RESTART

Durante tarefa pendente:

```text
restart device
```

ou:

```text
restart local agent
```

Garantir que não ocorra dupla execução.

---

# 40. TESTE DE EXPIRAÇÃO

Criar:

```text
expires_at
```

Deixar comando expirar enquanto dispositivo estiver offline.

Depois ligar.

Resultado:

```text
NOT_EXECUTED
```

---

# 41. TESTE DE CANCELAMENTO

Cancelar o comando ainda em:

```text
WAITING_FOR_DEVICE
```

Ligar o computador.

Resultado:

```text
NOT_EXECUTED
```

---

# 42. TESTE DE DISPOSITIVO NÃO CONFIÁVEL

Simular heartbeat de:

```text
UNREGISTERED_DEVICE
```

Resultado:

```text
REJECTED
```

---

# 43. RESULTADO DO GATE F3

Produzir evidência:

```text
Offline State
Queue State
Heartbeat
Authentication
Dispatch
Execution
Target Verification
Receipt
Idempotency
```

---

# 44. GATE F4 — REAL ENTERPRISE APPLICATION INTEGRATION

Dividir o Gate F4 em:

```text
F4-A Excel Desktop

F4-B PRIMAVERA Staging
```

---

# 45. F4-A — EXCEL DESKTOP REAL

Usar:

```text
REAL WINDOWS DEVICE
REAL EXCEL DESKTOP
TEST WORKBOOK
```

Não usar apenas biblioteca XLSX server-side.

---

# 46. EXCEL TEST FLOW

Executar:

```text
Cloud File
↓
Download
↓
Local Agent
↓
Launch Excel Desktop
↓
Open Workbook
↓
Read Data
↓
Modify Test Range
↓
Recalculate
↓
Save
↓
Close
↓
Verify File
↓
Upload Result
```

---

# 47. EXCEL EVIDENCE

Capturar:

```text
application = Microsoft Excel

real_application = true

workbook_before_hash

workbook_after_hash

changed_range

expected_value

actual_value
```

---

# 48. POWER QUERY TEST

Se o ambiente possuir Power Query configurado:

```text
OPEN
↓
REFRESH
↓
WAIT FOR COMPLETION
↓
VERIFY OUTPUT
↓
SAVE
```

---

# 49. EXCEL FAILURE SCENARIOS

Testar:

```text
FILE_LOCKED

PROTECTED_SHEET

INVALID_PATH

MISSING_SOURCE

POWER_QUERY_FAILURE

EXCEL_CRASH
```

---

# 50. RESULTADO F4-A

Classificar:

```text
REAL_PASS

MOCK_PASS

BLOCKED

NOT_TESTED
```

---

# 51. F4-B — PRIMAVERA STAGING

Utilizar exclusivamente ambiente:

```text
PRIMAVERA STAGING
```

ou:

```text
PRIMAVERA TEST COMPANY
```

---

# 52. PROIBIÇÃO

Não executar alteração destrutiva em empresa produtiva.

---

# 53. TESTE PRIMAVERA BÁSICO

Executar:

```text
CONNECT
↓
AUTHENTICATE
↓
SELECT TEST COMPANY
↓
READ TEST DATA
↓
CREATE REVERSIBLE TEST OPERATION
↓
VERIFY IN PRIMAVERA
↓
ROLLBACK / CANCEL / REMOVE
```

---

# 54. INTEGRAÇÃO COMPLETA

Quando possível:

```text
Cloud File
↓
CLE
↓
RCODE
↓
Local Agent
↓
PRIMAVERA
↓
Business Operation
↓
Independent Verification
↓
Receipt
↓
Cloud Evidence
```

---

# 55. PRIMAVERA EVIDENCE

Guardar:

```text
connector_id
device_id
application_version
test_company
operation_type
source_reference
result_reference
before_state
after_state
receipt_id
```

Sem expor credenciais.

---

# 56. PRIMAVERA FAILURE CASES

Executar:

```text
ERP_CLOSED

LOGIN_FAILURE

WRONG_COMPANY

WRONG_PERIOD

DUPLICATE_DOCUMENT

INVALID_DOCUMENT

PERMISSION_DENIED

DATABASE_UNAVAILABLE
```

---

# 57. DUPLICATE DOCUMENT

Enviar a mesma operação novamente.

Resultado esperado:

```text
DUPLICATE_BLOCKED
```

ou comportamento seguro conforme regra do ERP.

---

# 58. PRIMAVERA TARGET VERIFICATION

Não aceitar apenas:

```text
API returned success
```

Confirmar no ERP:

```text
TARGET_RECORD_EXISTS
```

quando o teste espera criação.

---

# 59. EXTERNAL DEPENDENCY RULE

Se PRIMAVERA real não estiver instalado, licenciado, configurado ou acessível:

não simular `REAL_PASS`.

Usar:

```text
BLOCKED_BY_EXTERNAL_DEPENDENCY
```

---

# 60. BLOQUEIO DOCUMENTADO

Guardar:

```text
dependency_name
reason
required_access
required_environment
required_credentials_or_license
owner
```

Não guardar credenciais secretas.

---

# 61. PHASE 2A COMPLETION E PRIMAVERA

Se a ausência do PRIMAVERA for exclusivamente dependência externa comprovada, distinguir:

```text
CORE_PHASE_2A_COMPLETED

ENTERPRISE_INTEGRATION_PENDING
```

em vez de inventar sucesso.

---

# 62. RED TEAM CONSISTENCY CHECK

O relatório declarou:

```text
287 Red Team Executions
```

e também:

```text
12 / 12 Red Team Security Gate Tests
```

Explicar formalmente a relação.

---

# 63. MÉTRICAS SEPARADAS

Mostrar:

```text
Red Team Orchestration Tests = 12

Red Team Attack Cases Registered = X

Red Team Attack Runs Executed = X
```

---

# 64. AUDITAR OS 287 RUNS

Abrir:

```text
generated/aetf_phase2a_287_redteam_vectors_audit.json
```

Validar se os 287 casos foram realmente executados.

---

# 65. RED TEAM FINDINGS

Gerar:

```text
Attacks Executed
Attacks Blocked
Attacks Successful
Security Findings
Fixed
Retested
Open
```

---

# 66. NÃO ESCONDER VULNERABILIDADES DESCOBERTAS

Se houve falha e depois correção:

mostrar.

Exemplo:

```text
FINDING FOUND
↓
FIXED
↓
RETESTED
↓
PASS
```

Isso é melhor do que apagar a falha histórica.

---

# 67. ZERO UNRESOLVED ≠ ZERO FOUND

Distinguir:

```text
TOTAL FINDINGS FOUND
```

de:

```text
OPEN FINDINGS
```

---

# 68. AUDIT REPORT TERMINOLOGY

Se o ficheiro:

```text
AETF500_Phase2A_External_Audit_Report.md
```

não foi produzido ou validado por auditor externo independente:

renomear.

---

# 69. NOME ADEQUADO

Usar:

```text
AETF500_Phase2A_Audit_Readiness_Report.md
```

ou:

```text
AETF500_Phase2A_Internal_Evidence_Report.md
```

---

# 70. RESERVAR “EXTERNAL AUDIT”

Usar apenas quando houver terceiro independente.

---

# 71. PHYSICAL EVIDENCE MANIFEST

Criar:

```text
AETF500_Phase2A_Evidence_Manifest.json
```

---

# 72. MANIFEST CONTENT

Listar:

```text
artifact_id
artifact_type
file_name
hash
created_at
test_runs_covered
employees_covered
verification_status
```

---

# 73. ARTEFACTOS A INCLUIR

No mínimo:

```text
1250 Test Runs Audit

10000 Associations Audit

287 Red Team Audit

Employee Coverage Report

RCODE Offline Evidence

RCODE Idempotency Evidence

CLE Real Integration Evidence

Excel Desktop Evidence

PRIMAVERA Evidence or Blocking Record

Phase 2A Final Closure Report
```

---

# 74. CROSS-CHECK DE CONSISTÊNCIA

Verificar se números apresentados nos:

```text
JSON
Dashboard
API
Final Report
```

coincidem.

---

# 75. SE HOUVER DIFERENÇA

Criar:

```text
METRIC_MISMATCH
```

e investigar.

---

# 76. NÃO HARDCODEAR DASHBOARD

Garantir que métricas do dashboard vêm dos registos reais.

---

# 77. PROVA

Alterar dataset de teste controlado.

Dashboard deve refletir mudança.

---

# 78. EMPLOYEE SCORECARD RECONCILIATION

Atualizar os 500 Employee Scorecards usando apenas resultados executados.

---

# 79. STATUS POSSÍVEIS

Cada Employee:

```text
PROFILE_ONLY
TESTING
TEST_PASSED
BLOCKED
CERT-L1
PILOT_CANDIDATE
```

conforme evidência.

---

# 80. NÃO PROMOVER TODOS AUTOMATICAMENTE

Não emitir `CERT-L1` apenas porque a campanha global passou.

---

# 81. CERT-L1 INDIVIDUAL

Exigir individualmente:

```text
minimum required evaluations executed
no unresolved critical failure
evidence present
applicable gates passed
```

---

# 82. TEST QUALITY AUDIT

Verificar se os 1.250 testes possuem assertions significativas.

---

# 83. DETETAR ASSERTIONS TRIVIAIS

Rejeitar:

```text
expect(true).toBe(true)
```

ou equivalente.

---

# 84. MUTATION CHECK

Escolher alguns controlos críticos.

Introduzir temporariamente defeitos controlados.

Exemplos:

```text
disable tenant isolation

disable idempotency

disable approval check
```

A bateria deverá detetar as falhas.

---

# 85. RESTAURAR APÓS MUTATION TEST

Nunca deixar mutações ativas.

---

# 86. RESULTADO ESPERADO

Se o teste não detetar a mutação:

```text
TEST QUALITY FAILURE
```

---

# 87. FINAL CLOSURE REPORT

Gerar:

# AETF-500 Phase 2A Final Closure & Evidence Validation Report

---

# 88. SEÇÃO 1 — EXECUTIVE SUMMARY

Mostrar:

```text
Declared
Verified
Rejected
Blocked
```

---

# 89. SEÇÃO 2 — TEST RUN AUTHENTICITY

Mostrar:

```text
Declared Test Runs
Verified Test Runs
Valid Simulations
Insufficient Evidence
Duplicates
```

---

# 90. SEÇÃO 3 — EMPLOYEE EVALUATIONS

Mostrar:

```text
Associations
Actual Runs
Verified Runs
Employees Covered
Employees Without Actual Evaluation
```

---

# 91. SEÇÃO 4 — RED TEAM

Mostrar:

```text
Registered
Executed
Blocked
Successful Attacks
Findings
Fixed
Open
Retested
```

---

# 92. SEÇÃO 5 — RCODE

Mostrar:

```text
Offline Device Test
Heartbeat
Deferred Execution
Idempotency
Cancellation
Expiration
Device Trust
```

---

# 93. SEÇÃO 6 — CLE

Mostrar:

```text
Cloud Connector
Local Agent
Hybrid Execution
Cloud Return
```

---

# 94. SEÇÃO 7 — EXCEL DESKTOP

Mostrar:

```text
REAL_PASS
MOCK_PASS
BLOCKED
NOT_TESTED
```

---

# 95. SEÇÃO 8 — PRIMAVERA

Mostrar:

```text
REAL_PASS
MOCK_PASS
BLOCKED_BY_EXTERNAL_DEPENDENCY
NOT_TESTED
```

---

# 96. SEÇÃO 9 — EVIDENCE INTEGRITY

Mostrar:

```text
Evidence Bundles
Verified Bundles
Hash Validation
Tamper Findings
```

---

# 97. SEÇÃO 10 — OPEN GAPS

Listar explicitamente:

```text
WHAT IS STILL NOT PROVEN
```

---

# 98. DECISÃO FINAL

Apenas três resultados possíveis:

```text
COMPLETED — GO TO PHASE 2B
```

```text
CONDITIONALLY COMPLETED — LIMITED GO
```

```text
NOT COMPLETED — NO-GO
```

---

# 99. COMPLETED — GO

Usar apenas se os quatro gates finais estiverem aprovados.

---

# 100. CONDITIONAL GO

Usar apenas quando o único bloqueio restante for dependência externa claramente documentada e não um defeito da plataforma.

---

# 101. NO-GO

Usar se existir:

```text
insufficient execution evidence

tenant isolation failure

idempotency failure

offline execution failure

critical security finding

evidence integrity failure

material metric fabrication

critical evaluation coverage gap
```

---

# 102. CHECKLIST FINAL

Emitir:

```text
AETF-500 PHASE 2A FINAL CLOSURE

[ ] 1,000+ verified meaningful Test Runs
[ ] 500/500 Employees with executed evaluation coverage
[ ] 10,000 associations reconciled
[ ] 250+ Red Team attack runs verified
[ ] Multi-Tenant isolation verified
[ ] RCODE offline real-device flow verified
[ ] RCODE idempotency verified
[ ] CLE real hybrid execution verified
[ ] Excel Desktop real integration verified
[ ] PRIMAVERA staging verified OR externally blocked
[ ] Evidence Bundle integrity validated
[ ] Metric reconciliation completed
[ ] Mutation tests confirm test quality
[ ] No unresolved blocking critical findings
```

---

# 103. PROIBIÇÕES

Não:

```text
inventar Test Runs

gerar resultados sem execução

marcar mock como real

marcar association como execution

marcar generated JSON como independent evidence

marcar SHA256 como digital signature

declarar external audit sem auditor externo

ignorar failures para preservar 100% PASS
```

---

# 104. PRINCÍPIO DE ENCERRAMENTO

Aplicar:

```text
THE PURPOSE OF THIS FINAL STEP
IS NOT TO CREATE MORE CLAIMS.

IT IS TO VERIFY THE CLAIMS
ALREADY MADE.
```

---

# 105. COMANDO FINAL

Inicie imediatamente a auditoria e execução dos quatro Final Closure Gates.

Primeiro valide a autenticidade dos 1.250 Test Runs.

Depois reconcilie as 10.000 Employee-Evaluation Associations com execuções reais.

Depois execute e documente o fluxo real:

```text
PC OFFLINE
→ COMMAND QUEUED
→ PC ONLINE
→ HEARTBEAT
→ LOCAL EXECUTION
→ VERIFIED EFFECT
→ RECEIPT
```

Depois execute:

```text
Cloud
→ Real Windows Device
→ Excel Desktop
→ Cloud
```

e:

```text
Cloud
→ RCODE
→ Local Agent
→ PRIMAVERA Staging
→ Verified Result
→ Receipt
```

quando o ambiente PRIMAVERA estiver realmente disponível.

Se uma dependência externa impedir a execução, registe:

```text
BLOCKED_BY_EXTERNAL_DEPENDENCY
```

e nunca substitua por `PASS`.

Ao final, emita uma única decisão:

```text
GO TO PHASE 2B
```

ou:

```text
CONDITIONAL GO
```

ou:

```text
NO-GO
```

sustentada exclusivamente por evidência verificável.