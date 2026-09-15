# ESPECIFICAÇÃO DO WIZARD DE CRIAÇÃO DE EMPRESA (COMPANY_CREATION_WIZARD_SPEC)
## AETF-500 — Arquitectura do Wizard de 3 Passos

### 1. Objectivo
Substituir o anterior modal genérico de criação de empresa por um assistente em 3 passos progressivos, concebido para simplificar a recolha de dados legais, de contacto e preferências operacionais sem sobrecarregar o utilizador.

---

### 2. Estrutura dos Passos

#### Passo 1 — Identificação Legal da Empresa
- **Razão Social** (*Obrigatório*): Denominação legal registada no registo comercial.
- **Nome Comercial** (*Opcional*): Nome de marca ou insígnia.
- **Forma Jurídica** (*Obrigatório*): Lda, S.A., E.I., etc.
- **NIF / Número de Identificação Fiscal** (*Obrigatório*): Validado para o padrão local (ex: AGT Angola).
- **País, Província e Município** (*Obrigatórios/Opcionais*): Localização da sede.
- **Sector de Actividade e Actividade Principal** (*Obrigatório*): Enquadramento sectorial da empresa.

#### Passo 2 — Contactos e Administrador da Empresa
- **Dados Institucionais**: Email de contacto/facturação, telefone principal, website e morada fiscal.
- **Administrador Inicial**: Nome completo, email de acesso, telefone e cargo.
- **Funcionalidade Especial**: Botão `[ Usar os meus dados ]` que pré-preenche instantaneamente os dados do utilizador actualmente autenticado na sessão.

#### Passo 3 — Configuração Inicial do Ambiente
- **Idioma Padrão**: Português / English.
- **Moeda de Conta**: AOA (Kwanza), EUR (€), USD ($).
- **Fuso Horário**: Africa/Luanda (WAT, UTC+1), Europe/Lisbon (WET, UTC+0).
- **Jurisdição Fiscal**: Angola (AGT / PGC), Portugal (AT / SNC).
- **Segurança**: Isolamento multi-tenant configurado automaticamente nos bastidores.

---

### 3. Estados e Validações
- Os botões de navegação (`Seguinte` e `Voltar`) permitem transitar entre passos com validação em cada etapa.
- No Passo 3, o botão transforma-se em `Criar Empresa`, persistindo os dados no estado e na lista de empresas do sistema.
