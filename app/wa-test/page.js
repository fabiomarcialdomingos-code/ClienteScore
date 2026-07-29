'use client';

import { useActionState } from 'react';
import { sendTestMessage } from './actions';

const initial = { ok: null, message: '' };

export default function WaTestPage() {
  const [state, formAction, pending] = useActionState(sendTestMessage, initial);

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Teste do cano WhatsApp</h1>
        <p style={styles.p}>
          Manda uma mensagem de texto simples pro número abaixo. Em modo de
          desenvolvimento, só chega nos números cadastrados como destinatários
          de teste no App da Meta (API Setup → To).
        </p>

        <form action={formAction} style={styles.form}>
          <label style={styles.label} htmlFor="to">Número do destinatário (com DDI)</label>
          <input id="to" name="to" placeholder="5511999999999" style={styles.input} />
          <button type="submit" disabled={pending} style={styles.button}>
            {pending ? 'Enviando…' : 'Mandar mensagem de teste'}
          </button>
        </form>

        {state.message && (
          <p style={{ ...styles.result, ...(state.ok ? styles.ok : styles.err) }}>
            {state.message}
          </p>
        )}
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    background: '#0B1120',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: 'Sora, system-ui, sans-serif',
    color: '#E7ECF5',
  },
  card: {
    background: '#111A2E',
    border: '1px solid #24304A',
    borderRadius: 16,
    padding: 32,
    maxWidth: 480,
    width: '100%',
  },
  h1: {
    fontFamily: '"Alfa Slab One", Sora, serif',
    fontSize: 24,
    margin: '0 0 12px',
    color: '#F5B841',
  },
  p: { fontSize: 14, lineHeight: 1.6, color: '#AAB6CC', margin: '0 0 20px' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 13, color: '#AAB6CC' },
  input: {
    background: '#0B1120',
    border: '1px solid #24304A',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#E7ECF5',
    fontSize: 15,
  },
  button: {
    background: '#F5B841',
    color: '#0B1120',
    border: 'none',
    borderRadius: 10,
    padding: '14px 16px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  result: { fontSize: 14, marginTop: 20, padding: 12, borderRadius: 10 },
  ok: { background: 'rgba(74,222,128,0.12)', color: '#4ADE80' },
  err: { background: 'rgba(248,113,113,0.12)', color: '#F87171' },
};