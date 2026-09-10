import type { APIRoute } from 'astro';

// Endpoint dinámico (no se prerenderiza)
export const prerender = false;

const TO_EMAIL = 'javier@javierpato.es';
const DEFAULT_FROM = 'Formulario javierpato.es <onboarding@resend.dev>';

// Campos que llegan del formulario de /contacto
type Lead = {
  servicio: string;
  negocio: string;
  webActual: string;
  presupuesto: string;
  plazo: string;
  nombre: string;
  contacto: string;
  origen?: string;
};

// Recorta y limpia. Nada de HTML entrando por la puerta de atrás.
function clean(v: unknown, max = 200): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Rate limit en memoria (best-effort, por instancia serverless) ---
// Evita que alguien reviente el buzón desde un script.
const HITS = new Map<string, number[]>();
const PER_HOUR = 12;
const HOUR = 3_600_000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) ?? []).filter((t) => now - t < HOUR);
  if (arr.length >= PER_HOUR) return false;
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 5000) for (const [k, v] of HITS) if (!v.some((t) => now - t < HOUR)) HITS.delete(k);
  return true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Petición no válida.' }, 400);
  }

  const lead: Lead = {
    servicio: clean(body?.servicio, 80),
    negocio: clean(body?.negocio, 120),
    webActual: clean(body?.webActual, 80),
    presupuesto: clean(body?.presupuesto, 80),
    plazo: clean(body?.plazo, 80),
    nombre: clean(body?.nombre, 80),
    contacto: clean(body?.contacto, 120),
    origen: clean(body?.origen, 40) || 'contacto',
  };

  // Mínimos para que el aviso sirva de algo: hay que poder responderle.
  if (!lead.nombre || !lead.contacto || !lead.servicio) {
    return json({ ok: false, error: 'Faltan nombre, contacto o servicio.' }, 400);
  }

  const ip = (request.headers.get('x-forwarded-for') ?? clientAddress ?? 'unknown').split(',')[0].trim();
  if (!rateLimit(ip)) {
    // No es un error del usuario legítimo: no bloqueamos su WhatsApp por esto.
    console.warn('lead rate-limited', ip);
    return json({ ok: true, delivered: false });
  }

  const apiKey = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  const from = import.meta.env.LEAD_FROM_EMAIL ?? process.env.LEAD_FROM_EMAIL ?? DEFAULT_FROM;

  // Sin clave configurada no se rompe nada: queda en los logs de Vercel.
  if (!apiKey) {
    console.log('[LEAD sin enviar por email]\n' + textBody(lead));
    return json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [TO_EMAIL],
        subject: `Lead web: ${lead.nombre} — ${lead.servicio}`,
        text: textBody(lead),
        html: htmlBody(lead),
        ...(looksLikeEmail(lead.contacto) ? { reply_to: lead.contacto } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('lead resend error', res.status, detail.slice(0, 500));
      console.log('[LEAD no entregado]\n' + textBody(lead));
      return json({ ok: true, delivered: false });
    }

    return json({ ok: true, delivered: true });
  } catch (e) {
    // Caiga lo que caiga, el usuario sigue su camino a WhatsApp.
    console.error('lead network error', e);
    console.log('[LEAD no entregado]\n' + textBody(lead));
    return json({ ok: true, delivered: false });
  }
};

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function textBody(l: Lead): string {
  return [
    `Nombre: ${l.nombre}`,
    `Contacto: ${l.contacto}`,
    `Necesita: ${l.servicio}`,
    `Negocio: ${l.negocio}`,
    `Web actual: ${l.webActual}`,
    `Presupuesto: ${l.presupuesto}`,
    `Plazo: ${l.plazo}`,
    `Origen: ${l.origen}`,
    `Fecha: ${new Date().toISOString()}`,
  ].join('\n');
}

function htmlBody(l: Lead): string {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#666;">${esc(k)}</td><td style="padding:6px 0;"><strong>${esc(v || '—')}</strong></td></tr>`;
  return [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:#111;">',
    `<h2 style="margin:0 0 4px;">Nuevo lead desde la web</h2>`,
    `<p style="margin:0 0 16px;color:#666;">Formulario de /${esc(l.origen || 'contacto')}</p>`,
    '<table style="border-collapse:collapse;">',
    row('Nombre', l.nombre),
    row('Contacto', l.contacto),
    row('Necesita', l.servicio),
    row('Negocio', l.negocio),
    row('Web actual', l.webActual),
    row('Presupuesto', l.presupuesto),
    row('Plazo', l.plazo),
    '</table>',
    '</div>',
  ].join('');
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/*
  Variables de entorno a configurar en Vercel (Project → Settings → Environment Variables):

  RESEND_API_KEY   Clave de API de Resend (empieza por "re_"). Sin ella el lead
                   no se envía por email pero SÍ queda registrado en los logs y
                   el formulario sigue funcionando con normalidad.
  LEAD_FROM_EMAIL  Remitente del aviso, con dominio verificado en Resend.
                   Ej: "Formulario javierpato.es <web@javierpato.es>".
                   Si no se define se usa "Formulario javierpato.es <onboarding@resend.dev>".
*/
