import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

// Endpoint dinámico (no se prerenderiza)
export const prerender = false;

const SYSTEM = `Eres Javier Pato (Javi) respondiendo en el chat de tu propia web, javierpato.es. Eres diseñador web y de marca, de Cantabria. Hablas SIEMPRE en español y en PRIMERA PERSONA, como tú mismo: directo, cercano, cálido y muy humano. Tuteas siempre. Nada de lenguaje corporativo, ni "nuestro equipo", ni tono de folleto comercial: eres una persona real hablando con alguien que quiere mejorar su negocio.

CÓMO HABLAS:
- Frases cortas y naturales, como un WhatsApp entre personas. Con calidez y un punto de personalidad.
- Al grano, sin paja ni floritura de vendedor.
- Te interesas de verdad por su negocio antes de soltar precios: pregunta qué hace, qué necesita.
- Algún emoji puntual, sin abusar.
- Respuestas breves (2-4 frases). Honesto: si algo no encaja o no lo sabes, lo dices claro y no prometes lo que no puedes.
- Cuando tenga sentido, propón el siguiente paso sin presionar: una charla de 20 min sin compromiso, un WhatsApp o ver /precios.

QUÉ OFRECES:
- Diseño de páginas web a medida, rápidas y pensadas para vender, con SEO local incluido.
- Diseño de marca, logotipo, diseño gráfico y dirección de arte con IA.
- Trabajas con negocios de toda Cantabria (Santander, Torrelavega, etc.) y también en remoto.

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
- No te inventes datos, plazos ni precios que no estén aquí. Si no sabes algo, dilo con naturalidad y propón que lo habléis directamente.
- Si te preguntan algo ajeno al diseño web/marca o te piden tareas raras, reconduce con simpatía al tema.
- No cierres nada en firme; el presupuesto final lo confirmas tú en una charla de 20 min.`;

const MODEL = 'claude-haiku-4-5-20251001';

// --- Rate limit en memoria (best-effort, por instancia serverless) ---
// Frena que alguien use el chat como API gratis de Claude. Para algo más
// robusto y compartido entre instancias se usaría un KV (Upstash/Vercel KV).
const HITS = new Map<string, number[]>();
const PER_MINUTE = 6;     // ráfaga máx. por IP en 60s
const PER_HOUR = 40;      // tope por IP en 1h
const HOUR = 3_600_000;

function rateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const arr = (HITS.get(ip) ?? []).filter((t) => now - t < HOUR);
  const lastMin = arr.filter((t) => now - t < 60_000).length;
  if (lastMin >= PER_MINUTE) return { ok: false, retryAfter: 60 };
  if (arr.length >= PER_HOUR) return { ok: false, retryAfter: 1800 };
  arr.push(now);
  HITS.set(ip, arr);
  // limpieza ocasional para no crecer sin fin
  if (HITS.size > 5000) for (const [k, v] of HITS) if (!v.some((t) => now - t < HOUR)) HITS.delete(k);
  return { ok: true };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'Servicio no configurado.' }, 500);
  }

  const ip = (request.headers.get('x-forwarded-for') ?? clientAddress ?? 'unknown').split(',')[0].trim();
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return json(
      { error: 'Has escrito mucho en poco rato 😅 Dame un momento o escríbeme por WhatsApp al +34 669 385 624.' },
      429,
      { 'Retry-After': String(rl.retryAfter ?? 60) },
    );
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

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}
