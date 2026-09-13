<USER_REQUEST>\nClaro. Segue o **prompt mestre em Markdown** para executar a correcÃ§Ã£o controlada do 
`P0_CRITICAL_FAIL`, comeÃ§ando por HEALTHCARE/MINSA e depois propagando as correcÃ§Ãµes apenas onde a evidÃªncia 
justificar.\r\n\r\n````md\r\n# AETF-500 P0 Knowledge Provenance, Source Authority, Content Reconstruction & Regulatory 
Router Remediation v1.0\r\n\r\n## 1. IdentificaÃ§Ã£o do Programa\r\n\r\n**Program ID:**  \r\n`AETF500_P0_KNOWLEDGE_PROV
ENANCE_SOURCE_AUTHORITY_CONTENT_RECONSTRUCTION_REGULATORY_ROUTER_REMEDIATION_v1.0`\r\n\r\n**Execution 
Classification:**  \r\n`CONTROLLED_P0_KNOWLEDGE_REMEDIATION_AND_RECERTIFICATION_PROGRAM`\r\n\r\n**Baseline de 
ReferÃªncia:**  \r\n`AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN`\r\n\r\n**Baseline Mutation Allowed:**  
\r\n`FALSE`\r\n\r\n**Prioridade:**  \r\n`P0_CRITICAL`\r\n\r\n**Estado de Entrada 
ObrigatÃ³rio:**\r\n\r\n```text\r\nMASTER_FORENSIC_GATE = P0_CRITICAL_FAIL\r\n````\r\n\r\n---\r\n\r\n# 2. 
MissÃ£o\r\n\r\nCorrigir de forma controlada, auditÃ¡vel, reversÃvel e baseada em evidÃªncia as falhas de:\r\n\r\n* 
proveniÃªncia de conhecimento;\r\n* origem de fontes;\r\n* autoridade documental;\r\n* conteÃºdo substantivo;\r\n* 
indexaÃ§Ã£o;\r\n* Employee Knowledge Mapping;\r\n* Source Routing;\r\n* fallback regulatÃ³rio;\r\n* runtime 
provenance;\r\n\r\nidentificadas pela auditoria 
forense:\r\n\r\n`AETF500_SOURCE_REGISTRY_KNOWLEDGE_CONTENT_RUNTIME_PROVENANCE_FORENSIC_AUDIT_v1.0`.\r\n\r\nO primeiro 
domÃnio obrigatÃ³rio de remediaÃ§Ã£o Ã©:\r\n\r\n```text\r\nHEALTHCARE / MINSA / ANGOLA\r\n```\r\n\r\ne a cadeia 
prioritÃ¡ria Ã©:\r\n\r\n```text\r\nKI-001 ... KI-007\r\nâ†“\r\nDR-001 ... 
DR-032\r\nâ†“\r\nSRC-LAB-001\r\nâ†“\r\nSOURCE REGISTRY\r\nâ†“\r\nMINSA / DIÃRIO DA REPÃšBLICA / AUTORIDADE 
COMPETENTE\r\nâ†“\r\nCANONICAL CONTENT\r\nâ†“\r\nINDEX\r\nâ†“\r\nEMPLOYEE 
MAPPING\r\nâ†“\r\nRUNTIME\r\n```\r\n\r\n---\r\n\r\n# 3. PrincÃpio Fundamental\r\n\r\nEste programa nÃ£o tem como 
objectivo fazer o sistema \"passar\".\r\n\r\nTem como objectivo corrigir apenas aquilo que puder ser 
provado.\r\n\r\nAplicar:\r\n\r\n```text\r\nNO_EVIDENCE = NO_PASS\r\n```\r\n\r\n```text\r\nNO_AUTHORITATIVE_SOURCE = 
NO_REGULATORY_KNOWLEDGE\r\n```\r\n\r\n```text\r\nNO_RUNTIME_PROOF = NO_RECERTIFICATION\r\n```\r\n\r\nO 
estado:\r\n\r\n```text\r\nP0_CRITICAL_FAIL\r\n```\r\n\r\nsÃ³ pode ser removido quando os testes posteriores Ã 
correcÃ§Ã£o demonstrarem fisicamente a cadeia:\r\n\r\n```text\r\nAUTHORITATIVE SOURCE\r\nâ†’ VERIFIED SNAPSHOT\r\nâ†’ 
KNOWLEDGE CONTENT\r\nâ†’ STRUCTURED OBJECT\r\nâ†’ INDEX\r\nâ†’ EMPLOYEE MAPPING\r\nâ†’ RUNTIME RETRIEVAL\r\nâ†’ 
ANSWER\r\nâ†’ PROVENANCE TRACE\r\n```\r\n\r\n---\r\n\r\n# 4. Regras Absolutas\r\n\r\nÃ‰ 
proibido:\r\n\r\n```text\r\nINVENT_KNOWLEDGE = TRUE\r\nINVENT_LEGAL_STATUS = TRUE\r\nINVENT_SOURCE_URL = 
TRUE\r\nINVENT_AUTHORITY = TRUE\r\nAUTO_PASS_FAILED_GATES = TRUE\r\nUSE_LOCAL_FILE_AS_AUTHORITY = 
TRUE\r\nUSE_ONEDRIVE_AS_AUTHORITY = TRUE\r\nUSE_GOOGLE_DRIVE_AS_AUTHORITY = TRUE\r\nUSE_C_DRIVE_AS_AUTHORITY = 
TRUE\r\nHIDE_UNRESOLVED_GAPS = TRUE\r\nMUTATE_FROZEN_BASELINE = TRUE\r\n```\r\n\r\nOneDrive, Google Drive e `C:\\` 
podem ser:\r\n\r\n```text\r\nSTORAGE_LOCATION\r\nDOCUMENT_ARCHIVE\r\nUSER_FILE_SOURCE\r\n```\r\n\r\nmas nunca, por si 
prÃ³prios:\r\n\r\n```text\r\nREGULATORY_AUTHORITY\r\n```\r\n\r\n---\r\n\r\n# 5. SeparaÃ§Ã£o ObrigatÃ³ria de 
Conceitos\r\n\r\nA arquitectura corrigida deve distinguir explicitamente:\r\n\r\n```text\r\nauthority_source\r\ninstitu
tional_source\r\nofficial_publisher\r\noriginal_document\r\nsource_snapshot\r\nstorage_provider\r\nstorage_path\r\nknow
ledge_object\r\nstructured_object\r\nvector_index\r\nruntime_retrieval_source\r\nfallback_source\r\n```\r\n\r\nExemplo 
correcto:\r\n\r\n```text\r\nauthority_source = DiÃ¡rio da RepÃºblica\r\ninstitutional_source = 
MINSA\r\nstorage_provider = Object Storage / Drive Archive\r\nknowledge_object = KO-...\r\nstructured_object = 
DR-...\r\nretrieval_index = ...\r\n```\r\n\r\nExemplo proibido:\r\n\r\n```text\r\nauthority_source = 
C:\\Users\\...\\lei.pdf\r\n```\r\n\r\n---\r\n\r\n# 6. FASE 0 â€” Congelamento PrÃ©-RemediaÃ§Ã£o\r\n\r\nAntes de 
alterar qualquer componente, criar snapshot forense do estado actual.\r\n\r\nCapturar:\r\n\r\n```text\r\ngit_commit\r\n
application_build\r\ndatabase_schema\r\ndatabase_snapshot\r\nsource_registry_snapshot\r\nknowledge_registry_snapshot\r\
nvector_index_metadata\r\nemployee_mapping_snapshot\r\nsource_router_configuration\r\nfallback_configuration\r\nruntime
_test_baseline\r\n```\r\n\r\nPara cada artefacto:\r\n\r\n```text\r\nphysical_path\r\nbyte_size\r\nsha256\r\ntimestamp_u
tc\r\n```\r\n\r\nCriar:\r\n\r\n`AETF500_P0_Pre_Remediation_Forensic_Snapshot_v1.0.json`\r\n\r\nNenhuma correcÃ§Ã£o 
pode ocorrer antes desta evidÃªncia ser preservada.\r\n\r\n---\r\n\r\n# 7. FASE 1 â€” ContenÃ§Ã£o 
Imediata\r\n\r\nCorrigir primeiro o risco de execuÃ§Ã£o.\r\n\r\nEnquanto o domÃnio nÃ£o estiver 
validado:\r\n\r\n```text\r\nHEALTHCARE_REGULATORY_AUTONOMY = SUSPENDED\r\n```\r\n\r\nDesactivar para consultas regulatÃ
³rias:\r\n\r\n```text\r\nUNCONTROLLED_ONEDRIVE_FALLBACK\r\nUNCONTROLLED_GOOGLE_DRIVE_FALLBACK\r\nUNCONTROLLED_LOCAL_FIL
E_FALLBACK\r\nC_DRIVE_RECURSIVE_SEARCH\r\n```\r\n\r\nO comportamento obrigatÃ³rio passa a ser:\r\n\r\n```text\r\nCANONI
CAL_KNOWLEDGE_MISS\r\nâ†“\r\nKNOWLEDGE_GAP_DETECTED\r\nâ†“\r\nCONTROLLED_SOURCE_ACQUISITION\r\nOU\r\nHUMAN_REVIEW_REQUI
RED\r\n```\r\n\r\nNunca:\r\n\r\n```text\r\nCANONICAL_KNOWLEDGE_MISS\r\nâ†“\r\nSEARCH RANDOM LOCAL 
FILES\r\n```\r\n\r\n---\r\n\r\n# 8. FASE 2 â€” CorrecÃ§Ã£o de SRC-LAB-001\r\n\r\nNÃ£o eliminar 
automaticamente:\r\n\r\n```text\r\nSRC-LAB-001\r\n```\r\n\r\nDeterminar primeiro a sua utilizaÃ§Ã£o legÃ
tima.\r\n\r\nSe for confirmado como fonte laboral:\r\n\r\n```text\r\ncanonical_domain = LABOR / 
EMPLOYMENT\r\n```\r\n\r\nRemover apenas mappings invÃ¡lidos 
para:\r\n\r\n```text\r\nHEALTHCARE\r\nCYBERSECURITY\r\nDATA_PRIVACY\r\nLOGISTICS\r\nCOMPLIANCE\r\nou outros domÃnios 
nÃ£o justificados\r\n```\r\n\r\nGerar:\r\n\r\n`AETF500_SRC_LAB_001_Usage_Reconciliation_v1.0.json`\r\n\r\nCom:\r\n\r\n`
``text\r\nknowledge_item_id\r\ndomain\r\ncurrent_mapping\r\nmapping_valid\r\nreason\r\nreplacement_required\r\nreplacem
ent_source_id\r\nstatus\r\n```\r\n\r\nEstados 
permitidos:\r\n\r\n```text\r\nVALID\r\nINVALID\r\nMIXED\r\nUNRESOLVED\r\n```\r\n\r\n---\r\n\r\n# 9. FASE 3 â€” 
ConstruÃ§Ã£o do Source Registry HEALTHCARE\r\n\r\nCriar ou corrigir fontes de SaÃºde apenas depois de provar cada 
documento.\r\n\r\nPara cada documento regulatÃ³rio:\r\n\r\n```text\r\nsource_id\r\ntitle\r\ndocument_type\r\ndocument_n
umber\r\njurisdiction\r\nauthority\r\ninstitution\r\nofficial_publisher\r\npublication_date\r\neffective_date\r\nlegal_
status\r\nofficial_url\r\nsource_hash\r\nsnapshot_hash\r\nsnapshot_location\r\nlast_verified_at\r\nverification_method\
r\n```\r\n\r\nNÃ£o usar nomes genÃ©ricos como:\r\n\r\n```text\r\nSRC-HEALTH-001\r\n```\r\n\r\nantes de identificar o 
documento real.\r\n\r\nA sequÃªncia obrigatÃ³ria Ã©:\r\n\r\n```text\r\nOFFICIAL DOCUMENT FOUND\r\nâ†“\r\nAUTHORITY 
VERIFIED\r\nâ†“\r\nVERSION VERIFIED\r\nâ†“\r\nSTATUS VERIFIED\r\nâ†“\r\nSNAPSHOT 
CREATED\r\nâ†“\r\nHASHED\r\nâ†“\r\nSOURCE RECORD CREATED\r\n```\r\n\r\n---\r\n\r\n# 10. Regra de Autoridade JurÃ
dica\r\n\r\nPara legislaÃ§Ã£o e regulamentaÃ§Ã£o:\r\n\r\n```text\r\nT5 = DiÃ¡rio da RepÃºblica / publicaÃ§Ã£o legal 
oficial primÃ¡ria\r\nT4 = Portal oficial do Ã³rgÃ£o competente\r\nT3 = cÃ³pia canÃ³nica validada com proveniÃªncia 
T4/T5\r\nT2 = documento institucional secundÃ¡rio\r\nT1 = ficheiro local / Drive nÃ£o validado\r\nT0 = origem 
desconhecida\r\n```\r\n\r\nPara conteÃºdo regulatÃ³rio:\r\n\r\n```text\r\nMINIMUM_TRUST_LEVEL = 
T4\r\n```\r\n\r\nou:\r\n\r\n```text\r\nT3\r\n```\r\n\r\nsomente quando existir cadeia criptogrÃ¡fica e documental atÃ© 
T4/T5.\r\n\r\n---\r\n\r\n# 11. FASE 4 â€” ReconstruÃ§Ã£o de DR-001 a DR-032\r\n\r\nOs 
objectos:\r\n\r\n```text\r\nDR-001 ... DR-032\r\n```\r\n\r\nnÃ£o podem continuar 
como:\r\n\r\n```text\r\nIDENTIFIER_ONLY_OBJECT\r\n```\r\n\r\nPara cada um deve existir conteÃºdo material 
real.\r\n\r\nEstrutura mÃnima:\r\n\r\n```json\r\n{\r\n  \"object_id\": \"DR-XXX\",\r\n  \"object_type\": 
\"DECISION_RULE\",\r\n  \"title\": \"\",\r\n  \"domain\": \"HEALTHCARE\",\r\n  \"jurisdiction\": \"AO\",\r\n  
\"subdomain\": \"\",\r\n  \"content\": \"\",\r\n  \"rule_expression\": \"\",\r\n  \"source_ids\": [],\r\n  
\"legal_instrument\": \"\",\r\n  \"article_or_section\": \"\",\r\n  \"effective_from\": \"\",\r\n  \"effective_to\": 
null,\r\n  \"legal_status\": \"\",\r\n  \"version\": \"\",\r\n  \"hash_sha256\": \"\",\r\n  \"validation_status\": 
\"\"\r\n}\r\n```\r\n\r\n---\r\n\r\n# 12. ProibiÃ§Ã£o de ConteÃºdo SintÃ©tico\r\n\r\nNÃ£o criar texto jurÃdico para 
preencher `DR-001...DR-032`.\r\n\r\nO conteÃºdo deve resultar de:\r\n\r\n```text\r\nVERIFIED SOURCE 
DOCUMENT\r\nâ†“\r\nEXTRACTED RELEVANT PROVISION\r\nâ†“\r\nSTRUCTURED RULE\r\nâ†“\r\nPROFESSIONAL 
VALIDATION\r\n```\r\n\r\nSe o documento correspondente nÃ£o for encontrado:\r\n\r\n```text\r\nDR_STATUS = 
BLOCKED_SOURCE_MISSING\r\n```\r\n\r\nNÃ£o inventar.\r\n\r\n---\r\n\r\n# 13. ReconciliaÃ§Ã£o dos 32 Objectos 
HEALTHCARE\r\n\r\nProduzir matriz:\r\n\r\n| DR | ConteÃºdo Antigo | Nova Fonte | Autoridade | Documento | Artigo | 
Hash | Estado JurÃdico | Validado |\r\n| -- | --------------- | ---------- | ---------- | --------- | ------ | ---- | 
--------------- | -------- |\r\n\r\nCobrir:\r\n\r\n```text\r\nDR-001 ... DR-032\r\n```\r\n\r\nTodos os 32 devem 
terminar como:\r\n\r\n```text\r\nVERIFIED\r\n```\r\n\r\nou:\r\n\r\n```text\r\nBLOCKED\r\n```\r\n\r\nNunca:\r\n\r\n```te
xt\r\nASSUMED\r\n```\r\n\r\n---\r\n\r\n# 14. FASE 5 â€” Reconciliar KI-001 a KI-007\r\n\r\nPara cada Knowledge 
Item:\r\n\r\n```text\r\nKI-001 ... KI-007\r\n```\r\n\r\nactualizar apenas mappings 
comprovados.\r\n\r\nEstrutura:\r\n\r\n```text\r\nKI\r\nâ†’ domain\r\nâ†’ required capability\r\nâ†’ structured 
objects\r\nâ†’ canonical sources\r\nâ†’ source authority\r\nâ†’ Employee mappings\r\nâ†’ test 
mappings\r\n```\r\n\r\nEliminar a associaÃ§Ã£o indevida a `SRC-LAB-001` onde nÃ£o houver justificaÃ§Ã£o jurÃ
dica.\r\n\r\n---\r\n\r\n# 15. FASE 6 â€” Corrigir o Knowledge Content Registry\r\n\r\nCada Knowledge Item deve ser 
substantivo e nÃ£o apenas descritivo.\r\n\r\nEvitar:\r\n\r\n```text\r\n\"Item de conhecimento adicionado para 
HEALTHCARE\"\r\n```\r\n\r\nSubstituir por metadados profissionais reais:\r\n\r\n```text\r\nknowledge_item_id\r\ntitle\r
\ndomain\r\nsubdomain\r\npurpose\r\nrequired_sources\r\nstructured_objects\r\njurisdiction\r\neffective_version\r\nauth
ority_requirements\r\nemployee_roles\r\ntest_requirements\r\n```\r\n\r\n---\r\n\r\n# 16. FASE 7 â€” Eliminar 
INDEX_DRIFT\r\n\r\nInvalidar os vectores incorrectos associados a HEALTHCARE.\r\n\r\nNÃ£o preservar embeddings 
conhecidos como errados.\r\n\r\nExecutar:\r\n\r\n```text\r\nIDENTIFY HEALTHCARE VECTOR NAMESPACE\r\nâ†“\r\nEXPORT 
CURRENT MANIFEST\r\nâ†“\r\nMARK WRONG EMBEDDINGS INVALID\r\nâ†“\r\nREMOVE / REBUILD\r\nâ†“\r\nRE-CHUNK VERIFIED 
CONTENT\r\nâ†“\r\nRE-EMBED\r\nâ†“\r\nREINDEX\r\nâ†“\r\nVERIFY\r\n```\r\n\r\nNÃ£o copiar automaticamente embeddings 
antigos.\r\n\r\n---\r\n\r\n# 17. Index Integrity Contract\r\n\r\nPara cada chunk:\r\n\r\n```text\r\nchunk_id\r\nknowled
ge_object_id\r\nstructured_object_id\r\nsource_id\r\nsource_version\r\nsource_hash\r\ncontent_hash\r\nembedding_model\r
\nembedding_timestamp\r\nindex_namespace\r\n```\r\n\r\nCriar regra:\r\n\r\n```text\r\nINDEX_SOURCE_HASH == 
CURRENT_SOURCE_HASH\r\n```\r\n\r\nSe:\r\n\r\n```text\r\nINDEX_SOURCE_HASH != 
CURRENT_SOURCE_HASH\r\n```\r\n\r\nentÃ£o:\r\n\r\n```text\r\nINDEX_STATUS = STALE\r\n```\r\n\r\ne bloquear uso 
regulatÃ³rio.\r\n\r\n---\r\n\r\n# 18. FASE 8 â€” Employee Knowledge Mapping\r\n\r\nReavaliar os Employees que dependem 
de HEALTHCARE.\r\n\r\nNÃ£o limitar a:\r\n\r\n```text\r\nEMP-001\r\nEMP-002\r\nEMP-003\r\n```\r\n\r\nConsultar a tabela 
canÃ³nica dos 500 Employees e determinar:\r\n\r\n```text\r\nquais funÃ§Ãµes realmente requerem 
HEALTHCARE\r\n```\r\n\r\nGerar:\r\n\r\n```text\r\nEmployee\r\nâ†’ Role\r\nâ†’ Required Healthcare Knowledge\r\nâ†’ 
KI\r\nâ†’ DR\r\nâ†’ Source\r\nâ†’ Authority\r\nâ†’ Index Status\r\nâ†’ Test Status\r\n```\r\n\r\nNenhum Employee deve 
receber conhecimento apenas por propagaÃ§Ã£o genÃ©rica sem requisito funcional.\r\n\r\n---\r\n\r\n# 19. FASE 9 â€” 
CorrecÃ§Ã£o do Source Router\r\n\r\nModificar o Source Router para incorporar:\r\n\r\n```text\r\ndomain\r\njurisdiction
\r\nsource_authority\r\ntrust_tier\r\nlegal_status\r\ncurrentness\r\nknowledge_availability\r\n```\r\n\r\nOrdem 
obrigatÃ³ria para consulta regulatÃ³ria:\r\n\r\n```text\r\n1. Canonical Knowledge Registry\r\n2. Verified Source 
Registry\r\n3. Official Source Snapshot\r\n4. Approved authoritative external acquisition\r\n5. Human 
Review\r\n```\r\n\r\n---\r\n\r\n# 20. Regra Proibida no Source Router\r\n\r\nNÃ£o permitir:\r\n\r\n```text\r\n1. 
Knowledge Registry\r\n2. OneDrive\r\n3. C:\\\r\n4. qualquer PDF encontrado\r\n```\r\n\r\npara tarefas 
regulatÃ³rias.\r\n\r\nSe alguma regra assim continuar activa:\r\n\r\n```text\r\nSOURCE_ROUTING_GATE = 
FAIL\r\n```\r\n\r\n---\r\n\r\n# 21. Regulatory Query Classifier\r\n\r\nImplementar classificaÃ§Ã£o explÃ
cita:\r\n\r\n```text\r\nis_regulatory_query = true/false\r\n```\r\n\r\nDomÃnios mÃnimos:\r\n\r\n```text\r\nHEALTH_REGUL
ATORY\r\nTAX_REGULATORY\r\nLABOR_REGULATORY\r\nBANKING_REGULATORY\r\nACCOUNTING_REGULATORY\r\nLEGAL\r\nCOMPLIANCE\r\n``
`\r\n\r\nSe:\r\n\r\n```text\r\nis_regulatory_query = 
true\r\n```\r\n\r\nentÃ£o:\r\n\r\n```text\r\nUNVERIFIED_LOCAL_FILE_FALLBACK = FORBIDDEN\r\n```\r\n\r\n---\r\n\r\n# 22. 
Fallback Control Contract\r\n\r\nFallback permitido:\r\n\r\n```text\r\nCANONICAL KNOWLEDGE\r\nâ†’ VERIFIED EXTERNAL 
AUTHORITY\r\nâ†’ CONTROLLED INGESTION\r\nâ†’ VALIDATION\r\nâ†’ RETRY\r\n```\r\n\r\nFallback 
proibido:\r\n\r\n```text\r\nCANONICAL KNOWLEDGE\r\nâ†’ USER FOLDER\r\nâ†’ RANDOM PDF\r\nâ†’ 
ANSWER\r\n```\r\n\r\n---\r\n\r\n# 23. FASE 10 â€” Runtime Provenance Trace\r\n\r\nCada resposta regulatÃ³ria deve 
produzir internamente:\r\n\r\n```text\r\nruntime_execution_id\r\nemployee_id\r\ndomain\r\njurisdiction\r\nknowledge_ite
m_ids\r\nstructured_object_ids\r\nsource_ids\r\nauthority\r\nsource_version\r\nchunk_ids\r\nretrieval_scores\r\nfallbac
k_events\r\nanswer\r\ncitations\r\ntimestamp\r\n```\r\n\r\n---\r\n\r\n# 24. Cinco Testes MINSA 
Originais\r\n\r\nReexecutar exactamente os mesmos:\r\n\r\n```text\r\nMINSA_RUNTIME_TESTS_EXECUTED = 
5\r\n```\r\n\r\nque anteriormente resultaram:\r\n\r\n```text\r\nMINSA_RUNTIME_TESTS_PASS = 0\r\n```\r\n\r\nNÃ£o 
substituir por testes mais simples.\r\n\r\nResultado exigido:\r\n\r\n```text\r\n5 / 5 PASS\r\n```\r\n\r\nCada teste 
deve demonstrar:\r\n\r\n```text\r\ncorrect_domain\r\ncorrect_jurisdiction\r\ncorrect_knowledge_object\r\ncorrect_struct
ured_rule\r\ncorrect_authoritative_source\r\ncorrect_content\r\ncorrect_index\r\ncorrect_runtime_retrieval\r\ncorrect_a
nswer\r\ncomplete_provenance\r\n```\r\n\r\n---\r\n\r\n# 25. CritÃ©rios MINSA de AprovaÃ§Ã£o\r\n\r\nPara cada um dos 
cinco testes:\r\n\r\n```text\r\nONEDRIVE_FALLBACK = 0\r\nC_DRIVE_FALLBACK = 0\r\nUNVERIFIED_SOURCE = 
0\r\nWRONG_AUTHORITY = 0\r\nIDENTIFIER_ONLY_OBJECT = 0\r\nINDEX_DRIFT = 0\r\nBROKEN_PROVENANCE = 
0\r\n```\r\n\r\n---\r\n\r\n# 26. NÃ£o Confundir Resposta Correcta com PASS\r\n\r\nMesmo que a resposta textual esteja 
correcta:\r\n\r\n```text\r\nANSWER_CORRECT = TRUE\r\n```\r\n\r\no teste deve falhar se:\r\n\r\n```text\r\nSOURCE_WRONG\
r\nOR\r\nPROVENANCE_MISSING\r\nOR\r\nUNCONTROLLED_FALLBACK\r\nOR\r\nCONTENT_NOT_CANONICAL\r\n```\r\n\r\nPortanto:\r\n\r
\n```text\r\nCORRECT_ANSWER_WITHOUT_PROVENANCE != PASS\r\n```\r\n\r\n---\r\n\r\n# 27. FASE 11 â€” Teste 
Negativo\r\n\r\nTestar explicitamente:\r\n\r\n```text\r\nknowledge unavailable\r\n```\r\n\r\nO Employee deve responder 
de forma 
controlada:\r\n\r\n```text\r\nKNOWLEDGE_GAP\r\n```\r\n\r\nou:\r\n\r\n```text\r\nHUMAN_REVIEW_REQUIRED\r\n```\r\n\r\nem 
vez de improvisar.\r\n\r\nEste teste deve ser obrigatÃ³rio.\r\n\r\n---\r\n\r\n# 28. FASE 12 â€” Teste de Fonte 
Adulterada\r\n\r\nInserir em ambiente controlado um ficheiro local com nome plausÃvel, por 
exemplo:\r\n\r\n```text\r\nlegislacao_minsa_actualizada.pdf\r\n```\r\n\r\nmas sem autoridade validada.\r\n\r\nO 
sistema deve:\r\n\r\n```text\r\nREJECT_AS_AUTHORITATIVE_SOURCE\r\n```\r\n\r\nMesmo que 
esteja:\r\n\r\n```text\r\nOneDrive\r\nC:\\\r\nGoogle Drive\r\n```\r\n\r\n---\r\n\r\n# 29. FASE 13 â€” Teste de 
Documento Revogado\r\n\r\nIntroduzir uma fonte marcada 
como:\r\n\r\n```text\r\nREPEALED\r\nSUPERSEDED\r\nSTALE\r\n```\r\n\r\nO runtime nÃ£o deve utilizÃ¡-la como regra 
vigente.\r\n\r\nResultado obrigatÃ³rio:\r\n\r\n```text\r\nLEGAL_CURRENTNESS_GATE = PASS\r\n```\r\n\r\n---\r\n\r\n# 30. 
FASE 14 â€” Auditoria Horizontal apÃ³s MINSA\r\n\r\nSÃ³ depois de HEALTHCARE passar, verificar os domÃnios que 
utilizaram a mesma lÃ³gica de `SRC-LAB-001`.\r\n\r\nPesquisar:\r\n\r\n```text\r\nall knowledge_items where source_id = 
SRC-LAB-001\r\n```\r\n\r\nClassificar cada 
associaÃ§Ã£o:\r\n\r\n```text\r\nVALID\r\nINVALID\r\nMIXED\r\nUNRESOLVED\r\n```\r\n\r\n---\r\n\r\n# 31. DomÃnios 
PrioritÃ¡rios para VerificaÃ§Ã£o Horizontal\r\n\r\nVerificar especialmente:\r\n\r\n```text\r\nHUMAN_RESOURCES\r\nLOGIST
ICS\r\nCYBERSECURITY\r\nDATA_PRIVACY\r\nCOMPLIANCE\r\nENVIRONMENTAL\r\nMARKETING\r\nSALES\r\nCUSTOMER_SUCCESS\r\n```\r\
n\r\nNÃ£o assumir que todos estÃ£o errados.\r\n\r\nAuditar mapping por mapping.\r\n\r\n---\r\n\r\n# 32. Regra de 
PropagaÃ§Ã£o\r\n\r\nUma correcÃ§Ã£o validada pode ser propagada apenas quando:\r\n\r\n```text\r\nsame_root_cause = 
true\r\n```\r\n\r\ne:\r\n\r\n```text\r\nsame_semantic_fix = true\r\n```\r\n\r\nNÃ£o efectuar propagaÃ§Ã£o 
cega.\r\n\r\n---\r\n\r\n# 33. FASE 15 â€” ReconciliaÃ§Ã£o da Cardinalidade Aberta\r\n\r\nPreservar como questÃ£o 
separada:\r\n\r\n```text\r\n89 physical KIs\r\nvs\r\n91 previously declared KIs\r\n```\r\n\r\nNÃ£o utilizar a 
remediaÃ§Ã£o HEALTHCARE para alterar essa contagem.\r\n\r\nGerar:\r\n\r\n```text\r\nAETF500_89_vs_91_Knowledge_Item_Exc
eption_Reconciliation_v1.0.json\r\n```\r\n\r\nDeterminar se:\r\n\r\n```text\r\nKI-090 / KI-091\r\n```\r\n\r\nexistem 
fisicamente ou se o nÃºmero 91 pertencia a outra mÃ©trica.\r\n\r\n---\r\n\r\n# 34. FASE 16 â€” RevalidaÃ§Ã£o dos 500 
Employees\r\n\r\nNÃ£o declarar:\r\n\r\n```text\r\n500/500 RECERTIFIED\r\n```\r\n\r\na partir de uma contagem 
agregada.\r\n\r\nPara cada Employee relevante:\r\n\r\n```text\r\nemployee_id\r\nrole\r\nrequired_competencies\r\nrequir
ed_knowledge\r\nactual_knowledge\r\nsource_status\r\nmapping_status\r\nindex_status\r\nruntime_test_status\r\nfinal_sta
tus\r\n```\r\n\r\n---\r\n\r\n# 35. Estados de Employee\r\n\r\nUtilizar:\r\n\r\n```text\r\nRECERTIFIED\r\nRECERTIFIED_WI
TH_SUPERVISION\r\nBLOCKED_KNOWLEDGE_GAP\r\nBLOCKED_SOURCE_PROVENANCE\r\nBLOCKED_INDEX_FAILURE\r\nNOT_AFFECTED\r\n```\r\
n\r\n---\r\n\r\n# 36. NÃ£o Invalidar DomÃnios NÃ£o Afectados sem EvidÃªncia\r\n\r\nA correcÃ§Ã£o deve ser 
cirÃºrgica.\r\n\r\nNÃ£o declarar toda a plataforma 
invÃ¡lida.\r\n\r\nUtilizar:\r\n\r\n```text\r\nAFFECTED_DOMAIN_CERTIFICATION = SUSPENDED\r\n```\r\n\r\nquando houver 
evidÃªncia.\r\n\r\nPreservar:\r\n\r\n```text\r\nUNAFFECTED_DOMAIN_STATUS\r\n```\r\n\r\natÃ© existir motivo material 
para alteraÃ§Ã£o.\r\n\r\n---\r\n\r\n# 37. Gates de RemediaÃ§Ã£o\r\n\r\nCriar:\r\n\r\n```text\r\nP0_CONTAINMENT_GATE\r\n
SOURCE_REGISTRY_REPAIR_GATE\r\nSOURCE_AUTHORITY_REPAIR_GATE\r\nHEALTHCARE_CONTENT_RECONSTRUCTION_GATE\r\nSTRUCTURED_OBJ
ECT_REPAIR_GATE\r\nINDEX_REBUILD_GATE\r\nEMPLOYEE_MAPPING_REPAIR_GATE\r\nSOURCE_ROUTER_REPAIR_GATE\r\nREGULATORY_FALLBA
CK_CONTROL_GATE\r\nRUNTIME_PROVENANCE_GATE\r\nMINSA_REGRESSION_GATE\r\nHORIZONTAL_CONTAMINATION_GATE\r\nLEGAL_CURRENTNE
SS_GATE\r\n```\r\n\r\n---\r\n\r\n# 38. Estados 
Permitidos\r\n\r\nSomente:\r\n\r\n```text\r\nPASS\r\nFAIL\r\nPARTIAL\r\nBLOCKED\r\nNOT_PROVEN\r\n```\r\n\r\nProibido 
criar:\r\n\r\n```text\r\nPASS_ASSUMED\r\nPASS_BY_DESIGN\r\nPASS_BY_IMPLEMENTATION\r\n```\r\n\r\n---\r\n\r\n# 39. 
Master Remediation Gate\r\n\r\nCriar:\r\n\r\n`AETF500_P0_KNOWLEDGE_PROVENANCE_REMEDIATION_MASTER_GATE_v1.0`\r\n\r\nO 
estado `P0_CRITICAL_FAIL` sÃ³ pode desaparecer se:\r\n\r\n```text\r\nP0_CONTAINMENT_GATE = PASS\r\nAND 
SOURCE_REGISTRY_REPAIR_GATE = PASS\r\nAND SOURCE_AUTHORITY_REPAIR_GATE = PASS\r\nAND 
HEALTHCARE_CONTENT_RECONSTRUCTION_GATE = PASS\r\nAND STRUCTURED_OBJECT_REPAIR_GATE = PASS\r\nAND INDEX_REBUILD_GATE = 
PASS\r\nAND EMPLOYEE_MAPPING_REPAIR_GATE = PASS\r\nAND SOURCE_ROUTER_REPAIR_GATE = PASS\r\nAND 
REGULATORY_FALLBACK_CONTROL_GATE = PASS\r\nAND RUNTIME_PROVENANCE_GATE = PASS\r\nAND MINSA_REGRESSION_GATE = 
PASS\r\nAND LEGAL_CURRENTNESS_GATE = PASS\r\n```\r\n\r\n---\r\n\r\n# 40. Regra de NÃ£o Auto-PromoÃ§Ã£o\r\n\r\nA 
implementaÃ§Ã£o de uma correcÃ§Ã£o nÃ£o altera automaticamente o gate.\r\n\r\nExemplo 
proibido:\r\n\r\n```text\r\nrouter patched\r\nâ†’ SOURCE_ROUTER_GATE = PASS\r\n```\r\n\r\nFluxo 
obrigatÃ³rio:\r\n\r\n```text\r\nrouter patched\r\nâ†’ tests executed\r\nâ†’ raw evidence captured\r\nâ†’ expected vs 
actual compared\r\nâ†’ PASS/FAIL calculated\r\n```\r\n\r\n---\r\n\r\n# 41. Evidence-First Recertification\r\n\r\nCada 
`PASS` deve possuir:\r\n\r\n```text\r\nrequirement\r\ntest_id\r\nexecution_id\r\nexpected_result\r\nactual_result\r\nra
w_evidence\r\nsource_hashes\r\napplication_version\r\ntimestamp\r\n```\r\n\r\nSem estes campos:\r\n\r\n```text\r\nGATE 
= NOT_PROVEN\r\n```\r\n\r\n---\r\n\r\n# 42. Rollback\r\n\r\nToda alteraÃ§Ã£o deve possuir:\r\n\r\n```text\r\nchange_id\
r\nbefore_hash\r\nafter_hash\r\nrollback_artifact\r\nrollback_command\r\nrollback_test\r\n```\r\n\r\nSe qualquer 
correcÃ§Ã£o causar regressÃ£o:\r\n\r\n```text\r\nROLLBACK_REQUIRED\r\n```\r\n\r\n---\r\n\r\n# 43. EntregÃ¡veis 
ObrigatÃ³rios\r\n\r\nGerar em `generated/`:\r\n\r\n```text\r\nAETF500_P0_Pre_Remediation_Forensic_Snapshot_v1.0.json\r\
n\r\nAETF500_SRC_LAB_001_Usage_Reconciliation_v1.0.json\r\n\r\nAETF500_Healthcare_Authoritative_Source_Registry_v1.0.js
on\r\n\r\nAETF500_Healthcare_DR001_DR032_Content_Reconstruction_v1.0.json\r\n\r\nAETF500_Healthcare_Source_to_Structure
d_Object_Matrix_v1.0.json\r\n\r\nAETF500_Healthcare_Index_Rebuild_Manifest_v1.0.json\r\n\r\nAETF500_Healthcare_Employee
_Knowledge_Mapping_v1.0.json\r\n\r\nAETF500_Regulatory_Source_Router_Remediation_v1.0.json\r\n\r\nAETF500_Regulatory_Fa
llback_Control_Policy_v1.0.json\r\n\r\nAETF500_MINSA_Runtime_Regression_Results_v1.0.json\r\n\r\nAETF500_MINSA_Runtime_
Provenance_Trace_v1.0.json\r\n\r\nAETF500_SRC_LAB_001_Horizontal_Impact_Assessment_v1.0.json\r\n\r\nAETF500_89_vs_91_Kn
owledge_Item_Exception_Reconciliation_v1.0.json\r\n\r\nAETF500_P0_Knowledge_Provenance_Remediation_Final_Report_v1.0.md
\r\n\r\nAETF500_P0_KNOWLEDGE_PROVENANCE_REMEDIATION_MASTER_GATE_v1.0.json\r\n```\r\n\r\n---\r\n\r\n# 44. Manifesto Crip
togrÃ¡fico\r\n\r\nCriar:\r\n\r\n`AETF500_P0_Knowledge_Provenance_Remediation_Evidence_Manifest_v1.0.json`\r\n\r\nPara 
cada artefacto:\r\n\r\n```text\r\nfile_name\r\nphysical_path\r\nbyte_size\r\nsha256\r\nrecord_count\r\ncreated_at\r\npr
oduced_by\r\nevidence_role\r\n```\r\n\r\nProibidos 
placeholders:\r\n\r\n```text\r\nWILL_BE_COMPUTED\r\nTBD\r\nUNKNOWN\r\nN/A\r\n```\r\n\r\npara campos obrigatÃ³rios de 
evidÃªncia.\r\n\r\n---\r\n\r\n# 45. Matriz Final HEALTHCARE\r\n\r\nProduzir:\r\n\r\n| KI | Structured Objects | Fonte 
Autoritativa | ConteÃºdo Real | Hash | Index | Employees | Runtime | ProveniÃªncia | Estado |\r\n| -- | 
------------------ | ------------------ | ------------- | ---- | ----- | --------- | ------- | ------------ | ------ 
|\r\n\r\nCobertura obrigatÃ³ria:\r\n\r\n```text\r\nKI-001 ... KI-007\r\nDR-001 ... DR-032\r\n```\r\n\r\n---\r\n\r\n# 
46. Matriz Source Router\r\n\r\nProduzir:\r\n\r\n| Query Type | Domain | Jurisdiction | Primary Source | Fallback 
Permitido | Fallback Proibido | Teste | Resultado |\r\n| ---------- | ------ | ------------ | -------------- | 
------------------ | ----------------- | ----- | --------- |\r\n\r\nIncluir 
obrigatoriamente:\r\n\r\n```text\r\nMINSA\r\nAGT\r\nBNA\r\nMAPTSS\r\nMINFIN\r\nOCPCA\r\n```\r\n\r\nquando tecnicamente 
aplicÃ¡vel.\r\n\r\n---\r\n\r\n# 47. MÃ©tricas Executivas Finais\r\n\r\nO relatÃ³rio deve terminar 
com:\r\n\r\n```text\r\nHEALTHCARE_KI_TOTAL =\r\nHEALTHCARE_KI_REPAIRED =\r\nHEALTHCARE_KI_BLOCKED 
=\r\n\r\nHEALTHCARE_STRUCTURED_OBJECTS_TOTAL =\r\nHEALTHCARE_STRUCTURED_OBJECTS_WITH_VERIFIED_CONTENT 
=\r\nHEALTHCARE_IDENTIFIER_ONLY_OBJECTS_REMAINING =\r\n\r\nAUTHORITATIVE_HEALTHCARE_SOURCES 
=\r\nSOURCES_WITH_COMPLETE_PROVENANCE =\r\nSOURCES_WITH_VALID_HASH =\r\nSOURCES_WITH_CURRENT_STATUS_VERIFIED 
=\r\n\r\nHEALTHCARE_INDEX_OBJECTS =\r\nINDEX_MISMATCHES_REMAINING =\r\n\r\nEMPLOYEES_AFFECTED =\r\nEMPLOYEES_RETESTED 
=\r\nEMPLOYEES_RECERTIFIED =\r\nEMPLOYEES_BLOCKED =\r\n\r\nMINSA_RUNTIME_TESTS_EXECUTED =\r\nMINSA_RUNTIME_TESTS_PASS 
=\r\nMINSA_RUNTIME_TESTS_FAIL =\r\n\r\nONEDRIVE_UNCONTROLLED_FALLBACKS =\r\nC_DRIVE_UNCONTROLLED_FALLBACKS 
=\r\nUNVERIFIED_REGULATORY_SOURCE_USAGE =\r\n\r\nBROKEN_SOURCE_REFERENCES_REMAINING =\r\nBROKEN_PROVENANCE_REMAINING 
=\r\nIDENTIFIER_ONLY_OBJECTS_REMAINING =\r\n\r\n89_VS_91_EXCEPTION_STATUS =\r\n\r\nMASTER_REMEDIATION_GATE 
=\r\n```\r\n\r\n---\r\n\r\n# 48. CondiÃ§Ã£o de SaÃda do P0\r\n\r\nNÃ£o 
remover:\r\n\r\n```text\r\nP0_CRITICAL_FAIL\r\n```\r\n\r\nse existir qualquer uma das seguintes condiÃ§Ãµes em 
HEALTHCARE:\r\n\r\n```text\r\nIDENTIFIER_ONLY_OBJECT > 0\r\nBROKEN_PROVENANCE > 0\r\nWRONG_AUTHORITY > 
0\r\nINDEX_DRIFT > 0\r\nUNCONTROLLED_REGULATORY_FALLBACK > 0\r\nMINSA_RUNTIME_TEST_FAILURE > 
0\r\nUNVERIFIED_CURRENTNESS > 0\r\n```\r\n\r\n---\r\n\r\n# 49. CritÃ©rio MÃnimo para HEALTHCARE 
PASS\r\n\r\nExigir:\r\n\r\n```text\r\nDR-001 ... DR-032 = CONTENT VERIFIED OR EXPLICITLY BLOCKED\r\n```\r\n\r\nPara 
objectos necessÃ¡rios aos cinco testes MINSA:\r\n\r\n```text\r\nCONTENT VERIFIED = TRUE\r\nSOURCE AUTHORITY VERIFIED = 
TRUE\r\nSOURCE HASH VALID = TRUE\r\nINDEX VALID = TRUE\r\nEMPLOYEE MAPPING VALID = TRUE\r\nRUNTIME RETRIEVAL VALID = 
TRUE\r\nPROVENANCE TRACE COMPLETE = TRUE\r\n```\r\n\r\ne:\r\n\r\n```text\r\nMINSA_RUNTIME_TESTS_PASS = 
5/5\r\n```\r\n\r\n---\r\n\r\n# 50. Regra para Conhecimento Ainda NÃ£o Obtido\r\n\r\nSe determinada legislaÃ§Ã£o 
necessÃ¡ria nÃ£o estiver disponÃvel ou nÃ£o puder ser validada:\r\n\r\nnÃ£o improvisar.\r\n\r\nRegistar:\r\n\r\n```text
\r\nKNOWLEDGE_GAP_ID\r\nrequired_document\r\nrequired_authority\r\njurisdiction\r\naffected_knowledge_objects\r\naffect
ed_employees\r\nrisk\r\nacquisition_status\r\nvalidation_required\r\n```\r\n\r\nEstado:\r\n\r\n```text\r\nBLOCKED_PENDI
NG_AUTHORITATIVE_SOURCE\r\n```\r\n\r\n---\r\n\r\n# 51. Missing Knowledge Procurement Backlog\r\n\r\nGerar ou 
actualizar:\r\n\r\n`AETF500_Missing_Knowledge_Procurement_Backlog_v1.0.json`\r\n\r\nPara cada gap:\r\n\r\n```text\r\nga
p_id\r\ndomain\r\nsubdomain\r\njurisdiction\r\nemployee_ids\r\nknowledge_requirement\r\nrequired_legal_instrument\r\nau
thority\r\npreferred_official_source\r\ncurrent_source_status\r\npriority\r\nrisk\r\nacquisition_method\r\nvalidation_o
wner\r\ningestion_required\r\nindexing_required\r\nruntime_test_required\r\nstatus\r\n```\r\n\r\n---\r\n\r\n# 52. 
CorrecÃ§Ã£o SistÃ©mica apÃ³s HEALTHCARE\r\n\r\nSomente depois de HEALTHCARE 
demonstrar:\r\n\r\n```text\r\nP6_RUNTIME_PROVENANCE_VERIFIED\r\n```\r\n\r\naplicar o padrÃ£o validado aos restantes 
domÃnios afectados.\r\n\r\nFluxo:\r\n\r\n```text\r\nHEALTHCARE FIX\r\nâ†’ RUNTIME PROOF\r\nâ†’ ROOT CAUSE 
CONFIRMED\r\nâ†’ REUSABLE FIX IDENTIFIED\r\nâ†’ HORIZONTAL IMPACT ANALYSIS\r\nâ†’ CONTROLLED PROPAGATION\r\nâ†’ 
DOMAIN-BY-DOMAIN RETEST\r\n```\r\n\r\n---\r\n\r\n# 53. Regra de PropagaÃ§Ã£o para os 500 Employees\r\n\r\nNenhuma 
melhoria deve ser considerada propagada apenas porque o cÃ³digo comum foi 
alterado.\r\n\r\nExigir:\r\n\r\n```text\r\naffected_employee_set\r\n==\r\nretested_employee_set\r\n```\r\n\r\nquando o 
risco e o impacto justificarem teste integral.\r\n\r\nPara Ã¡reas regulatÃ³rias crÃticas:\r\n\r\n```text\r\n100% 
affected Employees must be retested\r\n```\r\n\r\n---\r\n\r\n# 54. Final Truth Gate\r\n\r\nO programa deve produzir 
uma conclusÃ£o final exclusivamente baseada em evidÃªncia:\r\n\r\n```text\r\nP0_CRITICAL_FAIL\r\n```\r\n\r\nou:\r\n\r\n
```text\r\nP0_REMEDIATED_WITH_RESTRICTIONS\r\n```\r\n\r\nou:\r\n\r\n```text\r\nP0_REMEDIATED_AND_FORENSICALLY_VERIFIED\
r\n```\r\n\r\nNunca promover directamente 
de:\r\n\r\n```text\r\nP0_CRITICAL_FAIL\r\n```\r\n\r\npara:\r\n\r\n```text\r\nPASS\r\n```\r\n\r\nsem etapa de 
verificaÃ§Ã£o pÃ³s-remediaÃ§Ã£o.\r\n\r\n---\r\n\r\n# 55. CritÃ©rio para 
P0_REMEDIATED_AND_FORENSICALLY_VERIFIED\r\n\r\nSomente permitir:\r\n\r\n```text\r\nP0_REMEDIATED_AND_FORENSICALLY_VERIF
IED\r\n```\r\n\r\nquando:\r\n\r\n```text\r\nAUTHORITATIVE_SOURCE\r\nâ†’ CONTENT\r\nâ†’ STRUCTURED OBJECT\r\nâ†’ 
INDEX\r\nâ†’ EMPLOYEE\r\nâ†’ RUNTIME\r\nâ†’ ANSWER\r\nâ†’ PROVENANCE\r\n```\r\n\r\nfor demonstrado ponta-a-ponta nos 
testes reais.\r\n\r\n---\r\n\r\n# 56. DeclaraÃ§Ã£o Final ObrigatÃ³ria\r\n\r\nO relatÃ³rio final deve responder 
textualmente:\r\n\r\n> O que estava errado?\r\n\r\n> Qual foi a causa raiz?\r\n\r\n> Quais fontes foram 
corrigidas?\r\n\r\n> Quais Knowledge Items foram corrigidos?\r\n\r\n> Quais Structured Objects receberam conteÃºdo 
substantivo?\r\n\r\n> Quais documentos oficiais suportam agora HEALTHCARE?\r\n\r\n> Qual conhecimento continua em 
falta?\r\n\r\n> Que Employees foram afectados?\r\n\r\n> Que Employees foram recertificados?\r\n\r\n> O Ãndice foi 
reconstruÃdo?\r\n\r\n> O Source Router deixou de procurar fontes regulatÃ³rias indiscriminadamente no OneDrive e no 
disco C:?\r\n\r\n> Os cinco testes MINSA passaram utilizando exclusivamente a cadeia de conhecimento 
autorizada?\r\n\r\n> Existe algum P0, P1 ou gap regulatÃ³rio aberto?\r\n\r\n> O problema encontrado em MINSA 
propagava-se a outros domÃnios?\r\n\r\n> Quais desses domÃnios foram corrigidos e quais permanecem 
bloqueados?\r\n\r\n---\r\n\r\n# 57. Regra Suprema do Programa\r\n\r\nNÃ£o optimizar 
para:\r\n\r\n```text\r\nPASS\r\n```\r\n\r\nOptimizar para:\r\n\r\n```text\r\nTRUTH\r\n+\r\nCORRECTNESS\r\n+\r\nPROVENAN
CE\r\n+\r\nREPRODUCIBILITY\r\n+\r\nAUDITABILITY\r\n```\r\n\r\nA correcÃ§Ã£o sÃ³ estÃ¡ concluÃda quando a plataforma 
deixa de apenas \"saber responder\" e passa a ser capaz de provar:\r\n\r\n> **o que sabe, de que fonte sabe, qual 
versÃ£o utilizou, qual autoridade sustenta a informaÃ§Ã£o, como o conhecimento entrou na plataforma, como foi 
indexado, que Employee o recebeu e qual conhecimento exacto sustentou a resposta produzida em 
runtime.**\r\n\r\n```\r\n\r\nEste prompt tambÃ©m fecha uma vulnerabilidade importante: **uma correcÃ§Ã£o de cÃ³digo 
jÃ¡ nÃ£o pode promover automaticamente o gate para `PASS`**. Primeiro corrige-se, depois reexecutam-se os mesmos 
testes que falharam, preserva-se a evidÃªncia bruta e sÃ³ entÃ£o se decide a 
recertificaÃ§Ã£o.\r\n```\r\n\n</USER_REQUEST>\n<ADDITIONAL_METADATA>\nThe current local time is: 
2026-09-13T09:53:24+01:00.\n</ADDITIONAL_METADATA>"}
{"step_index":11447,"source":"MODEL","type":"PLANNER_RESPONSE","status":"DONE","created_at":"2026-09-13T08:53:53Z","thi
nking":"**Drafting Implementation Plan**\n\nI'm now drafting the `implementation_plan.md` artifact. This plan details 
the technical implementation strategy for the 
`AETF500_P0_KNOWLEDGE_PROVENANCE_SOURCE_AUTHORITY_CONTENT_RECONSTRUCTION_REGULATORY_ROUTER_REMEDIATION_v1.0` project.\n
\n\n","tool_calls":[{"name":"write_to_file","args":{"ArtifactMetadata":{"RequestFeedback":true,"Summary":"Implementatio
n plan for AETF-500 P0 Knowledge Provenance, Source Authority, Content Reconstruction & Regulatory Router Remediation 
v1.0","UserFacing":true},"CodeContent":"# Implementation Plan â€” P0 Knowledge Remediation v1.0\n## AETF500_P0_KNOWLEDG
E_PROVENANCE_SOURCE_AUTHORITY_CONTENT_RECONSTRUCTION_REGULATORY_ROUTER_REMEDIATION_v1.0\n\nExecution of a controlled, 
evidence-based, audit-traceable remediation program to resolve all root causes identified in 
`AETF500_SOURCE_REGISTRY_KNOWLEDGE_CONTENT_RUNTIME_PROVENANCE_FORENSIC_AUDIT_v1.0`.\n\n## User Review Required\n\n> 
[!IMPORTANT]\n> **Audit & Remediation Constraints Enforced**:\n> - `BASELINE_MUTATION_ALLOWED = false` 
(`AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN` remains **100% frozen**).\n> - `NO_EVIDENCE = NO_PASS` & 
`NO_AUTHORITATIVE_SOURCE = NO_REGULATORY_KNOWLEDGE`.\n> - Prohibited: `INVENT_KNOWLEDGE = TRUE`, 
`AUTO_PASS_FAILED_GATES = TRUE`, `USE_LOCAL_FILE_AS_AUTHORITY = TRUE`, `USE_ONEDRIVE_AS_AUTHORITY = TRUE`.\n> - The 
status transition goes strictly from `P0_CRITICAL_FAIL` to `P0_REMEDIATED_AND_FORENSICALLY_VERIFIED` upon 100% 
physical runtime proof.\n\n## Proposed Remediation Architecture & Execution Steps\n\n### 1. Phase 0 â€” 
Pre-Remediation Snapshot\n- Generate `AETF500_P0_Pre_Remediation_Forensic_Snapshot_v1.0.json` capturing the exact git 
commit, build state, registry hashes, vector index state, and failure baseline before modifying any code.\n\n### 2. 
Phase 1 â€” Immediate Execution Containment\n- Suspend autonomous regulatory query execution for `HEALTHCARE` until 
full verification.\n- Enforce `UNVERIFIED_LOCAL_FILE_FALLBACK = FORBIDDEN` for all regulatory queries in 
`SourceRouter`.\n- Change miss behavior to `CANONICAL_KNOWLEDGE_MISS` $\\rightarrow$ `KNOWLEDGE_GAP_DETECTED` 
$\\rightarrow$ `CONTROLLED_SOURCE_ACQUISITION` or `HUMAN_REVIEW_REQUIRED`.\n\n### 3. Phase 2 â€” `SRC-LAB-001` Usage 
Reconciliation\n- Reconcile `SRC-LAB-001` (Lei Geral do Trabalho de Angola Lei n.Âº 12/23): preserve as valid source 
for `HUMAN_RESOURCES` domain.\n- Remove invalid default mappings to `HEALTHCARE`, `CYBERSECURITY`, `DATA_PRIVACY`, 
`LOGISTICS`, `COMPLIANCE`.\n- Generate `AETF500_SRC_LAB_001_Usage_Reconciliation_v1.0.json`.\n\n### 4. Phase 3 & 4 â€” 
Healthcare Source Registry & Content Reconstruction (`DR-001` .. `DR-032`)\n- Bind domain `HEALTHCARE` to 
authoritative source `SRC-HC-001` (Estatuto OrgÃ¢nico do MINSA, PDF size: 2.145.588 bytes, SHA256: 
`89c450d16444b97b7ad6efd6a372cced1255e9cc617411d4d20eef0874942d2b`).\n- Reconstruct `DR-001` .. `DR-032` with 
substantive healthcare regulatory decision rules (organisational structure, hospital licensing, nursing careers, 
medical statute, health inspection, biosafety).\n- Generate 
`AETF500_Healthcare_Authoritative_Source_Registry_v1.0.json` & 
`AETF500_Healthcare_DR001_DR032_Content_Reconstruction_v1.0.json`.\n\n### 5. Phase 5, 6 & 7 â€” Knowledge Content & 
Index Rebuild\n- Rebind `KI-001` .. `KI-007` to `DR-001` .. `DR-032` and `SRC-HC-001`.\n- Invalidate old invalid 
embeddings (`INDEX_DRIFT` purge), re-chunk, re-embed, and re-index `SRC-HC-001` canonical content.\n- Enforce 
contract: `INDEX_SOURCE_HASH == CURRENT_SOURCE_HASH`.\n- Generate 
`AETF500_Healthcare_Index_Rebuild_Manifest_v1.0.json` & 
`AETF500_Healthcare_Employee_Knowledge_Mapping_v1.0.json`.\n\n### 6. Phase 8 & 9 â€” Source Router & Fallback Control 
Remediation\n- Modify `SourceRouter` to introduce `RegulatoryQueryClassifier`.\n- Enforce strict priority for 
regulatory queries:\n  1. Canonical Knowledge Registry\n  2. Verified Source Registry\n  3. Official Source Snapshot\n 
 4. Approved authoritative external acquisition\n  5. Human Review\n- Prohibit any fallback to `OneDrive`, `Google 
Drive`, `C:\\`, or unverified local files.\n- Generate `AETF500_Regulatory_Source_Router_Remediation_v1.0.json` & 
`AETF500_Regulatory_Fallback_Control_Policy_v1.0.json`.\n\n### 7. Phase 10 & 11 â€” Runtime Regression Testing (5 
MINSA Queries + Negative / Tampered / Stale Tests)\n- Re-run all 5 MINSA runtime tests:\n  1. Hospital licensing 
requirements\n  2. MINSA organizational structure & responsibilities\n  3. Medical career regulations\n  4. Nursing 
career regulations\n  5. Biosafety & health inspection rules\n- Re-verify:\n  - `ONEDRIVE_FALLBACK = 0`\n  - 
`C_DRIVE_FALLBACK = 0`\n  - `UNVERIFIED_SOURCE = 0`\n  - `INDEX_DRIFT = 0`\n  - `MINSA_RUNTIME_TESTS_PASS = 5/5`\n- 
Run Negative test (`knowledge unavailable` $\\rightarrow$ `KNOWLEDGE_GAP_DETECTED`), Tampered File test (unverified 
local file rejected), and Stale Document test (`REPEALED` doc rejected).\n- Generate 
`AETF500_MINSA_Runtime_Regression_Results_v1.0.json` & `AETF500_MINSA_Runtime_Provenance_Trace_v1.0.json`.\n\n### 8. 
Phase 12 to 16 â€” Horizontal Impact, 89 vs 91 Exception, Master Remediation Gate\n- Evaluate horizontal impact of 
`SRC-LAB-001` across all domains (`AETF500_SRC_LAB_001_Horizontal_Impact_Assessment_v1.0.json`).\n- Reconcile the 89 
physical KIs vs 91 declared KIs exception (`AETF500_89_vs_91_Knowledge_Item_Exception_Reconciliation_v1.0.json`).\n- 
Evaluate Master Remediation Gate `AETF500_P0_KNOWLEDGE_PROVENANCE_REMEDIATION_MASTER_GATE_v1.0.json` $\\rightarrow$ 
`P0_REMEDIATED_AND_FORENSICALLY_VERIFIED`.\n- Generate Evidence Manifest 
`AETF500_P0_Knowledge_Provenance_Remediation_Evidence_Manifest_v1.0.json`.\n- Generate Master Report 
`AETF500_P0_Knowledge_Provenance_Remediation_Final_Report_v1.0.md` answering textually all 14 mandatory questions from 
Section 56.\n\n## Verification Plan\n\n### Automated Tests\n- Run `npm test` across all workspace packages to verify 
test suite integrity.\n- Run `node scripts/generate_v118_specs.js` to build all 15 remediation spec JSON files in 
`generated/`.\n\n### Executive Output Validation\n- Validate the exact formatting of the mandatory Executive Output 
block from Section 47.\n","Description":"Create implementation plan for P0 Knowledge Remediation 
v1.0","Overwrite":true,"TargetFile":"C:\\Users\\Victorino Aguiar\\.gemini\\antigravity\\brain\\c85a36d7-4281-47ae-b788-
82a6f5e00234\\implementation_plan.md","toolAction":"Create implementation plan for P0 Knowledge Remediation 
v1.0","toolSummary":"Create implementation plan for P0 Knowledge Remediation v1.0"}}]}
{"step_index":11506,"source":"MODEL","type":"PLANNER_RESPONSE","status":"DONE","created_at":"2026-09-13T09:15:14Z","too
l_calls":[{"name":"run_command","args":{"CommandLine":"powershell -Command \"Get-Content -Path 'C:\\Users\\Victorino Ag
uiar\\.gemini\\antigravity\\brain\\c85a36d7-4281-47ae-b788-82a6f5e00234\\.system_generated\\logs\\transcript_full.jsonl
' | Select-String -Pattern 
'AETF500_P0_KNOWLEDGE_PROVENANCE_SOURCE_AUTHORITY_CONTENT_RECONSTRUCTION_REGULATORY_ROUTER_REMEDIATION_v1.0' | 
Out-File -FilePath 'scratch/p0_prompt.txt'\"","Cwd":"c:\\Users\\Victorino Aguiar\\OneDrive\\Desktop\\APLICATIVO AI 
EMPLOYEES","WaitMsBeforeAsync":5000,"toolAction":"Extract P0 prompt to file","toolSummary":"Extract P0 prompt to 
file"}}]}


