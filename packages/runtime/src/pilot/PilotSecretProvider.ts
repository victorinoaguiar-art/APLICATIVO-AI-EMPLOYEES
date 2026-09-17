import { SecretProvider } from '@ai-employee/shared';

export { SecretProvider };

/**
 * Provedor de segredos via variáveis de ambiente seguras.
 * Em produção, resolve segredos a partir do Vault, KMS ou variáveis de ambiente injetadas.
 */
export class EnvironmentSecretProvider implements SecretProvider {
  public resolveSecret(secretRef: string, tenantId: string): string {
    if (!secretRef || typeof secretRef !== 'string') {
      throw new Error(`Referência de segredo inválida ou vazia para o tenant '${tenantId}'.`);
    }

    const sanitizedRef = secretRef.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
    const sanitizedTenant = (tenantId || '').replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();

    const candidates = [
      secretRef,
      sanitizedRef,
      `PILOT_SECRET_${sanitizedRef}`,
      `REVIEWER_SECRET_${sanitizedRef}`,
      `TENANT_${sanitizedTenant}_SECRET_${sanitizedRef}`
    ];

    for (const key of candidates) {
      const val = process.env[key];
      if (val && val.trim().length >= 16) {
        return val.trim();
      }
    }

    throw new Error(
      `[SEGURANÇA FATAL] Segredo não resolvido para secret_ref '${secretRef}' (tenant: '${tenantId}'). ` +
      `Falha fechada ativa: nenhuma chave criptográfica válida encontrada no ambiente protegido.`
    );
  }
}

/**
 * Provedor estático em memória destinado exclusivamente a testes e ambiente de simulação.
 */
export class StaticSecretProvider implements SecretProvider {
  private secrets: Map<string, string> = new Map();

  constructor(initialSecrets?: Record<string, string>) {
    if (initialSecrets) {
      for (const [k, v] of Object.entries(initialSecrets)) {
        this.secrets.set(k, v);
      }
    }
  }

  public registerSecret(secretRef: string, secretValue: string): void {
    this.secrets.set(secretRef, secretValue);
  }

  public resolveSecret(secretRef: string, tenantId: string): string {
    const val = this.secrets.get(secretRef);
    if (!val) {
      const envVal = process.env[secretRef] || process.env[`PILOT_SECRET_${secretRef}`];
      if (envVal) return envVal;
      throw new Error(`Segredo estático não encontrado para secret_ref '${secretRef}' (tenant: '${tenantId}').`);
    }
    return val;
  }
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /private_key/i,
  /secret_or_key/i
];

/**
 * Escaneia recursivamente um objeto ou ficheiro JSON para rejeitar qualquer campo proibido contendo segredos.
 */
export function scanAndRejectSensitiveFields(data: any, path: string = 'root'): void {
  if (data === null || data === undefined) return;

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        scanAndRejectSensitiveFields(data[i], `${path}[${i}]`);
      }
    } else {
      for (const key of Object.keys(data)) {
        const fullPath = `${path}.${key}`;
        for (const pattern of SENSITIVE_KEY_PATTERNS) {
          if (key === 'secret_ref' || key === 'key_id' || key === 'kms_key_id' || key === 'auth_token' || key === 'reviewer_token' || key === 'idempotency_key') {
            continue;
          }
          if (pattern.test(key)) {
            throw new Error(
              `[VIOLAÇÃO DE SEGURANÇA] Campo sensível proibido detectado em '${fullPath}'. ` +
              `Valores secretos brutos não podem constar em configurações ou ficheiros JSON operacionais.`
            );
          }
        }
        scanAndRejectSensitiveFields(data[key], fullPath);
      }
    }
  }
}
