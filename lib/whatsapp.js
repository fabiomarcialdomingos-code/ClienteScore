// lib/whatsapp.js
// Cano oficial da Meta Cloud API. Remetente único do ClienteScore (decisão A).
// O token é segredo: vive só no .env.local. Nunca no banco, nunca no chat.

function getConfig() {
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
  const token = process.env.META_WA_TOKEN;
  const graphVersion = process.env.META_GRAPH_VERSION || 'v21.0';

  if (!phoneNumberId || !token) {
    throw new Error(
      'Config da Meta ausente no .env.local. Precisam existir: META_WA_PHONE_NUMBER_ID e META_WA_TOKEN.'
    );
  }
  return { phoneNumberId, token, graphVersion };
}

async function post(payload) {
  const { phoneNumberId, token, graphVersion } = getConfig();

  const res = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const e = data?.error || {};
    throw new Error(
      `Meta API (${res.status}) código ${e.code ?? '?'}: ${e.message || JSON.stringify(data)}`
    );
  }
  return data;
}

// Texto simples — teste. Não precisa de template aprovado.
export async function sendText({ to, text }) {
  return post({ to, type: 'text', text: { body: text, preview_url: false } });
}

// Template — produção (convites). Exige template APPROVED (cômodo 4).
export async function sendTemplate({ to, name, language = 'pt_BR', components }) {
  return post({
    to,
    type: 'template',
    template: { name, language: { code: language }, components },
  });
}