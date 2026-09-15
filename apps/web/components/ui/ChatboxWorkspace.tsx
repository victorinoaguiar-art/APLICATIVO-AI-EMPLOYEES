'use client';

import React, { useState } from 'react';
import { 
  Send, Paperclip, ShieldCheck, Database, FileText, 
  AlertTriangle, Cpu, FileSpreadsheet, Lock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'employee' | 'system' | 'approval';
  text: string;
  timestamp: string;
  type?: 'text' | 'event' | 'approval' | 'output';
  details?: Record<string, unknown>;
}

interface ChatboxWorkspaceProps {
  isDark?: boolean;
  employeeName?: string;
  employeeCode?: string;
  employeeRole?: string;
  tenantName?: string;
}

export const ChatboxWorkspace: React.FC<ChatboxWorkspaceProps> = ({
  isDark = true,
  employeeName = 'Contabilista Sénior & Fiscalista',
  employeeCode = 'AEI-000001',
  employeeRole: _employeeRole = 'Contabilidade & Legislação Fiscal',
  tenantName = 'MARVINE, LDA'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Por favor, realize a reconciliação bancária do mês de Agosto e verifique eventuais divergências fiscais na declaração de IVA.',
      timestamp: '18:42'
    },
    {
      id: '2',
      sender: 'system',
      text: '[event] Conexão com o ERP Primavera V10 e Banco RO estabelecida em modo REAL_API (SHA-256 Verified).',
      timestamp: '18:42',
      type: 'event'
    },
    {
      id: '3',
      sender: 'employee',
      text: 'Analisei os extratos do Banco RO e o balancete de Agosto do ERP Primavera. Identifiquei 2 lançamentos pendentes de suporte documental de Kz 450.000,00. O rascunho da declaração de IVA está pronto para validação.',
      timestamp: '18:43',
      type: 'text'
    },
    {
      id: '4',
      sender: 'approval',
      text: '[approval] Envio externo da Declaração de IVA à AGT exige aprovação do Administrador por política de risco R3.',
      timestamp: '18:43',
      type: 'approval'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState('TSK-2026-0842 — Reconciliação IVA Agosto');
  const [priority, setPriority] = useState('NORMAL');
  const [sendAs, setSendAs] = useState('mensagem');
  const [selectedOutput, setSelectedOutput] = useState('PDF');
  const [selectedSource] = useState('ERP Primavera + Banco RO');

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    const userPrompt = inputMessage;
    setInputMessage('');

    // Simulate AI Employee response
    setTimeout(() => {
      const responseMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'employee',
        text: `Comando processado com sucesso. Registei o pedido "${userPrompt.slice(0, 35)}..." no contexto da tarefa ${selectedTask}. A processar outputs em formato ${selectedOutput} com dados da fonte ${selectedSource}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 900);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 140px)', 
      minHeight: '600px', 
      background: isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff', 
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1', 
      borderRadius: '16px', 
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}>
      {/* HEADER DO CHATBOX (CHAT-01 SPEC) */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0', 
        background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: isDark ? '#f8fafc' : '#0f172a' }}>{employeeName}</span>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>
                {employeeCode}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏢 {tenantName}</span>
              <span>•</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>● ACTIVE</span>
              <span>•</span>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>● REAL_API</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select 
            value={selectedTask} 
            onChange={e => setSelectedTask(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '8px', 
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', 
              background: isDark ? '#1e293b' : '#ffffff', 
              color: isDark ? '#f8fafc' : '#0f172a', 
              fontSize: '0.78rem', 
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="TSK-2026-0842 — Reconciliação IVA Agosto">TSK-2026-0842 — Reconciliação IVA Agosto</option>
            <option value="TSK-2026-0910 — Declaração Modelo 1">TSK-2026-0910 — Declaração Modelo 1</option>
            <option value="Nova Task Operacional">+ Criar Nova Task no Chat</option>
          </select>
        </div>
      </div>

      {/* ÁREA PRINCIPAL 2 COLUNAS (CONVERSA À ESQUERDA, PAINEL CONTEXTO À DIREITA) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* COLUNA ESQUERDA: THREAD DE CONVERSA */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#ffffff' 
        }}>
          {/* MENSAGENS */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => {
              if (msg.type === 'event') {
                return (
                  <div key={msg.id} style={{ 
                    alignSelf: 'center', 
                    padding: '8px 14px', 
                    borderRadius: '8px', 
                    background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9', 
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    fontSize: '0.75rem', 
                    color: isDark ? '#94a3b8' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Database size={14} color="#3b82f6" />
                    <span>{msg.text}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{msg.timestamp}</span>
                  </div>
                );
              }

              if (msg.type === 'approval') {
                return (
                  <div key={msg.id} style={{ 
                    alignSelf: 'center', 
                    width: '100%',
                    maxWidth: '560px',
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: isDark ? 'rgba(234, 179, 8, 0.12)' : '#fef9c3', 
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    fontSize: '0.8rem', 
                    color: isDark ? '#fef08a' : '#854d0e',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                      <AlertTriangle size={16} color="#eab308" />
                      <span>Gate de Aprovação Humana Necessário</span>
                    </div>
                    <div>{msg.text}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button style={{ padding: '4px 12px', borderRadius: '6px', background: '#eab308', color: '#000', fontWeight: 700, border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Aprovar Envio
                      </button>
                      <button style={{ padding: '4px 12px', borderRadius: '6px', background: 'transparent', color: isDark ? '#fef08a' : '#854d0e', border: '1px solid rgba(234, 179, 8, 0.4)', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Rejeitar
                      </button>
                    </div>
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: isUser ? 'flex-end' : 'flex-start' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    marginBottom: '4px',
                    fontSize: '0.72rem',
                    color: isDark ? '#94a3b8' : '#64748b'
                  }}>
                    <span>{isUser ? 'Utilizador (Administrador)' : employeeName}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div style={{ 
                    maxWidth: '80%', 
                    padding: '12px 16px', 
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isUser ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : (isDark ? 'rgba(30, 41, 59, 0.9)' : '#f1f5f9'),
                    color: isUser ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                    border: isUser ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1'),
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* COMPOSER BAR (CHAT-01 SPEC) */}
          <form onSubmit={handleSendMessage} style={{ 
            padding: '14px 16px', 
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0', 
            background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* COMPOSER TOOLBAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isDark ? '#64748b' : '#64748b' }}>FERRAMENTAS:</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isDark ? '#1e293b' : '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                <Paperclip size={12} color="#3b82f6" />
                <span style={{ fontWeight: 600 }}>Anexo</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isDark ? '#1e293b' : '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                <Database size={12} color="#10b981" />
                <span style={{ fontWeight: 600 }}>{selectedSource}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Output:</span>
                <select value={selectedOutput} onChange={e => setSelectedOutput(e.target.value)} style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', background: isDark ? '#1e293b' : '#cbd5e1', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.72rem', fontWeight: 700 }}>
                  <option value="PDF">PDF</option>
                  <option value="XLSX">XLSX</option>
                  <option value="DOCX">DOCX</option>
                  <option value="TEXT">TEXTO</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Prioridade:</span>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', background: isDark ? '#1e293b' : '#cbd5e1', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.72rem', fontWeight: 700 }}>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">ALTA</option>
                  <option value="CRITICAL">CRÍTICA</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Enviar como:</span>
                <select value={sendAs} onChange={e => setSendAs(e.target.value)} style={{ padding: '2px 6px', borderRadius: '4px', border: 'none', background: isDark ? '#2563eb' : '#bfdbfe', color: isDark ? '#ffffff' : '#1e3a8a', fontSize: '0.72rem', fontWeight: 700 }}>
                  <option value="mensagem">Mensagem Directa</option>
                  <option value="task">Criar Nova Task</option>
                  <option value="comando">Comando Remoto</option>
                </select>
              </div>
            </div>

            {/* INPUT TEXTAREA & SUBMIT */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Escreva a instrução ou pedido ao AI Employee..."
                rows={2}
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  borderRadius: '10px', 
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1', 
                  background: isDark ? '#0f172a' : '#ffffff', 
                  color: isDark ? '#f8fafc' : '#0f172a', 
                  fontSize: '0.85rem', 
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button 
                  type="submit"
                  style={{ 
                    padding: '10px 18px', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                    color: '#ffffff', 
                    fontWeight: 700, 
                    border: 'none', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    fontSize: '0.82rem'
                  }}
                >
                  <Send size={15} /> Enviar ▸
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* COLUNA DIREITA: PAINEL DE CONTEXTO DA TASK (CHAT-01 SPEC) */}
        <div style={{ 
          width: '320px', 
          background: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc', 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          overflowY: 'auto',
          fontSize: '0.8rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Contexto da Task Activa
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: isDark ? '#0f172a' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1' }}>
              <div style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: '6px' }}>{selectedTask}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
                <span>Prioridade: <b style={{ color: '#eab308' }}>{priority}</b></span>
                <span>Prazo: <b>Hoje 23:59</b></span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Fontes Autorizadas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['ERP Primavera V10 (Fiscal API)', 'Extratos Banco RO (Open Banking)', 'AGT Código do IVA 2026', 'Google Drive Corporativo'].map((src, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '6px', background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{src}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Ficheiros & Evidências
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ padding: '8px 10px', borderRadius: '6px', background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileSpreadsheet size={14} color="#10b981" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Balancete_Agosto.xlsx</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: isDark ? '#64748b' : '#64748b' }}>2.4 MB</span>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '6px', background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="#3b82f6" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Rascunho_IVA_Agosto.pdf</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: isDark ? '#64748b' : '#64748b' }}>1.1 MB</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '10px', borderRadius: '8px', background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.72rem', color: isDark ? '#6ee7b7' : '#047857' }}>
            <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Prova de Integridade SHA-256
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all' }}>
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
