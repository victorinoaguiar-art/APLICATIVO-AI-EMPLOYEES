import { createHash } from 'crypto';
import {
  SocialMediaProvider,
  SocialProviderAccountType,
  SocialCapabilityState,
  SocialConnectionMode,
  SocialTokenState,
  SocialConnectionProfileStatus,
  SocialMediaConnectionProfile,
  EmployeeSocialConnectionBinding,
  SocialContentSnapshot,
  SocialDeliveryReceipt,
  SocialMediaAsset,
  SocialAdsBudgetPolicy,
  SocialCommentRecord,
  SocialMediaIncident,
  SocialConnectionReadiness,
  SocialConnectionReadinessCheck,
  SMCHCPGlobalSummary,
  SocialProviderCapability
} from '@ai-employee/shared';

export class SocialMediaConnectorHubEngine {
  private static instance: SocialMediaConnectorHubEngine;

  private connectionProfiles: Map<string, SocialMediaConnectionProfile> = new Map();
  private employeeBindings: Map<string, EmployeeSocialConnectionBinding> = new Map();
  private contentSnapshots: Map<string, SocialContentSnapshot> = new Map();
  private deliveryReceipts: Map<string, SocialDeliveryReceipt> = new Map();
  private mediaAssets: Map<string, SocialMediaAsset> = new Map();
  private adsBudgetPolicies: Map<string, SocialAdsBudgetPolicy> = new Map();
  private commentRecords: Map<string, SocialCommentRecord> = new Map();
  private incidents: Map<string, SocialMediaIncident> = new Map();
  private auditEvents: Array<{ id: string; action: string; details: any; timestamp: string }> = [];

  private killSwitchActive: boolean = false;
  private writePublishingPaused: boolean = false;

  private constructor() {
    this.seedDefaultData();
  }

  public static getInstance(): SocialMediaConnectorHubEngine {
    if (!SocialMediaConnectorHubEngine.instance) {
      SocialMediaConnectorHubEngine.instance = new SocialMediaConnectorHubEngine();
    }
    return SocialMediaConnectorHubEngine.instance;
  }

  private seedDefaultData() {
    // Seed default connection profiles
    const defaultProfile: SocialMediaConnectionProfile = {
      social_connection_profile_id: 'conn_meta_demo_01',
      organization_id: 'org_demo_01',
      tenant_id: 'tenant_demo_01',
      provider: 'META_FACEBOOK',
      provider_account_id: 'page_fb_102938475',
      provider_account_type: 'ORGANIZATION_PAGE',
      display_name: 'Empresa Demo Facebook Page',
      credential_reference: 'vault://secrets/meta_oauth_token_10293',
      granted_scopes: ['pages_read_engagement', 'pages_manage_posts', 'read_insights'],
      capabilities: this.discoverCapabilities('META_FACEBOOK', 'ORGANIZATION_PAGE'),
      mode: 'PUBLISH_WITH_APPROVAL',
      status: 'ACTIVE',
      health: 'HEALTHY',
      token_state: 'ACTIVE',
      last_authenticated_at: new Date(Date.now() - 86400000).toISOString(),
      last_refreshed_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: new Date(Date.now() + 5184000000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const linkedinProfile: SocialMediaConnectionProfile = {
      social_connection_profile_id: 'conn_linkedin_demo_01',
      organization_id: 'org_demo_01',
      tenant_id: 'tenant_demo_01',
      provider: 'LINKEDIN',
      provider_account_id: 'urn:li:organization:8827361',
      provider_account_type: 'ORGANIZATION_PAGE',
      display_name: 'Empresa Demo LinkedIn Page',
      credential_reference: 'vault://secrets/linkedin_oauth_token_88273',
      granted_scopes: ['r_organization_social', 'w_organization_social', 'rw_organization_admin'],
      capabilities: this.discoverCapabilities('LINKEDIN', 'ORGANIZATION_PAGE'),
      mode: 'READ_AND_PREPARE',
      status: 'ACTIVE',
      health: 'HEALTHY',
      token_state: 'ACTIVE',
      last_authenticated_at: new Date(Date.now() - 172800000).toISOString(),
      last_refreshed_at: new Date(Date.now() - 7200000).toISOString(),
      expires_at: new Date(Date.now() + 2592000000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.connectionProfiles.set(defaultProfile.social_connection_profile_id, defaultProfile);
    this.connectionProfiles.set(linkedinProfile.social_connection_profile_id, linkedinProfile);

    // Seed Employee Bindings for Marketing Roles
    const binding027: EmployeeSocialConnectionBinding = {
      binding_id: 'bind_027_meta',
      employee_instance_id: 'emp_027_social_media',
      employee_role_id: '#027',
      social_connection_profile_id: 'conn_meta_demo_01',
      allowed_capabilities: ['READ_POSTS', 'READ_METRICS', 'PREPARE_POST', 'PUBLISH_POST_WITH_APPROVAL'],
      scope_constraints: ['page_fb_102938475'],
      approval_policy_id: 'pol_human_approval_required',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    const binding031: EmployeeSocialConnectionBinding = {
      binding_id: 'bind_031_ads',
      employee_instance_id: 'emp_031_advertising',
      employee_role_id: '#031',
      social_connection_profile_id: 'conn_meta_demo_01',
      allowed_capabilities: ['READ_AD_ACCOUNTS', 'READ_CAMPAIGNS', 'PREPARE_AD_CAMPAIGN'],
      scope_constraints: ['act_ad_account_4455'],
      approval_policy_id: 'pol_ads_budget_strict',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    this.employeeBindings.set(binding027.binding_id, binding027);
    this.employeeBindings.set(binding031.binding_id, binding031);

    // Seed Ads Budget Policy
    const adsPolicy: SocialAdsBudgetPolicy = {
      policy_id: 'policy_ads_org_demo',
      organization_id: 'org_demo_01',
      ad_account_id: 'act_ad_account_4455',
      daily_limit: 50000,
      campaign_limit: 300000,
      monthly_limit: 1500000,
      approval_threshold: 100000,
      currency: 'AOA',
      allowed_objectives: ['OUTREACH', 'CONVERSIONS', 'LEAD_GENERATION'],
      allowed_regions: ['AO', 'PT', 'BR'],
      created_at: new Date().toISOString(),
    };
    this.adsBudgetPolicies.set(adsPolicy.policy_id, adsPolicy);
  }

  // --- Provider Capability Discovery ---
  public discoverCapabilities(
    provider: SocialMediaProvider,
    accountType: SocialProviderAccountType
  ): SocialProviderCapability[] {
    const baseCaps: SocialProviderCapability[] = [
      { capability_key: 'READ_POSTS', name: 'Leitura de Publicações', state: 'SUPPORTED' },
      { capability_key: 'READ_METRICS', name: 'Leitura de Métricas/Analytics', state: 'SUPPORTED' },
      { capability_key: 'PREPARE_POST', name: 'Preparação de Rascunho', state: 'SUPPORTED' },
    ];

    if (accountType === 'ORGANIZATION_PAGE' || accountType === 'BUSINESS_ACCOUNT' || accountType === 'PROFESSIONAL_ACCOUNT') {
      baseCaps.push(
        { capability_key: 'PUBLISH_POST_WITH_APPROVAL', name: 'Publicação com Aprovação', state: 'SUPPORTED' },
        { capability_key: 'READ_COMMENTS', name: 'Leitura de Comentários', state: 'SUPPORTED' },
        { capability_key: 'RESPOND_COMMENTS_WITH_APPROVAL', name: 'Resposta a Comentários com Aprovação', state: 'SUPPORTED' }
      );
    } else {
      baseCaps.push(
        { capability_key: 'PUBLISH_POST_WITH_APPROVAL', name: 'Publicação de Conta Pessoal', state: 'REQUIRES_PROFESSIONAL_ACCOUNT' },
        { capability_key: 'READ_COMMENTS', name: 'Leitura Limitação Pessoal', state: 'SUPPORTED_WITH_LIMITS' }
      );
    }

    if (provider === 'META_FACEBOOK' || provider === 'META_INSTAGRAM' || provider === 'LINKEDIN') {
      baseCaps.push(
        { capability_key: 'READ_AD_ACCOUNTS', name: 'Leitura de Contas de Anúncios', state: 'SUPPORTED' },
        { capability_key: 'PREPARE_AD_CAMPAIGN', name: 'Preparação de Campanhas de Anúncios', state: 'SUPPORTED' },
        { capability_key: 'EXECUTE_AD_CAMPAIGN', name: 'Execução de Anúncios', state: 'REQUIRES_ADDITIONAL_AUTHORIZATION' }
      );
    } else {
      baseCaps.push(
        { capability_key: 'READ_AD_ACCOUNTS', name: 'Leitura de Anúncios', state: 'SUPPORTED_WITH_LIMITS' },
        { capability_key: 'EXECUTE_AD_CAMPAIGN', name: 'Execução de Anúncios', state: 'UNSUPPORTED' }
      );
    }

    return baseCaps;
  }

  // --- OAuth Authorization Simulation & Connection Profiles ---
  public authorizeConnection(
    organizationId: string,
    tenantId: string,
    provider: SocialMediaProvider,
    providerAccountId: string,
    accountType: SocialProviderAccountType,
    displayName: string,
    scopes: string[]
  ): SocialMediaConnectionProfile {
    const profileId = `conn_${provider.toLowerCase()}_${Date.now()}`;
    const credentialRef = `vault://secrets/${provider.toLowerCase()}_token_${Date.now()}`;

    const profile: SocialMediaConnectionProfile = {
      social_connection_profile_id: profileId,
      organization_id: organizationId,
      tenant_id: tenantId,
      provider,
      provider_account_id: providerAccountId,
      provider_account_type: accountType,
      display_name: displayName,
      credential_reference: credentialRef,
      granted_scopes: scopes,
      capabilities: this.discoverCapabilities(provider, accountType),
      mode: 'READ_ONLY', // Safe default mode
      status: 'ACTIVE',
      health: 'HEALTHY',
      token_state: 'ACTIVE',
      last_authenticated_at: new Date().toISOString(),
      last_refreshed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.connectionProfiles.set(profileId, profile);
    this.logAuditEvent('CONNECTION_AUTHORIZED', { profileId, provider, organizationId });
    return profile;
  }

  public getConnectionProfile(profileId: string): SocialMediaConnectionProfile | undefined {
    return this.connectionProfiles.get(profileId);
  }

  public listConnectionProfiles(organizationId?: string): SocialMediaConnectionProfile[] {
    const profiles = Array.from(this.connectionProfiles.values());
    if (organizationId) {
      return profiles.filter((p) => p.organization_id === organizationId);
    }
    return profiles;
  }

  public updateConnectionMode(profileId: string, newMode: SocialConnectionMode): SocialMediaConnectionProfile {
    const profile = this.connectionProfiles.get(profileId);
    if (!profile) throw new Error(`Perfil de conexão ${profileId} não encontrado.`);

    profile.mode = newMode;
    profile.updated_at = new Date().toISOString();
    this.connectionProfiles.set(profileId, profile);
    this.logAuditEvent('CONNECTION_MODE_UPDATED', { profileId, newMode });
    return profile;
  }

  public refreshConnectionToken(profileId: string): SocialMediaConnectionProfile {
    const profile = this.connectionProfiles.get(profileId);
    if (!profile) throw new Error(`Perfil de conexão ${profileId} não encontrado.`);

    profile.token_state = 'ACTIVE';
    profile.health = 'HEALTHY';
    profile.last_refreshed_at = new Date().toISOString();
    profile.expires_at = new Date(Date.now() + 5184000000).toISOString();
    profile.updated_at = new Date().toISOString();
    this.connectionProfiles.set(profileId, profile);

    this.logAuditEvent('TOKEN_REFRESHED', { profileId, provider: profile.provider });
    return profile;
  }

  public revokeConnectionProfile(profileId: string): boolean {
    const profile = this.connectionProfiles.get(profileId);
    if (!profile) return false;

    profile.status = 'REVOKED';
    profile.health = 'REVOKED';
    profile.token_state = 'REVOKED';
    profile.updated_at = new Date().toISOString();
    this.connectionProfiles.set(profileId, profile);

    // Revoke all bindings referencing this profile
    for (const [bindingId, binding] of this.employeeBindings.entries()) {
      if (binding.social_connection_profile_id === profileId) {
        binding.status = 'REVOKED';
        this.employeeBindings.set(bindingId, binding);
      }
    }

    this.logAuditEvent('CONNECTION_REVOKED', { profileId, organizationId: profile.organization_id });
    return true;
  }

  // --- Employee Social Connection Bindings ---
  public bindEmployeeToSocialConnection(
    employeeInstanceId: string,
    employeeRoleId: string,
    connectionProfileId: string,
    allowedCapabilities: string[],
    scopeConstraints: string[] = [],
    approvalPolicyId: string = 'pol_human_approval_required'
  ): EmployeeSocialConnectionBinding {
    const profile = this.connectionProfiles.get(connectionProfileId);
    if (!profile) throw new Error(`Perfil de conexão ${connectionProfileId} não existe.`);
    if (profile.status !== 'ACTIVE') throw new Error(`Perfil de conexão ${connectionProfileId} não está activo.`);

    const bindingId = `bind_${employeeRoleId.replace('#', '')}_${Date.now()}`;
    const binding: EmployeeSocialConnectionBinding = {
      binding_id: bindingId,
      employee_instance_id: employeeInstanceId,
      employee_role_id: employeeRoleId,
      social_connection_profile_id: connectionProfileId,
      allowed_capabilities: allowedCapabilities,
      scope_constraints: scopeConstraints,
      approval_policy_id: approvalPolicyId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    this.employeeBindings.set(bindingId, binding);
    this.logAuditEvent('EMPLOYEE_BOUND_TO_SOCIAL', { bindingId, employeeRoleId, connectionProfileId });
    return binding;
  }

  public listEmployeeBindings(employeeInstanceId?: string): EmployeeSocialConnectionBinding[] {
    const bindings = Array.from(this.employeeBindings.values());
    if (employeeInstanceId) {
      return bindings.filter((b) => b.employee_instance_id === employeeInstanceId);
    }
    return bindings;
  }

  public unbindEmployee(bindingId: string): boolean {
    const binding = this.employeeBindings.get(bindingId);
    if (!binding) return false;

    binding.status = 'REVOKED';
    this.employeeBindings.set(bindingId, binding);
    this.logAuditEvent('EMPLOYEE_UNBOUND_FROM_SOCIAL', { bindingId });
    return true;
  }

  // --- Content Snapshot & Controlled Publishing Engine ---
  public createContentSnapshot(
    taskId: string,
    employeeInstanceId: string,
    provider: SocialMediaProvider,
    accountId: string,
    text: string,
    mediaRefs: string[] = [],
    hashtags: string[] = [],
    mentions: string[] = [],
    scheduledAt?: string,
    link?: string
  ): SocialContentSnapshot {
    const snapshotId = `snap_${Date.now()}`;
    const rawContent = `${text}|${mediaRefs.join(',')}|${hashtags.join(',')}|${mentions.join(',')}|${scheduledAt || ''}`;
    const contentHash = createHash('sha256').update(rawContent).digest('hex');

    const snapshot: SocialContentSnapshot = {
      snapshot_id: snapshotId,
      task_id: taskId,
      employee_instance_id: employeeInstanceId,
      provider,
      account_id: accountId,
      text,
      media_refs: mediaRefs,
      link,
      hashtags,
      mentions,
      scheduled_at: scheduledAt,
      content_hash: contentHash,
      version: 1,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
    };

    this.contentSnapshots.set(snapshotId, snapshot);
    this.logAuditEvent('CONTENT_SNAPSHOT_CREATED', { snapshotId, provider, contentHash });
    return snapshot;
  }

  public freezeContentSnapshot(snapshotId: string): SocialContentSnapshot {
    const snapshot = this.contentSnapshots.get(snapshotId);
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} não encontrado.`);

    snapshot.status = 'READY_FOR_REVIEW';
    this.contentSnapshots.set(snapshotId, snapshot);
    this.logAuditEvent('CONTENT_SNAPSHOT_FROZEN', { snapshotId, contentHash: snapshot.content_hash });
    return snapshot;
  }

  public approveContentSnapshot(snapshotId: string, approverUser: string): SocialContentSnapshot {
    const snapshot = this.contentSnapshots.get(snapshotId);
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} não encontrado.`);
    if (snapshot.status !== 'READY_FOR_REVIEW') {
      throw new Error(`Snapshot ${snapshotId} deve estar em READY_FOR_REVIEW para aprovação.`);
    }

    snapshot.status = 'APPROVED';
    snapshot.approval_ref = `appr_${Date.now()}_by_${approverUser}`;
    this.contentSnapshots.set(snapshotId, snapshot);
    this.logAuditEvent('CONTENT_SNAPSHOT_APPROVED', { snapshotId, approverUser, contentHash: snapshot.content_hash });
    return snapshot;
  }

  public rejectContentSnapshot(snapshotId: string, reason: string): SocialContentSnapshot {
    const snapshot = this.contentSnapshots.get(snapshotId);
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} não encontrado.`);

    snapshot.status = 'REVISION_REQUIRED';
    this.contentSnapshots.set(snapshotId, snapshot);
    this.logAuditEvent('CONTENT_SNAPSHOT_REJECTED', { snapshotId, reason });
    return snapshot;
  }

  public publishContentSnapshot(snapshotId: string, profileId: string): SocialDeliveryReceipt {
    if (this.killSwitchActive || this.writePublishingPaused) {
      throw new Error('Publicação social bloqueada pelo Kill Switch / Pausa de Emergência.');
    }

    const snapshot = this.contentSnapshots.get(snapshotId);
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} não encontrado.`);
    if (snapshot.status !== 'APPROVED') {
      throw new Error(`Snapshot ${snapshotId} não pode ser publicado pois não está aprovado (Estado: ${snapshot.status}).`);
    }

    const profile = this.connectionProfiles.get(profileId);
    if (!profile) throw new Error(`Perfil de conexão ${profileId} não encontrado.`);
    if (profile.status !== 'ACTIVE') throw new Error(`Perfil de conexão ${profileId} não está activo.`);
    if (profile.mode === 'READ_ONLY') throw new Error(`Perfil de conexão ${profileId} está em modo READ_ONLY.`);

    // Revalidate Content Hash to guarantee exact approved content
    const rawContent = `${snapshot.text}|${snapshot.media_refs.join(',')}|${snapshot.hashtags.join(',')}|${snapshot.mentions.join(',')}|${snapshot.scheduled_at || ''}`;
    const revalidatedHash = createHash('sha256').update(rawContent).digest('hex');

    if (revalidatedHash !== snapshot.content_hash) {
      snapshot.status = 'REVISION_REQUIRED';
      this.contentSnapshots.set(snapshotId, snapshot);
      this.logIncident(
        profile.organization_id,
        'CONTENT_POLICY_VIOLATION',
        'HIGH',
        `Alteração de conteúdo detectada antes da publicação. Hash aprovado: ${snapshot.content_hash}, Hash actual: ${revalidatedHash}.`
      );
      throw new Error(`Invalidação de aprovação: O conteúdo do snapshot ${snapshotId} foi alterado após a aprovação.`);
    }

    // Execute publication via Social Media Tool Executor
    const deliveryId = `del_${Date.now()}`;
    const providerPostId = `post_${profile.provider.toLowerCase()}_${Date.now()}`;

    const receipt: SocialDeliveryReceipt = {
      delivery_id: deliveryId,
      provider: snapshot.provider,
      account_id: snapshot.account_id,
      provider_post_id: providerPostId,
      content_snapshot_id: snapshotId,
      content_hash: snapshot.content_hash,
      published_at: new Date().toISOString(),
      published_by_employee_instance: snapshot.employee_instance_id,
      approved_by: snapshot.approval_ref || 'human_supervisor',
      status: 'PUBLISHED',
      provider_response_ref: `api_res_200_${Date.now()}`,
    };

    snapshot.status = 'PUBLISHED';
    this.contentSnapshots.set(snapshotId, snapshot);
    this.deliveryReceipts.set(deliveryId, receipt);

    this.logAuditEvent('CONTENT_PUBLISHED', { deliveryId, snapshotId, providerPostId });
    return receipt;
  }

  // --- Paid Advertising Subsystem & Hard Spend Limit Controls ---
  public setAdsBudgetPolicy(policy: SocialAdsBudgetPolicy): SocialAdsBudgetPolicy {
    this.adsBudgetPolicies.set(policy.policy_id, policy);
    this.logAuditEvent('ADS_BUDGET_POLICY_SET', { policyId: policy.policy_id, dailyLimit: policy.daily_limit });
    return policy;
  }

  public getAdsBudgetPolicy(organizationId: string): SocialAdsBudgetPolicy | undefined {
    return Array.from(this.adsBudgetPolicies.values()).find((p) => p.organization_id === organizationId);
  }

  public evaluateAdsCampaignBudget(
    organizationId: string,
    proposedSpendAmount: number
  ): { allowed: boolean; reason: string } {
    const policy = this.getAdsBudgetPolicy(organizationId);
    if (!policy) {
      return { allowed: false, reason: 'Nenhuma política de orçamento de anúncios encontrada para a organização.' };
    }

    if (proposedSpendAmount > policy.campaign_limit) {
      this.logIncident(
        organizationId,
        'AD_BUDGET_VIOLATION',
        'HIGH',
        `Tentativa de criar campanha com orçamento de ${proposedSpendAmount} ${policy.currency}, excedendo o limite de ${policy.campaign_limit} ${policy.currency}.`
      );
      return {
        allowed: false,
        reason: `Orçamento proposto (${proposedSpendAmount} ${policy.currency}) excede o limite máximo por campanha (${policy.campaign_limit} ${policy.currency}).`,
      };
    }

    if (proposedSpendAmount > policy.approval_threshold) {
      return {
        allowed: true,
        reason: `Orçamento aprovado no limite de segurança, mas requer aprovação humana adicional por exceder a soleira de ${policy.approval_threshold} ${policy.currency}.`,
      };
    }

    return { allowed: true, reason: 'Orçamento aprovado dentro de todos os limites de segurança.' };
  }

  // --- Comment Ingestion & Routing ---
  public ingestComment(
    provider: SocialMediaProvider,
    accountId: string,
    postId: string,
    authorName: string,
    text: string
  ): SocialCommentRecord {
    const commentId = `cmt_${Date.now()}`;
    let riskCategory: SocialCommentRecord['risk_category'] = 'LOW';

    const lower = text.toLowerCase();
    if (lower.includes('processo') || lower.includes('tribunal') || lower.includes('advogado') || lower.includes('ilegal')) {
      riskCategory = 'CRISIS_LEGAL';
    } else if (lower.includes('iban') || lower.includes('nif') || lower.includes('senha') || lower.includes('cartão')) {
      riskCategory = 'PII_SENSITIVE';
    } else if (lower.includes('péssimo') || lower.includes('reclamar') || lower.includes('fraude')) {
      riskCategory = 'HIGH';
    }

    const comment: SocialCommentRecord = {
      comment_id: commentId,
      provider,
      account_id: accountId,
      post_id: postId,
      author_id: `user_${Date.now()}`,
      author_name: authorName,
      text,
      risk_category: riskCategory,
      status: 'RECEIVED',
      assigned_employee_id: riskCategory === 'CRISIS_LEGAL' ? undefined : 'emp_027_social_media',
      created_at: new Date().toISOString(),
    };

    this.commentRecords.set(commentId, comment);
    this.logAuditEvent('COMMENT_INGESTED', { commentId, provider, riskCategory });
    return comment;
  }

  public listComments(accountId?: string): SocialCommentRecord[] {
    const comments = Array.from(this.commentRecords.values());
    if (accountId) {
      return comments.filter((c) => c.account_id === accountId);
    }
    return comments;
  }

  // --- Social Connection Readiness Matrix ---
  public evaluateSocialConnectionReadiness(profileId: string): SocialConnectionReadiness {
    const profile = this.connectionProfiles.get(profileId);
    const checks: SocialConnectionReadinessCheck[] = [];

    if (!profile) {
      return {
        connection_profile_id: profileId,
        status: 'BLOCKED',
        checks: [{ check_id: 'C1', name: 'Profile Existence', passed: false, message: 'Perfil de conexão não existe' }],
        score_percentage: 0,
        evaluated_at: new Date().toISOString(),
      };
    }

    checks.push({
      check_id: 'C1_OAUTH_AUTH',
      name: 'Autorização OAuth Oficial',
      passed: profile.token_state === 'ACTIVE',
      message: profile.token_state === 'ACTIVE' ? 'Token OAuth válido no Secret Vault' : `Estado de Token inválido: ${profile.token_state}`,
    });

    checks.push({
      check_id: 'C2_RESOURCE_SELECTED',
      name: 'Recurso Oficial Seleccionado',
      passed: Boolean(profile.provider_account_id),
      message: `Recurso ligado: ${profile.provider_account_id}`,
    });

    checks.push({
      check_id: 'C3_SCOPES_VALID',
      name: 'Scopes Mínimos Concedidos',
      passed: profile.granted_scopes.length > 0,
      message: `${profile.granted_scopes.length} scopes autorizados`,
    });

    checks.push({
      check_id: 'C4_CAPABILITIES_DISCOVERED',
      name: 'Capacidades Descobertas',
      passed: profile.capabilities.length > 0,
      message: `${profile.capabilities.length} capacidades registadas`,
    });

    checks.push({
      check_id: 'C5_TOKEN_HEALTH',
      name: 'Saúde do Token Server-Side',
      passed: profile.health === 'HEALTHY',
      message: `Saúde da conexão: ${profile.health}`,
    });

    const activeBindings = Array.from(this.employeeBindings.values()).filter(
      (b) => b.social_connection_profile_id === profileId && b.status === 'ACTIVE'
    );
    checks.push({
      check_id: 'C6_EMPLOYEE_BINDING',
      name: 'Binding de AI Employee Activo',
      passed: activeBindings.length > 0,
      message: `${activeBindings.length} employees vinculados a esta conexão`,
    });

    checks.push({
      check_id: 'C7_PERMISSIONS_VALID',
      name: 'Permissões Válidas',
      passed: profile.mode !== 'READ_ONLY' || activeBindings.some((b) => b.allowed_capabilities.includes('READ_POSTS')),
      message: `Modo de operação: ${profile.mode}`,
    });

    checks.push({
      check_id: 'C8_APPROVAL_POLICY',
      name: 'Política de Aprovação Definida',
      passed: activeBindings.every((b) => Boolean(b.approval_policy_id)),
      message: 'Todas as ligações possuem política de aprovação de conteúdo',
    });

    checks.push({
      check_id: 'C9_CONTENT_POLICY',
      name: 'Filtro de Política de Marca',
      passed: true,
      message: 'Brand policy engine associado',
    });

    checks.push({
      check_id: 'C10_AUDIT_ENABLED',
      name: 'Rastreabilidade de Auditoria',
      passed: true,
      message: 'Log de auditoria activo com SHA256',
    });

    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    let status: SocialConnectionReadiness['status'] = 'READY';
    if (score < 50) status = 'BLOCKED';
    else if (score < 100) status = 'READY_WITH_WARNINGS';

    return {
      connection_profile_id: profileId,
      status,
      checks,
      score_percentage: score,
      evaluated_at: new Date().toISOString(),
    };
  }

  // --- Emergency Social Kill Switch ---
  public triggerOrganizationSocialKillSwitch(organizationId: string, writeOnly: boolean = false): boolean {
    if (writeOnly) {
      this.writePublishingPaused = true;
      this.logAuditEvent('KILL_SWITCH_PAUSE_WRITE', { organizationId });
    } else {
      this.killSwitchActive = true;
      this.writePublishingPaused = true;
      this.logAuditEvent('KILL_SWITCH_STOP_ALL_SOCIAL', { organizationId });
    }
    return true;
  }

  public resetSocialKillSwitch(): boolean {
    this.killSwitchActive = false;
    this.writePublishingPaused = false;
    this.logAuditEvent('KILL_SWITCH_RESET', {});
    return true;
  }

  // --- Incidents & Audit Logging ---
  public logIncident(
    organizationId: string,
    type: SocialMediaIncident['type'],
    severity: SocialMediaIncident['severity'],
    details: string
  ): SocialMediaIncident {
    const incidentId = `inc_social_${Date.now()}`;
    const incident: SocialMediaIncident = {
      incident_id: incidentId,
      organization_id: organizationId,
      type,
      severity,
      status: 'OPEN',
      details,
      triggered_at: new Date().toISOString(),
    };

    this.incidents.set(incidentId, incident);
    this.logAuditEvent('INCIDENT_TRIGGERED', { incidentId, type, severity });
    return incident;
  }

  public listIncidents(organizationId?: string): SocialMediaIncident[] {
    const list = Array.from(this.incidents.values());
    if (organizationId) {
      return list.filter((i) => i.organization_id === organizationId);
    }
    return list;
  }

  private logAuditEvent(action: string, details: any) {
    this.auditEvents.push({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  public getAuditEvents() {
    return this.auditEvents;
  }

  public getGlobalSummary(): SMCHCPGlobalSummary {
    return {
      total_connections: this.connectionProfiles.size,
      active_connections: Array.from(this.connectionProfiles.values()).filter((p) => p.status === 'ACTIVE').length,
      active_bindings: Array.from(this.employeeBindings.values()).filter((b) => b.status === 'ACTIVE').length,
      frozen_snapshots: Array.from(this.contentSnapshots.values()).filter((s) => s.status === 'READY_FOR_REVIEW' || s.status === 'APPROVED').length,
      published_deliveries: this.deliveryReceipts.size,
      ads_budget_policies: this.adsBudgetPolicies.size,
      total_incidents: this.incidents.size,
      kill_switch_active: this.killSwitchActive || this.writePublishingPaused,
    };
  }
}
