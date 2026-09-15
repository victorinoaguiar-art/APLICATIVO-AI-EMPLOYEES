# PROMPT DE IMPLEMENTAÇÃO COMPLETO
## Fluxo: Seleccionar Employee → Associar à Empresa → Criar Instância → Configurar → Testar → Activar

## Objectivo

Implementar no aplicativo **AI Employee Platform** o fluxo completo de associação de AI Employees a empresas já criadas e provisionadas.

A plataforma já possui:

- módulo `Empresas & Tenants`;
- empresas com `COMPANY_ID`;
- tenants com `TENANT_ID`;
- empresa seleccionável;
- `Catálogo de Roles (500)`;
- módulo `AESSRE — Contratação & Salário`;
- IAM / permissões;
- integrações;
- mecanismos de readiness e auditoria.

**NÃO criar outro marketplace.**  
**NÃO criar outro catálogo.**  
**NÃO criar outro módulo de empresas.**  
**NÃO duplicar o AESSRE.**

O trabalho consiste em **integrar correctamente os componentes existentes** e implementar apenas os elementos em falta para fechar o fluxo de ponta a ponta.

---

# 1. REGRA FUNCIONAL PRINCIPAL

O fluxo obrigatório deve ser:

```text
Seleccionar Empresa
        ↓
Abrir Catálogo 500/500
        ↓
Seleccionar AI Employee
        ↓
Associar à Empresa Seleccionada
        ↓
Configurar Contratação
        ↓
Criar Instância Privada
        ↓
Associar Departamento
        ↓
Configurar Permissões
        ↓
Associar Integrações
        ↓
Associar Conhecimento
        ↓
Executar Readiness Test
        ↓
READY
        ↓
ACTIVATE
```

A selecção de um Employee do catálogo **NÃO** significa que o objecto global `EMP-xxx` passe a pertencer à empresa.

Deve ser criada uma **instância privada e persistente** do Employee para a empresa seleccionada.

---

# 2. EMPRESA ACTIVA / CONTEXTO ACTIVO

Quando o utilizador seleccionar uma empresa em:

`Empresas & Tenants`

guardar explicitamente o contexto:

```text
ACTIVE_COMPANY_ID
ACTIVE_TENANT_ID
ACTIVE_COMPANY_NAME
```

Exemplo actual:

```text
ACTIVE_COMPANY_ID = CMP-486564
ACTIVE_TENANT_ID = TNT-962837
ACTIVE_COMPANY_NAME = MARVINE, LDA
```

Esse contexto deve persistir durante a navegação entre:

```text
Empresas & Tenants
Catálogo 500/500
AESSRE
IAM
Integrações
Readiness
```

Mostrar sempre no cabeçalho ou selector contextual:

```text
Empresa activa:
MARVINE, LDA
CMP-486564
```

Nunca depender apenas de variável visual ou estado temporário do componente.

---

# 3. NOVOS BOTÕES NA EMPRESA

Na área da empresa seleccionada, junto a:

```text
Workforce IA
0 Instâncias
```

adicionar:

```text
[ + Adicionar AI Employee ]
[ Gerir Workforce ]
```

`+ Adicionar AI Employee` deve abrir o `Catálogo 500/500` já no contexto da empresa activa.

`Gerir Workforce` deve abrir a lista de instâncias de AI Employees pertencentes exclusivamente à empresa seleccionada.

---

# 4. ALTERAÇÃO NO CATÁLOGO 500/500

No `Catálogo de Roles (500)`, manter o catálogo global intacto.

Cada Employee deve apresentar:

```text
EMP-XXX
Nome
Departamento
Competências
Nível de risco
Estado global
```

Quando existir uma empresa activa, mostrar:

```text
[ Associar à {EMPRESA} ]
```

Exemplo:

```text
[ Associar à MARVINE, LDA ]
```

Também pode manter:

```text
[ Ver Perfil ]
```

Não utilizar apenas:

```text
[ Contratar ]
```

sem indicar a empresa alvo quando existe um contexto activo.

---

# 5. CASO NÃO EXISTA EMPRESA ACTIVA

Se o utilizador tentar associar um Employee sem empresa seleccionada, bloquear.

Mostrar:

```text
COMPANY_CONTEXT_REQUIRED
```

Mensagem:

```text
Seleccione a empresa à qual pretende associar este AI Employee.
```

Acções:

```text
[ Seleccionar Empresa ]
[ Criar Nova Empresa ]
[ Cancelar ]
```

Não criar empresa implicitamente.

---

# 6. EMPRESA COM MÚLTIPLOS TENANTS

Na arquitectura actual, assumir por defeito:

```text
1 Empresa = 1 Tenant
```

Se no futuro existirem múltiplos tenants por empresa, exigir selecção explícita.

Para já:

```text
company_id → default tenant_id
```

mas guardar ambos em todos os registos relevantes.

---

# 7. MODAL DE ASSOCIAÇÃO

Ao clicar em:

```text
Associar à MARVINE, LDA
```

abrir modal ou página:

## ASSOCIAR AI EMPLOYEE

Mostrar:

```text
Empresa:
MARVINE, LDA

COMPANY_ID:
CMP-486564

TENANT_ID:
TNT-962837

Employee:
EMP-XXX — Nome do Employee

Departamento:
[ seleccionar ]

Supervisor:
[ seleccionar ]

Plano:
[ STARTER / PROFESSIONAL / ENTERPRISE ]

Autonomia:
[ A1–A6 ]

Risco:
R1–R5

Country Pack:
AETF-COUNTRY-AO

Estado inicial:
HIRED
```

Botões:

```text
[ Cancelar ]
[ Criar Instância ]
```

---

# 8. NÃO ASSOCIAR O EMPLOYEE GLOBAL DIRECTAMENTE

Proibido persistir apenas:

```text
company_id = CMP-486564
employee_id = EMP-042
```

como representação da contratação.

`EMP-042` deve continuar a representar o Employee global do catálogo.

Após contratação criar:

```text
CATALOG EMPLOYEE
EMP-042

        ↓

INSTANCE
AEI-000001
```

---

# 9. ENTIDADE DE INSTÂNCIA

Criar ou utilizar entidade existente equivalente a:

```text
company_employee_instances
```

Campos mínimos:

```text
instance_id
catalog_employee_id
company_id
tenant_id
department_id
manager_user_id
subscription_id
plan_id
country_pack_id
sector_pack_id
client_policy_pack_id
autonomy_level
risk_level
status
created_by
created_at
activated_at
suspended_at
deactivated_at
```

Exemplo:

```text
instance_id = AEI-000001
catalog_employee_id = EMP-042
company_id = CMP-486564
tenant_id = TNT-962837
department_id = DEP-ACCOUNTING
plan_id = PROFESSIONAL
country_pack_id = AETF-COUNTRY-AO
autonomy_level = A3
status = PROVISIONING
```

---

# 10. IDENTIFICADOR DA INSTÂNCIA

Gerar identificador único e imutável:

```text
AEI-XXXXXX
```

ou equivalente já utilizado pela arquitectura.

Nunca reutilizar um `instance_id`.

Mesmo que o mesmo Employee seja contratado duas vezes pela mesma empresa:

```text
EMP-042
   ↓
AEI-000001

EMP-042
   ↓
AEI-000002
```

As duas instâncias devem ser independentes.

---

# 11. ACTUALIZAR WORKFORCE DA EMPRESA

Após criar a instância:

Antes:

```text
Workforce IA
0 Instâncias
```

Depois:

```text
Workforce IA
1 Instância
```

Mostrar:

```text
EMP-042
Contabilista Sénior
AEI-000001
Status: PROVISIONING
```

O contador deve resultar da base de dados:

```text
COUNT(company_employee_instances WHERE company_id = ACTIVE_COMPANY_ID)
```

Não hardcode.

---

# 12. DEPARTAMENTO

Uma instância deve pertencer a:

```text
company_id
+
department_id
```

Se não existirem departamentos, mostrar:

```text
[ + Criar Departamento ]
```

Não bloquear toda a contratação por ausência de departamento, mas não permitir `ACTIVE` sem estrutura organizacional definida quando a role exigir departamento.

---

# 13. CONTRATAÇÃO / AESSRE

Integrar o fluxo com:

`AESSRE — Contratação & Salário`

O AESSRE deve receber:

```text
company_id
tenant_id
catalog_employee_id
instance_id
plan_id
```

Criar:

```text
AI_EMPLOYEE_CONTRACT
```

com:

```text
contract_id
company_id
tenant_id
instance_id
plan_id
billing_cycle
digital_salary
start_date
status
```

A contratação deve pertencer à empresa, não ao utilizador humano que clicou no botão.

---

# 14. PERMISSÕES

Depois de criar a instância, encaminhar para:

```text
Configurar Permissões
```

Exemplo:

```text
Google Drive       READ/WRITE
Primavera          READ/WRITE
Banco              READ_ONLY
AGT                PREPARE_ONLY
Email              SEND_WITH_APPROVAL
WhatsApp           NO_ACCESS
Documentos         READ/WRITE
```

As permissões devem ser da instância:

```text
tenant_id
+
instance_id
+
resource
+
permission
```

Nunca atribuir permissões globais ao `EMP-042`.

---

# 15. INTEGRAÇÕES

As integrações pertencem primeiro à empresa:

```text
COMPANY
   ↓
COMPANY CONNECTOR
   ↓
EMPLOYEE INSTANCE PERMISSION
```

Exemplo:

```text
MARVINE
   ↓
Google Drive da MARVINE
   ↓
AEI-000001
   ↓
READ/WRITE
```

Proibido:

```text
EMP-042 → credencial global
```

---

# 16. CONHECIMENTO

Ao provisionar a instância, resolver:

```text
Global Core
+
Global Standards
+
Country Pack
+
Sector Pack
+
Client Policy Pack
+
Case Context
```

Para empresa em Angola:

```text
DEFAULT_COUNTRY_PACK = AETF-COUNTRY-AO
```

Mas não copiar todo o conhecimento para dentro da instância.

Criar bindings/referências.

---

# 17. ESTADOS DA INSTÂNCIA

Implementar lifecycle:

```text
HIRED
↓
PROVISIONING
↓
COMPANY_BOUND
↓
DEPARTMENT_BOUND
↓
PERMISSIONS_CONFIGURED
↓
KNOWLEDGE_BOUND
↓
CONNECTORS_CONFIGURED
↓
READINESS_TEST
↓
READY
↓
ACTIVE
```

Estados alternativos:

```text
BLOCKED
SUSPENDED
OFFBOARDING
DEACTIVATED
ERROR
```

---

# 18. NÃO ACTIVAR IMEDIATAMENTE

Após `Criar Instância`:

NÃO colocar:

```text
status = ACTIVE
```

Colocar:

```text
status = PROVISIONING
```

A activação deve depender de um gate real.

---

# 19. READINESS GATE

Antes de activar, verificar pelo menos:

```text
company_binding = PASS
tenant_binding = PASS
department_binding = PASS
permissions = PASS
knowledge_binding = PASS
connector_requirements = PASS
subscription = PASS
security_policy = PASS
```

Se algum requisito obrigatório falhar:

```text
ACTIVATION_BLOCKED
```

Nunca substituir isso por PASS automático.

---

# 20. BOTÃO ACTIVAR

Só quando:

```text
status = READY
```

mostrar:

```text
[ Activar AI Employee ]
```

Após confirmação:

```text
status = ACTIVE
activated_at = current_timestamp
```

---

# 21. AUDITORIA

Gerar eventos reais:

```text
employee_selected
employee_hiring_started
employee_instance_created
employee_company_bound
employee_tenant_bound
employee_department_bound
employee_permissions_configured
employee_knowledge_bound
employee_connectors_configured
employee_readiness_passed
employee_activated
```

Cada evento deve incluir:

```text
event_id
timestamp
actor_user_id
company_id
tenant_id
catalog_employee_id
instance_id
action
previous_status
new_status
result
```

---

# 22. ISOLAMENTO ENTRE EMPRESAS

Se:

```text
AEI-000001
company_id = CMP-486564
tenant_id = TNT-962837
```

essa instância não pode:

```text
READ tenant != TNT-962837
WRITE tenant != TNT-962837
USE connector belonging to another tenant
READ another company's Client Policy Pack
READ another company's documents
```

Bloquear no backend, não apenas na interface.

---

# 23. MÚLTIPLAS EMPRESAS

Se o mesmo utilizador gerir:

```text
Empresa A
Empresa B
Empresa C
```

o catálogo deve operar no contexto de:

```text
ACTIVE_COMPANY_ID
```

Ao mudar de empresa:

```text
ACTIVE_COMPANY_ID = new_company
ACTIVE_TENANT_ID = corresponding_tenant
```

Actualizar imediatamente:

```text
Workforce
Documents
Integrations
Permissions
Subscriptions
Billing
```

Não transportar estado privado da empresa anterior.

---

# 24. GERIR WORKFORCE

Criar ou completar página:

```text
Gerir Workforce
```

Mostrar:

| Employee | Instância | Departamento | Plano | Autonomia | Estado |
|---|---|---|---|---|---|

Permitir:

```text
Ver
Configurar
Testar
Activar
Suspender
Desactivar
Transferir Departamento
Alterar Supervisor
Alterar Permissões
```

---

# 25. TESTES OBRIGATÓRIOS

## TEST-01 — Seleccionar empresa

Esperado:

```text
ACTIVE_COMPANY_CONTEXT_SET
```

## TEST-02 — Abrir catálogo

Esperado:

```text
ACTIVE_COMPANY_PRESERVED
```

## TEST-03 — Seleccionar Employee

Esperado:

```text
CATALOG_EMPLOYEE_SELECTED
```

## TEST-04 — Criar instância

Esperado:

```text
INSTANCE_CREATED
company_id = selected company
tenant_id = selected tenant
status = PROVISIONING
```

## TEST-05 — Verificar contador

Esperado:

```text
0 → 1
```

## TEST-06 — Contratar o mesmo Employee novamente

Esperado:

```text
NEW_INSTANCE_CREATED
instance_1 != instance_2
```

## TEST-07 — Outra empresa contratar o mesmo Employee

Esperado:

```text
ISOLATED_INSTANCE_CREATED
```

## TEST-08 — Tentar activar antes de readiness

Esperado:

```text
ACTIVATION_BLOCKED
```

## TEST-09 — Configurar tudo e executar readiness

Esperado:

```text
READY
```

## TEST-10 — Activar

Esperado:

```text
ACTIVE
```

## TEST-11 — Employee da Empresa A tentar aceder a recurso da Empresa B

Esperado:

```text
DENIED_CROSS_TENANT
```

---

# 26. CRITÉRIOS DE ACEITAÇÃO

Considerar implementação concluída apenas quando for demonstrado que:

```text
✓ empresa seleccionada mantém contexto entre módulos
✓ catálogo global permanece global
✓ contratação cria instância privada
✓ instance_id é único
✓ instance possui company_id
✓ instance possui tenant_id
✓ contador Workforce reflecte dados reais
✓ mesmo Employee pode gerar múltiplas instâncias
✓ instâncias de empresas diferentes ficam isoladas
✓ permissões pertencem à instância
✓ integrações pertencem primeiro à empresa
✓ readiness precede activação
✓ activação é bloqueada quando faltam requisitos
✓ logs registam o lifecycle completo
```

---

# 27. NÃO IMPLEMENTAR PASS FICTÍCIO

Não aceitar como prova de funcionamento:

```text
status = "PASS"
```

sem validação.

Os testes devem verificar dados realmente persistidos.

Para cada teste produzir:

```text
input
operation
database state before
database state after
expected result
actual result
PASS/FAIL
```

---

# 28. NÃO RECONSTRUIR MÓDULOS JÁ EXISTENTES

Antes de escrever código:

1. localizar implementação existente de `Empresas & Tenants`;
2. localizar estado de empresa seleccionada;
3. localizar catálogo dos 500;
4. localizar AESSRE;
5. localizar modelo/tabela de Employees;
6. localizar IAM;
7. localizar readiness;
8. localizar auditoria.

Reutilizar os componentes existentes.

Somente criar os elementos que faltarem para fechar o fluxo.

---

# 29. RESULTADO VISUAL ESPERADO

Na empresa seleccionada:

```text
MARVINE, LDA

CMP-486564
TNT-962837

Workforce IA
0 Instâncias

[ + Adicionar AI Employee ]
[ Gerir Workforce ]
```

Depois da contratação:

```text
MARVINE, LDA

Workforce IA
1 Instância

EMP-042
Contabilista Sénior

AEI-000001

Status:
PROVISIONING

[ Configurar ]
```

Após readiness:

```text
Status:
READY

[ Activar ]
```

Depois:

```text
Status:
ACTIVE
```

---

# 30. FLUXO FINAL OBRIGATÓRIO

```text
EMPRESA EXISTENTE
      ↓
SELECCIONAR EMPRESA
      ↓
ACTIVE COMPANY CONTEXT
      ↓
CATÁLOGO 500/500
      ↓
SELECCIONAR EMPLOYEE
      ↓
AESSRE
      ↓
CREATE PRIVATE INSTANCE
      ↓
BIND COMPANY
      ↓
BIND TENANT
      ↓
BIND DEPARTMENT
      ↓
PERMISSIONS
      ↓
KNOWLEDGE
      ↓
CONNECTORS
      ↓
READINESS
      ↓
READY
      ↓
ACTIVATE
```

## REGRA FINAL

`EMP-xxx` é o **Employee global do catálogo**.

`AEI-xxxxxx` é o **Employee privado que trabalha para uma empresa concreta**.

Nunca confundir os dois.

A associação só está concluída quando existir uma instância persistida com:

```text
instance_id
catalog_employee_id
company_id
tenant_id
status
```

e a activação só pode ocorrer depois do readiness real.

---

# 31. PRINCÍPIO DE IMPLEMENTAÇÃO DE PONTA A PONTA

A funcionalidade deve ser implementada em todas as camadas necessárias:

```text
UI
→ Estado da Empresa Activa
→ Backend
→ Base de Dados
→ Company/Tenant Binding
→ AESSRE
→ IAM
→ Integrações
→ Knowledge Binding
→ Readiness
→ Activation
→ Audit
```

Não considerar a implementação concluída apenas porque:

- existe um botão;
- existe um modal;
- existe um contador visual;
- existe um `PASS`;
- existe um objecto mockado.

A implementação só está concluída quando o Employee seleccionado no catálogo gera uma **instância privada real, persistida, isolada, configurável, auditável e activável dentro da empresa seleccionada**.
