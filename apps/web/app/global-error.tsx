'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt">
      <body style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center', background: '#0f172a', color: '#fff' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>Erro Global da Aplicação</h2>
        <p style={{ color: '#9ca3af', margin: '16px 0' }}>{error?.message || 'Ocorreu uma falha no servidor'}</p>
        <button
          onClick={() => reset()}
          style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
        >
          Recarregar Aplicação
        </button>
      </body>
    </html>
  );
}
