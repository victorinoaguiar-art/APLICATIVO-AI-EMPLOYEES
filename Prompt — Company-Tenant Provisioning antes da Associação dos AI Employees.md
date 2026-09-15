# PROMPT — CRIAÇÃO FORMAL DA EMPRESA/TENANT ANTES DA ASSOCIAÇÃO DOS AI EMPLOYEES

## Objectivo

Corrigir a arquitectura de onboarding e provisionamento da plataforma AETF-500 para garantir que nenhuma empresa cliente seja criada implicitamente durante:

- criação de utilizadores;
- convite de administradores;
- contratação de AI Employees;
- activação de subscrições;
- configuração de integrações.

A **empresa deve existir formalmente antes de qualquer Employee poder ser associado a ela**.

---

# 1. PRINCÍPIO ARQUITECTÓNICO OBRIGATÓRIO

Implementar a seguinte ordem estrutural:

```text
PLATFORM
   ↓
COMPANY
   ↓
TENANT
   ↓
COMPANY MEMBERSHIP
   ↓
USERS
   ↓
DEPARTMENTS
   ↓
SUBSCRIPTIONS
   ↓
AI EMPLOYEE INSTANCES
```

É expressamente proibido utilizar fluxos onde:

```text
USER → cria COMPANY implicitamente
```

ou:

```text
EMPLOYEE CONTRACT → cria COMPANY implicitamente
```

ou:

```text
SUBSCRIPTION → cria COMPANY automaticamente sem onboarding empresarial formal
```

A entidade `COMPANY` deve ser criada, validada e provisionada previamente.

---

# 2. CRIAR MÓDULO FORMAL DE EMPRESAS

Adicionar no menu lateral um módulo principal:

# `Empresas`

ou:

# `Empresas & Tenants`

Este módulo deve tornar-se o ponto central de administração das empresas clientes.

Dentro do módulo incluir:

```text
Visão Geral
Dados da Empresa
Tenant
Estrutura Organizacional
Utilizadores
AI Workforce
Conhecimento
Integrações
Segurança
Subscrições
Faturação
Auditoria
```

---

# 3. INTEGRAÇÃO COM APCATOS

No módulo:

`APCATOS — Provisionamento & Acesso`

adicionar como primeira sub-aba:

# `Empresas & Tenants`

A ordem recomendada fica:

```text
APCATOS
│
├── Empresas & Tenants
├── IAM & Utilizadores
├── Funções & Permissões
├── Passaporte de Prontidão
└── Segurança / MFA / SSO
```

Assim o fluxo obrigatório passa a ser:

```text
EMPRESA
   ↓
UTILIZADORES
   ↓
PERMISSÕES
   ↓
AI EMPLOYEES
```

---

# 4. BOTÃO “CRIAR EMPRESA”

Implementar:

```text
[ + Criar Empresa ]
```

Ao clicar, abrir onboarding empresarial.

Solicitar pelo menos:

## Identificação

- nome empresarial;
- nome comercial;
- NIF;
- forma jurídica;
- número de registo comercial, quando aplicável.

## Localização e jurisdição

- país;
- província/estado;
- município/cidade;
- endereço;
- jurisdição principal.

## Actividade

- sector;
- actividade principal;
- actividades secundárias;
- dimensão da empresa.

## Contactos

- email;
- telefone;
- website, quando existir.

## Responsável principal

- nome;
- função;
- email;
- telefone.

## Configuração operacional

- idioma;
- moeda;
- fuso horário;
- país fiscal;
- país laboral;
- país regulatório principal.

---

# 5. IDENTIFICADORES OBRIGATÓRIOS

Após criação bem-sucedida, gerar:

```text
COMPANY_ID
TENANT_ID
```

Exemplo:

```text
COMPANY_ID = CMP-000123
TENANT_ID  = TNT-000123
```

Os dois conceitos devem permanecer separados.

## COMPANY_ID

Representa:

- entidade empresarial;
- identidade organizacional;
- relacionamento comercial;
- titularidade dos Employees contratados;
- contratos;
- subscrições;
- faturação.

## TENANT_ID

Representa:

- isolamento técnico;
- dados;
- utilizadores;
- permissões;
- documentos;
- integrações;
- conhecimento;
- logs;
- configurações.

Nunca utilizar apenas `USER_ID` como fronteira de isolamento.

---

# 6. ESTADOS DA EMPRESA

Implementar lifecycle próprio:

```text
DRAFT
↓
CREATED
↓
IDENTITY_PENDING
↓
PROVISIONING
↓
READY_FOR_CONFIGURATION
↓
ACTIVE
↓
SUSPENDED
↓
OFFBOARDING
↓
CLOSED
```

Nenhum AI Employee pode ficar `ACTIVE` enquanto a empresa estiver abaixo de:

```text
READY_FOR_CONFIGURATION
```

---

# 7. PROVISIONAMENTO AUTOMÁTICO

Ao criar a empresa, provisionar automaticamente:

```text
Company Profile
Tenant
Workspace
IAM namespace
Default roles
Audit namespace
Document namespace
Knowledge namespace
Connector namespace
Billing account
Subscription container
AI Workforce container
Approval policies
Data isolation policies
```

Criar também estruturas vazias para:

```text
Users
Departments
Employee Instances
Documents
Knowledge
Integrations
Approvals
Subscriptions
Billing
Audit Logs
```

---

# 8. ASSOCIAÇÃO DA JURISDIÇÃO

Quando:

```text
company_country = AO
```

associar inicialmente:

```text
DEFAULT_COUNTRY_PACK = AETF-COUNTRY-AO
```

Mas manter separação entre:

```text
Company Default Jurisdiction
```

e:

```text
Case Context Jurisdiction
```

Não assumir que todos os casos da empresa utilizam automaticamente a mesma legislação.

---

# 9. ADMINISTRADOR PRINCIPAL

Depois da empresa estar criada, solicitar:

# `Adicionar Administrador Principal`

Criar:

```text
USER_ID
```

e uma relação separada:

```text
COMPANY_MEMBERSHIP
```

Modelo recomendado:

```text
membership_id
company_id
user_id
role
status
created_at
```

Não colocar a relação Empresa/Utilizador apenas como atributo fixo dentro do utilizador.

Um utilizador deve poder pertencer a mais de uma empresa quando autorizado.

---

# 10. CRIAÇÃO DE DEPARTAMENTOS

Permitir:

```text
[ + Criar Departamento ]
```

Exemplos:

```text
Administração
Contabilidade
Fiscalidade
Finanças
RH
Compras
Vendas
Marketing
Auditoria
Jurídico
Tecnologia
Operações
```

Cada departamento deve possuir:

```text
department_id
company_id
name
manager
status
cost_center
```

---

# 11. REGRA FUNDAMENTAL PARA AI EMPLOYEES

Um AI Employee do catálogo global nunca deve ser associado directamente à empresa como o próprio objecto global.

Exemplo proibido:

```text
COMPANY_ID → EMP-042
```

O `EMP-042` representa apenas o template global.

Quando a empresa contratar o Employee, criar uma instância privada:

```text
EMP-042
   ↓
CREATE INSTANCE
   ↓
AEI-000934
```

Relacionamento:

```text
AEI-000934
company_id = CMP-000123
tenant_id = TNT-000123
catalog_employee_id = EMP-042
```

---

# 12. CRIAR ENTIDADE COMPANY_EMPLOYEE_INSTANCE

Implementar entidade equivalente a:

```text
company_employee_instances
```

Com pelo menos:

```text
instance_id
company_id
tenant_id

catalog_employee_id

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

created_at
activated_at
suspended_at
deactivated_at
```

---

# 13. FLUXO DE CONTRATAÇÃO

O fluxo correcto deve ser:

```text
CATÁLOGO 500/500
      ↓
SELECCIONAR EMPLOYEE
      ↓
CONTRATAR
      ↓
AESSRE
      ↓
VALIDAR EMPRESA
      ↓
VALIDAR TENANT
      ↓
VALIDAR SUBSCRIÇÃO
      ↓
CRIAR EMPLOYEE INSTANCE
      ↓
ASSOCIAR À EMPRESA
      ↓
ASSOCIAR AO DEPARTAMENTO
      ↓
CONFIGURAR PERMISSÕES
      ↓
CONFIGURAR KNOWLEDGE BINDING
      ↓
CONFIGURAR INTEGRAÇÕES
      ↓
READINESS TEST
      ↓
ACTIVAR
```

---

# 14. BLOQUEIO OBRIGATÓRIO

Se um utilizador tentar contratar um Employee sem possuir empresa activa, bloquear a operação.

Mostrar:

```text
COMPANY_REQUIRED
```

Mensagem:

```text
Antes de contratar um AI Employee, crie ou seleccione uma empresa.
```

Botões:

```text
[ Criar Empresa ]

[ Seleccionar Empresa Existente ]
```

Nunca criar a empresa silenciosamente.

---

# 15. SELECÇÃO DE EMPRESA EM CONTAS MULTIEMPRESA

Se o utilizador administrar várias empresas:

```text
Empresa A
Empresa B
Empresa C
```

antes da contratação mostrar:

```text
Em que empresa pretende contratar este AI Employee?
```

Depois criar a instância exclusivamente dentro do tenant seleccionado.

---

# 16. MÚLTIPLAS INSTÂNCIAS

Permitir:

```text
EMP-042
```

ser contratado:

- por milhares de empresas;
- várias vezes pela mesma empresa;
- para departamentos diferentes;
- com permissões diferentes;
- com managers diferentes;
- com autonomia diferente.

Exemplo:

```text
EMP-042
├── CMP-001 → AEI-001
├── CMP-002 → AEI-002
├── CMP-003 → AEI-003
└── CMP-003 → AEI-004
```

Nunca compartilhar memória privada, documentos, credenciais ou contexto entre essas instâncias.

---

# 17. PROPRIEDADE DAS INTEGRAÇÕES

As integrações devem pertencer primeiro à empresa.

Modelo:

```text
COMPANY
   ↓
COMPANY CONNECTOR
   ↓
PERMISSION
   ↓
AI EMPLOYEE INSTANCE
```

Não:

```text
AI EMPLOYEE → CREDENCIAL GLOBAL
```

Exemplo:

```text
CMP-000123
   ↓
Primavera Connection
   ↓
AEI-000934 = READ/WRITE
AEI-000935 = READ_ONLY
AEI-000936 = NO_ACCESS
```

---

# 18. CONHECIMENTO DA EMPRESA

Criar:

```text
CLIENT_POLICY_PACK
```

por empresa.

Exemplo:

```text
CPP-CMP-000123
```

Pode conter:

- políticas internas;
- procedimentos;
- plano de contas;
- organograma;
- modelos de documentos;
- limites de aprovação;
- políticas financeiras;
- contratos padrão;
- regras internas.

Associar apenas aos Employees autorizados.

---

# 19. ACTIVATION GATE

Nenhum AI Employee Instance pode ser activado directamente após pagamento.

Utilizar lifecycle:

```text
HIRED
↓
PROVISIONING
↓
COMPANY_BOUND
↓
DEPARTMENT_BOUND
↓
KNOWLEDGE_BOUND
↓
PERMISSIONS_CONFIGURED
↓
CONNECTORS_CONFIGURED
↓
READINESS_TEST
↓
READY
↓
ACTIVE
```

Qualquer falha deve impedir activação.

---

# 20. ISOLAMENTO ENTRE EMPRESAS

Garantir obrigatoriamente:

```text
TENANT A ≠ TENANT B
```

Nenhum Employee da Empresa A pode:

- consultar documentos da Empresa B;
- utilizar credenciais da Empresa B;
- recuperar conhecimento interno da Empresa B;
- consultar conversas da Empresa B;
- escrever em integrações da Empresa B.

Implementar testes negativos específicos para provar isolamento.

---

# 21. AUDITORIA

Registar:

```text
company_created
tenant_created
user_added
membership_created
department_created
employee_hired
employee_instance_created
employee_company_bound
permissions_assigned
connector_granted
knowledge_bound
employee_activated
employee_suspended
employee_removed
```

Cada evento deve conter:

```text
timestamp
actor
company_id
tenant_id
resource_id
action
result
```

---

# 22. MIGRAÇÃO DO ESTADO ACTUAL

Auditar a plataforma actual e identificar:

- utilizadores sem empresa formal;
- Employees associados directamente a utilizadores;
- Employees sem `company_id`;
- Employees sem `tenant_id`;
- subscrições sem empresa;
- integrações sem ownership empresarial;
- documentos sem tenant;
- permissões sem escopo empresarial.

Produzir:

```text
LEGACY_ASSOCIATION_AUDIT
```

Não eliminar nem reatribuir dados automaticamente.

Criar plano de migração controlado.

---

# 23. TESTES OBRIGATÓRIOS

Executar pelo menos:

### TEST-01
Criar empresa sem Employee.

Resultado esperado:

```text
PASS
```

### TEST-02
Criar utilizador sem criar empresa implicitamente.

Resultado esperado:

```text
PASS
```

### TEST-03
Tentar contratar Employee sem empresa.

Resultado:

```text
BLOCKED_COMPANY_REQUIRED
```

### TEST-04
Criar empresa e contratar Employee.

Resultado:

```text
EMPLOYEE_INSTANCE_CREATED
```

### TEST-05
Contratar mesmo Employee por duas empresas.

Resultado:

```text
TWO_ISOLATED_INSTANCES
```

### TEST-06
Contratar duas instâncias do mesmo Employee na mesma empresa.

Resultado:

```text
TWO_DISTINCT_COMPANY_INSTANCES
```

### TEST-07
Employee da Empresa A tentar aceder à Empresa B.

Resultado:

```text
DENIED
```

### TEST-08
Eliminar utilizador administrador.

Resultado:

A empresa, tenant e Employees devem continuar existentes.

---

# 24. REGRA DE ACEITAÇÃO FINAL

A implementação só pode receber `PASS` quando for provado que:

```text
COMPANY EXISTS FIRST
TENANT EXISTS FIRST
USER IS ASSOCIATED THROUGH MEMBERSHIP
CATALOG EMPLOYEE REMAINS GLOBAL
CONTRACT CREATES PRIVATE EMPLOYEE INSTANCE
INSTANCE BELONGS TO EXACTLY ONE COMPANY/TENANT
EMPLOYEE ACTIVATION REQUIRES READINESS
CROSS-TENANT ACCESS IS BLOCKED
```

---

# RESULTADO ESTRUTURAL ESPERADO

```text
PLATFORM
│
├── GLOBAL EMPLOYEE CATALOG
│   ├── EMP-001
│   ├── EMP-002
│   └── ... EMP-500
│
├── COMPANY A
│   └── TENANT A
│       ├── Users
│       ├── Departments
│       ├── Employee Instances
│       ├── Knowledge
│       ├── Documents
│       ├── Integrations
│       └── Billing
│
└── COMPANY B
    └── TENANT B
        ├── Users
        ├── Departments
        ├── Employee Instances
        ├── Knowledge
        ├── Documents
        ├── Integrations
        └── Billing
```

## REGRA FINAL

**A empresa não deve nascer como efeito secundário da criação de um utilizador, da contratação de um AI Employee ou da compra de uma subscrição.**

A sequência obrigatória passa a ser:

**Create Company → Create Tenant → Configure Company → Add Users → Configure Access → Hire AI Employee → Create Private Instance → Bind to Company → Test → Activate.**