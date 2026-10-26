# MIS-17 — recuperación con fases acotadas

## Objetivo y alcance
Evaluar la viabilidad del fork de androoAGI/starnet en español y terminar la traducción de UI local solicitada, conservando términos técnicos necesarios. No reinstalar/arrancar StarNet ni publicar sin autorización adicional. Paperclip es la fuente de verdad para las fases.

## Estado actual (MIS-20 · 1/3 completado, 2026-10-26)
- **Veredicto: VIABLE** con alcance acotado → informe en `VIABILIDAD-ES.md`.
- Checkout: rama `es/interfaz-espanol`, 66 archivos modificados (+1024/−1024, intercambio 1:1 de cadenas).
- Revisión de tests (evidencia en `TRIAGE-ES.json`, logs en /tmp/triage-es/):
  - `timeout 20 node test/voice-live-ui.test.js` → exit 1, 1 fallo (aria-label voz: UI es, test en).
  - `timeout 20 node test/workflows-window.test.js` → exit 1, 128 ok, 5 fallos (test espera FLUJOS/ENTREGABLES/BUCLES; fuente aún parcial en).
  - `timeout 20 node test/autonomy-ui.test.js` → exit 1, 22 ok, 1 fallo (UI "TAREAS PEQUEÑAS" vs test "SMALL JOBS").
  - `timeout 20 node test/line-sendto.test.js` → exit 1, 100 ok, 2 fallos (DE/ENVIADO A vs FROM/SENT ON TO).
  - `timeout 20 node test/needs-you.test.js` → exit 1, 77 ok, 1 fallo (aria-label "Necesita de ti" vs "Needs you").
  - **Total: 9/9 fallos de texto, 0 regresiones funcionales en el lote; 329 aserciones ok.**
- Revisión Codex (2/2 consumidas, clon codex-mis-17 solo lectura): ambas `continue`; timeouts 1800s no son defecto; arquitectura frontend vanilla JS + sidecar + Tauri; licencia MIT código / marca reservada.

## Punto de recuperación
/home/gus/paperclip-migration/mis17-recovery/working-files-before.tar.gz y changes-before.patch conservan el estado anterior. No borrar ni aplicar encima sin comparar Git.

## Plan
1. ✅ Viabilidad y triage de máximo5 tests (MIS-20). No se editaron traducciones.
2. Correcciones por lotes de máximo8 archivos (MIS-21), tests específicos con timeout20s.
3. Validación y entrega local con commits y límites conocidos.

## Lotes de fase 2 (orden concreto, máx. 8 archivos/lote)
- **Lote A (6)**: frontend/app/windows/outbox.js, frontend/app/windows/workflows.js, frontend/index.html (lang="es" + aria-label), test/workflows-window.test.js, test/line-sendto.test.js, test/needs-you.test.js.
- **Lote B (4+espejo)**: frontend/app/stationui.js (+ espejo website/app/app de A), test/autonomy-ui.test.js, test/voice-live-ui.test.js, re-ejecución del lote de 5 tests.
- Criterio: 5 tests en verde solo con cadenas/aserciones; sin tocar endpoints, estados de job, IDs de ventanas/docks, clases CSS contractuales ni palabras de voz sin mover su aserción (lista completa en VIABILIDAD-ES.md).

## Criterios
No alterar identificadores/protocolos/prompts internos para traducir UI. No ocultar regresiones cambiando aserciones. No afirmar suite completa si solo se ejecutó una selección. Cerrar cada fase con informe y evidencia; si queda trabajo, persistir y programar continuación real.

## Siguiente acción
MIS-21 (2/3): aplicar Lote A y Lote B, re-ejecutar el lote de triage y los tests tocados con timeout20s; entregar evidencia en checkpoint y comentario. Presupuesto nativo: máx 6 ejecuciones por subtarea.
