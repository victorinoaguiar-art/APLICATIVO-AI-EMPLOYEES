# PROMPT DE IMPLEMENTAÇÃO
## EXECUTION MODE CONTROL, MOCK / REAL API VISIBILITY & RUNTIME EVIDENCE GATE
### AETF-500 — Separação Estrita entre Simulação e Execução Real

---

# 0. OBJECTIVO

Implementar na plataforma AETF-500 uma separação inequívoca, visível e auditável entre:

```text
EXECUTION_MODE = MOCK
```

e:

```text
EXECUTION_MODE = REAL_API
```

O objectivo é impedir que simulações, fixtures, respostas hardcoded, testes locais ou dados artificiais sejam confundidos com:

- chamadas reais à OpenAI;
- chamadas reais à Gemini;
- chamadas reais à Claude;
- execução real de tools;
- criação real de ficheiros;
- operações reais em conectores;
- resultados reais em produção;
- provas reais de capacidade dos AI Employees.

A plataforma deve mostrar o modo de execução em todos os pontos relevantes, tanto na interface como no backend, nos logs, nos receipts, nos testes, nos relatórios e na auditoria.

---

# 1. PRINCÍPIO FUNDAMENTAL

Adoptar a regra:

```text
MOCK ≠ REAL EXECUTION
```

e:

```text
TEST PASS ≠ REAL API PROOF
```

Nenhuma tarefa pode ser apresentada como execução real apenas porque:

```text
status = COMPLETED
```

ou:

```text
status = PASS
```

ou:

```text
employee_status = ACTIVE
```

A plataforma deve sempre indicar explicitamente:

```text
execution_mode
```

---

# 2. ESTADOS OFICIAIS

Implementar pelo menos:

```text
EXECUTION_MODE = MOCK
```

e:

```text
EXECUTION_MODE = REAL_API
```

Opcionalmente, se necessário para clareza operacional, suportar também:

```text
EXECUTION_MODE = LOCAL_TEST
EXECUTION_MODE = REPLAY
EXECUTION_MODE = SANDBOX_API
```

Mas apenas dois modos podem ser tratados como categorias principais na UI:

```text
MOCK
REAL_API
```

---

# 3. REGRA DE PRODUÇÃO

Em produção:

```text
MOCK_EXECUTION_ALLOWED = false
```

por defeito.

Se mock for activado excepcionalmente:

```text
ENVIRONMENT = TEST / DEVELOPMENT
```

e a UI deve mostrar de forma evidente:

```text
SIMULAÇÃO
```

Nunca mostrar:

```text
REAL
```

---

# 4. EXECUTION RECORD

Adicionar ao registo de execução:

```text
execution_mode
```

Campos mínimos:

```text
execution_id
task_id
employee_instance_id
company_id
tenant_id

execution_mode

provider
model_id
model_version

provider_request_id

mock_source
mock_fixture_id

started_at
completed_at
latency_ms

input_tokens
cached_input_tokens
output_tokens

tools_requested
tools_executed

status
error

created_at
```

---

# 5. REGRAS PARA `MOCK`

Se:

```text
execution_mode = MOCK
```

então:

```text
provider_request_id = null
```

ou equivalente.

Não permitir preencher artificialmente:

```text
provider_request_id
```

com dados falsos.

Também não permitir atribuir:

```text
REAL_API_VERIFIED = true
```

---

# 6. REGRAS PARA `REAL_API`

Só permitir:

```text
execution_mode = REAL_API
```

quando existir evidência material de chamada real ao provedor.

Exigir, quando disponível:

```text
provider
model_id
provider_request_id
provider_response_metadata
usage_metadata
latency_ms
timestamps
```

Se o provedor não fornecer determinado identificador, guardar a melhor evidência técnica disponível e marcar:

```text
provider_request_id_available = false
```

Nunca inventar o identificador.

---

# 7. REAL API EVIDENCE GATE

Criar:

```text
REAL_API_EVIDENCE_GATE
```

Apenas permitir:

```text
REAL_API_VERIFIED = true
```

se as seguintes condições forem satisfeitas:

```text
execution_mode = REAL_API
provider != null
model_id != null
started_at != null
completed_at != null
provider_response_received = true
usage_or_provider_metadata_present = true
```

e, quando suportado pelo provedor:

```text
provider_request_id != null
```

---

# 8. FAIL CLOSED

Se a evidência for insuficiente:

```text
REAL_API_VERIFIED = false
```

e:

```text
verification_status = INSUFFICIENT_EVIDENCE
```

Não promover automaticamente para `REAL_API`.

---

# 9. MODEL PROVIDERS

Aplicar a mesma política a:

```text
OPENAI
GEMINI
CLAUDE
```

Não criar regras mais fracas para nenhum provedor.

---

# 10. PROVIDER ADAPTER CONTRACT

Cada adapter deve devolver uma estrutura normalizada:

```text
provider
model_id
provider_request_id
provider_response_received
usage
latency
raw_metadata
execution_mode
```

---

# 11. OPENAI ADAPTER

Ao executar chamada real:

```text
execution_mode = REAL_API
```

Guardar:

```text
model_id
request/response metadata
usage metadata
provider request identifier, se disponível
```

---

# 12. GEMINI ADAPTER

Aplicar exactamente a mesma regra.

---

# 13. CLAUDE ADAPTER

Aplicar exactamente a mesma regra.

---

# 14. MOCK PROVIDER

Criar explicitamente, se necessário:

```text
MockProviderAdapter
```

Este adapter deve devolver obrigatoriamente:

```text
execution_mode = MOCK
```

Nunca permitir que o Mock Provider seja identificado como OpenAI, Gemini ou Claude real.

---

# 15. MOCK SOURCE

Para mocks, guardar:

```text
mock_source
```

Valores possíveis:

```text
HARDCODED
FIXTURE
LOCAL_GENERATOR
RECORDED_RESPONSE
TEST_FACTORY
```

---

# 16. MOCK FIXTURE ID

Guardar:

```text
mock_fixture_id
```

quando aplicável.

Exemplo:

```text
FIXTURE-BUSINESS-WRITING-001
```

---

# 17. UI — BADGE VISÍVEL

Em cada execução mostrar badge visível:

Para mock:

```text
MOCK
```

Para real:

```text
REAL API
```

---

# 18. UI — COR E ESTILO

Utilizar estados visualmente distintos.

Exemplo conceptual:

```text
MOCK
→ badge de aviso / simulação

REAL API
→ badge de execução real
```

Não depender apenas da cor.

Mostrar também texto explícito.

---

# 19. UI — TASK DETAILS

Dentro da tarefa mostrar:

```text
Execution Mode:
REAL API
```

ou:

```text
Execution Mode:
MOCK
```

---

# 20. UI — EMPLOYEE RUNTIME

Dentro do Employee mostrar:

```text
Last Execution Mode:
REAL API
```

ou:

```text
Last Execution Mode:
MOCK
```

---

# 21. UI — EXECUTION HISTORY

Na tabela de execuções adicionar coluna:

```text
Mode
```

Exemplo:

| Execution | Task | Employee | Provider | Model | Mode | Status |
|---|---|---|---|---|---|---|
| EX-001 | TASK-01 | AEI-001 | OpenAI | X | REAL API | COMPLETED |
| EX-002 | TASK-02 | AEI-001 | Mock | Fixture | MOCK | COMPLETED |

---

# 22. UI — FILTER

Adicionar filtros:

```text
ALL
REAL API
MOCK
```

---

# 23. UI — DASHBOARD

Mostrar indicadores:

```text
Real API Executions
Mock Executions
Real API Success Rate
Mock Test Success Rate
```

Nunca somar mocks ao mesmo indicador operacional de produção.

---

# 24. MÉTRICAS SEPARADAS

Criar métricas distintas:

```text
real_api_task_count
mock_task_count

real_api_success_rate
mock_success_rate

real_api_cost
mock_cost

real_api_token_usage
mock_token_usage
```

---

# 25. CUSTOS

Para mock:

```text
api_cost = 0
```

excepto se o mock utilizar alguma infraestrutura paga real.

Não registar custo artificial de tokens como custo real.

---

# 26. TOKENS

Se mock simular tokens:

```text
simulated_input_tokens
simulated_output_tokens
```

Não usar:

```text
input_tokens
output_tokens
```

como se fossem consumo real.

---

# 27. REAL USAGE

Para `REAL_API`:

```text
input_tokens
cached_input_tokens
output_tokens
```

devem vir da resposta do provedor ou de método técnico equivalente.

---

# 28. RELATÓRIOS

Todo relatório de testes deve indicar:

```text
Execution Mode
```

Exemplo:

```text
TEST-01
Mode: MOCK
Result: PASS
```

ou:

```text
TEST-01
Mode: REAL_API
Result: PASS
```

---

# 29. PROIBIÇÃO DE CONFUSÃO EM RELATÓRIOS

Não permitir linguagem como:

```text
"Real execution validated"
```

quando:

```text
execution_mode = MOCK
```

---

# 30. MNCA-500

Integrar com MNCA-500.

Um score de capacidade nativa só pode ser classificado como:

```text
MODEL_NATIVE_PROVEN
```

se os testes tiverem:

```text
execution_mode = REAL_API
```

contra o modelo real configurado.

---

# 31. TESTES MOCK DO MNCA

Se os testes forem mocks:

```text
MNCA_RESULT = LOGIC_TEST_ONLY
```

e não:

```text
MODEL_CAPABILITY_PROVEN
```

---

# 32. CERTIFICAÇÃO

Não permitir certificação operacional baseada exclusivamente em mocks.

Regra:

```text
MOCK_PASS
≠
REAL_CERTIFICATION
```

---

# 33. READINESS

Pode existir:

```text
READY_FOR_REAL_TEST
```

com base em mocks.

Mas:

```text
CERTIFIED
```

deve exigir evidência real conforme a política.

---

# 34. TOOL EXECUTION MODE

Cada tool call deve registar:

```text
tool_execution_mode
```

Valores:

```text
MOCK
REAL
```

---

# 35. EXEMPLO TOOL MOCK

```text
Google Drive mock upload
```

deve mostrar:

```text
tool_execution_mode = MOCK
```

---

# 36. EXEMPLO TOOL REAL

Se ficheiro foi realmente criado no Google Drive:

```text
tool_execution_mode = REAL
```

e guardar identificador real do recurso quando disponível.

---

# 37. OUTPUT MODE

Cada output deve indicar:

```text
output_execution_mode
```

Exemplo:

```text
MOCK_OUTPUT
REAL_OUTPUT
```

---

# 38. DOCUMENT GENERATION

Se um DOCX/PDF foi realmente criado:

```text
output_execution_mode = REAL_OUTPUT
```

Mesmo que o conteúdo tenha vindo de mock, manter ambas as dimensões:

```text
model_execution_mode = MOCK
output_execution_mode = REAL_OUTPUT
```

---

# 39. IMPORTANTE — NÃO CONFUNDIR DIMENSÕES

Uma tarefa pode ter:

```text
Model = MOCK
Tool = REAL
```

ou:

```text
Model = REAL_API
Tool = MOCK
```

Por isso, registar separadamente:

```text
model_execution_mode
tool_execution_mode
output_execution_mode
```

e também um:

```text
overall_execution_mode
```

---

# 40. OVERALL EXECUTION MODE

Regra:

```text
overall_execution_mode = REAL_API
```

só se a execução cognitiva principal for real.

Se houver qualquer componente crítico mockado, mostrar:

```text
REAL_API_WITH_MOCK_COMPONENTS
```

ou bloquear a certificação real.

---

# 41. AMBIENTE

Guardar:

```text
environment
```

Valores:

```text
DEVELOPMENT
TEST
STAGING
PRODUCTION
```

---

# 42. PRODUÇÃO

Em produção, se:

```text
execution_mode = MOCK
```

gerar:

```text
PRODUCTION_MOCK_ALERT
```

---

# 43. ADMIN CONFIGURATION

Criar setting:

```text
allow_mock_execution
```

Por defeito:

```text
development = true
test = true
staging = policy-defined
production = false
```

---

# 44. FEATURE FLAG

Se usar feature flags:

```text
ENABLE_MOCK_PROVIDER
```

---

# 45. SEGURANÇA

Nunca permitir que utilizador normal altere uma execução já concluída de:

```text
MOCK
```

para:

```text
REAL_API
```

---

# 46. IMUTABILIDADE

Após conclusão:

```text
execution_mode
```

deve ser imutável.

---

# 47. AUDIT TRAIL

Qualquer tentativa administrativa de reclassificação deve gerar:

```text
AUDIT_EVENT
```

e nunca apagar o estado original.

---

# 48. RAW RUNTIME RECEIPT

Adicionar:

```text
execution_mode
```

ao receipt.

Exemplo:

```json
{
  "execution_id": "EXEC-001",
  "task_id": "TASK-001",
  "execution_mode": "REAL_API",
  "provider": "OPENAI",
  "model_id": "...",
  "provider_request_id": "...",
  "provider_response_received": true,
  "status": "COMPLETED"
}
```

---

# 49. MOCK RECEIPT

Exemplo:

```json
{
  "execution_id": "EXEC-002",
  "task_id": "TASK-002",
  "execution_mode": "MOCK",
  "provider": "MOCK",
  "mock_fixture_id": "FIXTURE-001",
  "provider_request_id": null,
  "status": "COMPLETED"
}
```

---

# 50. EVIDENCE VIEW

Criar botão:

```text
[ Ver Evidência de Execução ]
```

Mostrar:

```text
Mode
Provider
Model
Request ID
Usage
Latency
Tools
Outputs
Audit
```

---

# 51. EVIDENCE BADGE

Se real e verificado:

```text
REAL API VERIFIED
```

Se real mas evidência insuficiente:

```text
REAL API — UNVERIFIED
```

Se mock:

```text
MOCK / SIMULATION
```

---

# 52. STATUS POSSÍVEIS

Criar:

```text
REAL_API_VERIFIED
REAL_API_UNVERIFIED
MOCK_VERIFIED
MOCK_UNVERIFIED
```

---

# 53. NÃO AUTO-VERIFICAR

`REAL_API` não significa automaticamente:

```text
REAL_API_VERIFIED
```

Passar pelo Evidence Gate.

---

# 54. TESTES OBRIGATÓRIOS

## TEST-01 — Mock explícito

Esperado:

```text
execution_mode = MOCK
```

---

## TEST-02 — Mock não pode ter prova real

Esperado:

```text
REAL_API_VERIFIED = false
```

---

## TEST-03 — OpenAI real

Esperado:

```text
execution_mode = REAL_API
```

com evidência técnica real.

---

## TEST-04 — Gemini real

Esperado:

```text
execution_mode = REAL_API
```

---

## TEST-05 — Claude real

Esperado:

```text
execution_mode = REAL_API
```

---

## TEST-06 — Provider request ID falso

Esperado:

```text
REJECTED
```

ou:

```text
INSUFFICIENT_EVIDENCE
```

---

## TEST-07 — Mock em produção

Esperado:

```text
BLOCKED_PRODUCTION_MOCK
```

ou alerta explícito conforme política.

---

## TEST-08 — Dashboard

Verificar que mocks e reais aparecem separados.

---

## TEST-09 — Métricas

Verificar que mocks não entram nas métricas de produção.

---

## TEST-10 — Certificação

Mock PASS não pode gerar:

```text
CERTIFIED_REAL
```

---

# 55. MIGRAÇÃO DOS REGISTOS EXISTENTES

Auditar execuções históricas.

Para cada registo existente sem prova:

```text
execution_mode = UNKNOWN
```

Não assumir:

```text
REAL_API
```

---

# 56. UNKNOWN MODE

Adicionar temporariamente:

```text
EXECUTION_MODE = UNKNOWN
```

para dados legados.

Esses dados devem ser classificados depois.

---

# 57. LEGACY AUDIT

Criar:

```text
EXECUTION_MODE_LEGACY_AUDIT
```

com:

```text
execution_id
existing_status
evidence_found
recommended_mode
confidence
action
```

---

# 58. NÃO REESCREVER HISTÓRICO

Se não houver evidência:

```text
UNKNOWN
```

Não converter para real apenas com base em relatórios antigos.

---

# 59. DASHBOARD DE AUDITORIA

Criar:

# Execution Mode Audit

Indicadores:

```text
REAL API Verified
REAL API Unverified
MOCK
UNKNOWN
Production Mock Incidents
```

---

# 60. FILTRO POR EMPLOYEE

Permitir ver:

```text
Employee
→ Real Executions
→ Mock Executions
→ Unknown Executions
```

---

# 61. FILTRO POR EMPRESA

Permitir:

```text
Company
→ Real Executions
→ Mock Executions
```

---

# 62. FILTRO POR PROVIDER

Permitir:

```text
OpenAI
Gemini
Claude
Mock
```

---

# 63. FILTRO POR MODEL

Mostrar consumo real por modelo.

---

# 64. CUSTO REAL VS ESTIMADO

Separar:

```text
REAL_COST
```

de:

```text
ESTIMATED_COST
```

---

# 65. MOCK COST

Nunca somar custo estimado de mock ao custo real da empresa.

---

# 66. BILLING

Billing do cliente deve considerar apenas:

```text
billable_execution = true
```

segundo a política comercial.

Mocks não devem ser facturados como chamadas reais.

---

# 67. SLA

Mocks não contam para:

```text
production uptime
production latency
production success rate
```

---

# 68. QA

Mocks podem contar para:

```text
test coverage
logic coverage
UI coverage
```

---

# 69. DEVTOOLS

No ambiente de desenvolvimento, permitir escolher:

```text
Run as Mock
Run as Real API
```

---

# 70. PRODUÇÃO

No ambiente de produção, ocultar:

```text
Run as Mock
```

para utilizadores normais.

---

# 71. CONFIRMAÇÃO DE EXECUÇÃO REAL

Antes de executar em `REAL_API`, mostrar quando necessário:

```text
This execution may incur API cost.
```

Sem impedir automações autorizadas.

---

# 72. RUNTIME HEALTH

Mostrar:

```text
Provider Connection:
CONNECTED / DISCONNECTED

Last Real API Call:
timestamp

Last Mock Execution:
timestamp
```

---

# 73. EMPLOYEE OPERATIONAL STATUS

Não marcar:

```text
EMPLOYEE_LIVE = true
```

apenas com mocks.

Exigir pelo menos uma política definida de prova real.

---

# 74. PILOT READINESS

Criar:

```text
READY_FOR_REAL_API_PILOT
```

quando Employee passa testes de lógica/mock mas ainda não foi validado com API real.

---

# 75. REAL PILOT STATUS

Após execução real:

```text
REAL_API_PILOT_PASSED
```

---

# 76. FULL OPERATIONAL STATUS

Após cumprir os critérios:

```text
OPERATIONAL_REAL
```

---

# 77. REGRA FINAL

Adoptar formalmente:

```text
MOCK
=
SIMULATION
```

e:

```text
REAL_API
=
REAL MODEL PROVIDER EXECUTION
```

Nunca tratar ambos como equivalentes.

---

# 78. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser considerada concluída quando:

```text
✓ todos os execution records possuem execution_mode
✓ UI mostra MOCK ou REAL API de forma explícita
✓ mocks não são contados como execuções reais
✓ mocks não certificam capacidade real
✓ REAL_API exige evidence gate
✓ OpenAI, Gemini e Claude seguem a mesma regra
✓ custos reais e simulados estão separados
✓ tokens reais e simulados estão separados
✓ receipts incluem execution_mode
✓ production bloqueia mock por defeito
✓ legacy executions sem prova ficam UNKNOWN
✓ dashboards separam MOCK / REAL / UNKNOWN
✓ tool calls também registam real vs mock
✓ outputs também registam real vs mock
✓ auditoria preserva estado original
```

---

# 79. RESULTADO ESPERADO

A partir desta implementação, qualquer pessoa que veja uma tarefa, teste ou Employee deve conseguir responder imediatamente:

> Esta execução foi simulada ou realmente chamou uma API?

A resposta deve estar visível:

```text
EXECUTION_MODE = MOCK
```

ou:

```text
EXECUTION_MODE = REAL_API
```

sem depender de interpretação, confiança num relatório ou leitura do código.

---

# 80. OBJECTIVO FINAL

Eliminar definitivamente a possibilidade de uma simulação ser confundida com uma execução real.

A plataforma deve tornar **proveniência de execução** uma propriedade estrutural, auditável e imutável de cada tarefa.

```text
NO HIDDEN MOCKS
NO FALSE REAL EXECUTIONS
NO CERTIFICATION WITHOUT EVIDENCE
```
