const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../apps/web/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const oldHandlers = `  const handleDispatchCommand = () => {
    setCmdError(null);
    try {
      let rawPayload: any = { text: cmdText };
      if (cmdChannel === 'DOCUMENT_INGESTION') {
        rawPayload = DocumentMediaAdapter.adaptDocumentUpload('invoice_scan_04.pdf', 'pdf', 'application/pdf', cmdText);
      } else if (cmdChannel === 'EXCEL_POWERQUERY') {
        rawPayload = ExcelIntegrationAdapter.adaptPowerQuerySync('Sheet1', [{ row: 1, account: '6011', amount: 5400 }], 'EXCEL_ADDIN');
      } else if (cmdChannel === 'SYSTEM_EVENT_WEBHOOK') {
        rawPayload = SystemEventWebhookAdapter.adaptWebhook('salesforce.lead.created', { leadId: 'LD-9912', value: 85000 });
      }

      const role = CANONICAL_500_ROLES.find(r => r.id === cmdTargetRoleId) || CANONICAL_500_ROLES[0];
      const targetRoleKey = role.role_key;

      const envelope = commandEngine.normalizeCommand({
        channel: cmdChannel,
        rawPayload,
        targetRoleKey,
        tenantId: cmdTenantId,
        actorId: 'user_admin_001',
        requireRiskCheck: true
      });

      setCmdLastEnvelope(envelope);
      setCmdHistory(prev => [envelope, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setCmdError(err.message || 'Erro ao normalizar comando');
    }
  };

  const handleTriggerEvent = () => {
    try {
      const parsedData = JSON.parse(eventPayloadInput);
      const signature = 'sig_' + Math.random().toString(36).substring(2, 12);
      const res = eventEngine.ingestEvent({
        eventId: 'evt_' + Date.now(),
        topic: eventTopicInput,
        source: eventSourceInput,
        tenantId: cmdTenantId,
        timestamp: Date.now(),
        payload: parsedData,
        signature
      });
      setEventSimResult(res);
    } catch (err: any) {
      setEventSimResult({ success: false, error: err.message });
    }
  };

  const handleRunHandoffPipeline = () => {
    setHandoffRunning(true);
    setHandoffLogs(['[START] Iniciando pipeline de handoff automatizado (Faturas -> Lançamentos -> Impostos -> Relatório)...']);
    setHandoffChainState(prev => prev.map((s, idx) => ({ ...s, status: idx === 0 ? 'RUNNING' : 'PENDING' })));

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 4) {
        setHandoffChainState(prev =>
          prev.map((s, idx) => {
            if (idx < currentStep - 1) return { ...s, status: 'COMPLETED' };
            if (idx === currentStep - 1) return { ...s, status: 'RUNNING' };
            return { ...s, status: 'PENDING' };
          })
        );
        const sourceRole = CANONICAL_500_ROLES.find(r => r.id === handoffChainState[currentStep - 1]?.roleId);
        const targetRole = CANONICAL_500_ROLES.find(r => r.id === handoffChainState[currentStep]?.roleId);
        if (sourceRole && targetRole) {
          const handoffRes = handoffRouter.routeHandoff({
            sourceRoleKey: sourceRole.role_key,
            targetRoleKey: targetRole.role_key,
            tenantId: cmdTenantId,
            workflowId: 'wf_month_end_2026_09',
            handoffArtifacts: [{ artifactId: \`art_step_\${currentStep}\`, title: \`Artefacto da Etapa \${currentStep}\`, format: 'JSON' }],
            notes: \`Handoff executado de \${sourceRole.display_name} para \${targetRole.display_name}\`
          });
          setHandoffLogs(prev => [
            ...prev,
            \`[STEP \${currentStep}] Handoff Token: \${handoffRes.handoffId} | De #\${sourceRole.id} para #\${targetRole.id} | Validação HMAC: OK\`
          ]);
        }
      } else {
        clearInterval(interval);
        setHandoffChainState(prev => prev.map(s => ({ ...s, status: 'COMPLETED' })));
        setHandoffLogs(prev => [...prev, '[SUCCESS] Pipeline de handoff concluído com sucesso com 100% de rastreabilidade de audit trail!']);
        setHandoffRunning(false);
      }
    }, 1000);
  };`;

const newHandlers = `  const handleDispatchCommand = () => {
    setCmdError(null);
    try {
      let envelope: any = null;
      const targetEmpId = Number(cmdTargetRoleId) || 73;

      if (cmdChannel === 'DOCUMENT_INGESTION') {
        envelope = DocumentMediaAdapter.parseFileIntake(cmdTenantId, 'user_admin_001', 'invoice_scan_04.pdf', 'pdf', 2048, targetEmpId);
      } else if (cmdChannel === 'EXCEL_POWERQUERY') {
        envelope = ExcelIntegrationAdapter.parseExcelSync(cmdTenantId, 'Demonstracoes.xlsx', 'Sheet1', 120, targetEmpId);
      } else if (cmdChannel === 'HUMAN_PROMPT') {
        envelope = HumanCommandAdapter.parseTextCommand(cmdTenantId, 'user_admin_001', cmdText, targetEmpId);
      } else {
        envelope = CommandNormalizationEngine.normalize({
          organizationId: cmdTenantId,
          tenantId: cmdTenantId,
          sourceType: 'HUMAN_COMMAND',
          sourceChannel: 'WebConsole',
          sourceActorType: 'HUMAN',
          sourceActorId: 'user_admin_001',
          rawInput: cmdText,
          requestedEmployeeId: targetEmpId
        });
      }

      setCmdLastEnvelope(envelope);
      setCmdHistory(prev => [envelope, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setCmdError(err.message || 'Erro ao normalizar comando');
    }
  };

  const handleTriggerEvent = () => {
    try {
      const parsedData = JSON.parse(eventPayloadInput);
      const nowStr = new Date().toISOString();
      const eventEnv = {
        eventId: 'evt_' + Date.now(),
        organizationId: cmdTenantId,
        tenantId: cmdTenantId,
        eventType: eventTopicInput,
        eventVersion: '1.0.0',
        sourceSystem: eventSourceInput,
        occurredAt: nowStr,
        receivedAt: nowStr,
        payload: parsedData,
        payloadSchema: 'schema_v1',
        classification: 'INTERNAL',
        sensitivity: 'MEDIUM',
        producer: eventSourceInput,
        correlationId: 'corr_' + Date.now(),
        idempotencyKey: 'idemp_' + Date.now(),
        traceId: 'trace_' + Date.now()
      };

      const resEnvelope = eventEngine.processBusinessEvent(eventEnv);
      setEventSimResult({
        success: true,
        idempotencyKey: eventEnv.idempotencyKey,
        matchedRule: { targetRoleId: resEnvelope?.requestedEmployeeId, targetRoleKey: resEnvelope?.requestedRoleKey },
        envelope: resEnvelope
      });
    } catch (err: any) {
      setEventSimResult({ success: false, error: err.message });
    }
  };

  const handleRunHandoffPipeline = () => {
    setHandoffRunning(true);
    setHandoffLogs(['[START] Iniciando pipeline de handoff automatizado (Faturas -> Lançamentos -> Impostos -> Relatório)...']);
    setHandoffChainState(prev => prev.map((s, idx) => ({ ...s, status: idx === 0 ? 'RUNNING' : 'PENDING' })));

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 4) {
        setHandoffChainState(prev =>
          prev.map((s, idx) => {
            if (idx < currentStep - 1) return { ...s, status: 'COMPLETED' };
            if (idx === currentStep - 1) return { ...s, status: 'RUNNING' };
            return { ...s, status: 'PENDING' };
          })
        );
        const sourceRoleId = Number(handoffChainState[currentStep - 1]?.roleId);
        const targetRoleId = Number(handoffChainState[currentStep]?.roleId);
        if (sourceRoleId && targetRoleId) {
          const hdfToken = 'hdf_token_' + Date.now();
          const cmdEnv = handoffRouter.dispatchHandoff({
            handoffId: hdfToken,
            organizationId: cmdTenantId,
            fromEmployeeId: sourceRoleId,
            toEmployeeId: targetRoleId,
            sourceTaskId: 'task_step_' + currentStep,
            nextTaskType: 'PROCESS_WORKFLOW_STEP',
            workProductRefs: ['wp_step_' + currentStep],
            dataProductRefs: ['dp_step_' + currentStep],
            documentRefs: ['doc_step_' + currentStep + '.pdf'],
            requiredAction: 'Executar próxima etapa do workflow',
            contextRefs: ['ctx_step_' + currentStep],
            riskLevel: 'R2',
            correlationId: 'corr_hdf_' + Date.now(),
            traceId: 'trace_hdf_' + Date.now()
          });

          setHandoffLogs(prev => [
            ...prev,
            \`[STEP \${currentStep}] Handoff Token: \${hdfToken} | De #\${sourceRoleId} para #\${targetRoleId} | CommandId: \${cmdEnv.commandId} | HMAC: OK\`
          ]);
        }
      } else {
        clearInterval(interval);
        setHandoffChainState(prev => prev.map(s => ({ ...s, status: 'COMPLETED' })));
        setHandoffLogs(prev => [...prev, '[SUCCESS] Pipeline de handoff concluído com sucesso com 100% de rastreabilidade de audit trail!']);
        setHandoffRunning(false);
      }
    }, 1000);
  };`;

content = content.replace(oldHandlers, newHandlers);
fs.writeFileSync(pagePath, content, 'utf8');
console.log('page.tsx handlers updated successfully!');
