# design.md — javierpato.es

> Sistema de diseño derivado de **benshih.design** y adaptado a Javier Pato:
> diseñador web + gráfico + creativo visual con IA, estudio contemporáneo en Cantabria,
> oferta de lanzamiento desde 299€, ArtiMindArt como autoridad IA.
>
> Referencia: https://www.benshih.design/ — copiar "más o menos" su lenguaje.
> ⚠️ Nota: redactado a partir de una lectura ESTRUCTURAL de la web (no he podido verla:
> macOS 13 bloquea el screenshot remoto y el dominio está vetado en el navegador controlado).
> Los puntos marcados ⚠️ hay que confirmarlos contra capturas reales.
>
> (Sustituye al design.md anterior basado en We Are Yellow / theme-per-project, descartado.)

---

## 1. Concepto

**Portfolio personal con alma de estudio.** No es un sitio corporativo frío ni un freelance
low-cost: es la web de **una persona con criterio** que enseña su trabajo con claridad,
calidez y confianza. El equilibrio clave (igual que Ben Shih):

> **Credibilidad profesional × personalidad creativa.**
> Casos serios y resultados medibles, contados con un tono cercano y humano.

Principio rector: **claridad, personalidad e impacto demostrable.** Cada sección responde a
"¿qué hace?, ¿para quién?, ¿con qué resultado?", sin postureo.

---

## 2. Voz y tono

- **Primera persona, conversacional.** "Hola, soy Javier." Habla como una persona, no como
  una agencia. Nada de "soluciones 360" ni "sinergias".
- **Cercano pero con autoridad.** Tutea, directo, pero respalda con trabajo y resultados.
- **Concreto.** Frases cortas. Beneficio claro. Cifras cuando las haya (2 semanas, desde 299€).
- **Bilingüe opcional** (ES principal, EN para ArtiMindArt / alcance internacional). ⚠️ decidir.

Ejemplos de copy:
- Hero: *"Hola, soy Javier. Diseñador y creativo visual."*
- Sub: *"Diseño marca y web para negocios de Cantabria de día, y exploro la imagen con IA como ArtiMindArt de noche."*
- CTA: *"Ver trabajo reciente"* · *"Saber más sobre mí"* · *"Saluda 👋"*

---

## 3. Paleta

Light-first, cálida, alto contraste, **acento mínimo** (protagonismo del trabajo y el tipo).

```
FONDO
  --bg            #FBFAF7   /* off-white cálido, NO #fff puro */
  --bg-card       #FFFFFF   /* tarjetas que "levantan" */
  --bg-soft       #F2F0EA   /* bloques suaves / hover */

TEXTO
  --ink           #1A1A18   /* casi negro, cálido */
  --ink-soft      #5C5A54   /* secundario / descripciones */
  --ink-mute      #908E86   /* metadatos, años, captions */

LÍNEA
  --hairline      #E7E4DC

ACENTO (uno solo)
  --accent        #7D1D2D   /* granate / vino tinto — el que te gusta */
  --accent-ink    #5F1421   /* texto/hover del acento sobre claro (AA) */
```

Reglas:
- El acento aparece en hovers, un enlace, el punto de marca, un estado activo. **Nunca**
  rellenando áreas grandes.
- Cero gradientes, cero sombras de color. Sombras solo suaves y neutras en tarjetas.
- Los logos de marcas/clientes pueden llevar su color real (pequeños), como los iconos de Ben. ⚠️

---

## 4. Tipografía

benshih usa **sans-serif moderna, tech-forward**, con jerarquía marcada y mucho aire.

```
--font-sans:  'Hanken Grotesk' / 'General Sans' / 'Geist'   /* humanista, cálida */
--font-mono:  'JetBrains Mono'                               /* metadatos, años, etiquetas */
```
⚠️ Confirmar la fuente exacta de Ben. Por defecto: **Hanken Grotesk** (humanista, redondeada,
cercana — encaja con el tono).

Escala (fluida):
```
--fs-hero     clamp(2.6rem, 6vw, 5rem)
--fs-h2       clamp(1.8rem, 3.5vw, 3rem)
--fs-h3       clamp(1.2rem, 2vw, 1.6rem)
--fs-lead     clamp(1.05rem, 1.6vw, 1.35rem)
--fs-body     1.0625rem (17px)
--fs-meta     0.75rem  uppercase, tracking 0.12em
```
- Titulares: 500–700, tracking -0.02em, `text-wrap: balance`.
- Cuerpo: 400, line-height 1.6, medida máx ~62ch.
- Metadatos en mono o uppercase pequeño → textura editorial.

---

## 5. Espaciado y layout

- **Base 8**, escala: 4·8·16·24·40·64·96·160.
- **Contenedor centrado**, max-width ~1080–1200px. Contenido **alineado a la izquierda**.
- Márgenes: 20–40px móvil · 64–100px desktop.
- **Aire vertical generoso** entre secciones: 80–128px.
- Ritmo: texto estrecho rodeado de vacío; rejillas de trabajo/logos que respiran.

---

## 6. Componentes

- **Tarjeta de proyecto:** título + descripción 1–2 frases + estado (`Live` / `Caso` / `Password`).
  Esquinas redondeadas (~14–16px ⚠️), fondo blanco o borde hairline, hover sutil (elevación +
  título en acento).
- **Divisores por año:** `2026 → 2025 → 2024` como cabeceras que ordenan el trabajo. (Firma benshih.)
- **Píldoras / CTAs:** botón pill outline, hover rellena con acento. Principal "Saluda 👋" + icono social.
- **Rejilla de logos:** "Otras cosas que hago" / apps → grid de iconos de marca.
- **Tarjetas de artículo:** con contador de lecturas ("56k lecturas") → prueba social.
- **Testimonios:** citas cortas de clientes/colaboradores.
- **Detalles dibujados a mano:** flecha de cursor, línea-divisor, retrato lineart. Aportan la
  personalidad — clave para no parecer plantilla. ⚠️ recrear con criterio propio, NO copiar sus assets.

---

## 7. Motion

- **Sutil y con intención**, no protagonista. benshih es calma + claridad, no scroll espectacular.
- Reveal suave en viewport (fade + 12–20px), stagger ligero en rejillas.
- Hover de tarjetas: elevación + título al acento.
- Header fijo/sticky. Respeta `prefers-reduced-motion`.
- Nada de bounce, parallax agresivo ni gimmicks.

---

## 8. Estructura de secciones (adaptada a Javier)

```
00 · Header fijo        Logo "Javier Pato▪" · Trabajo · Estudio · IA · "Saluda 👋"
01 · Hero               "Hola, soy Javier." + identidad dual (estudio de día / ArtiMindArt de noche)
                        + 2 CTAs + detalle dibujado (flecha)
02 · Trabajo reciente   intro breve + proyectos por AÑO (Mero Sushi, Andrea, Certix...),
                        tarjetas con descripción + estado
03 · Servicios          Marca · Web · Gráfico · Dirección IA (claro, sin cards SaaS)
04 · Oferta 299€        "Edición lanzamiento" — número grande, condiciones, escasez (Cantabria)
05 · ArtiMindArt / IA   tu alter ego como autoridad creativa con IA, link a X (el "play" de Ben)
06 · Sobre mí           narrativa personal + foto, alineación imagen/texto alternada
07 · Prueba social      artículos / menciones / clientes (lo que tengas)
08 · Testimonios        citas de clientes locales
09 · "¿Colaboramos?"    carta personal + CTA contacto
10 · Footer             navegación duplicada · LinkedIn · X · GitHub · CV · email
```

---

## 9. Reglas anti-genéricas

Prohibido:
- ❌ Tono corporativo / "agencia". Esto es **personal**.
- ❌ Gradientes, glass, neón, cards SaaS de 3 columnas con iconitos.
- ❌ Stock genérico. Imagen real o generada con dirección de arte (ArtiMindArt).
- ❌ #fff puro / #000 puro. Acento en exceso.

Obligatorio:
- ✅ Calidez (off-white), aire generoso, tipografía protagonista.
- ✅ Personalidad: un detalle dibujado, copy en primera persona, un guiño humano.
- ✅ Trabajo por año, con estado y resultado.
- ✅ Prueba social (testimonios, lecturas, clientes).
- ✅ Un único acento (granate) con disciplina.

---

## 10. Assets a preparar

- Foto/retrato de Javier (sección "Sobre mí"), cálido y natural.
- Portadas de proyectos (reales o generadas con IA, dirección coherente).
- Detalle(s) dibujado(s) a mano propios (flecha, divisor).
- Logos de clientes/herramientas para la rejilla.
- Favicon = punto de marca ▪ granate.

---

## Pendiente de confirmar visualmente (⚠️)
1. Fuente exacta de benshih.design.
2. Radio de esquinas de tarjetas/botones.
3. Off-white cálido vs blanco puro.
4. Naturaleza de los detalles dibujados a mano.
5. ¿Modo oscuro?

> Para clavar estos 5 puntos necesito ver la web (bloqueada por macOS 13 + dominio).
> **Si me pasas 2-3 capturas de benshih.design, actualizo este doc con los valores reales.**
