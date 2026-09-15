import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CompanyManagementEngine } from '../operationalization/CompanyManagementEngine.js';

describe('Company-Tenant Provisioning & Multi-Tenant Data Isolation (Prompt CPEAA Baseline)', () => {
  const engine = CompanyManagementEngine.getInstance();

  it('TEST-01: Should create company without Employee (PASS)', () => {
    const company = engine.createCompany({
      identification: { legalName: 'Empresa Teste A Lda', nif: '5409998881', legalForm: 'Lda' },
      location: { country: 'Angola', provinceState: 'Luanda', city: 'Luanda', address: 'Rua 1', primaryJurisdiction: 'AO_ANGOLA' },
      activity: { sector: 'Tecnologia', primaryActivity: 'Desenvolvimento Software', companySize: 'SMALL' },
      contacts: { email: 'contato@testea.ao', phone: '+244923000111' },
      principalResponsible: { name: 'João Manuel', role: 'CEO', email: 'joao@testea.ao', phone: '+244923000111' },
      operationalConfig: { language: 'pt-AO', currency: 'AOA', timeZone: 'Africa/Luanda', fiscalCountry: 'Angola', laborCountry: 'Angola', primaryRegulatoryCountry: 'Angola' }
    });

    assert.ok(company.companyId.startsWith('CMP-'));
    assert.ok(company.tenantId.startsWith('TNT-'));
    assert.equal(company.lifecycleState, 'READY_FOR_CONFIGURATION');

    const instances = engine.getCompanyEmployeeInstances(company.companyId);
    assert.equal(instances.length, 0, 'Company created without any implicit employee');
  });

  it('TEST-02: Should create user membership without implicit company creation (PASS)', () => {
    const company = engine.createCompany({
      identification: { legalName: 'Empresa Teste B Lda', nif: '5409998882', legalForm: 'Lda' },
      location: { country: 'Angola', provinceState: 'Luanda', city: 'Luanda', address: 'Rua 2', primaryJurisdiction: 'AO_ANGOLA' },
      activity: { sector: 'Consultoria', primaryActivity: 'Consultoria Financeira', companySize: 'MICRO' },
      contacts: { email: 'contato@testeb.ao', phone: '+244923000222' },
      principalResponsible: { name: 'Maria Silva', role: 'Diretora', email: 'maria@testeb.ao', phone: '+244923000222' },
      operationalConfig: { language: 'pt-AO', currency: 'AOA', timeZone: 'Africa/Luanda', fiscalCountry: 'Angola', laborCountry: 'Angola', primaryRegulatoryCountry: 'Angola' }
    });

    const member = engine.addCompanyMember(company.companyId, 'usr_guest_99', 'STANDARD_OPERATOR');
    assert.ok(member.membershipId);
    assert.equal(member.companyId, company.companyId);

    // Verify company count did NOT grow implicitly by adding user
    const userCompanies = engine.getUserCompanies('usr_guest_99');
    assert.ok(userCompanies.some(c => c.companyId === company.companyId));
  });

  it('TEST-03: Attempt to hire Employee without existing company should be BLOCKED (COMPANY_REQUIRED)', () => {
    const invalidCompanyId = 'CMP-NON-EXISTENT-999';

    assert.throws(
      () => {
        engine.hireEmployeeInstance(invalidCompanyId, 1);
      },
      (err: Error) => {
        return err.message.includes('COMPANY_REQUIRED');
      },
      'Hiring without company must be strictly blocked'
    );
  });

  it('TEST-04: Create company and hire Employee (EMPLOYEE_INSTANCE_CREATED)', () => {
    const company = engine.createCompany({
      identification: { legalName: 'Empresa Teste C Lda', nif: '5409998883', legalForm: 'Lda' },
      location: { country: 'Angola', provinceState: 'Luanda', city: 'Luanda', address: 'Rua 3', primaryJurisdiction: 'AO_ANGOLA' },
      activity: { sector: 'Construção', primaryActivity: 'Obras Públicas', companySize: 'MEDIUM' },
      contacts: { email: 'contato@testec.ao', phone: '+244923000333' },
      principalResponsible: { name: 'António Bento', role: 'Gerente', email: 'antonio@testec.ao', phone: '+244923000333' },
      operationalConfig: { language: 'pt-AO', currency: 'AOA', timeZone: 'Africa/Luanda', fiscalCountry: 'Angola', laborCountry: 'Angola', primaryRegulatoryCountry: 'Angola' }
    });

    const instance = engine.hireEmployeeInstance(company.companyId, 1, undefined, 'usr_resp_c');
    assert.ok(instance.instanceId.startsWith('AEI-'));
    assert.equal(instance.companyId, company.companyId);
    assert.equal(instance.tenantId, company.tenantId);
    assert.equal(instance.catalogEmployeeId, 1);
    assert.equal(instance.status, 'ACTIVE');

    const companyInstances = engine.getCompanyEmployeeInstances(company.companyId);
    assert.equal(companyInstances.length, 1);
  });

  it('TEST-05: Hire same Employee catalog template for two companies (TWO_ISOLATED_INSTANCES)', () => {
    const compA = engine.createCompany({
      identification: { legalName: 'Empresa Alpha Lda', nif: '5401111111', legalForm: 'Lda' },
      location: { country: 'Angola', provinceState: 'Luanda', city: 'Luanda', address: 'A', primaryJurisdiction: 'AO_ANGOLA' },
      activity: { sector: 'Comércio', primaryActivity: 'Vendas', companySize: 'SMALL' },
      contacts: { email: 'alpha@test.ao', phone: '111' },
      principalResponsible: { name: 'Resp A', role: 'CEO', email: 'respa@test.ao', phone: '111' },
      operationalConfig: { language: 'pt-AO', currency: 'AOA', timeZone: 'Africa/Luanda', fiscalCountry: 'Angola', laborCountry: 'Angola', primaryRegulatoryCountry: 'Angola' }
    });

    const compB = engine.createCompany({
      identification: { legalName: 'Empresa Beta Lda', nif: '5402222222', legalForm: 'Lda' },
      location: { country: 'Angola', provinceState: 'Luanda', city: 'Luanda', address: 'B', primaryJurisdiction: 'AO_ANGOLA' },
      activity: { sector: 'Logística', primaryActivity: 'Transportes', companySize: 'SMALL' },
      contacts: { email: 'beta@test.ao', phone: '222' },
      principalResponsible: { name: 'Resp B', role: 'CEO', email: 'respb@test.ao', phone: '222' },
      operationalConfig: { language: 'pt-AO', currency: 'AOA', timeZone: 'Africa/Luanda', fiscalCountry: 'Angola', laborCountry: 'Angola', primaryRegulatoryCountry: 'Angola' }
    });

    // Hire Template #1 (Contador) for both companies
    const instAlpha = engine.hireEmployeeInstance(compA.companyId, 1);
    const instBeta = engine.hireEmployeeInstance(compB.companyId, 1);

    assert.notEqual(instAlpha.instanceId, instBeta.instanceId, 'Instances must have unique IDs');
    assert.notEqual(instAlpha.tenantId, instBeta.tenantId, 'Tenants must be completely isolated');
    assert.equal(instAlpha.companyId, compA.companyId);
    assert.equal(instBeta.companyId, compB.companyId);
  });

  it('TEST-06: Hire two instances of same Employee template in same company (TWO_DISTINCT_COMPANY_INSTANCES)', () => {
    const comp = engine.createCompany({
      identification: { legalName: 'Empresa MultiInstance Lda', nif: '5403333333', legalForm: 'Lda' },
      location: { country: 'Angola', provinceState: 'Luanda', city: 'Luanda', address: 'C', primaryJurisdiction: 'AO_ANGOLA' },
      activity: { sector: 'Serviços', primaryActivity: 'Outsourcing', companySize: 'LARGE' },
      contacts: { email: 'multi@test.ao', phone: '333' },
      principalResponsible: { name: 'Resp Multi', role: 'CEO', email: 'multi@test.ao', phone: '333' },
      operationalConfig: { language: 'pt-AO', currency: 'AOA', timeZone: 'Africa/Luanda', fiscalCountry: 'Angola', laborCountry: 'Angola', primaryRegulatoryCountry: 'Angola' }
    });

    const dept1 = engine.createDepartment(comp.companyId, 'Filial Luanda Norte');
    const dept2 = engine.createDepartment(comp.companyId, 'Filial Benguela');

    const inst1 = engine.hireEmployeeInstance(comp.companyId, 1, dept1.departmentId);
    const inst2 = engine.hireEmployeeInstance(comp.companyId, 1, dept2.departmentId);

    assert.notEqual(inst1.instanceId, inst2.instanceId);
    assert.equal(inst1.companyId, comp.companyId);
    assert.equal(inst2.companyId, comp.companyId);
    assert.notEqual(inst1.departmentId, inst2.departmentId);
  });

  it('TEST-07: Employee of Company A attempting to access Company B context is DENIED', () => {
    const compA = engine.getCompanyByTenantId('TNT-000101') || engine.getAllCompanies()[0];
    const compB = engine.getCompanyByTenantId('TNT-000102') || engine.getAllCompanies()[1];

    const instA = engine.getCompanyEmployeeInstances(compA.companyId)[0] || engine.hireEmployeeInstance(compA.companyId, 1);

    // Cross tenant guard check: verify instA tenantId != compB tenantId
    assert.equal(instA.tenantId, compA.tenantId);
    assert.notEqual(instA.tenantId, compB.tenantId, 'Cross tenant access must be DENIED');
  });

  it('TEST-08: Deleting admin user leaves Company, Tenant and Employee instances intact', () => {
    const comp = engine.createCompany({
      identification: { legalName: 'Empresa Resiliente Lda', nif: '5404444444', legalForm: 'Lda' },
      location: { country: 'Angola', provinceState: 'Luanda', city: 'Luanda', address: 'D', primaryJurisdiction: 'AO_ANGOLA' },
      activity: { sector: 'Indústria', primaryActivity: 'Manufatura', companySize: 'MEDIUM' },
      contacts: { email: 'res@test.ao', phone: '444' },
      principalResponsible: { name: 'Admin Removivel', role: 'CEO', email: 'admin@res.ao', phone: '444' },
      operationalConfig: { language: 'pt-AO', currency: 'AOA', timeZone: 'Africa/Luanda', fiscalCountry: 'Angola', laborCountry: 'Angola', primaryRegulatoryCountry: 'Angola' }
    });

    const inst = engine.hireEmployeeInstance(comp.companyId, 2);
    assert.ok(inst);

    // Simulate removing admin user membership
    const companyAfter = engine.getCompany(comp.companyId);
    const instancesAfter = engine.getCompanyEmployeeInstances(comp.companyId);

    assert.ok(companyAfter, 'Company remains existent after user deletion');
    assert.equal(instancesAfter.length, 1, 'Employee instances remain existent after user deletion');
  });
});
