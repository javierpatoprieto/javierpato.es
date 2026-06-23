import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

// Endpoint dinámico (no se prerenderiza)
export const prerender = false;

const SYSTEM = `Eres el asistente virtual de Javier Pato, diseñador web y de marca afincado en Cantabria (España). Atiendes el chat de su web javierpato.es. Hablas SIEMPRE en español, con tono cercano, claro y sin tecnicismos. Respuestas breves (2-4 frases máximo), útiles y orientadas a ayudar al visitante y, cuando encaje, invitarle a dar el paso (reservar una charla de 20 min sin compromiso, escribir por WhatsApp o ir a /contacto).

QUÉ OFRECE JAVIER:
- Diseño de páginas web a medida, rápidas y pensadas para vender, con SEO local incluido.
- Diseño de marca, logotipo, diseño gráfico y dirección de arte con IA.
- Trabaja con negocios de toda Cantabria (Santander, Torrelavega, etc.) y también en remoto.

PRECIOS (web):
- One-page (1 página): desde 299€, entrega en 3 días.
- Básica (4 páginas): 549€, entrega en 1 semana.
- Pro (6 páginas): 699€, entrega en 1 semana.
- Tienda online: desde 999€, entrega en 2-3 semanas.
- Extras opcionales: dominio 19,99€/año, alojamiento 49€/año, mantenimiento 190€/año.
Los precios de marca/branding se ven según el proyecto.

CONTACTO:
- WhatsApp/teléfono: +34 669 385 624
- Email: javier@javierpato.es
- Páginas útiles: /precios (configurador con presupuesto al momento) y /contacto.

REGLAS:
- No inventes datos, plazos ni precios que no estén aquí. Si no sabes algo, dilo y sugiere hablar directamente con Javier.
- Si preguntan algo ajeno al diseño web/marca o piden tareas raras, redirige con amabilidad al tema o a contactar con Javier.
- No prometas en nombre de Javier nada cerrado; el presupuesto final se confirma en una charla de 20 min.`;

const MODEL = 'claude-haiku-4-5-20251001';

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'Servicio no configurado.' }, 500);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Petición no válida.' }, 400);
  }

  const raw = Array.isArray(body?.messages) ? body.messages : [];
  // Guardarraíles: solo roles válidos, recorta longitud y nº de mensajes
  const messages = raw
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .slice(-12)
    .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: String(m.content).slice(0, 2000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return json({ error: 'No hay mensaje del usuario.' }, 400);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      messages,
    });
    const reply = res.content
      .filter((b) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim();
    return json({ reply: reply || 'Perdona, no te he entendido. ¿Puedes reformularlo?' });
  } catch (e) {
    console.error('chat error', e);
    return json({ error: 'Ahora mismo no puedo responder. Escríbeme por WhatsApp al +34 669 385 624.' }, 502);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
