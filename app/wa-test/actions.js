'use server';

import { sendText } from '@/lib/whatsapp';

export async function sendTestMessage(prev, formData) {
  const to = (formData.get('to') || '').replace(/\D/g, '');

  if (!to) {
    return { ok: false, message: 'Informe o número com DDI e DDD, só dígitos. Ex.: 5511999999999' };
  }

  try {
    const data = await sendText({
      to,
      text: '✅ Teste ClienteScore — a boca oficial falou. Se esta mensagem chegou, o cano da Meta tá ligado.',
    });
    const id = data?.messages?.[0]?.id || '(sem id)';
    return { ok: true, message: `Enviado. ID da mensagem: ${id}` };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}