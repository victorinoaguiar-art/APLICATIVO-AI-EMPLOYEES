# SECURITY_REVIEW — Avaliação de Segurança, Isolamento Multi-Tenant e Credenciais

**Documento:** Relatório de Auditoria de Segurança e Proteção de Dados  
**Projeto:** AETF-500  
**Data:** 14 de Setembro de 2026  

---

## 1. SEGURANÇA E PROTEÇÃO DE API KEYS (`FRM-S-13`)

A auditoria de segurança atesta o cumprimento estrito das regras de proteção de credenciais de IA e conectores de terceiros:

```text
[ UTILIZADOR ] ──(Formulário FRM-S-13)──> [ FRONTEND ]
                                               │
                                      (HTTPS / Envio Único)
                                               │
                                               ▼
                                      [ BACKEND API ]
                                               │
                                               ▼
                                    [ SECRETS VAULT (KMS) ]
                                               │
                                               ▼
                                      [ secret_ref ID ]
```

### Garantias de Segurança Auditadas:
1. **Zero Client Storage:** As API Keys inseridas (OpenAI, Anthropic, Gemini, etc.) **nunca são armazenadas** em `localStorage`, `sessionStorage`, cookies ou variáveis de ambiente expostas (`NEXT_PUBLIC_*`).
2. **One-Way Payload:** O frontend transmite a credencial via formulário seguro uma única vez. O backend cifra a chave no **Secrets Vault** e retorna apenas uma referência mascarada (ex: `••••••••••••8XQ2`).
3. **No-Log Policy:** As chaves são filtradas e omitidas de qualquer log de auditoria, telemetria ou respostas de erro da API.

---

## 2. ISOLAMENTO MULTI-TENANT & RASTREABILIDADE (TENANT ISOLATION)

- A remoção visual dos termos `Tenant` e `tenant_id` da interface do utilizador comum **não alterou os mecanismos de isolamento técnico**.
- Todas as mutações e pesquisas de dados continuam a validar internamente o `tenant_id` e a subscrição da empresa ativa.
- Tentativas de acesso entre empresas distintas continuam a retornar negação de acesso imediata (`DENIED / 403 Forbidden`).
