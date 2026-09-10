# Autenticação & Vault — GWNIS

## Modos de Autenticação Suportados
1. **User OAuth 2.0:** Ligação direta por consentimento de utilizador.
2. **Org-Managed OAuth:** Ligação gerida ao nível da organização.
3. **Service Account:** Conta de serviço autorizada.
4. **Domain-Wide Delegation:** Deleção administrativa restrita a âmbitos mínimos.

## Isolamento de Credenciais
- Nenhuma chave privada ou token (`access_token`, `refresh_token`) é exposto aos modelos LLM.
- O contexto dos AI Employees recebe exclusivamente a referência `credential_ref`.
