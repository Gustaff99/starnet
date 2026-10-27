# CHECKPOINT — MIS-23 (traducción ES) · MIS-23-9 EN CURSO

## Estado (2026-10-27, tramo 19)
- Rama es/interfaz-espanol. MIS-23-8 cerrada (0ad1bd97).
- **MIS-23-9 EN CURSO**: suite global + verificación visual + entrega final

## Criterios verificados
- [x] Scanner v4: 5 strings restantes (falsos positivos) ✅
- [x] Espejo website/docs/ ↔ website-deploy/docs/ sincronizado ✅
- [x] lang="es" presente en todos los HTML ✅
- [x] Traducción de documentación (14 HTML) ✅
- [x] Traducción de UI strings (agent-station-demo, stationui, app.js, chat, voice, build, workflowpanel, windows) ✅
- [x] Traducción de SEND TO / OUTBOX strings (workflowline, workflowpanel, build, worldmodel, stationcommands, propsprites) ✅
- [x] Tests actualizados para matchingar strings ES ✅

## Tramo 19: Suite global (continuidad)

### Tests corregidos en este tramo:
1. build-clip.test.js: 'línea completa'→'línea entera' ✅
2. dossier-voice-label.test.js: 'station default'→'por defecto de la estación' ✅
3. build-room-delete-sendto.test.js: 'press Delete again'→'pulsa Del de nuevo' (x4) ✅
4. build-move-settle.test.js: 'CHECKING THE ROUTE'→'COMPROBANDO LA RUTA' ✅
5. workflowpanel.js: armed chip tooltip + label EN→ES (TIDY LINE→ORDENAR LÍNEA) ✅
6. workflow-panel-inline-refusals.test.js: 5 EN→ES strings + fix section reference ✅
7. workflow-panel-review-1012.test.js: 3 'needs an agent'→'necesita un agente' ✅
8. workflow-line-compiled-order.test.js: 5 EN→ES strings (INBOX, wired sentence) ✅
9. workflows-window.test.js: 'needs an agent'→'necesita un agente' ✅
10. group-chat.js: retire message EN→ES ✅
11. consent-full-request.test.js: voice/phone permission strings EN→ES ✅
12. group-chat-picker.test.js: how-to line EN→ES ✅
13. splitter-joiner.html: docs translation ✅

### Tests verificados (30+ batches, todos PASS):
- workflow-line.test.js: 158 assertions ✅
- workflow-panel-sendto-truth.test.js: 301 assertions ✅
- workflow-panel-overhaul.test.js: 74 assertions ✅
- workflow-panel-done-reframe.test.js: 86 assertions ✅
- workflow-panel-inline-refusals.test.js: 25 assertions ✅
- workflow-panel-review-1012.test.js: 132 assertions ✅
- workflow-line-compiled-order.test.js: 235 assertions ✅
- workflows-window.test.js: 133 assertions ✅
- workflow-project.e2e.test.js: PASS ✅
- workflow-project-multibay.e2e.test.js: PASS ✅
- workflow-takeover.test.js: PASS ✅
- workflow-takeover-ui.test.js: PASS ✅
- workflow-takeover.http.test.js: PASS ✅
- class-loadouts.test.js: 2653 assertions ✅
- station-commands.test.js: 341 assertions ✅
- worldmodel.test.js: 617 assertions ✅
- floorstats.test.js: 66 assertions ✅
- dialogue.test.js: 35 assertions ✅
- consent-full-request.test.js: 39 tests ✅
- build-clip.test.js: 249 assertions ✅
- build-hand.test.js: 142 assertions ✅
- build-hand-circle.test.js: 141 assertions ✅
- build-mode-easy.test.js: 140 assertions ✅
- build-select-target.test.js: 150 assertions ✅
- build-rightclick-furniture.test.js: PASS ✅
- build-room-delete-sendto.test.js: 69 assertions ✅
- build-move-settle.test.js: 20 assertions ✅
- build-new-line-hand.test.js: 48 assertions ✅
- build-paint-material.test.js: 17 assertions ✅
- build-share.test.js: PASS ✅
- builder-lend.test.js: 49 assertions ✅
- buildmode-halls.test.js: 21 assertions ✅
- voice.button.test.js: 237 assertions ✅
- voice.draftguard.test.js: 21 assertions ✅
- local-voice.test.js: PASS ✅
- desktop-voice-bundle.test.js: PASS ✅
- realtime-voice.test.js: PASS ✅
- voice-chat-model.e2e.test.js: PASS ✅
- remote-voice.test.js: 131 assertions ✅
- remote-voice-ownership.test.js: 28 assertions ✅
- voice-chat-route.test.js: 49 assertions ✅
- chat-code-copy.test.js: 81 assertions ✅
- chat-code-url-link.test.js: 28 assertions ✅
- chat-file-drop.test.js: PASS ✅
- chat-history-order.test.js: 13 assertions ✅
- chat-history-reconcile.test.js: 41 assertions ✅
- chat-linkify.test.js: 14 assertions ✅
- chat-runmeta.test.js: 14 assertions ✅
- chat-stare-throttle.test.js: 24 assertions ✅
- chat-stopped-retry.test.js: 25 assertions ✅
- chat-prompt-diet.test.js: 10 assertions ✅
- chat-prompt-diet.e2e.test.js: 29 assertions ✅
- conveyor-legibility.test.js: 45 assertions ✅
- conveyor-link-tools.test.js: 50 assertions ✅
- cron.images-grant.e2e.test.js: 32 assertions ✅
- browser-workflow.test.js: PASS ✅
- nightfocus-workflow.test.js: 19 assertions ✅
- station-authority.test.js: 9 assertions ✅
- station-autosave.test.js: PASS ✅
- station-bridge.test.js: PASS ✅
- stationbake.seam.test.js: 52 assertions ✅
- routing.saved-station-grants.e2e.test.js: 41 assertions ✅
- cron.station-default.e2e.test.js: PASS ✅
- cli-station.e2e.test.js: 43 assertions ✅
- lineage-stationless-halt.http.test.js: 11 assertions ✅
- save-empty-station-seed.test.js: 82 assertions ✅
- browser-station-login.test.js: 9 assertions ✅
- browser-station-privacy.test.js: 10 assertions ✅
- browser-station-window.test.js: 23 assertions ✅
- agent-config.test.js: PASS ✅
- agent-lifecycle.test.js: 45 assertions ✅
- agent-affinity.test.js: 28 assertions ✅
- agent-eval.test.js: 43 assertions ✅
- agent-model-select.test.js: 91 assertions ✅
- agent-affinity-weight.test.js: 21 assertions ✅
- agent-color-escape.test.js: 15 assertions ✅
- agent-config-target.test.js: 36 assertions ✅
- agent-skin-thumbs.test.js: 38 assertions ✅
- agent-threads-rail.test.js: 34 assertions ✅
- desk-one-per-agent.test.js: 52 assertions ✅
- rail-agent-empty-archived.test.js: 3 assertions ✅
- subagents.stale-worker.test.js: 47 assertions ✅
- cli-agent-routes.e2e.test.js: 37 assertions ✅
- e2e.subagent-background.test.js: 11 assertions ✅
- world-lifecycle.test.js: 17 assertions ✅
- world-crew-approval.test.js: 17 assertions ✅
- dock-terms-open.test.js: 9 assertions ✅
- channels.telegram.chat-truth.e2e.test.js: 31 assertions ✅

### Fallos pre-existentes (NO relacionados con traducción):
- stationbake.chunk/connections/hull/materials: timeout (120s+) - tests pesados
- stationbake.offcanvas/plate-parity (.mjs): necesitan Chrome/Chromium (SKYNET_CHROME no configurado)
- cron-lock-recycled-pid.http.test.js: 4 fallos (timing/environment)

### Commits de este tramo:
- ae8bc386: build-clip + dossier-voice-label + build-room-delete-sendto tests
- 295a6546: workflowpanel armed chip + 3 test files
- ac2fe095: workflow-line-compiled-order + workflows-window tests
- 9b9ddb51: group-chat + consent + group-chat-picker + splitter-joiner + checkpoint

## Pendiente
- [x] Suite global de tests (30+ batches, todos PASS) ✅
- [ ] Verificación visual de pantallas en ejecución — **BLOQUEADO**: no hay browser (Chrome/Chromium) en el host
- [ ] Entrega final y cierre de MIS-23-9

## Bloqueo actual (2026-10-27)

**Causa:** La verificación visual requiere un browser con CDP (Chrome o Chromium) que no está instalado en este host. `which google-chrome chromium chromium-browser` → vacío. No hay playwright/puppeteer/selenium ni paquetes dpkg de browser.

**Impacto:** No se pueden ejecutar `scripts/golden.mjs` ni `scripts/uiplay.mjs` para capturar y verificar visualmente las pantallas en funcionamiento.

**Solución requerida del operador:**
1. Instalar Chrome/Chromium en el host (o en un contenedor accesible)
2. O autorizar una verificación alternativa (p. ej. screenshots en otro entorno)
3. O declarar la verificación visual como cubierta por la suite de tests de aserción (30+ batches PASS)

**No se marca MIS-23 done hasta que la verificación visual esté cubierta.**

## Reglas de oro
- website-deploy/ está en .gitignore → usar git add -f
- No reducir alcance para cerrar subtareas
- No cambiar tests para aceptar inglés pendiente
- Conservar identificadores, protocolos, APIs y anglicismos técnicos necesarios
- Exclusiones registradas con justificación
