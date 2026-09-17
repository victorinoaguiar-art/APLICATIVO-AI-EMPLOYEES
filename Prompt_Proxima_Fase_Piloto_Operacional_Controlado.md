# Prompt — Próxima fase: piloto operacional controlado e prova de funcionamento real

## Repositório

Trabalhar exclusivamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

## Ponto de partida confirmado

- Branch: `master`.
- Baseline técnica auditada: `e3db8ab691605f8f851b16fb4834883078d20878`.
- CI principal, verificação remota e atestação final concluídas com `success` no mesmo SHA.
- Cadeia de evidências forenses encerrada.
- `npm ci`, `npm audit --omit=dev` e `npm run verify`: exit code `0`.
- 516 testes aprovados, zero falhas, testes ignorados ou cancelados.
- Classificação técnica: `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`.
- Estado operacional actual: `PRE-PRODUCTION / L2 HARDENED`.
- Os 500 AI Employees continuam prioritários. O piloto em pequena escala não altera esta decisão nem cria uma classe secundária de Employees.

## Decisão de fase

Encerrar o ciclo de micro-patches de evidência. A próxima fase não deve criar outro motor, marketplace, catálogo ou arquitectura transversal.

Executar uma fase de:

# **Piloto Operacional Controlado, Runtime Proof & First Real Work Validation**

O objectivo é responder com provas físicas à pergunta:

> O aplicativo consegue receber um pedido real autorizado, encaminhá-lo ao AI Employee correcto, executar o trabalho com dados reais controlados, produzir um resultado útil, obter revisão humana, corrigir erros, preservar evidências e entregar o resultado ao utilizador?

---

## 1. Limitar rigorosamente o piloto

### Âmbito inicial

Executar o piloto com:

- uma organização interna ou cliente-piloto formalmente autorizado;
- um único tenant;
- cinco AI Employees seleccionados do catálogo canónico;
- entre 25 e 50 tarefas reais autorizadas;
- dados reais minimizados e controlados;
- revisão humana obrigatória antes de qualquer entrega externa;
- nenhum envio fiscal, pagamento, publicação ou alteração em sistema externo sem aprovação humana explícita.

### Selecção dos cinco Employees

Escolher cinco Employees que representem fluxos úteis e de risco controlável, preferencialmente:

1. organização e classificação documental;
2. elaboração de carta ou documento administrativo;
3. análise de Excel ou mapa financeiro;
4. controlo de cobranças e preparação de aviso;
5. elaboração de relatório de gestão.

Não criar novos Employees. Usar IDs e `role_key` já existentes no catálogo de 500.

Antes da execução, produzir uma matriz com:

| Campo | Conteúdo obrigatório |
|---|---|
| Employee ID | ID canónico |
| Role key | Chave canónica |
| Missão no piloto | Trabalho exacto |
| Entradas autorizadas | Tipos de ficheiro e campos |
| Saídas esperadas | DOCX, PDF, XLSX ou relatório |
| Ferramentas permitidas | Lista explícita |
| Acções proibidas | Lista explícita |
| Risco | Baixo, médio, alto ou crítico |
| Aprovação humana | Momento e responsável |
| Critérios de sucesso | Métricas verificáveis |

---

## 2. Criar o registo formal do piloto

Criar um objecto persistente `PilotProgram` ou reutilizar a estrutura física existente, sem duplicar motores.

Campos mínimos:

```text
pilot_id
tenant_id
organization_name
authorization_reference
authorized_by
authorized_at
start_at
end_at
selected_employee_ids
allowed_data_categories
prohibited_data_categories
allowed_connectors
prohibited_actions
human_reviewers
task_limit
status
created_at
updated_at
```

Estados permitidos:

```text
DRAFT
AUTHORIZED
ACTIVE
PAUSED
COMPLETED
FAILED
CANCELLED
```

Regras:

- nenhum piloto pode ficar `ACTIVE` sem autorização física;
- tenant, utilizadores, Employees e conectores devem ser previamente associados;
- ultrapassar o prazo ou o limite de tarefas deve bloquear novas execuções;
- suspensão ou cancelamento deve interromper filas pendentes;
- o piloto não pode alterar o estado global dos restantes Employees.

---

## 3. Executar tarefas reais de ponta a ponta

Cada tarefa deve percorrer fisicamente:

```text
Pedido autorizado
        ↓
Autenticação e identificação do tenant
        ↓
Normalização do pedido
        ↓
Selecção do AI Employee
        ↓
Snapshot dos dados de entrada
        ↓
Verificação de permissões e risco
        ↓
Execução real
        ↓
Produção do resultado
        ↓
Revisão humana
        ↓
Correcção ou aprovação
        ↓
Entrega controlada
        ↓
Recibo e evidência imutável
```

Não aceitar tarefas marcadas como reais quando forem mocks, fixtures, exemplos ou testes unitários.

### Recibo mínimo por tarefa

```json
{
  "task_id": "<id único>",
  "pilot_id": "<piloto>",
  "tenant_id": "<tenant>",
  "employee_id": "<employee>",
  "requested_by": "<utilizador>",
  "received_at": "<data UTC>",
  "input_snapshot_sha256": "<hash>",
  "execution_started_at": "<data UTC>",
  "execution_completed_at": "<data UTC>",
  "output_files": [],
  "output_hashes": [],
  "human_review_status": "<estado>",
  "reviewed_by": "<revisor>",
  "reviewed_at": "<data UTC>",
  "corrections_required": 0,
  "delivery_status": "<estado>",
  "final_status": "<estado>",
  "error_code": null
}
```

Todos os hashes devem ser calculados a partir dos bytes físicos.

---

## 4. Usar dados reais com controlo de privacidade

Antes de cada tarefa:

- confirmar a autorização da organização;
- minimizar os dados utilizados;
- classificar dados pessoais, fiscais, financeiros e laborais;
- impedir mistura entre tenants;
- bloquear segredos em logs;
- impedir utilização dos dados do piloto para treino não autorizado;
- aplicar política de retenção e eliminação;
- guardar apenas referências seguras quando o conteúdo não puder ser preservado.

Não versionar dados de clientes no GitHub.

Não incluir nomes, NIF, contactos, salários, contas bancárias ou documentos reais nos artefactos públicos da CI.

Criar evidências sanitizadas que preservem hashes, estados, tempos, tipos e resultados sem expor conteúdo confidencial.

---

## 5. Tornar a revisão humana efectiva

Implementar ou ligar o fluxo existente de revisão humana com os estados:

```text
PENDING_REVIEW
APPROVED
APPROVED_WITH_CORRECTIONS
REJECTED
BLOCKED
```

O revisor deve poder:

- abrir a entrada autorizada;
- visualizar o resultado produzido;
- verificar o Employee executor;
- consultar fontes e decisões utilizadas;
- registar erros objectivos;
- pedir correcção;
- aprovar ou rejeitar;
- impedir entrega;
- deixar comentário auditável.

Resultados de risco alto ou crítico nunca podem ser entregues automaticamente.

---

## 6. Validar documentos produzidos

Para cada DOCX, PDF ou XLSX produzido:

- confirmar que o ficheiro abre;
- verificar estrutura e conteúdo obrigatório;
- validar datas, valores monetários e casas decimais;
- impedir placeholders residuais como `yyyy`, `[NOME]`, `N/A` indevido ou texto de template;
- confirmar identidade visual quando aplicável;
- comparar o conteúdo com o pedido original;
- calcular SHA-256 do resultado físico;
- renderizar para verificação visual quando o formato exigir;
- registar aprovação ou rejeição humana.

Adicionar testes específicos para os defeitos já observados em períodos de cobrança e datas apresentadas como `yyyy`.

---

## 7. Medir funcionamento real, sem métricas inventadas

Calcular exclusivamente a partir dos registos físicos do piloto:

```text
total_tasks_received
total_tasks_completed
total_tasks_approved_first_review
total_tasks_corrected
total_tasks_rejected
total_tasks_failed
completion_rate
first_pass_acceptance_rate
human_correction_rate
median_execution_time
p95_execution_time
median_review_time
delivery_success_rate
cross_tenant_incidents
privacy_incidents
unauthorized_action_attempts
duplicate_business_effects
```

Não utilizar contagens hard-coded.

Separar claramente:

- tarefas reais;
- testes automatizados;
- simulações;
- tarefas demonstrativas;
- tarefas canceladas.

Não declarar receita real, cliente pago, MRR, margem, renovação ou retenção sem recibos comerciais físicos correspondentes.

---

## 8. Definir gates do piloto

### Gates obrigatórios

| Gate | Condição mínima |
|---|---|
| Autorização | 100% das tarefas ligadas a autorização válida |
| Tenant isolation | Zero acesso cruzado |
| Privacidade | Zero exposição de dados em Git ou logs públicos |
| Execução | Pelo menos 25 tarefas reais concluídas |
| Qualidade | Pelo menos 80% aprovadas na primeira revisão |
| Correcção | 100% dos erros materiais corrigidos antes da entrega |
| Entrega | Pelo menos 95% de entregas técnicas bem-sucedidas |
| Idempotência | Zero efeitos duplicados |
| Acções proibidas | Zero execução não autorizada |
| Evidência | 100% das tarefas com recibo e hashes físicos |

Os limites de qualidade são metas iniciais do piloto, não prova automática de prontidão para produção.

### Bloqueadores imediatos

Pausar automaticamente o piloto se ocorrer:

- fuga de dados;
- acesso entre tenants;
- acção financeira não autorizada;
- submissão fiscal não autorizada;
- envio externo sem aprovação;
- perda de rastreabilidade;
- adulteração de recibos;
- repetição de efeito comercial;
- falha grave de autenticação;
- documento materialmente incorrecto entregue ao utilizador.

---

## 9. Testes obrigatórios

Adicionar testes para:

1. piloto sem autorização não inicia;
2. tenant divergente é bloqueado;
3. Employee fora da lista do piloto é bloqueado;
4. limite de tarefas é respeitado;
5. piloto expirado ou pausado não executa;
6. entrada sem snapshot físico falha;
7. alteração da entrada depois do snapshot é detectada;
8. saída sem hash físico não pode ser entregue;
9. entrega antes da revisão humana é bloqueada;
10. rejeição humana impede entrega;
11. correcção cria nova versão sem apagar a anterior;
12. idempotency key impede efeito duplicado;
13. dados confidenciais não aparecem nos logs;
14. documentos com `yyyy` ou placeholders residuais são rejeitados;
15. ficheiros DOCX, PDF e XLSX inválidos são rejeitados;
16. métricas são derivadas apenas das tarefas físicas;
17. simulações não entram nas métricas reais;
18. cancelamento interrompe tarefas pendentes;
19. tentativa de acção proibida pausa ou bloqueia a tarefa;
20. recibo adulterado falha na verificação de hashes.

---

## 10. Evidências e relatório do piloto

Gerar evidências fora do repositório, por exemplo:

```text
.artifacts/pilot/<pilot_id>/
```

Estrutura mínima:

```text
pilot-authorization-receipt.json
pilot-configuration.json
selected-employees.json
task-receipts/
review-receipts/
delivery-receipts/
pilot-metrics.json
pilot-incidents.json
pilot-evidence-files.sha256
pilot-final-attestation.json
```

O relatório deve distinguir:

- o que foi realmente executado;
- o que foi aprovado por humanos;
- o que falhou;
- o que foi corrigido;
- o que continua não implementado;
- que conectores foram reais, sandbox, read-only ou indisponíveis;
- que limitações impedem produção ampla.

Não editar recibos para obter `PASS`.

---

## 11. Execução técnica obrigatória

Antes do piloto, num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
```

Depois:

1. criar e autorizar o tenant-piloto;
2. seleccionar os cinco Employees existentes;
3. executar primeiro cinco tarefas de prova controlada;
4. rever os resultados;
5. corrigir bloqueadores encontrados;
6. executar as restantes tarefas até ao limite aprovado;
7. calcular as métricas a partir dos recibos físicos;
8. verificar todos os hashes;
9. executar novamente a CI no SHA final;
10. emitir a atestação final do piloto fora do Git.

---

## Critérios para concluir esta fase

A fase só pode ser concluída quando:

- existe autorização física do piloto;
- pelo menos 25 tarefas reais autorizadas foram executadas;
- os cinco Employees produziram resultados reais verificáveis;
- todas as entregas externas foram revistas por humanos;
- os documentos produzidos abrem e não contêm placeholders residuais;
- as métricas resultam dos registos físicos;
- não ocorreu incidente crítico não resolvido;
- todos os recibos e hashes podem ser recalculados;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` passam;
- a CI e a atestação técnica continuam verdes;
- o relatório não promove a plataforma além da evidência obtida.

### Classificação permitida após o piloto

Se todos os gates passarem:

```text
CONTROLLED_PILOT_VALIDATED
```

Estado operacional permitido:

```text
LIMITED_PRODUCTION_PILOT / HUMAN_SUPERVISED
```

Não utilizar ainda:

```text
PRODUCTION_READY
FULLY_AUTONOMOUS
500_EMPLOYEES_PRODUCTION_CERTIFIED
GLOBAL_PRODUCTION_READY
```

---

## Restrições

- Não criar outro grande módulo.
- Não voltar a redesenhar a arquitectura central.
- Não adicionar novos Employees.
- Não classificar automaticamente os 500 como testados por causa de cinco Employees.
- Não efectuar submissões no portal da AGT.
- Não executar pagamentos reais.
- Não integrar Stripe ou ExpressPay neste piloto, salvo autorização e escopo separados.
- Não escrever no Primavera ou em ERP externo; apenas leitura autorizada quando o conector real estiver disponível.
- Não enviar WhatsApp ou email externo sem aprovação humana.
- Não usar dados de clientes sem autorização.
- Não versionar evidências ou dados reais.
- Não fabricar tarefas, clientes, receita ou métricas.

## Entrega esperada

Apresentar um relatório curto e factual contendo:

- tenant e piloto utilizados, com dados sensíveis ocultados;
- cinco Employees seleccionados;
- número de tarefas reais recebidas, concluídas, corrigidas, rejeitadas e falhadas;
- documentos efectivamente produzidos;
- métricas calculadas;
- incidentes e correcções;
- resultados da revisão humana;
- resultados dos comandos locais e da CI;
- localização e hash do bundle de evidências;
- limitações ainda existentes;
- decisão final: avançar, repetir o piloto ou bloquear a progressão.
