# Documentação de Arquitectura — ABWSEM v2.0
## Area-Based Digital Workforce Subscription & Entitlement Model (48 Áreas Comerciais & Digital Workforce Layer)

### 1. Resumo Executivo
O **ABWSEM v2.0** define a arquitetura comercial de empacotamento, direito de uso (entitlements) e ciclo de vida da força de trabalho digital da **AI Employee Platform**.

Substituindo a venda individual de 500 Role Packs por uma unidade comercial baseada em **Áreas de Trabalho Digitais**, o ABWSEM v2.0 permite vender cobertura funcional de negócio em vez de fragmentação técnica.

### 2. Taxonomia v2.0 (48 Áreas Comerciais + P01)
- **28 Áreas Funcionais (`A01`–`A28`)**: Cobrem funções de suporte e negócio transversais.
- **20 Áreas Sectoriais (`S01`–`S20`)**: Cobrem especificidades de indústrias verticais (Construção, Banca, Seguros, Agricultura, Indústria, Energia, Telecomunicações, Mineração, Petróleo, Saúde, Educação, Retalho, etc.).
- **1 Camada de Plataforma (`P01`)**: Gestão e supervisão da força de trabalho digital (#251–#260), incluída no control plane da plataforma.

### 3. Regras Fundamentais
1. **Área Subscrita != Todos os Employees Activos**: A subscrição transita os Employees para o estado `AVAILABLE`. A ativação para `ACTIVE` exige a passagem pelo **Activation Gate** de 7 passos.
2. **Direito Comercial != Autorização de Dados**: Ter subscrito uma Área comercial não concede acesso aos dados/sistemas privados do tenant sem consentimento e permissões explícitas.
3. **1 Role Pack = 1 Home Area**: Mapeamento unívoco de cada um dos 500 Role Packs a exatamente 1 Home Area comercial (490 nas 48 áreas + 10 em P01).
4. **Area Independence Test (AIT)**: Nenhuma área é fundida se possuir comprador, resultados, KPIs e processos próprios.
