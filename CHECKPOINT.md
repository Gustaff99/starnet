# CHECKPOINT — MIS-27 (MIS-23-3): Traducción región 2 + espejo + alineación de tests

## Estado al cierre de esta ejecución (8.ª pasada, 2026-10-26)

### Criterios de MIS-23-3
- [x] Scanner v4: <80 candidatos EN en L4600-11700 (21 falsos positivos)
- [x] node --check OK x3 (stationui.js, chat.js, group-chat.js)
- [x] Tests help-copy (146) y voice en verde
- [ ] Suite fast completa en verde — PENDING (~40 rojos restantes: ~22 de alineación + ~18 CDP ambientales)
- [x] Espejo sincronizado (MIRROR_OK) — PERO: esta pasada tocó stationui.js y sidecar/index.js → re-sincronizar en la próxima ejecución
- [ ] Commit final en es/interfaz-espanol (commits parciales van entrando)

### Hecho en ESTA pasada
1. **Lote B completo:**
   - execution-profiles-ui.test.js: OK (32 assertions) — regex 'envía el próximo comando a'
   - permissions-ui.test.js: OK (97 assertions) — 4 alineaciones: 'potencia total · todo el equipo local' + 'tiene <b>POTENCIA TOTAL</b>', badge 'PERSONALIZADO', 'Más opciones — alcance exacto, preguntas, sandbox', 'Apaga ese interruptor y vuelve a detenerse para tu sí'
   - stationui.js (pane permissions): badge CUSTOM→PERSONALIZADO, 'vuelve a X cuando se apaga la anulación de toda la estación', 'Una mezcla personalizada — alcanza X y pregunta antes de los pasos arriesgados', 'POTENCIA TOTAL está anulando este perfil de alcance guardado…'
2. **Lote C (parcial, 7 tests verdes):**
   - battlepass: OK (58) — causa raíz: host TZ=Europe/Madrid + cambio DST 2026-10-25 desplaza la matemática de días; fix = `process.env.TZ='UTC'` en el test (las fechas son constantes)
   - channels.secrets: OK (165) — 'token guardado localmente, no en el keychain del SO'
   - connectors-ui: OK (155) — label 'CONECTAR'
   - control-acknowledgements: 55/55 — 'desconectado — token guardado' (messaging.js)
   - connector-required: OK (87) — 'VOLVER A LA TAREA'
   - budget-authority-ui: editado (5 regex: /no hay cambios/, /no disponible/, /2 ejecuciones interrumpidas/, /Al menos \$1\.2 hoy/, /no se pudo guardar/, /Reinicia StarNet/ + string sidecar 'el registro de liquidación no se pudo guardar en disco…' en sidecar/index.js:14539) — **NO VERIFICADO tras la última edición; re-ejecutar primero**
3. Commit acotado de Lotes B+C (10 archivos; ver `git log -1`).

### Rojos restantes (sweep 51 → ~44 tras esta pasada)
**Alineación EN→ES pendiente (~22):**
connector-reliability-wiring (3: "la carpeta de conectores" mezcla EN/ES en stationui.js), conveyor-legibility, conveyor-results, conveyor-retest, dossier-delete-visible (3: DELETE AGENT), community-hide-until-live (6: Edit/Change sharing/Archive), dossier-growth-live (4: XP paint/threshold/level-up/agent switch), first-minutes-labels (3: YOUR OVERSEER, CONNECT A BRAIN, APPEARANCE/THE BRAIN), group-stop-truth, markdown-everywhere, poweruser-shell-repairs (3: skill switch names, task-board aggregate), readability (2: Cmd+=/Ctrl+= chords), refit-run-gate, room-lighting-settings, routine-images-grant (4: refusal row key, plain language, spend capped, badge), save-empty-station-seed (3: banner), save-restore-hardening (3: boot offer), save-restore-safety (3: banner Restore), starnet-door-names (2: AI & MODELS), toolsets, visible-text-caps, front-doors-tabs, state-truth-overlap, qa-product-perfect-claims.
**CDP/Chrome ambientales (~18, sin Chrome en host):** crt-context-loss.e2e, prop-recovery-live.e2e, stationbake.{connections,offcanvas,plate-parity}, worldlight-receiver, world-sharpen, session-reliability.e2e, dossier-voice-label, provider-connections-ui, genesis-starnet-link, station-show, free-path-ollama, ease-of-use, google-connector, routine-preview-race, settle-managed-copy, tier-model-catalog, ssh-bg-read-remote.
**Nuevo:** website-app-sync (espejo: re-ejecutar sync-website-app.mjs tras tocar stationui.js/sidecar).

### Siguiente paso acotado (1 ejecución)
1. `node test/budget-authority-ui.test.js` — verificar la última edición; si falla, ajustar el resto de regex del archivo.
2. Lote C resto: por cada test rojo no-CDP, `node test/X 2>&1 | grep -B2 FAIL` → alinear regex a la string ES real de la UI (la UI es la fuente de verdad; no revertir UI).
3. `bash .pi/sweep88.sh` hasta que solo queden rojos CDP.
4. Re-sincronizar espejo: `node sync-website-app.mjs` → MIRROR_OK; verificar website-app-sync.
5. Documentar CDP como ambiental (SKYNET_CHROME ausente) en el comentario final.
6. Verde → commit acotado + comentario Paperclip + done.

### Archivos tocados sin commit (si el commit acotado no cubrió todo)
- Posibles restos de pasadas previas: frontend/app/{chat,group-chat,app,modeldock,modelpicker,backup,systems}.js, windows/{outbox,connectors}.js, needsyou.js, tutorial.js, workstreams.js, topbar.js, places.js, sidecar/manual.js, website/* (espejo).
- Ver `git status --short` al empezar.

### Rama / commits
es/interfaz-espanol. Último commit de esta pasada = Lotes B+C (10 archivos). Antes: 8906f999 (pasadas 4-6), b8b52818 (MIS-23-2).

### Notas
- .pi/sweep88.sh = sweeper (88 tests, 6 paralelos); .pi/red-now58.list = lista de 58 rojos del barrido previo.
- battlepass: NO tocar la lógica de battlepass.js por la fecha; el pin TZ=UTC en el test es el fix correcto (proyección de calendario fijo).
- sidecar/index.js:14539 traducido → el espejo web NO incluye sidecar (solo frontend), pero verificar que website-app-sync siga en verde.
- Máximo 1 revisión Codex abierta; aún no se ha solicitado (no hay 2 fallos repetidos sobre el mismo problema).
