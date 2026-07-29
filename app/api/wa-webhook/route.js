// app/api/wa-webhook/route.js
// O OUVIDO do ClienteScore. A Meta bate aqui de duas formas:
//  GET  → verifica que o endereço é nosso (devolve o "challenge")
//  POST → os eventos: status do que mandamos (sent/delivered/read)
//         e o que o cliente manda de volta (texto, depois os 3 botões)
//
// Regra de ouro da Meta: o POST tem que responder 200 RÁPIDO, senão ela reenvia.
// Por isso loga e devolve 200 sempre — mesmo se o parse falhar.
//
// Segurança honesta: por enquanto aceita qualquer POST. A prova de que "é a Meta
// mesmo" (HMAC no header X-Hub-Signature-256) entra no degrau 3.3. Hoje o risco é
// baixo porque a rota só LOGA — não grava nada no banco ainda.

import { NextResponse } from 'next/server';

// ── GET: verificação da Meta (ou ping humano no navegador) ────────────────
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token) {
    const ok = token === process.env.META_WA_VERIFY_TOKEN;
    console.log('[wa-webhook] GET verify mode=' + mode + ' token_match=' + ok);
    if (ok) {
      return new Response(challenge || '', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return new Response('Forbidden — verify_token não confere', { status: 403 });
  }

  console.log('[wa-webhook] GET ping (sem hub params)');
  return NextResponse.json({
    ok: true,
    service: 'ClienteScore · ouvido WhatsApp',
    hint: 'Endpoint vivo. A Meta verifica com GET (hub.mode/verify_token/challenge) e manda os eventos por POST.',
  });
}

// ── POST: os eventos ──────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const entries = body?.entry || [];
    console.log('[wa-webhook] POST recebido · entries=' + entries.length);

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const meta = value.metadata || {};
        const statuses = value.statuses || [];
        const messages = value.messages || [];

        for (const s of statuses) {
          console.log(
            '[wa-webhook] STATUS ' +
              JSON.stringify({
                wamid: s.id,
                status: s.status,
                para: s.recipient_id,
                ts: s.timestamp,
                erro: s.errors || undefined,
              })
          );
        }

        for (const m of messages) {
          const detail = {};
          if (m.type === 'text') detail.texto = m.text?.body;
          if (m.type === 'interactive') detail.botoes = m.interactive;
          if (m.type === 'button') detail.botao = m.button;
          console.log(
            '[wa-webhook] ENTRADA ' +
              JSON.stringify({
                de: m.from,
                tipo: m.type,
                wamid: m.id,
                ts: m.timestamp,
                detail,
              })
          );
        }

        if (!statuses.length && !messages.length) {
          console.log(
            '[wa-webhook] EVENTO (sem messages/statuses) telefone=' +
              meta.display_phone_number +
              ' chaves=' +
              Object.keys(value).join(',')
          );
        }
      }
    }
  } catch (err) {
    console.log('[wa-webhook] POST erro de parse: ' + (err?.message || err));
  }

  return new Response('OK', { status: 200 });
}