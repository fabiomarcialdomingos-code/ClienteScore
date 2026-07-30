// app/api/wa-webhook/route.js — OUVIDO com tranca HMAC
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Confere a assinatura que a Meta põe no header X-Hub-Signature-256.
function verifySignature(raw, header, secret) {
  if (!header || !header.startsWith('sha256=')) return false;
  const sig = header.slice(7);
  const expected = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// GET: verificação da Meta / ping
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token) {
    const ok = token === process.env.META_WA_VERIFY_TOKEN;
    console.log('[wa-webhook] GET verify mode=' + mode + ' token_match=' + ok);
    if (ok) return new Response(challenge || '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    return new Response('Forbidden', { status: 403 });
  }
  return NextResponse.json({ ok: true, service: 'ClienteScore · ouvido WhatsApp' });
}

// POST: eventos, com tranca
export async function POST(request) {
  const secret = process.env.META_APP_SECRET;
  const raw = await request.text();

  if (secret) {
    const sig = request.headers.get('x-hub-signature-256');
    if (!verifySignature(raw, sig, secret)) {
      console.log('[wa-webhook] POST rejeitado: HMAC inválido/ausente');
      return new Response('Unauthorized', { status: 401 });
    }
  } else {
    console.log('[wa-webhook] AVISO: META_APP_SECRET ausente — HMAC desativado');
  }

  let body;
  try { body = JSON.parse(raw); }
  catch { console.log('[wa-webhook] POST body não-JSON'); return new Response('OK', { status: 200 }); }

  try {
    const entries = body?.entry || [];
    console.log('[wa-webhook] POST recebido · entries=' + entries.length);
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const meta = value.metadata || {};
        const statuses = value.statuses || [];
        const messages = value.messages || [];
        for (const s of statuses) {
          console.log('[wa-webhook] STATUS ' + JSON.stringify({ wamid: s.id, status: s.status, para: s.recipient_id, ts: s.timestamp, erro: s.errors || undefined }));
        }
        for (const m of messages) {
          const detail = {};
          if (m.type === 'text') detail.texto = m.text?.body;
          if (m.type === 'interactive') detail.botoes = m.interactive;
          if (m.type === 'button') detail.botao = m.button;
          console.log('[wa-webhook] ENTRADA ' + JSON.stringify({ de: m.from, tipo: m.type, wamid: m.id, ts: m.timestamp, detail }));
        }
        if (!statuses.length && !messages.length) {
          console.log('[wa-webhook] EVENTO telefone=' + meta.display_phone_number + ' chaves=' + Object.keys(value).join(','));
        }
      }
    }
  } catch (err) {
    console.log('[wa-webhook] POST erro de parse: ' + (err?.message || err));
  }
  return new Response('OK', { status: 200 });
}