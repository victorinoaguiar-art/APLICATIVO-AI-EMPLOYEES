import assert from 'node:assert';
import { test } from 'node:test';
import { AESSREEngine } from '../aessre/AESSREEngine.js';

test('AESSREEngine - Canonical Products & Digital Salary Display', () => {
  const engine = AESSREEngine.getInstance();
  const products = engine.getAllProducts();

  assert.strictEqual(products.length, 500);

  const product73 = engine.getProduct(73);
  assert.ok(product73);
  assert.strictEqual(product73.availablePlans.length, 3);
  assert.strictEqual(product73.availablePlans[0].tier, 'STARTER');
  assert.strictEqual(product73.availablePlans[0].currency, 'AOA');
  assert.strictEqual(product73.availablePlans[0].digitalSalaryDisplayLabel.includes('AOA/mês'), true);
});

test('AESSREEngine - Hiring Flow & Legal Subscription Descriptor', () => {
  const engine = AESSREEngine.getInstance();

  const hired = engine.hireEmployeeInstance({
    organizationId: 'org_test_company_001',
    roleId: 10,
    planTier: 'PROFESSIONAL',
    supervisorId: 'usr_dir_financial',
    departmentId: 'dept_executive',
    currency: 'AOA'
  });

  assert.ok(hired.instance);
  assert.ok(hired.subscription);
  assert.strictEqual(hired.instance.organizationId, 'org_test_company_001');
  assert.strictEqual(hired.subscription.legalDescriptor, 'MONTHLY_SUBSCRIPTION_FEE');
  assert.strictEqual(hired.subscription.status, 'ACTIVE');
  assert.strictEqual(hired.instance.status, 'ACTIVE');
});

test('AESSREEngine - Multiple Instances of Same Role for Same Tenant', () => {
  const engine = AESSREEngine.getInstance();
  const orgId = 'org_multi_dept';

  const inst1 = engine.hireEmployeeInstance({
    organizationId: orgId,
    roleId: 64,
    planTier: 'STARTER',
    supervisorId: 'sup_accounting',
    departmentId: 'dept_accounting'
  });

  const inst2 = engine.hireEmployeeInstance({
    organizationId: orgId,
    roleId: 64,
    planTier: 'PROFESSIONAL',
    supervisorId: 'sup_tax',
    departmentId: 'dept_tax'
  });

  assert.notStrictEqual(inst1.instance.instanceId, inst2.instance.instanceId);
  assert.strictEqual(inst1.instance.departmentId, 'dept_accounting');
  assert.strictEqual(inst2.instance.departmentId, 'dept_tax');

  const tenantInstances = engine.getAllInstances(orgId);
  assert.strictEqual(tenantInstances.length, 2);
});

test('AESSREEngine - Instance Lifecycle State Transitions', () => {
  const engine = AESSREEngine.getInstance();

  const hired = engine.hireEmployeeInstance({
    organizationId: 'org_lifecycle_test',
    roleId: 53,
    planTier: 'STARTER',
    supervisorId: 'usr_manager',
    departmentId: 'dept_treasury'
  });

  const paused = engine.transitionInstanceStatus(hired.instance.instanceId, 'PAUSED');
  assert.strictEqual(paused.status, 'PAUSED');

  const resumed = engine.transitionInstanceStatus(hired.instance.instanceId, 'ACTIVE');
  assert.strictEqual(resumed.status, 'ACTIVE');
});

test('AESSREEngine - Revenue Operations Metrics & Gross Margin', () => {
  const engine = AESSREEngine.getInstance();
  const metrics = engine.getRevenueMetrics();

  assert.strictEqual(metrics.totalMrrAoa > 0, true);
  assert.strictEqual(metrics.activeSubscriptionsCount > 0, true);
  assert.strictEqual(metrics.grossMarginPercent, 84.5);
  assert.strictEqual(typeof metrics.arpuAoa, 'number');
});
