/**
 * Los dos fondos del muestrario que no están en la web de `preview`, copiados tal
 * cual de sus ramas (rama `feat/muestrario-fondos`, sin fusionar):
 * - «Proyección», de la variante B (`feat/variante-b-titulos`): grano de película a
 *   24 fps y un halo que, en la web, sigue al titular (`uBand`).
 * - «Estructura» sobre la cuadrícula de la variante C (`feat/variante-c-analisis`):
 *   no dibuja retícula propia, enciende la de CSS (`uGrid`: paso y desfase).
 */

// Variante B · Proyección.
export const PROYECCION = `#version 300 es
precision highp float;
uniform vec2 uRes;     // px internos del canvas
uniform float uPx;     // px internos por px CSS
uniform float uTime;   // segundos
uniform float uFrame;  // fotograma de 24 fps
uniform float uScroll; // px CSS desplazados en la página
uniform vec2 uBand;    // titular en px CSS de página (arriba, abajo)
out vec4 o;
const vec3 GOLD = vec3(0.839, 0.698, 0.369);   // --color-ph-gold #D6B25E
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  // Halo: a la altura del titular mientras está en pantalla; cuando sale por
  // arriba se queda en el borde, más tenue. Deriva y respira muy despacio.
  float titleMid = (uBand.x + uBand.y) * 0.5 - uScroll;
  float ty = clamp(titleMid, -0.12 * H, 0.6 * H);
  vec2 c = vec2(W * 0.28 + sin(uTime * 0.11) * W * 0.04, H - ty + cos(uTime * 0.09) * 24.0);
  float r = max(W, H) * 0.6;
  vec2 d = (p - c) / vec2(1.3, 1.0) / r;
  float near = mix(0.4, 1.0, smoothstep(-0.7 * H, 0.0, titleMid));
  float halo = exp(-dot(d, d) * 2.4) * (0.84 + 0.16 * sin(uTime * 0.42)) * near;
  // Grano de película: motas que encienden el negro, distintas en cada fotograma.
  float g = hash12(floor(gl_FragCoord.xy) + uFrame * 37.17);
  float grain = pow(g, 3.0) * 0.05;
  vec3 col = GOLD * halo * 0.075 + vec3(grain);
  col = max(col, 0.0);
  // Salida premultiplicada: la luz se suma al fondo de la página, que se ve a través.
  o = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
}`;

// Variante C · cabecera de sus shaders (la de la A, más `uGrid`).
const HEADER_C = `#version 300 es
precision highp float;
uniform vec2 uRes;    // px internos del canvas
uniform float uPx;    // px internos por px CSS
uniform float uTime;  // segundos
uniform float uScroll; // px CSS desplazados en la página
uniform vec3 uBand;   // titular en px CSS de página (arriba, abajo) y la luz fuera de él (0-1)
uniform vec2 uGrid;   // retícula de la página: paso y desfase horizontal, en px CSS
out vec4 o;
const vec3 GOLD = vec3(0.839, 0.698, 0.369);   // --color-ph-gold #D6B25E
const vec3 WHITE = vec3(1.0);
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
// Dónde hay luz. El canvas es fijo y cubre la pantalla: la luz brilla entera
// detrás del titular y baja a uBand.z en el resto de la página, así los párrafos se
// leen limpios; bajo el menú se apaga siempre. p, W y H en px CSS, con el origen
// abajo a la izquierda.
float stageMask(vec2 p, float W, float H) {
  float fromTop = H - p.y;
  float pageY = uScroll + fromTop;
  float nav = smoothstep(30.0, W < 768.0 ? 120.0 : 190.0, fromTop);
  float band = smoothstep(uBand.x - 90.0, uBand.x, pageY) * (1.0 - smoothstep(uBand.y, uBand.y + 70.0, pageY));
  return nav * mix(uBand.z, 1.0, band);
}
// Salida premultiplicada: la luz se suma al fondo de la página, que se ve a través.
// El tramado evita escalones en degradados tan oscuros.
void emit(vec3 c) {
  c += (hash12(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) / 255.0;
  c = max(c, 0.0);
  o = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
}
`;

// Variante C · Estructura.
export const ESTRUCTURA_C = `${HEADER_C}
void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  float W = uRes.x / uPx, H = uRes.y / uPx;
  float S = uGrid.x;
  float fromTop = H - p.y;
  // Distancia, en px CSS, a la línea vertical y a la horizontal más cercanas.
  float gx = mod(p.x - uGrid.y, S);
  float gy = mod(fromTop, S);
  float dx = min(gx, S - gx);
  float dy = min(gy, S - gy);
  float lines = max(1.0 - smoothstep(0.5, 1.6, dx), 1.0 - smoothstep(0.5, 1.6, dy));
  float node = exp(-(dx * dx + dy * dy) / 7.0);
  // Dos barridos a 45°: uno principal y otro más ancho y tenue en sentido
  // contrario. Recorren la diagonal más 450 px de margen a cada lado, así el
  // salto de vuelta ocurre fuera de la vista.
  float diag = (p.x + fromTop) * 0.70710678;
  float span = (W + H) * 0.70710678 + 900.0;
  float x1 = mod(uTime * 62.0, span) - 450.0;
  float x2 = span - mod(uTime * 34.0 + span * 0.5, span) - 450.0;
  float light = exp(-pow((diag - x1) / 210.0, 2.0)) + 0.45 * exp(-pow((diag - x2) / 330.0, 2.0));
  vec2 cell = floor(vec2(p.x - uGrid.y, fromTop) / S + 0.5);
  float tw = 0.5 + 0.5 * sin(uTime * 1.2 + hash12(cell) * 6.2832);
  vec3 c = GOLD * (lines * light * 0.24 + node * light * tw * 0.8);
  emit(c * stageMask(p, W, H));
}`;
