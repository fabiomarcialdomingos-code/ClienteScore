// app/api/wa-webhook/route.js — OUVIDO com tranca HMAC + opt-out (PARAR)
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

const OPT_OUT_REGEX =
  /\b(parar|pare|stop|cancelar|sair|opt[- ]?out|nao\s+quero|quero\s+parar|quero\s+sair|remover\s+numero|remover\s+meu\s+numero)\b/i;

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isOptOutText(value) {
  const text = normalizeText(value);
  if (!text) return false;
  return OPT_OUT_REGEX.test(text);
}

async function tryOptOut({ phoneNumberId, from, text, messageId }) {
  try {
    if (!phoneNumberId || !from) {
      console.log(
        '[wa-webhook] OPT-OUT ignorado: faltou phone_number_id/from · phone_number_id=' +
          String(phoneNumberId || '') +
          ' · from=' +
          String(from || '')
      );
      return;
    }

    const { error } = await supabase.rpc('customer_opt_out', {
      p_phone_number_id: String(phoneNumberId),
      p_whatsapp: String(from),
    });

    if (error) {
      console.log('[wa-webhook] OPT-OUT erro RPC: ' + (error?.message || error));
      return;
    }

    console.log(
      '[wa-webhook] OPT-OUT aplicado: phone_number_id=' +
        phoneNumberId +
        ' · from=' +
        from +
        ' · texto="' +
        String(text || '') +
        '" · wamid=' +
        String(messageId || '')
    );
  } catch (err) {
    console.log('[wa-webhook] OPT-OUT exceção: ' + (err?.message || err));
  }
}

function extractMessageText(m) {
  if (!m) return null;

  if (m.type === 'text') {
    return m.text?.body || null;
  }

  if (m.type === 'button') {
    return m.button?.text || m.button?.payload || null;
  }

  if (m.type === 'interactive') {
    const interactive = m.interactive || {};

    if (interactive.type === 'button_reply') {
      return interactive.button_reply?.title || interactive.button_reply?.id || null;
    }

    if (interactive.type === 'list_reply') {
      return interactive.list_reply?.title || interactive.list_reply?.id || null;
    }
  }

  return null;
}

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

    return new Response('Forbidden', { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    service: 'ClienteScore · ouvido WhatsApp',
  });
}

export async function POST(request) {
  try {
    const secret = process.env.META_APP_SECRET;
    const raw = await request.text();

    if (secret) {
      const sig = request.headers.get('x-hub-signature-256');

      if (!verifySignature(raw, sig, secret)) {
        console.log('[wa-webhook] POST rejeitado: HMAC inválido/ausente');
        return new Response('OK', { status: 200 });
      }
    } else {
      console.log('[wa-webhook] AVISO: META_APP_SECRET ausente — HMAC desativado');
    }

    let body;

    try {
      body = JSON.parse(raw);
    } catch {
      console.log('[wa-webhook] POST body não-JSON');
      return new Response('OK', { status: 200 });
    }

    const entries = body?.entry || [];

    console.log('[wa-webhook] POST recebido · entries=' + entries.length);

    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const meta = value.metadata || {};
        const statuses = value.statuses || [];
        const messages = value.messages || [];

        const phoneNumberId = meta.phone_number_id || null;

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
          const text = extractMessageText(m);

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
                phone_number_id: phoneNumberId,
                detail,
              })
          );

          if (text && isOptOutText(text)) {
            await tryOptOut({
              phoneNumberId,
              from: m.from,
              text,
              messageId: m.id,
            });
          }
        }

        if (!statuses.length && !messages.length) {
          console.log(
            '[wa-webhook] EVENTO telefone=' +
              String(meta.display_phone_number || '') +
              ' phone_number_id=' +
              String(phoneNumberId || '') +
              ' chaves=' +
              Object.keys(value).join(',')
          );
        }
      }
    }
  } catch (err) {
    console.log('[wa-webhook] POST erro inesperado: ' + (err?.message || err));
  }

  return new Response('OK', { status: 200 });
}