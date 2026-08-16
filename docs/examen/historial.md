# Historial de ejecuciones

Una entrada por ejecución, **más reciente primero**. Sirve para dos cosas: ver si
la documentación mejora con el tiempo y no repetir un encargo de descubrimiento
ya gastado.

Formato:

```
## AAAA-MM-DD · commit `abc1234` · nota X/12

**Fallos**: E-0N (qué concluyó el agente frío y qué debería haber concluido)
**Aciertos sin fuente**: E-0M (llegó bien, pero no citó dónde está escrito)
**Escrito a raíz de esto**: qué documento se tocó y qué se añadió
**Descubrimiento**: qué encargo abierto se usó y qué hueco destapó
```

---

## 2026-08-11 · commit ≈ `6a0aabf` · nota 86/100 — **línea base**

Ejecución **anterior a este método**: se hizo a ojo, con nota de 0-100 y sin banco
de encargos. Queda registrada porque es la línea base real y porque justifica todo
lo que vino después, pero **su nota no es comparable** con las de abajo: aquella
puntuaba "¿está bien documentado?" y las siguientes cuentan aciertos sobre 12
encargos concretos. Ver `README.md` → "La nota".

**Fallo principal**: el repo llevaba **dos meses** describiendo una island de React
(`LogoReveal.tsx`) que se había reescrito a vanilla en junio. Un agente frío
proponía sobre ella un patrón imposible.

**Escrito a raíz de esto**: la tanda de documentación del 2026-08-11 completa —
`CLAUDE.md` (commits `47c8a44`, `438af38`), la prioridad de la documentación
(`3e6ef87`), el rescate del histórico de rendimiento (`dc636d4`) y la separación
de lo congelado (`cdd7d69`). De ahí salió también la regla "documentar es parte
del cambio, no un extra".

**Pendiente**: repetir con el método actual. Los 12 encargos del banco cubren esa
trampa (E-10) y once más que entonces no se probaron, así que la nota nueva **no
tiene por qué salir mejor** — mide más cosas.
