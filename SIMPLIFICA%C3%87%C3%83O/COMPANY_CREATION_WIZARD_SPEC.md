# COMPANY_CREATION_WIZARD_SPEC — Especificação do Wizard de Criar Empresa em 3 Passos

**Documento:** Especificação Técnica do Fluxo de Onboarding de Empresa  
**Projeto:** AETF-500  
**Data:** 14 de Setembro de 2026  

---

## 1. VISÃO GERAL DO FLUXO DO WIZARD

O formulário de criação de empresas foi transformado de uma lista extensa de campos num **Wizard Guiado de 3 Passos**, assegurando uma experiência intuitiva, sem jargão técnico de infraestrutura e com preenchimento assistido.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ PASSO 1: Identificação Legal da Empresa                                 │
│ Razão Social*, Nome Comercial, Forma Jurídica*, NIF*, País*, Sector*    │
├────────────────────────────────────────────────────────────────────────┤
│ PASSO 2: Contactos Institucionais & Administrador                      │
│ Email*, Telefone + Admin (Nome*, Email*) + [ Usar os Meus Dados ]      │
├────────────────────────────────────────────────────────────────────────┤
│ PASSO 3: Preferências Regionais & Fiscais                             │
│ Idioma*, Moeda*, Fuso Horário*, Jurisdição Fiscal*                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DETALHAMENTO DOS PASSOS

### PASSO 1: IDENTIFICAÇÃO LEGAL
- **Razão Social** (Obrigatório): Nome legal registado no diário da república / conservatória.
- **Nome Comercial** (Opcional): Nome da marca ou insígnia.
- **Forma Jurídica** (Obrigatório): Lda, S.A., Unipessoal, Empresa Pública, Ministério.
- **NIF** (Obrigatório): Número de Identificação Fiscal (validação de formato e verificação de duplicados em base de dados).
- **País, Província e Município** (Obrigatório / Opcional): Localização da sede.
- **Sector de Actividade** (Obrigatório): Tecnologia, Contabilidade, Banca, Saúde, Energia, Comércio.

### PASSO 2: CONTACTOS & ADMINISTRADOR
- **Contactos da Empresa:** Email Institucional*, Telefone, Morada.
- **Dados do Administrador Principal:**
  - Nome Completo*
  - Email Profissional*
  - Cargo
- **Botão `[ Usar os meus dados ]`:** Preenche automaticamente o nome, email e contacto do utilizador logado no sistema, reduzindo o tempo de preenchimento para menos de 5 segundos.

### PASSO 3: PREFERÊNCIAS REGIONAIS & FISCAIS
- **Idioma Padrão:** Português / English.
- **Moeda de Conta:** AOA (Kwanza), EUR (€), USD ($).
- **Fuso Horário:** Africa/Luanda (WAT, UTC+1), Europe/Lisbon (WET, UTC+0).
- **Jurisdição Fiscal:** Angola (AGT / PGC), Portugal (AT / SNC).

---

## 3. AÇÕES AUTOMÁTICAS EXECUTADAS NO BACKEND

Ao clicar em `[ Criar Empresa ]` no Passo 3, o backend executa atomicamente em transação segura:
1. `createOrganization()` — Grava a empresa na tabela `organizations`.
2. `createTenant()` — Gera automaticamente o UUID do `tenant_id` privado com isolamento lógico de dados.
3. `createAdminMembership()` — Cria a associação `organization_memberships` e atribui o perfil `Administrador`.
4. `createDefaultSettings()` — Aplica o fuso horário, moeda, jurisdição e suporte aos 500 AI Employees.
5. `createAuditEvent()` — Regista a ação imutável na tabela `audit_events`.
