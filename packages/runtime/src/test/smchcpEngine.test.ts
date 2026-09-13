import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SocialMediaConnectorHubEngine } from '../smchcp/SocialMediaConnectorHubEngine.js';

describe('SMCH-CP v1.0 — Social Media Connector Hub & Controlled Publishing Test Suite', () => {
  const engine = SocialMediaConnectorHubEngine.getInstance();

  it('1. Provider Capability Discovery — discovers capabilities by provider and account type', () => {
    const pageCaps = engine.discoverCapabilities('META_FACEBOOK', 'ORGANIZATION_PAGE');
    assert.ok(pageCaps.length > 0);
    assert.ok(pageCaps.some((c) => c.capability_key === 'PUBLISH_POST_WITH_APPROVAL'));

    const personalCaps = engine.discoverCapabilities('META_FACEBOOK', 'PERSONAL_ACCOUNT');
    const pubCap = personalCaps.find((c) => c.capability_key === 'PUBLISH_POST_WITH_APPROVAL');
    assert.equal(pubCap?.state, 'REQUIRES_PROFESSIONAL_ACCOUNT');
  });

  it('2. OAuth Authorization Simulation — creates active Connection Profile with Vault credential reference', () => {
    const profile = engine.authorizeConnection(
      'org_test_01',
      'tenant_test_01',
      'LINKEDIN',
      'urn:li:organization:998877',
      'ORGANIZATION_PAGE',
      'Empresa Teste LinkedIn',
      ['r_organization_social', 'w_organization_social']
    );

    assert.ok(profile.social_connection_profile_id.startsWith('conn_linkedin_'));
    assert.equal(profile.mode, 'READ_ONLY'); // Safe default
    assert.ok(profile.credential_reference.startsWith('vault://secrets/'));
    assert.equal(profile.status, 'ACTIVE');
  });

  it('3. Employee Social Binding — binds marketing AI Employee to social connection profile', () => {
    const profile = engine.authorizeConnection(
      'org_test_01',
      'tenant_test_01',
      'META_INSTAGRAM',
      'ig_business_112233',
      'BUSINESS_ACCOUNT',
      'Instagram Oficial',
      ['instagram_basic', 'instagram_content_publish']
    );

    const binding = engine.bindEmployeeToSocialConnection(
      'emp_027_social_media',
      '#027',
      profile.social_connection_profile_id,
      ['READ_POSTS', 'PREPARE_POST', 'PUBLISH_POST_WITH_APPROVAL'],
      ['ig_business_112233']
    );

    assert.equal(binding.employee_role_id, '#027');
    assert.equal(binding.status, 'ACTIVE');
  });

  it('4. Controlled Publishing Flow — freezes snapshot, approves and publishes exact frozen content', () => {
    const profile = engine.authorizeConnection(
      'org_test_01',
      'tenant_test_01',
      'META_FACEBOOK',
      'page_fb_554433',
      'ORGANIZATION_PAGE',
      'Facebook Test Page',
      ['pages_manage_posts']
    );
    engine.updateConnectionMode(profile.social_connection_profile_id, 'PUBLISH_WITH_APPROVAL');

    // Create & Freeze Snapshot
    const snapshot = engine.createContentSnapshot(
      'task_pub_01',
      'emp_027_social_media',
      'META_FACEBOOK',
      'page_fb_554433',
      'Lançamento Oficial do Produto X nas redes!',
      ['media_img_1'],
      ['#ProdutoX', '#IA'],
      ['@Empresa']
    );

    const frozen = engine.freezeContentSnapshot(snapshot.snapshot_id);
    assert.equal(frozen.status, 'READY_FOR_REVIEW');
    assert.ok(frozen.content_hash.length > 0);

    // Approve
    const approved = engine.approveContentSnapshot(snapshot.snapshot_id, 'gestor_marketing');
    assert.equal(approved.status, 'APPROVED');

    // Publish
    const receipt = engine.publishContentSnapshot(snapshot.snapshot_id, profile.social_connection_profile_id);
    assert.equal(receipt.status, 'PUBLISHED');
    assert.equal(receipt.content_hash, frozen.content_hash);
    assert.ok(receipt.provider_post_id.length > 0);
  });

  it('5. Approval Hash Invalidation — blocks publish if snapshot content is mutated post-approval', () => {
    const profile = engine.authorizeConnection(
      'org_test_01',
      'tenant_test_01',
      'LINKEDIN',
      'urn:li:org:123',
      'ORGANIZATION_PAGE',
      'LinkedIn Test Page',
      ['w_organization_social']
    );
    engine.updateConnectionMode(profile.social_connection_profile_id, 'PUBLISH_WITH_APPROVAL');

    const snapshot = engine.createContentSnapshot(
      'task_mut_01',
      'emp_027_social_media',
      'LINKEDIN',
      'urn:li:org:123',
      'Texto Original Aprovado'
    );
    engine.freezeContentSnapshot(snapshot.snapshot_id);
    engine.approveContentSnapshot(snapshot.snapshot_id, 'gestor_marketing');

    // Mutate content directly
    snapshot.text = 'Texto Alterado Não Aprovado';

    assert.throws(
      () => engine.publishContentSnapshot(snapshot.snapshot_id, profile.social_connection_profile_id),
      /Invalidação de aprovação/
    );
  });

  it('6. Paid Ads Hard Budget Limit — enforces server-side spend caps and blocks excessive campaigns', () => {
    const policy = engine.setAdsBudgetPolicy({
      policy_id: 'policy_test_ads',
      organization_id: 'org_ads_test',
      ad_account_id: 'act_112233',
      daily_limit: 100000,
      campaign_limit: 500000,
      monthly_limit: 2000000,
      approval_threshold: 200000,
      currency: 'AOA',
      allowed_objectives: ['CONVERSIONS'],
      allowed_regions: ['AO'],
      created_at: new Date().toISOString(),
    });

    const allowWithin = engine.evaluateAdsCampaignBudget('org_ads_test', 300000);
    assert.equal(allowWithin.allowed, true);

    const blockExcess = engine.evaluateAdsCampaignBudget('org_ads_test', 1000000);
    assert.equal(blockExcess.allowed, false);
    assert.ok(blockExcess.reason.includes('excede o limite'));
  });

  it('7. Comment Ingestion & Risk Routing — classifies crisis/legal risks', () => {
    const cmtNormal = engine.ingestComment('META_FACEBOOK', 'page_fb_123', 'post_1', 'Cliente A', 'Qual é o horário?');
    assert.equal(cmtNormal.risk_category, 'LOW');

    const cmtLegal = engine.ingestComment('META_FACEBOOK', 'page_fb_123', 'post_1', 'Cliente B', 'Vou entrar com processo no tribunal por fraude!');
    assert.equal(cmtLegal.risk_category, 'CRISIS_LEGAL');
  });

  it('8. Social Connection Readiness Matrix — evaluates 10 readiness checks', () => {
    const profiles = engine.listConnectionProfiles();
    assert.ok(profiles.length > 0);
    const readiness = engine.evaluateSocialConnectionReadiness(profiles[0].social_connection_profile_id);

    assert.ok(readiness.score_percentage > 0);
    assert.equal(readiness.checks.length, 10);
  });

  it('9. Emergency Social Kill Switch — halts publishing when activated', () => {
    const profile = engine.authorizeConnection(
      'org_ks_test',
      'tenant_ks_test',
      'META_FACEBOOK',
      'page_ks_1',
      'ORGANIZATION_PAGE',
      'KS Test Page',
      ['pages_manage_posts']
    );
    engine.updateConnectionMode(profile.social_connection_profile_id, 'PUBLISH_WITH_APPROVAL');

    const snapshot = engine.createContentSnapshot('task_ks', 'emp_027', 'META_FACEBOOK', 'page_ks_1', 'Post Kill Switch Test');
    engine.freezeContentSnapshot(snapshot.snapshot_id);
    engine.approveContentSnapshot(snapshot.snapshot_id, 'user');

    engine.triggerOrganizationSocialKillSwitch('org_ks_test', true);

    assert.throws(
      () => engine.publishContentSnapshot(snapshot.snapshot_id, profile.social_connection_profile_id),
      /Kill Switch/
    );

    engine.resetSocialKillSwitch();
  });
});
