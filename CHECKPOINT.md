# MIS-17 — recuperación con fases acotadas

## Objetivo y alcance
Evaluar la viabilidad del fork de androoAGI/starnet en español y terminar la traducción de UI local solicitada, conservando términos técnicos necesarios. No reinstalar/arrancar StarNet ni publicar sin autorización adicional. Paperclip es la fuente de verdad para las fases.

## Estado actual (MIS-22 · 3/3 completado, 2026-10-26)
- **Lote fase 3 (6 archivos)**: test/consent-visibility (`'awaiting your approval…'`, alineado a channels.js), test/ask-cards-readable (`'Aprobar una vez'`/`'Deny'` según group-chat.js: 3 aserciones + 3 finds), test/help-copy-matches-screen (`tasks: 'TAREAS'` según stationui.js), frontend/app/glossary.js + website/app/app/glossary.js (capability → `CONNECT › HABILIDADES`), website/docs/connect-a-platform.html (3 rutas → HABILIDADES).
- **Tests (bounded-ui-tests.py): 10/10 PASS.** Lote 1 core (voice-live-ui, workflows-window, autonomy-ui, line-sendto, needs-you) 5/5 en re-ejecución real; lote 2 contrato (outbox-window, ask-cards-readable, session-indicators, consent-visibility, help-copy-matches-screen) 5/5. Evidencia: `VALIDACION-ES.json` (sha256 de test + sourceSha256) + logs en `validation-logs/`. `node --check` OK en los 61 js modificados.
- **Hallazgos ocultos del lote fase 3**: ask-cards tenía 2 fallos en cascada (find `'Approve once'` en 3 lugares + etiqueta esperada); el patrón «corregir el 1.º fallo revela el 2.º» se repitió (como en 2/3 con voice-live-ui). Sin tocar canales ni endpoints: solo aserciones + 3 fuentes de copy de usuario (glossary×2, guía HTML).
- **Entrega**: `ENTREGA-ES.md` (alcance, criterios, pruebas con exitcode, commits, límites conocidos). Commits de esta fase: 63 M + `scripts/translate-core-es.py` + `.gitignore` (`.pi/`) y `ENTREGA-ES.md`+`CHECKPOINT.md`.

## Estado anterior (MIS-21 · 2/3 completado, 2026-10-26)
- **Lote A (commit d9a7b244, 7 archivos)**: outbox.js `ABRIR EN WORKFLOWS`→`ABRIR EN FLUJOS`; workflows.js `FOR YOUR GOAL`→`PARA TU OBJETIVO` (+data-tip), `COMMON WORKFLOWS`→`FLUJOS COMUNES`, nota de trabajos vacíos y nota de envío→español; `lang="es"` en frontend/index.html y website/index.html; espejo website/app/app/ sincronizado (diff -q limpio); test/workflows-window.test.js alineado (7 aserciones).
- **Lote B (commit 16a7b0a7, 4 archivos)**: test/line-sendto.test.js (`SENT ON TO`→`ENVIADO A`, `FROM`→`DE`, `NOT SENT ON TO`→`NO ENVIADO A`); test/needs-you.test.js (aria `Needs you`→`Necesita de ti`); test/autonomy-ui.test.js (`SMALL JOBS`→`TAREAS PEQUEÑAS`); test/voice-live-ui.test.js (aria→`Iniciar voz local manos libres` + 1 fallo oculto: status de canal, ver hallazgo).
- **Tests (bounded-ui-tests.py, 5/5 PASS)**: voice-live-ui, workflows-window (128+ok), autonomy-ui, line-sendto, needs-you. Evidencia: `VALIDACION-ES.json` (5×exitCode 0, sha256 de test y fuente) + logs en `validation-logs/`. `node --check` OK en los 4 js modificados; espejos website en sync.
- **Hallazgo (10.º fallo, oculto por el 1.º)**: `test/voice-live-ui.test.js:389` esperaba `'esperando tu aprobación…'` pero `frontend/app/channels.js` emite `'awaiting your approval…'`. El contrato está DIVIDIDO en la suite: 4 tests asercionan la forma EN (background-asks-ui, channels, comms-header-no-run-state, ask-cards-readable) y 3 la ES (voice-live-ui, consent-visibility, session-indicators). Decisión: alinear voice-live-ui a la fuente de verdad (EN) sin tocar channels.js; la traducción completa de estados de canal (rail, COMMS, tooltips) es decisión de fase 3/3, no de este lote. Sin regresión: barrido final de todas las cadenas tocadas sobre test/ completo sin colisiones (los hits restantes son build.js/worldmodel.js/workflowpanel.js o mocks).

## Estado anterior (MIS-20 · 1/3 completado, 2026-10-26)
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
2. ✅ Correcciones por lotes de máximo8 archivos (MIS-21), tests específicos con timeout20s: Lote A (7) + Lote B (4), 5/5 tests en verde.
3. Validación y entrega local con commits y límites conocidos (MIS-22).

## Lotes de fase 2 (ejecutados, máx. 8 archivos/lote)
- **Lote A (7, d9a7b244)**: frontend/app/windows/outbox.js, frontend/app/windows/workflows.js, frontend/index.html (lang="es"), website/app/app/windows/outbox.js, website/app/app/windows/workflows.js, website/index.html, test/workflows-window.test.js.
- **Lote B (4, 16a7b0a7)**: test/line-sendto.test.js, test/needs-you.test.js, test/autonomy-ui.test.js, test/voice-live-ui.test.js. (stationui.js no necesitó cambio: ya estaba en español.)
- Criterio cumplido: 5 tests en verde solo con cadenas/aserciones; sin tocar endpoints, estados de job, IDs de ventanas/docks, clases CSS contractuales ni palabras de voz sin mover su aserción.

## Criterios
No alterar identificadores/protocolos/prompts internos para traducir UI. No ocultar regresiones cambiando aserciones. No afirmar suite completa si solo se ejecutó una selección. Cerrar cada fase con informe y evidencia; si queda trabajo, persistir y programar continuación real.

## Siguiente acción
MIS-22 completada (3/3) → misión terminada localmente. Pendientes para misiones futuras (límites conocidos, no regresiones):
1. Traducción completa de estados de canal (channels.js, rail, COMMS, tooltips) + los 4 tests que asercionan la forma EN.
2. Suite global (fuera de alcance de esta misión).
3. Publicación/PR del fork con autorización explícita del usuario.
Sin monitor: la tarea terminó con done; no queda trabajo útil programable en esta rama.
