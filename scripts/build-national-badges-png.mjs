/**
 * PNG uniformes en public/national-team-badges/ (500×500, canal alpha).
 * Usa thumbnails500px de Wikimedia (tamaños estándar → evita 429).
 *
 *   npm run badges:png
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'national-team-badges');
/** Salida final cuadrada (coincide con paso 500 de Commons; reescalado suave). */
const SIZE = 500;

/**
 * URLs thumb 500px (ver https://w.wiki/GHai — no usar anchos arbitrarios p. ej. 512).
 */
const SOURCES = {
  /** Escudo de la selección masculina (camiseta), no logo corporativo RFEF. */
  ES: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Escudo_selecci%C3%B3n_espa%C3%B1ola.png/500px-Escudo_selecci%C3%B3n_espa%C3%B1ola.png',
  /** Logo usado en camiseta de la selección (descripción en Commons). */
  PE: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Federaci%C3%B3n_Peruana_de_F%C3%BAtbol_%282011%29.png/500px-Federaci%C3%B3n_Peruana_de_F%C3%BAtbol_%282011%29.png',
  HR: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Croatia_national_football_team_logo.png/500px-Croatia_national_football_team_logo.png',
  MK: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Coat_of_arms_of_North_Macedonia.svg/500px-Coat_of_arms_of_North_Macedonia.svg.png',
  MA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Coat_of_arms_of_Morocco.svg/500px-Coat_of_arms_of_Morocco.svg.png',
  /** Logo FBF (en.wikipedia; non-free en esa wiki — no hay equivalente libre claro en Commons). */
  BO: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Bolivian_Football_Federation_logo.svg/500px-Bolivian_Football_Federation_logo.svg.png',
  RO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Fed_roumania.svg/500px-Fed_roumania.svg.png',
  PA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Coat_of_arms_of_Panama.svg/500px-Coat_of_arms_of_Panama.svg.png',
  BR: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Confedera%C3%A7%C3%A3o_Brasileira_de_Futebol_%282016%E2%80%932019%29.svg/500px-Confedera%C3%A7%C3%A3o_Brasileira_de_Futebol_%282016%E2%80%932019%29.svg.png',
};

const UA = 'PH-Sport-Web/1.0 (national badges build; respects commons thumb steps)';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchBuffer(url, attempt = 1) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/png,*/*' },
  });
  if (res.status === 429 && attempt < 8) {
    const wait = 8000 * attempt;
    console.log(`\n  429, esperando ${wait / 1000}s…`);
    await sleep(wait);
    return fetchBuffer(url, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let hadError = false;

  for (const code of Object.keys(SOURCES)) {
    const url = SOURCES[code];
    const outPath = path.join(OUT_DIR, `${code.toLowerCase()}.png`);
    process.stdout.write(`${code}… `);
    await sleep(2000);
    try {
      const input = await fetchBuffer(url);
      await sharp(input)
        .resize(SIZE, SIZE, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      const st = fs.statSync(outPath);
      console.log(`OK (${st.size} bytes)`);
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
      hadError = true;
    }
  }

  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.toLowerCase().endsWith('.svg')) {
      fs.unlinkSync(path.join(OUT_DIR, f));
      console.log(`removed ${f}`);
    }
  }

  if (!hadError) {
    const allowed = new Set(Object.keys(SOURCES).map((c) => `${c.toLowerCase()}.png`));
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (allowed.has(f.toLowerCase())) continue;
      if (f.toLowerCase().endsWith('.png')) {
        fs.unlinkSync(path.join(OUT_DIR, f));
        console.log(`removed orphan ${f}`);
      }
    }
  }
}

main();
