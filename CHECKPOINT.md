# CHECKPOINT — MIS-27 (MIS-23-3): Traducción región 2 + espejo + alineación de tests

## Estado al cierre de esta ejecución (9.ª pasada, 2026-10-26)

### Criterios de MIS-23-3
- [x] Scanner v4: <80 candidatos EN en L4600-11700 (21 falsos positivos)
- [x] node --check OK x3 (stationui.js, chat.js, group-chat.js)
- [x] Tests help-copy (146) y voice en verde
- [ ] Suite fast completa en verde — PENDING (27 rojos en sweep: 18 CDP ambientales + 8 alineación + 1 claims por reordenar)
- [x] Espejo sincronizado (MIRROR_OK) — website-app-sync OK (8 assertions)
- [ ] Commit final en es/interfaz-espanol (commits parciales van entrando; 86973a56 + relock en esta pasada)

### Hecho en ESTA pasada
1. **Alineación EN→ES completada (14 tests verdes verificados):**
   - conveyor-legibility (OK 45): `<b>MODO CONSTRUCCIÓN</b><small>…líneas de trabajo…</small>` en frontend/index.html:761
   - conveyor-results (OK 21): `lineTitle ? 'resultado de línea de trabajo'`
   - conveyor-retest (OK 65): `después de ' + String(agentName(hand.from))`
   - dossier-delete-visible (OK 12): ELIMINAR AGENTE / el supervisor no se puede eliminar / el último agente…
   - dossier-growth-live (OK 10): `30 XP total`, `20 XP PARA NIVEL 2`, `60 XP total`, `0 XP total`
   - first-minutes-labels (OK 17): `Tu Overseer`, `Conecta una mente`, `ASPECTO`/`LA MENTE`
   - group-stop-truth (OK 18): regex `▣ NOVA quiere iniciar un bucle de objetivo:` + **mock del test** `Chat.consentPhrase` cambiado a 'iniciar un bucle de objetivo: '
   - front-doors-tabs (OK 21): `label: 'ACCESO'`
   - hints-setting (OK 21): `PISTAS — explican los términos de la estación al pasar el cursor`
   - markdown-everywhere (OK 91): `… salida truncada — ↗ ABRIR SESIÓN abre la conversación.`
   - poweruser-shell-repairs (OK 14): `Desactivar/Activar` en switchHTML, `Leer instrucciones de`, `['active','EN CURSO']`, `EN CURSO`, `LISTAS PARA ABRIR`
   - readability (OK 26): `Cmd + y Cmd - lo cambian, Cmd 0 lo restablece` / Ctrl
   - community-hide-until-live (OK 55): `NOMBRE EN EL MERCADO`
   - connector-reliability-wiring (OK 41): slice ancla `armedLabel: '¿SEGURO? VOLVER A INICIAR SESIÓN'`
   - budget-authority-ui: exitcode 0 (verificado)
2. **qa/product-perfect/claims.json — locators EN→ES (8 needles):**
   - `cualquier URL base /v1` (stationui.js:5230), `PEDIR respeta el perfil de alcance elegido y se detiene antes de llamadas arriesgadas.` (2900), `label: 'ENTREGABLES'` (1085), `Mantén StarNet en marcha.` x2 (messaging.js), `Aparecen como un índice compacto en las ejecuciones futuras` (4416), `Ambos tokens se guardan en esta máquina y nunca se muestran.` (97), `Los límites aplican al gasto registrado de los agentes.` (7914)
3. **Commits de esta pasada:** 86973a56 (tests+locators+UI) → relock-surface @86973a56 (382 files) → commit relock. `node test/qa-product-perfect-claims.test.js` = **OK (64 assertions)** standalone.
4. **Espejo:** sync-website-app.mjs → 1 file written; website-app-sync OK (8).

### Rojos del sweep88 posterior (27)
**CDP/Chrome ambientales (18, sin Chrome/SKYNET_CHROME en host):** crt-context-loss.e2e, prop-recovery-live.e2e, stationbake.{connections,offcanvas,plate-parity}, worldlight-receiver, world-sharpen, session-reliability.e2e, dossier-voice-label, provider-connections-ui, genesis-starnet-link, station-show, free-path-ollama, ease-of-use, google-connector, routine-preview-race, settle-managed-copy, tier-model-catalog, ssh-bg-read-remote.
**Alineación pendiente (8):** refit-run-gate, routine-images-grant, save-empty-station-seed, starnet-door-names, toolsets, visible-text-caps, save-restore-hardening, save-restore-safety.
**Anomalía (1):** qa-product-perfect-claims rojo EN EL SWEEP pero verde standalone → causa probable: el sync del espejo escribió 1 archivo en website/ DESPUÉS del commit de relock → worktree dirty con bytes de superficie cambiados. Fix = reordenar: commit del espejo ANTES del relock final.

### Siguiente paso acotado (1 ejecución)
1. Leer `.pi/red9a.txt` y `.pi/red9b.txt` (FAIL lines exactas de los 8 alineación, ya guardadas) → alinear cada regex a la string ES real de la UI (UI = fuente de verdad).
2. Orden correcto del cierre claims: `node scripts/sync-website-app.mjs` → `git add -A && git commit` → `node scripts/qa/product-perfect/relock-surface.mjs` → `git add qa/... && git commit` → `node test/qa-product-perfect-claims.test.js` verde.
3. `bash .pi/sweep88.sh` → objetivo: solo los 18 CDP rojos.
4. Verde → commit final + comentario Paperclip documentando CDP como ambiental (SKYNET_CHROME ausente) + done.

### Archivos
- frontend/app/stationui.js, frontend/index.html, frontend/app/windows/{connectors,messaging,outbox}.js
- test/*.test.js (14 alineados esta pasada)
- qa/product-perfect/claims.json (8 locators ES + relock @86973a56)
- website/ (espejo, 1 file)

### Rama / commits
es/interfaz-espanol. Esta pasada: 86973a56 + commit relock. Antes: 8906f999 (pasadas 4-6), b8b52818 (MIS-23-2).

### Notas
- .pi/sweep88.sh = sweeper (88 tests, 6 paralelos); .pi/red9a.txt/.pi/red9b.txt = FAIL lines de los 8 no-CDP.
- battlepass: pin TZ=UTC en el test (no tocar battlepass.js).
- Máximo 1 revisión Codex abierta; aún no se ha solicitado (sin 2 fallos repetidos sobre el mismo problema).
- No copiar historial al prompt; evidencia en Paperclip/Git.
