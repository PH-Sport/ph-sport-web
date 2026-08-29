/**
 * Comprueba, antes de correr nada, que lo que responde en el puerto es ESTE
 * proyecto y no otro.
 *
 * El 2026-08-29 el smoke dio 37 fallos y abortó un push a main, y el motivo no
 * estaba en el código: había un `astro preview` de otro proyecto ocupando el
 * 4322, y `reuseExistingServer` lo dio por bueno sin mirar qué servía. Los tests
 * midieron la web equivocada. El fallo llegó a leerse como una regresión —
 * exactamente el camino que acaba en alguien usando `--no-verify` sin comprobar
 * nada.
 *
 * Un smoke que mide otra web es peor que no tener smoke: en verde miente, y en
 * rojo hace perder la tarde buscando un bug que no existe.
 */
import type { FullConfig } from '@playwright/test';

/** Marca inequívoca de este proyecto en el HTML servido. */
const SENA = 'content="PHSPORT"';

export default async function comprobarServidor(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;

  let html: string;
  try {
    html = await (await fetch(baseURL)).text();
  } catch {
    // Aún no responde nadie: es lo normal cuando Playwright va a arrancar su
    // propio servidor. No es asunto de esta comprobación.
    return;
  }

  if (html.includes(SENA)) return;

  const titulo = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '(sin título)';
  throw new Error(
    `\n\n  El servidor de ${baseURL} NO es este proyecto.\n` +
      `  Está sirviendo: "${titulo}"\n\n` +
      `  Los tests habrían medido esa web y sus fallos no tendrían nada que ver\n` +
      `  con tu código. Dos salidas:\n\n` +
      `    1. Cerrar lo que ocupe ese puerto y repetir.\n` +
      `    2. Usar otro puerto:  PH_E2E_PORT=4488 npm run test:e2e\n\n`,
  );
}
