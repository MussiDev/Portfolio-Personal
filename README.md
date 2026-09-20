# Joaquín Mussi — Portfolio

**Live:** [joaquinmussi.com.ar](https://joaquinmussi.com.ar)

Portfolio personal construido como un "sistema nervioso": un cerebro 3D navegable (Three.js) funciona como índice del sitio, con scroll continuo entre secciones, señales visuales que conectan el cerebro con el contenido, y contenido bilingüe (ES/EN) servido desde Sanity CMS.

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | ^16.1.6 |
| UI | React | ^19.2.4 |
| Lenguaje | TypeScript | 5.3.3 |
| Estilos | Tailwind CSS | ^3.4.1 |
| 3D | Three.js | ^0.186.0 |
| CMS | Sanity (`next-sanity`) | ^12.1.0 / ^5.11.0 |
| Contenido enriquecido | `@portabletext/react`, `react-markdown`, `mermaid` | — |
| Formulario de contacto | EmailJS (API REST, desde el servidor) + Google reCAPTCHA v3 | — |
| Tests | `node:test` (nativo, sin dependencias) | — |

## Características

- **Cerebro 3D como navegación** — seis regiones del cerebro son la navegación principal del sitio; el hover dispara una línea guía y la cámara vuela a esa región
- **Sistema nervioso continuo** — un cordón de señal con pulso/flujo conecta el cerebro con el contenido a medida que se scrollea
- **Binario propio para el modelo 3D** — `scripts/prepare-brain.mjs` convierte el `.glb` fuente (3 MB) a un binario cuantizado (`cerebro.<hash>.bin`, ~460 KB) que se stream-parsea en el cliente; el nombre lleva un hash de contenido para poder servirlo con caché inmutable de un año
- **Bilingüe (ES/EN)** — español sin prefijo, inglés bajo `/en`, con `hreflang` y `<html lang>` correctos por ruta
- **Blog conectado a Sanity** — posts en Portable Text o Markdown, con diagramas Mermaid embebidos
- **OG image dinámica y localizada** — `next/og`, prerenderizada por idioma
- **Formulario de contacto** — React 19 `useActionState` + reCAPTCHA v3 (invisible) diferido hasta que el usuario llega al formulario. `/api/contact` valida el mensaje, verifica el captcha y recién entonces envía por la API REST de EmailJS con la private key: el navegador nunca habla con EmailJS
- **Accesible** — reduced-motion respetado en cursor y animaciones, regiones de navegación como `<a>` dentro de `<nav>`, skip-link
- **CI en GitHub Actions** — type-check, tests y build en cada push/PR

## Estructura del proyecto

```
├── app/
│   ├── (sistema-nervioso)/[lang]/   # Rutas bilingües (home, layout, blog)
│   │   ├── layout.tsx               # <html lang>, fuentes, JSON-LD, metadata
│   │   ├── page.tsx                 # Composición de secciones
│   │   ├── opengraph-image.tsx      # OG image localizada (SSG por idioma)
│   │   └── blog/[slug]/             # Post individual
│   ├── studio/                      # Sanity Studio embebido (/studio)
│   ├── robots.ts / sitemap.ts       # SEO
│   └── src/
│       ├── common/                  # Brain3D, NervousSystem, Cursor, etc.
│       ├── components/Blog/         # MermaidDiagram, ReadingProgress
│       ├── components/Workshop/     # ContactForm
│       └── i18n/                    # Diccionario ES/EN y helpers de metadata
├── api/                             # Datos JSON (experiencia, proyectos, recomendaciones)
├── entities/                        # Tipos de dominio + tests puros (node:test)
├── sanity/                          # Cliente, queries y schema de Sanity
├── scripts/prepare-brain.mjs        # Genera public/image/cerebro.<hash>.bin y app/src/common/brainAsset.ts
├── proxy.ts                         # Enrutamiento por idioma + gate de /studio (convención "proxy" de Next 16, reemplaza a middleware.ts)
└── .github/workflows/ci.yml         # tsc + tests + build en CI
```

## Variables de entorno

Crear un `.env.local` en la raíz:

```env
# Sitio
NEXT_PUBLIC_SITE_URL=https://joaquinmussi.com.ar

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id
NEXT_PUBLIC_SANITY_DATASET=production
STUDIO_SECRET=un_secreto_para_acceder_a_/studio

# EmailJS (se usan solo desde /api/contact, en el servidor)
NEXT_PUBLIC_SERVICE_ID=tu_service_id
NEXT_PUBLIC_TEMPLATE_ID=tu_template_id
NEXT_PUBLIC_PUBLIC_KEY=tu_public_key
EMAILJS_PRIVATE_KEY=tu_private_key

# Google reCAPTCHA v3
NEXT_PUBLIC_FIRSTCAPTCHA=tu_site_key
RECAPTCHA_SECRET_KEY=tu_secret_key
```

**EmailJS desde el servidor:** en el dashboard de EmailJS (Account → Security) activar *"Allow EmailJS API for non-browser applications"* (sin esto rechaza los envíos de `/api/contact`) y *"Use Private Key"* (sin esto cualquiera puede seguir mandando mails con la public key, salteando el captcha). Sin `EMAILJS_PRIVATE_KEY` el formulario responde error: falla cerrado.

`NEXT_PUBLIC_SITE_URL` define el dominio canónico usado en metadata, sitemap, robots y OG images (`entities/site.ts`). Si no está seteada, cae a `https://joaquinmussi.com.ar`. **Tiene que estar seteada en Railway** con el dominio de producción real — si apunta a un dominio que no resuelve, el canonical, el sitemap y las OG images quedan rotos en producción.

`NEXT_PUBLIC_SANITY_PROJECT_ID` y `NEXT_PUBLIC_SANITY_DATASET` también deben cargarse como **Secrets** del repositorio en GitHub (Settings → Secrets and variables → Actions) para que el paso de build del CI pueda leer el contenido de Sanity.

## Cómo correrlo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Regenerar el binario del cerebro 3D (si se reemplaza assets/brain_areas.glb)
npm run brain

# Type-check
npx tsc --noEmit

# Tests
npm test

# Build de producción
npm run build

# Servidor de producción
npm start
```

Abrir [http://localhost:3000](http://localhost:3000).

> **Nota:** correr `npm run build && npm start` antes de medir con Lighthouse — `npm run dev` no minifica ni hace tree-shaking, y eso distorsiona las métricas de performance.

## Agregar contenido

| Contenido | Fuente |
|---|---|
| Experiencia laboral | `api/experienceItems.json` |
| Proyecto principal (NorteAR) | `api/projects.json` |
| Otros proyectos | `api/workProjects.json` |
| Certificaciones | `api/certifications.json` |
| Idiomas | `api/languages.json` |
| Recomendaciones | `api/recommendations.json` |
| "Lo que descarté" | `api/descartes.json` |
| Posts del blog | Sanity Studio (`/studio`) |
| Textos de UI (ES/EN) | `app/src/i18n/dict.ts` |
