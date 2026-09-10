# Definição de Âmbitos e Permissões de Recursos — GWNIS

## Princípio do Menor Privilégio
- Cada ligação define allowlists de pastas root, Shared Drives e documentos autorizados.
- Se um recurso solicitado não estiver explicitamente na allowlist, a operação é rejeitada com `RESOURCE_OUTSIDE_AUTHORIZED_SCOPE`.
- Validação contínua de isolamento por tenant (`tenant_id`) em todas as invocações.
