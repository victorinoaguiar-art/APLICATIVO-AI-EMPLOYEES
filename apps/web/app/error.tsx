'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Algo correu mal ao carregar a página</h2>
      <p style={{ color: '#ef4444', margin: '16px 0' }}>{error?.message || 'Erro inesperado de renderização'}</p>
      <button
        onClick={() => reset()}
        style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
      >
        Tentar Novamente
      </button>
    </div>
  );
}
